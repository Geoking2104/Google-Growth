import { google } from "googleapis";
import { getAuthClient } from "../auth/service-account.js";

async function getIndexing() {
  const auth = await getAuthClient();
  return google.indexing({ version: "v3", auth });
}

export type UrlNotificationType = "URL_UPDATED" | "URL_DELETED";

/**
 * Notify Google that a URL has been updated or deleted (Indexing API).
 * Requires scope https://www.googleapis.com/auth/indexing
 * Officially intended for job postings and livestream structured data.
 */
export async function publishUrlNotification(args: {
  url: string;
  type: UrlNotificationType;
}) {
  const indexing = await getIndexing();
  const res = await indexing.urlNotifications.publish({
    requestBody: {
      url: args.url,
      type: args.type,
    },
  });
  return res.data;
}

/** Get the latest notification metadata for a URL. */
export async function getUrlNotificationMetadata(url: string) {
  const indexing = await getIndexing();
  const res = await indexing.urlNotifications.getMetadata({
    url,
  });
  return res.data;
}
