const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const overlaps=(a,b,gap=8)=>a.x<b.x+b.w+gap&&a.x+a.w+gap>b.x&&a.y<b.y+b.h+gap&&a.y+a.h+gap>b.y;
// Screen-space layout, independent of rendering, tested with clustered speakers.
export function layoutBubbles(items,width,height){
 const placed=[];
 for(const item of [...items].sort((a,b)=>a.ax-b.ax||a.id-b.id)){
  const w=item.w,h=item.h,candidates=[];
  const add=(x,y)=>candidates.push({x:clamp(x,8,width-w-8),y:clamp(y,8,height-h-8),w,h});
  if(item.previous)add(item.previous.x,item.previous.y);
  add(item.ax-w/2,item.ay-h-24);add(item.ax+22,item.ay-h/2);add(item.ax-w-22,item.ay-h/2);
  for(let y=8;y<=height-h-8;y+=12)for(let x=8;x<=width-w-8;x+=12)add(x,y);
  let best=null,score=Infinity;
  for(const c of candidates){if(placed.some(p=>overlaps(c,p)))continue;
   if(items.some(p=>p.ax>c.x-18&&p.ax<c.x+c.w+18&&p.ay>c.y-18&&p.ay<c.y+c.h+18))continue;
   const distance=Math.hypot(c.x+w/2-item.ax,c.y+h/2-item.ay);
   const motion=item.previous?Math.hypot(c.x-item.previous.x,c.y-item.previous.y):0;
   const cost=distance+motion*.35+(c.y>item.ay?15:0);
   if(cost<score){score=cost;best=c;}
  }
  if(!best){
   // Compact shelves guarantee room for all five speakers on a narrow view.
   const sorted=[...items].sort((a,b)=>a.ay-b.ay||a.ax-b.ax||a.id-b.id);
   const maxW=Math.max(...items.map(v=>v.w)),cols=Math.max(1,Math.floor((width-8)/(maxW+8)));let y=8,rowHeight=0;
   return sorted.map((v,i)=>{if(i&&i%cols===0){y+=rowHeight+8;rowHeight=0;}rowHeight=Math.max(rowHeight,v.h);return {...v,x:8+(i%cols)*(maxW+8),y};});
  }
  placed.push({...item,...best});
 }
 return placed;
}
export function pointerStart(box){
 const cx=box.x+box.w/2,cy=box.y+box.h/2,dx=box.ax-cx,dy=box.ay-cy;
 const t=1/Math.max(Math.abs(dx)/(box.w/2),Math.abs(dy)/(box.h/2),1);
 return {x:cx+dx*t,y:cy+dy*t};
}
