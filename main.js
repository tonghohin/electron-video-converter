const { app, BrowserWindow, Menu } = require("electron");
const menu = require("./menu");

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 605,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile("./index.html");
});

Menu.setApplicationMenu(menu);
