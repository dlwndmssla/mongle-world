// Place discoveries on the starting landmass; every route is walkable.
export function createExpeditionSites(world, start) {
  const queue=[{...start,d:0}],seen=new Set([`${start.x},${start.y}`]);
  for(let i=0;i<queue.length && queue.length<6000;i++){
    const p=queue[i]; if(p.d>=36) continue;
    for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
      const x=p.x+dx,y=p.y+dy,key=`${x},${y}`;
      if(seen.has(key)||!world[y]?.[x]||world[y][x].type==='sea') continue;
      seen.add(key);queue.push({x,y,d:p.d+1});
    }
  }
  const chosen=new Set();
  return [
    {id:'wreck',name:'추락한 조사선',distance:8,desc:'함선 잔해 아래에서 블랙박스와 설계 기록을 회수했습니다.',data:2,structure:3,circuit:2},
    {id:'observatory',name:'멈춰 선 관측소',distance:18,desc:'관측소의 예비 전원을 연결했습니다. 항해 기록과 다음 신호를 확보했습니다.',data:3,structure:3,circuit:3},
    {id:'greenhouse',name:'버려진 생존 온실',distance:28,desc:'밀폐 보관함에서 식량 4개와 남겨진 기록을 발견했습니다.',data:1,structure:2,circuit:1},
  ].map(site=>{
    const candidates=queue.filter(p=>!chosen.has(`${p.x},${p.y}`)&&p.d>0);
    candidates.sort((a,b)=>Math.abs(a.d-site.distance)-Math.abs(b.d-site.distance));
    const p=candidates[0]||start;chosen.add(`${p.x},${p.y}`);
    return {...site,x:p.x,y:p.y};
  });
}
export function signalDirection(pos,target){
  const dx=target.x-pos.x,dy=target.y-pos.y;
  return `${dy<0?'북':dy>0?'남':''}${dx<0?'서':dx>0?'동':''}`||'현재 위치';
}
