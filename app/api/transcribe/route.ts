import{NextResponse}from"next/server";
export const runtime="nodejs";

export async function POST(req:Request){
 try{
  const key=process.env.OPENAI_API_KEY;
  if(!key)return NextResponse.json({error:"OPENAI_API_KEY is not configured"},{status:500});
  const form=await req.formData();
  const file=form.get("file");
  const language=String(form.get("language")||"hi");
  if(!(file instanceof File))return NextResponse.json({error:"Audio file is required"},{status:400});
  if(file.size>25*1024*1024)return NextResponse.json({error:"Audio file too large"},{status:413});
  const body=new FormData();
  body.append("file",file,file.name||"rayone.webm");
  body.append("model","gpt-4o-mini-transcribe");
  body.append("language",language);
  const r=await fetch("https://api.openai.com/v1/audio/transcriptions",{method:"POST",headers:{Authorization:"Bearer "+key},body,signal:AbortSignal.timeout(30000)});
  if(!r.ok)return NextResponse.json({error:"Transcription provider error"},{status:502});
  const j=await r.json();
  return NextResponse.json({text:j.text||""});
 }catch{return NextResponse.json({error:"Transcription request failed"},{status:500})}
}
