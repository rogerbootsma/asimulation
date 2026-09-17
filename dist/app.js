import * as THREE from './vendor/three.module.min.js';
import {OBSTACLES} from './simulation.js';
import {createSimulation,RAMP} from './encounters.js';
const canvas=document.querySelector('#world');
try {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setClearColor(0x181e19);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x181e19,.008);
 const camera=new THREE.PerspectiveCamera(43,1,.1,150);camera.position.set(27,28,32);
 scene.add(new THREE.HemisphereLight(0xe2ecd4,0x21251d,2.3));const sun=new THREE.DirectionalLight(0xffdfad,3.2);sun.position.set(-12,23,8);scene.add(sun);
 const ground=new THREE.Mesh(new THREE.CircleGeometry(22,100),new THREE.MeshStandardMaterial({color:0x2b3329,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.07;scene.add(ground);
 const grid=new THREE.GridHelper(44,44,0x58614e,0x3c4638);grid.material.transparent=true;grid.material.opacity=.3;scene.add(grid);
 function ring(r,color,opacity=1){const g=new THREE.BufferGeometry().setFromPoints(Array.from({length:161},(_,i)=>new THREE.Vector3(Math.cos(i/160*Math.PI*2)*r,.015,Math.sin(i/160*Math.PI*2)*r)));return new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity}));}
 scene.add(ring(17,0x8b967b,.5));scene.add(ring(17.3,0x6c775d,.22));scene.add(ring(7,0x738363,.16));
 for(const o of OBSTACLES){const m=new THREE.Mesh(new THREE.CylinderGeometry(o.r*.91,o.r,o.h,48),new THREE.MeshStandardMaterial({color:0x46503e,roughness:.92,metalness:.08}));m.position.set(o.x,o.h/2,o.z);scene.add(m);const rim=ring(o.r*.91,0x929c7e,.4);rim.position.set(o.x,o.h+.01,o.z);scene.add(rim);}
 const rampGeo=new THREE.BufferGeometry();
 const v=[11.5,0,2.1,11.5,0,3.9,6,1.3,3.9, 11.5,0,2.1,6,1.3,3.9,6,1.3,2.1, 11.5,0,2.1,6,1.3,2.1,6,0,2.1, 11.5,0,3.9,6,0,3.9,6,1.3,3.9];
 rampGeo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));rampGeo.computeVertexNormals();scene.add(new THREE.Mesh(rampGeo,new THREE.MeshStandardMaterial({color:0x8b7955,roughness:.85,side:THREE.DoubleSide})));
 const rampEdges=new THREE.LineSegments(new THREE.EdgesGeometry(rampGeo),new THREE.LineBasicMaterial({color:0xd1b781,transparent:true,opacity:.55}));scene.add(rampEdges);
 const sim=createSimulation(71),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let selected=0,view='overview',yaw=.66,elevation=.61,last=performance.now(),acc=0,firstFrame=true;
 const colors=[0xb9cfa0,0xe8c16b,0xce8d5c,0xb5c8d4],visuals=[];
 const bodyGeo=new THREE.SphereGeometry(.43,24,18),eyeGeo=new THREE.SphereGeometry(.09,10,8);
 for(const a of sim.agents){const root=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:colors[a.i],roughness:.38,metalness:.15});const body=new THREE.Mesh(bodyGeo,material);body.scale.set(1,.8,1.25);body.position.y=.52;root.add(body);for(const x of [-.17,.17]){const eye=new THREE.Mesh(eyeGeo,new THREE.MeshBasicMaterial({color:0x141b16}));eye.position.set(x,.62,.47);root.add(eye);}const aura=ring(.78,0xe8ab62,.75);root.add(aura);root.position.set(a.x,0,a.z);root.rotation.y=a.angle;scene.add(root);
  const trailGeo=new THREE.BufferGeometry();trailGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(180*3),3));trailGeo.setDrawRange(0,0);const trail=new THREE.Line(trailGeo,new THREE.LineBasicMaterial({color:colors[a.i],transparent:true,opacity:.3}));scene.add(trail);
  const bubble=document.createElement('div');bubble.className='agent-bubble';bubble.hidden=true;document.querySelector('#bubbles').append(bubble);visuals.push({root,aura,trail,trailGeo,bubble});
 }
 function sync(){visuals.forEach((v,i)=>{v.aura.visible=i===selected;v.trail.material.opacity=i===selected?.65:.22;});document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));document.querySelector('#observed-name').textContent=`Agent ${selected+1} · ${sim.agents[selected].name}`;document.querySelector('#run-status').textContent=reduced?'STILL VIEW':'RUNNING';document.querySelector('#motion-note').hidden=!reduced;}
 document.querySelector('#agent').addEventListener('change',e=>{selected=Number(e.target.value);sync();});document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;sync();}));
 for(const [id,delta] of [['camera-left',-.28],['camera-right',.28]])document.querySelector('#'+id).onclick=()=>{view='overview';yaw+=delta;sync();};
 document.querySelector('#camera-angle').oninput=e=>{elevation=Number(e.target.value)/100;view='overview';sync();};
 const look=new THREE.Vector3(),targetPos=new THREE.Vector3(),targetLook=new THREE.Vector3(),labelPos=new THREE.Vector3();
 function resize(){const {width,height}=canvas.parentElement.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas.parentElement);resize();sync();
 function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.1);last=now;if(document.hidden)return;if(!reduced){acc+=dt;while(acc>=.02){sim.step();acc-=.02;}}
  const a=sim.agents[selected];for(const b of sim.agents){const v=visuals[b.i];v.root.visible=!(view==='first'&&b===a);v.root.position.set(b.x,b.y||0,b.z);v.root.rotation.y=b.angle;const p=v.trailGeo.attributes.position;for(let j=0;j<b.history.length;j++)p.setXYZ(j,b.history[j].x,(b.history[j].y||0)+.05,b.history[j].z);p.needsUpdate=true;v.trailGeo.setDrawRange(0,b.history.length);v.trailGeo.computeBoundingSphere();}
  if(view==='overview'){const r=camera.aspect<1.2?60:50;targetPos.set(Math.sin(yaw)*Math.cos(elevation)*r,Math.sin(elevation)*r,Math.cos(yaw)*Math.cos(elevation)*r);targetLook.set(0,0,0);}else if(view==='follow'){targetPos.set(a.x-Math.sin(a.angle)*6,(a.y||0)+4.6,a.z-Math.cos(a.angle)*6);targetLook.set(a.x+Math.sin(a.angle)*.8,(a.y||0)+.5,a.z+Math.cos(a.angle)*.8);}else{targetPos.set(a.x,(a.y||0)+1,a.z);targetLook.set(a.x+Math.sin(a.angle)*6,(a.y||0)+.85,a.z+Math.cos(a.angle)*6);}
  const ease=firstFrame||reduced?1:1-Math.exp(-dt*4);camera.position.lerp(targetPos,ease);look.lerp(targetLook,ease);camera.lookAt(look);firstFrame=false;renderer.render(scene,camera);
  const {width,height}=canvas.getBoundingClientRect();for(const b of sim.agents){const v=visuals[b.i];labelPos.set(b.x,(b.y||0)+1.35,b.z).project(camera);const visible=b.bubbleUntil>sim.time&&!(view==='first'&&b===a)&&labelPos.z>-1&&labelPos.z<1&&Math.abs(labelPos.x)<.9&&Math.abs(labelPos.y)<.87;v.bubble.hidden=!visible;if(visible){v.bubble.textContent=`${b.name}: ${b.bubble}`;v.bubble.style.left=`${(labelPos.x*.5+.5)*width}px`;v.bubble.style.top=`${(-labelPos.y*.5+.5)*height}px`;}}
  document.querySelector('#clock').textContent='T + '+sim.time.toFixed(1).padStart(6,'0')+' s';document.querySelector('#speed').textContent=a.speed.toFixed(2);document.querySelector('#agent-state').textContent=reduced?'Reduced motion':a.mode!=='ground'?a.mode[0].toUpperCase()+a.mode.slice(1):sim.time<a.pauseUntil?'Conversing':a.turnRecovery?'Reorienting':a.speed<.65?'Navigating':'Exploring';
 }
 requestAnimationFrame(frame);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.querySelector('#fallback').hidden=false;document.querySelector('#fallback').textContent='The graphics context was interrupted. Reload this page to restart the habitat.';});
}catch(error){document.querySelector('#fallback').hidden=false;document.querySelector('#run-status').textContent='3D UNAVAILABLE';document.querySelectorAll('.controls button,.controls select,.observer-panel input').forEach(e=>e.disabled=true);console.error(error);}
