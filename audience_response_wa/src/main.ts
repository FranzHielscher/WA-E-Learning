/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";
import "/pop-up-style.css";
console.log("Script started successfully");

let currentPopup: any = undefined;

// Waiting for the API to be ready
WA.onInit()
  .then(() => {
    console.log("Scripting API ready");
    console.log("Player tags: ", WA.player.tags);

    WA.room.area.onEnter("JitsiMeeting1").subscribe(() => {
      currentPopup = WA.ui.openPopup("JitsiMeetingPopup1", "Welcome to Jitsi!", []);
    });
    WA.room.area.onLeave("JitsiMeeting1").subscribe(closePopup);

    WA.room.area.onEnter("JitsiMeeting2").subscribe(() => {
      currentPopup = WA.ui.openPopup("JitsiMeetingPopup2", "Welcome to Jitsi!", []);
    });
    WA.room.area.onLeave("JitsiMeeting2").subscribe(closePopup);

    WA.room.area.onEnter("JitsiMeeting3").subscribe(() => {
      currentPopup = WA.ui.openPopup("JitsiMeetingPopup3", "Welcome to Jitsi!", []);
    });
    WA.room.area.onLeave("JitsiMeeting3").subscribe(closePopup);

    WA.room.area.onEnter("Infotafel").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "Infotafelpopup",
        "Herzlich willkommen Reisender! Begebe dich in die Haupthalle für weitere Informationen!",
        []
      );
    });
    WA.room.area.onLeave("Infotafel").subscribe(closePopup);

    WA.room.area.onEnter("l1s1").subscribe(() => {
      currentPopup = WA.ui.openPopup(
        "l1s1popup",
        "Herzlich willkommen Reisender! Begebe dich in die Haupthalle für weitere Informationen!",
        []
      );
    });
    WA.room.area.onLeave("l1s1").subscribe(closePopup);

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
