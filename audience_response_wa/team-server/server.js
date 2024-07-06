const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8081 });

let teams = {
  Rot: [],
  Blau: [],
  Gruen: [],
  Gelb: [],
};

server.on("connection", (socket) => {
  console.log("Client connected");

  // Wenn ein Client verbunden wird, senden wir die aktuellen Team-Informationen
  socket.send(
    JSON.stringify({ type: "teamUpdate", teamKey: "Rot", members: teams.Rot })
  );
  socket.send(
    JSON.stringify({ type: "teamUpdate", teamKey: "Blau", members: teams.Blau })
  );
  socket.send(
    JSON.stringify({ type: "teamUpdate", teamKey: "Gruen", members: teams.Gruen })
  );
  socket.send(
    JSON.stringify({ type: "teamUpdate", teamKey: "Gelb", members: teams.Gelb })
  );

  socket.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "joinTeam") {
      if (teams[data.teamKey].length < 3) {
        teams[data.teamKey].push(data.playerName);
        // Aktualisierte Team-Informationen an alle Clients senden
        server.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "teamUpdate",
                teamKey: data.teamKey,
                members: teams[data.teamKey],
              })
            );
          }
        });
      }
    } else if (data.type === "requestTeams") {
      // Aktuelle Team-Informationen an den anfragenden Client senden
      socket.send(
        JSON.stringify({
          type: "teamUpdate",
          teamKey: "Rot",
          members: teams.Rot,
        })
      );
      socket.send(
        JSON.stringify({
          type: "teamUpdate",
          teamKey: "Blau",
          members: teams.Blau,
        })
      );
      socket.send(
        JSON.stringify({
          type: "teamUpdate",
          teamKey: "Gruen",
          members: teams.Gruen,
        })
      );
      socket.send(
        JSON.stringify({
          type: "teamUpdate",
          teamKey: "Gelb",
          members: teams.Gelb,
        })
      );
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8081");
