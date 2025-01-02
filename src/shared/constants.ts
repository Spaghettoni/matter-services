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
  "04-18",
  "04-21",
  "05-01",
  "05-08",
  "07-05",
  "08-29",
  "09-15",
  "11-01",
  "11-17",
  "12-24",
  "12-25",
  "12-26",
];

export const PUBLIC_HOLIDAYS_NAMES = [
  "Day of the Establishment of the Slovak Republic",
  "Epiphany" ,
  "Good Friday",
  "Easter Monday",
  "Labour Day",
  "Day of Victory over Fascism",
  "St. Cyril and Methodius Day",
  "Slovak National Uprising Day",
  "Day of the Virgin Mary of the Seven Sorrows",
  "All Saints Day",
  "Day of the Fight for Freedom and Democracy",
  "Christmas Eve",
  "Christmas Day",
  "St. Stephen's Day",
]