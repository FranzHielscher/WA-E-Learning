/// <reference types="@workadventure/iframe-api-typings" />

import { Area } from "@workadventure/iframe-api-typings";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";
console.log("Script started successfully");

let currentPopup: any = undefined;

let activeAreas: { [key: string]: boolean } = {
  conference: false,
  labyrinth1: false,
  quizraum: false,
};
// Waiting for the API to be ready
WA.onInit()
  .then(() => {
    console.log("Scripting API ready");
    console.log("Player tags: ", WA.player.tags);

    // Funktion zum Aktivieren einer Area
    function activateArea(area: string) {
      if (!activeAreas[area]) {
        activeAreas[area] = true;
        console.log(`Activated area: ${area}`);
        // Hier kannst du weitere Aktionen ausführen, wenn eine Area aktiviert wird
      }
    }

    // Funktion zum Deaktivieren einer Area
    function deactivateArea(area: string) {
      if (activeAreas[area]) {
        activeAreas[area] = false;
        console.log(`Deactivated area: ${area}`);
        // Hier kannst du weitere Aktionen ausführen, wenn eine Area deaktiviert wird
      }
    }

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

    WA.room.area.onEnter("Infotafel").subscribe(() => {
      WA.controls.disablePlayerControls();
      currentPopup = WA.ui.openPopup(
        "Infotafel-Pop-Up",
        "Herzlich willkommen Reisender! Begebe dich in die Haupthalle für weitere Informationen!",
        [
          {
            label: "Alles gelesen",
            callback: () => {
              // Hier kannst du die Aktion hinzufügen, die bei Klick auf den Button ausgeführt wird
              WA.controls.restorePlayerControls();
              currentPopup.close();
              deactivateArea("Quizraum");
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
      deactivateArea("conference");
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
      WA.controls.disablePlayerControls();
      currentPopup = WA.ui.openPopup(
        "Quizraum-Pop-Up",
        "Betretet den Quizwald erst nachdem Ihr auf der Konferenzinsel wart!",
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
        "Herzlich willkommen Reisender! Begebe dich in die Haupthalle für weitere Informationen!",
        []
      );
    });
    WA.room.area.onLeave("l1s1").subscribe(closePopup);

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

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra()
      .then(() => {
        console.log("Scripting API Extra ready");
      })
      .catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));

function customizePopUpStyle() {
  if (currentPopup !== undefined) {
    let popupElement = currentPopup.getElement();
    if (popupElement) {
      popupElement.classList.add("pop-up-content"); // Beispiel für CSS-Klasse
    }
  }
}

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
