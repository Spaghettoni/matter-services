import { absencesHandler } from "./src/handlers/absences.ts";
import { getToken } from "./src/shared/utils.ts";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { getAbsenceEntries } from "./src/api/airtable.ts";
import { setCustomStatus } from "./src/api/mattermost.ts";
import { absencesReportHandler } from "./src/handlers/absences-report.ts";
import { AbsenceType } from "./src/shared/enums.ts";

dayjs.extend(updateLocale);
dayjs.extend(customParseFormat);
dayjs.updateLocale("sk", { weekStart: 1 });
const { log } = console;

Deno.cron("Vacations scheduler", "0 8 * * *", async () => {
  log("Checking for vacations...");
  const currentVacations = await getAbsenceEntries({filterByFormula: `IS_SAME(Date, NOW(), 'day')`});
  const today = dayjs().format("YYYY-MM-DD");
  
  // set custom status
  for (const { fields } of currentVacations) {
    log("setting vacation for", fields["User ID"]);
    if (fields["User ID"]) {
      await setCustomStatus(fields["User ID"], {
        emoji: fields.Type === AbsenceType.VACATION ? "beach_with_umbrella" : fields.Type === AbsenceType.SCHOOL ? "school" : fields.Type === AbsenceType.SICK_DAY ? "face_with_thermometer" : "question",
        text: `( ͡° ͜ʖ ͡°)`,
        expires_at: `${today}T20:00:00Z`,
        duration: "today",
      });
    }
  }
});


Deno.serve(async (req) => {
  const authToken = getToken(req.headers);

  log("Incoming request:", req);
  if (!authToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);

  try {
    let response = new Response("Burgers!", {
      headers: { "Content-Type": "application/json" },
    });
    switch (url.pathname) {
      case "/absence": {
        response = await absencesHandler(req, authToken);
        break;
      }
      case "/absences-report": {
        response = await absencesReportHandler(req, authToken);
        break;
      }
      // case "/lunch":
      // return await lunchHandler(req);
    }

    log("Response:", response);
    return response;
  } catch (error) {
    console.error(error);
    return new Response(`Couldn't parse body; ${error}`, { status: 500 });
  }
});
