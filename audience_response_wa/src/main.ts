/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";
console.log("Script started successfully");

let currentPopup: any = undefined;

interface Team {
  name: string;
  members: string[];
}

// Initialisierung der Teams
const teams: { [key: string]: Team } = {
  A: { name: "Team A", members: [] },
  B: { name: "Team B", members: [] },
  C: { name: "Team C", members: [] },
};

function joinTeam(teamKey: string) {
  const team = teams[teamKey];
  const playerName = WA.player.name;

  // Überprüfen, ob der Spieler bereits in einem Team ist
  for (const key in teams) {
    if (teams[key].members.includes(playerName)) {
      WA.chat.sendChatMessage(
        `${playerName}, you are already in ${teams[key].name}`,
        playerName
      );
      return; // Beende die Funktion, da der Spieler bereits in einem Team ist
    }
  }

  // Füge den Spieler dem Team hinzu, wenn er noch keinem Team angehört
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

// Verbindung zu einem WebSocket-Server herstellen
const socket = new WebSocket("ws://localhost:8081");

socket.onopen = () => {
  console.log("WebSocket connection established");
  // Bei Verbindungsaufbau Team-Informationen anfordern
  socket.send(JSON.stringify({ type: "requestTeams" }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "teamUpdate") {
    teams[data.teamKey].members = data.members;
  }
};

let deactivatedAreas: { [key: string]: boolean } = {
  "Infotafel-Quizraum": false,
  "Infotafel-Conference": false,
  "Infotafel-Mainhall": false,
};

// Funktion zum Deaktivieren einer Area
function deactivateArea(area: string) {
  deactivatedAreas[area] = true;
}

// Funktion zum Aktivieren einer Area
function activateArea(area: string) {
  deactivatedAreas[area] = false;
}

// Funktion, die prüft, ob eine Area deaktiviert ist
function isAreaDeactivated(area: string): boolean {
  return deactivatedAreas[area] === true;
}

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
    });

    WA.room.area.onEnter("teamBlauZone").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "teamBlauZone-Pop-Up",
        "Sie sind Team Blau beigetreten",
        []
      );
      joinTeam("Blau");
    });

    WA.room.area.onEnter("teamGrünZone").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "teamGrünZone-Pop-Up",
        "Sie sind Team Grün beigetreten",
        []
      );
      joinTeam("Grün");
    });

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
        []
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

    WA.room.area.onEnter("Infotafel-Conference").subscribe(() => {
      if (isAreaDeactivated("Infotafel-Conference")) {
        console.log("Quizraum ist deaktiviert und kann nicht betreten werden.");
      } else {
        WA.controls.disablePlayerControls();
        currentPopup = WA.ui.openPopup(
          "Conference-Pop-Up",
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
      currentPopup = WA.ui.openPopup(
        "l1s1popup",
        '<img src="bild.png" alt="Willkommensbild" style="max-width: 100%; height: auto;">',
        []
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

    WA.room.area.onEnter("countdown").subscribe(() => {
      let countdownTime = 10 * 60; // 10 minutes in seconds

      function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${
          remainingSeconds < 10 ? "0" : ""
        }${remainingSeconds}`;
      }

      function updatePopup() {
        currentPopup = WA.ui.openPopup(
          "countdownpopup",
          `Countdown: ${formatTime(countdownTime)}`,
          []
        );
      }
      updatePopup(); // Initial popup with the full countdown time

      const countdownInterval = setInterval(() => {
        countdownTime--;

        if (countdownTime < 0) {
          clearInterval(countdownInterval);
          return;
        }

        updatePopup();
      }, 1000); // Update every second
    });
    WA.room.area.onLeave("countdown").subscribe(closePopup);

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
