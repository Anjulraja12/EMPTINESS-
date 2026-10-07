"use client";
import{useState}from"react";
import{defaultSiteData}from"../lib/site-data";

export default function Home(){
 const p=defaultSiteData.profile;
 const[menu,setMenu]=useState(false);
 const nav=[["about","About"],["skills","Skills"],["work","Work"],["timeline","Timeline"],["achievements","Achievements"],["links","Links"],["rayone","RAYONE"],["contact","Contact"]];
 return <main className="site">
  <header className="header"><nav className="nav">
   <a className="brand" href="/">RAJA <span>BUNDELA</span></a>
   <button className="menuBtn" aria-label="Toggle menu" aria-expanded={menu} onClick={()=>setMenu(v=>!v)}>☰</button>
   <div className={"navlinks"+(menu?" open":"")}>{nav.map(([id,label])=><a key={id} href={"/"+id} onClick={()=>setMenu(false)}>{label}</a>)}</div>
  </nav></header>
  <section className="hero"><div><div className="eyebrow">{p.location.toUpperCase()} • {p.availability.toUpperCase()}</div><h1>{p.name}</h1><p>{p.tagline}</p><div className="actions"><a className="btn primary" href="/work">View Work</a><a className="btn" href="/contact">Contact</a></div></div><div className="portrait"><div className="portraitMark">RB</div></div></section>
  <footer className="footer">© {new Date().getFullYear()} {p.name}</footer>
 </main>
}