import React from 'react';
export const TECHNOLOGIES = [
  {id:'engineering',name:'기초 공학',cost:1,desc:'제작소 건설과 응급약 제작을 해금합니다.',memory:'집 앞에서 고장 난 조명을 함께 고쳤다. 작은 불이 켜지자 가족이 웃었다.'},
  {id:'survey',name:'탐사 장비',cost:2,desc:'더 넓은 지역을 밝히는 탐사 스캐너를 해금합니다.',memory:'주말이면 함께 낯선 길을 걸었다. 길을 잃어도 손을 놓지 않으면 괜찮았다.'},
  {id:'navigation',name:'항해 기술',cost:3,desc:'바다를 건널 소형 해양 탐사선을 해금합니다.',memory:'떠나는 날, 꼭 돌아오겠다고 약속했다. 그 약속만은 아직 선명하다.'},
];
export default function ResearchPanel({hasBlackbox,stock,techs,building,buildings,inventory,load,scanner,boat,onResearch,onCraft,onClose,notice}) {
  const library=building?.type==='도서관', workshop=building?.type==='제작소';
  return <div className="research-backdrop"><section className="research-panel" role="dialog" aria-modal="true" aria-label="지식과 제작">
    <header><div><small>RECOVER · REMEMBER · RETURN</small><h2>돌아갈 방법을 찾아서</h2><p>기록을 회수하고, 지식을 되찾고, 더 멀리 탐험하세요.</p></div><button onClick={onClose} aria-label="연구 창 닫기">×</button></header>
    <div className="research-summary"><span>기록 매체 <b>{stock.data}</b></span><span>복원한 지식 <b>{techs.length} / 3</b></span><span>현재 시설 <b>{building?.type || '탐사 현장'}</b></span></div>
    <p className="research-notice" role="status">{notice || (library?'도서관에 접속했습니다. 해독할 기록을 선택하세요.':workshop?'제작소에 접속했습니다. 제작할 장비를 선택하세요.':'건설 메뉴에서 도서관을 짓고, 그 칸에서 기록을 해독하세요.')}</p>
    <div className="research-columns"><section><h3>01 / 도서관 <small>지식 복원</small></h3>{TECHNOLOGIES.map((tech,i)=>{
      const done=techs.includes(tech.id), prerequisite=i===0?hasBlackbox:techs.includes(TECHNOLOGIES[i-1].id);
      return <article key={tech.id} className={done?'restored':''}><small>기록 {String(i+1).padStart(2,'0')} · 매체 {tech.cost}개</small><h4>{done?'✓ ':''}{tech.name}</h4><p>{tech.desc}</p>{done?<blockquote>“{tech.memory}”</blockquote>:<button disabled={!library||!prerequisite||stock.data<tech.cost} onClick={()=>onResearch(tech.id)}>{!prerequisite?(i===0?'조사선의 블랙박스 회수 필요':'이전 지식 복원 필요'):!library?'도서관 칸에서 해독':stock.data<tech.cost?'기록 매체 부족':'기록 해독하기 →'}</button>}</article>;
    })}</section><section><h3>02 / 제작소 <small>장비 제작</small></h3>{[
      {id:'medicine',name:'응급약',tech:'engineering',desc:'체력 45 회복 · 가방 중량 +1',cost:'구조재 2 · 회로 1',ready:stock.structure>=2&&stock.circuit>=1&&load+1<=100},
      {id:'scanner',name:'탐사 스캐너',tech:'survey',desc:'탐사 시야가 6칸에서 9칸으로 확장됩니다.',cost:'구조재 3 · 회로 2',ready:stock.structure>=3&&stock.circuit>=2,done:scanner},
      {id:'boat',name:'소형 해양 탐사선',tech:'navigation',desc:'바다를 건너 새로운 지역을 탐험합니다.',cost:'선체판 3 · 부력 셀 2 · 동력 코어 1',ready:inventory['선체판']>=3&&inventory['부력 셀']>=2&&inventory['동력 코어']>=1,done:boat},
    ].map(item=><article key={item.id}><small>{item.cost}</small><h4>{item.name}</h4><p>{item.desc}</p><button disabled={item.done||!workshop||!techs.includes(item.tech)||!item.ready} onClick={()=>onCraft(item.id)}>{item.done?'장비 보유 중':!techs.includes(item.tech)?'관련 지식 복원 필요':!workshop?'제작소 칸에서 제작':!item.ready?'재료 또는 가방 여유 부족':'제작하기 →'}</button></article>)}</section></div>
    <footer><span>도서관 → 제작소 → 바다 너머의 기록</span><span>건설한 시설 {buildings.size}개 · ESC 닫기</span></footer>
  </section></div>;
}
