import {
  AIRTABLE_BODY_ID,
  AIRTABLE_PAT,
  ABSENCES_TABLE_ID,
  ABSENCES_REPORT_TABLE_ID,
} from "../shared/config.ts";
import { AIRTABLE_COLUMNS } from "../shared/constants.ts";
import {
  AirtableAbsence,
  AirtableAbsenceReport,
  AirtableEntry,
  UpdateEntryProps,
  WriteEntryResponse,
} from "../shared/types.ts";

export function formatWriteRequest(data: AirtableEntry[]) {
  return {
    records: data.map((entry) => ({
      fields: Object.entries(entry).reduce(
        (prev, [key, value]) => ({ ...prev, [AIRTABLE_COLUMNS[key]]: value }),
        {}
      ),
    })),
  };
}

export async function getAbsenceEntries() {
  return await getEntries<AirtableAbsence>(ABSENCES_TABLE_ID);
}

export async function getReportEntries() {
  return await getEntries<AirtableAbsenceReport>(ABSENCES_REPORT_TABLE_ID);
}

export async function getEntries<T>(tableId: string): Promise<{ fields: T }[]> {
  if (!tableId) {
    throw new Error("Missing table id!");
  }

  let records: Array<{ fields: T }> = [];
  try {
    let fetchMore = true;
    let offset = "";
    while (fetchMore) {
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BODY_ID}/${tableId}${
          offset ? `?offset=${offset}` : ""
        }`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${AIRTABLE_PAT}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to read data!");
      }

      const json = await response.json();
      records = records.concat(json.records as { fields: T }[]);

      if (!json.offset) {
        fetchMore = false;
      } else {
        offset = json.offset;
      }
    }
    return records;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to read data!");
  }
}

export async function writeEntries(data: AirtableEntry[]) {
  const body = formatWriteRequest(data);
  console.log("writing", body);
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BODY_ID}/${ABSENCES_TABLE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.log("Failed to write data!");
      console.log(await response.text());
      return new Response("Failed to write data!", {
        status: 502,
        statusText: "Failed",
      });
    }
    return response;
  } catch {
    return new Response("Failed to write data!", {
      status: 502,
      statusText: "Failed",
    });
  }
}

export async function updateRecord({
  tableId,
  recordId,
  data,
}: UpdateEntryProps) {
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BODY_ID}/${tableId}/${recordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    console.log("Failed to update data!");
    console.log(await response.text());
    return new Response("Failed to update data!", {
      status: 502,
      statusText: "Failed",
    });
  }
  return response;
}

export async function linkRecords(
  recordIdsPromise: Promise<string[]>,
  userId: string,
  override = false
) {
  const reportEntries = await getReportEntries();

  const userRecord = reportEntries.find(
    ({ fields }) => fields["User ID"] === userId
  );

  const recordId = userRecord?.fields["Record ID"];
  const existingLinks =
    (userRecord?.fields["Linked records"] as string[]) || [];

  if (!recordId) {
    throw new Error("Missing record id!");
  }

  const recordIds = await recordIdsPromise;

  await updateRecord({
    tableId: ABSENCES_REPORT_TABLE_ID,
    recordId,
    data: {
      fields: {
        "Linked records": override
          ? recordIds
          : existingLinks.concat(recordIds),
      },
    },
  });
}

export async function parseWriteResponse<T extends AirtableEntry>(
  promise: Promise<Response>
) {
  const response = await promise;
  const data: WriteEntryResponse<T> = await response.json();
  return data.records.map(({ id }) => id);
}

export async function resetLinks() {
  const entries = await getAbsenceEntries();

  const grouped = Object.groupBy(
    entries,
    (entry) => entry.fields["User ID"] ?? ""
  );

  for (const entry of Object.entries(grouped)) {
    const [userId, records] = entry;
    const recordIds =
      records?.map(({ fields }) => fields["Record ID"] ?? "") || [];
    await linkRecords(recordIds, userId ?? "", true);
  }
}
