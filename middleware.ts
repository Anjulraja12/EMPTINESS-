import{NextRequest,NextResponse}from"next/server";

async function sessionToken(secret:string){
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const signature=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode("admin-session"));
  return Array.from(new Uint8Array(signature),b=>b.toString(16).padStart(2,"0")).join("");
}

export async function middleware(req:NextRequest){
  if(!req.nextUrl.pathname.startsWith("/admin"))return NextResponse.next();
  if(req.nextUrl.pathname==="/admin/login")return NextResponse.next();
  const secret=process.env.ADMIN_SESSION_SECRET||"change-me";
  const expected=await sessionToken(secret);
  if(req.cookies.get("rb_admin")?.value!==expected)return NextResponse.redirect(new URL("/admin/login",req.url));
  return NextResponse.next();
}

export const config={matcher:["/admin/:path*"]};
