/* FILIN 제품 데이터와 추천 규칙 (앱 index.html과 맞춤 추천 웹 recommend.html이 함께 써요)
   제품·가격·스토어 주소·추천 규칙은 이 파일 한 곳만 고치면 두 화면에 같이 바뀌어요.
   고친 뒤에는 python3 tools/build.py 를 실행해 한 파일 버전(*-onefile.html)을 다시 만들고,
   sw.js의 VERSION 숫자를 하나 올려 주세요.
   ※ 추천 함수의 stageOf(pt)·sizeOf(pt)는 각 화면이 정해요. 앱은 프로필(생일·체중)로, 웹은 질문 답으로 구해요. */
const BRANDS = {
  tow:{name:"토우", en:"Taste of the Wild", line:"미국 · 야생에서 영감받은 동물성 단백질 중심"},
  pv:{name:"퓨어비타", en:"PureVita", line:"미국 · 한 레시피에 동물성 단백질 하나"},
  ns:{name:"뉴트리소스", en:"NutriSource", line:"미국 · 퍼피부터 시니어까지 데일리 균형 영양"},
  ch:{name:"초이스", en:"NutriSource Choice", line:"미국 · 매일 먹기 좋은 기본 데일리 영양"},
  bf:{name:"벨포아", en:"Bellfor", line:"독일 · 곤충 단백질과 저온압착"}
};
// sp: dog/cat · st: 대상 단계 · prot: 주 단백질 키 · gf: 그레인프리 · ltd: 동물성 단백질 하나 · also: 주 단백질 말고 들어 있는 알러지 원료 {키:"어디에"} · kcal: kcal/kg (컵 표기만 있으면 g으로 나눈 값)
const P = [
 {id:"tow-pacific-stream-dog",b:"tow",n:"훈제연어 & 고구마",sp:"dog",st:["adult"],prot:"fish",pl:"연어 · 청어",gf:1,ltd:0,also:{chicken:"천연 향미제(닭)"},hot:1,kcal:3600,sizes:[2,4.5,5.6,12.2,18.14],pt:"토우 대표 그레인프리 레시피(퍼시픽 스트림). 동물성 단백질은 연어와 생선에서 얻어요.",tags:["picky","fish"]},
 {id:"tow-pacific-stream-puppy",b:"tow",n:"훈제연어 & 고구마 퍼피",sp:"dog",st:["puppy"],prot:"fish",pl:"연어 · 청어",gf:1,ltd:0,also:{chicken:"천연 향미제(닭)"},kcal:3661,sizes:[2,5.6,12.2],pt:"성장기 강아지를 위한 그레인프리 레시피예요.",tags:["fish"]},
 {id:"tow-prey-trout-dog",b:"tow",n:"PREY 송어",sp:"dog",st:["adult","senior"],prot:"fish",pl:"송어",gf:1,ltd:0,also:{chicken:"닭 분말"},kcal:3592,sizes:[3.63,11.34],pt:"송어가 주 단백질인 제한 원료 레시피예요. 닭 분말과 연어 오일도 들어 있어요.",tags:["fish","novel"]},
 {id:"tow-prey-turkey-dog",b:"tow",n:"PREY 칠면조",sp:"dog",st:["adult","senior"],prot:"turkey",pl:"칠면조",gf:1,ltd:0,also:{chicken:"닭 분말",fish:"연어오일"},kcal:3670,sizes:[3.63,11.34],pt:"칠면조가 주 단백질인 제한 원료 레시피예요. 닭 분말과 연어오일도 들어 있어요.",tags:[]},
 {id:"tow-canyon-river-cat",b:"tow",n:"송어 & 훈제연어 (고양이)",sp:"cat",st:["kitten","adult","senior"],prot:"fish",pl:"송어 · 연어",gf:1,ltd:0,also:{chicken:"천연 향미제(닭)"},hot:1,kcal:3741,sizes:[1.36,2,4.5,6.6],pt:"생선파 고양이를 위한 그레인프리 레시피(캐니언 리버)예요.",tags:["picky","fish"]},
 {id:"tow-prey-turkey-cat",b:"tow",n:"PREY 칠면조 (고양이)",sp:"cat",st:["kitten","adult","senior"],prot:"turkey",pl:"칠면조",gf:1,ltd:0,also:{chicken:"닭 분말",fish:"연어오일"},kcal:3689,sizes:[2.72],pt:"칠면조가 주 단백질인 고양이용 제한 원료 레시피예요. 닭 분말도 들어 있어요.",tags:[]},
 {id:"pv-dog-salmon-peas",b:"pv",n:"연어 & 완두",sp:"dog",st:["puppy","adult","senior"],prot:"fish",pl:"연어",gf:1,ltd:1,also:{},kcal:3945,sizes:[1.81,5.44,11.3],pt:"동물성 원료가 연어 하나인 그레인프리 전연령 레시피예요.",tags:["fish"]},
 {id:"pv-dog-pork-blueberry",b:"pv",n:"포크 & 블루베리",sp:"dog",st:["puppy","adult","senior"],prot:"pork",pl:"돼지고기",gf:1,ltd:0,also:{fish:"연어오일"},kcal:3848,sizes:[1.81,5.44,11.3],pt:"닭·소 말고 다른 단백질을 찾을 때 고르는 그레인프리 전연령 레시피예요.",tags:["novel"]},
 {id:"pv-dog-turkey-sweetpotato",b:"pv",n:"칠면조 & 고구마",sp:"dog",st:["puppy","adult","senior"],prot:"turkey",pl:"칠면조",gf:1,ltd:0,also:{fish:"연어유"},sizes:[1.81,5.44,11.3],pt:"칠면조고기와 고구마로 만든 그레인프리 전연령 레시피예요.",tags:[]},
 {id:"pv-dog-chicken-brownrice",b:"pv",n:"치킨 & 현미",sp:"dog",st:["puppy","adult","senior"],prot:"chicken",pl:"닭고기",gf:0,ltd:0,also:{fish:"연어오일"},kcal:3786,sizes:[1.81,5.44,11.3],pt:"현미·귀리·보리를 담은 전연령 레시피예요.",tags:[]},
 {id:"pv-cat-salmon-peas",b:"pv",n:"캣 연어 & 완두",sp:"cat",st:["adult","senior"],prot:"fish",pl:"연어",gf:1,ltd:1,also:{},sizes:[1.81,5.44],pt:"예민한 고양이를 위한 그레인프리 단일 단백질이에요.",tags:["fish"]},
 {id:"pv-cat-chicken-peas",b:"pv",n:"캣 치킨 & 완두",sp:"cat",st:["kitten","adult","senior"],prot:"chicken",pl:"닭고기",gf:1,ltd:1,also:{},hot:1,sizes:[1.81,5.44],pt:"고양이용 그레인프리. 필린에서 많이 찾는 고양이 사료예요.",tags:["picky"]},
 {id:"ns-choice-chicken-barley",b:"ch",n:"치킨 & 보리",sp:"dog",st:["adult"],prot:"chicken",pl:"닭고기",gf:0,ltd:0,also:{turkey:"천연 향미제(칠면조)"},kcal:3474,sizes:[2.27,18.14],pt:"닭고기 분말과 보리·수수로 만든 기본 데일리 사료예요. 글루코사민·콘드로이틴이 들어 있어요.",tags:[]},
 {id:"ns-choice-turkey-barley",b:"ch",n:"칠면조 & 보리",sp:"dog",st:["adult"],prot:"turkey",pl:"칠면조",gf:0,ltd:0,also:{chicken:"닭지방·천연 향미제(닭)"},kcal:3492,sizes:[18.14],pt:"칠면조 분말이 주 단백질인 데일리 사료예요. 닭지방과 닭 향미제도 들어 있어요.",tags:[]},
 {id:"ns-choice-whitefish-rice",b:"ch",n:"화이트피쉬 & 라이스",sp:"dog",st:["adult"],prot:"fish",pl:"대구",gf:0,ltd:1,also:{},kcal:3492,sizes:[2.27,18.14],pt:"대구 어분이 유일한 동물성 원료인 데일리 사료예요. 현미·오트밀·보리가 들어가요.",tags:["fish"]},
 {id:"ns-choice-large-breed",b:"ch",n:"라지브리드",sp:"dog",st:["adult"],prot:"chicken",pl:"닭고기",gf:0,ltd:0,also:{turkey:"천연 향미제(칠면조)",fish:"청어 어분"},large:1,kcal:3756,sizes:[18.14],pt:"큰 아이들을 위한 레시피예요. 글루코사민·콘드로이틴이 들어 있어요.",tags:["large"]},
 {id:"ns-choice-performance",b:"ch",n:"퍼포먼스",sp:"dog",st:["adult"],prot:"chicken",pl:"닭고기",gf:0,ltd:0,also:{turkey:"천연 향미제(칠면조)"},kcal:3746,sizes:[18.14],pt:"조단백 30%, 조지방 20%로 운동량 많은 아이를 위한 레시피예요.",tags:["active"]},
 {id:"ns-choice-puppy",b:"ch",n:"퍼피",sp:"dog",st:["puppy"],prot:"chicken",pl:"닭고기",gf:0,ltd:0,also:{turkey:"천연 향미제(칠면조)",fish:"연어 어유"},kcal:3756,sizes:[2.27],pt:"처음 밥을 고를 때 시작하기 좋은 퍼피 레시피예요. 연어 어유로 DHA를 더했어요.",tags:[]},
 {id:"ns-gf-senior",b:"ns",n:"그레인프리 시니어 칠면조",sp:"dog",st:["senior"],prot:"turkey",pl:"칠면조",gf:1,ltd:0,also:{chicken:"천연 향미제(닭)",fish:"청어 어분"},kcal:3600,sizes:[1.81,5.44,11.79],pt:"7살 이상 아이를 위한 그레인프리 레시피예요. 칠면조가 주 단백질이고 렌틸콩·병아리콩이 들어가요.",tags:[]},
 {id:"ns-gf-chicken-peas",b:"ns",n:"그레인프리 치킨 & 완두",sp:"dog",st:["adult"],prot:"chicken",pl:"닭고기",gf:1,ltd:0,also:{turkey:"천연 향미제(칠면조)",fish:"연어 분말"},kcal:3991,sizes:[1.81,5.44,11.79],pt:"곡물을 빼고 싶을 때 고르는 데일리 레시피예요. 조단백 28%, 조지방 18%예요.",tags:[]},
 {id:"ns-cat-kitten-country",b:"ns",n:"캣 & 키튼 컨트리 셀렉트",sp:"cat",st:["kitten","adult"],prot:"chicken",pl:"닭고기 · 오리",gf:1,ltd:0,also:{turkey:"칠면조 분말",fish:"천연 향미제(어류)·연어유"},kcal:4165,sizes:[1.81,5.44],pt:"키튼부터 성묘까지 먹일 수 있는 그레인프리 레시피예요. 조단백 36%예요.",tags:[]},
 {id:"bellfor-naturgut-coldpressed",b:"bf",n:"네이처굿 슈마우스 콜드프레스",sp:"dog",st:["adult","senior"],prot:"insect",pl:"곤충 (건조 곤충 23%)",gf:1,ltd:0,also:{chicken:"가금류 지방(종류 표기 없음)",fish:"연어 오일"},kcal:3538,sizes:[4],pt:"저온압착으로 만든 8mm 원통형 알갱이예요. 콘드로이틴·글루코사민이 들어 있어요.",tags:["novel"]},
 {id:"bellfor-landgut",b:"bf",n:"란트굿 슈마우스 라지바이트",sp:"dog",st:["adult","senior"],prot:"insect",pl:"곤충 (건조 곤충 26%)",gf:1,ltd:0,also:{chicken:"닭고기 지방",fish:"연어 오일"},large:1,kcal:3395,sizes:[7.5],pt:"16.5mm 큰 알갱이로 만든 곤충 단백질 사료예요.",tags:["novel","large"]},
 {id:"bellfor-landgut-mini",b:"bf",n:"란트굿 슈마우스 미니",sp:"dog",st:["adult","senior"],prot:"insect",pl:"곤충 (동애등에)",gf:1,ltd:0,also:{chicken:"닭고기지방",fish:"연어오일"},small:1,kcal:3450,sizes:[1.2,2.5,7.5],pt:"하이포알러지 눈물사료로 알려진 8mm 작은 알갱이예요. 조단백 28%, 조지방 18%예요.",tags:["novel","small"]}
];
const byId = Object.fromEntries(P.map(p=>[p.id,p]));

/* ---------- 구매 링크 (개밥왕 스마트스토어) ----------
   상품 주소를 알면 STORE_URL에 넣어 주세요. 없으면 스토어 안 검색 결과로 보내요. */
const STORE = "https://smartstore.naver.com/gaebabking";
const STORE_URL = {
  "ns-cat-kitten-country": "https://smartstore.naver.com/gaebabking/products/13680020906",
  "tow-pacific-stream-puppy": "https://smartstore.naver.com/gaebabking/products/12765059059",
  "tow-prey-turkey-cat": "https://smartstore.naver.com/gaebabking/products/13585785169",
  "tow-pacific-stream-dog": "https://smartstore.naver.com/gaebabking/products/13586433442",
  "tow-prey-trout-dog": "https://smartstore.naver.com/gaebabking/products/13753838331",
  "tow-prey-turkey-dog": "https://smartstore.naver.com/gaebabking/products/13753838333",
  "tow-canyon-river-cat": "https://smartstore.naver.com/gaebabking/products/13585785168",
  "bellfor-landgut-mini": "https://smartstore.naver.com/gaebabking/products/5419779306",
  "bellfor-landgut": "https://smartstore.naver.com/gaebabking/products/13820687796",
  "bellfor-naturgut-coldpressed": "https://smartstore.naver.com/gaebabking/products/13820790245",
  "pv-cat-salmon-peas": "https://smartstore.naver.com/gaebabking/products/11586228961",
  "pv-cat-chicken-peas": "https://smartstore.naver.com/gaebabking/products/13393753468",
  "pv-dog-turkey-sweetpotato": "https://smartstore.naver.com/gaebabking/products/13679768191",
  "pv-dog-pork-blueberry": "https://smartstore.naver.com/gaebabking/products/13679849300",
  "pv-dog-salmon-peas": "https://smartstore.naver.com/gaebabking/products/13679849302",
  "pv-dog-chicken-brownrice": "https://smartstore.naver.com/gaebabking/products/13679849304",
  "ns-gf-chicken-peas": "https://smartstore.naver.com/gaebabking/products/13676893110",
  "ns-gf-senior": "https://smartstore.naver.com/gaebabking/products/13676893113",
  "ns-choice-whitefish-rice": "https://smartstore.naver.com/gaebabking/products/13676893115",
  "ns-choice-puppy": "https://smartstore.naver.com/gaebabking/products/13676893116",
  "ns-choice-performance": "https://smartstore.naver.com/gaebabking/products/13676893117",
  "ns-choice-turkey-barley": "https://smartstore.naver.com/gaebabking/products/13676893118",
  "ns-choice-chicken-barley": "https://smartstore.naver.com/gaebabking/products/13676893120",
  "ns-choice-large-breed": "https://smartstore.naver.com/gaebabking/products/13676893121",
};
const STORE_Q = {
  "tow-pacific-stream-dog":"토우 훈제연어 고구마", "tow-pacific-stream-puppy":"토우 퍼피", "tow-prey-trout-dog":"토우 프레이 송어",
  "tow-prey-turkey-dog":"토우 프레이 칠면조", "tow-canyon-river-cat":"토우 고양이 송어", "tow-prey-turkey-cat":"토우 프레이 고양이",
  "pv-dog-salmon-peas":"퓨어비타 연어", "pv-dog-pork-blueberry":"퓨어비타 포크", "pv-dog-turkey-sweetpotato":"퓨어비타 칠면조",
  "pv-dog-chicken-brownrice":"퓨어비타 치킨 현미", "pv-cat-salmon-peas":"퓨어비타 캣 연어", "pv-cat-chicken-peas":"퓨어비타 캣 치킨",
  "ns-choice-chicken-barley":"뉴트리소스 치킨", "ns-choice-turkey-barley":"뉴트리소스 칠면조", "ns-choice-whitefish-rice":"뉴트리소스 화이트피쉬",
  "ns-choice-large-breed":"뉴트리소스 라지브리드", "ns-choice-performance":"뉴트리소스 퍼포먼스", "ns-choice-puppy":"뉴트리소스 퍼피",
  "ns-gf-senior":"뉴트리소스 시니어", "ns-gf-chicken-peas":"뉴트리소스 그레인프리 치킨", "ns-cat-kitten-country":"뉴트리소스 캣",
  "bellfor-naturgut-coldpressed":"벨포아", "bellfor-landgut":"벨포아", "bellfor-landgut-mini":"벨포아"
};
const storeUrl = p=> STORE_URL[p.id] || `${STORE}/search?q=${encodeURIComponent(STORE_Q[p.id]||BRANDS[p.b].name)}`;
// 용량별 가격 [판매가, 정가(할인 전, 없으면 생략)] · 개밥왕 스마트스토어 목록 기준 (2026-10-30)
const PRICE = {
 "tow-pacific-stream-dog":{2:[30000],4.5:[63000],5.6:[75000],12.2:[129000],18.14:[169000]},
 "tow-pacific-stream-puppy":{2:[30000],5.6:[69000],12.2:[119000]},
 "tow-prey-trout-dog":{3.63:[37100,53000],11.34:[139000]},
 "tow-prey-turkey-dog":{3.63:[37100,53000],11.34:[139000]},
 "tow-canyon-river-cat":{1.36:[24000],2:[31000],4.5:[63000],6.6:[88000]},
 "tow-prey-turkey-cat":{2.72:[40000]},
 "pv-dog-salmon-peas":{1.81:[16000,25000],5.44:[43000,65000],11.3:[79000,119000]},
 "pv-dog-pork-blueberry":{1.81:[16000,27000],5.44:[43000,65000],11.3:[79000,129000]},
 "pv-dog-turkey-sweetpotato":{1.81:[16000,23000],5.44:[43000,59000],11.3:[79000,109000]},
 "pv-dog-chicken-brownrice":{1.81:[16000,23000],5.44:[43000,59000],11.3:[79000,105000]},
 "pv-cat-salmon-peas":{1.81:[24000],5.44:[43000,63000]},
 "pv-cat-chicken-peas":{1.81:[10700,22000],5.44:[31000,53000]},
 "ns-choice-chicken-barley":{2.27:[25000],18.14:[129000]},
 "ns-choice-turkey-barley":{18.14:[139000]},
 "ns-choice-whitefish-rice":{2.27:[30000],18.14:[149000]},
 "ns-choice-large-breed":{18.14:[139000]},
 "ns-choice-performance":{18.14:[139000]},
 "ns-choice-puppy":{2.27:[25000]},
 "ns-gf-senior":{1.81:[25000],5.44:[65000],11.79:[119000]},
 "ns-gf-chicken-peas":{1.81:[25000],5.44:[65000],11.79:[119000]},
 "ns-cat-kitten-country":{1.81:[16000,23000],5.44:[43000,63000]},
 "bellfor-naturgut-coldpressed":{4:[68000]},
 "bellfor-landgut":{7.5:[145000]},
 "bellfor-landgut-mini":{1.2:[29900],2.5:[55000],7.5:[145000]}
};
const SOLDOUT = {"tow-canyon-river-cat":[6.6]}; // 스토어에서 일시품절
const won = n=> n.toLocaleString("ko-KR")+"원";
const priceOf = (p,size)=> (PRICE[p.id]||{})[size] || null;
const soldOut = (p,size)=> (SOLDOUT[p.id]||[]).includes(size);
const fromPrice = p=> { const v=Object.values(PRICE[p.id]||{}).map(x=>x[0]); return v.length?Math.min(...v):null; };
const AUTO_OFF = 0.07;
const autoPrice = n=> Math.round(n*(1-AUTO_OFF)/100)*100;

const STAGE = {puppy:"퍼피",kitten:"키튼",adult:"성견·성묘",senior:"시니어"};
const stageName = (st,sp)=> st==="adult" ? (sp==="cat"?"성묘":"성견") : STAGE[st];
const ALLERGENS = [["chicken","닭고기"],["beef","소고기"],["fish","생선"],["turkey","칠면조"],["pork","돼지고기"],["grain","곡물 (밀·보리 등)"]];
const allergenName = k=> k==="grain" ? "곡물" : (ALLERGENS.find(a=>a[0]===k)||[k,k])[1];
const spName = sp=> sp==="dog"?"강아지":"고양이";
const szText = s=> s<1 ? `${Math.round(s*1000)}g` : `${s}kg`;
/* ---------- 고민 질문과 브랜드별 소구점 (통합브랜드관 계획 2026-11-02) ----------
   "이 고민이면 이 브랜드"를 하나씩 정해 상세페이지·인스타·블로그·추천에서 같은 말을 반복해요.
   질병 진단·치료가 아니라 제품 정보(원료·설계)로 고르는 기준이에요. 효능을 약속하는 말은 쓰지 않아요.
   ※ 초안이에요. 확정되면 POINT의 brand·line만 고치면 추천과 화면 문구가 같이 바뀌어요. */
const CONCERNS = [["picky","입이 짧아요 (기호성)"],["tear","눈물 자국이 신경 쓰여요"],["stool","변 상태가 고민이에요"],["allergy","알러지가 걱정돼요"]];
const POINT = {
  picky:  {brand:"tow", line:"기호성 고민엔 토우 · 야생 단백질과 훈제 향으로 입 짧은 아이들이 많이 찾는 브랜드"},
  tear:   {brand:"pv",  line:"눈물 고민엔 퓨어비타 · 동물성 단백질 하나 + 그레인프리라 원재료표가 짧아요"},
  stool:  {brand:"ns",  line:"변 고민엔 뉴트리소스 · 소화와 영양소 흡수를 고려한 Good 4 Life 설계"},
  allergy:{brand:["pv","bf"], line:"알러지 고민엔 퓨어비타와 벨포아 · 동물성 단백질 하나(퓨어비타), 닭·소 대신 곤충 단백질(벨포아)",
           by:{pv:"알러지 고민엔 퓨어비타 · 동물성 단백질이 하나라 원재료표가 짧아요", bf:"알러지 고민엔 벨포아 · 닭·소 대신 곤충 단백질"}},
  daily:  {brand:"ch",  line:"특별한 고민이 없다면 초이스 · 매일 먹기 좋은 기본 데일리 영양"}
};
const CONCERN_SHORT = {picky:"기호성", tear:"눈물", stool:"변 상태", allergy:"알러지", daily:"기본 데일리"};
const concernName = k=> CONCERN_SHORT[k]||k;
/* 한 고민을 두 브랜드가 함께 맡을 수 있어요 (알러지: 퓨어비타·벨포아, 11-02 확정). by가 있으면 브랜드별 한 줄을 써요. */
const ptBrands = c=> [].concat(POINT[c].brand);
const ptLine = (c,b)=> (POINT[c].by && POINT[c].by[b]) || POINT[c].line;
const ACTIVE = [["low","조용히 쉬는 편"],["normal","보통이에요"],["high","정말 많이 뛰어놀아요"]];
function recommend(pt){
  const st=stageOf(pt), sz=sizeOf(pt), al=pt.allergies||[];
  // 고민 질문을 받은 경우(맞춤 추천 웹)만 고민 규칙을 써요. 고민을 하나도 안 고르면 '기본 데일리'로 봐요.
  // 앱 프로필에는 아직 고민 칸이 없어서(concerns 없음) 예전 앱 규칙과 똑같이 추천돼요.
  const cn=Array.isArray(pt.concerns)?(pt.concerns.length?pt.concerns:["daily"]):[];
  // 고민을 원래 취향 규칙으로도 옮겨요: 기호성→입 짧은 아이용, 눈물→원재료 단순·그레인프리, 알러지→원재료 단순·새 단백질
  const pr=[...(pt.prefs||[]), ...(cn.includes("picky")?["picky"]:[]), ...(cn.includes("tear")?["simple","gf"]:[]), ...(cn.includes("allergy")?["simple","novel"]:[])];
  return P.filter(p=>p.sp===pt.sp).map(p=>{
    if(al.includes(p.prot) || (al.includes("grain") && !p.gf)) return null;
    let s=0; const why=[]; let caution=null;
    if(p.st.includes(st)){s+=4; why.push(`${stageName(st,pt.sp)} 단계에 맞는 레시피`);}
    else if(st!=="adult"){s-=6;}
    const hit=al.filter(a=>p.also && p.also[a]);
    if(hit.length){s-=1; caution=`주 단백질은 ${p.pl}이지만 ${hit.map(a=>`${allergenName(a)}(${p.also[a]})`).join(", ")}도 들어 있어요. 엄격히 피해야 하면 확인이 필요해요.`;}
    else if(al.includes("chicken")){s+=3; why.push(`닭고기 없이 ${p.pl} 단백질`);}
    if((pr.includes("gf")||al.includes("grain")) && p.gf){s+=2; why.push("곡물을 뺀 그레인프리");}
    if(pr.includes("simple") && p.ltd){s+=3; why.push("동물성 단백질이 하나라 원재료표가 짧아요");}
    if(pr.includes("picky") && p.tags.includes("picky")){s+=2; why.push("향이 뚜렷해 입 짧은 아이들이 많이 찾는 레시피");}
    if(pr.includes("novel") && p.tags.includes("novel")){s+=3; why.push(`닭·소와 다른 새로운 단백질 (${p.pl})`);}
    if(pr.includes("fish") && p.prot==="fish"){s+=2; why.push("생선 단백질");}
    if(pt.active==="high" && p.tags.includes("active")){s+=3; why.push("활동량 많은 아이용");}
    if(sz==="large" && p.large){s+=3; why.push("대형견용 레시피");}
    if(sz==="small" && p.small){s+=2; why.push("소형견용 작은 알갱이");}
    const pts=cn.filter(c=>POINT[c] && ptBrands(c).includes(p.b));
    if(pts.length){s+=4*pts.length; why.unshift(...pts.map(c=>ptLine(c,p.b)));}
    if(cn.includes("stool") && p.b==="pv"){s+=2; why.push("퓨어비타도 Good 4 Life 설계 (뉴트리소스와 같은 제조사)");}
    if(p.hot){s+=1.5; why.push("필린에서 많이 찾는 제품");}
    return {p,s,why,caution};
  }).filter(r=>r && r.s>0).sort((a,b)=>b.s-a.s).slice(0,3);
}
