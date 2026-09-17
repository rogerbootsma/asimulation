import * as THREE from './vendor/three.module.min.js';
const canvas=document.querySelector('#world');
try {
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setClearColor(0x181e19);renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x181e19,.008);
const camera=new THREE.PerspectiveCamera(43,1,.1,150);camera.position.set(27,28,32);camera.lookAt(0,0,0);
scene.add(new THREE.HemisphereLight(0xe2ecd4,0x21251d,2.3));const sun=new THREE.DirectionalLight(0xffdfad,3.2);sun.position.set(-12,23,8);scene.add(sun);
const ground=new THREE.Mesh(new THREE.CircleGeometry(22,100),new THREE.MeshStandardMaterial({color:0x2b3329,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.07;scene.add(ground);
const grid=new THREE.GridHelper(44,44,0x58614e,0x3c4638);grid.material.transparent=true;grid.material.opacity=.3;scene.add(grid);
function ring(r,color,opacity=1){const g=new THREE.BufferGeometry().setFromPoints(Array.from({length:161},(_,i)=>new THREE.Vector3(Math.cos(i/160*Math.PI*2)*r,.015,Math.sin(i/160*Math.PI*2)*r)));return new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity}));}
scene.add(ring(17,0x8b967b,.5));scene.add(ring(17.3,0x6c775d,.22));scene.add(ring(7,0x738363,.16));
const obstacles=[{x:-5,z:-3,r:2.1,h:1.7},{x:4,z:3,r:2.7,h:1.3},{x:6,z:-7,r:1.4,h:2.2},{x:-7,z:7,r:1.2,h:2.7},{x:-.5,z:-10,r:1,h:1}];
for(const o of obstacles){const m=new THREE.Mesh(new THREE.CylinderGeometry(o.r*.91,o.r, o.h,48),new THREE.MeshStandardMaterial({color:0x46503e,roughness:.92,metalness:.08}));m.position.set(o.x,o.h/2,o.z);scene.add(m);const rim=ring(o.r*.91,0x929c7e,.4);rim.position.set(o.x,o.h+.01,o.z);scene.add(rim);}
const names=['Aster','Mica','Sora','Ivo','Neri','Vale'];let agents=[],selected=0,view='overview',paused=matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,acc=0,last=performance.now();
const bodyGeo=new THREE.SphereGeometry(.43,24,18),eyeGeo=new THREE.SphereGeometry(.09,10,8);
function makeAgent(i){const root=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:i===0?0xe8ab62:0xc6cfaf,roughness:.38,metalness:.15});const body=new THREE.Mesh(bodyGeo,material);body.scale.set(1, .8,1.25);body.position.y=.52;root.add(body);for(const x of [-.17,.17]){const eye=new THREE.Mesh(eyeGeo,new THREE.MeshBasicMaterial({color:0x141b16}));eye.position.set(x,.62,.47);root.add(eye);}const aura=ring(.78,0xe8ab62,.75);root.add(aura);scene.add(root);const trailGeo=new THREE.BufferGeometry();trailGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(180*3),3));trailGeo.setDrawRange(0,0);const trail=new THREE.Line(trailGeo,new THREE.LineBasicMaterial({color:i===0?0xe8ab62:0x92a780,transparent:true,opacity:i===0?.65:.3}));scene.add(trail);return {i,root,body,material,aura,trail,trailGeo,history:[],x:Math.cos(i*Math.PI/3)*11,z:Math.sin(i*Math.PI/3)*11,angle:i*Math.PI/3+Math.PI,speed:0,goal:null,clock:0,blocked:0,distance:0,curiosity:[.65,.9,.35,.75,.45,.8][i],space:[.55,.3,.9,.65,.7,.4][i],memory:new Map()};}
let seed=71;function random(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;}
function clear(x,z,pad=.55){return Math.hypot(x,z)<16.4-pad&&obstacles.every(o=>Math.hypot(x-o.x,z-o.z)>o.r+pad);}
function familiar(a,x,z){const row=a.memory.get(`${Math.floor(x/3)},${Math.floor(z/3)}`);return row?row.value*Math.exp(-(time-row.t)/45):0;}
function goal(a){let best=null,score=-Infinity;for(let k=0;k<24;k++){const theta=random()*Math.PI*2,r=3+random()*12,x=Math.cos(theta)*r,z=Math.sin(theta)*r;if(!clear(x,z,1))continue;const d=Math.hypot(x-a.x,z-a.z),s=a.curiosity*3/(1+familiar(a,x,z))+.5*random()+Math.min(d,8)*.035;if(s>score){score=s;best={x,z};}}a.goal=best||{x:0,z:8};a.clock=0;a.blocked=0;}
function reset(){for(const a of agents){scene.remove(a.root,a.trail);a.trailGeo.dispose();a.trail.material.dispose();a.material.dispose();}seed=71;agents=names.map((_,i)=>makeAgent(i));time=0;acc=0;for(const a of agents){goal(a);a.root.position.set(a.x,0,a.z);a.root.rotation.y=a.angle;}sync();}
const clamp=THREE.MathUtils.clamp;function step(dt){time+=dt;for(const a of agents){a.clock+=dt;if(!a.goal||Math.hypot(a.x-a.goal.x,a.z-a.goal.z)<1.5||a.clock>15||a.blocked>1.2)goal(a);
let dx=a.goal.x-a.x,dz=a.goal.z-a.z,len=Math.hypot(dx,dz);dx/=len||1;dz/=len||1;
let bx=0,bz=0;for(const b of agents){if(a===b)continue;const x=a.x-b.x,z=a.z-b.z,d=Math.hypot(x,z),range=1.7+a.space*3;if(d<range){bx+=x/(d||1)*(1-d/range)*1.6;bz+=z/(d||1)*(1-d/range)*1.6;}}
const bias=Math.hypot(bx,bz);if(bias>.75){bx*=.75/bias;bz*=.75/bias;}dx+=bx;dz+=bz;
// Local tangential routing around cylinders; browser-only alternative to Blender's mesh path planner.
for(const o of obstacles){const ox=a.x-o.x,oz=a.z-o.z,d=Math.hypot(ox,oz),gap=d-o.r-.48;if(gap<3.4){const approach=-(dx*ox+dz*oz)/(d||1);if(approach>-.2){const side=(ox*(a.goal.z-o.z)-oz*(a.goal.x-o.x))>=0?1:-1;const force=(1-clamp(gap/3.4,0,1))*2.5;dx+=ox/d*force-oz/d*side*force;dz+=oz/d*force+ox/d*side*force;}}}
const radial=Math.hypot(a.x,a.z);if(radial>13.5){dx-=a.x/radial*(radial-13.5);dz-=a.z/radial*(radial-13.5);}
const wanted=Math.atan2(dx,dz),error=Math.atan2(Math.sin(wanted-a.angle),Math.cos(wanted-a.angle));let clearance=8;
for(let t=.2;t<4;t+=.2){const x=a.x+Math.sin(a.angle)*t,z=a.z+Math.cos(a.angle)*t;if(!clear(x,z,.57)||agents.some(b=>b!==a&&Math.hypot(x-b.x,z-b.z)<1.17)){clearance=t-.2;break;}}
let target=(1.1+a.curiosity*.7)*Math.max(.28,Math.cos(Math.min(Math.abs(error),Math.PI/2)));target=Math.min(target,Math.sqrt(2*2.4*Math.max(0,clearance-.05)));
a.speed+=clamp(target-a.speed,-2.4*dt,1.5*dt);const turn=clamp(error,-Math.max(a.speed,.24)*dt,Math.max(a.speed,.24)*dt),angle=a.angle+turn;
const x=a.x+Math.sin(a.angle+turn/2)*a.speed*dt,z=a.z+Math.cos(a.angle+turn/2)*a.speed*dt;
if(clear(x,z,.56)&&agents.every(b=>b===a||Math.hypot(x-b.x,z-b.z)>1.12)){a.distance+=Math.hypot(x-a.x,z-a.z);a.x=x;a.z=z;a.angle=angle;a.blocked=a.speed<.05?a.blocked+dt:0;}else{a.speed=0;a.blocked+=dt;}
// Recovery can pivot at rest; explicitly differs from Blender's minimum-turn-radius motor.
if(a.blocked>.35)a.angle+=clamp(error,-dt*.7,dt*.7);
const key=`${Math.floor(a.x/3)},${Math.floor(a.z/3)}`;a.memory.set(key,{value:familiar(a,a.x,a.z)+dt,t:time});if(a.memory.size>400)a.memory.delete(a.memory.keys().next().value);
if(Math.floor(time*10)!==Math.floor((time-dt)*10)){a.history.push(new THREE.Vector3(a.x,.05,a.z));if(a.history.length>180)a.history.shift();const pos=a.trailGeo.attributes.position;for(let j=0;j<a.history.length;j++)pos.setXYZ(j,a.history[j].x,.05,a.history[j].z);pos.needsUpdate=true;a.trailGeo.setDrawRange(0,a.history.length);a.trailGeo.computeBoundingSphere();}
a.root.position.set(a.x,0,a.z);a.root.rotation.y=a.angle;
}}
function sync(){document.querySelector('#curiosity').value=agents[selected].curiosity*100;document.querySelector('#space').value=agents[selected].space*100;for(const key of ['curiosity','space'])document.querySelector(`#${key}-value`).textContent=Math.round(agents[selected][key]*100)+'%';for(const a of agents){a.material.color.set(a.i===selected?0xe8ab62:0xc6cfaf);a.aura.visible=a.i===selected;a.trail.material.color.set(a.i===selected?0xe8ab62:0x92a780);a.trail.material.opacity=a.i===selected?.7:.22;}document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));document.querySelector('#pause').textContent=paused?'▶ Resume':'Ⅱ Pause';document.querySelector('#pause').setAttribute('aria-label',paused?'Resume simulation':'Pause simulation');document.querySelector('#run-status').textContent=paused?'PAUSED':'RUNNING';}
document.querySelector('#agent').addEventListener('change',e=>{selected=Number(e.target.value);sync();});document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;sync();}));document.querySelector('#pause').onclick=()=>{paused=!paused;acc=0;sync();};document.querySelector('#reset').onclick=reset;for(const key of ['curiosity','space'])document.querySelector('#'+key).oninput=e=>{agents[selected][key]=Number(e.target.value)/100;sync();};
const look=new THREE.Vector3(),targetPos=new THREE.Vector3(),targetLook=new THREE.Vector3();let firstFrame=true;
function resize(){const {width,height}=canvas.parentElement.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas.parentElement);reset();resize();
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.1);last=now;if(document.hidden)return;if(!paused){acc+=dt;while(acc>=.02){step(.02);acc-=.02;}}const a=agents[selected];for(const b of agents)b.root.visible=!(view==='first'&&b===a);
if(view==='overview'){const small=camera.aspect<1.2;targetPos.set(small?32:25,small?38:29,small?38:32);targetLook.set(0,0,0);}else if(view==='follow'){targetPos.set(a.x-Math.sin(a.angle)*6,4.6,a.z-Math.cos(a.angle)*6);targetLook.set(a.x+Math.sin(a.angle)*2,.5,a.z+Math.cos(a.angle)*2);}else{targetPos.set(a.x,1.0,a.z);targetLook.set(a.x+Math.sin(a.angle)*6,.85,a.z+Math.cos(a.angle)*6);}
const ease=firstFrame?1:1-Math.exp(-dt*4);camera.position.lerp(targetPos,ease);look.lerp(targetLook,ease);camera.lookAt(look);firstFrame=false;renderer.render(scene,camera);document.querySelector('#clock').textContent='T + '+time.toFixed(1).padStart(6,'0')+' s';document.querySelector('#speed').textContent=a.speed.toFixed(2);document.querySelector('#agent-state').textContent=paused?'Paused':a.speed<.1?'Reorienting':a.speed<.65?'Navigating':'Exploring';}
requestAnimationFrame(frame);
window.habitat={snapshot:()=>({time,paused,view,selected,agents:agents.map(a=>({name:names[a.i],x:a.x,z:a.z,speed:a.speed,distance:a.distance,memory:a.memory.size,curiosity:a.curiosity,space:a.space})),obstacles}),step:(n=1)=>{for(let i=0;i<n;i++)step(.02);},reset};
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;document.querySelector('#fallback').hidden=false;document.querySelector('#fallback').textContent='The graphics context was interrupted. Reload this page to restart the habitat.';sync();});
}catch(error){document.querySelector('#fallback').hidden=false;document.querySelector('#run-status').textContent='3D UNAVAILABLE';document.querySelectorAll('.controls button,.controls select,.tuning input').forEach(e=>e.disabled=true);console.error(error);}



