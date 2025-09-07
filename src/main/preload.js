const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fileDialog", {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  openFolder: () => ipcRenderer.invoke("dialog:openFolder"),
});

contextBridge.exposeInMainWorld("workerAPI", {
  // Запуск задач
  startTask: (task) => ipcRenderer.invoke("worker:sendTask", task),
  restartWorker: () => ipcRenderer.invoke("worker:restart"),
  pause: () => ipcRenderer.invoke("worker:pause"),
  resume: () => ipcRenderer.invoke("worker:resume"),
  stop: () => ipcRenderer.invoke("worker:stop"),

  // --- События ---
  onProgress: (cb) => {
    const listener = (_e, percent) => cb(percent);
    ipcRenderer.on("filter:progress", listener);
    return listener;
  },
  offProgress: (listener) => {
    ipcRenderer.removeListener("filter:progress", listener);
  },

  onDone: (cb) => {
    const listener = () => cb();
    ipcRenderer.on("filter:done", listener);
    return listener;
  },
  offDone: (listener) => {
    ipcRenderer.removeListener("filter:done", listener);
  },

  onStopped: (cb) => {
    const listener = (_e, index) => cb(index);
    ipcRenderer.on("worker:stopped", listener);
    return listener;
  },
  offStopped: (listener) => {
    ipcRenderer.removeListener("worker:stopped", listener);
  },

  onRowProcessed: (cb) => {
    const listener = (_e, data) => cb(data);
    ipcRenderer.on("filter:rowProcessed", listener);
    return listener;
  },
  offRowProcessed: (listener) => {
    ipcRenderer.removeListener("filter:rowProcessed", listener);
  },

  onError: (cb) => {
    const listener = (_e, err) => cb(err);
    ipcRenderer.on("worker:error", listener);
    return listener;
  },
  offError: (listener) => {
    ipcRenderer.removeListener("worker:error", listener);
  },

  // Parser events
  onParserReady: (cb) => {
    const listener = () => cb();
    ipcRenderer.on("parser:ready", listener);
    return listener;
  },
  offParserReady: (listener) => {
    ipcRenderer.removeListener("parser:ready", listener);
  },

  onAnalyzeDone: (cb) => {
    const listener = (_e, result) => cb(result);
    ipcRenderer.on("parser:analyzeDone", listener);
    return listener;
  },
  offAnalyzeDone: (listener) => {
    ipcRenderer.removeListener("parser:analyzeDone", listener);
  },

  onRangeProgress: (cb) => {
    const listener = (_e, data) => cb(data);
    ipcRenderer.on("parser:rangeProgress", listener);
    return listener;
  },
  offRangeProgress: (listener) => {
    ipcRenderer.removeListener("parser:rangeProgress", listener);
  },

  onRangeDone: (cb) => {
    const listener = (_e, data) => cb(data);
    ipcRenderer.on("parser:rangeDone", listener);
    return listener;
  },
  offRangeDone: (listener) => {
    ipcRenderer.removeListener("parser:rangeDone", listener);
  },
});
