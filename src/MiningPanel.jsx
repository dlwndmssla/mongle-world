import React from 'react';
import {MINE_ELEMENTS,SHIP_RECIPES,miningChance} from './mining.js';
export default function MiningPanel({body,profile,building,inventory,modules,cooldown,health,load,onMine,onCraft,onClose,notice}){
 const mine=building?.type==='광산',workshop=building?.type==='제작소';
 return <div className="research-backdrop"><section className="research-panel" role="dialog" aria-modal="true" aria-label="광산과 우주선 재료">
 <header><div><small>ELEMENT EXTRACTION / {body}</small><h2>원소에서 우주선까지</h2><p>원자번호 1–20 중 6종의 원소를 회수하고 제작소에서 우주선 부품으로 가공하세요.</p></div><button aria-label="광산 창 닫기" onClick={onClose}>×</button></header>
 <div className="research-summary"><span>현재 시설 <b>{building?.type||'탐사 현장'}</b></span><span>가방 <b>{load}/100</b></span><span>우주선 부품 <b>{modules.length}/3</b></span></div>
 <p className="research-notice" role="status">{notice||'광산은 건설 메뉴에서 지을 수 있습니다. 광산 칸에서 원하는 원소를 선택하세요.'}</p>
 <div className="research-columns"><section><h3>01 / 광산 · 원소 추출</h3><p className="mining-explanation">게임 확률: 확인 65% · 추정 2% · 미확인 0%<br/>시도당 체력 1 소모 · 성공 시 원소 1개 · 재시도 2초<br/>가스 원소는 광산의 추출 설비로 회수합니다.</p>{MINE_ELEMENTS.map(e=>{const chance=miningChance(profile,e.symbol);return <article key={e.symbol}><small>{e.use} · {chance===.65?'확인':chance===.02?'추정':'미확인'} · {Math.round(chance*100)}%</small><h4>{e.symbol} <span>{e.name}</span> <small>보유 {inventory[e.symbol]||0}</small></h4><button disabled={!mine||!chance||cooldown>0||health<=1||load>=100} onClick={()=>onMine(e.symbol)}>{!chance?'미확인 · 추출 불가':!mine?'광산 칸에서 채굴':health<=1?'체력 회복 필요':load>=100?'가방이 가득 찼습니다':cooldown?`${cooldown}초 후 재시도`:'원소 회수 시도 →'}</button></article>})}</section>
 <section><h3>02 / 우주선 부품 제작</h3>{SHIP_RECIPES.map(r=>{const done=modules.includes(r.id),enough=Object.entries(r.need).every(([k,v])=>(inventory[k]||0)>=v);return <article key={r.id} className={done?'restored':''}><small>{Object.entries(r.need).map(([k,v])=>`${k} ${inventory[k]||0}/${v}`).join(' · ')}</small><h4>{done?'✓ ':''}{r.name}</h4><p>{r.desc}</p><button disabled={done||!workshop||!enough} onClick={()=>onCraft(r.id)}>{done?'제작 완료':!workshop?'제작소 칸에서 제작':!enough?'원소 재료 부족':'부품 제작 →'}</button></article>})}<p className="mining-explanation">{modules.length===3?'귀환선의 핵심 부품 3종을 모두 확보했습니다.':'원소 분포가 다른 지역에서는 얻을 수 있는 재료가 다릅니다. 추정 원소는 드물게 회수됩니다.'}</p></section></div>
 <footer><span>※ 주기율표의 게임 데이터에 따른 확률이며 실제 함량을 뜻하지 않습니다.</span><span>ESC 닫기</span></footer>
 </section></div>;
}
