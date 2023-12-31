import { promisify } from "util";
type Provider = "strava" | "fitbit";
type Cached<T, R = any> = T & {
  __cachedResult: { [provider in Provider]: R };
};

export const readSecrets = async <T>(provider: Provider) => {
  if (readSecrets.hasOwnProperty("__cachedResult")) {
    return (readSecrets as Cached<typeof readSecrets, T>).__cachedResult[
      provider
    ];
  }
  var result: T;
  try {
    const fs = require("fs");
    result = {
      ...JSON.parse(
        await fs.promise.readFile(`./${provider}.auth.json`, "utf8"),
      ),
      from: "file",
    };
  } catch {
    const { exec } = require("child_process");
    const { stdout } = await promisify(exec)(
      `sops -d ./${provider}.auth.enc.json`,
    );
    result = { ...JSON.parse(stdout), from: "sops" };
  }
  return (((readSecrets as Cached<typeof readSecrets, T>).__cachedResult ||
    ((readSecrets as Cached<typeof readSecrets, T>).__cachedResult = <any>{}))[
    provider
  ] = result);
};
