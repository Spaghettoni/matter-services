import {
  linkRecords,
  parseWriteResponse,
  writeEntries,
} from "../api/airtable.ts";
import { ABSENCES_TOKEN } from "../shared/config.ts";
import {
  formatResponse,
  formatAbsencesMessage,
  parseAbsenceCommand,
  parseSlashCommandRequest,
} from "../shared/utils.ts";

const CHANNEL_NAME = "Absences";

export async function absencesHandler(req: Request, authToken: string) {
  const isAuthorized = ABSENCES_TOKEN === authToken;
  if (!isAuthorized) {
    return new Response("Unauthorized, missing absences token!", {
      status: 401,
    });
  }

  // parse request
  const {
    channel,
    text: params,
    username,
    userId,
  } = await parseSlashCommandRequest(req);

  if (channel?.toLowerCase() !== CHANNEL_NAME.toLowerCase()) {
    return new Response(
      JSON.stringify({
        text: `Absences are only allowed inside the *${CHANNEL_NAME}* channel!`,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // parse parameters
    const vacations = parseAbsenceCommand(params, username, userId);

    // write to airtable
    const writeResponse = writeEntries(vacations);
    const recordIds = parseWriteResponse(writeResponse);
    linkRecords(recordIds, userId);

    // send message back
    const responseMessage = formatAbsencesMessage(vacations);

    const response = formatResponse({
      text: responseMessage,
    });

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
