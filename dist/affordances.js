// Analytic surface affordances, not image-based recognition or learned semantics.
export function classifySlope(surface,{bodyWidth=1.12,maxAngle=35,ground=0}={}){
 const {low,high,width}=surface;
 if(!low||!high||![...low,...high,width].every(Number.isFinite)||low.length!==3||high.length!==3)return null;
 const run=Math.hypot(high[0]-low[0],high[2]-low[2]),rise=high[1]-low[1],angle=Math.atan2(rise,run)*180/Math.PI;
 if(Math.abs(low[1]-ground)>.08||rise<=.08||run<.1||angle>maxAngle||width<bodyWidth+.2)return null;
 const ux=(high[0]-low[0])/run,uz=(high[2]-low[2])/run;
 return {kind:'climbable slope',angle,low,high,width,run,entry:{x:low[0]-.8*ux,z:low[2]-.8*uz}};
}
export function slopeInterest(agent,slope){
 if(!slope)return 0;
 const dx=slope.high[0]-slope.low[0],dz=slope.high[2]-slope.low[2];
 const t=Math.max(0,Math.min(1,((agent.x-slope.low[0])*dx+(agent.z-slope.low[2])*dz)/(dx*dx+dz*dz)));
 const distance=Math.max(0,Math.hypot(agent.x-slope.low[0]-dx*t,agent.z-slope.low[2]-dz*t)-slope.width/2);
 const proximity=Math.max(0,1-distance/12);
 return proximity*proximity*(.65+.35*agent.curiosity);
}
export const RAMP_SURFACE={low:[11.5,0,3],high:[6,1.3,3],width:1.8};
export function surfaceHeight(x,z,slope){
 const dx=slope.high[0]-slope.low[0],dz=slope.high[2]-slope.low[2];
 const t=Math.max(0,Math.min(1,((x-slope.low[0])*dx+(z-slope.low[2])*dz)/(dx*dx+dz*dz)));
 return slope.low[1]+t*(slope.high[1]-slope.low[1]);
}
