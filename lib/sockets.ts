import { type WebSocket } from "ws";
type WebsocketWithId = WebSocket & { athleteId: number };
const clients: { [id: number]: WebsocketWithId[] } = {};

export const socketClients = (() => {
  const notifySocket = (athleteId: number, message?: any) => {
    clients[athleteId]?.forEach((client) => client.send(message));
  };

  const registerClient = (
    ws: WebSocket,
    athleteId: number,
  ): WebsocketWithId => {
    const client = ws as WebsocketWithId;
    if (client.athleteId) {
      console.log("Adding websocket that already has athleteId");
      return client;
    }
    console.log(`Adding socket client for ${athleteId}.`);
    Object.assign(ws, { athleteId });
    clients[athleteId] = [...(clients[athleteId] || []), client];
    return client;
  };
  const unregisterClient = (ws: WebSocket): WebsocketWithId => {
    if ("athleteId" in ws) {
      const client = ws as WebsocketWithId;
      clients[client.athleteId] = (clients[client.athleteId] || []).filter(
        (c) => c !== client,
      );
    }
    return ws as WebsocketWithId;
  };
  return {
    notifySocket,
    registerClient,
    unregisterClient,
    sockets: () => Object.keys(clients).length,
  };
})();


(global as any).SOCKET_CLIENTS = socketClients
