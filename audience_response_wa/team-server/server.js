const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket Server
wss.on("connection", (ws) => {
  console.log("Neue WebSocket Verbindung hergestellt.");

  // Beispiel: Nachrichten empfangen
  ws.on("message", (message) => {
    console.log(`Nachricht empfangen: ${message}`);

    // Beispiel: Nachrichten an alle Clients senden
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Beispiel: WebSocket schließen
  ws.on("close", () => {
    console.log("WebSocket Verbindung geschlossen.");
  });
});

// Starten des HTTP-Servers
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}.`);
});
