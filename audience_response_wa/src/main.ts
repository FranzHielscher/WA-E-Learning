import { Popup } from "@workadventure/iframe-api-typings";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log("Script started successfully");

let currentPopup: Popup | undefined = undefined;

// Team Management
interface Team {
  name: string;
  members: string[];
}

let teamData: { [key: string]: string[] } = {};

const teams: { [key: string]: Team } = {
  Rot: { name: "Team Rot", members: [] },
  Blau: { name: "Team Blau", members: [] },
  Gruen: { name: "Team Grün", members: [] },
  Gelb: { name: "Team Gelb", members: [] },
};

function joinTeam(teamKey: string) {
  const team = teams[teamKey];
  const playerName = WA.player.name;

  // Check if player is already in a team
  for (const key in teams) {
    if (teams[key].members.includes(playerName)) {
      WA.chat.sendChatMessage(
        `${playerName}, you are already in ${teams[key].name}`,
        playerName
      );
      return;
    }
  }

  // Add player to team if not full and not already in the team
  if (team.members.length < 4) {
    if (!team.members.includes(playerName)) {
      team.members.push(playerName);
      socket.send(JSON.stringify({ type: "joinTeam", teamKey, playerName }));
      WA.chat.sendChatMessage(
        `${playerName} has joined ${team.name}`,
        playerName
      );
    } else {
      WA.chat.sendChatMessage(
        `${playerName}, you are already in ${team.name}`,
        playerName
      );
    }
  } else {
    WA.chat.sendChatMessage(`Sorry, ${team.name} is full.`, playerName);
  }
}

// WebSocket Connection
const socket = new WebSocket("ws://localhost:8081");

socket.onopen = () => {
  console.log("WebSocket connection established");
  socket.send(JSON.stringify({ type: "requestTeams" }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "teamUpdate") {
    teams[data.teamKey].members = data.members;
  }
};

function displayTeamsInChat() {
  let message = "Aktuelle Team-Mitglieder:\n";

  // Durchlaufe jedes Team
  Object.keys(teams).forEach((teamKey) => {
    const team = teams[teamKey];

    // Füge den Teamnamen und die Mitglieder dem Nachrichtenstring hinzu
    message += `${team.name}:\n`;
    team.members.forEach((member, index) => {
      message += ` - ${member}`;

      // Füge ein Komma hinzu, außer beim letzten Mitglied
      if (index < team.members.length - 1) {
        message += ", ";
      } else {
        message += "\n"; // Neue Zeile nach dem letzten Mitglied
      }
    });
  });

  // Sende die Nachricht in den Chat
  WA.chat.sendChatMessage(message);
}

// Area Management
let deactivatedAreas: { [key: string]: boolean } = {
  "teamGruenZone-Pop-Up": false,
  "teamRotZone-Pop-Up": false,
  "teamGelbZone-Pop-Up": false,
  "teamBlauZone-Pop-Up": false,
};

// Manage popup visibility
function deactivateArea(area: string) {
  deactivatedAreas[area] = true;
}

function activateArea(area: string) {
  deactivatedAreas[area] = false;
}

function isAreaDeactivated(area: string): boolean {
  return deactivatedAreas[area];
}

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

// HUD Frame Loading
function loadHudFrame() {
  fetch("overlay.html")
    .then((response) => response.text())
    .then((data) => {
      const div = document.createElement("div");
      div.innerHTML = data;
      document.body.appendChild(div.firstChild as Node);
    })
    .catch((error) => console.error("Error loading HUD frame:", error));
}

// Rufe die Funktion auf, wenn das Skript geladen wird
loadHudFrame();

// Waiting for the API to be ready
WA.onInit()
  .then(() => {
    console.log("Scripting API ready");
    console.log("Player tags: ", WA.player.tags);

    //Einschreibung in die verschiedenen Teams
    WA.room.area.onEnter("teamRotZone").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "teamRotZone-Pop-Up",
        "Sie sind Team Rot beigetreten",
        []
      );
      joinTeam("Rot");
      deactivateArea("teamGrünZone-Pop-Up");
    });
    WA.room.area.onLeave("teamRotZone").subscribe(closePopup);

    WA.room.area.onEnter("teamBlauZone").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "teamBlauZone-Pop-Up",
        "Sie sind Team Blau beigetreten",
        []
      );
      joinTeam("Blau");
    });
    WA.room.area.onLeave("teamBlauZone").subscribe(closePopup);

    WA.room.area.onEnter("teamGrünZone").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "teamGrünZone-Pop-Up",
        "Sie sind Team Grün beigetreten",
        []
      );
      joinTeam("Grün");
    });
    WA.room.area.onLeave("teamGrünZone").subscribe(closePopup);

    WA.room.area.onEnter("teamGelbZone").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "teamGelbZone-Pop-Up",
        "Sie sind Team Gelb beigetreten",
        []
      );
      joinTeam("Gelb");
    });
    WA.room.area.onLeave("teamGelbZone").subscribe(closePopup);

    //Jitsi Meeting Räume für die conference.tmj
    WA.room.area.onEnter("JitsiMeeting1").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "JitsiMeetingPopup1",
        "Welcome to Jitsi!",
        []
      );
    });
    WA.room.area.onLeave("JitsiMeeting1").subscribe(closePopup);

    WA.room.area.onEnter("JitsiMeeting2").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "JitsiMeetingPopup2",
        "Welcome to Jitsi!",
        []
      );
    });
    WA.room.area.onLeave("JitsiMeeting2").subscribe(closePopup);

    WA.room.area.onEnter("JitsiMeeting3").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "JitsiMeetingPopup3",
        "Welcome to Jitsi!",
        []
      );
    });
    WA.room.area.onLeave("JitsiMeeting3").subscribe(closePopup);

    //Infotafeln für die Wege
    WA.room.area.onEnter("Infotafel").subscribe(() => {
      WA.controls.disablePlayerControls();
      currentPopup = WA.ui.openPopup(
        "Infotafel-Pop-Up",
        "Herzlich willkommen Reisender! Begebe dich in die Haupthalle für weitere Informationen!",
        [
          {
            label: "Alles gelesen",
            callback: () => {
              WA.controls.restorePlayerControls();
              currentPopup.close();
            },
          },
        ]
      );
    });

    WA.room.area.onEnter("Infotafel-Haupthalle").subscribe(() => {
      WA.controls.disablePlayerControls();
      currentPopup = WA.ui.openPopup(
        "Haupthalle-Pop-Up",
        "Ihr begebt euch in Richtung der Haupthalle!",
        [
          {
            label: "Verstanden",
            callback: () => {
              WA.controls.restorePlayerControls();
              currentPopup.close();
            },
          },
        ]
      );
    });

    WA.room.area.onEnter("Infotafel-Mainhall").subscribe(() => {
      WA.controls.disablePlayerControls();
      currentPopup = WA.ui.openPopup(
        "Mainhall-Pop-Up",
        "Willkommen in der Haupthalle, tritt einem Team bei!",
        [
          {
            label: "Verstanden",
            callback: () => {
              WA.controls.restorePlayerControls();
              currentPopup.close();
            },
          },
        ]
      );
    });

    WA.room.area.onEnter("Infotafel-Labyrinth").subscribe(() => {
      WA.controls.disablePlayerControls();
      currentPopup = WA.ui.openPopup(
        "Labyrinth-Pop-Up",
        "Betretet das Labyrinth erst nachdem Ihr in der Haupthalle wart!",
        [
          {
            label: "Verstanden",
            callback: () => {
              WA.controls.restorePlayerControls();
              currentPopup.close();
            },
          },
        ]
      );
    });
    WA.room.area.onEnter("Infotafel-Conference").subscribe(() => {
      WA.controls.disablePlayerControls();
      currentPopup = WA.ui.openPopup(
        "Conference-Pop-Up",
        "Ihr begebt euch in Richtung der Konferenzinsel!",
        [
          {
            label: "Verstanden",
            callback: () => {
              WA.controls.restorePlayerControls();
              currentPopup.close();
            },
          },
        ]
      );
    });

    WA.room.area.onEnter("Infotafel-Quizraum").subscribe(() => {
      if (isAreaDeactivated("Infotafel-Quizraum")) {
        console.log("Quizraum ist deaktiviert und kann nicht betreten werden.");
      } else {
        WA.controls.disablePlayerControls();
        currentPopup = WA.ui.openPopup(
          "Quizraum-Pop-Up",
          "Der Quizraum kann noch nicht betreten werden!",
          [
            {
              label: "Schade",
              callback: () => {
                WA.controls.restorePlayerControls();
                currentPopup.close();
              },
            },
          ]
        );
      }
    });

    WA.room.area.onEnter("Zum Quizraum").subscribe(() => {
      if (isAreaDeactivated("Zum Quizraum")) {
        console.log("Quizraum ist deaktiviert und kann nicht betreten werden.");
      }
    });

    WA.room.area.onEnter("Infotafel-Feld").subscribe(() => {
      WA.controls.disablePlayerControls();
      currentPopup = WA.ui.openPopup(
        "Feld-Pop-Up",
        "Die Erdäpfel sind leider noch nicht erntereif!",
        [
          {
            label: "Schade",
            callback: () => {
              WA.controls.restorePlayerControls();
              currentPopup.close();
            },
          },
        ]
      );
    });
    WA.room.area.onEnter("Infotafel-Friedhof").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "Friedhof-Pop-Up",
        "Der Friedhof der Verdammten",
        []
      );
    });
    WA.room.area.onLeave("Infotafel-Friedhof").subscribe(closePopup);

    WA.room.area.onEnter("Infotafel-Quizerläuterung").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "Quizerläuterung-Pop-Up",
        "Begebt Euch an einen Quizpool!",
        []
      );
    });
    WA.room.area.onLeave("Infotafel-Quizerläuterung").subscribe(closePopup);

    WA.room.area.onEnter("Infotafel-Quizergebnis").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "Quizergebnis-Pop-Up",
        "Die Ergebnisse: ...",
        []
      );
    });
    WA.room.area.onLeave("Infotafel-Quizergebnis").subscribe(closePopup);

    WA.room.area.onEnter("l1s1").subscribe(() => {
      currentPopup = WA.ui.modal.openModal(
        {
          title: "Bild anzeigen",
          src: "https://mxritzzxllnxr.github.io/images/l1s1.PNG", // Ersetze durch die tatsächliche URL deines Bildes
          allow: "fullscreen",
          allowApi: true,
          position: "center",
        },
        () => {
          console.info("The modal was closed");
        }
      );
    });
    WA.room.area.onLeave("l1s1").subscribe(closePopup);

    WA.room.area.onEnter("wegweiser").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "wegweiserpopup",
        "↑ Haupthalle\n→ Konferenzinsel\n↓ Quizraum\n← Labyrinth",
        []
      );
    });
    WA.room.area.onLeave("wegweiser").subscribe(closePopup);

    WA.room.area.onEnter("l1").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "l1popup",
        "Hier geht es zu Labyrinth 1",
        []
      );
    });
    WA.room.area.onLeave("l1").subscribe(closePopup);

    WA.room.area.onEnter("l2").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "l2popup",
        "Hier geht es zu Labyrinth 2",
        []
      );
    });
    WA.room.area.onLeave("l2").subscribe(closePopup);

    WA.room.area.onEnter("l3").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "l3popup",
        "Hier geht es zu Labyrinth 3",
        []
      );
    });
    WA.room.area.onLeave("l3").subscribe(closePopup);

    WA.room.area.onEnter("backtopark").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "backtoparkpopup",
        "Hier geht es zurück zum Park",
        []
      );
    });
    WA.room.area.onLeave("backtopark").subscribe(closePopup);

    WA.room.area.onEnter("clock").subscribe(() => {
      const today = new Date();
      const time = today.getHours() + ":" + today.getMinutes();
      currentPopup = WA.ui.openPopup(
        "clock-Pop-Up",
        "The time is: " + time,
        []
      );
    });

    WA.room.area.onLeave("clock").subscribe(closePopup);

    //Countdown
    let countdownTime = 10 * 60; // 10 minutes in seconds
    let countdownInterval: string | number | NodeJS.Timeout | null | undefined;
    let isCountdownRunning = false; // Variable to track if the countdown is already running
    let currentPopup: Popup | null = null;

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${
        remainingSeconds < 10 ? "0" : ""
      }${remainingSeconds}`;
    }

    function updateCountdown() {
      countdownTime--;
      if (countdownTime < 0) {
        clearInterval(countdownInterval as NodeJS.Timeout);
        countdownInterval = null;
      }

      if (currentPopup) {
        currentPopup.close(); // Close the existing popup
        currentPopup = undefined; // Clear the reference

        // Reopen the popup with updated content
        currentPopup = WA.ui.openPopup(
          "countdownPopup", // Ensure you have a unique identifier
          `Countdown ${formatTime(countdownTime)}`,
          []
        );
      } else {
        showPopup();
      }
    }

    function showPopup() {
      if (currentPopup) {
        currentPopup.close();
      }
      currentPopup = WA.ui.openPopup(
        "countdownpopup",
        `Countdown ${formatTime(countdownTime)}`,
        []
      );
    }

    function startCountdown() {
      if (!isCountdownRunning) {
        isCountdownRunning = true;
        countdownInterval = setInterval(updateCountdown, 1000); // Update countdown every second
      }
    }

    WA.room.area.onEnter("countdown").subscribe(() => {
      startCountdown();
      showPopup();
    });

    WA.room.area.onLeave("countdown").subscribe(() => {
      if (currentPopup) {
        currentPopup.close();
        currentPopup = null;
      }
    });
    //Countdown ende

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra()
      .then(() => {
        console.log("Scripting API Extra ready");
      })
      .catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
