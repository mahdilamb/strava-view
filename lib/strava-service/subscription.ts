import { readSecrets } from "../secrets";
import { StravaSecrets } from "./authorization";
import fs from "fs";

export const subscribeToWebhook = async () => {
  let ngrokUrl = process.env.NEXT_NGROK_URL;
  if (!ngrokUrl && fs.existsSync(".ngrok-log")) {
    ngrokUrl = /started tunnel.*?url=([\S]*)/
      .exec(fs.readFileSync(".ngrok-log", "utf-8"))
      ?.at(1);
  }
  console.log(ngrokUrl);
  if (!ngrokUrl) {
    return;
  }
  const webHookUrl = `${ngrokUrl}/strava/webhook`;
  const STRAVA_CLIENT = await readSecrets<StravaSecrets>("strava");
  const existingSubscriptions = (await (
    await fetch(
      `https://www.strava.com/api/v3/push_subscriptions?client_id=${STRAVA_CLIENT.ClientId}&client_secret=${STRAVA_CLIENT.ClientSecret}`,
    )
  ).json()) as {
    id: number;
    application_id: number;
    callback_url: string;
    created_at: string;
    updated_at: string;
  }[];
  const existingSubscription = existingSubscriptions.find(
    (subscription) => subscription.callback_url === webHookUrl,
  );
  if (existingSubscription !== undefined) {
    console.log(
      `Subscription exists for ${webHookUrl} (${JSON.stringify(
        existingSubscription,
      )})`,
    );
    return;
  }
  await Promise.all(
    existingSubscriptions.map(async (subscription) => {
      const response = await fetch(
        `https://www.strava.com/api/v3/push_subscriptions/${subscription.id}?client_id=${STRAVA_CLIENT.ClientId}&client_secret=${STRAVA_CLIENT.ClientSecret}`,
        {
          method: "DELETE",
        },
      );
      if (response.status === 204) {
        console.log(
          `Deleted subscription ${subscription.id} (${JSON.stringify(
            subscription,
          )})`,
        );
        return;
      }
      console.error(await response.json());
    }),
  );

  const formData = new FormData();
  formData.append("client_id", STRAVA_CLIENT.ClientId);
  formData.append("client_secret", STRAVA_CLIENT.ClientSecret);
  formData.append("callback_url", webHookUrl);
  formData.append("verify_token", STRAVA_CLIENT.VerifyToken);
  const response = await await fetch(
    "https://www.strava.com/api/v3/push_subscriptions",
    {
      method: "POST",
      body: formData,
    },
  );
  console.log(
    `New webhook subscription: ${JSON.stringify(await response.json())}`,
  );
};

subscribeToWebhook();
