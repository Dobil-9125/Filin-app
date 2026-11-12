#!/usr/bin/env python3
"""앱(안드로이드)에 넣을 화면 파일을 www/ 폴더에 모아요.

저장소 맨 위의 index.html, js/, img/, vendor/, icons/ 를 그대로 복사해요.
www/ 는 매번 새로 만들어지는 폴더라 직접 고치지 않아요. (npm run android:sync 가 이 스크립트를 먼저 실행해요)
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "www")
FILES = ["index.html", "manifest.webmanifest"]
DIRS = ["js", "img", "vendor", "icons"]

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)
for f in FILES:
    shutil.copy2(os.path.join(ROOT, f), os.path.join(OUT, f))
for d in DIRS:
    shutil.copytree(os.path.join(ROOT, d), os.path.join(OUT, d))
n = sum(len(fs) for _, _, fs in os.walk(OUT))
print(f"www/ 에 파일 {n}개를 모았어요")
