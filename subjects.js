import * as THREE from 'three';
import {createThermalObject} from './object-templates.js';
import {solid,object,rod,label,glow,line,orbit,surfaceTexture} from '/engine/renderer/subjects.js';
import {createSun} from '/engine/renderer/astro.js';
const sphere=(r,material,x=0,y=0,z=0)=>object(new THREE.SphereGeometry(r,96,72),material,x,y,z);
function ground(group,r=4){const mesh=object(new THREE.CircleGeometry(r,96),solid(0x183245,{transparent:true,opacity:.18,side:THREE.DoubleSide}),0,-3.7,0);mesh.rotation.x=-Math.PI/2;group.add(mesh);}
function vapor(group,count=20,color=0xa3d2ed,baseY=1.2){const particles=[];for(let i=0;i<count;i++){const sprite=glow(color,.7+(i%5)*.13,.08);sprite.position.set(Math.sin(i*6.2)*1.3,baseY+(i/count)*3,Math.cos(i*3.7)*.8);group.add(sprite);particles.push(sprite);}return(delta,time)=>particles.forEach((p,i)=>{p.position.y=baseY+(time*(.3+(i%4)*.06)+i*.17)%3.4;p.position.x=Math.sin(time*.4+i*2.4)*1.4;p.material.opacity=.12*(1-(p.position.y-baseY)/3.4);});}
function beaker(boiling){const group=new THREE.Group(),glass=solid(0x94cbd8,{transparent:true,opacity:.16,roughness:.12,metalness:.05,side:THREE.DoubleSide,depthWrite:false});const vessel=object(new THREE.CylinderGeometry(2,1.85,3.4,80,1,true),glass,0,-.75,0);group.add(vessel);const rim=object(new THREE.TorusGeometry(2,.045,10,100),solid(0x9dcddd,{transparent:true,opacity:.7}),0,.95,0);rim.rotation.x=Math.PI/2;group.add(rim);
 const water=object(new THREE.CylinderGeometry(1.8,1.72,2.2,80),solid(0x2e88ac,{transparent:true,opacity:.2,depthWrite:false}),0,-1.35,0);group.add(water);const top=object(new THREE.CircleGeometry(1.8,100),solid(0x4eb4d2,{transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false}),0,-.25,0);top.rotation.x=-Math.PI/2;group.add(top);
 for(let i=0;i<6;i++){const y=-1.7+i*.4;group.add(line([[1.75,y,.7],[2.03,y,.7]],0xb0d8ea,.6));}
 const name=label(boiling?'H₂O · 373 K':'H₂O · 273 K','#bde5f5',3.3);name.position.set(0,-3.15,1.2);group.add(name);ground(group);
 if(boiling){const bubbles=[];for(let i=0;i<35;i++){const bubble=sphere(.035+(i%5)*.013,new THREE.MeshPhongMaterial({color:0xa8d7e6,transparent:true,opacity:.42,shininess:90,specular:0xdcf3ff}),Math.sin(i*4.7)*1.35,-1.8+(i%13)*.12,Math.cos(i*7.1)*1.1);group.add(bubble);bubbles.push(bubble);}const steam=vapor(group,28,0xc0d0e0,1.05);const heat=glow(0xff8c3b,5.8,.2);heat.position.y=-2.7;group.add(heat);return{group,update(delta,time){steam(delta,time);bubbles.forEach((b,i)=>{b.position.y=-2.15+(time*(.35+(i%5)*.1)+i*.11)%1.85;b.scale.setScalar(.5+(b.position.y+2.15)*.35);});top.rotation.z=time*.1;}};}
 const ice=new THREE.Group();for(let i=0;i<3;i++){const cube=object(new THREE.BoxGeometry(1.25,1.25,1.25),solid(0x9be5f3,{transparent:true,opacity:.52,roughness:.1,metalness:.12}),Math.sin(i*2.4)*.9,.1+(i===0?.35:0),Math.cos(i*2.4)*.65);cube.rotation.set(i*.3,.4+i*.7,.12);cube.add(new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry),new THREE.LineBasicMaterial({color:0xc9f5ff,transparent:true,opacity:.65})));cube.add(line([[-.5,-.5,.632],[.1,.15,.632],[-.1,.5,.632]],0xd6f6ff,.45));ice.add(cube);}group.add(ice);return{group,update(delta,time){ice.rotation.y=Math.sin(time*.07)*.05;ice.position.y=Math.sin(time*.8)*.035;}};
}
function cryostat(){
  // 稀释制冷机的工程化重建：钢架、带螺栓的真空法兰、铜辐射屏蔽、脉冲管冷头、
  // 气体管路与同轴线束。保留前向剖口以露出冷台，但外壳改为厚壁不锈钢而不是玻璃罩。
  const group=new THREE.Group();
  const steel=solid(0xb8c4c8,{metalness:.82,roughness:.3,side:THREE.DoubleSide});
  const steelDark=solid(0x5f6a6f,{metalness:.72,roughness:.42});
  const copper=solid(0xb06a43,{metalness:.8,roughness:.32,side:THREE.DoubleSide});
  const copperLight=solid(0xc98d62,{metalness:.78,roughness:.3,side:THREE.DoubleSide});
  const gold=solid(0xc7a05a,{metalness:.88,roughness:.24,side:THREE.DoubleSide});
  const cableMat=solid(0x20262a,{roughness:.72,metalness:.12});
  const basePlate=object(new THREE.BoxGeometry(5.6,.16,5.6),steelDark,0,-3.3,0);group.add(basePlate);
  for(const x of [-2.5,2.5])for(const z of [-2.5,2.5]){
    group.add(object(new THREE.CylinderGeometry(.22,.26,.28,28),steelDark,x,-3.08,z));
    group.add(object(new THREE.CylinderGeometry(.07,.07,.06,16),steel,x,-2.93,z));
    group.add(rod(new THREE.Vector3(x,-3.2,z),new THREE.Vector3(x,4.45,z),.065,steel));
  }
  // 顶部与底部横梁、斜撑，说明这是一台落地设备而不是悬浮模型。
  for(const y of [4.42,-2.55])group.add(rod(new THREE.Vector3(-2.5,y,-2.5),new THREE.Vector3(2.5,y,-2.5),.055,steelDark),rod(new THREE.Vector3(-2.5,y,2.5),new THREE.Vector3(2.5,y,2.5),.055,steelDark),rod(new THREE.Vector3(-2.5,y,-2.5),new THREE.Vector3(-2.5,y,2.5),.055,steelDark),rod(new THREE.Vector3(2.5,y,-2.5),new THREE.Vector3(2.5,y,2.5),.055,steelDark));
  for(const sgn of [-1,1]){group.add(rod(new THREE.Vector3(sgn*2.5,-2.55,-2.5),new THREE.Vector3(sgn*2.5,-.4,-.0),.032,steelDark),rod(new THREE.Vector3(sgn*2.5,-2.55,2.5),new THREE.Vector3(sgn*2.5,-.4,.0),.032,steelDark));}
  const topPlate=object(new THREE.CylinderGeometry(2.18,2.18,.22,96),steel,0,3.58,0);group.add(topPlate);
  const bottomPlate=object(new THREE.CylinderGeometry(2.18,2.18,.16,96),steelDark,0,-1.55,0);group.add(bottomPlate);
  const flangeRing=object(new THREE.TorusGeometry(2.1,.055,10,100),steel,0,3.72,0);flangeRing.rotation.x=Math.PI/2;group.add(flangeRing);
  // 法兰螺栓：沿圆周一圈六角头，给工程细节提供尺度。
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=1.98;group.add(object(new THREE.CylinderGeometry(.055,.055,.07,6),steelDark,Math.cos(a)*r,3.76,Math.sin(a)*r));}
  // 真空筒：厚壁不锈钢，前向剖口；内壁做一层略暗的衬里。
  const gap=.7*Math.PI,startAngle=gap*.5,span=Math.PI*2-gap;
  const vacuum=object(new THREE.CylinderGeometry(1.95,1.95,5.05,96,1,true,startAngle,span),steel,0,1.02,0);
  const liner=object(new THREE.CylinderGeometry(1.88,1.88,5.0,96,1,true,startAngle,span),solid(0x8d999d,{metalness:.55,roughness:.5,side:THREE.DoubleSide}),0,1.02,0);
  group.add(vacuum,liner);
  // 前向剖口边缘：两侧竖直厚壁和上下沿口，避免看起来像一张薄片。
  for(const a of [startAngle,startAngle+span])group.add(rod(new THREE.Vector3(Math.cos(a)*1.95,-1.5,Math.sin(a)*1.95),new THREE.Vector3(Math.cos(a)*1.95,3.53,Math.sin(a)*1.95),.045,steel));
  // 真空接口、阀门和规管。
  const port=object(new THREE.CylinderGeometry(.16,.19,.55,28),steel,-1.95,2.55,1.0);port.rotation.z=Math.PI/2;group.add(port);
  const portFlange=object(new THREE.CylinderGeometry(.25,.25,.1,28),steel,-2.22,2.55,1.0);portFlange.rotation.z=Math.PI/2;group.add(portFlange);
  const gauge=object(new THREE.CylinderGeometry(.19,.19,.10,32),steelDark,-2.6,3.0,.95);gauge.rotation.x=Math.PI/2;group.add(gauge);
  const dial=object(new THREE.CircleGeometry(.15,32),solid(0xd9e2e2,{roughness:.55}),-2.6,3.0,1.06);group.add(dial);
  group.add(rod(new THREE.Vector3(-2.45,3.0,.95),new THREE.Vector3(-2.2,2.55,.98),.022,steel));
  const valveStem=object(new THREE.CylinderGeometry(.055,.055,.5,20),steel,2.05,3.0,.8);valveStem.rotation.z=-.5;group.add(valveStem);
  const wheel=object(new THREE.TorusGeometry(.2,.025,8,40),solid(0x9e3f31,{metalness:.35,roughness:.5}),2.25,3.15,.8);wheel.rotation.y=.35;group.add(wheel);
  // 三层铜辐射屏蔽，最内层镀金；每层都有底板与边缘螺栓。
  const shields=[
    {r:1.56,h:4.2,y:.9,mat:copper},
    {r:1.28,h:3.3,y:.72,mat:copperLight},
    {r:1.0,h:2.4,y:.5,mat:gold}
  ];
  for(const sh of shields){
    group.add(object(new THREE.CylinderGeometry(sh.r,sh.r,sh.h,86,1,true,startAngle,span),sh.mat,0,sh.y,0));
    group.add(object(new THREE.CylinderGeometry(sh.r,sh.r,.05,86,1,false,startAngle,span),sh.mat,0,sh.y+sh.h/2,0));
    group.add(object(new THREE.CylinderGeometry(sh.r*.96,sh.r*.96,.05,86,1,false,startAngle,span),sh.mat,0,sh.y-sh.h/2,0));
    for(let i=0;i<8;i++){const a=startAngle+.06+i/7*(span-.12);group.add(rod(new THREE.Vector3(Math.cos(a)*sh.r*.98,sh.y-sh.h/2+.04,Math.sin(a)*sh.r*.98),new THREE.Vector3(Math.cos(a)*sh.r*.98,sh.y+sh.h/2-.04,Math.sin(a)*sh.r*.98),.012,steelDark));}
  }
  // 冷台：从 4 K 级到混合室，逐级收窄；样品架在最底部。
  const stageCopper=copperLight;
  group.add(object(new THREE.CylinderGeometry(.62,.68,.14,48),stageCopper,0,-1.15,0));
  group.add(object(new THREE.CylinderGeometry(.48,.56,.12,48),stageCopper,0,-1.34,0));
  group.add(object(new THREE.CylinderGeometry(.34,.42,.12,40),gold,0,-1.52,0));
  const sampleHolder=object(new THREE.CylinderGeometry(.17,.17,.10,32),steelDark,0,-1.7,0);group.add(sampleHolder);
  const sample=sphere(.13,solid(0x86d8e5,{emissive:0x1b6f86,transparent:true,opacity:.7,roughness:.2}),0,-1.85,0);group.add(sample,glow(0x79d7e8,.85,.18));
  // 同轴线束：从顶部接插件沿屏蔽层间隙垂到冷台，避免“整齐直杆”的不真实感。
  for(let i=0;i<7;i++){
    const a=startAngle+.18+i*.17,r=.82+i*.045,topY=3.46,midY=1.0;
    const curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(a)*1.35,topY,Math.sin(a)*1.35),
      new THREE.Vector3(Math.cos(a)*r,midY,Math.sin(a)*r),
      new THREE.Vector3(Math.cos(a+.15)*.42,-.9,Math.sin(a+.15)*.42),
      new THREE.Vector3(Math.cos(a+.2)*.24,-1.55,Math.sin(a+.2)*.24)
    ]);
    group.add(object(new THREE.TubeGeometry(curve,36,.011,5,false),cableMat));
    group.add(object(new THREE.CylinderGeometry(.035,.035,.08,10),steel,Math.cos(a)*1.35,3.48,Math.sin(a)*1.35));
  }
  // 脉冲管冷头：顶部马达、波纹管与支撑法兰。
  const pulse=object(new THREE.CylinderGeometry(.19,.24,1.55,32),steel,0,4.45,-.1);group.add(pulse);
  const pulseMotor=object(new THREE.CylinderGeometry(.34,.34,.48,32),steelDark,0,5.5,-.1);group.add(pulseMotor);
  group.add(object(new THREE.CylinderGeometry(.36,.36,.08,32),steel,0,5.76,-.1));
  group.add(object(new THREE.CylinderGeometry(.09,.09,.8,20),copper,0,4.0,-.75));
  for(let i=0;i<5;i++)group.add(object(new THREE.CylinderGeometry(.225,.225,.025,24),copperLight,0,3.8+i*.13,-.1));
  // 气体管路：从顶部法兰接到侧面阀箱，用弯管而不是两根斜杆。
  const gasCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.55,3.72,-.8),new THREE.Vector3(-1.35,4.3,-1.0),new THREE.Vector3(-2.0,4.0,-.55),new THREE.Vector3(-2.05,3.3,-.3)
  ]);
  group.add(object(new THREE.TubeGeometry(gasCurve,30,.045,8,false),copper));
  const gasBox=object(new THREE.BoxGeometry(.42,.3,.3),steelDark,-2.2,3.12,-.25);group.add(gasBox);
  const tag=label('稀释制冷机 · 真空腔与冷台剖视','#a8d2f0',4.4);tag.position.set(0,-3.62,.2);group.add(tag);
  const coldLight=glow(0x6acfff,2.0,.11);coldLight.position.set(0,-1.8,0);group.add(coldLight);
  return{group,update(delta,time){sample.rotation.y+=delta*.1;sample.material.opacity=.64+Math.sin(time*.5)*.04;coldLight.material.opacity=.10+Math.sin(time*.35)*.015;}};
}
function atomTrap(){const group=new THREE.Group(),metal=solid(0xa6becb,{metalness:.75,roughness:.3});const chamber=sphere(2.2,solid(0x709cb6,{transparent:true,opacity:.08,side:THREE.DoubleSide,depthWrite:false}));group.add(chamber);for(let i=0;i<3;i++){const ring=object(new THREE.TorusGeometry(2.35,.07,12,120),metal);ring.rotation.set(i===0?Math.PI/2:0,i===1?Math.PI/2:0,0);group.add(ring);const color=[0xf76666,0x7cb6ff,0x80d0c1][i],beam=rod(new THREE.Vector3(i===0?-4:0,i===1?-3:0,i===2?-4:0),new THREE.Vector3(i===0?4:0,i===1?3:0,i===2?4:0),.018,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.55}));group.add(beam);}
 const cloud=sphere(.46,solid(0x9ac9ff,{emissive:0x5a8cd1,transparent:true,opacity:.5}));cloud.scale.y=.55;group.add(cloud,glow(0x83b5ff,2,.45));const tag=label('冷原子云 · 原子阱','#b2d5ff',4);tag.position.set(0,-3.4,0);group.add(tag);return{group,update(delta,time){cloud.scale.set(.9+Math.sin(time*.4)*.04,.52,1);}};}
function nitrogen(){const group=new THREE.Group(),metal=solid(0xa4b9ca,{metalness:.85,roughness:.3});group.add(object(new THREE.CylinderGeometry(1.6,1.4,4,80),metal,0,-.7,0));const neck=object(new THREE.CylinderGeometry(.8,.95,1.1,64,1,true),solid(0x80b2d1,{metalness:.65,roughness:.25,side:THREE.DoubleSide}),0,1.8,0);group.add(neck);const rim=object(new THREE.TorusGeometry(.82,.1,12,100),metal,0,2.35,0);rim.rotation.x=Math.PI/2;group.add(rim);const band=object(new THREE.CylinderGeometry(1.62,1.62,.4,80),solid(0x335c7e,{metalness:.3}),0,-.7,0);group.add(band);const tag=label('N₂ · 77 K','#c3e6ff',2.5);tag.position.set(0,-.6,1.65);group.add(tag);const mist=vapor(group,35,0xc0e2f2,2.4);ground(group,3.8);return{group,update:mist};}
function human(){const group=new THREE.Group(),figure=new THREE.Group();figure.position.x=-1.1;const warm=solid(0xf67546,{roughness:.5,emissive:0x3b100c}),orange=solid(0xf7ac6a),cool=solid(0x4676af),mid=solid(0x789cb4);figure.add(sphere(.48,orange,0,2.95,0),object(new THREE.CylinderGeometry(.18,.21,.42,24),orange,0,2.43,0));figure.add(object(new THREE.CapsuleGeometry(.57,1.5,12,32),warm,0,1.05,0));figure.add(object(new THREE.CapsuleGeometry(.5,.4,12,24),solid(0xdfa970),0,-.6,0));for(const side of [-1,1]){figure.add(sphere(.28,orange,side*.65,1.65,0),sphere(.18,mid,side*.94,-.12,0),sphere(.18,mid,side*.97,-1.4,0));const upper=object(new THREE.CapsuleGeometry(.2,1.25,10,20),orange,side*.83,.7,0);upper.rotation.z=side*.11;figure.add(upper,object(new THREE.CapsuleGeometry(.17,.9,10,20),mid,side*.97,-.75,0));figure.add(object(new THREE.CapsuleGeometry(.24,1.9,10,24),cool,side*.32,-2.1,0));}group.add(figure);
 const tube=object(new THREE.CylinderGeometry(.13,.13,5.5,32),solid(0xaacbda,{transparent:true,opacity:.22,side:THREE.DoubleSide}),2.6,.05,0);group.add(tube);group.add(object(new THREE.CylinderGeometry(.065,.065,3.7,24),new THREE.MeshBasicMaterial({color:0xff7653}),2.6,-.85,.03),sphere(.27,new THREE.MeshBasicMaterial({color:0xff7653}),2.6,-2.7,0));for(let i=0;i<12;i++)group.add(line([[2.85,-2.4+i*.44,0],[3.1,-2.4+i*.44,0]],0xaec7db,.65));const tag=label('≈ 37°C','#f5c8a5',3);tag.position.set(2.7,3.25,0);group.add(tag);ground(group,4.4);return{group,update(delta,time){figure.rotation.y=Math.sin(time*.14)*.06;}};}
function sun(invalidate,core=false){
 const group=new THREE.Group();
 if(!core){
  const star=createSun({radius:3.6,hot:'#ffb13a',cool:'#c42300',intensity:1.0,detail:1.6,map:surfaceTexture('sun.jpg',invalidate),tint:'#fff2d8'});
  star.add(glow(0xff7d24,11,.35),glow(0xffb75a,8.3,.25));group.add(star);
  return{group,update(delta,time){star.userData.update?.(delta,time);}};
 }
 const outer=sphere(4,new THREE.MeshBasicMaterial({map:surfaceTexture('sun.jpg',invalidate),color:0xf19a57,transparent:true,opacity:.15,side:THREE.DoubleSide,depthWrite:false}));
 const coreStar=createSun({radius:1.7,hot:'#ffd08a',cool:'#d24600',intensity:1.1,detail:1.3,map:surfaceTexture('sun.jpg',invalidate),tint:'#fff2d8'});
 const halo=glow(0xffa84e,6,.5);
 group.add(outer,sphere(3.2,solid(0xe56f39,{transparent:true,opacity:.12,emissive:0x481100,side:THREE.DoubleSide,depthWrite:false})),coreStar,halo);
 for(const radius of [1.7,3.2,4]){const ring=object(new THREE.TorusGeometry(radius,.018,10,160),new THREE.MeshBasicMaterial({color:0xffc795,transparent:true,opacity:.65}));ring.rotation.y=.35;group.add(ring);}
 const tags=[['核心',0,.2,2.4],['辐射与对流区',2.2,-2.6,1.2],['光球层',3.5,2.6,1]];for(const [text,x,y,z]of tags){const tag=label(text,'#ffe0b6',2.5);tag.position.set(x,y,z);group.add(tag);}
 return{group,update(delta,time){outer.rotation.y+=delta*.017;coreStar.userData.update?.(delta,time);halo.material.opacity=.4+Math.sin(time*.7)*.07;}};
}
function planck(){const group=new THREE.Group();for(let i=0;i<12;i++){const ring=object(new THREE.TorusGeometry(2.6+i*.13,.014,6,120,Math.PI*1.65),new THREE.MeshBasicMaterial({color:i%2?0xc4a9ff:0x8ad4ff,transparent:true,opacity:.35,blending:THREE.AdditiveBlending}));ring.rotation.set(i*.6,i*.9,i*.3);group.add(ring);}group.add(glow(0xdbb6ff,9,.5),sphere(.6,new THREE.MeshBasicMaterial({color:0xf5e3ff})));const tag=label('普朗克温度 · 理论能标','#e5cdff',5);tag.position.set(0,-4.1,0);group.add(tag);return{group,update(delta){group.rotation.y+=delta*.025;}};}
export const thermalSubjects={
 'temperature.object':(invalidate,entry)=>createThermalObject(entry,invalidate,entry.visual),
 'temperature.absolute-zero':cryostat,'temperature.bose-einstein':atomTrap,'temperature.liquid-nitrogen':nitrogen,
 'temperature.water-freezing':()=>beaker(false),'temperature.human-body':human,'temperature.boiling-water':()=>beaker(true),
 'temperature.sun-surface':invalidate=>sun(invalidate,false),'temperature.sun-core':invalidate=>sun(invalidate,true),'temperature.planck-temperature':planck
};

