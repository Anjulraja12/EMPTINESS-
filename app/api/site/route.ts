import {NextResponse} from "next/server";
import {defaultSiteData} from "../../../lib/site-data";
export async function GET(){return NextResponse.json(defaultSiteData,{headers:{"Cache-Control":"no-store"}})}
export async function POST(req:Request){const body=await req.json().catch(()=>null);if(!body||typeof body!=="object")return NextResponse.json({error:"Invalid data"},{status:400});return NextResponse.json({ok:true,data:body})}