const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8081 });

let teams = {
  Rot: [],
  Blau: [],
  Gruen: [],
  Gelb: [],
};

let labyrinthSignups = {
  Rot: [],
  Blau: [],
  Gruen: [],
  Gelb: [],
};

server.on("connection", (socket) => {
  console.log("Client connected");

  // Wenn ein Client verbunden wird, senden wir die aktuellen Team-Informationen
  sendTeamUpdates(socket);
  sendLabyrinthSignupUpdates(socket);

  socket.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "joinTeam") {
      if (teams[data.teamKey].length < 3) {
        teams[data.teamKey].push(data.playerName);
        // Aktualisierte Team-Informationen an alle Clients senden
        broadcastTeamUpdate(data.teamKey);
      }
    } else if (data.type === "labyrinthSignup") {
      if (teams[data.teamKey].includes(data.playerName)) {
        if (!labyrinthSignups[data.teamKey].includes(data.playerName)) {
          labyrinthSignups[data.teamKey].push(data.playerName);
          // Labyrinth-Einschreibungen an alle Clients senden
          broadcastLabyrinthSignupUpdate(data.teamKey);
        }
      } else {
        socket.send(
          JSON.stringify({
            type: "error",
            message: `Player ${data.playerName} is not in team ${data.teamKey}`,
          })
        );
      }
    } else if (data.type === "requestTeams") {
      sendTeamUpdates(socket);
      sendLabyrinthSignupUpdates(socket);
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

function sendLabyrinthSignupUpdates(socket) {
  Object.keys(labyrinthSignups).forEach((teamKey) => {
    socket.send(
      JSON.stringify({
        type: "labyrinthSignupUpdate",
        teamKey: teamKey,
        members: labyrinthSignups[teamKey],
      })
    );
  });
}

function broadcastTeamUpdate(teamKey) {
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

function broadcastLabyrinthSignupUpdate(teamKey) {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "labyrinthSignupUpdate",
          teamKey: teamKey,
          members: labyrinthSignups[teamKey],
        })
      );
    }
  });
}

console.log("WebSocket server is running on ws://localhost:8081");
