import{NextResponse}from"next/server";
export async function POST(req:Request){
 try{
  const body=await req.json();
  const name=String(body?.name||"").trim(),email=String(body?.email||"").trim(),message=String(body?.message||"").trim();
  if(!name||!email||!message||!/^\S+@\S+\.\S+$/.test(email))return NextResponse.json({error:"Invalid contact details."},{status:400});
  return NextResponse.json({ok:true,mailto:"ANJULRAJA12@gmail.com"});
 }catch{return NextResponse.json({error:"Invalid request."},{status:400})}
}