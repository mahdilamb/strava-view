"use client";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { getToken } from "../service";
import { useEffect } from "react";

export default function ExchangeToken() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const checkAndStoreToken = async () => {
      const token = await getToken(params.get("code"));
      localStorage.setItem("stravaAuth", JSON.stringify(token));
      router.push("/");
    };
    checkAndStoreToken();
  }, [params, router]);

  return <>Authorizing...please wait</>;
}
