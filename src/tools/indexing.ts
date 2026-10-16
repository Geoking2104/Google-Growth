import { z } from "zod";
import {
  publishUrlNotification,
  getUrlNotificationMetadata,
  type UrlNotificationType,
} from "../google/indexing.js";
import { success, fail } from "./response.js";
import { strict } from "./schema.js";

const notificationType = z.enum(["URL_UPDATED", "URL_DELETED"]);

function assertIndexingWriteEnabled() {
  if (process.env.INDEXING_WRITE_ENABLED !== "true") {
    throw new Error(
      "Indexing API writes are disabled. Set INDEXING_WRITE_ENABLED=true to allow URL notifications."
    );
  }
}

export const indexingTools = [
  {
    name: "get_url_notification_metadata",
    description:
      "Get the latest Indexing API notification metadata for a URL (last update/delete notify time). Read-only.",
    schema: strict({
      url: z.string().url().describe("Fully-qualified URL to check"),
    }),
    handler: async (args: any) => {
      try {
        return success(await getUrlNotificationMetadata(args.url));
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "publish_url_notification",
    description:
      "WRITE: Notify Google that a URL was updated (URL_UPDATED) or deleted (URL_DELETED) via the Indexing API. Requires INDEXING_WRITE_ENABLED=true and confirm=true. Use dryRun=true first. Officially intended for job postings and livestream structured data; other uses may be limited by Google.",
    schema: strict({
      url: z.string().url().describe("Fully-qualified URL to notify"),
      type: notificationType.describe("URL_UPDATED or URL_DELETED"),
      dryRun: z.boolean().optional(),
      confirm: z.boolean().optional(),
    }),
    handler: async (args: any) => {
      try {
        if (args.dryRun) {
          return success({
            dryRun: true,
            wouldPublish: { url: args.url, type: args.type },
            message:
              "Dry run only. Set dryRun=false and confirm=true to actually notify Google.",
          });
        }
        if (args.confirm !== true) {
          return fail(
            "Refusing to publish URL notification without confirm=true. Run with dryRun=true first, then confirm=true."
          );
        }
        assertIndexingWriteEnabled();
        const result = await publishUrlNotification({
          url: args.url,
          type: args.type as UrlNotificationType,
        });
        return success(result);
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "publish_url_notifications",
    description:
      "WRITE: Notify Google about multiple URLs (batch). Same gates as publish_url_notification (INDEXING_WRITE_ENABLED + confirm). Keep batches small (recommended ≤ 20).",
    schema: strict({
      notifications: z
        .array(
          z.object({
            url: z.string().url(),
            type: notificationType,
          })
        )
        .min(1)
        .max(50),
      dryRun: z.boolean().optional(),
      confirm: z.boolean().optional(),
    }),
    handler: async (args: any) => {
      try {
        if (args.dryRun) {
          return success({
            dryRun: true,
            wouldPublish: args.notifications,
            count: args.notifications.length,
            message:
              "Dry run only. Set dryRun=false and confirm=true to actually notify Google.",
          });
        }
        if (args.confirm !== true) {
          return fail(
            "Refusing to publish URL notifications without confirm=true. Run with dryRun=true first."
          );
        }
        assertIndexingWriteEnabled();
        const results = [];
        for (const n of args.notifications) {
          try {
            const data = await publishUrlNotification({
              url: n.url,
              type: n.type as UrlNotificationType,
            });
            results.push({ url: n.url, type: n.type, ok: true, data });
          } catch (err: any) {
            results.push({
              url: n.url,
              type: n.type,
              ok: false,
              error: err?.message || String(err),
            });
          }
        }
        return success({
          count: results.length,
          results,
        });
      } catch (err) {
        return fail(err);
      }
    },
  },
];
