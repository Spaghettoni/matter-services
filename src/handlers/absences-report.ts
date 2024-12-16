import { getAbsenceEntries, getReportEntries } from "../api/airtable.ts";
import { ABSENCES_REPORT_TOKEN } from "../shared/config.ts";
import {
  formatAirtableAbsenceMessage,
  formatReportSummaryMessage,
  formatResponse,
  parseSlashCommandRequest,
} from "../shared/utils.ts";

export async function absencesReportHandler(req: Request, authToken: string) {
  const isAuthorized = ABSENCES_REPORT_TOKEN === authToken;
  if (!isAuthorized) {
    return new Response("Unauthorized, missing absences report token!", {
      status: 401,
    });
  }

  const { userId, text } = await parseSlashCommandRequest(req);
  const showFullReport = text?.trim().toLowerCase()?.includes("full");

  let absencesTable = "";
  if (showFullReport) {
    const absences = await getAbsenceEntries({
      filterByFormula: `{User ID} = '${userId}'`,
      sort: [{ field: "Date", direction: "asc" }],
    });
    absencesTable = formatAirtableAbsenceMessage(absences);
  }
  const reportEntries = await getReportEntries();
  const userReport = reportEntries.find(
    ({ fields }) => fields["User ID"] === userId
  );

  const summaryTable = formatReportSummaryMessage(userReport?.fields);
  const responseMessage = `${
    absencesTable ? absencesTable + "\n\n" : ""
  }${summaryTable}`;

  const response = formatResponse({
    text: responseMessage,
    response_type: "ephemeral",
  });

  try {
    return new Response(response, {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(
      formatResponse({
        text: error.message,
        response_type: "ephemeral",
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  }
}
