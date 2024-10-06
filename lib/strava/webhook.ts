/**
 * https://developers.strava.com/docs/webhooks/
 */
export type WebhookEvent = {
  object_type: "activity" | "athlete";
  object_id: number;
  aspect_type: "create" | "update" | "delete";
  updates: object;
  owner_id: number;
  subscription_id: number;
  event_time: number;
};
