import {miningChance} from './mining.js';
export const initialIndustry=()=>({tick:0,energy:30,water:8,nutrients:6,seeds:3,food:0,data:0,robots:{},crops:{},log:'발전·채굴·재배 설비를 설치하면 시간에 따라 생산합니다.'});
export function advanceIndustry(previous,buildings,techs,profile,phase,steps=1,random=Math.random){
 const state={...previous,robots:Object.fromEntries(Object.entries(previous.robots).map(([k,v])=>[k,{...v}])),crops:Object.fromEntries(Object.entries(previous.crops).map(([k,v])=>[k,{...v}]))};
 const cap=techs.includes('battery')?300:60;
 const generators=[...buildings.values()].filter(b=>b.type==='태양광발전기').length;
 const libraries=[...buildings.values()].filter(b=>b.type==='도서관').length;
 for(let i=0;i<Math.min(600,Math.max(0,steps));i++){
  state.tick++;
  if(state.tick%5===0&&(phase+i)%600<480)state.energy=Math.min(cap,state.energy+generators*2);
  if(libraries&&state.tick%180===0&&state.energy>=1){state.energy--;state.data+=libraries;}
  if(techs.includes('robot-miner'))for(const [key,robot] of Object.entries(state.robots)){
   if(!buildings.has(key)||robot.buffer>=20)continue;
   robot.cycle=Math.min(12,robot.cycle+1);
   if(robot.cycle===12&&state.energy>=2){state.energy-=2;robot.cycle=0;if(random()<miningChance(profile,robot.symbol)){robot.buffer++;state.log=`${robot.symbol} 자동 채굴 +1 · ${key} 저장 ${robot.buffer}/20`;}}
  }
  if(techs.includes('hydroponics'))for(const [key,b] of buildings){
   if(b.type!=='온실')continue;
   const crop=state.crops[key]||(state.crops[key]={progress:0,running:false,harvests:0});
   if(!crop.running&&state.energy>=4&&state.water>=2&&state.nutrients>=1&&state.seeds>=1){state.energy-=4;state.water-=2;state.nutrients--;state.seeds--;crop.running=true;crop.progress=0;}
   if(crop.running){crop.progress++;if(crop.progress>=(techs.includes('climate')?90:120)){crop.running=false;crop.progress=0;crop.harvests++;state.food+=techs.includes('agri-automation')?4:3;state.seeds++;state.log='온실 수확 완료 · 운영 창에서 식량을 회수하세요.';}}
  }
 }
 return state;
}
