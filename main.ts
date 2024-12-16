import { absencesHandler } from "./src/handlers/absences.ts";
import { getToken } from "./src/shared/utils.ts";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { getAbsenceEntries, linkRecords } from "./src/api/airtable.ts";
import { setCustomStatus } from "./src/api/mattermost.ts";
import { absencesReportHandler } from "./src/handlers/absences-report.ts";

dayjs.extend(updateLocale);
dayjs.extend(customParseFormat);
dayjs.updateLocale("sk", { weekStart: 1 });
const { log } = console;

// Deno.cron("Vacations scheduler", "0 8 * * *", async () => {
//   console.log("Checking for vacations...");
//   const records = await getAbsenceEntries();
//   const today = dayjs().format("YYYY-MM-DD");
//   console.log(records, today);
//   const currentVacations = records.filter(({ fields }) => {
//     console.log(fields.Date, today);
//     return fields.Date === today;
//   });

//   // set custom status
//   for (const { fields } of currentVacations) {
//     console.log("setting vacation for", fields.userId);
//     if (fields.userId) {
//       await setCustomStatus(fields.userId, {
//         emoji: "beach_with_umbrella",
//         text: `( ͡° ͜ʖ ͡°)`,
//       });
//     }
//   }
// });

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
