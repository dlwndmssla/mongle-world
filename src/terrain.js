const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
export function createTerrainSampler(body,w,h){
  const seed=[...body].reduce((a,c)=>a*31+c.charCodeAt(0),17)%100003;
  const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7+seed)*43758.5453;return n-Math.floor(n);};
  const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),u=smooth(x-ix),v=smooth(y-iy);return lerp(lerp(hash(ix,iy),hash(ix+1,iy),u),lerp(hash(ix,iy+1),hash(ix+1,iy+1),u),v);};
  return (x,y)=>{
    if(x<0||y<0||x>=w||y>=h)return undefined;
    const u=x/w,v=y/h;
    const wx=u+(noise(u*4+31,v*4)-.5)*.15,wy=v+(noise(u*4,v*4+51)-.5)*.15;
    const continent=noise(wx*3.3,wy*3.3)*.6+noise(wx*7.2+18,wy*7.2)*.27+noise(wx*16,wy*16+22)*.13;
    // A broad starting peninsula joins the regional terrain without a circular coastline.
    const center=Math.exp(-(((u-.5)/.16)**2+((v-.5)/.21)**2))* .22;
    const edge=Math.max(Math.abs(u-.5)*2,Math.abs(v-.5)*2);
    const spawn=Math.max(0,1-Math.hypot((x-Math.floor(w/2))/Math.max(3,w*.09),(y-Math.floor(h/2))/Math.max(3,h*.12)));
    const naturalElevation=continent+center-Math.max(0,edge-.8)*.6;
    const elevation=spawn>0?Math.max(naturalElevation,.46+spawn*.18):naturalElevation;
    const coast=.48;
    const grain=noise(x/9+70,y/9),detail=noise(x/28,y/28+72);
    if(elevation<coast)return {type:'sea',depth:elevation<coast-.065?'deep':'coast',elevation,shade:grain};
    const ridge=1-Math.abs(noise(wx*11+77,wy*11+20)*2-1);
    const moisture=noise(wx*9+200,wy*9+55);
    const barren=body!=='지구'&&body!=='타이탄';
    const resource=hash(x,y)>.982&&detail>.42;
    return {type:resource?'resource':!barren&&moisture>.57?'forest':'land',depth:'land',elevation,shade:grain,beach:elevation<coast+.019};
  };
}
