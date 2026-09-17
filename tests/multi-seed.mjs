import {createSimulation,OBSTACLES} from '../dist/simulation.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const reports=[];let minPeer=Infinity,minObstacle=Infinity,minWindow=Infinity,maxIdle=0;
for(const seed of [1,2,3,7,11,19,31,47,71,97,123,256,512,1024,2026,65535,99999,314159,1234567,4294967295]){
 const sim=createSimulation(seed),idle=[0,0,0,0];let prev=sim.agents.map(a=>a.distance);
 for(let tick=0;tick<15000;tick++){
  sim.step();for(const a of sim.agents){assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.z));assert.ok(Math.hypot(a.x,a.z)<=15.841);assert.ok(a.memory.size<=400);idle[a.i]=a.speed<.05?idle[a.i]+.02:0;maxIdle=Math.max(maxIdle,idle[a.i]);for(const o of OBSTACLES){const d=Math.hypot(a.x-o.x,a.z-o.z)-o.r;minObstacle=Math.min(minObstacle,d);assert.ok(d>=.56-1e-7);}for(const b of sim.agents.slice(a.i+1)){const d=Math.hypot(a.x-b.x,a.z-b.z);minPeer=Math.min(minPeer,d);assert.ok(d>=1.12-1e-7);}}
  if((tick+1)%1500===0){for(const a of sim.agents){const moved=a.distance-prev[a.i];minWindow=Math.min(minWindow,moved);assert.ok(moved>3,`seed ${seed}: ${a.name} traveled only ${moved} in 30s`);prev[a.i]=a.distance;}}
 }
 assert.ok(sim.stats.ow<=sim.stats.hardContacts);reports.push({seed,travel:sim.agents.map(a=>Math.round(a.distance)),stats:sim.stats});
}
// Real body-contact fixture: incoming momentum reaches a cylinder boundary.
const hit=createSimulation(71),a=hit.agents[0],o=OBSTACLES[0];Object.assign(a,{x:o.x-o.r-.57,z:o.z,angle:Math.PI/2,speed:2,goal:{x:o.x+8,z:o.z},clock:0});hit.step();assert.equal(hit.stats.hardContacts,1);assert.equal(hit.stats.ow,1);assert.equal(a.bubble,'Ow.');assert.ok(Math.abs(Math.hypot(a.x-o.x,a.z-o.z)-o.r-.56)<1e-6);
// Recovery from near contact must release and move on.
const distanceAtHit=a.distance;for(let k=0;k<1500;k++)hit.step();assert.ok(a.distance-distanceAtHit>3,'Contact recovery must regain locomotion');
// Proximity fixtures: sustained proximity and threshold jitter do not spam.
const chat=createSimulation(91);
function pin(d){Object.assign(chat.agents[0],{x:-11,z:0,speed:0,goal:{x:-11,z:8}});Object.assign(chat.agents[1],{x:-11+d,z:0,speed:0,goal:{x:-11+d,z:8}});Object.assign(chat.agents[2],{x:0,z:13,speed:0});Object.assign(chat.agents[3],{x:12,z:0,speed:0});chat.step();}
pin(2.5);assert.equal(chat.stats.greetings,2);for(let i=0;i<350;i++)pin(i%2?2.79:2.81);assert.equal(chat.stats.greetings,2);assert.equal(chat.stats.goodbyes,0);assert.equal(chat.stats.ow,0);pin(4);assert.equal(chat.stats.goodbyes,2);for(let i=0;i<50;i++)pin(i%2?2.5:4);assert.equal(chat.stats.greetings,2,'Pair cooldown suppresses rapid reentry');
const s1=createSimulation(71),s2=createSimulation(71);for(let i=0;i<500;i++){s1.step();s2.step();}assert.deepEqual(s1.agents.map(a=>[a.x,a.z]),s2.agents.map(a=>[a.x,a.z]));
const out={seeds:reports.length,secondsPerSeed:300,minPeer,minObstacle,minDistancePer30Seconds:minWindow,maxIdleSeconds:maxIdle,contactFixture:'passed: first-contact position, speed threshold, Ow, recovery',proximityFixture:'passed: greeting names, hysteresis, pair cooldown, no false Ow',reports};await fs.writeFile(new URL('multi-seed-result.json',import.meta.url),JSON.stringify(out,null,2));console.log(JSON.stringify({...out,reports:undefined},null,2));
