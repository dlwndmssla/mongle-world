// Game balance values, not scientific abundance estimates.
export const MINE_ELEMENTS=[
 {symbol:'H',name:'수소',use:'추진제'}, {symbol:'C',name:'탄소',use:'복합 소재'},
 {symbol:'O',name:'산소',use:'추진제'}, {symbol:'Mg',name:'마그네슘',use:'선체 합금'},
 {symbol:'Al',name:'알루미늄',use:'선체 합금'}, {symbol:'Si',name:'규소',use:'항법 회로'},
 {symbol:'N',name:'질소',use:'재배 양분'}, {symbol:'P',name:'인',use:'재배 양분'}, {symbol:'K',name:'칼륨',use:'재배 양분'},
];
export const SHIP_RECIPES=[
 {id:'hull',name:'경량 선체',need:{Al:4,Mg:2},desc:'우주선의 구조를 지탱하는 합금 프레임'},
 {id:'guidance',name:'항법 장치',need:{Si:3,C:2},desc:'귀환 항로를 계산하는 항법 모듈'},
 {id:'fuel',name:'추진제 탱크',need:{H:4,O:24},desc:'추진계에 공급할 게임 환산 원료 배치. 개수는 실제 질량·몰수가 아닙니다.'},
 {id:'engine',name:'로켓 엔진',need:{Al:3,Si:2,C:2},desc:'정적 연소시험에 사용할 엔진 모듈'},
];
export function miningChance(profile,symbol){return profile?.confirmed?.includes(symbol)? .65:profile?.inferred?.includes(symbol)? .02:0;}
export function mineResult(profile,symbol,random=Math.random){const chance=miningChance(profile,symbol);return chance>0&&random()<chance?1:0;}
