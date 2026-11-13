export const saveKey=body=>`mongle-expedition-v5-${body}`;
export function readExpedition(storage,body,width,height){
 try{const s=JSON.parse(storage.getItem(saveKey(body)));if(!s||s.version!==5||s.body!==body||!Number.isInteger(s.pos?.x)||!Number.isInteger(s.pos?.y)||s.pos.x<0||s.pos.y<0||s.pos.x>=width||s.pos.y>=height||!Number.isInteger(s.day)||s.day<1||!Array.isArray(s.technologies))return null;return s;}catch{return null;}
}
export function writeExpedition(storage,body,state){
 const s={...state,version:5,body,buildings:[...state.buildings],pins:[...state.pins],revealed:[...state.revealed],visited:[...state.visited],overrides:[...state.overrides]};
 try{storage.setItem(saveKey(body),JSON.stringify(s));return true;}catch{return false;}
}
