import React,{useEffect,useRef,useState} from 'react';
import './player.css';
export default function PlayerSprite({pos,health,anchorRef,aboard=false}){
 const previous=useRef(pos),lastHealth=useRef(health);
 const [angle,setAngle]=useState(0),[hurt,setHurt]=useState(false);
 useEffect(()=>{const dx=pos.x-previous.current.x,dy=pos.y-previous.current.y;previous.current=pos;if(dx||dy)setAngle(Math.abs(dx)>Math.abs(dy)?(dx>0?90:270):(dy>0?180:0));},[pos]);
 useEffect(()=>{const hit=health<lastHealth.current;lastHealth.current=health;if(!hit)return;setHurt(true);const timer=setTimeout(()=>setHurt(false),400);return()=>clearTimeout(timer);},[health]);
 return <div ref={anchorRef} className={`player-marker ${hurt?'is-hurt':''}`} role="img" aria-label={aboard?'현재 위치 · 배에 탑승 중':'현재 위치 · 탐험가'} data-facing={angle} data-aboard={aboard}>
 <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 44S9 29 9 19a15 15 0 0 1 30 0c0 10-15 25-15 25z" fill={aboard?'#ddc88c':'#b0dfd1'} stroke="#102b32" strokeWidth="2.5" strokeLinejoin="round"/><circle cx="24" cy="19" r="6" fill="#18383d"/><circle cx="24" cy="19" r="2.5" fill={aboard?'#e8dbb2':'#e2f6ee'}/></svg>
 </div>;
}
