"use client";
import{useRef,useState}from"react";import RayoneNative,{RayoneHandle}from"./RayoneNative";

export default function RayonePanel({onFormed,onScattered}:{onFormed?:()=>void;onScattered?:()=>void}){
 const ref=useRef<RayoneHandle>(null);
 const[state,setState]=useState("idle");
 const[controlsVisible,setControlsVisible]=useState(false);
 const[shapeOpen,setShapeOpen]=useState(false);
 const[micOn,setMicOn]=useState(false);
 const[text,setText]=useState("");
 const[reply,setReply]=useState("");
 const[status,setStatus]=useState("");
 const shapes=["sphere","human","heart","dna","knot"];
 const chooseShape=(s:string)=>{setShapeOpen(false);setState("thinking");ref.current?.activate();ref.current?.setShape(s)};
 const toggleMic=()=>{setMicOn(v=>{const next=!v;if(next){setState("listening");ref.current?.activate();ref.current?.listen()}else{ref.current?.listen()}return next})};
 const send=async()=>{const q=text.trim();if(!q)return;setText("");setState("thinking");ref.current?.activate();await ref.current?.handleText(q);};
 return <div className="rayonePanel">
  <div className="rayoneHost">
   <RayoneNative ref={ref} state={state}
    onReply={t=>{setReply(t);setState("speaking")}}
    onTranscript={setText}
    onStatus={setStatus}
    onFormed={()=>{setControlsVisible(true);onFormed?.()}}
    onScattered={()=>{setControlsVisible(false);setShapeOpen(false);onScattered?.()}}
    onMicState={setMicOn}
   />
  </div>
  <div className="rayoneControls" style={{paddingTop:35,opacity:controlsVisible?1:0,pointerEvents:controlsVisible?"auto":"none",visibility:controlsVisible?"visible":"hidden",transition:"opacity .35s ease",position:"relative",zIndex:100}}>
   <div style={{position:"relative",display:"flex",justifyContent:"center",marginBottom:10}}>
    <button type="button" onClick={()=>setShapeOpen(v=>!v)} aria-expanded={shapeOpen} style={{minWidth:96,padding:"7px 11px",borderRadius:10,border:"1px solid rgba(110,220,255,.35)",background:"rgba(10,18,24,.82)",color:"#dff9ff",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer"}}>
     Shape {shapeOpen?"▴":"▾"}
    </button>
    {shapeOpen&&<div style={{position:"absolute",top:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",width:150,padding:5,borderRadius:10,border:"1px solid rgba(110,220,255,.28)",background:"rgba(5,8,11,.96)",boxShadow:"0 10px 30px rgba(0,0,0,.35)",zIndex:20}}>
     {shapes.map(s=><button key={s} type="button" onClick={()=>chooseShape(s)} style={{display:"block",width:"100%",padding:"7px 9px",border:0,borderRadius:7,background:"transparent",color:"#b9dce5",fontSize:11,textAlign:"left",cursor:"pointer"}}>{s}</button>)}
    </div>}
   </div>
   <div className="rayoneInput" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
    <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="कोई सवाल या shape लिखें…" style={{maxWidth:430}} />
    <button type="button" onClick={send} style={{minWidth:52,padding:"9px 11px"}}>Ask</button>
    <button type="button" onClick={toggleMic} aria-pressed={micOn} title={micOn?"Microphone ON — tap to turn OFF":"Microphone OFF — tap to turn ON"} style={{minWidth:68,padding:"9px 10px",fontWeight:700,borderColor:micOn?"rgba(70,230,180,.65)":"rgba(160,170,180,.35)"}}>
      {micOn?"Mic ON":"Mic OFF"}
    </button>
   </div>
   {reply&&<p className="rayoneReply">{reply}</p>}
   {status&&<p className="rayoneStatus">{status}</p>}
   <div className="commandHint">RAYONE • Native Three.js • AI-generated</div>
  </div>
 </div>
}