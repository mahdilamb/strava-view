"use client";
import { redirect } from "next/dist/client/components/redirect";

export default function Home() {
  return redirect(`/activities/run/years/${new Date().getFullYear()}`);
}
