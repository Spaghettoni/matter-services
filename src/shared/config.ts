export const ABSENCES_TOKEN = Deno.env.get("ABSENCES_TOKEN") || "";
export const ABSENCES_REPORT_TOKEN = Deno.env.get("ABSENCES_REPORT_TOKEN") || "";
export const ABSENCES_BOT_ACCESS_TOKEN = Deno.env.get(
  "ABSENCES_BOT_ACCESS_TOKEN"
) || "";

export const AIRTABLE_PAT = Deno.env.get("AIRTABLE_PAT") || "";
export const AIRTABLE_BODY_ID = Deno.env.get("AIRTABLE_BODY_ID") || "";
export const ABSENCES_TABLE_ID = Deno.env.get("ABSENCES_TABLE_ID") || "";
export const ABSENCES_REPORT_TABLE_ID = Deno.env.get("ABSENCES_REPORT_TABLE_ID") || ""; 

export const MATTERMOST_URL = Deno.env.get("MATTERMOST_URL") || "http://localhost:8065"; 