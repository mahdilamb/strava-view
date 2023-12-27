"use client";

import { refreshToken } from "./strava-service/tokens";

const STORAGE_KEY = "stravaAuth";

export const getToken = () => {
  var potentialAuth;
  if (
    (potentialAuth = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")) &&
    "expires_at" in potentialAuth
  ) {
    if (new Date() < new Date(potentialAuth.expires_at * 1000)) {
      return potentialAuth;
    }
    return refreshToken(potentialAuth).then((token) => {
      if ("errors" in token) {
        throw JSON.stringify(token.errors);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
      console.debug("Refreshed token.");
      return token;
    });
  }
};
