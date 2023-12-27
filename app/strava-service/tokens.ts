"use server";
import { promisify } from "util";

type AuthTokenDetails = {
  token_type: "Bearer";
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: {
    id: number;
    username: string;
    resource_state: number;
    firstname: string;
    lastname: string;
    bio: string;
    city: string;
    state: string;
    country: string;
    sex?: string;
    premium: boolean;
    summit: boolean;
    created_at: string;
    updated_at: string;
    badge_type_id: number;
    weight: number;
    profile_medium: string;
    profile: string;
    friend?: unknown;
    follower?: unknown;
  };
};

type AuthTokenError = {
  errors: [];
};

export type AuthTokenResponse = AuthTokenDetails | AuthTokenError;

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

export async function codeToToken(code: string): Promise<AuthTokenResponse> {
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

export async function refreshToken(
  token: AuthTokenDetails,
): Promise<AuthTokenResponse> {
  /**
   * Update the token using the current token.
   * @param {AuthTokenDetails} token The current token containing the refresh_token.
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
