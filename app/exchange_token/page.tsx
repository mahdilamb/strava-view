"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { codeToToken } from "../../strava-service/authorization";

export default function ExchangeToken() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const checkAndStoreToken = async () => {
      const token = await codeToToken(params?.get("code") as string);
      localStorage.setItem("stravaAuth", JSON.stringify(token));
      router.push("/");
    };
    checkAndStoreToken();
  }, [params, router]);

  return <>Authorizing...please wait</>;
}
