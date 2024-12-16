import { ABSENCES_BOT_ACCESS_TOKEN, MATTERMOST_URL } from "../shared/config.ts";

export async function getUsers() {
  await fetch(`${MATTERMOST_URL}/api/v4/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ABSENCES_BOT_ACCESS_TOKEN}`,
    },
  });
}

export async function setCustomStatus(
  userId: string,
  data: {
    emoji: string;
    text: string;
    duration?: "thirty_minutes" | "one_hour" | "four_hours" | "today";
  }
) {
  return await fetch(`${MATTERMOST_URL}/api/v4/users/${userId}/status/custom`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${ABSENCES_BOT_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
