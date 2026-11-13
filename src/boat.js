export const adjacentTiles=(world,pos)=>[[1,0],[0,1],[-1,0],[0,-1]].map(([dx,dy])=>({x:pos.x+dx,y:pos.y+dy})).filter(p=>world[p.y]?.[p.x]);
export const canTravel=(aboard,tile)=>aboard?tile?.type==='sea':!!tile&&tile.type!=='sea';
export function boardingDestination(world,pos,boatPos,aboard){
 if(!boatPos)return null;
 if(aboard)return adjacentTiles(world,pos).find(p=>world[p.y][p.x].type!=='sea')||null;
 return Math.abs(pos.x-boatPos.x)+Math.abs(pos.y-boatPos.y)<=1?boatPos:null;
}
