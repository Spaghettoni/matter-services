export const DATE_FORMATS = [
  "DD.MM.YYYY",
  "D.M.YYYY",
  "D.M.YY",
  // "D/M/YY",
  // "DD/MM/YYYY",
  "YYYY-MM-DD",
];

export const AIRTABLE_COLUMNS: Record<string, string> = {
  name: "Name",
  userId: "User ID",
  submittedOn: "Submitted on",
  date: "Date",
  isHalfDay: "Half day",
  type: "Type",
  status: "Status",
  approvedBy: "Approved by",
}