import dayjs from "dayjs";
import { DATE_FORMATS } from "./constants.ts";
import {
  DateEntry,
  ResponseParams,
  AbsenceEntry,
  AirtableAbsenceReport,
  AirtableAbsence,
} from "./types.ts";
import { AbsenceStatus, AbsenceType } from "./enums.ts";

export function getToken(headers: Headers) {
  const authHeader = headers.get("Authorization");
  return authHeader?.split(" ")[1];
}

export function parseAbsenceCommand(
  params?: string | null,
  username?: string | null,
  userId?: string | null
): AbsenceEntry[] {
  if (!params) {
    throw new Error("Missing command parameters!");
  }

  const absences = params.split(",");

  return absences
    .map((absence) => {
      const parts = absence.trim().split(" ");
      const datePart = parts[0];

      if (!datePart) {
        throw new Error("Missing dates!");
      }

      const days = parseDate(datePart);
      const description = parts.slice(1).join("-").toLowerCase();

      const type = /vacation/.test(description)
        ? AbsenceType.VACATION
        : /sick/.test(description)
        ? AbsenceType.SICK_DAY
        : /school/.test(description)
        ? AbsenceType.SCHOOL
        : AbsenceType.OTHER;

      return days.map(({ date, isHalfDay }) => ({
        name: username,
        userId,
        submittedOn: dayjs().format("YYYY-MM-DD"),
        date: date.format("YYYY-MM-DD"),
        isHalfDay,
        type,
        status: AbsenceStatus.APPROVED,
        approvedBy: "Maroš Noge",
      }));
    })
    .flat();
}

function parseDate(datePart: string): DateEntry[] {
  const parts = datePart.trim().split("-");
  const range = [] as DateEntry[];

  parts.forEach((part) => {
    const [dateString, half] = part.split("/");

    if (half && half !== "2") {
      throw new Error("Invalid format of half day!");
    }

    range.push({ date: parseDayjs(dateString), isHalfDay: half === "2" });
  });

  if (!range.length || range.length > 2) {
    throw new Error("Invalid date format!");
  }

  const [dateFrom, dateTo] = range;

  if (dateTo) {
    const daysTotal = dateTo.date.diff(dateFrom.date, "days");
    if (daysTotal <= 0) {
      throw new Error("End date has to be later than start date!");
    }

    range.pop();
    for (let i = 0; i < daysTotal - 1; i++) {
      const newDate = dateFrom.date.add(i, "day").add(1, "day");
      // Is not a weekend
      if (![0, 6].includes(newDate.day())) {
        range.push({ date: newDate, isHalfDay: false });
      }
    }

    if (![0, 6].includes(dateTo.date.day())) {
      range.push(dateTo);
    }

    if ([0, 6].includes(range[0].date.day())) {
      range.shift();
    }
  }

  return range;
}

export function formatAbsencesMessage(records: AbsenceEntry[]) {
  const header = `| Name | Submitted on | Date | Half day | Type | Status | Approved by |`;
  const delimeter = `| --- | --- | --- | --- | --- | --- | --- |`;

  const rows = records.map(
    ({ name, submittedOn, date, isHalfDay, type, status, approvedBy }) =>
      `| ${name} | ${submittedOn} | ${date} | ${
        isHalfDay ? ":white_check_mark:" : ":white_large_square:"
      } | ${type} | ${status} | ${approvedBy} |`
  );

  return [header, delimeter, ...rows].join("\n");
}

export function formatAirtableAbsenceMessage(
  records: { fields: AirtableAbsence }[]
) {
  const header = `| Name | Submitted on | Date | Half day | Type | Status | Approved by |`;
  const delimeter = `| --- | --- | --- | --- | --- | --- | --- |`;

  const rows = records.map(
    (record) =>
      `| ${record.fields.Name} | ${record.fields["Submitted on"]} | ${record.fields.Date} | ${
        record.fields["Half day"] ? ":white_check_mark:" : ":white_large_square:"
      } | ${record.fields.Type} | ${record.fields.Status} | ${record.fields["Approved by"]} |`
  );

  return [header, delimeter, ...rows].join("\n");
}

export function formatReportSummaryMessage(fields?: AirtableAbsenceReport) {
  const summary = `| Summary | |
  | --- | --- |
  | Total vacations | ${fields?.["Total vacations"]} | 
  | Total sick days | ${fields?.["Total sick days"]} |
  | Vacations logged | ${fields?.["Vacations logged"]} |
  | Sick days logged | ${fields?.["Sick days logged"]} |
  | Remaining vacations | ${fields?.["Remaining vacations"]} |
  | Remaining sick days | ${fields?.["Remaining sick days"]} |`;

  return summary;
}

function parseDayjs(dateStr: string) {
  for (const format of DATE_FORMATS) {
    const parsedDate = dayjs(dateStr, format, true);
    if (parsedDate.isValid()) {
      return parsedDate;
    }
  }

  throw new Error("Invalid date format!");
}

export async function parseSlashCommandRequest(req: Request) {
  const data = await req.text();
  const formData = new URLSearchParams(data);
  const channelId = formData.get("channel_id");
  const channel = formData.get("channel_name");
  const teamDomain = formData.get("team_domain");
  const teamId = formData.get("team_id");
  const username = formData.get("user_name");
  const userId = formData.get("user_id") || "";
  const command = formData.get("command");
  const text = formData.get("text");

  return {
    channelId,
    channel,
    teamId,
    teamDomain,
    username,
    userId,
    command,
    text,
  };
}

export function formatResponse({
  response_type = "in_channel",
  ...rest
}: ResponseParams) {
  return JSON.stringify({
    response_type,
    ...rest,
  });
}
