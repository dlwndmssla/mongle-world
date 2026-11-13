import {CURRICULUM} from './curriculum.js';
export const MIN_FLIGHT_DAY=365;
export const TREE_WIDTH=1760,TREE_HEIGHT=1400;
const n=(id,name,branch,x,y,cost,requires,desc,formula,meaning,memory)=>({id,name,branch,x,y,cost,requires,desc,formula,meaning,memory,icon:branch==='로켓공학'?'△':branch==='로봇공학'?'⚙':branch==='식물공학'?'♧':'✧'});
const ENGINEERING_TOPICS=[
 n('engineering','뉴턴 역학','로켓공학',30,540,1,[],'제작소와 기초 제작을 해금합니다. 질량과 가속도에서 필요한 힘을 계산합니다.','F = ma','F: 합력(N), m: 질량(kg), a: 가속도(m/s²).', '아버지와 카트를 밀었다. 짐이 늘수록 같은 가속도를 내기 어려웠다.'),
 n('materials','재료역학·합금','로켓공학',240,40,2,['engineering'],'경량 선체와 압력 용기를 제작합니다. 단순 인장 응력으로 구조 부재를 평가합니다.','σ = F / A','σ: 응력(Pa), F: 축방향 힘(N), A: 단면적(m²).'),
 n('geometry','미적분·운동학','로켓공학',240,210,2,['engineering'],'좌표계와 속도·가속도 관계를 복원합니다. 유도와 궤도 계산의 선행 지식입니다.','v = dx/dt,  a = dv/dt','위치의 시간 미분은 속도, 속도의 시간 미분은 가속도입니다.'),
 n('thermofluids','열역학','로켓공학',240,380,2,['engineering'],'추진제 처리와 열관리의 기초를 복원합니다.','Q = mcΔT','비열이 일정하고 상변화가 없는 구간의 현열 모델입니다.'),
 n('structures','압력용기·구조','로켓공학',460,40,3,['materials'],'탱크와 선체 통합의 선행 지식입니다.','σθ = pr / t','얇은 원통형 압력용기의 원주 응력: 내압 p, 반경 r, 벽 두께 t.'),
 n('guidance','센서·상태 추정','로켓공학',460,210,3,['geometry','power'],'항법 장치 제작을 해금합니다. 가속도계·자이로 자료를 상태 추정에 연결합니다.','xₖ₊₁ = A xₖ + B uₖ','이산 선형 상태방정식. 실제 항법에서는 잡음과 관측 모델도 필요합니다.'),
 n('refining','추진제 정제','로켓공학',460,380,3,['thermofluids','power'],'원소 원료를 추진제로 가공할 수 있게 합니다.','2H₂ + O₂ → 2H₂O','반응식의 계수는 몰비 2:1입니다. 게임 자원 개수는 실제 몰수와 별개입니다.'),
 n('return-orbit','궤도역학','로켓공학',680,210,4,['geometry','guidance'],'설계실에서 목표 저궤도 속도를 계산합니다.','v꜀ = √(μ/r)','구형 중심천체의 원궤도 속도. μ = GM, r은 중심에서 궤도까지의 거리입니다.'),
 n('propulsion','연소·로켓 추력','로켓공학',680,380,4,['refining','structures'],'엔진과 추진제 모듈 제작을 해금합니다.','F = ṁvₑ + (pₑ − pₐ)Aₑ','질량유량·배기속도와 노즐 출구 압력항의 합으로 추력을 구합니다.'),
 n('nozzle','노즐·비추력','로켓공학',900,380,4,['propulsion','thermofluids'],'설계실에서 고효율 엔진 모드(Isp 360 s)를 사용할 수 있습니다.','Isp = F / (ṁg₀)','g₀ = 9.80665 m/s²는 표준중력이며, 행성의 표면중력과 구분합니다.'),
 n('thermal','복사 열관리','로켓공학',900,40,3,['structures','thermofluids'],'기체 통합의 열관리 지식을 확보합니다.','Q̇ = εσA(T⁴ − T∞⁴)','단순화한 순복사 열전달. σ는 슈테판–볼츠만 상수입니다.'),
 n('integration','질량 예산·Δv','로켓공학',1120,210,4,['return-orbit','structures','propulsion'],'로켓 설계실의 Δv 계산과 발사 준비를 해금합니다.','Δv = Isp · g₀ · ln(m₀/mf)','이상 로켓 방정식: 외력 손실은 별도 예산으로 추가합니다.'),
 n('static-fire','정적 연소시험','로켓공학',1120,380,3,['propulsion','nozzle'],'운영실에서 전력·원료를 소비해 실제 게임 시험을 수행할 수 있습니다.','J = ∫ F(t) dt','총역적 J의 단위는 N·s입니다. 시험 완료는 별도로 필요합니다.'),
 n('flight-qualification','시스템 검증','로켓공학',1380,210,5,['integration','static-fire','thermal','climate'],'365일 이상 생존하고, 시험·추중비·Δv 조건을 만족하면 발사할 수 있습니다.','T/W = F / (m₀g)','이륙 시 추중비가 1보다 커야 합니다. 이 게임은 여유값 1.2를 요구합니다.'),
 n('power','전력·태양광','로봇공학',240,610,2,['engineering'],'태양광 발전기 건설을 해금합니다. 낮에 전력을 생산합니다.','P = VI','P: 전력(W), V: 전압(V), I: 전류(A).'),
 n('battery','배터리·에너지','로봇공학',460,610,2,['power'],'공유 전력망의 저장 용량을 60 Wh에서 300 Wh로 확장합니다.','E = PΔt','P가 W, Δt가 h일 때 E는 Wh입니다.'),
 n('survey','계측·탐사 장비','로봇공학',460,760,2,['power','geometry'],'9칸 시야의 탐사 스캐너 제작을 해금합니다.','εᵣ = |xₘ − xₜ| / |xₜ|','참값이 0이 아닐 때의 상대 오차. 센서 측정값과 모델의 차이를 평가합니다.'),
 n('actuation','모터·구동계','로봇공학',680,610,3,['battery','materials'],'채굴 로봇 구동계의 선행 지식입니다.','τ = r × F','토크 벡터는 모멘트 팔과 힘의 외적입니다.'),
 n('robot-control','피드백 제어','로봇공학',900,610,3,['actuation','survey'],'채굴 로봇의 운전 제어를 복원합니다.','u(t) = Kp e + Ki∫e dt + Kd de/dt','PID 제어: 비례·적분·미분 항으로 오차에 반응합니다.'),
 n('robot-miner','자동 채굴 로봇','로봇공학',1120,610,4,['robot-control'],'광산 칸에 로봇을 설치합니다. 12초마다 2 Wh를 써 해당 광맥의 원소를 회수합니다.','W = ∫ F · ds','기계적 일의 정의입니다. 게임 로봇의 전력·생산 수치는 별도 밸런스 값입니다.'),
 n('logistics','광물 이송·버퍼','로봇공학',1380,610,3,['robot-miner'],'보관소에서 모든 채굴 로봇의 저장 광물을 회수할 수 있습니다.','dB/dt = qin − qout','버퍼 재고 B는 유입과 유출의 차로 변합니다. 용량이 차면 생산이 멈춥니다.'),
 n('navigation','부력·해양 운송','로봇공학',900,760,2,['survey','structures'],'해안 제작소에서 소형 탐사선을 조립할 수 있습니다.','Fᵦ = ρgV','아르키메데스 원리: 밀어낸 유체의 무게만큼 부력이 작용합니다.'),
 n('plant-physiology','광합성·식물생리','식물공학',240,980,2,['engineering'],'식량 생산 계통의 기초를 복원합니다.','6CO₂ + 6H₂O + 빛 → C₆H₁₂O₆ + 6O₂','광합성의 요약 반응식이며 실제 생리 과정과 수율은 더 복잡합니다.'),
 n('water','수처리·물수지','식물공학',460,980,2,['plant-physiology','power'],'원료를 써서 재배용 물을 보충할 수 있습니다.','dM/dt = ṁin − ṁout','계의 질량 보존. 재배 설비는 물 공급이 끊기면 다음 주기를 시작하지 못합니다.'),
 n('hydroponics','수경재배·양액','식물공학',680,980,3,['water'],'온실 건설을 해금합니다. 물·양분·종자·전력을 투입해 식량을 생산합니다.','C = n / V','몰농도 C: 용액 부피당 용질 몰수. 게임 양분 묶음은 추상화된 자원입니다.'),
 n('climate','폐쇄형 생장실','식물공학',900,980,3,['hydroponics','robot-control'],'밀폐·온도·조명 제어를 복원합니다. 작물 생장 주기를 120초에서 90초로 단축합니다.','dU/dt = Q̇in − Q̇out + Ẇin','닫힌 계의 에너지 수지를 단순화한 모델입니다.'),
 n('recycling','양분 재순환','식물공학',1120,980,3,['hydroponics'],'식량 부산물을 재활용해 양분을 보충할 수 있습니다.','축적 = 유입 − 유출 + 생성 − 소모','종별 물질수지. 재활용은 계 밖으로 빠져나가는 양을 줄입니다.'),
 n('agri-automation','재배 자동제어','식물공학',1380,980,4,['climate','logistics'],'온실 한 주기의 수확량을 3에서 4로 늘립니다.','DLI = PPFD · t / 10⁶','PPFD가 μmol·m⁻²·s⁻¹, 광주기 t가 s이면 DLI는 mol·m⁻²·day⁻¹입니다.'),
 n('memory-home','가족의 온실','기억',240,1210,1,['engineering'],'과거 기록을 복원하면 35% 확률로 현재 선행 조건을 만족한 공학 하나가 떠오릅니다.',null,null,'어머니는 잎 색을 보며 물을 줬다. 나는 그 옆에서 작은 센서를 고쳤다.'),
 n('memory-lab','잊힌 실험 노트','기억',520,1210,2,['memory-home'],'연구실의 기억을 연결합니다. 무료 공학 복원 기회가 한 번 발생합니다.',null,null,'책상 위에는 노즐 단면과 제어 블록도가 나란히 놓여 있었다.'),
 n('memory-procedural','손에 남은 기술','기억',800,1210,2,['memory-lab','survey'],'절차 기억을 복원합니다. 연구 통찰 확률이 이후 60%로 올라갑니다.',null,null,'계산은 기억나지 않아도, 계기를 교정하던 손의 순서는 익숙했다.'),
 n('memory-promise','돌아오겠다는 약속','기억',1120,1210,3,['memory-procedural','return-orbit'],'귀환을 기다리는 가족의 기억을 복원합니다. 공학 통찰 사건을 한 번 시도합니다.',null,null,'문을 닫기 전, 꼭 돌아오겠다고 약속했다. 그 약속만은 선명하다.'),
];
const FOUNDATIONS={
 engineering:['math-arithmetic','physics-newton'],materials:['physics-pressure'],geometry:['math-derivative','math-vectors'],thermofluids:['physics-heat'],
 power:['physics-electric-power'],battery:['physics-power'],survey:['math-statistics'],structures:['physics-pressure'],guidance:['math-matrices'],
 refining:['science-mole','science-reactions'],propulsion:['physics-momentum'],nozzle:['physics-gas-law'],thermal:['physics-first-law'],
 'return-orbit':['physics-gravity'],integration:['math-exp-log'], 'static-fire':['math-integral'],actuation:['physics-torque'],
 'robot-control':['math-derivative','math-integral'],navigation:['physics-buoyancy'],'plant-physiology':['science-photosynthesis'],
 water:['science-mixtures'],hydroponics:['science-solutions'],climate:['physics-first-law'],recycling:['science-ecosystems'],'agri-automation':['math-ratio'],
};
export const TECHNOLOGIES=[...CURRICULUM,...ENGINEERING_TOPICS.map(t=>({...t,requires:[...t.requires,...(FOUNDATIONS[t.id]||[])]}))];
export function prerequisitesMet(tech,completed,hasBlackbox){return !!tech&&(tech.id!=='engineering'||hasBlackbox)&&tech.requires.every(id=>completed.includes(id));}
export function memoryInsight(completed,random=Math.random){
 const chance=completed.includes('memory-procedural')?.6:.35;
 if(random()>=chance)return null;
 const pool=TECHNOLOGIES.filter(t=>!t.educational&&t.branch!=='기억'&&t.id!=='engineering'&&!completed.includes(t.id)&&prerequisitesMet(t,completed,true));
 return pool.length?pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]:null;
}
export function rocketPerformance({dryMass,payload,propellant,isp,thrustKN,gravity,radius,losses=1500}){
 if([dryMass,payload,propellant,isp,thrustKN,gravity,radius,losses].some(v=>!Number.isFinite(v))||dryMass<=0||payload<0||propellant<0||isp<=0||thrustKN<=0||gravity<=0||radius<=0||losses<0)return null;
 const mf=dryMass+payload,m0=mf+propellant;
 if([mf,m0,isp,thrustKN,gravity,radius].some(v=>!Number.isFinite(v)||v<=0)||propellant<0||losses<0)return null;
 const deltaV=isp*9.80665*Math.log(m0/mf),orbitalSpeed=Math.sqrt(gravity*radius),requiredDeltaV=orbitalSpeed+losses,twr=thrustKN*1000/(m0*gravity);
 return {deltaV,orbitalSpeed,requiredDeltaV,twr,m0,mf,pass:deltaV>=requiredDeltaV&&twr>=1.2};
}
export function flightReadiness({day,techs,staticTest,modules,energy,performance}){
 return day>=MIN_FLIGHT_DAY&&techs.includes('flight-qualification')&&staticTest&&['hull','guidance','fuel','engine'].every(id=>modules.includes(id))&&energy>=10&&!!performance?.pass;
}
