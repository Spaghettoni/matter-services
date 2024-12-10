import { absencesHandler } from "./src/handlers/absences.ts";
import { getToken } from "./src/shared/utils.ts";
import dayjs from "dayjs";
import "./node_modules/dayjs/locale/sk.js";
import updateLocale from "./node_modules/dayjs/plugin/updateLocale.js";
import customParseFormat from "./node_modules/dayjs/plugin/customParseFormat.js";
import { getAbsenceEntries } from "./src/api/airtable.ts";
import { setCustomStatus } from "./src/api/mattermost.ts";

dayjs.extend(updateLocale);
dayjs.extend(customParseFormat);
dayjs.updateLocale("sk", { weekStart: 1 });

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

  console.log("arrived:", req);
  if (!authToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);

  try {
    switch (url.pathname) {
      case "/absence": {
        const response = await absencesHandler(req, authToken);
        console.log("response:", response);
        return response;
      }
      case "/remaining-absences": {
        // return await remainingAbsencesHandler(req, authToken);
      }
      case "/lunch":
      // return await lunchHandler(req);
    }

    return new Response("Burgers!", {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(`Couldn't parse body; ${error}`, { status: 500 });
  }
});
