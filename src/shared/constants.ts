import { AbsenceEntry, AirtableAbsence } from "./types.ts";

export const DATE_FORMATS = [
  "DD.MM.YYYY",
  "D.M.YYYY",
  "D.M.YY",
  // "D/M/YY",
  // "DD/MM/YYYY",
  "YYYY-MM-DD",
];

export const AIRTABLE_COLUMNS: Record<keyof AbsenceEntry, keyof AirtableAbsence> = {
  name: "Name",
  userId: "User ID",
  submittedOn: "Submitted on",
  date: "Date",
  isHalfDay: "Half day",
  type: "Type",
  status: "Status",
  approvedBy: "Approved by",
  params: "Params",
};

// SK PUBLIC HOLIDAYS IN MM-DD FORMAT
export const PUBLIC_HOLIDAYS = [
  "01-01",
  "01-06",
  "03-29",
  "04-01",
  "05-01",
  "05-08",
  "06-05",
  "08-29",
  "09-15",
  "11-01",
  "11-17",
  "12-24",
  "12-25",
  "12-26",
];
