const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8081 });

let teams = {
  Rot: [],
  Blau: [],
  Grün: [],
  Gelb: [],
};

// Funktion zum Senden von Teamaktualisierungen an alle verbundenen Clients
function sendTeamUpdate(teamKey) {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "teamUpdate",
          teamKey: teamKey,
          members: teams[teamKey],
        })
      );
    }
  });
}

server.on("connection", (socket) => {
  console.log("Client connected");

  // Senden der aktuellen Team-Informationen an den verbundenen Client
  Object.keys(teams).forEach((teamKey) => {
    socket.send(
      JSON.stringify({
        type: "teamUpdate",
        teamKey: teamKey,
        members: teams[teamKey],
      })
    );
  });

  socket.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "joinTeam") {
      if (teams[data.teamKey].length < 4) {
        // Änderung auf 4, um die Kapazitätsgrenze zu berücksichtigen
        teams[data.teamKey].push(data.playerName);
        sendTeamUpdate(data.teamKey); // Teamaktualisierung an alle Clients senden
      }
    } else if (data.type === "requestTeams") {
      // Senden der aktuellen Team-Informationen an den anfragenden Client
      Object.keys(teams).forEach((teamKey) => {
        socket.send(
          JSON.stringify({
            type: "teamUpdate",
            teamKey: teamKey,
            members: teams[teamKey],
          })
        );
      });
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8081");
