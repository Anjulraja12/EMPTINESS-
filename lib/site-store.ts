import fs from"fs/promises";import path from"path";import{defaultSiteData,SiteData}from"./site-data";
const file=process.env.SITE_DATA_FILE||path.join(process.cwd(),"data","site-data.json");
export async function readSiteData():Promise<SiteData>{try{return JSON.parse(await fs.readFile(file,"utf8"))}catch{await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(defaultSiteData,null,2));return structuredClone(defaultSiteData)}}
export async function writeSiteData(data:SiteData){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(data,null,2))}
