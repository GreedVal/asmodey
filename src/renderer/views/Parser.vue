<script setup>
import Button from "../components/ui/button/Button.vue";
import Analysis from "../components/Analysis.vue";
import RangeModal from "../components/modal/RangeModal.vue";
import FormatModal from "../components/modal/FormatModal.vue";
import CsvDelimiterModal from "../components/modal/CsvDelimiterModal.vue";
import { useFileSelector } from "../composables/parser/useFileSelector";
import TaskControls from "../components/TaskControls.vue";
import LogRow from "../components/LogRow.vue";

const {
  filePath,
  fileType,
  delimiter,
  lines,
  analysis,
  isDialogOpen,
  showCsvDelimiterModal,
  showRangeModal,
  isParserReady,
  isLoading,
  rangeConfirmHandle,
  progress,
  progressLabel,
  showFormatModal,
  selectFileHandler,
  analysisHandle,
  confirmCsvDelimiter,
  openRangeModal,
  formatConfirmHandle,
  openFormatModal,
  stopTask,
  resumeTask,
  pauseTask,
  isPaused,
  isStopped,
} = useFileSelector();
</script>

<template>
  <!-- ---------- Прогресс ---------- -->
  <div v-if="isLoading" class="mb-4 p-4">
    <p class="text-sm mb-1">{{ progressLabel }} {{ progress }}%</p>
    <div class="w-full bg-neutral-800 h-3 rounded overflow-hidden">
      <div
        class="bg-gray-500 h-3 transition-all"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
  </div>

  <div class="h-full p-4 flex gap-4 overflow-y-hidden">
    <!-- ---------- Левая панель: Действия и информация ---------- -->
    <div class="w-[35%] h-full overflow-y-auto">
      <!-- Действия -->
      <div class="flex gap-4 mb-2">
        <Button
          icon="Folder"
          tooltip="Загрузить файл"
          :disabled="isDialogOpen"
          @click="selectFileHandler"
        />
        <Button
          icon="PieChart"
          tooltip="Анализ файла"
          :disabled="fileType === 'unknown' || !fileType"
          @click="analysisHandle"
        />
        <Button
          icon="Text"
          tooltip="Выгрузить строки (требуется анализ)"
          :disabled="fileType === 'unknown' || !fileType || !analysis"
          @click="openRangeModal"
        />
        <Button
          icon="Edit"
          tooltip="Форматирование файла (требуется анализ)"
          :disabled="fileType === 'unknown' || !fileType || !analysis"
          @click="openFormatModal"
        />
      </div>

      <!-- Информация о файле -->
      <div v-if="filePath" class="mt-2">
        <h3 class="font-bold mb-2">Информация:</h3>
        <p>
          <strong>Файл:</strong>
          <span class="block w-full truncate" :title="filePath">{{
            filePath
          }}</span>
        </p>
        <p>
          <strong>Тип:</strong>
          <span
            :class="fileType === 'unknown' ? 'text-red-500' : 'text-green-500'"
          >
            {{ fileType }}
          </span>
        </p>
      </div>

      <!-- Анализ файла -->
      <div v-if="analysis" class="mt-4">
        <Analysis :analysis="analysis" />
      </div>
    </div>

    <!-- ---------- Правая панель: Выгруженные строки ---------- -->
    <div class="w-[65%] h-full p-4 overflow-y-auto">
      <div>
        <LogRow
          v-for="(line, i) in lines"
          :key="i"
          :row="line"
          :isPaused="isPaused"
          @pause="pauseTask"
          @resume="resumeTask"
          @stop="stopTask"
        />
      </div>
    </div>

    <!-- ---------- Модальные окна ---------- -->
    <RangeModal
      :visible="showRangeModal"
      :max="analysis ? analysis.lineCount : 0"
      @close="showRangeModal = false"
      @confirm="rangeConfirmHandle"
    />

    <FormatModal
      :visible="showFormatModal"
      :max="analysis ? analysis.maxColumnCount : 0"
      @close="showFormatModal = false"
      @confirm="formatConfirmHandle"
    />

    <CsvDelimiterModal
      :visible="showCsvDelimiterModal"
      :initialDelimiter="delimiter"
      @close="showCsvDelimiterModal = false"
      @confirm="confirmCsvDelimiter"
    />
  </div>
</template>
