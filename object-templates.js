import * as THREE from 'three';
import {solid, object, rod, label, glow, line, orbit} from '/engine/renderer/subjects.js';
import {pointTexture} from '/engine/renderer/effects.js';

// Geometry is an explanatory object, never a simulation of a material's colour,
// particle speed, radiation spectrum, dimensions or reaction rate.
const TAU = Math.PI * 2;
const V = (x,y,z) => new THREE.Vector3(x,y,z);
const chrome = () => solid('#b7c7d2',{metalness:.83,roughness:.25});
const dark = () => solid('#172737',{metalness:.55,roughness:.38});
const glass = (color='#a4dbed',opacity=.15) => solid(color,{transparent:true,opacity,roughness:.12,metalness:.06,depthWrite:false,side:THREE.DoubleSide});
const hot = color => solid(color,{emissive:color,emissiveIntensity:.8,roughness:.48});
const sphere = (r,mat,x=0,y=0,z=0) => object(new THREE.SphereGeometry(r,48,32),mat,x,y,z);
const box = (x,y,z,mat,px=0,py=0,pz=0) => object(new THREE.BoxGeometry(x,y,z),mat,px,py,pz);
const cylinder = (r,h,mat,x=0,y=0,z=0,r2=r) => object(new THREE.CylinderGeometry(r,r2,h,56),mat,x,y,z);
function ring(r,t,mat,x=0,y=0,z=0){return object(new THREE.TorusGeometry(r,t,12,96),mat,x,y,z);}
function tube(points,r,mat){return object(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V(...p))),72,r,10,false),mat);}
function rim(r,color){const m=new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(color)}},vertexShader:'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal); v=normalize(-p.xyz); gl_Position=projectionMatrix*p;}',fragmentShader:'uniform vec3 c; varying vec3 n; varying vec3 v; void main(){float a=pow(1.-abs(dot(normalize(n),normalize(v))),3.); gl_FragColor=vec4(c,a*.48);}',transparent:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending});return sphere(r,m);}
function points(count,color,shape='sphere',radius=2.8){const a=[];for(let i=0;i<count;i++){const u=(i*.61803398875)%1,v=(i*.41421356237)%1,w=(i*.754877666)%1;if(shape==='disk'){const t=u*TAU,r=radius*(.35+.65*v);a.push(Math.cos(t)*r,(w-.5)*.12,Math.sin(t)*r);}else if(shape==='column')a.push((u-.5)*radius,(v-.5)*radius*2,(w-.5)*radius);else{const z=1-2*u,t=v*TAU,s=Math.sqrt(1-z*z),r=radius*(.78+.22*w);a.push(s*Math.cos(t)*r,z*r,s*Math.sin(t)*r);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));return new THREE.Points(g,new THREE.PointsMaterial({map:pointTexture(),color,size:.07,transparent:true,opacity:.78,depthWrite:false,blending:THREE.AdditiveBlending}));}
function tagged(group,text,y,width=4.8,color='#c9dfeb'){const s=label(String(text),color,width);s.position.set(0,y,.5);group.add(s);return s;}
function feet(g,w=3,h=-2.1){g.add(box(w,.16,2,dark(),0,h,0));for(const x of [-w/2+.25,w/2-.25])g.add(cylinder(.13,.35,chrome(),x,h-.2,.65),cylinder(.13,.35,chrome(),x,h-.2,-.65));}
function gauge(g,x,y,z){g.add(cylinder(.34,.15,chrome(),x,y,z));const f=object(new THREE.CircleGeometry(.28,32),solid('#e2e9e6'),x,y+.09,z);f.rotation.x=-Math.PI/2;g.add(f);g.add(rod(V(x,y+.1,z),V(x+.17,y+.11,z-.12),.018,hot('#edac63')));}

function metalFurnace(g,c,motions){
 if(c.id==='temperature.aluminum-melting'){
  // Hall-Héroult reduction cell: steel shell, carbon anodes over a cryolite
  // bath, frozen crust, busbars, tap hole, ingot mould and fume hood.
  const steel=chrome(),darkSteel=solid('#4c5459',{roughness:.55,metalness:.55}),carbon=solid('#24262a',{roughness:.92}),crust=solid('#b6ab93',{roughness:.95}),bath=hot('#ff7a25'),bathLight=hot('#ffc06a');
  feet(g,5.4,-2.30);
  g.add(box(4.6,.24,3.5,solid('#3c4246',{metalness:.4,roughness:.6}),0,-1.95,0));
  g.add(box(4.15,1.75,3.10,darkSteel,0,-.78,0));
  g.add(box(4.28,.12,.24,steel,0,.18,1.48),box(.24,.12,3.0,steel,-2.02,.18,0),box(.24,.12,3.0,steel,2.02,.18,0));
  // Frozen alumina/cryolite crust, broken around the anode holes.
  for(const [x,z,w,d] of [[-1.65,-.78,1.55,.72],[-.05,-.78,1.55,.72],[1.55,-.78,1.55,.72],[-1.65,.52,1.55,1.0],[-.05,.52,1.55,1.0],[1.55,.52,1.55,1.0]]){
    g.add(box(w,.16,d,crust,x,.36,z));
    for(let k=0;k<3;k++)g.add(box(w*.20,.02,.012,solid('#7d7261'),x-w*.34+k*w*.30,.445,z-.02));
  }
  for(const x of [-1.55,-.52,.52,1.55]){
    g.add(box(.52,.62,.54,carbon,x,.74,-.52));
    for(const s of [-1,1])g.add(box(.08,.60,.08,carbon,x+s*.19,1.12,-.52));
    g.add(box(.12,.75,.12,carbon,x,1.50,-.52));
    g.add(box(.72,.08,.72,solid('#747b7d',{metalness:.65,roughness:.35}),x,1.20,-.52));
    // Anode stub glow and a thin orange bath meniscus around each block.
    g.add(box(.56,.030,.58,bath,x,.455,-.52));
    const halo=glow('#ff8c38',1.6,.20);halo.position.set(x,.48,-.52);g.add(halo);
  }
  g.add(box(4.5,.12,.14,solid('#8e999c',{metalness:.7,roughness:.3}),0,1.92,-.52));
  g.add(box(.24,1.0,.24,steel,-1.92,1.42,-.52),box(.24,1.0,.24,steel,1.92,1.42,-.52));
  // Cut-away inspection port showing the white-hot bath and metal pad.
  g.add(box(1.30,.44,.035,new THREE.MeshBasicMaterial({color:'#2a2320'}),-.55,-.72,1.60));
  g.add(box(1.20,.30,.020,new THREE.MeshBasicMaterial({color:'#ff8d34'}),-.55,-.73,1.62));
  g.add(box(1.20,.12,.022,new THREE.MeshBasicMaterial({color:'#ffd391'}),-.55,-.83,1.64));
  for(let i=0;i<6;i++){const a=i*TAU/6,r=.24;const bubble=sphere(.03,bathLight,-.55+Math.cos(a)*r,-.60+Math.sin(a)*.10,1.65);g.add(bubble);}
  g.add(box(1.34,.05,.06,steel,-.55,-.46,1.64),box(1.34,.05,.06,steel,-.55,-.99,1.64));
  // Tap hole, glowing metal stream and ingot mould.
  g.add(cylinder(.10,.34,steel,1.74,-.62,1.58),box(.55,.10,.10,steel,1.74,-.80,1.74));
  const stream=cylinder(.055,.82,bath,1.74,-1.16,1.78);g.add(stream);
  const pourGlow=glow('#ff9a3c',1.6,.35);pourGlow.position.set(1.74,-1.10,1.78);g.add(pourGlow);
  g.add(box(.95,.30,1.0,solid('#5e676b',{metalness:.45,roughness:.5}),1.74,-1.73,1.78));
  g.add(box(.78,.12,.82,new THREE.MeshBasicMaterial({color:'#ffb55b'}),1.74,-1.55,1.78));
  // Exhaust hood, duct and fluorine fume.
  g.add(box(1.0,.55,1.0,darkSteel,-1.58,1.65,.60),box(.42,.42,.42,steel,-1.58,1.95,.60));
  g.add(tube([[-1.58,2.15,.60],[-1.58,2.55,.60],[1.4,2.55,.60],[1.4,2.05,.60]],.16,steel));
  const fume=points(80,'#e4e7df','column',.7);fume.position.set(-1.58,2.35,.60);g.add(fume);
  // Readout, warning stripes and cell number.
  g.add(box(1.30,.62,.10,solid('#1f2b34'),0,1.55,1.58));
  const readout=label('660.323 °C', '#ffd08a', .95);readout.position.set(0,1.58,1.64);g.add(readout);
  const alLabel=label('Al · 13', '#cfe5ec', .62);alLabel.position.set(-1.30,1.58,1.64);g.add(alLabel);
  for(let i=0;i<8;i++){g.add(box(.32,.055,.06,solid(i%2?'#e3bb55':'#2f3434'),-1.7+i*.46,-1.73,1.66));}
  const light=new THREE.PointLight('#ff8c38',2.2,7,1.4);light.position.set(0,.4,1.4);g.add(light);
  motions.push((d,t)=>{stream.scale.y=1+.02*Math.sin(t*4.5);pourGlow.material.opacity=.28+.05*Math.sin(t*2.1);fume.rotation.y=t*.08;light.intensity=2.0+.2*Math.sin(t*.7);});
  return;
 }
 const steel=chrome(),insulation=solid('#738087',{roughness:.9}),em=hot(c.color);
 feet(g,4.5,-2.3);g.add(box(4.3,.36,3,steel,0,-1.9),box(4.3,.32,3,steel,0,1.8),box(.35,3.5,3,steel,-2,0),box(.35,3.5,3,steel,2,0));
 g.add(box(3.6,3, .25,insulation,0,0,-1.35));for(const y of [-1.25,1.1]){const coil=tube(Array.from({length:40},(_,i)=>[-1.55+i*.08,y+Math.sin(i*Math.PI)*.07,-1.05]),.045,em);g.add(coil);}
 const crucible=cylinder(.98,.6,solid('#353b43'),0,-1.25,0,1.1);g.add(crucible);
 let sample;
 if(c.profile==='metal'){
  g.add(cylinder(.78,.62,solid('#2b3137',{roughness:.82}),0,-1.24,0,.86));
  const rim=ring(.80,.045,solid('#4a5055',{metalness:.5,roughness:.35}),0,-.94,0);rim.rotation.x=Math.PI/2;g.add(rim);
  sample=cylinder(.70,.10,new THREE.MeshBasicMaterial({color:'#ffb45e'}),0,-.86,0,.72);g.add(sample);
  const meltGlow=glow('#ff9b3d',3.0,.42);meltGlow.position.y=-.80;g.add(meltGlow);const meltLight=new THREE.PointLight('#ff9c4a',1.5,3.6,1.4);meltLight.position.set(0,-.55,.4);g.add(meltLight);
  for(let i=0;i<8;i++){const a=i*TAU/8,r=.18+(i%3)*.16;g.add(sphere(.035,hot('#fff0c8'),Math.cos(a)*r,-.82,Math.sin(a)*r));}
  for(let i=0;i<4;i++){const q=ring(.90+i*.018,.012,hot('#e88a44'),0,-1.3+i*.10);q.rotation.x=Math.PI/2;g.add(q);}
  g.add(tube([[-.70,-.88,0],[-.45,-.45,.18],[-.12,-.05,.20]],.028,chrome()));
  g.add(rod(V(-.12,-.05,.20),V(.42,.72,.32),.026,chrome()));
  g.add(box(1.15,.72,.16,solid('#26313a'),-2.28,.30,1.20),box(.92,.38,.02,solid('#10181e'),-2.28,.42,1.29));
  const readout=label('933.473 K', '#ffcf86', 1.0);readout.position.set(-2.28,.42,1.31);g.add(readout);
  for(const y of [-.02,.16])g.add(box(.12,.06,.03,solid(y<.1?'#c87548':'#5d8a86'),-1.95,y,1.30));
  const heat=points(35,'#ffd8ae','column',.85);heat.position.set(0,-.35,0);g.add(heat);
  motions.push((d,t)=>{meltGlow.material.opacity=.18+.05*Math.sin(t*.9);heat.rotation.y=t*.18;});
 } else {
  sample=c.profile==='glass'?sphere(.85,solid(c.color,{transparent:true,opacity:.8,roughness:.12})):c.profile==='carbon'?box(1.35,1,1,solid('#303640',{roughness:.88}),0,-.5):cylinder(.7,.8,solid(c.sampleColor||'#c5cbd0',{metalness:.7,roughness:.23}),0,-.56);
  if(c.profile==='glass')sample.position.y=-.5;g.add(sample,glow(c.color,3.6,.16));
 }
 g.add(rod(V(1.45,1.7,.5),V(.4,-.15,.4),.035,steel));
 const shield=box(3.75,2.7,.04,glass('#9cc4db',.07),0,.05,1.45);g.add(shield);for(const x of [-1.7,1.7])g.add(box(.05,2.7,.07,steel,x,.05,1.5));
 motions.push((d,t)=>{em.emissiveIntensity=.68+.12*Math.sin(t*.8);});
}
function cryoInstrument(g,c,motions){
 const copper=solid('#c78e66',{metalness:.8,roughness:.25}),steel=chrome();g.add(cylinder(2.1,.22,steel,0,2.4));
 for(const y of [1.7,.65,-.5,-1.5]){g.add(cylinder(1.3+(y+1.5)*.18,.13,copper,0,y));for(const x of [-.9,.9])g.add(rod(V(x,y,0),V(x,y+.9,0),.04,steel));}
 for(let i=0;i<4;i++){const a=i*TAU/4;g.add(tube(Array.from({length:42},(_,j)=>{const t=j/41;return[Math.cos(a+t*TAU*2)*(.7-.3*t),2.3-3.9*t,Math.sin(a+t*TAU*2)*(.7-.3*t)];}),.025,copper));}
 g.add(cylinder(1.98,4.8,glass('#9cd9eb',.075)),ring(2,.06,steel,0,-2.4));const lower=c.profile==='demagnetization'?cylinder(.32,1,solid('#d29466'),0,-1.8):box(.62,.13,.48,solid('#283c63',{metalness:.45}),0,-1.75);g.add(lower);
 if(c.profile==='thermometer'){g.add(rod(V(0,-1.7,0),V(0,-2.7,0),.07,steel),sphere(.16,hot(c.color),0,-2.7));}else if(c.profile==='demagnetization'){for(const x of [-.55,.55]){const q=ring(.42,.1,solid('#a5b8d0'),x,-1.7);q.rotation.y=Math.PI/2;g.add(q);}}
 const pulse=glow(c.color,2.7,.17);pulse.position.y=-1.6;g.add(pulse);motions.push((d,t)=>{pulse.material.opacity=.13+.035*Math.sin(t*.5);});
}
function phaseVessel(g,c,motions){
 if(c.profile==='ammonia'||c.variant==='ammonia'){
  const steel=chrome(),coldGlass=glass('#bad8ea',.10);feet(g,3.2,-2.55);
  g.add(cylinder(1.18,.20,steel,0,-1.98),cylinder(1.22,.05,steel,0,-1.84));
  g.add(cylinder(1.16,3.25,coldGlass,0,-.18),ring(1.18,.05,steel,0,1.44),cylinder(.30,.44,steel,0,1.68),box(.72,.08,.10,solid('#b47d49'),0,1.94));
  // Solid ammonia ice at the bottom, liquid above it and vapour in the head space.
  const ice=cylinder(.92,.62,solid('#e2f1f8',{roughness:.28,metalness:.06}),0,-1.48,0,1.02);
  g.add(ice);for(let i=0;i<7;i++){const a=i*TAU/7,r=.18+(i%3)*.16;const chunk=object(new THREE.DodecahedronGeometry(.16,0),solid('#d5ebf4',{roughness:.32}),Math.cos(a)*r,-1.38,Math.sin(a)*r);chunk.scale.set(1.2,.7,.9);chunk.rotation.set(a,a*.7,a*.4);g.add(chunk);}for(let i=0;i<9;i++){const a=i*TAU/9;g.add(box(.16,.012,.05,solid('#9fc0d2',{roughness:.5}),Math.cos(a)*.55,-1.12,Math.sin(a)*.55));}
  const liquid=cylinder(1.07,1.02,solid('#2f86a8',{transparent:true,opacity:.78,roughness:.22,metalness:.04}),0,-.63,0,1.10);g.add(liquid);g.add(cylinder(1.045,.02,new THREE.MeshBasicMaterial({color:'#c9f2ff',transparent:true,opacity:.85}),0,-.12,0,1.06));
  const meniscus=ring(1.05,.026,solid('#dff5ff',{transparent:true,opacity:.92}),0,-.12,0);meniscus.rotation.x=Math.PI/2;g.add(meniscus);
  const vapor=points(150,'#dff4fa','column',.92);vapor.position.y=.58;const fog=sphere(1.02,glass('#c6e6f1',.18),0,.48,0);fog.scale.y=.58;g.add(fog);g.add(vapor);
  g.add(tube([[1.0,1.38,0],[1.55,1.95,0],[1.95,1.85,0],[1.95,1.38,0]],.05,steel));
  gauge(g,1.95,1.10,0);
  const pressureLabel=label('6.06 kPa', '#cfe8f2', 1.2);pressureLabel.position.set(1.25,2.10,.20);g.add(pressureLabel);
  const tempLabel=label('195.4 K', '#ffd18a', 1.0);tempLabel.position.set(-.95,2.10,.20);g.add(tempLabel);
  for(let i=0;i<5;i++){const a=i*TAU/5;g.add(box(.025,.55,.04,solid('#7aa6bb',{transparent:true,opacity:.35}),Math.cos(a)*1.12,-.25,Math.sin(a)*1.12));}
  motions.push((d,t)=>{vapor.rotation.y=t*.10;vapor.position.y=.62+Math.sin(t*.35)*.06;meniscus.material.opacity=.72+.08*Math.sin(t*.5);});
  return;
 }
 const steel=chrome();feet(g,3,-2.5);
 if(c.profile==='room'){g.add(box(3.8,4,.16,solid('#304c5d'),0,0,-.4));for(const x of [-1.5,1.5])g.add(box(.09,3.5,.2,steel,x,.1,-.2));g.add(box(3,.09,.2,steel,0,.1,-.2));g.add(cylinder(.1,2.7,glass(),0,0,.15),sphere(.28,hot(c.color),0,-1.5,.15),cylinder(.045,1.5,hot(c.color),0,-.7,.15));for(let i=0;i<12;i++)g.add(box(.16,.025,.06,steel,.28,-1.2+i*.23,.2));return;}
 g.add(cylinder(1.3,3.3,glass(c.color,.13),0,-.1),cylinder(1.35,.14,steel,0,-1.8),cylinder(1.35,.14,steel,0,1.6),cylinder(.23,.72,steel,0,2),box(.9,.1,.12,solid('#b47d49'),0,2.35));
 // At the critical point a sharp liquid/gas meniscus would be misleading.
 const liquid=c.profile==='critical'?cylinder(1.21,3.15,glass(c.color,.18),0,-.1):cylinder(1.21,c.profile==='crystal'?1.1:1.6,solid(c.color,{transparent:true,opacity:.5,roughness:.18}),0,-.88);g.add(liquid);gauge(g,1.45,1.75,0);g.add(tube([[0,2.1,0],[.8,2.6,0],[1.45,2.25,0],[1.45,1.75,0]],.06,steel));
 if(c.profile==='crystal'){const p=object(new THREE.OctahedronGeometry(.7),solid('#dcecf1',{roughness:.3}),0,-.5,.15);g.add(p);motions.push((d)=>{p.rotation.y+=d*.07;});}
 const vapor=points(50,c.color,'column',1.2);vapor.position.y=.1;g.add(vapor);motions.push((d,t)=>{vapor.rotation.y=t*.06;vapor.position.y=.12+Math.sin(t*.45)*.08;});
}
function superconductor(g,c,motions){
 feet(g,4.5,-1.7);const board=box(3.4,.18,2.6,solid('#183c50',{metalness:.35}),0,-.8);g.add(board);for(let i=0;i<6;i++)g.add(rod(V(-1.5,-.67,-1+i*.4),V(1.5,-.67,-1+i*.4),.014,solid('#c59c63')));
 if(c.profile==='squid'){const loop=ring(.75,.08,solid('#d3e4ea'),0,-.5);loop.rotation.x=-Math.PI/2;g.add(loop,box(.25,.18,.16,hot(c.color),-.65,-.4,0),box(.25,.18,.16,hot(c.color),.65,-.4,0));for(const x of [-1,1])g.add(rod(V(x,-.6,0),V(x*1.8,.8,.2),.035,chrome()));}
 else {const chip=c.profile==='niobium'?cylinder(.8,.22,chrome(),0,-.55):box(1.6,.2,1.4,solid('#24313d'),0,-.55);g.add(chip);const magnet=cylinder(.55,.7,solid('#ba6a57',{metalness:.55}),0,.65);g.add(magnet);motions.push((d,t)=>{magnet.position.y=.65+Math.sin(t*.65)*.07;});}
 for(const x of [-1,0,1]){const arc=tube([[-1.5+x*.15,-.5,-.4],[x*.6,1.7,-.4],[1.5+x*.15,-.5,-.4]],.012,hot(c.color));g.add(arc);}g.add(cylinder(2.1,2.7,glass('#94d0e9',.06),0,-.15));
}
function kitchen(g,c,motions){
 const steel=chrome();feet(g,4.7,-2.2);
 if(c.profile==='oil'){g.add(cylinder(1.6,.24,dark(),0,-1),cylinder(1.4,.26,steel,0,-.76),cylinder(1.3,.06,solid('#d9a84d',{transparent:true,opacity:.75}),0,-.59),rod(V(1.25,-.75,0),V(2.9,-.5,0),.12,dark()));const smoke=points(70,'#d3d6ce','column',1.8);smoke.position.y=.8;g.add(smoke);motions.push((d,t)=>{smoke.rotation.y=t*.05;smoke.position.y=.8+Math.sin(t*.35)*.12;});return;}
 g.add(box(4.6,3.8,2.7,solid('#6d7b85',{metalness:.65}),0,0,-.4),box(3.9,2.7,.1,dark(),0,-.25,1.02),box(3.65,2.5,.04,glass('#d2aa81',.2),0,-.25,1.13));for(const x of [-1.7,1.7])g.add(cylinder(.16,.11,dark(),x,1.5,1.05));
 for(let i=0;i<7;i++)g.add(rod(V(-1.7,-1,-.9+i*.27),V(1.7,-1,-.9+i*.27),.025,steel));const loaf=sphere(.87,solid('#b77b3b',{roughness:.9}),0,-.35,0);loaf.scale.set(1.5,.65,.8);g.add(loaf);for(let i=0;i<3;i++)g.add(tube([[-.6+i*.6,-.02,-.45],[-.4+i*.6,.15,0],[-.2+i*.6,-.02,.45]],.025,solid('#e6c18a')));g.add(box(2.2,.13,.16,steel,0,.6,1.35),glow(c.color,3.5,.13));
}
function burner(g,c,motions){
 feet(g,3,-2.2);const steel=chrome();g.add(cylinder(.55,2.4,steel,0,-.5),cylinder(.8,.22,dark(),0,-1.7),rod(V(0,-1.3,0),V(1.5,-1.3,0),.12,steel),box(.6,.1,.1,solid('#bc8b55'),1,-.9));
 if(c.profile==='torch'){g.add(tube([[1.3,-1.3,0],[2.4,-1.6,0],[2.4,-2.1,.7]],.1,solid('#a84c47')),tube([[-.3,-1.3,0],[-1.7,-1.7,0],[-2,-2.1,.7]],.1,solid('#477b67')));}
 const flame=cylinder(.02,2.6,glass(c.color,.48),0,1.65,0,.7),inner=cylinder(.01,1.1,hot('#bbebff'),0,.9,0,.27);g.add(flame,inner);const halo=glow(c.color,3.9,.22);halo.position.y=1.3;g.add(halo);motions.push((d,t)=>{flame.scale.set(1+Math.sin(t*3)*.035,1+Math.sin(t*2.3)*.04,1);halo.material.opacity=.18+.03*Math.sin(t*2);});
}
function rocket(g,c,motions){
 const steel=chrome();g.add(cylinder(.85,1.7,steel,0,1.4),cylinder(.82,.18,dark(),0,.55));const bell=object(new THREE.CylinderGeometry(.7,1.8,2.1,56,1,true,0,Math.PI*1.65),steel,0,-.6);g.add(bell);for(let i=0;i<12;i++){const a=i*TAU/12;g.add(tube([[Math.cos(a)*.85,2.2,Math.sin(a)*.85],[Math.cos(a)*1.2,.3,Math.sin(a)*1.2],[Math.cos(a)*1.82,-1.65,Math.sin(a)*1.82]],.035,solid('#8b9caa')));}
 for(const x of [-1,1]){g.add(tube([[x*.7,1.9,0],[x*1.6,2.5,0],[x*2,1.5,0],[x*1.1,.7,0]],.16,steel),sphere(.45,dark(),x*1.8,2,0));}
 const flame=cylinder(.5,2.3,hot(c.color),0,.45,0,.25);flame.scale.z=.7;g.add(flame);const mist=points(90,c.color,'column',1);mist.position.y=-1.6;g.add(mist);motions.push((d,t)=>{flame.scale.x=1+Math.sin(t*4)*.045;mist.rotation.y=t*.2;});
}
function planet(g,c,motions){
 const color=c.color;
 if(c.id==='temperature.basalt-melting'){
  // Basalt is a rock, not a pure melt: a cinder cone, a channel of low-viscosity
  // lava and a chilled crust skin show the melting range without pretending to
  // be a single thermometer reading.
  const basalt=solid('#2d2723',{roughness:1}),basaltLight=solid('#4a3d34',{roughness:.96}),crust=solid('#171311',{roughness:.9}),lava=hot('#ff6b1e'),lavaHot=hot('#ffc05e');
  feet(g,5.4,-2.2);
  g.add(box(5.6,.18,4.0,basalt,0,-1.98,0));
  for(let i=0;i<16;i++){const a=i*2.37,r=1.9+(i%3)*.35;const b=object(new THREE.DodecahedronGeometry(.16+(i%4)*.05,0),basaltLight,Math.cos(a)*r,-1.86,Math.sin(a)*r);b.scale.set(1.3,.45,.9);b.rotation.set(a,a*.6,a*.3);g.add(b);}
  const cone=object(new THREE.CylinderGeometry(.36,1.55,1.62,36,10),basalt,0,-.72,0);g.add(cone);
  for(let i=0;i<28;i++){
    const a=i*2.4,rr=.36+(i%7)*.075,h=.09-(rr-.36)*1.10;
    const ridge=object(new THREE.DodecahedronGeometry(.10+(i%4)*.035,0),basaltLight,Math.cos(a)*rr,h,Math.sin(a)*rr);
    ridge.scale.set(1.4,.35,.55);ridge.rotation.set(a,a*.8,a*.4);g.add(ridge);
  }
  g.add(ring(.40,.055,solid('#1c1715',{roughness:1}),0,.13,0));g.children[g.children.length-1].rotation.x=Math.PI/2;
  g.add(cylinder(.32,.035,lava,0,.12,0,.30));
  const craterGlow=glow('#ff7826',2.0,.48);craterGlow.position.set(0,.15,0);g.add(craterGlow);
  // Lava channel down the left flank, edged by chilled crust plates.
  const flow=tube([[0,.13,.10],[-.24,.01,.32],[-.52,-.24,.64],[-.86,-.63,.88],[-1.18,-1.05,1.02],[-1.42,-1.45,1.04]],.135,lava);g.add(flow);
  const inner=tube([[0,.13,.12],[-.26,.02,.34],[-.54,-.22,.66],[-.88,-.60,.90],[-1.16,-1.00,1.03]],.048,lavaHot);g.add(inner);
  // Molten pool at the foot of the flow, with chilled margins and a bright core.
  const pool=cylinder(.58,.028,lava,-1.18,-1.87,1.22,.40);pool.rotation.x=Math.PI/2;pool.scale.z=.82;g.add(pool);
  const poolCore=cylinder(.31,.020,lavaHot,-1.18,-1.855,1.22,.24);poolCore.rotation.x=Math.PI/2;poolCore.scale.z=.82;g.add(poolCore);
  for(let i=0;i<7;i++){const a=i*TAU/7,r=.52+(i%2)*.08;const lip=object(new THREE.DodecahedronGeometry(.13,0),crust,-1.18+Math.cos(a)*r,-1.86,1.22+Math.sin(a)*r*.72);lip.scale.set(1.3,.18,.85);g.add(lip);}
  for(let i=0;i<9;i++){
    const t=i/8,x=-.12-t*1.22,y=.10-t*1.62,z=.14+t*.88;
    for(const s of [-1,1]){
      const slab=object(new THREE.DodecahedronGeometry(.16,0),crust,x+s*(.16+.03*(i%2)),y,z);
      slab.scale.set(.55,.16,.85);slab.rotation.set(.2,i*.2,.3);g.add(slab);
    }
  }
  const flowGlow=glow('#ff7a2a',3.0,.26);flowGlow.position.set(-.95,-.85,.9);g.add(flowGlow);
  // A small satellite vent and a thin ash plume.
  g.add(cylinder(.16,.55,basaltLight,-1.35,-1.52,-.50,.24),cylinder(.14,.020,lava,-1.35,-1.23,-.50));
  const plume=points(220,'#cdbcab','column',1.15);plume.position.set(0,.55,0);g.add(plume);
  for(let i=0;i<6;i++){
    const puff=sphere(.22+(i%3)*.05,new THREE.MeshBasicMaterial({color:i<3?'#b9a693':'#8b7d70',transparent:true,opacity:.13,depthWrite:false}),.12-(i%2)*.10,.62+i*.17,.02+(i%2)*.06);
    puff.scale.set(1.5,.8,1.2);g.add(puff);
  }
  const steam=points(45,'#d9d2c8','column',.65);steam.position.set(.5,-1.42,1.35);g.add(steam);
  const light=new THREE.PointLight('#ff7b25',2.6,7.5,1.35);light.position.set(0,.25,1.25);g.add(light);
  motions.push((d,t)=>{craterGlow.material.opacity=.40+.07*Math.sin(t*.9);flowGlow.material.opacity=.22+.05*Math.sin(t*1.2);plume.rotation.y=t*.10;steam.rotation.y=-t*.08;light.intensity=2.4+.25*Math.sin(t*.7);});
  return;
 }
 if(c.profile==='lava'||c.profile==='geological'){
  // CPU-only finite-entry checks run without a DOM; keep a real 3D stand-in
  // so the model checker can still build and transform this entry.
  if(typeof document==='undefined'||typeof document.createElementNS!=='function'){g.add(cylinder(2.6,.3,solid('#5f4636'),0,-1.4,0));return;}
  const glowColor=c.profile==='geological'?'#ff7a2f':'#ff5a18';
  // USGS/HVO aerial photograph of the Halemaʻumaʻu lava lake, used as the
  // crater-floor albedo on a shallow circular diorama. The photo carries the
  // real crust plates, foundering cracks and molten spatter; 3D glow,
  // fountain and steam add depth over the vent.
  const tex=new THREE.TextureLoader().load('https://static.chidu.org/media/textures/kilauea-lava-lake.jpg',t=>{
    t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
  });
  const topMat=new THREE.MeshBasicMaterial({map:tex});
  const disc=object(new THREE.CircleGeometry(2.62,96),topMat,0,-1.28,0);disc.rotation.x=-Math.PI/2;g.add(disc);
  g.add(cylinder(2.64,.34,new THREE.MeshStandardMaterial({color:'#211b18',roughness:1}),0,-1.47,0,2.64));
  const rimRing=ring(2.58,.09,solid('#2d2622',{roughness:1}),0,-1.27,0);rimRing.rotation.x=Math.PI/2;g.add(rimRing);
  for(let i=0;i<10;i++){
    const a=i*2.51,r=2.04+(i%3)*.12;
    const rock=object(new THREE.DodecahedronGeometry(.14+.05*(i%4),0),solid(i%2?'#2a2320':'#352c26',{roughness:1}),Math.cos(a)*r,-1.2+.03*(i%3),Math.sin(a)*r);
    rock.scale.set(1.25,.7,1.05);rock.rotation.set(a*.3,a,a*.5);g.add(rock);
  }
  // The orange spatter source sits at roughly (-1.2, 0.9) in crater coordinates.
  const vent=V(-1.18,-1.12,.88);
  const jet=cylinder(.055,.34,hot(glowColor),vent.x,vent.y+.15,vent.z,.22);g.add(jet);
  const glowBall=glow(glowColor,2.0,.38);glowBall.position.set(vent.x,vent.y+.1,vent.z);g.add(glowBall);
  const light=new THREE.PointLight(glowColor,2.2,4.6,1.4);light.position.set(vent.x,vent.y+.25,vent.z);g.add(light);
  const embers=points(55,'#ff8a35','column',1.0);embers.position.set(vent.x,vent.y+.4,vent.z);g.add(embers);
  // The aerial photograph already carries the real fume plume; a second
  // additive particle column read as a vertical white wall, so it is removed.
  g.rotation.x=.47;g.position.y=.12;
  motions.push((d,t)=>{
    glowBall.material.opacity=.30+.06*Math.sin(t*.7);
    light.intensity=2.1+.35*Math.sin(t*.8);
    jet.scale.y=1+.12*Math.sin(t*4.3);
    embers.rotation.y=t*.24;
  });
  return;
 }
 if(c.profile==='triton'||c.variant==='triton'){
  if(typeof document==='undefined'||typeof document.createElementNS!=='function'){g.add(sphere(2.2,solid('#b7b9b4')));return;}
  // Voyager 2 / USGS global color mosaic (southern-hemisphere coverage).
  // Real cantaloupe terrain, dark streak deposits and the bright nitrogen cap.
  const mat=new THREE.MeshStandardMaterial({color:'#aeb9ba',roughness:.96,metalness:0});
  const tex=new THREE.TextureLoader().load('https://static.chidu.org/media/textures/triton-map-2k.jpg',t=>{
    t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;mat.map=t;mat.bumpMap=t;mat.bumpScale=.045;mat.needsUpdate=true;
  },undefined,()=>{mat.color.set('#c3ced2');});
  const world=object(new THREE.SphereGeometry(2.2,128,96),mat);g.add(world,rim(2.29,'#9fd2e6'));
  world.rotation.set(-.12,2.3,-.14);
  // One small cryovolcano aligned to the local surface normal, plus a faint plume.
  const n=V(1.35,-.78,1.55).normalize(),p=n.clone().multiplyScalar(2.19);
  const cone=object(new THREE.ConeGeometry(.15,.5,9),solid('#6f7f88'),p.x,p.y,p.z);
  cone.quaternion.setFromUnitVectors(V(0,1,0),n);g.add(cone);
  const plume=points(45,'#e6f1f5','column',.65);plume.position.copy(n.clone().multiplyScalar(2.55));g.add(plume);
  const h=glow('#bfe8f5',3.6,.14);g.add(h);
  motions.push((d,t)=>{world.rotation.y=2.3+Math.sin(t*.075)*.03;plume.rotation.y=t*.12;h.material.opacity=.11+.025*Math.sin(t*.6);});
  return;
 }
 if(c.profile==='lightning'){for(let i=0;i<6;i++){const cloud=sphere(.9,solid('#718096',{roughness:1}),-2+i*.75,1.5+.25*Math.sin(i),.3*Math.cos(i));cloud.scale.y=.55;g.add(cloud);}const bolt=line([[-.3,1.1,0],[-.7,.2,0],[0,.3,0],[-.5,-.7,0],[.05,-.5,0],[-.8,-2,0]],'#b9d5ff',1);g.add(bolt,line([[-.5,-.7,0],[.5,-1,0],[1,-1.7,0]],'#a0c9ff',.7));const h=glow('#bbd8ff',5,.25);g.add(h);motions.push((d,t)=>{h.material.opacity=.08+.2*Math.pow(Math.max(0,Math.sin(t*1.3)),12);});return;}
 // Venus uses the real 2K surface map; the generic coloured sphere read as a
 // washed-out marble with scribbled rings.
 let venusMap = null;
 if (c.profile === 'venus' && typeof document !== 'undefined' && typeof document.createElementNS === 'function') {
  venusMap = new THREE.TextureLoader().load('https://static.chidu.org/media/planets/2k_venus_surface.jpg');
  venusMap.colorSpace = THREE.SRGBColorSpace;
  venusMap.anisotropy = 4;
 }
 const world=sphere(2.2,solid(c.profile==='venus'?'#b89160':c.profile==='mars'?'#ad654b':c.profile==='pluto'?'#b0aaa0':'#346884',{roughness:.85}));g.add(world,rim(2.28,color));
 if (venusMap) {
  world.material = new THREE.MeshStandardMaterial({map:venusMap, color:'#f4ddb8', roughness:.93, metalness:0});
  const veil = sphere(2.235, new THREE.MeshBasicMaterial({color:'#f7e4bc', transparent:true, opacity:.07, depthWrite:false}));
  world.add(veil);
 }
 for(let i=0;i<5;i++){if(c.profile==='venus')break;const a=i*1.37;const patch=sphere(.6,solid(c.profile==='mars'?'#77473c':c.profile==='venus'?'#dbb47a':'#d2dcda',{roughness:1}),Math.cos(a)*1.85,Math.sin(a)*1.4,1);patch.scale.set(1,.45,.25);world.add(patch);}
 if(c.profile==='core'){world.material=glass('#9bb8b9',.12);for(const [r,co] of [[1.65,'#ad6040'],[1.15,'#dfad60'],[.65,'#ffe1a4']])g.add(sphere(r,solid(co,{emissive:co,emissiveIntensity:.17})));}
 if(c.profile==='venus' && !venusMap){for(let i=0;i<7;i++){const b=ring(2.2,.06,glass('#f3d598',.55));b.rotation.x=i*.25;b.rotation.y=i*.35;world.add(b);}}
 if(c.profile==='antarctic'){const ice=sphere(1.5,solid('#e3edf0'),0,1.4,.1);ice.scale.y=.45;world.add(ice);g.add(rod(V(1,1.5,1.5),V(1,2.8,1.5),.035,chrome()),box(.35,.22,.25,solid('#cda867'),1,2.65,1.5));}
 if(c.profile==='thermosphere'){for(const r of [2.6,3,3.4]){const o=orbit(r,'#72c8ed',.32);o.rotation.x=.3;g.add(o);}const satellite=box(.3,.25,.2,chrome(),2.9,1.2,0);g.add(satellite,box(1,.025,.3,solid('#28567c'),2.9,1.2,0));}
 motions.push((d)=>{world.rotation.y+=d*.035;});
}
function stellar(g,c,motions){
 const star=new THREE.Group();g.add(star);const photosphere=sphere(2.1,hot(c.color));star.add(photosphere,rim(2.19,c.color));const grains=points(180,c.grainColor||'#fff1d0','sphere',2.12);star.add(grains);const aura=glow(c.color,6.4,.22);g.add(aura);
 if(c.profile==='vega'){star.scale.set(1.15,.86,1.15);g.add(rod(V(0,-2.9,0),V(0,2.9,0),.016,solid('#88aabb')));}
 if(c.profile==='sunspot'){const spot=sphere(.65,solid('#4f231a'),.6,.25,1.95);spot.scale.z=.16;star.add(spot);const pen=ring(.67,.1,solid('#b45e2e'),.6,.25,2.02);star.add(pen);}
 if(['corona','chromosphere','transition'].includes(c.profile)){for(let i=0;i<9;i++){const a=i*TAU/9,outer=c.profile==='corona'?3.25:2.6;const arc=tube([[Math.cos(a)*1.9,Math.sin(a)*1.9,0],[Math.cos(a+.15)*outer,Math.sin(a+.15)*outer,.6],[Math.cos(a+.33)*1.95,Math.sin(a+.33)*1.95,0]],.022,hot(c.profile==='corona'?'#a3cce9':'#ff9e80'));g.add(arc);}if(c.profile==='corona')photosphere.material=solid('#243b50');}
 if(c.profile==='brown'){photosphere.material=solid('#6b4645',{emissive:'#784333',emissiveIntensity:.22});for(const y of [-1,-.2,.6]){const b=ring(Math.sqrt(4.45-y*y),.07,glass('#be9b8a',.3),0,y);b.rotation.x=Math.PI/2;star.add(b);}}
 if(c.id==='temperature.a-type-star'){
  // A-type photosphere: a blue-white granulation texture rather than a plain
  // white sphere, plus a thin chromosphere and coronal loops.
  star.scale.set(1.32,1.20,1.32);aura.material.color.set('#6ea9ef');aura.material.opacity=.34;star.add(rim(2.2,'#4d8ddb'));
  if(typeof document!=='undefined'&&typeof document.createElement==='function'){
   const cvs=document.createElement('canvas');cvs.width=1024;cvs.height=512;
   const ctx=cvs.getContext('2d'),grd=ctx.createRadialGradient(512,256,40,512,256,530);
   grd.addColorStop(0,'#eef6ff');grd.addColorStop(.55,'#c4dcff');grd.addColorStop(1,'#86b0e4');ctx.fillStyle=grd;ctx.fillRect(0,0,1024,512);
   for(let i=0;i<1600;i++){
    const x=Math.random()*1024,y=Math.random()*512,r=4+Math.random()*16;
    const light=Math.random()>.42;ctx.fillStyle=light?`rgba(255,255,255,${.08+Math.random()*.16})`:`rgba(57,108,173,${.07+Math.random()*.16})`;
    ctx.beginPath();ctx.ellipse(x,y,r,r*(.35+Math.random()*.5),Math.random()*Math.PI,0,Math.PI*2);ctx.fill();
   }
   for(let i=0;i<420;i++){const x=Math.random()*1024,y=Math.random()*512;ctx.strokeStyle=`rgba(79,130,194,${.05+Math.random()*.15})`;ctx.lineWidth=.8+Math.random()*1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+8+Math.random()*24,y+(Math.random()-.5)*10);ctx.stroke();}
   const tex=new THREE.CanvasTexture(cvs);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=THREE.RepeatWrapping;
   photosphere.material=new THREE.MeshBasicMaterial({map:tex,color:'#aac8f2'});
  }
  const chromo=sphere(2.18,glass('#8db9ff',.09));star.add(chromo);
  for(let i=0;i<12;i++){
   const a=i*TAU/12,lat=.20+.16*Math.sin(i*1.7);
   const p0=[Math.cos(a)*2.05,lat,Math.sin(a)*2.05],p1=[Math.cos(a+.58)*2.02,-lat*.25,Math.sin(a+.58)*2.02];
   const m1=[Math.cos(a+.12)*2.48,lat*1.4+.34,Math.sin(a+.12)*2.48],m2=[Math.cos(a+.30)*2.78,lat*1.7+.52,Math.sin(a+.30)*2.78],m3=[Math.cos(a+.46)*2.50,lat*1.3+.30,Math.sin(a+.46)*2.50];
   const loop=tube([p0,m1,m2,m3,p1],.026,hot('#d3e7ff'));star.add(loop);
  }
  // Limb darkening, starspots and bright faculae. A-type photospheres are
  // blue-white but not featureless; these break the clean sphere silhouette.
  for(let i=0;i<6;i++){
    const a=i*2.31+.4,lat=-.55+((i*3)%5)*.26;
    const spot=sphere(.16,solid('#4a72ad',{roughness:.6}),Math.cos(a)*2.02,lat,Math.sin(a)*2.02);
    spot.scale.set(1.2,.28,.6);star.add(spot);
    const fac=glow('#dbeaff',.55,.28);fac.position.set(Math.cos(a+1.1)*2.10,lat+.08,Math.sin(a+1.1)*2.10);star.add(fac);
  }
  for(let i=0;i<10;i++){
    const a=i*TAU/10+.2,lat=.55*Math.sin(i*2.1);
    const ray=rod(V(Math.cos(a)*2.15,lat,Math.sin(a)*2.15),V(Math.cos(a)*4.15,lat*1.45,Math.sin(a)*4.15),.007,hot('#d8e9ff'));
    ray.material.transparent=true;ray.material.opacity=.22;g.add(ray);
  }
  const flare=glow('#ffffff',2.4,.46);flare.position.set(1.65,1.10,1.55);g.add(flare);
  const flareCore=sphere(.12,hot('#f2f8ff'),1.72,1.14,1.62);star.add(flareCore);
  const pole=glow('#dbe9ff',3.6,.18);pole.position.y=2.2;star.add(pole);
 }
 motions.push((d,t)=>{star.rotation.y+=d*.035;grains.rotation.y+=d*.009;aura.material.opacity=.18+.025*Math.sin(t*.45);});
}
function compact(g,c,motions){
 if(c.profile==='horizon'){
  // A black hole is a shadow, not a pink marble: dark event horizon, photon
  // ring, tilted accretion disk and a faint Hawking-radiation halo.
  const hole=sphere(1.1,new THREE.MeshBasicMaterial({color:'#03050a'}));g.add(hole,rim(1.14,'#c9a6e8'));
  const photon=ring(1.2,.022,hot('#e0c2ff'));photon.rotation.x=Math.PI/2;g.add(photon);
  const disk=ring(2.12,.19,hot('#c9a6ff'));disk.rotation.set(1.02,0,-.26);disk.material.transparent=true;disk.material.opacity=.62;g.add(disk);
  const disk2=ring(1.68,.07,hot('#f0d6ff'));disk2.rotation.set(1.02,0,-.26);disk2.material.transparent=true;disk2.material.opacity=.4;g.add(disk2);
  const disk3=ring(2.62,.035,hot('#9b76d8'));disk3.rotation.set(1.02,0,-.26);disk3.material.transparent=true;disk3.material.opacity=.22;g.add(disk3);
  const lens=ring(1.52,.008,hot('#d8bcff'));lens.rotation.set(.58,0,.2);lens.material.transparent=true;lens.material.opacity=.3;g.add(lens);
  const rad=points(36,'#e3ccff','sphere',1.4);g.add(rad);
  const haze=glow('#c9a6e8',4.3,.12);g.add(haze);
  motions.push((d,t)=>{disk.rotation.z+=d*.1;disk2.rotation.z+=d*.14;disk3.rotation.z+=d*.08;rad.rotation.y+=d*.03;haze.material.opacity=.09+.02*Math.sin(t*.7);});
  return;
 }
 const star=sphere(1.15,hot(c.color));g.add(star,rim(1.21,c.color),glow(c.color,4.5,.22));const magnet=new THREE.Group();magnet.rotation.z=.3;g.add(magnet);
 if(c.profile!=='white-dwarf'){for(const s of [-1,1])for(let i=0;i<3;i++){const a=i*TAU/3;magnet.add(tube([[0,s*1,0],[Math.cos(a)*2.4,s*2.3,Math.sin(a)*2.4],[Math.cos(a)*2.6,-s*1.8,Math.sin(a)*2.6],[0,-s*1,0]],.012,hot('#6aa3cb')));}for(const s of [-1,1]){magnet.add(sphere(.25,hot('#fff0d4'),0,s*1.07,0));if(c.profile==='pulsar'){const b=cylinder(.05,2.4,glass('#a9d9ff',.22),0,s*2.2,0,.65);if(s<0)b.rotation.z=Math.PI;magnet.add(b);}}}
 else {const o=orbit(2.6,'#a9b8d4',.35);o.rotation.x=.4;g.add(o);const grains=points(80,'#d4e9ff','sphere',1.17);g.add(grains);}
 motions.push((d)=>{magnet.rotation.y+=d*(c.profile==='pulsar'?.45:.07);star.rotation.y+=d*.04;});
}
function accretion(g,c,motions){
 const disk=new THREE.Group();disk.rotation.set(.3,0,.2);g.add(disk);g.add(sphere(.8,solid('#05080f',{roughness:1})));for(let i=0;i<13;i++){const r=.95+i*.17,co=new THREE.Color(c.color).lerp(new THREE.Color('#854f5b'),i/17);const q=ring(r,.065,hot(co));q.rotation.x=Math.PI/2;disk.add(q);}disk.add(points(150,'#ffcca1','disk',3.1));
 for(const s of [-1,1]){const jet=cylinder(.12,2.6,glass('#9cbcff',.17),0,s*1.8,0,.5);if(s<0)jet.rotation.z=Math.PI;g.add(jet);}g.add(glow(c.color,4,.22));motions.push((d)=>{disk.rotation.y+=d*.09;});
}
function stellarEvent(g,c,motions){
 const shell=new THREE.Group();g.add(shell);g.add(sphere(.5,hot('#e7efff')),glow(c.color,6,.3));for(let i=0;i<5;i++){const q=ring(1.1+i*.43,.035,hot(c.color));q.rotation.set(i*.63,i*.41,i*.7);shell.add(q);}const debris=points(170,c.color,'sphere',2.9);shell.add(debris);for(const s of [-1,1]){const jet=cylinder(.03,2.4,glass(c.profile==='kilonova'?'#d7aee5':'#a0c6ff',.3),0,s*1.7,0,.65);if(s<0)jet.rotation.z=Math.PI;g.add(jet);}if(c.profile==='kilonova'){g.add(sphere(.24,hot('#e3e5ff'),-.6,0),sphere(.24,hot('#e3e5ff'),.6,0));}motions.push((d,t)=>{shell.rotation.y+=d*.035;shell.scale.setScalar(1+Math.sin(t*.3)*.025);});
}
function nebula(g,c,motions){
 g.add(sphere(.18,hot('#e4d2ba')),glow('#b5ceee',5,.12));const lobes=new THREE.Group();g.add(lobes);for(const s of [-1,1]){const cone=cylinder(1.3,2.7,glass(c.color,.16),0,s*1.4,0,.12);if(s<0)cone.rotation.z=Math.PI;lobes.add(cone);for(let i=0;i<4;i++){const r=ring(.4+i*.25,.018,hot(c.color),0,s*(.5+i*.55));r.rotation.x=Math.PI/2;lobes.add(r);}}lobes.rotation.z=-.45;const dust=points(120,c.color,'sphere',2.8);g.add(dust);motions.push((d)=>{dust.rotation.y+=d*.012;});
}
function radiation(g,c,motions){
 const sky=new THREE.Group();g.add(sky);for(let i=0;i<7;i++){const q=orbit(2.9,'#789bb4',.25);q.rotation.x=i*Math.PI/7;sky.add(q);}for(let i=0;i<9;i++){const q=ring(2.9*Math.sin((i+1)*Math.PI/10),.012,solid('#59738c',{transparent:true,opacity:.45}),0,2.9*Math.cos((i+1)*Math.PI/10));q.rotation.x=Math.PI/2;sky.add(q);}sky.add(points(150,c.color,'sphere',2.86));
 if(c.profile==='neutrino'){for(let i=0;i<6;i++){const y=(i-2.5)*.65;g.add(line([[-3,y,-.5],[0,y+.2,.3],[3,y+.4,1]],'#a4c4d9',.5));const marker=object(new THREE.OctahedronGeometry(.07),hot(c.color),-2+i*.7,y,0);g.add(marker);}}else{for(let i=0;i<8;i++){const p=sphere(.14,solid(i%2?'#d78d66':'#729fd1'),Math.cos(i*2)*2.6,Math.sin(i*2)*2,Math.sin(i*1.7));sky.add(p);}}
 motions.push((d)=>{sky.rotation.y+=d*.015;});
}
function reaction(g,c,motions){
 if(c.profile==='tokamak'){const steel=chrome();const q=ring(2,.6,steel);q.rotation.x=.7;g.add(q);for(let i=0;i<12;i++){const a=i*TAU/12;const coil=ring(.8,.13,solid('#bd9269'),Math.cos(a)*2,Math.sin(a)*2,0);coil.rotation.y=a;g.add(coil);}const plasma=ring(2,.15,hot(c.color));plasma.rotation.x=.7;g.add(plasma);g.add(box(3,.25,2,dark(),0,-2.6),glow(c.color,5,.12));motions.push((d,t)=>{plasma.material.emissiveIntensity=.65+.12*Math.sin(t*.8);});return;}
 if(c.profile==='stellar-burning'){for(const [r,col] of [[2.4,'#596982'],[1.7,'#bf8461'],[1.0,c.color]])g.add(sphere(r,glass(col,r===1?.65:.12)));for(let i=0;i<6;i++){const a=i*TAU/6;const seed=object(new THREE.IcosahedronGeometry(.2),hot(c.color),Math.cos(a)*1.4,Math.sin(a)*1.4,1);g.add(seed);g.add(line([[Math.cos(a)*1.4,Math.sin(a)*1.4,1],[0,0,.7]],'#e8c5a0',.5));}g.add(glow(c.color,4,.25));}
 else {const lattice=new THREE.Group();g.add(lattice);for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){lattice.add(sphere(.09,hot((x+y+z)%2?c.color:'#c7dcf3'),x*1.3,y*1.3,z*1.3));if(x<1)lattice.add(rod(V(x*1.3,y*1.3,z*1.3),V((x+1)*1.3,y*1.3,z*1.3),.009,solid('#6d7eab')));}for(let i=0;i<3;i++){const q=ring(2.65,.025,hot(c.color));q.rotation.set(i*.8,i*.6,i);g.add(q);}g.add(points(90,c.color,'sphere',2.9));motions.push((d)=>{lattice.rotation.y+=d*.06;});}
}
function filament(g,c,motions){
 const steel=chrome(),bulb=sphere(2,glass('#c8deea',.12),0,.5);bulb.scale.y=1.18;g.add(bulb,cylinder(.7,1.1,steel,0,-1.8),cylinder(.5,.2,dark(),0,-2.45));for(let i=0;i<5;i++){const q=ring(.7,.045,solid('#72818c'),0,-1.4-i*.19);q.rotation.x=Math.PI/2;g.add(q);}for(const x of [-.6,.6])g.add(rod(V(x*.4,-1.4,0),V(x,.45,0),.03,steel));const ribbon=tube(Array.from({length:70},(_,i)=>{const t=i/69;return[-.6+1.2*t,.45+Math.sin(t*TAU*9)*.22,Math.cos(t*TAU*9)*.16];}),.026,hot(c.color));g.add(ribbon);const halo=glow(c.color,4.2,.23);halo.position.y=.45;g.add(halo);motions.push((d,t)=>{halo.material.opacity=.2+.015*Math.sin(t*.6);});
}

function phaseDiagram(g,c,motions){
 const tint=c.color||'#d8825a';feet(g,4.6,-2.3);
 g.add(box(4.4,3.4,.16,solid('#24384a'),0,.1,-.3));
 g.add(box(1.5,1.5,.04,solid('#82b7cc',{transparent:true,opacity:.22}),-1.15,.9,-.2));
 g.add(box(1.5,1.5,.04,solid('#d6a36f',{transparent:true,opacity:.22}),.95,.9,-.2));
 g.add(box(2.3,1.8,.04,solid('#8fb59b',{transparent:true,opacity:.22}),-.7,-1.05,-.2));
 g.add(rod(V(-1.9,-1.6,-.18),V(2,-1.6,-.18),.03,chrome()),rod(V(-1.9,-1.6,-.18),V(-1.9,1.9,-.18),.03,chrome()));
 g.add(tube([[-1.9,-1.2,-.16],[-.4,-.1,-.16],[.6,.4,-.16],[1.9,1.8,-.16]],.022,hot(tint)));
 g.add(tube([[-1.9,-1.6,-.16],[-.6,-.2,-.16],[.2,.4,-.16],[1.9,1.6,-.16]],.016,solid('#b5c7d0')));
 const marker=sphere(.12,hot('#f6d9aa'),.2,.4,-.13);g.add(marker,glow('#f6d9aa',1.6,.25));
 motions.push((d,t)=>{marker.scale.setScalar(1+Math.sin(t*.9)*.08);});
}
function thermometer(g,c,motions){
 const tint=c.color||'#d8825a';feet(g,3,-2.3);
 g.add(cylinder(.62,.22,chrome(),0,-2.1),sphere(.5,hot(tint),0,-1.5));
 g.add(cylinder(.16,3.4,glass('#cfe4ee',.35),0,.2),cylinder(.12,2.6,solid(tint,{emissive:tint,emissiveIntensity:.35}),0,0));
 for(let i=0;i<12;i++){const y=-.8+i*.25;g.add(box(.3,.025,.03,chrome(),.36,y,0));}
 const needle=box(.55,.035,.05,hot(tint),.48,1.2,.05);g.add(needle,glow(tint,2.2,.14));
 motions.push((d,t)=>{needle.position.y=1.2+Math.sin(t*.5)*.06;});
}
function heatMap(g,c,motions){
 const tint=c.color||'#93bfb0';feet(g,5,-2.3);
 g.add(box(5.2,3.4,.18,solid('#1d3140'),0,.1,-.4));
 const bands=[['#3b6a9c',-1.1],['#5f97b3',-.55],['#93bfb0',0],['#d3b77d',.55],['#c97a5f',1.1]];
 for(const [color,y] of bands)g.add(box(4.9,.5,.1,solid(color,{emissive:color,emissiveIntensity:.12}),0,y,-.28));
 for(let i=0;i<8;i++)g.add(line([[-2.4,-1.35+i*.34,-.22],[2.4,-1.15+i*.34,-.22]],'#e6f1f4',.25));
 g.add(rod(V(-2.4,-1.7,-.2),V(-2.4,1.7,-.2),.04,chrome()));
 for(let i=0;i<5;i++)g.add(rod(V(-2.4,-1.4+i*.7,-.2),V(-2.1,-1.4+i*.7,-.2),.025,chrome()));
 const probe=sphere(.1,hot('#f2d6a2'),2.1,.6,-.15);g.add(probe,glow(tint,1.6,.2));
 motions.push((d,t)=>{probe.position.y=.6+Math.sin(t*.35)*.5;});
}
function combustion(g,c,motions){
 const tint=c.color||'#e0834f';
 if(c.profile==='incinerator'){
  feet(g,4,-2.2);g.add(box(4.4,3.2,2.6,solid('#5c6870',{metalness:.6}),0,0,-.2),box(3.4,2.2,.1,glass('#e2aa72',.2),0,-.2,1.15));
  for(let i=0;i<4;i++)g.add(rod(V(-1.6,-.8,-.6+i*.42),V(1.6,-.8,-.6+i*.42),.04,chrome()));
  const flame=cylinder(.55,1.5,hot(tint),0,-.1,0,.2);g.add(flame,glow(tint,3.4,.2));
  motions.push((d,t)=>{flame.scale.x=1+Math.sin(t*3)*.05;});
 }else{
  feet(g,6,-2.2);
  const bark=solid('#6b503a',{roughness:1});
  for(let i=0;i<5;i++)g.add(cylinder(.16,1.4,bark,-2+i*1,-.8,Math.sin(i)*.3,.1));
  const flames=new THREE.Group();g.add(flames);
  for(let i=0;i<7;i++){const x=-2.2+i*.72,y=-.9;flames.add(cylinder(.02,1.4,glass(tint,.45),x,y,Math.sin(i)*.3,.35),cylinder(.01,.7,hot('#f2cf8a'),x,y-.1,Math.sin(i)*.3,.18));}
  const smoke=points(90,'#9aa0a0','column',2.2);smoke.position.y=1.2;g.add(smoke);
  motions.push((d,t)=>{flames.rotation.y=Math.sin(t*.2)*.05;smoke.rotation.y=t*.03;});
 }
}

const builders={'metal-furnace':metalFurnace,'cryo-instrument':cryoInstrument,'phase-vessel':phaseVessel,'superconducting-sample':superconductor,kitchen,burner,'rocket-chamber':rocket,'planet-environment':planet,'stellar-atmosphere':stellar,'compact-star':compact,'accretion-disk':accretion,'stellar-event':stellarEvent,nebula,'radiation-field':radiation,'reaction-field':reaction,'filament-lamp':filament,'phase-diagram':phaseDiagram,thermometer,'heat-map':heatMap,combustion};

export function createThermalObject(entry,invalidate=()=>{},visual=entry.visual){
 const config=visual?{...visual,id:entry.id,color:visual.color||'#9cb6c8'}:visual;
 if(!entry?.quantity||entry.quantity.value===null||!Number.isFinite(Number(entry.quantity.value)))throw new Error('A thermal object requires an explicit comparable quantity.');
 if(!config||!builders[config.template])throw new Error(`Unknown thermal template: ${config?.template}`);
 const group=new THREE.Group(),model=new THREE.Group(),motions=[];group.name=`thermal:${entry.id}`;model.name=config.template;group.add(model);builders[config.template](model,config,motions);
 // Normalise only the object. Stable labels remain readable as different subjects replace it.
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(V(0,0,0)),center=bounds.getCenter(V(0,0,0));const norm=entry.id==='temperature.a-type-star'?8.7:entry.id==='temperature.basalt-melting'?8.4:7.5;const scale=norm/Math.max(size.x,size.y,size.z,1);model.position.copy(center).multiplyScalar(-scale);model.scale.setScalar(scale);
 tagged(group,entry.title,-4.05,5.5).userData.hudLabel=true;const readout=String(entry.displayValue||`${entry.quantity.value} ${entry.quantity.unit}`).split('（')[0].trim();tagged(group,readout.length>30?`${readout.slice(0,29)}…`:readout,-4.65,5.6,'#8fbad1').userData.hudLabel=true;
 if(config.symbol)tagged(group,config.symbol,4.15,3,'#8eacbd');
 group.userData={entryId:entry.id,template:config.template,caption:config.caption,note:config.note};invalidate();
 return{group,update(delta,time){for(const animate of motions)animate(Math.min(Math.max(delta||0,0),.1),Number.isFinite(time)?time:0);}};
}
