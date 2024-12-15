import dayjs from "dayjs";
import { AbsenceType, AbsenceStatus } from "./enums.ts";

export type DateEntry = { date: dayjs.Dayjs; isHalfDay: boolean };

export type AbsenceEntry = {
  name: string | null | undefined;
  userId: string | null | undefined;
  submittedOn: string;
  date: string;
  isHalfDay: boolean;
  type: AbsenceType;
  status: AbsenceStatus;
  approvedBy: string;
};

export type AirtableAbsence = {
  Name: string | null | undefined;
  "User ID": string | null | undefined;
  "Record ID": string | null | undefined;
  "Submitted on": string;
  Date: string;
  "Half day": boolean;
  Type: AbsenceType;
  Status: AbsenceStatus;
  "Approved by": string;
};

export type AirtableAbsenceReport = {
  Name: string | null | undefined;
  "User ID": string | null | undefined;
  "Record ID": string | null | undefined;
  "Total vacations": number;
  "Total sick days": number;
  "Linked records": unknown;
  "Vacations logged": number;
  "Sick days logged": number;
  "Remaining vacations": number;
};

export type AirtableEntry = Record<string, unknown>;

export type UpdateEntryProps = {
  tableId: string;
  recordId: string;
  data: AirtableEntry;
};

export type ResponseParams = {
  text: string;
  response_type?: "ephemeral" | "in_channel";
  attachments?: unknown;
  username?: string;
  channel_id?: string;
};

export type WriteEntryResponse<T extends AirtableEntry> = {
  records: WrittenRecord<T>[];
};

export type WrittenRecord<T extends AirtableEntry> = {
  id: string;
  createdTime: string;
  fields: T;
};
