// Authored excursions and conversations layered over the planar steering study.
import {createSimulation as createBase,OBSTACLES} from './simulation.js?v=social-slopes-1';
import {classifySlope,slopeInterest,surfaceHeight,RAMP_SURFACE} from './affordances.js';
export const RAMP={start:11.5,end:6,x:4,z:3,h:1.3,width:1.8};
const UP=['Have I left Flatland?','Am I a three-dimensional creature now?','Am I evolving, or just going uphill?','Is this enlightenment? The view helps.','A higher plane! Same old questions.','My personal growth has a vertical axis.','I have transcended the floor. Temporarily.','Perspective: now with altitude.'];
const DOWN=['Back in Flatland. Oh well, this is life.','Enlightenment had a gravity clause.','Let’s explore my shadow side. It’s down here.','Grounded again. My therapist would approve.','That was a leap of faith. With coordinates.','Back to reality. Or its simulation.','Spiritual elevation: temporary. Curiosity: ongoing.','I have integrated my higher self. Into the floor.'];
const CHATS=[['Is this enlightenment, or good lighting?','Let’s not confuse brightness with insight.'],['Have you explored your shadow side?','Yes. It follows me everywhere.'],['Do you think we are evolving?','I’m trying a new direction. Small steps.'],['What is the meaning of this place?','Perhaps we should walk around the question.'],['I’m working on my boundaries.','Excellent. I’ll give you some space.'],['Are we more than our coordinates?','I hope so. Mine keep changing.'],['I think I have reached a higher plane.','Was there a ramp?'],['My unconscious wants to explore.','Mine would like fewer walls.']];
export function createSimulation(seed=71){
 const base=createBase(seed);let rng=(seed^0xabcdef)>>>0,owner=null,nextVisit=4;
 const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 const pick=x=>x[Math.floor(random()*x.length)];
 const stats={ascents:0,landings:0,conversations:0,dwellTimes:[],visitors:[],memoryGreetings:0,witnesses:0,reactions:0};
 const chats=[],pending=[];const slope=classifySlope(RAMP_SURFACE);
 for(const a of base.agents)Object.assign(a,{y:0,mode:'ground',pauseUntil:0,visitAfter:0,chatAfter:12,externalMotion:false,rampInterest:0,recognizedSurface:null,encounters:new Map(),seenJumps:new Map(),watchUntil:0,watchTarget:null,gesture:'none',gestureStart:0,gestureUntil:0});
 function say(a,text,gesture=text.includes('?')?'tilt':'nod'){a.bubble=text;a.bubbleUntil=base.time+5;a.talkAfter=base.time+6;a.gesture=gesture;a.gestureStart=base.time;a.gestureUntil=base.time+2.5;}
 function history(a){a.history.push({x:a.x,y:a.y,z:a.z});if(a.history.length>180)a.history.shift();}
 function move(a,x,y,z,dt){const distance=Math.hypot(a.x-x,a.y-y,a.z-z);a.angle=Math.atan2(x-a.x,z-a.z);a.x=x;a.y=y;a.z=z;a.speed=distance/dt;a.distance+=distance;}
 function free(x,z,except,pad=1.3){return base.agents.every(b=>b===except||Math.hypot(x-b.x,z-b.z)>pad);}
 function step(dt=.02){
  for(const a of base.agents){
   a.rampInterest+=(slopeInterest(a,slope)-a.rampInterest)*(1-Math.exp(-dt*2));
   a.recognizedSurface=a.rampInterest>.08?slope?.kind:null;
   for(const memory of [a.encounters,a.seenJumps])for(const [id,t] of memory)if(base.time-t>90)memory.delete(id);
   if(base.time<a.watchUntil){const target=base.agents[a.watchTarget];const desired=Math.atan2(target.x-a.x,target.z-a.z),error=Math.atan2(Math.sin(desired-a.angle),Math.cos(desired-a.angle));a.angle+=Math.max(-dt*2,Math.min(dt*2,error));}
  }
  for(let i=pending.length-1;i>=0;i--){const event=pending[i];if(base.time>=event.at){if(event.agent.mode==='ground'&&base.time>=event.agent.talkAfter&&base.time>=event.agent.pauseUntil){say(event.agent,event.text,event.gesture);stats.reactions++;}pending.splice(i,1);}}
  // Reserve a single excursion lane. Other agents remain on the ground.
  if(!owner&&base.time>=nextVisit){const eligible=base.agents.filter(a=>a.mode==='ground'&&a.rampInterest>.22&&base.time>=a.visitAfter&&base.time>=a.pauseUntil).sort((a,b)=>b.rampInterest-a.rampInterest);
   if(eligible.length){owner=eligible[0];owner.mode='approach';owner.phase=0;if(base.time>=owner.talkAfter)say(owner,pick(['That slope starts at the ground. I can climb it.','A ramp! A practical path to a higher plane.','An incline, not a wall. Let’s investigate.']),'tilt');}}
  if(owner?.mode==='approach'){
   owner.phase+=dt;owner.goal={...slope.entry};owner.clock=0;owner.blocked=0;
   if(Math.hypot(owner.x-12.3,owner.z-3)<.8&&free(12.3,3,owner,2)){
    owner.mode='boarding';owner.externalMotion=true;owner.from={x:owner.x,z:owner.z};owner.phase=0;
   }else if(owner.phase>45){owner.mode='ground';owner.visitAfter=base.time+15;owner=null;nextVisit=base.time+2;}
  }
  for(const a of base.agents)if(!a.externalMotion&&owner&&owner.mode!=='approach'&&Math.hypot(a.x,a.z-3)<3){a.pauseUntil=0;a.goal={x:-5,z:a.z>=3?7:-1};a.clock=0;}
  const before=base.agents.map(a=>({x:a.x,z:a.z,distance:a.distance}));
  base.step(dt);
  // Ground agents cannot pass through the solid ramp or occupied landing zone.
  for(const a of base.agents){if(a.externalMotion)continue;
   const onRamp=a.x>6&&a.x<12.05&&Math.abs(a.z-3)<1.48;
   const landingReserved=owner&&owner.mode!=='approach'&&Math.hypot(a.x, a.z-3)<2.2&&Math.hypot(a.x,a.z-3)<Math.hypot(before[a.i].x,before[a.i].z-3);
   if(onRamp||landingReserved){a.x=before[a.i].x;a.z=before[a.i].z;a.distance=before[a.i].distance;a.speed=0;a.angle+=dt*1.8;a.blocked+=dt;a.goal={x:a.x,z:a.z+(a.z>=3?4:-4)};if(a.history.length)Object.assign(a.history[a.history.length-1],{x:a.x,y:0,z:a.z});}
  }
  if(owner?.externalMotion){const a=owner;a.phase+=dt;const p=a.phase;
   if(a.mode==='boarding'){
    const t=Math.min(p/1.5,1);move(a,a.from.x+(12.3-a.from.x)*t,0,a.from.z+(3-a.from.z)*t,dt);
    if(t===1){a.mode='climbing';a.phase=0;}
   }else if(a.mode==='climbing'){
    const t=Math.min(p/7,1),x=12.3-7*t;move(a,x,surfaceHeight(x,3,slope),3,dt);
    if(t===1){a.mode='platform';a.phase=0;a.arrived=base.time;a.dwell=10+20*(a.curiosity*.6+random()*.4);stats.ascents++;stats.visitors.push(a.name);say(a,pick(UP));}
   }else if(a.mode==='platform'){
    const theta=p*.5;move(a,4+1.3*Math.cos(theta),1.3,3+1.3*Math.sin(theta),dt);
    if(p>=a.dwell-2){a.mode='edge';a.phase=0;a.from={x:a.x,z:a.z};}
   }else if(a.mode==='edge'){
    const t=Math.min(p/2,1);move(a,a.from.x+(2.2-a.from.x)*t,1.3,a.from.z+(3-a.from.z)*t,dt);
    if(t===1&&free(0,3,a,1.8)){stats.dwellTimes.push(base.time-a.arrived);a.mode='jumping';a.phase=0;
     const watcher=base.agents.filter(b=>b!==a&&b.mode==='ground'&&base.time>=b.pauseUntil&&base.time>=b.chatAfter&&Math.hypot(b.x,b.z-3)>3&&Math.hypot(b.x-a.x,b.z-a.z)<9).sort((b,c)=>Math.hypot(b.x-a.x,b.z-a.z)-Math.hypot(c.x-a.x,c.z-a.z))[0];
     if(watcher){watcher.pauseUntil=base.time+3;watcher.watchUntil=base.time+3;watcher.watchTarget=a.i;watcher.chatAfter=base.time+18;watcher.seenJumps.set(a.i,base.time);stats.witnesses++;pending.push({agent:watcher,at:base.time+4.5,text:pick([`${a.name}, gravity seems to like you.`,`A leap of faith, ${a.name}. With a landing.`,`${a.name}, was that personal growth or exercise?`]),gesture:'tilt'});pending.push({agent:a,at:base.time+8.5,text:pick(['I prefer to call it applied philosophy.','My higher self needed a change of scenery.','Gravity keeps me humble.'] ),gesture:'bounce'});}
    }
   }else if(a.mode==='jumping'){
    const t=Math.min(p/1.25,1);move(a,2.2*(1-t),1.3*(1-t)+2*4*t*(1-t),3,dt);
    if(t===1){a.y=0;a.externalMotion=false;a.mode='ground';a.visitAfter=base.time+55;a.goal={x:-3,z:4};a.clock=0;a.blocked=0;stats.landings++;say(a,pick(DOWN));owner=null;nextVisit=base.time+4;}
   }
   if(Math.floor(base.time*10)!==Math.floor((base.time-dt)*10))history(a);
  }
  for(const c of chats){const elapsed=base.time-c.start;
   if(Math.hypot(c.a.x-c.b.x,c.a.z-c.b.z)>3.7){c.asked=c.replied=true;c.a.pauseUntil=c.b.pauseUntil=0;continue;}
   if(elapsed>=3.6&&!c.asked){say(c.a,c.lines[0]);c.asked=true;}
   if(elapsed>=7.3&&!c.replied){say(c.b,c.lines[1]);c.replied=true;stats.conversations++;}
  }
  for(let i=chats.length-1;i>=0;i--)if(base.time-chats[i].start>12.5)chats.splice(i,1);
  for(let i=0;i<base.agents.length;i++)for(let j=i+1;j<base.agents.length;j++){
   const a=base.agents[i],b=base.agents[j],d=Math.hypot(a.x-b.x,a.z-b.z);
   if(a.mode==='ground'&&b.mode==='ground'&&d>1.3&&d<2.8&&base.time>=a.chatAfter&&base.time>=b.chatAfter&&base.time>=a.pauseUntil&&base.time>=b.pauseUntil){
    a.pauseUntil=b.pauseUntil=base.time+12.5;a.chatAfter=b.chatAfter=base.time+45;a.speed=b.speed=0;
    a.angle=Math.atan2(b.x-a.x,b.z-a.z);b.angle=a.angle+Math.PI;
    const remembered=a.encounters.has(b.i),sawJump=a.seenJumps.has(b.i);
    say(a,sawJump?`${b.name}, still feeling enlightened after that jump?`:remembered?`You again, ${b.name}! Where were we?`:pick([`Hello, ${b.name}. A thought?`,`Hey, ${b.name}! Fancy a pause?`,`Greetings, ${b.name}, fellow explorer.`]));say(b,remembered?`Good to see you again, ${a.name}.`:pick([`Hello, ${a.name}. I’m listening.`,`Of course, ${a.name}.`,`What’s on your mind, ${a.name}?`]));if(remembered||sawJump)stats.memoryGreetings++;
    a.encounters.set(b.i,base.time);b.encounters.set(a.i,base.time);chats.push({a,b,start:base.time,lines:pick(CHATS)});
   }
  }
 }
 return {agents:base.agents,stats,baseStats:base.stats,step,get time(){return base.time;}};
}
