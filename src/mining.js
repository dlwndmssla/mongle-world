// Game balance values, not scientific abundance estimates.
export const MINE_ELEMENTS=[
 {symbol:'H',name:'수소',use:'추진제'}, {symbol:'C',name:'탄소',use:'복합 소재'},
 {symbol:'O',name:'산소',use:'추진제'}, {symbol:'Mg',name:'마그네슘',use:'선체 합금'},
 {symbol:'Al',name:'알루미늄',use:'선체 합금'}, {symbol:'Si',name:'규소',use:'항법 회로'},
];
export const SHIP_RECIPES=[
 {id:'hull',name:'경량 선체',need:{Al:4,Mg:2},desc:'우주선의 구조를 지탱하는 합금 프레임'},
 {id:'guidance',name:'항법 장치',need:{Si:3,C:2},desc:'귀환 항로를 계산하는 항법 모듈'},
 {id:'fuel',name:'추진제 탱크',need:{H:4,O:4},desc:'귀환 비행에 사용할 추진제 모듈'},
];
export function miningChance(profile,symbol){return profile?.confirmed?.includes(symbol)? .65:profile?.inferred?.includes(symbol)? .02:0;}
export function mineResult(profile,symbol,random=Math.random){const chance=miningChance(profile,symbol);return chance>0&&random()<chance?1:0;}
