import { Popup } from "@workadventure/iframe-api-typings";
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

function closePopup() {
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
}

// Fog of War Funktionen
const VISIBILITY_RADIUS = 5; // Sichtweite des Spielers in Kacheln

function getPlayerPosition() {
    return { x: WA.player.position.x, y: WA.player.position.y };
}

function updateFogOfWar() {
    const playerPos = getPlayerPosition();
    const fogLayer = findLayerByName("FogOfWar");
    const width = fogLayer.width;
    const height = fogLayer.height;

    // Sicherstellen, dass fogLayer.data ein Array ist
    if (!Array.isArray(fogLayer.data)) {
        console.error("fogLayer.data ist nicht korrekt initialisiert.");
        return;
    }

    // Alle Kacheln auf undurchsichtig setzen
    fogLayer.data.fill(1);  // Annahme: 1 steht für sichtbare Kachel

    for (let y = -VISIBILITY_RADIUS; y <= VISIBILITY_RADIUS; y++) {
        for (let x = -VISIBILITY_RADIUS; x <= VISIBILITY_RADIUS; x++) {
            const tileX = Math.floor(playerPos.x + x);
            const tileY = Math.floor(playerPos.y + y);

            if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
                const index = tileY * width + tileX;
                fogLayer.data[index] = 0; // Annahme: 0 steht für unsichtbare Kachel
            }
        }
    }

    WA.room.render();
}

function findLayerByName(layerName: string) {
    return WA.room.layers.find(layer => layer.name === layerName);
}

function startFogOfWar() {
    setInterval(updateFogOfWar, 1000); // Alle 1000 ms (1 Sekunde) aktualisieren
}

// Waiting for the API to be ready
WA.onInit()
    .then(() => {
        console.log("Scripting API ready");
        console.log("Player tags: ", WA.player.tags);

        startFogOfWar();

        const currentMap = WA.room.name;
        if (currentMap === "labyrinth1" || currentMap === "labyrinth2" || currentMap === "labyrinth3") {
            WA.player.getPosition().then((playerPosition) => {
                const fogCanvas = document.createElement('canvas');
                const fogContext = fogCanvas.getContext('2d');

                fogCanvas.width = mapWidth;
                fogCanvas.height = mapHeight;

                fogContext.fillStyle = 'rgba(0, 0, 0, 0.8)';
                fogContext.fillRect(0, 0, fogCanvas.width, fogCanvas.height);

                fogContext.globalCompositeOperation = 'destination-out';
                fogContext.beginPath();
                fogContext.arc(playerPosition.x, playerPosition.y, radius, 0, Math.PI * 2);
                fogContext.fill();

                fogContext.globalCompositeOperation = 'source-over';

                document.body.appendChild(fogCanvas);
            });
        }

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
            currentPopup = WA.ui.modal.openModal({
                title: "Bild anzeigen",
                src: 'https://mxritzzxllnxr.github.io/images/l1s1.PNG', // Ersetze durch die tatsächliche URL deines Bildes
                allow: "fullscreen",
                allowApi: true,
                position: "center",
            }, () => {
                console.info('The modal was closed');
            });
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
            return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
        }

        function updateCountdown() {
            countdownTime--;

            if (countdownTime < 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                return;
            }
        }

        function showPopup() {
            currentPopup = WA.ui.openPopup(
                "countdownpopup",
                `Countdown: ${formatTime(countdownTime)}`,
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

export {};
