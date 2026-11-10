#!/usr/bin/env python3
"""한 파일 버전 만들기

index.html  -> filin-app-onefile.html
recommend.html -> recommend-onefile.html

사진(img/), 아이콘, js/catalog.js 를 파일 안에 넣어서, 받은 파일 하나만 열어도 화면이 다 보이게 해요.
index.html·recommend.html·js/catalog.js·사진을 고친 뒤 저장소 폴더에서 이렇게 실행해요.

    python3 tools/build.py

검사만 하려면(파일을 고치지 않고, 다시 만들어야 하면 실패로 끝나요):

    python3 tools/build.py --check
"""
import base64
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://dobil-9125.github.io/Filin-app/"
MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


def data_uri(path):
    with open(os.path.join(ROOT, path), "rb") as f:
        raw = f.read()
    return f"data:{MIME[os.path.splitext(path)[1].lower()]};base64,{base64.b64encode(raw).decode()}"


def replace_once(s, old, new):
    if s.count(old) != 1:
        raise SystemExit(f"찾을 수 없거나 여러 번 나와요: {old[:80]!r}")
    return s.replace(old, new)


def inline_local_scripts(s):
    """<script src="js/...">를 파일 내용으로 바꿔요."""
    def sub(m):
        return "<script>\n" + read(m.group(1)).rstrip("\n") + "\n</script>"
    return re.sub(r'<script src="(js/[^"]+)"></script>', sub, s)


def build_app():
    s = read("index.html")
    for line in [
        '<link rel="manifest" href="manifest.webmanifest">\n',
        '<link rel="icon" href="icons/icon-192.png?v=4">\n',
        '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png?v=4">\n',
        '<script src="vendor/supabase-js-2.117.3.js"></script>\n',  # 파일로 열면 로그인을 못 해서 빼요
    ]:
        s = replace_once(s, line, "")
    imgs = {f"img/{n}": data_uri(f"img/{n}") for n in sorted(os.listdir(os.path.join(ROOT, "img")))
            if os.path.splitext(n)[1].lower() in MIME}
    swap = (
        "<script>\n"
        "// 한 파일 버전: img/ 폴더 대신 이 파일 안에 넣어 둔 사진을 씁니다.\n"
        f"const IMGS = {json.dumps(imgs)};\n"
        'const swapImgs = root => root.querySelectorAll && root.querySelectorAll("img").forEach(i => { const k = i.getAttribute("src"); if (IMGS[k]) i.setAttribute("src", IMGS[k]); });\n'
        'new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.tagName === "IMG") swapImgs(n.parentNode); else swapImgs(n); } }))).observe(document.documentElement, {childList: true, subtree: true});\n'
        "</script>\n"
    )
    s = replace_once(s, "<body>\n", "<body>\n" + swap)
    return inline_local_scripts(s) + "\n"


def build_recommend():
    s = read("recommend.html")
    s = replace_once(s, '<link rel="icon" href="icons/icon-192.png?v=4">\n',
                     f'<link rel="icon" href="{data_uri("icons/icon-192.png")}">\n'
                     "<!-- 사진까지 한 파일에 담은 버전이에요. 고칠 때는 recommend.html을 고친 뒤 이 파일을 다시 만들어 주세요. -->\n")
    s = replace_once(s, 'content="img/oli-seri-mealtime.jpg"', f'content="{data_uri("img/oli-seri-mealtime.jpg")}"')
    s = s.replace('href="./"', f'href="{SITE}"')
    for name in ["filin-badge.png", "seri-hi.png", "oli-hi.png"]:
        s = s.replace(f'"img/{name}"', f'"{data_uri("img/" + name)}"')
    # 제품 사진: 제품 id 순서대로 담아요
    ids = re.findall(r'^ \{id:"([^"]+)"', read("js/catalog.js"), re.M)
    imgs = {i: data_uri(f"img/{i}.jpg") for i in ids}
    s = replace_once(s, "const img = id=>`img/${id}.jpg`;",
                     f"const IMGS = {json.dumps(imgs, separators=(',', ':'))};\nconst img = id=>IMGS[id];")
    if re.search(r'["`]img/', s):
        raise SystemExit("recommend.html에 한 파일 버전에 넣지 못한 사진 경로가 있어요. tools/build.py에 더해 주세요.")
    return inline_local_scripts(s) + "\n"


def main():
    check = "--check" in sys.argv
    stale = []
    for out, fn in [("filin-app-onefile.html", build_app), ("recommend-onefile.html", build_recommend)]:
        new = fn()
        path = os.path.join(ROOT, out)
        old = open(path, encoding="utf-8").read() if os.path.exists(path) else None
        if old == new:
            print(f"{out}: 그대로예요")
        elif check:
            stale.append(out)
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(new)
            print(f"{out}: 다시 만들었어요 ({len(new) // 1024:,} KB)")
    if stale:
        raise SystemExit("다시 만들어야 해요: " + ", ".join(stale) + "  →  python3 tools/build.py")


if __name__ == "__main__":
    main()
