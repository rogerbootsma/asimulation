import assert from 'node:assert/strict';
import {layoutBubbles,overlaps,pointerStart} from '../dist/bubble-layout.js';
let count=0;
for(const [width,height] of [[322,390],[345,390],[700,520],[1300,610]]){
 let previous=[];
 for(let frame=0;frame<200;frame++){
  const items=Array.from({length:5},(_,id)=>({id,ax:width/2+Math.sin(frame*.05+id)*25,ay:height/2+Math.cos(frame*.08+id)*12,w:width<400?145:180,h:45+(id%3)*15,previous:previous.find(p=>p.id===id)}));
  const boxes=layoutBubbles(items,width,height);assert.equal(boxes.length,5);
  for(let i=0;i<boxes.length;i++){const b=boxes[i];assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=width&&b.y+b.h<=height);const p=pointerStart(b);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));for(const other of boxes.slice(i+1))assert.ok(!overlaps(b,other,0));}
  previous=boxes;count++;
 }
}
console.log(`Passed ${count} clustered five-speaker layouts, bounds and pointer origins.`);
