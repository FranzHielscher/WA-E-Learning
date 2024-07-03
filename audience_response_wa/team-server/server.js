const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8081 });

let teams = {
  A: [],
  B: [],
  C: [],
};

server.on("connection", (socket) => {
  console.log("Client connected");

  // Wenn ein Client verbunden wird, senden wir die aktuellen Team-Informationen
  socket.send(
    JSON.stringify({ type: "teamUpdate", teamKey: "A", members: teams.A })
  );
  socket.send(
    JSON.stringify({ type: "teamUpdate", teamKey: "B", members: teams.B })
  );
  socket.send(
    JSON.stringify({ type: "teamUpdate", teamKey: "C", members: teams.C })
  );

  socket.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "joinTeam") {
      if (teams[data.teamKey].length < 4) {
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
        JSON.stringify({ type: "teamUpdate", teamKey: "A", members: teams.A })
      );
      socket.send(
        JSON.stringify({ type: "teamUpdate", teamKey: "B", members: teams.B })
      );
      socket.send(
        JSON.stringify({ type: "teamUpdate", teamKey: "C", members: teams.C })
      );
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8081");
