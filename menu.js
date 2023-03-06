const { Menu, dialog } = require("electron");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static-electron");
const ffprobe = require("ffprobe-static-electron");
const ProgressBar = require("electron-progressbar");

ffmpeg.setFfmpegPath(ffmpegStatic.path);
ffmpeg.setFfprobePath(ffprobe.path);

const IS_MAC = process.platform === "darwin";

let currentlySelectedFile = null;

const MENU_TEMPLATE = [
    ...(IS_MAC ? [{ role: "appMenu" }] : []),
    {
        label: "File",
        submenu: [
            {
                label: "Video",
                submenu: [
                    {
                        label: "Load...",
                        click(event, focusedWindow) {
                            dialog
                                .showOpenDialog(focusedWindow, {
                                    properties: ["openFile"],
                                    filters: [{ name: "Movies", extensions: [".mpg", ".mpeg", ".avi", ".wmv", ".mov", ".rm", ".ram", ".swf", ".flv", ".ogg", ".webm", ".mp4"] }]
                                })
                                .then((res) => {
                                    if (res.filePaths.length) {
                                        currentlySelectedFile = res.filePaths[0];
                                        focusedWindow.webContents.send("filePath", { path: currentlySelectedFile });
                                        Menu.getApplicationMenu().getMenuItemById("avi").enabled = true;
                                        Menu.getApplicationMenu().getMenuItemById("mp4").enabled = true;
                                        Menu.getApplicationMenu().getMenuItemById("webm").enabled = true;
                                    }
                                })
                                .catch((err) => console.log(err));
                        }
                    },
                    { type: "separator" },
                    {
                        label: "Convert to AVI...",
                        id: "avi",
                        enabled: false,
                        click(event, focusedWindow) {
                            handleCovertClick(focusedWindow, "avi");
                        }
                    },
                    {
                        label: "Convert to MP4...",
                        id: "mp4",
                        enabled: false,
                        click(event, focusedWindow) {
                            handleCovertClick(focusedWindow, "mp4");
                        }
                    },
                    {
                        label: "Convert to WEBM...",
                        id: "webm",
                        enabled: false,
                        click(event, focusedWindow) {
                            handleCovertClick(focusedWindow, "webm");
                        }
                    }
                ]
            },
            { type: "separator" },
            { label: "Quit", role: "quit" }
        ]
    },
    {
        label: "Developer",
        submenu: [{ role: "toggleDevTools" }]
    }
];

function handleCovertClick(focusedWindow, fileType) {
    dialog.showSaveDialog(focusedWindow).then((res) => {
        if (!res.canceled) {
            const progressBar = new ProgressBar({
                indeterminate: false,
                text: `Converting video to ${fileType}...`,
                detail: "0%",
                browserWindow: {
                    parent: focusedWindow
                }
            });
            progressBar
                .on("completed", () => {
                    progressBar.detail = "Completed";
                })
                .on("progress", (value) => {
                    progressBar.detail = `${value}%`;
                });

            ffmpeg(currentlySelectedFile)
                .toFormat(fileType)

                .on("progress", (progress) => {
                    console.log(progress);

                    if (progressBar.isInProgress()) {
                        progressBar.value = Math.ceil(progress.percent);
                    }
                })
                .on("end", (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Coversion done");
                    }
                })
                .saveToFile(`${res.filePath}.${fileType}`);
        }
    });
}

const menu = Menu.buildFromTemplate(MENU_TEMPLATE);
module.exports = menu;
