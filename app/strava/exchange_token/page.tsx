"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { codeToToken } from "@/lib/strava-service/authorization";
import { STORAGE_KEY as AUTH_STORAGE_KEY } from "@/lib/strava";

export default function ExchangeToken() {
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const checkAndStoreToken = async () => {
      const token = await codeToToken(params?.get("code") as string);
      if ("errors" in token) {
        throw token.errors
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(token));
      router.push("/");
    };
    checkAndStoreToken();
  }, [params, router]);

  return <>Authorizing...please wait</>;
}
