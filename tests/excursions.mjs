import assert from 'node:assert/strict';
import {createSimulation} from '../dist/encounters.js';
const reports=[];
for(const seed of [1,7,19,71,123,2026,99999,314159]){
 const s=createSimulation(seed);let maxY=0,maxStep=0,minPeer=Infinity;const states=new Set();let previous=s.agents.map(a=>({...a}));
 for(let tick=0;tick<30000;tick++){
  s.step();for(const a of s.agents){
   assert.ok([a.x,a.y,a.z,a.speed].every(Number.isFinite));assert.ok(a.y>=0&&a.y<4);assert.ok(Math.hypot(a.x,a.z)<16.5);maxY=Math.max(maxY,a.y);states.add(a.mode);
   const d=Math.hypot(a.x-previous[a.i].x,a.y-previous[a.i].y,a.z-previous[a.i].z);maxStep=Math.max(maxStep,d);assert.ok(d<.3,`teleport ${seed} ${a.mode} ${d}`);
   if(a.mode==='ground')assert.equal(a.y,0);
   for(const b of s.agents.slice(a.i+1)){const gap=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);minPeer=Math.min(minPeer,gap);assert.ok(gap>=1.12-1e-7,`overlap ${seed} ${gap}`);}
  }previous=s.agents.map(a=>({...a}));
 }
 assert.ok(s.stats.landings>=3,`seed ${seed}: too few visits ${JSON.stringify(s.stats)}`);assert.ok(s.stats.conversations>0);assert.ok(maxY>2);assert.ok(s.stats.dwellTimes.every(t=>t>=10&&t<=30));
 assert.ok(s.stats.memoryGreetings>0,'recent encounters affect greetings');assert.ok(s.stats.witnesses>0&&s.stats.reactions>0,'jumps attract spectators and reactions');
 for(const state of ['boarding','climbing','platform','edge','jumping','ground'])assert.ok(states.has(state));
 reports.push({seed,...s.stats,maxY,maxStep,minPeer});
}
// A conversation is stationary, uses two timed turns, and releases both agents.
const chat=createSimulation(71),a=chat.agents[0],b=chat.agents[1];
Object.assign(a,{x:-11,z:0,chatAfter:0});Object.assign(b,{x:-9,z:0,chatAfter:0});chat.step();
const position=[a.x,a.z,b.x,b.z],greeting=a.bubble;
for(let i=0;i<200;i++)chat.step();assert.deepEqual([a.x,a.z,b.x,b.z],position);assert.notEqual(a.bubble,greeting);
for(let i=0;i<200;i++)chat.step();assert.equal(chat.stats.conversations,1);assert.ok(b.bubble.length>5);
for(let i=0;i<250;i++)chat.step();assert.ok(chat.time>a.pauseUntil);assert.ok(chat.time<b.chatAfter);
const one=createSimulation(19),two=createSimulation(19);for(let i=0;i<5000;i++){one.step();two.step();}assert.deepEqual(one.agents,two.agents);
const expiry=createSimulation(5);for(const a of expiry.agents){a.mode='fixture';a.externalMotion=true;}expiry.agents[0].encounters.set(1,0);expiry.agents[0].seenJumps.set(2,0);
for(let i=0;i<4400;i++)expiry.step();assert.equal(expiry.agents[0].encounters.size,1);
for(let i=0;i<110;i++)expiry.step();assert.equal(expiry.agents[0].encounters.size,0);assert.equal(expiry.agents[0].seenJumps.size,0);
console.log(JSON.stringify(reports,null,2));
