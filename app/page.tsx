"use client";
import{useEffect,useState}from"react";
import RayonePanel from"../components/RayonePanel";
import{defaultSiteData,SiteData}from"../lib/site-data";

const nav=[["about","About"],["skills","Skills"],["work","Work"],["timeline","Timeline"],["achievements","Achievements"],["links","Links"],["rayone","RAYONE"],["contact","Contact"]];

export default function Home(){
 const[data,setData]=useState<SiteData>(defaultSiteData);
 const[menu,setMenu]=useState(false);
 const[loading,setLoading]=useState(true);
 const[rayoneFormed,setRayoneFormed]=useState(false);
 useEffect(()=>{
  fetch("/api/site",{cache:"no-store"})
   .then(r=>{if(!r.ok)throw new Error("site-data");return r.json()})
   .then(x=>x&&setData(x))
   .catch(()=>{})
   .finally(()=>setLoading(false));
 },[]);
 const p=data.profile;
 return <main className="site">
  <header className="header"><nav className="nav"><a className="brand" href="/">RAJA <span>BUNDELA</span></a><button className="menuBtn" aria-label="Toggle menu" aria-expanded={menu} onClick={()=>setMenu(v=>!v)}>☰</button><div className={"navlinks"+(menu?" open":"")}>{nav.map(([id,label])=><a key={id} href={"/"+id} onClick={()=>setMenu(false)}>{label}</a>)}</div></nav></header>
  <section className="hero"><div className="heroImage" aria-label="ANJUL RAJA BUNDELA profile"></div><div className="heroOverlay"><div className="eyebrow">{p.location.toUpperCase()} • {p.availability.toUpperCase()}</div><h1>{loading?"ANJUL RAJA BUNDELA":p.name}</h1><p>{p.tagline}</p><div className="actions"><a className="btn primary" href="/work">View Work</a><a className="btn" href="/contact">Contact</a></div><div id="heroShapeSlot" aria-label="RAYONE shape controls" /></div></section>
  <section className="section homeRayone">{rayoneFormed&&<div className="rayoneIntro"><h2>RAYONE</h2><p className="sectionLead">Your intelligent interface for the RAJA BUNDELA digital system.</p></div>}<RayonePanel onFormed={()=>setRayoneFormed(true)} onScattered={()=>setRayoneFormed(false)}/></section>
  <footer className="footer">© {new Date().getFullYear()} {p.name}</footer>
 </main>
}
