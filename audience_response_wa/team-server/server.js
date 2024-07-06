const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8081 });

let teams = {
  Rot: [],
  Blau: [],
  Grün: [],
  Gelb: [],
};

server.on("connection", (socket) => {
  console.log("Client connected");

  // Wenn ein Client verbunden wird, senden wir die aktuellen Team-Informationen
  sendTeamUpdates(socket);

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
      sendTeamUpdates(socket);
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

function sendTeamUpdates(socket) {
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

console.log("WebSocket server is running on ws://localhost:8081");
