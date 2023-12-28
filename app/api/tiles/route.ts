import type { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import filenamify from "filenamify";
import path from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

const CACHE_LOCATION = ".tile-cache";

export async function GET(request: NextApiRequest) {
  const searchParams = new URL(request.url as string).searchParams;
  const url = searchParams.get("url") as string;
  const useCache = searchParams.get("useCache") === "true";
  const cachePath = path.join(CACHE_LOCATION, filenamify(url));
  var blob: Blob;
  if (useCache && existsSync(cachePath)) {
    const blobMetaData = JSON.parse(readFileSync(cachePath + ".json"));
    const buffer = readFileSync(cachePath);
    blob = new Blob([buffer], blobMetaData);
  } else {
    const tile = await fetch(url, { cache: "force-cache" });
    blob = await tile.blob();
    if (useCache) {
      writeFileSync(
        cachePath + ".json",
        JSON.stringify({ type: blob.type, size: blob.size }),
      );
      writeFileSync(cachePath, Buffer.from(await blob.arrayBuffer()));
    }
  }

  return new NextResponse(blob, { headers: { "Content-Type": blob.type } });
}
