import test from 'node:test';
import assert from 'node:assert/strict';
import {TECHNOLOGIES,prerequisitesMet,memoryInsight,rocketPerformance,flightReadiness} from '../src/engineering.js';
import {CURRICULUM} from '../src/curriculum.js';
import {initialIndustry,advanceIndustry} from '../src/automation.js';
import {canTravel,boardingDestination} from '../src/boat.js';
import {movementDelay,cameraView} from '../src/movement.js';
import {createDepositSampler} from '../src/deposits.js';
import {miningChance,mineResult} from '../src/mining.js';
import {readExpedition,writeExpedition} from '../src/saveGame.js';

test('all knowledge nodes have unique IDs, valid parents and an acyclic reachable graph',()=>{
 const ids=new Set(TECHNOLOGIES.map(t=>t.id));assert.equal(ids.size,TECHNOLOGIES.length);
 assert(CURRICULUM.length>=100);
 for(const t of TECHNOLOGIES)for(const id of t.requires)assert(ids.has(id),`${t.id} missing ${id}`);
 let done=[];for(let i=0;i<TECHNOLOGIES.length;i++)for(const t of TECHNOLOGIES)if(!done.includes(t.id)&&prerequisitesMet(t,done,true))done.push(t.id);
 assert.equal(done.length,TECHNOLOGIES.length);
 assert(!prerequisitesMet(TECHNOLOGIES.find(t=>t.id==='engineering'),done,false));
});
test('memory grants only a new currently eligible engineering topic',()=>{
 const done=[...CURRICULUM.map(t=>t.id),'engineering'];
 assert.equal(memoryInsight(done,()=>.99),null);
 const insight=memoryInsight(done,()=>0);assert(insight);assert(!insight.educational);assert(!done.includes(insight.id));assert(prerequisitesMet(insight,done,true));
});
test('rocket equation, mass tradeoffs and strict year-long launch requirements',()=>{
 const base={dryMass:400,payload:80,propellant:10000,isp:360,thrustKN:300,gravity:9.80665,radius:6371000,losses:1500};
 const p=rocketPerformance(base);assert(p.pass);assert(Math.abs(p.deltaV-360*9.80665*Math.log(10480/480))<1e-8);
 const more=rocketPerformance({...base,propellant:12000});assert(more.deltaV>p.deltaV);assert(more.twr<p.twr);
 assert.equal(rocketPerformance({...base,payload:-10}),null);
 const check={day:365,techs:['flight-qualification'],staticTest:true,modules:['hull','guidance','fuel','engine'],energy:10,performance:p};
 assert(flightReadiness(check));for(const change of [{day:364},{staticTest:false},{energy:9},{modules:['hull']},{performance:{pass:false}}])assert(!flightReadiness({...check,...change}));
});
test('power generation stops at night and storage caps are enforced',()=>{
 const buildings=new Map([['0,0',{type:'태양광발전기'}]]),start=initialIndustry();
 const day=advanceIndustry(start,buildings,[],{},0,600);assert.equal(day.energy,60);
 const night=advanceIndustry(start,buildings,[],{},480,120);assert.equal(night.energy,start.energy);
 assert.equal(start.tick,0);
 assert.equal(advanceIndustry(start,buildings,['battery'],{},0,600).energy,222);
});
test('robots spend power, respect probabilities and stop at full buffers',()=>{
 const buildings=new Map([['1,1',{type:'광산',mineElement:'Al'}]]),s=initialIndustry();s.robots={'1,1':{symbol:'Al',buffer:0,cycle:0}};
 const result=advanceIndustry(s,buildings,['robot-miner'],{confirmed:['Al'],inferred:[]},0,12,()=>0);
 assert.equal(result.robots['1,1'].buffer,1);assert.equal(result.energy,28);assert.equal(s.robots['1,1'].buffer,0);
 const empty=advanceIndustry({...s,energy:0},buildings,['robot-miner'],{confirmed:['Al']},0,24,()=>0);assert.equal(empty.robots['1,1'].buffer,0);
 const full={...s,robots:{'1,1':{symbol:'Al',buffer:20,cycle:0}}};assert.equal(advanceIndustry(full,buildings,['robot-miner'],{confirmed:['Al']},0,100).energy,30);
});
test('greenhouses consume supplies and require actual growth time',()=>{
 const b=new Map([['2,2',{type:'온실'}]]),s=initialIndustry();
 const growing=advanceIndustry(s,b,['hydroponics'],{},0,119);assert.equal(growing.food,0);assert.equal(growing.water,6);assert.equal(growing.nutrients,5);assert.equal(growing.energy,26);
 const harvest=advanceIndustry(growing,b,['hydroponics'],{},119,1);assert.equal(harvest.food,3);assert.equal(harvest.seeds,3);
 const dry=advanceIndustry({...s,water:0},b,['hydroponics'],{},0,300);assert.equal(dry.food,0);assert.equal(dry.energy,30);
 assert.equal(advanceIndustry(s,b,['hydroponics','climate','agri-automation'],{},0,90).food,4);
});
test('boat remains at the disembark point and cannot move onto land',()=>{
 const w=[[{type:'land'},{type:'sea'},{type:'sea'}],[{type:'land'},{type:'sea'},{type:'sea'}]],boat={x:1,y:0};
 assert(!canTravel(true,w[0][0]));assert(!canTravel(false,w[0][1]));assert.deepEqual(boardingDestination(w,{x:0,y:0},boat,false),boat);
 assert.deepEqual(boardingDestination(w,boat,boat,true),{x:0,y:0});assert.deepEqual(boat,{x:1,y:0});assert.equal(boardingDestination(w,{x:0,y:1},{x:2,y:0},false),null);
});
test('camera allows the pin to move before following and terrain controls walking pace',()=>{
 const a=cameraView({x:100,y:100},1000,700,null),b=cameraView({x:101,y:100},1000,700,a);
 assert.equal(b.startX,a.startX);assert.equal(b.playerX-a.playerX,a.tile);
 const c=cameraView({x:200,y:100},1000,700,b);assert(c.startX>b.startX);assert(c.playerX<=1000*.75);
 assert.equal(movementDelay({type:'land'}),280);assert.equal(movementDelay({type:'mountain'}),480);
});
test('deposits form element-specific clusters with rare inferred fields',()=>{
 const s=createDepositSampler('화성',{confirmed:['Al'],inferred:['Si']});let al=0,si=0,neighbors=0;
 for(let y=0;y<350;y++)for(let x=0;x<350;x++){const e=s(x,y);if(e==='Al')al++;if(e==='Si')si++;if(e&&e===s(x+1,y))neighbors++;assert(!e||['Al','Si'].includes(e));}
 assert(al>si*5);assert(neighbors>(al+si)*.6);assert.equal(miningChance({confirmed:['Al'],inferred:['Si']},'Si'),.02);assert.equal(mineResult({},'H',()=>0),0);
});
test('save snapshots round-trip maps, boat position and one-year progress',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 const s={pos:{x:5,y:6},day:365,technologies:['engineering'],boatPosition:{x:6,y:6},aboard:false,buildings:new Map([['5,6',{type:'집',level:1}]]),pins:new Map(),revealed:new Set(['5,6']),visited:new Set(['5,6']),overrides:new Map(),industry:initialIndustry()};
 assert(writeExpedition(storage,'화성',s));const saved=readExpedition(storage,'화성',100,100);assert.equal(saved.day,365);assert.deepEqual(saved.boatPosition,s.boatPosition);assert.deepEqual(saved.buildings,[...s.buildings]);assert.equal(readExpedition(storage,'달',100,100),null);
});
