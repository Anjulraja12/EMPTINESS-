"use client";
import{useEffect,useState}from"react";
import RayonePanel from"../components/RayonePanel";
import{defaultSiteData,SiteData}from"../lib/site-data";

export default function Home(){
 const[data,setData]=useState<SiteData>(defaultSiteData);
 const[menu,setMenu]=useState(false);
 const[loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/site",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error();return r.json()}).then(x=>x&&setData(x)).catch(()=>{}).finally(()=>setLoading(false))},[]);
 const p=data.profile;
 const nav=["about","skills","work","timeline","achievements","links","rayone","contact"];
 return <main className="site">
  <header className="header"><nav className="nav">
   <a className="brand" href="#">RAJA <span>BUNDELA</span></a>
   <button className="menuBtn" aria-label="Toggle menu" aria-expanded={menu} onClick={()=>setMenu(v=>!v)}>☰</button>
   <div className={"navlinks"+(menu?" open":"")}>{nav.map(x=><a key={x} href={"#"+x} onClick={()=>setMenu(false)}>{x[0].toUpperCase()+x.slice(1)}</a>)}</div>
  </nav></header>
  <section className="hero"><div><div className="eyebrow">{p.location.toUpperCase()} • {p.availability.toUpperCase()}</div><h1>{p.name}</h1><p>{p.tagline}</p><div className="actions"><a className="btn primary" href="#work">View Work</a><a className="btn" href="#contact">Contact</a></div></div><div className="portrait"><div className="portraitMark">RB</div></div></section>
  <section id="about" className="section"><h2>About</h2><p className="sectionLead">A focused digital home for work, development, AI experiments and creative projects.</p></section>
  <section id="skills" className="section"><h2>Skills</h2>{loading?<div className="card muted">Loading…</div>:data.skills.length?<div className="cards">{data.skills.map(s=><div className="card" key={s}>{s}</div>)}</div>:<div className="card muted">No skills published yet.</div>}</section>
  <section id="work" className="section"><h2>Work</h2>{data.projects.length?<div className="cards">{data.projects.map(x=><article className="card" key={x.title}><h3>{x.title}</h3><p>{x.description}</p>{x.url&&<a href={x.url} target="_blank" rel="noreferrer">Open project ↗</a>}</article>)}</div>:<div className="card muted">No projects published yet.</div>}</section>
  <section id="timeline" className="section"><h2>Timeline</h2>{data.timeline.length?<div className="cards">{data.timeline.map(x=><article className="card" key={x.title+x.period}><small>{x.period}</small><h3>{x.title}</h3><p>{x.description}</p></article>)}</div>:<div className="card muted">No timeline entries published yet.</div>}</section>
  <section id="achievements" className="section"><h2>Achievements</h2>{data.achievements.length?<div className="cards">{data.achievements.map(x=><article className="card" key={x.title}><h3>{x.title}</h3><p>{x.description}</p></article>)}</div>:<div className="card muted">No achievements published yet.</div>}</section>
  <section id="links" className="section"><h2>Links</h2>{data.links.length?<div className="cards">{data.links.map(x=><a className="card" key={x.url} href={x.url} target="_blank" rel="noreferrer"><h3>{x.label}</h3><p>{x.url}</p></a>)}</div>:<div className="card muted">No links published yet.</div>}</section>
  <section id="rayone" className="section"><h2>RAYONE</h2><p className="sectionLead">AI assistant with voice interaction and unlimited custom particle shapes.</p><RayonePanel/></section>
  <section id="contact" className="section"><h2>Contact</h2><p className="sectionLead">{p.email}</p><form className="contactForm" onSubmit={e=>{e.preventDefault();window.location.href="mailto:"+p.email}}><input required aria-label="Name" placeholder="Your name"/><input required type="email" aria-label="Email" placeholder="Your email"/><textarea required aria-label="Message" rows={6} placeholder="Your message"/><button className="btn primary" type="submit">Open Email</button></form></section>
  <footer className="footer">© {new Date().getFullYear()} {p.name}</footer>
 </main>
}