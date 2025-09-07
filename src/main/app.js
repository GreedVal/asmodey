import { app, BrowserWindow, Menu } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = !app.isPackaged;

export function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    minWidth: 1200,
    minHeight: 700,
    show: false,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win
      .loadURL("http://localhost:5173")
      .then(() => console.log("✅ Loaded Vite dev server"))
      .catch((err) => console.error("❌ Failed to load Vite URL:", err));

    win.webContents.once("did-finish-load", () => {
      win.webContents.openDevTools();
    });
  } else {
    win
      .loadFile(join(__dirname, "../../dist/index.html"))
      .then(() => console.log("✅ Loaded production HTML"))
      .catch((err) => console.error("❌ Failed to load index.html:", err));
  }

  win.once("ready-to-show", () => {
    win.show();
  });
}

Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
