/**
 * Script for obtaining auth details for strava to be stored as a json file (strava.auth.json).
 */
import { randomUUID } from "crypto";
import fs from "fs";
import readline from "readline";

type ReadlineInterface = readline.Interface & {
  input: NodeJS.WriteStream;
  output: NodeJS.ReadStream;
};
const createMaskedHandler = (rl: ReadlineInterface) => {
  /**
   * Create a masked handler for the readline interface.
   */
  const handler = () => {
    const len = rl.line.length;
    readline.moveCursor(rl.output, -len, 0);
    readline.clearLine(rl.output, 1);
    for (let i = 0; i < len; i++) {
      rl.output.write("*");
    }
  };
  return {
    attach: () => rl.input.addListener("keypress", handler),
    detach: () => rl.input.removeListener("keypress", handler),
  };
};

const getStravaDetails = async () => {
  /**
   * Get the strava details using an interactive prompt
   */
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  }) as ReadlineInterface;
  const { attach: attachMaskedHandler } = createMaskedHandler(rl);
  const stravaDetails: {
    ClientId?: number;
    ClientSecret?: string;
    VerifyToken?: string;
  } = {};
  console.info(
    "Enter your strava details. See https://www.strava.com/settings/api",
  );
  await new Promise<void>((resolve) => {
    rl.question("Client ID:     ", (result: string) => {
      stravaDetails.ClientId = parseInt(result.trim());
      rl.pause();
      resolve();
    });
  });
  attachMaskedHandler();
  await new Promise<void>((resolve) => {
    rl.question("Client Secret: ", (result: string) => {
      stravaDetails.ClientSecret = result.trim();
      rl.close();
      resolve();
    });
  });
  return { ...stravaDetails, VerifyToken: randomUUID() };
};

const main = async () => {
  const stravaDetails = await getStravaDetails();
  fs.writeFileSync("strava.auth.json", JSON.stringify(stravaDetails, null, 2));
};
main();
