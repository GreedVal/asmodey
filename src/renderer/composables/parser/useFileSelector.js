import { ref } from "vue";

export function useFileSelector() {
  // ----------------------
  // Reactive state
  // ----------------------
  const filePath = ref(null);
  const fileType = ref(null);
  const delimiter = ref("");
  const lines = ref([]);
  const analysis = ref(null);

  const isDialogOpen = ref(false);
  const showCsvDelimiterModal = ref(false);
  const showRangeModal = ref(false);
  const showFormatModal = ref(false);

  const isParserReady = ref(false);
  const isLoading = ref(false);

  const progress = ref(0);
  const progressLabel = ref("");

  const isPaused = ref(false);
  const isStopped = ref(false);

  // ----------------------
  // File selection
  // ----------------------
  const resetFileState = () => {
    filePath.value = null;
    fileType.value = null;
    delimiter.value = "";
    lines.value = [];
    analysis.value = null;
    isParserReady.value = false;
    isLoading.value = false;
    progress.value = 0;
    progressLabel.value = "";
  };

  const selectFileHandler = async () => {
    if (window.workerAPI.restartWorker) {
      window.workerAPI.restartWorker();
    } else {
      resetFileState();
    }

    isDialogOpen.value = true;
    const path = await window.fileDialog.openFile();
    isDialogOpen.value = false;
    if (!path) return;

    filePath.value = path;
    const ext = path.split(".").pop().toLowerCase();
    fileType.value = ["csv", "xlsx", "xls", "json"].includes(ext)
      ? ext
      : "unknown";
  };

  // ----------------------
  // Parser initialization
  // ----------------------
  const initParser = async (format, delimiterOpt = null) => {
    return new Promise((resolve) => {
      window.workerAPI.startTask({
        action: "initParser",
        params: {
          filePath: filePath.value,
          format,
          ...(delimiterOpt && { delimiter: delimiterOpt }),
        },
      });

      const onReady = () => {
        isParserReady.value = true;
        window.workerAPI.offParserReady(listener);
        resolve();
      };
      const listener = window.workerAPI.onParserReady(onReady);
    });
  };

  // ----------------------
  // File analysis
  // ----------------------
  const startAnalysis = async () => {
    isLoading.value = true;
    progress.value = 0;

    const timer = setInterval(() => {
      if (progress.value < 90) progress.value += 5;
    }, 200);

    window.workerAPI.startTask({ action: "analyze" });

    await new Promise((resolve) => {
      const onAnalyzeDone = (result) => {
        window.workerAPI.offAnalyzeDone(listener);
        analysis.value = result;
        resolve(result);
      };
      const listener = window.workerAPI.onAnalyzeDone(onAnalyzeDone);
    });

    clearInterval(timer);
    progress.value = 100;
    setTimeout(() => (isLoading.value = false), 300);
  };

  const analysisHandle = async () => {
    if (!filePath.value || fileType.value === "unknown") return;

    delimiter.value = "";
    progress.value = 0;
    analysis.value = null;
    progressLabel.value = "Анализ файла...";
    isParserReady.value = false;

    if (fileType.value === "csv") {
      if (!delimiter.value) {
        showCsvDelimiterModal.value = true;
        return;
      }
      await initParser("csv", delimiter.value);
    } else {
      await initParser(fileType.value);
    }

    await startAnalysis();
  };

  const confirmCsvDelimiter = async (userDelimiter) => {
    showCsvDelimiterModal.value = false;
    delimiter.value = userDelimiter;

    await initParser("csv", delimiter.value);
    await startAnalysis();
  };

  // ----------------------
  // Range modal handling
  // ----------------------
  const openRangeModal = () => {
    showRangeModal.value = true;
  };

  const rangeConfirmHandle = ({ start, end }) => {
    return new Promise((resolve) => {
      showRangeModal.value = false;
      isLoading.value = true;
      progress.value = 0;
      progressLabel.value = "Выгрузка строк...";

      const onProgress = (p) => (progress.value = p);
      const progressListener = window.workerAPI.onRangeProgress(onProgress);

      const onDone = (rows) => {
        window.workerAPI.offRangeProgress(progressListener);
        window.workerAPI.offRangeDone(doneListener);
        lines.value = rows.map((r) => ({ type: "range", text: r }));
        isLoading.value = false;
        resolve(rows);
      };
      const doneListener = window.workerAPI.onRangeDone(onDone);

      window.workerAPI.startTask({
        action: "getRange",
        params: { start: start - 1, end },
      });
    });
  };

  // ----------------------
  // Format/Export handling
  // ----------------------
  const openFormatModal = () => {
    showFormatModal.value = true;
  };

  const formatConfirmHandle = async ({ columnCount, columns }) => {
    const folderPath = await window.fileDialog.openFolder();
    if (!folderPath) return;

    showFormatModal.value = false;

    lines.value = [];
    isLoading.value = true;
    isPaused.value = false;
    isStopped.value = false;
    progress.value = 0;
    progressLabel.value = "Форматирование строк...";

    return new Promise((resolve, reject) => {
      const onProgress = (percent) => (progress.value = percent);
      const progressListener = window.workerAPI.onProgress(onProgress);

      const onRow = ({ row, valid }) => {
        lines.value.push({ type: "format", text: row, valid });
      };
      const rowListener = window.workerAPI.onRowProcessed(onRow);

      const onDone = () => {
        cleanup();
        isLoading.value = false;
        resolve();
      };
      const doneListener = window.workerAPI.onDone(onDone);

      const onStopped = () => {
        cleanup();
        isLoading.value = false;
        isStopped.value = true;
        resolve();
      };
      const stoppedListener = window.workerAPI.onStopped(onStopped);

      const onError = (err) => {
        cleanup();
        isLoading.value = false;
        reject(err);
      };
      const errorListener = window.workerAPI.onError(onError);

      function cleanup() {
        window.workerAPI.offProgress(progressListener);
        window.workerAPI.offRowProcessed(rowListener);
        window.workerAPI.offDone(doneListener);
        window.workerAPI.offStopped(stoppedListener);
        window.workerAPI.offError(errorListener);
      }

      window.workerAPI.startTask({
        action: "processAndSaveAll",
        params: {
          folderPath,
          columns: JSON.parse(JSON.stringify(columns)),
          columnCount,
          lineCount: analysis.value.lineCount,
        },
      });
    });
  };

  // ----------------------
  // Pause / Resume / Stop
  // ----------------------
  const pauseTask = () => {
    window.workerAPI.pause();
    isPaused.value = true;
  };
  const resumeTask = () => {
    window.workerAPI.resume();
    isPaused.value = false;
  };
  const stopTask = () => {
    window.workerAPI.stop();
    isStopped.value = true;
  };

  // ----------------------
  // Expose state & actions
  // ----------------------
  return {
    // State
    filePath,
    fileType,
    delimiter,
    lines,
    analysis,
    isDialogOpen,
    showCsvDelimiterModal,
    showRangeModal,
    showFormatModal,
    isParserReady,
    isLoading,
    progress,
    progressLabel,
    isPaused,
    isStopped,

    // Actions
    selectFileHandler,
    analysisHandle,
    confirmCsvDelimiter,
    openRangeModal,
    rangeConfirmHandle,
    openFormatModal,
    formatConfirmHandle,
    stopTask,
    resumeTask,
    pauseTask,
  };
}
