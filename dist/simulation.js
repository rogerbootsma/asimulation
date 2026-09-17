// Authored movement and dialogue, not neural learning or emotional inference.
export const NAMES=['Spring','Summer','Autumn','Winter','Night'];
export const OBSTACLES=[{x:-5,z:-3,r:2.1,h:1.7},{x:4,z:3,r:2.7,h:1.3},{x:6,z:-7,r:1.4,h:2.2},{x:-7,z:7,r:1.2,h:2.7},{x:-.5,z:-10,r:1,h:1}];
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
export function createSimulation(initialSeed=71){
 let seed=initialSeed>>>0,time=0;const pairs=new Map();
 const stats={greetings:0,goodbyes:0,wallRemarks:0,hardContacts:0,ow:0,recoveries:0};
 const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
 const agents=NAMES.map((name,i)=>({name,i,x:Math.cos(i*Math.PI*2/5)*12,z:Math.sin(i*Math.PI*2/5)*12,angle:i*Math.PI*2/5+Math.PI,speed:0,goal:null,clock:0,blocked:0,distance:0,curiosity:[.65,.9,.35,.75,.55][i],space:[.55,.3,.9,.65,.7][i],memory:new Map(),history:[],bubble:'',bubbleUntil:0,talkAfter:0,wallAfter:3+i*3,contactAfter:0,turnRecovery:false}));
 function clear(x,z,pad=.56){return Math.hypot(x,z)<16.4-pad&&OBSTACLES.every(o=>Math.hypot(x-o.x,z-o.z)>o.r+pad);}
 function familiar(a,x,z){const row=a.memory.get(`${Math.floor(x/3)},${Math.floor(z/3)}`);return row?row.value*Math.exp(-(time-row.t)/45):0;}
 function goal(a){let best=null,score=-Infinity;for(let k=0;k<24;k++){const theta=random()*Math.PI*2,r=3+random()*12,x=Math.cos(theta)*r,z=Math.sin(theta)*r;if(!clear(x,z,1))continue;const d=Math.hypot(x-a.x,z-a.z),s=a.curiosity*3/(1+familiar(a,x,z))+.5*random()+Math.min(d,8)*.035;if(s>score){score=s;best={x,z};}}a.goal=best||{x:0,z:8};a.clock=0;a.blocked=0;}
 function say(a,text,kind){if(time<a.talkAfter)return false;a.bubble=text;a.bubbleUntil=time+3.3;a.talkAfter=time+6;stats[kind]++;return true;}
 function dialogue(){
  for(let i=0;i<agents.length;i++)for(let j=i+1;j<agents.length;j++){
   const a=agents[i],b=agents[j],key=`${i}:${j}`,p=pairs.get(key)||{inside:false,nextEnter:0,nextExit:0};
   if(a.externalMotion||b.externalMotion)continue; const d=Math.hypot(a.x-b.x,a.z-b.z);
   if(!p.inside&&d<2.8){p.inside=true;if(time>=p.nextEnter){say(a,`Hi, ${b.name}!`,'greetings');say(b,`Hello, ${a.name}.`,'greetings');p.nextEnter=time+14;}}
   else if(p.inside&&d>3.7){p.inside=false;if(time>=p.nextExit){say(a,`See you, ${b.name}.`,'goodbyes');say(b,`Bye, ${a.name}!`,'goodbyes');p.nextExit=time+14;}}
   pairs.set(key,p);
  }
  const remarks=['Oh my God, a wall.','A little detour.','This way around.','Hello, obstacle.'];
  for(const a of agents)if(!a.externalMotion&&!(time<a.pauseUntil)&&time>=a.wallAfter&&OBSTACLES.some(o=>Math.hypot(a.x-o.x,a.z-o.z)-o.r<1.7)){
   if(say(a,remarks[Math.floor(random()*remarks.length)],'wallRemarks'))a.wallAfter=time+18+random()*12;
  }
 }
 function step(dt=.02){time+=dt;for(const a of agents){
  if(a.externalMotion||time<a.pauseUntil){a.speed=0;continue;} a.clock+=dt;if(a.mode!=='approach'&&(!a.goal||Math.hypot(a.x-a.goal.x,a.z-a.goal.z)<1.5||a.clock>15||a.blocked>1.2)){if(a.blocked>1.2)stats.recoveries++;goal(a);}
  let dx=a.goal.x-a.x,dz=a.goal.z-a.z,len=Math.hypot(dx,dz);dx/=len||1;dz/=len||1;
  let bx=0,bz=0;for(const b of agents){if(a===b)continue;const x=a.x-b.x,z=a.z-b.z,d=Math.hypot(x,z),range=1.7+a.space*3;if(d<range){bx+=x/(d||1)*(1-d/range)*1.6;bz+=z/(d||1)*(1-d/range)*1.6;}}
  const bias=Math.hypot(bx,bz);if(bias>.75){bx*=.75/bias;bz*=.75/bias;}dx+=bx;dz+=bz;
  for(const o of OBSTACLES){const ox=a.x-o.x,oz=a.z-o.z,d=Math.hypot(ox,oz),gap=d-o.r-.56;if(gap<3.4){const approach=-(dx*ox+dz*oz)/(d||1);if(approach>-.2){const side=(ox*(a.goal.z-o.z)-oz*(a.goal.x-o.x))>=0?1:-1,force=(1-clamp(gap/3.4,0,1))*2.5;dx+=ox/d*force-oz/d*side*force;dz+=oz/d*force+ox/d*side*force;}}}
  const radial=Math.hypot(a.x,a.z);if(radial>13.5){dx-=a.x/radial*(radial-13.5);dz-=a.z/radial*(radial-13.5);}
  const wanted=Math.atan2(dx,dz),error=Math.atan2(Math.sin(wanted-a.angle),Math.cos(wanted-a.angle));let clearance=8;
  for(let t=.2;t<4;t+=.2){const x=a.x+Math.sin(a.angle)*t,z=a.z+Math.cos(a.angle)*t;if(!clear(x,z,.57)||agents.some(b=>b!==a&&Math.hypot(x-b.x,z-b.z)<1.17)){clearance=t-.2;break;}}
  let target=(1.1+a.curiosity*.7)*Math.max(.28,Math.cos(Math.min(Math.abs(error),Math.PI/2)));target=Math.min(target,Math.sqrt(2*2.4*Math.max(0,clearance-.05)));
  a.speed+=clamp(target-a.speed,-2.4*dt,1.5*dt);const turn=clamp(error,-Math.max(a.speed,.24)*dt,Math.max(a.speed,.24)*dt),angle=a.angle+turn;
  const x=a.x+Math.sin(a.angle+turn/2)*a.speed*dt,z=a.z+Math.cos(a.angle+turn/2)*a.speed*dt;
  const collision=!clear(x,z,.56)||agents.some(b=>b!==a&&Math.hypot(x-b.x,z-b.z)<=1.12);
  if(!collision){a.distance+=Math.hypot(x-a.x,z-a.z);a.x=x;a.z=z;a.angle=angle;a.blocked=a.speed<.05?a.blocked+dt:0;}
  else{
   // Resolve the swept segment to its first physical contact; never penetrate.
   let lo=0,hi=1;for(let k=0;k<24;k++){const t=(lo+hi)/2,qx=a.x+(x-a.x)*t,qz=a.z+(z-a.z)*t;if(clear(qx,qz,.56)&&agents.every(b=>b===a||Math.hypot(qx-b.x,qz-b.z)>1.12))lo=t;else hi=t;}
   const mx=(x-a.x)*lo,mz=(z-a.z)*lo;a.x+=mx;a.z+=mz;a.distance+=Math.hypot(mx,mz);
   if(a.speed>.65&&time>=a.contactAfter){stats.hardContacts++;say(a,'Ow.','ow');a.contactAfter=time+10;}a.speed=0;a.blocked+=dt;
  }
  a.turnRecovery=a.blocked>.35;if(a.turnRecovery)a.angle+=clamp(error,-dt*.7,dt*.7);
  const key=`${Math.floor(a.x/3)},${Math.floor(a.z/3)}`;a.memory.set(key,{value:familiar(a,a.x,a.z)+dt,t:time});if(a.memory.size>400)a.memory.delete(a.memory.keys().next().value);
  if(Math.floor(time*10)!==Math.floor((time-dt)*10)){a.history.push({x:a.x,z:a.z});if(a.history.length>180)a.history.shift();}
 }dialogue();}
 for(const a of agents)goal(a);
 return {agents,stats,step,get time(){return time;}};
}


