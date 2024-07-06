import { Popup } from "@workadventure/iframe-api-typings";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log("Script started successfully");

let currentPopup: Popup | undefined = undefined;

// Team Management
interface Team {
    name: string;
    members: string[];
}

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
        WA.chat.sendChatMessage(`Sorry, ${team.name} is full., playerName`);
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

// Countdown
let countdownTime = 10 * 60; // 10 minutes in seconds
let countdownInterval: NodeJS.Timeout | null = null;
let isCountdownRunning = false;

function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

function updateCountdown() {
    countdownTime--;
    if (countdownTime < 0) {
        clearInterval(countdownInterval as NodeJS.Timeout);
        countdownInterval = null;
    }

    if (currentPopup) {
        currentPopup.close();  // Close the existing popup
        currentPopup = undefined;  // Clear the reference

        // Reopen the popup with updated content
        currentPopup = WA.ui.openPopup(
            "countdownPopup",  // Ensure you have a unique identifier
            Countdown `${formatTime(countdownTime)}`,
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
        Countdown `${formatTime(countdownTime)}`,
        []
    );
}

function startCountdown() {
    if (!isCountdownRunning) {
        isCountdownRunning = true;
        countdownInterval = setInterval(() => {
            updateCountdown();
            if (countdownTime <= 0) {
                clearInterval(countdownInterval as NodeJS.Timeout);
                countdownInterval = null;
                currentPopup?.close(); // Close the popup when countdown ends
            }
        }, 1000); // Update every second
    }
}

// Initialize API and Setup Area Events
WA.onInit()
    .then(() => {
        console.log("Scripting API ready");
        console.log("Player tags: ", WA.player.tags);

        loadHudFrame();

        // Handle team zones
        const teamZones = {
            "teamRotZone": "Rot",
            "teamBlauZone": "Blau",
            "teamGruenZone": "Grün",
            "teamGelbZone": "Gelb"
        };

        for (const [area, teamKey] of Object.entries(teamZones)) {
            WA.room.area.onEnter(area).subscribe(() => {
                if (!isAreaDeactivated(`${teamKey}Zone-Pop-Up`)) {
                    currentPopup = WA.ui.openPopup(
                        `${teamKey}Zone-Pop-Up`,
                        `Sie sind Team ${teamKey} beigetreten`,
                        []
                );
                    joinTeam(teamKey);
                    deactivateArea(`${teamKey}Zone-Pop-Up`);
                }
            });
            WA.room.area.onLeave(area).subscribe(() => {
                closePopup();
                activateArea(`${teamKey}Zone-Pop-Up`);
            });
        }

        // Spezialzonen-Handler
        const specialZones = [
            { area: "JitsiMeeting1", popup: "JitsiMeetingPopup1", message: "Welcome to Jitsi!" },
            { area: "JitsiMeeting2", popup: "JitsiMeetingPopup2", message: "Welcome to Jitsi!" },
            { area: "JitsiMeeting3", popup: "JitsiMeetingPopup3", message: "Welcome to Jitsi!" },
            { area: "Infotafel", popup: "Infotafel-Pop-Up", message: "Herzlich willkommen Reisender! Begebe dich in die Haupthalle für weitere Informationen!" },
            { area: "Infotafel-Haupthalle", popup: "Haupthalle-Pop-Up", message: "Ihr begebt euch in Richtung der Haupthalle!" },
            { area: "Infotafel-Mainhall", popup: "Mainhall-Pop-Up", message: "Willkommen in der Haupthalle, tritt einem Team bei!" },
            { area: "Infotafel-Labyrinth", popup: "Labyrinth-Pop-Up", message: "Betretet das Labyrinth erst nachdem Ihr in der Haupthalle wart!" },
            { area: "Infotafel-Conference", popup: "Conference-Pop-Up", message: "Ihr begebt euch in Richtung der Konferenzinsel!" },
            { area: "Infotafel-Quizraum", popup: "Quizraum-Pop-Up", message: "Der Quizraum kann noch nicht betreten werden!" },
            { area: "Zum Quizraum", popup: "Zum Quizraum", message: "" },
            { area: "TeamHalle", popup: "TeamHalle", message: "" },
            { area: "Infotafel-Feld", popup: "Feld-Pop-Up", message: "Die Erdäpfel sind leider noch nicht erntereif!", disableControls: true },
            { area: "Infotafel-Friedhof", popup: "Friedhof-Pop-Up", message: "Der Friedhof der Verdammten" },
            { area: "Infotafel-Quizerläuterung", popup: "Quizerläuterung-Pop-Up", message: "Begebt Euch an einen Quizpool!" },
            { area: "Infotafel-Quizergebnis", popup: "Quizergebnis-Pop-Up", message: "Die Ergebnisse: ..." },
            { area: "wegweiser", popup: "wegweiserpopup", message: "↑ Haupthalle\n→ Konferenzinsel\n↓ Quizraum\n← Labyrinth" },
            { area: "l1s1", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l1s2", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l1s3", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l1s4", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l1s5", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l1extra", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l2s1", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l2s2", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l2s3", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l2s4", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l2s5", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l2extra", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l3s1", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l3s2", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l3s3", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l3s4", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l3s5", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l3extra", popup: "Bild-Anzeigen", message: '', infoboard: true, src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG' },
            { area: "l1", popup: "l1popup", message: "Hier geht es zu Labyrinth 1" },
            { area: "l2", popup: "l2popup", message: "Hier geht es zu Labyrinth 2" },
            { area: "l3", popup: "l3popup", message: "Hier geht es zu Labyrinth 3" },
            { area: "backtopark", popup: "backtoparkpopup", message: "Hier geht es zurück zum Park" },
            { area: "clock", popup: "clock-Pop-Up", message: '' },
            { area: "countdown", popup: "countdownpopup", message: '', countdown: true }
        ];

        specialZones.forEach(({ area, popup, message, disableControls, infoboard, src, countdown }) => {
            WA.room.area.onEnter(area).subscribe(() => {
                if (disableControls) {
                    WA.controls.disablePlayerControls();
                }

                if (infoboard) {
                    // @ts-ignore
                    // noinspection JSVoidFunctionReturnValueUsed
                    currentPopup = WA.ui.modal.openModal({
                        title: "Bild anzeigen",
                        src: src,
                        allow: "fullscreen",
                        allowApi: true,
                        position: "center",
                    }, () => {
                        console.info('The modal was closed');
                    });
                } else if (countdown) {
                    startCountdown();
                } else if (area === "clock") {
                    const today = new Date();
                    const time = today.getHours() + ":" + today.getMinutes();
                    currentPopup = WA.ui.openPopup(popup, "The time is: " + time, []);
                } else {
                    currentPopup = WA.ui.openPopup(popup, message, [
                        {
                            label: "Alles klar!",
                            callback: () => {
                                if (disableControls) {
                                    WA.controls.restorePlayerControls();
                                }
                                closePopup();
                            }
                        }
                    ]);
                }
            });

            WA.room.area.onLeave(area).subscribe(() => {
                if (disableControls) {
                    WA.controls.restorePlayerControls();
                }
                closePopup();
            });
        });

        // Initialize additional API features
        bootstrapExtra()
            .then(() => {
                console.log("Scripting API Extra ready");
            })
            .catch((e) => console.error(e));

    })
    .catch((e) => console.error(e));