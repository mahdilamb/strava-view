import { NextRequest, NextResponse } from "next/server";
import filenamify from "filenamify";
import path from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { redirect } from "next/navigation";

const CACHE_LOCATION = ".tile-cache";
if (!existsSync(CACHE_LOCATION)) {
  mkdirSync(CACHE_LOCATION);
}

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url as string).searchParams;
  const url = searchParams.get("url") as string;
  const useCache = searchParams.get("useCache") === "true";
  if (!useCache) {
    return redirect(url);
  }
  const cachePath = path.join(CACHE_LOCATION, filenamify(url));
  var blob: Blob;
  if (existsSync(cachePath)) {
    const blobMetaData = JSON.parse(
      readFileSync(cachePath + ".json") as unknown as string,
    );
    const buffer = readFileSync(cachePath);
    blob = new Blob([buffer], blobMetaData);
  } else {
    const tile = await fetch(url, { cache: "force-cache" });
    blob = await tile.blob();
    writeFileSync(
      cachePath + ".json",
      JSON.stringify({ type: blob.type, size: blob.size }),
    );
    writeFileSync(cachePath, Buffer.from(await blob.arrayBuffer()));
  }

  return new NextResponse(blob, { headers: { "Content-Type": blob.type } });
}
