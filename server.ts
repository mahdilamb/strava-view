import { parse } from "url";
import next from "next";
import { type RawData, WebSocketServer } from "ws";
import { createServer } from "http";
import { subscribeToWebhook } from "./lib/strava-service/subscription";
import { socketClients } from "./lib/sockets";

const WEBSOCKET_PATH = "/api/ws";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const wss = new WebSocketServer({ noServer: true });
const app = next({ dev, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(async () => {
    const server = createServer((req, res) => {
      try {
        return handle(req, res);
      } catch (err) {
        console.error(req.url, err);
      }
    }).listen(port);

    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? "development" : process.env.NODE_ENV
      }`,
    );
    await subscribeToWebhook();

    wss.on("connection", (ws) => {
      ws.on("message", (message: RawData) =>
        socketClients.registerClient(ws, JSON.parse(message.toString()).id),
      );

      ws.on("close", () =>
        console.log(
          `Client disconnected (${socketClients.unregisterClient(ws)
            ?.athleteId})`,
        ),
      );
    });

    server.on("upgrade", (req, socket, head) => {
      const { pathname } = parse(req.url || "/", true);

      if (pathname === "/_next/webpack-hmr") {
        app.getUpgradeHandler()(req, socket, head);
      }

      if (pathname === WEBSOCKET_PATH) {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit("connection", ws, req);
        });
      }
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
