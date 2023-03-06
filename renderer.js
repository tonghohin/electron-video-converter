const { ipcRenderer } = require("electron");
const source = document.querySelector("source");
const video = document.querySelector(".js-player");

ipcRenderer.on("filePath", (event, { path }) => {
  console.log(path);
  source.src = path;
  video.load();
});
