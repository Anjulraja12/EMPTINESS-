import { defaultSiteData, SiteData } from "./site-data";
import { hasSupabase, supabase } from "./supabase-server";
import fs from "fs/promises";
import path from "path";

const file = process.env.SITE_DATA_FILE || path.join(process.cwd(), "data", "site-data.json");

function normalize(row: any): SiteData {
  return {
    profile: {
      name: row?.profile?.name ?? defaultSiteData.profile.name,
      tagline: row?.profile?.tagline ?? defaultSiteData.profile.tagline,
      location: row?.profile?.location ?? defaultSiteData.profile.location,
      email: row?.profile?.email ?? defaultSiteData.profile.email,
      availability: row?.profile?.availability ?? defaultSiteData.profile.availability,
    },
    skills: (row?.skills ?? []).map((x: any) => typeof x === "string" ? x : x.name).filter(Boolean),
    projects: (row?.projects ?? []).map((x: any) => ({
      title: x.title,
      description: x.description ?? "",
      url: x.project_url ?? x.url ?? undefined,
      image: x.image_url ?? x.image ?? undefined,
    })),
    timeline: (row?.timeline ?? []).map((x: any) => ({
      title: x.title,
      period: x.period ?? [x.start_date, x.end_date].filter(Boolean).join(" — "),
      description: x.description ?? "",
    })),
    achievements: (row?.achievements ?? []).map((x: any) => ({
      title: x.title,
      description: x.description ?? "",
    })),
    links: (row?.links ?? []).map((x: any) => ({ label: x.label, url: x.url })),
  };
}

async function readFile(): Promise<SiteData> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(defaultSiteData, null, 2));
    return structuredClone(defaultSiteData);
  }
}

export async function readSiteData(): Promise<SiteData> {
  if (!hasSupabase || !supabase) return readFile();

  const [profile, skills, projects, timeline, achievements, links] = await Promise.all([
    supabase.from("profile").select("name,tagline,location,email,availability").eq("id", 1).maybeSingle(),
    supabase.from("skills").select("name").order("sort_order").order("id"),
    supabase.from("projects").select("title,description,project_url,image_url").order("sort_order").order("id"),
    supabase.from("timeline").select("title,start_date,end_date,description").order("sort_order").order("id"),
    supabase.from("achievements").select("title,description").order("sort_order").order("id"),
    supabase.from("links").select("label,url").order("sort_order").order("id"),
  ]);

  const error = [profile, skills, projects, timeline, achievements, links].find((x) => x.error)?.error;
  if (error) throw error;

  return normalize({
    profile: profile.data ?? defaultSiteData.profile,
    skills: skills.data,
    projects: projects.data,
    timeline: timeline.data,
    achievements: achievements.data,
    links: links.data,
  });
}

export async function writeSiteData(data: SiteData) {
  if (!hasSupabase || !supabase) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(data, null, 2));
    return;
  }

  const { error } = await supabase.rpc("replace_site_data", {
    p_profile: data.profile,
    p_skills: data.skills,
    p_projects: data.projects,
    p_timeline: data.timeline,
    p_achievements: data.achievements,
    p_links: data.links,
  });

  if (error) throw error;
}
