import {MINE_ELEMENTS} from './mining.js';
export function createDepositSampler(body,profile){
 const seed=[...body].reduce((n,c)=>n+c.charCodeAt(0),37);
 const hash=(x,y,s=0)=>{const n=Math.sin(x*127.1+y*311.7+seed+s*71.3)*43758.5453;return n-Math.floor(n);};
 const eligible=MINE_ELEMENTS.filter(e=>profile?.confirmed?.includes(e.symbol)||profile?.inferred?.includes(e.symbol));
 return (x,y)=>{
  if(!eligible.length)return null;
  const gx=Math.floor(x/24),gy=Math.floor(y/24);
  for(let yy=gy-1;yy<=gy+1;yy++)for(let xx=gx-1;xx<=gx+1;xx++){
   const element=eligible[Math.floor(hash(xx,yy,1)*eligible.length)],confirmed=profile.confirmed.includes(element.symbol);
   if(hash(xx,yy,2)>=(confirmed?.65:.02))continue;
   const cx=xx*24+5+hash(xx,yy,3)*14,cy=yy*24+5+hash(xx,yy,4)*14;
   const rx=3+hash(xx,yy,5)*4,ry=3+hash(xx,yy,6)*4;
   if(((x-cx)/rx)**2+((y-cy)/ry)**2<1+Math.sin(x*.8+y*.5)*.12)return element.symbol;
  }
  return null;
 };
}
