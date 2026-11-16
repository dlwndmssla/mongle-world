import React from 'react';

const GHOST_COLORS={H:'#d9f8ff',C:'#c7c4ff',O:'#b8e9ff',Mg:'#b8f4cf',Al:'#8fe5ff',Si:'#a6fff4',N:'#d4c8ff',P:'#ffd1f3',K:'#ffe09a'};

export default function MiningPanel({body,roster,currentGhost,defeated,allDefeated,cooldown,health,onMine,onReturn,onClose,notice}){
 return <div className="research-backdrop"><section className="research-panel ghost-panel" role="dialog" aria-modal="true" aria-label="원소 유령 토벌 도감">
 <header><div><small>ELEMENTAL APPARITIONS / {body}</small><h2>원소 유령 토벌 도감</h2><p>이 세계의 원소가 의식을 얻어 유령이 되었습니다. 모든 종족을 찾아 봉인해야 귀환 항로가 열립니다.</p></div><button aria-label="원소 유령 창 닫기" onClick={onClose}>×</button></header>
 <div className="research-summary"><span>토벌 진행 <b>{defeated.length}/{roster.length}</b></span><span>현재 조우 <b>{currentGhost||'없음'}</b></span><span>체력 <b>{health}</b></span></div>
 <p className="research-notice" role="status">{notice||(currentGhost?`${currentGhost} 유령이 앞을 막고 있습니다. 전투를 시작하세요.`:'지도에서 빛나는 원소 유령을 찾아 같은 칸으로 이동하세요.')}</p>
 <div className="research-columns"><section><h3>01 / 이 행성의 유령</h3><div className="ghost-roster">{roster.map(g=>{const done=defeated.includes(g.symbol),active=currentGhost===g.symbol;return <article key={g.symbol} className={`${done?'restored ':''}${active?'ghost-active':''}`}><div className="ghost-avatar" style={{'--ghost':GHOST_COLORS[g.symbol]||'#d8f7ff'}}><i/><b>{g.symbol}</b></div><small>{g.use}의 힘을 품은 유령</small><h4>{done?'봉인 완료':g.name+' 유령'}</h4><button disabled={!active||done||cooldown>0||health<=2} onClick={()=>onMine(g.symbol)}>{done?'✓ 도감에 봉인됨':!active?'지도에서 찾아야 함':health<=2?'체력이 부족합니다':cooldown?`${cooldown}초 후 공격`:'맞서 싸운다 →'}</button></article>})}</div></section>
 <section><h3>02 / 귀환 조건</h3>{allDefeated?<article className="restored"><small>HOME VECTOR RECOVERED</small><h4>귀환 항로가 열렸습니다</h4><p>이 행성의 원소 유령을 모두 봉인했습니다. 이제 가족이 기다리는 고향으로 출발할 수 있습니다.</p><button onClick={onReturn}>가족에게 돌아가기 →</button></article>:<article><small>행성 봉쇄 해제 조건</small><h4>남은 유령 {Math.max(0,roster.length-defeated.length)}종</h4><p>다른 제작이나 연구는 필요 없습니다. 지도에 남은 유령 종족을 모두 찾아 물리치면 즉시 집으로 돌아갈 수 있습니다.</p><div className="ghost-progress"><i style={{width:`${Math.round(defeated.length/Math.max(1,roster.length)*100)}%`}}/></div></article>}</section></div>
 <footer><span>유령의 원소 구성은 행성 관측 자료를 바탕으로 한 게임 설정입니다.</span><span>ESC 닫기</span></footer>
 </section></div>;
}
