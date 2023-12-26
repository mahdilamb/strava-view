"use server";

import { promisify } from "util";
import {
  ActivitiesApi,
  Configuration,
  PolylineMap,
  SummaryActivity,
} from "./strava";
import { decode } from "@googlemaps/polyline-codec";

import { cache, readCache, writeCache } from "./utils";
export type SummaryActivityDecoded = Omit<SummaryActivity, "map"> & { "map": Omit<PolylineMap, "summaryPolyline"> & { summaryPolyline?: [number, number][] } }
type AuthTokenResponse = {
  token_type: "Bearer",
  expires_at: number,
  expires_in: number,
  refresh_token: string,
  access_token: string,
  athlete: {
    id: number,
    username: string,
    resource_state: number,
    firstname: string,
    lastname: string,
    bio: string,
    city: string,
    state: string,
    country: string,
    sex?: string,
    premium: boolean,
    summit: boolean,
    created_at: string,
    updated_at: string,
    badge_type_id: number,
    weight: number,
    profile_medium: string,
    profile: string,
    friend?: unknown,
    follower?: unknown
  }
}
async function stravaAuth(): Promise<{
  ClientId: number;
  ClientSecret: string;
  from: "file" | "sops";
}> {
  if (stravaAuth.hasOwnProperty("__cachedResult")) {
    return stravaAuth.__cachedResult;
  }
  var result;
  try {
    const fs = require("fs");
    result = {
      ...JSON.parse(await promisify(fs.readFile)("./strava.auth.json", "utf8")),
      from: "file",
    };
  } catch {
    const { exec } = require("child_process");
    const { stdout } = await promisify(exec)("sops -d ./strava.auth.enc.json");
    result = { ...JSON.parse(stdout), from: "sops" };
  }
  stravaAuth.__cachedResult = result;
  return result;
}

export async function authUrl() {
  /**
   * Get the Strava authentication URL.
   */
  const STRAVA_CLIENT = await stravaAuth();
  return `http://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT.ClientId}&response_type=code&redirect_uri=http://localhost:3000/exchange_token&approval_prompt=force&scope=activity:read`;
}

export async function getToken(code: string): Promise<AuthTokenResponse> {
  /**
   * Convert the code received from the Strava authentication code to a token.
   * @param {string} code The code received from authorizing access.
   */
  const STRAVA_CLIENT = await stravaAuth();
  const formData = new FormData();
  formData.append("client_id", STRAVA_CLIENT.ClientId.toString());
  formData.append("client_secret", STRAVA_CLIENT.ClientSecret);
  formData.append("code", code);
  formData.append("grant_type", "authorization_code");
  return fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    body: formData,
  }).then(async (data) => await data.json());
}

export async function refreshToken(token: AuthTokenResponse): Promise<AuthTokenResponse> {
  /**
   * Update the token using the current token.
   * @param {AuthTokenResponse} token The current token containing the refresh_token.
   */
  const STRAVA_CLIENT = await stravaAuth();
  const formData = new FormData();
  formData.append("client_id", STRAVA_CLIENT.ClientId.toString());
  formData.append("client_secret", STRAVA_CLIENT.ClientSecret);
  formData.append("refresh_token", token.refresh_token);
  formData.append("grant_type", "refresh_token");
  return fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    body: formData,
  }).then(async (data) => await data.json());
}
const yearToSpan = (year: number): [number, number] => {
  const before = new Date(year + 1, 0, 1, 0, 0, 0)
  const after = new Date(year, 0, 1, 0, 0, 0)
  return [after.getTime(), before.getTime()]
}

const decodeSummaryActivity = (data: SummaryActivity[]) => {
  return data.map(entry => {
    return {
      ...entry,
      map: {
        ...entry.map,
        summaryPolyline: entry.map?.summaryPolyline
          ? decode(entry.map?.summaryPolyline)
          : undefined,
      },
    };
  })
}

export async function getActivities(auth: AuthTokenResponse, timespan: [number, number] = yearToSpan(2023)): Promise<SummaryActivityDecoded[]> {
  const params = { "before": timespan[1] / 1000, "after": timespan[0] / 1000, "page": 1 }
  var combinedResult: SummaryActivity[] = []
  const activitiesApi = new ActivitiesApi(
    new Configuration({
      headers: { Authorization: `Bearer ${auth.access_token}` },
    }),
  )
  await readCache<SummaryActivity[]>(`getActivities-${params.after}-${params.before}-${params.page}`, [])
    .then(async cachedPage => {
      await activitiesApi.getLoggedInAthleteActivities(params).then(async returnedPage => {
        if (cachedPage?.length && returnedPage[0].id === cachedPage[0].id) {
          combinedResult = [...cachedPage, ...combinedResult]
          while (true) {
            params.page += 1
            cachedPage = await readCache<SummaryActivity[]>(`getActivities-${params.after}-${params.before}-${params.page}`, [])
            if (!cachedPage?.length) {
              break
            }
            combinedResult = [...cachedPage, ...combinedResult]
          }
        } else {
          await writeCache(`getActivities-${params.after}-${params.before}-${params.page}`, async () => returnedPage)
          combinedResult = [...returnedPage, ...combinedResult]
          while (true) {
            params.page += 1
            returnedPage = await writeCache<SummaryActivity[]>(`getActivities-${params.after}-${params.before}-${params.page}`, () => activitiesApi.getLoggedInAthleteActivities(params))
            if (!returnedPage?.length) {
              break
            }
            combinedResult = [...returnedPage, ...combinedResult]
          }
        }
      })
    })
  return decodeSummaryActivity(combinedResult.filter(activity => activity.sportType === "Run"))


}
