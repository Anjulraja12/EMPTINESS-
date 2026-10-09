"use client";
import{forwardRef,useEffect,useImperativeHandle,useRef}from"react";
import*as THREE from"three";
import{GLTFLoader}from"three/addons/loaders/GLTFLoader.js";
import{MeshSurfaceSampler}from"three/addons/math/MeshSurfaceSampler.js";

export type RayoneHandle={
 setState:(s:"idle"|"listening"|"thinking"|"speaking")=>void;
 setShape:(nameOrText:string|number)=>void;
 customShape:(parts:any[],name?:string)=>void;
 pulse:()=>void;
 setLevel:(v:number)=>void;
 listen:()=>Promise<void>;
 speak:(text:string)=>void;
 handleText:(text:string)=>Promise<void>;
 activate:()=>void;
};

type Props={state?:string;shape?:string;level?:number;onReply?:(t:string)=>void;onTranscript?:(t:string)=>void;onStatus?:(t:string)=>void;onShape?:(n:string)=>void;onFormed?:()=>void;onScattered?:()=>void;onMicState?:(on:boolean)=>void};

const RayoneNative=forwardRef<RayoneHandle,Props>(function RayoneNative({state="idle",shape="sphere",level=0,onReply,onTranscript,onStatus,onShape,onFormed,onScattered,onMicState},ref){
 const host=useRef<HTMLDivElement>(null),activateButton=useRef<HTMLButtonElement>(null),homeActiveRef=useRef(true),stateRef=useRef(state),levelRef=useRef(level),targetRef=useRef(shape),apiRef=useRef<RayoneHandle|null>(null);
 useEffect(()=>{if(state!=="idle")stateRef.current=state},[state]);useEffect(()=>{levelRef.current=level},[level]);
 useImperativeHandle(ref,()=>({setState:s=>apiRef.current?.setState(s),setShape:x=>apiRef.current?.setShape(x),customShape:(parts,name)=>apiRef.current?.customShape(parts,name),pulse:()=>apiRef.current?.pulse(),setLevel:v=>apiRef.current?.setLevel(v),listen:async()=>{await apiRef.current?.listen()},speak:text=>apiRef.current?.speak(text),handleText:async text=>{await apiRef.current?.handleText(text)},activate:()=>apiRef.current?.activate() }),[]);

 useEffect(()=>{
  const el=host.current;if(!el)return;
  const homeSection=el.closest(".homeRayone") as HTMLElement|null;
  let homeObserver:IntersectionObserver|null=null;
  if(homeSection){
   homeActiveRef.current=false;
   if(activateButton.current){activateButton.current.style.pointerEvents="none";activateButton.current.setAttribute("aria-disabled","true")}
   homeObserver=new IntersectionObserver(entries=>{const visible=entries[0]?.isIntersecting===true;homeActiveRef.current=visible;if(activateButton.current){activateButton.current.style.pointerEvents=visible?"auto":"none";activateButton.current.setAttribute("aria-disabled",visible?"false":"true")}if(!visible){stateRef.current="idle"}},{threshold:.35});
   homeObserver.observe(homeSection);
  }
  const slow=(navigator.hardwareConcurrency||4)<=4||innerWidth<700,N=slow?15000:34000;
  const renderer=new THREE.WebGLRenderer({antialias:false,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0x050607,0);renderer.domElement.style.width="100%";renderer.domElement.style.height="100%";renderer.domElement.style.display="block";renderer.domElement.style.pointerEvents="none";el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,1,.1,50),R=Math.random,g=()=> (R()+R()+R()-1.5)*.5;
  const rv=()=>{const u=R()*2-1,a=R()*Math.PI*2,q=Math.sqrt(1-u*u);return[Math.cos(a)*q,u,Math.sin(a)*q]};
  function human(){
   const sphere=(cx:number,cy:number,cz:number,rx:number,ry:number,rz:number)=>{const v=rv();return[cx+v[0]*rx,cy+v[1]*ry,cz+v[2]*rz]};
   const cyl=(p:number[],q:number[],rad:number)=>{const a=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],L=Math.hypot(...a)||1,n=a.map(v=>v/L),v=rv(),d=v[0]*n[0]+v[1]*n[1]+v[2]*n[2],w=[v[0]-d*n[0],v[1]-d*n[1],v[2]-d*n[2]],W=Math.hypot(...w)||1,u=R();return[p[0]+a[0]*u+w[0]/W*rad,p[1]+a[1]*u+w[1]/W*rad,p[2]+a[2]*u+w[2]/W*rad]};
   const r=R();
   if(r<.16)return sphere(0,.94,0,.16,.18,.14);
   if(r<.19)return cyl([0,.77,0],[0,.66,0],.075);
   if(r<.46){const u=R(),a=R()*Math.PI*2,rr=Math.sqrt(R());return[(-.30+.60*u)*.96, .20+Math.cos(a)*.43*rr, Math.sin(a)*.24*rr];}
   if(r<.57){const side=R()<.5?-1:1,u=R();return cyl([side*.27,.48,0],[side*.62,.17,0],.075+u*.025)}
   if(r<.67){const side=R()<.5?-1:1;return cyl([side*.62,.17,0],[side*.67,-.25,0],.065)}
   if(r<.77){const side=R()<.5?-1:1;return cyl([side*.17,-.20,0],[side*.18,-.73,0],.115)}
   if(r<.91){const side=R()<.5?-1:1;return cyl([side*.18,-.73,0],[side*.20,-1.18,.01],.085)}
   const side=R()<.5?-1:1;return sphere(side*.21,-1.27,.055,.12,.055,.22);
  }

  const fns=[()=>{const d=rv(),k=1.5+g()*.08;return[d[0]*k,d[1]*k,d[2]*k]},()=>{const t=R()*Math.PI*2,m=1.1+.35*Math.cos(3*t);return[m*Math.cos(2*t)*1.1+g()*.12,.7*Math.sin(3*t)+g()*.12,m*Math.sin(2*t)*1.1+g()*.12]},human,()=>{const t=R()*Math.PI*2,k=Math.pow(R(),.35)*.095;return[16*Math.pow(Math.sin(t),3)*k,(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*k-.05,g()*.9*Math.pow(R(),.3)]},()=>{const t=(R()*2-1)*3,s=R()<.5?0:Math.PI,r=.9;return R()<.12?(()=>{const f=1-2*R();return[Math.cos(t*2)*r*f,t*.5,Math.sin(t*2)*r*f]})():[Math.cos(t*2+s)*r+g()*.08,t*.5,Math.sin(t*2+s)*r+g()*.08]}];
  const A=fns.map(f=>{const a=new Float32Array(N*3);for(let i=0;i<N;i++){const p=f();a[i*3]=p[0];a[i*3+1]=p[1];a[i*3+2]=p[2]}let cx=0,cy=0,cz=0;for(let i=0;i<N;i++){cx+=a[i*3];cy+=a[i*3+1];cz+=a[i*3+2]}cx/=N;cy/=N;cz/=N;let ex=.01;for(let i=0;i<N;i++){a[i*3]-=cx;a[i*3+1]-=cy;a[i*3+2]-=cz;ex=Math.max(ex,Math.abs(a[i*3]),Math.abs(a[i*3+1]),Math.abs(a[i*3+2]))}const s=1.6/ex;for(let i=0;i<N*3;i++)a[i]*=s;return a});A.push(new Float32Array(N*3),new Float32Array(N*3),new Float32Array(N*3));
  const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,Number(v)||0)),V=(a:any)=>[clamp(a?.[0],-3,3),clamp(a?.[1],-3,3),clamp(a?.[2],-3,3)];
  const custom=(parts:any[],name="custom")=>{const slot=targetSlot===5?6:5;parts=Array.isArray(parts)?parts.slice(0,24):[];const norm=parts.map(o=>({t:o.t,p:V(o.p),q:V(o.q||o.p),d:[clamp(o.d?.[0],.02,3),clamp(o.d?.[1],.02,3),clamp(o.d?.[2],.02,3)],w:clamp(o.w==null?1:o.w,.05,10)})).filter(o=>["s","e","c","b","r","k"].includes(o.t));if(!norm.length)return;let total=0;const weights=norm.map(o=>total+=o.w),out=A[slot];for(let i=0;i<N;i++){const rr=R()*total;let k=0;while(weights[k]<rr&&k<norm.length-1)k++;const o=norm[k],p=o.p,d=o.d;let x=0,y=0,z=0;if(o.t==="s"){const v=rv();x=p[0]+v[0]*d[0];y=p[1]+v[1]*d[0];z=p[2]+v[2]*d[0]}else if(o.t==="e"){const v=rv();x=p[0]+v[0]*d[0];y=p[1]+v[1]*d[1];z=p[2]+v[2]*d[2]}else if(o.t==="c"){const q=o.q,ax=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],L=Math.hypot(...ax)||1,a=ax.map((v:number)=>v/L),v=rv(),dt=v[0]*a[0]+v[1]*a[1]+v[2]*a[2],pw=[v[0]-dt*a[0],v[1]-dt*a[1],v[2]-dt*a[2]],wl=Math.hypot(...pw)||1,u=R();x=p[0]+ax[0]*u+pw[0]/wl*d[0];y=p[1]+ax[1]*u+pw[1]/wl*d[0];z=p[2]+ax[2]*u+pw[2]/wl*d[0]}else if(o.t==="b"){const f=(R()*3)|0,u=[(R()*2-1)*d[0],(R()*2-1)*d[1],(R()*2-1)*d[2]];u[f]=(R()<.5?-1:1)*d[f];x=p[0]+u[0];y=p[1]+u[1];z=p[2]+u[2]}else if(o.t==="r"){const u=R()*Math.PI*2,v=R()*Math.PI*2,rr=d[0]+d[1]*Math.cos(v);x=p[0]+rr*Math.cos(u);y=p[1]+rr*Math.sin(u);z=p[2]+d[1]*Math.sin(v)}else{const u=R()*Math.PI*2,q=R(),rr=(1-q)*d[0];x=p[0]+Math.cos(u)*rr;y=p[1]+q*d[1];z=p[2]+Math.sin(u)*rr}out[i*3]=x+g()*.03;out[i*3+1]=y+g()*.03;out[i*3+2]=z+g()*.03}let mx=0,my=0,mz=0,ex=.01;for(let i=0;i<N;i++){mx+=out[i*3];my+=out[i*3+1];mz+=out[i*3+2]}mx/=N;my/=N;mz/=N;for(let i=0;i<N;i++){out[i*3]-=mx;out[i*3+1]-=my;out[i*3+2]-=mz;ex=Math.max(ex,Math.abs(out[i*3]),Math.abs(out[i*3+1]),Math.abs(out[i*3+2]))}const scale=1.6/ex;for(let i=0;i<N*3;i++)out[i]*=scale;targetSlot=slot;targetName=name||"custom";selectedSlot=slot;targetRef.current=targetName;geo.attributes.aTo.array.set(A[slot]);geo.attributes.aTo.needsUpdate=true;morph=0;onShape?.(targetName)};
  const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(A[0].slice(),3));geo.setAttribute("aTo",new THREE.BufferAttribute(A[1].slice(),3));
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uMix:{value:0},uTime:{value:0},uAmp:{value:1},uBr:{value:0},uMouth:{value:0},uHuman:{value:0},uSize:{value:(slow?20:24)*renderer.getPixelRatio()}},vertexShader:`attribute vec3 aTo;uniform float uMix,uTime,uAmp,uBr,uMouth,uHuman,uSize;varying float vD;varying vec3 vC;void main(){vec3 p=mix(position,aTo,uMix);float n=sin(p.x*2.+uTime)+sin(p.y*2.3+uTime*1.2)+sin(p.z*1.9+uTime*.8);float na=mix(1.,.35,uHuman);p+=normalize(p+.001)*n*.018*uAmp*na;float d=(sin(uTime*1.15+p.x*2.1)+cos(uTime*.9+p.y*1.7))*.012;if(uAmp==0.0&&d!=0.0&&uMix==0.0)p+=vec3(d,d*.7,-d*.5);float mo=uMouth*uHuman*step(abs(p.x),.24)*step(abs(p.y-.25),.07)*step(.3,p.z);p.y+=mo*(p.y>.25?.1:-.1);p*=1.+uBr;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uSize/-mv.z;vD=smoothstep(-2.,2.,p.z);vC=mix(vec3(.05,.85,1.),vec3(.6,.3,1.),smoothstep(-1.6,1.6,p.y+sin(uTime*.5+p.x)*.4));}`,fragmentShader:`varying float vD;varying vec3 vC;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=pow(1.-d*2.,2.);gl_FragColor=vec4(vC*(.5+1.1*vD),a*.55);}`});
  const pts=new THREE.Points(geo,mat);scene.add(pts);
  // Build a true bust point cloud: preserve the scanned facial surface, then add
  // sampled neck/shoulder/chest surfaces below it so the silhouette reads as a person.
  let humanLoadCancelled=false;
  new GLTFLoader().load("https://threejs.org/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb",gltf=>{
   if(humanLoadCancelled)return;
   const meshes:THREE.Mesh[]=[];
   gltf.scene.updateMatrixWorld(true);
   gltf.scene.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=o as THREE.Mesh;if(m.geometry?.attributes?.position)meshes.push(m)}});
   if(!meshes.length)return;
   const samplers=meshes.map(mesh=>({mesh,sampler:new MeshSurfaceSampler(mesh).build()}));
   const headCount=Math.floor(N*.70),raw=new Float32Array(N*3),p=new THREE.Vector3();
   let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
   const head=new Float32Array(headCount*3);
   for(let i=0;i<headCount;i++){
    const entry=samplers[(R()*samplers.length)|0];entry.sampler.sample(p);p.applyMatrix4(entry.mesh.matrixWorld);
    head[i*3]=p.x;head[i*3+1]=p.y;head[i*3+2]=p.z;
    minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z);
   }
   const cx=(minX+maxX)/2,cy=(minY+maxY)/2,cz=(minZ+maxZ)/2;
   const sx=Math.max(.001,(maxX-minX)/2),sy=Math.max(.001,maxY-minY),sz=Math.max(.001,(maxZ-minZ)/2);
   // The scanned head occupies the upper part of the bust, keeping face proportions.
   for(let i=0;i<headCount;i++){
    const x=(head[i*3]-cx)/sx*.70;
    const y=.08+(head[i*3+1]-minY)/sy*1.34;
    const z=(head[i*3+2]-cz)/sz*.55;
    // Turn the scan just enough to give the face a natural three-quarter view.
    const angle=-.22,xx=x*Math.cos(angle)-z*Math.sin(angle),zz=x*Math.sin(angle)+z*Math.cos(angle);
    raw[i*3]=xx;raw[i*3+1]=y;raw[i*3+2]=zz;
   }
   // The remaining points lie on smooth, anatomically connected neck and shoulder/chest surfaces.
   const ellipsoid=(cx:number,cy:number,cz:number,rx:number,ry:number,rz:number)=>{
    const v=rv();return[cx+v[0]*rx,cy+v[1]*ry,cz+v[2]*rz];
   };
   for(let i=headCount;i<N;i++){
    const u=R();
    let q:number[];
    if(u<.30){
     // Neck surface rises into the jaw instead of reading as a separate cylinder.
     q=ellipsoid(0,-.20,0,.255,.48,.27);
    }else{
     // Broad shoulder line and upper chest, sampled as one soft bust silhouette.
     q=ellipsoid(0,-.70,-.015,1.02,.58,.48);
     // Flatten the lower edge slightly like a portrait bust crop.
     if(q[1]<-1.38)q[1]=-1.38+R()*.035;
    }
    raw[i*3]=q[0];raw[i*3+1]=q[1];raw[i*3+2]=q[2];
   }
   // Center and fit the complete bust consistently without collapsing its shoulders.
   let bx=0,by=0,bz=0;for(let i=0;i<N;i++){bx+=raw[i*3];by+=raw[i*3+1];bz+=raw[i*3+2]}bx/=N;by/=N;bz/=N;
   let ex=.01;for(let i=0;i<N;i++){raw[i*3]-=bx;raw[i*3+1]-=by;raw[i*3+2]-=bz;ex=Math.max(ex,Math.abs(raw[i*3]),Math.abs(raw[i*3+1]),Math.abs(raw[i*3+2]))}
   const scale=1.52/ex;for(let i=0;i<N*3;i++)raw[i]*=scale;
   A[2].set(raw);
   if(targetSlot===2||currentSlot===2){geo.attributes.aTo.array.set(A[2]);geo.attributes.aTo.needsUpdate=true;if(currentSlot===2&&morph<0){geo.attributes.position.array.set(A[2]);geo.attributes.position.needsUpdate=true}}
  },undefined,()=>{});
let currentSlot=7,targetSlot=7,selectedSlot=2,morph=-1,targetName="human",env=0,amp=1,spin=.15,hum=0,mouth=0,last=performance.now(),t=0,raf=0,inactivityTimer:ReturnType<typeof setTimeout>|null=null;
  const names=["sphere","knot","human","heart","dna"],kw=[["sphere","ball","gola","गोला","normal","default","wapas","वापस"],["knot","quantum","गांठ"],["human","insan","insaan","इंसानी","इंसान","इन्सान","मानव","manav","aadmi","आदमी","person","face","chehra","चेहरा","bust","woman","man"],["heart","dil","दिल","love"],["dna","helix","डीएनए"]];
  const detect=(x:string)=>{const ws=String(x).toLowerCase().split(/[^\p{L}\p{M}]+/u);for(let i=kw.length-1;i>=0;i--)if(ws.some(w=>kw[i].includes(w)||(i===2&&(w.startsWith("insa")||w.startsWith("human")))))return i;return -1};
  const center=()=>{const i=selectedSlot>=0&&selectedSlot<names.length?selectedSlot:2;targetRef.current=names[i];targetSlot=i;geo.attributes.aTo.array.set(A[i]);geo.attributes.aTo.needsUpdate=true;if(currentSlot!==i||morph>=0)morph=0};
  const armTimeout=()=>{if(inactivityTimer)clearTimeout(inactivityTimer);inactivityTimer=setTimeout(()=>{if(stateRef.current==="thinking"){stateRef.current="idle"}},10000)};
  const activate=()=>{if(homeSection&&!homeActiveRef.current)return;center();stateRef.current="thinking";armTimeout()};
  const setShape=(x:string|number)=>{const i=typeof x==="number"?x:detect(x);if(i<0||i>=names.length)return;targetRef.current=names[i];selectedSlot=i;if(stateRef.current==="idle")return;if(i===currentSlot&&morph<0)return;targetSlot=i;geo.attributes.aTo.array.set(A[i]);geo.attributes.aTo.needsUpdate=true;morph=0};
  const resize=()=>{const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();camera.position.z=9;pts.position.set(0,0,0);pts.scale.set(1,1,1);const halfH=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*(camera.position.z-1.5),halfW=halfH*(w/h),spread=A[7];for(let i=0;i<N;i++){spread[i*3]=(R()*2-1)*halfW;spread[i*3+1]=(R()*2-1)*halfH;spread[i*3+2]=(R()*2-1)*1.8}if(currentSlot===7&&morph<0){geo.attributes.position.array.set(spread);geo.attributes.position.needsUpdate=true}if(stateRef.current==="idle"&&targetSlot===7){geo.attributes.aTo.array.set(spread);geo.attributes.aTo.needsUpdate=true}};resize();addEventListener("resize",resize);
  const speak=async(text:string)=>{if(typeof speechSynthesis==="undefined"){stateRef.current="thinking";armTimeout();return}if(inactivityTimer)clearTimeout(inactivityTimer);stateRef.current="speaking";const u=new SpeechSynthesisUtterance(text);u.lang=/[\u0900-\u097F]/.test(text)?"hi-IN":"en-IN";u.onstart=()=>{stateRef.current="speaking"};u.onboundary=()=>{env=Math.max(env,.72)};u.onend=()=>{stateRef.current="thinking";armTimeout()};speechSynthesis.cancel();speechSynthesis.speak(u)};
  const ask=async(messages:any[])=>{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages})});if(!r.ok)throw new Error("http "+r.status);const j=await r.json();return j.reply||""};
  const sys="You are RAYONE, a concise, warm AI assistant. Reply in the same language the user writes in (Hinglish/Hindi/English), max 3 short sentences.";
  const shapeSys='Convert the request into a 3D point-cloud object. Reply ONLY JSON: {"name":"short english name","parts":[{"t":"s","p":[x,y,z],"d":[r],"w":1}]}. Types: s sphere, e ellipsoid, c cylinder/limb p-to-q, b box, r torus, k cone. y is up, object faces +z, fit -1.5..1.5, use 8-20 parts, weights .05-10. If not an object reply {"name":"none","parts":[]}';
  const handleText=async(text:string)=>{const q=text.trim();if(!q)return;center();stateRef.current="thinking";armTimeout();const k=detect(q);try{if(k>=0){setShape(k);const reply=await ask([{role:"system",content:sys},{role:"user",content:q}]);onReply?.(reply);await speak(reply);return}if(/(bana|banao|bano|dikha|show|make|become|turn into|shape|form|draw|create|बना|बनो|दिखा|आकार)/i.test(q)){const raw=await ask([{role:"user",content:shapeSys+"\nRequest: "+q}]);const parsed=JSON.parse(raw.slice(raw.indexOf("{"),raw.lastIndexOf("}")+1));if(parsed?.parts?.length){custom(parsed.parts,parsed.name||"custom");onStatus?.("Shape तैयार है");await speak("यह रहा "+(parsed.name||"आपका आकार"));return}}if(k<0&&selectedSlot!==7){targetSlot=selectedSlot;geo.attributes.aTo.array.set(A[selectedSlot]);geo.attributes.aTo.needsUpdate=true;morph=0}const reply=await ask([{role:"system",content:sys},{role:"user",content:q}]);onReply?.(reply);await speak(reply)}catch{onStatus?.("RAYONE अभी उपलब्ध नहीं है।");stateRef.current="idle";armTimeout()}};
  let stream:MediaStream|null=null,ctx:AudioContext|null=null,recorder:MediaRecorder|null=null,micWanted=false,recorded:BlobPart[]=[],speechSeen=false,lastVoice=0,transcribing=false,levelRaf=0,audioSmooth=0,visualAmp=0;
  const stopMic=()=>{if(levelRaf)cancelAnimationFrame(levelRaf);levelRaf=0;stream?.getTracks().forEach(t=>t.stop());stream=null;ctx?.close();ctx=null;recorder=null;recorded=[];speechSeen=false;lastVoice=0;levelRef.current=0;audioSmooth=0;visualAmp=0};
  const transcribe=async(blob:Blob)=>{if(!blob.size||transcribing)return"";transcribing=true;try{const fd=new FormData();fd.append("file",blob,"rayone.webm");fd.append("language","hi");const r=await fetch("/api/transcribe",{method:"POST",body:fd});if(!r.ok)throw new Error("transcribe "+r.status);const j=await r.json();return String(j.text||"").trim()}catch{onStatus?.("Voice transcription अभी उपलब्ध नहीं है।");return""}finally{transcribing=false}};
  const beginRecorder=()=>{
    if(!stream||!micWanted)return;
    const mime=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":"audio/webm";
    recorded=[];speechSeen=false;lastVoice=performance.now();
    recorder=new MediaRecorder(stream,{mimeType:mime});
    recorder.ondataavailable=(e)=>{if(e.data?.size)recorded.push(e.data)};
    recorder.onstart=()=>{center();stateRef.current="listening";onMicState?.(true);if(inactivityTimer)clearTimeout(inactivityTimer)};
    recorder.onstop=async()=>{const blob=new Blob(recorded,{type:mime});recorded=[];if(!micWanted){stopMic();stateRef.current="thinking";armTimeout();return}stateRef.current="thinking";const heard=await transcribe(blob);if(heard){onTranscript?.(heard);setShape(heard);await handleText(heard)}if(micWanted){beginRecorder()}else{stopMic();onMicState?.(false);armTimeout()}};
    recorder.start();
  };
  const listen=async()=>{
    if(micWanted){micWanted=false;if(recorder&&recorder.state!=="inactive")recorder.stop();else{stopMic();onMicState?.(false);stateRef.current="thinking";armTimeout()}return}
    try{
      stream=await navigator.mediaDevices.getUserMedia({audio:true});micWanted=true;
      ctx=new AudioContext();const an=ctx.createAnalyser();an.fftSize=256;ctx.createMediaStreamSource(stream).connect(an);const d=new Uint8Array(an.fftSize);
      const tick=()=>{if(!stream)return;an.getByteTimeDomainData(d);let s=0;for(const v of d){const x=(v-128)/128;s+=x*x}const rms=Math.sqrt(s/d.length);const targetLevel=Math.min(1,Math.max(0,(rms-.018)*8));audioSmooth+=(targetLevel-audioSmooth)*.10;levelRef.current=audioSmooth;const now=performance.now();if(rms>.035){speechSeen=true;lastVoice=now}if(speechSeen&&now-lastVoice>1300&&recorder&&recorder.state==="recording"){recorder.stop();speechSeen=false}levelRaf=requestAnimationFrame(tick)};tick();beginRecorder();
    }catch{micWanted=false;stopMic();onMicState?.(false);onStatus?.("Microphone permission नहीं मिली");stateRef.current="thinking";armTimeout()}
  };
  apiRef.current={setState:s=>{stateRef.current=s;if(s!=="idle")center();if(s==="thinking")armTimeout();else if(s==="listening"||s==="speaking"){} else if(inactivityTimer)clearTimeout(inactivityTimer)},setShape,customShape:custom,pulse:()=>{env=1},setLevel:v=>{levelRef.current=Math.max(0,Math.min(1,v))},listen,speak,handleText,activate};
  const loop=(now:number)=>{const dt=Math.min((now-last)/1000,.05);last=now;t+=dt;const U=mat.uniforms;U.uTime.value=t;if(homeSection&&!homeActiveRef.current){if(currentSlot!==7||morph>=0){geo.attributes.position.array.set(A[7]);geo.attributes.position.needsUpdate=true;geo.attributes.aTo.array.set(A[7]);geo.attributes.aTo.needsUpdate=true;currentSlot=7;targetSlot=7;morph=-1;U.uMix.value=0;onScattered?.()}}const L=stateRef.current==="listening"?levelRef.current:0;env*=.94;const sp=stateRef.current==="speaking"?Math.min(1,env):0;const rawVoiceAmp=stateRef.current==="speaking"?sp:stateRef.current==="listening"?L:0;visualAmp+=(rawVoiceAmp-visualAmp)*.12;const voiceAmp=visualAmp;U.uAmp.value=voiceAmp;U.uBr.value=voiceAmp*.08;mouth+=(sp-mouth)*.4;U.uMouth.value=mouth;hum+=((currentSlot===2&&morph<0?1:0)-hum)*.1;if(morph>=0){morph+=dt/1.4;const m=Math.min(morph,1);U.uMix.value=m*m*(3-2*m);if(morph>=1){geo.attributes.position.array.set(A[targetSlot]);geo.attributes.position.needsUpdate=true;U.uMix.value=0;currentSlot=targetSlot;morph=-1;if(targetSlot!==7)onFormed?.();else onScattered?.()}}const targetIndex=stateRef.current==="idle"?7:(targetSlot===5||targetSlot===6?targetSlot:names.indexOf(targetRef.current));if(targetIndex>=0&&targetIndex!==currentSlot&&morph<0){targetSlot=targetIndex;geo.attributes.aTo.array.set(A[targetIndex]);if(targetIndex===7)onScattered?.();geo.attributes.aTo.needsUpdate=true;morph=0}pts.position.set(0,(currentSlot===7&&targetSlot===7)?0:-1.05,0);pts.rotation.set(0,0,0);pts.scale.set(1,1,1);renderer.render(scene,camera);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
return()=>{humanLoadCancelled=true;homeObserver?.disconnect();cancelAnimationFrame(raf);removeEventListener("resize",resize);stopMic();if(inactivityTimer)clearTimeout(inactivityTimer);renderer.dispose();geo.dispose();mat.dispose();el.removeChild(renderer.domElement)};
 },[]);
 return <><div ref={host} className="rayoneCanvas" aria-label="RAYONE AI particle core"/><button ref={activateButton} type="button" className="rayoneActivate" aria-label="Activate RAYONE" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();apiRef.current?.activate()}} onTouchStart={(e)=>{e.stopPropagation();apiRef.current?.activate()}} onClick={(e)=>{e.preventDefault();e.stopPropagation();apiRef.current?.activate()}} /></>;;
});
export default RayoneNative;