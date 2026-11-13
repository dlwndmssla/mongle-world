export function movementDelay(tile,aboard=false){return aboard?320:tile?.type==='mountain'?480:tile?.type==='forest'?360:280;}
export function cameraView(pos,width,height,previous){
 const tile=Math.max(9,Math.min(15,width/58)),cols=Math.ceil(width/tile)+4,rows=Math.ceil(height/tile)+4;
 let startX=previous?.width===width?previous.startX:Math.floor(pos.x-cols/2);
 let startY=previous?.height===height?previous.startY:Math.floor(pos.y-rows*(width<=760?.36:.5));
 const px=(pos.x-startX-1)*tile+tile/2,py=(pos.y-startY-1)*tile+tile/2;
 if(px<width*.25)startX-=Math.ceil((width*.25-px)/tile);
 if(px>width*.75)startX+=Math.ceil((px-width*.75)/tile);
 if(py<height*.25)startY-=Math.ceil((height*.25-py)/tile);
 if(py>height*.7)startY+=Math.ceil((py-height*.7)/tile);
 return {width,height,tile,cols,rows,startX,startY,playerX:(pos.x-startX-1)*tile+tile/2,playerY:(pos.y-startY-1)*tile+tile/2};
}
