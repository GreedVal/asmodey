<script setup>
import { ref } from "vue";
import { ChevronDown, ChevronRight } from "lucide-vue-next";

defineProps({
  analysis: {
    type: Object,
    required: true,
  },
});

const showEmptyRows = ref(false);
</script>

<template>
  <div
    class="mt-6 bg-neutral-900 text-neutral-200 rounded-lg space-y-4 shadow-md"
  >
    <h3 class="font-bold mb-2">Аналитика:</h3>

    <div class="flex justify-between items-center">
      <span class="text-neutral-400">Всего строк:</span>
      <span class="font-semibold">{{ analysis.lineCount }}</span>
    </div>

    <div class="flex flex-col space-y-1">
      <span class="text-neutral-400">Первая строка:</span>
      <span
        class="truncate bg-neutral-800 px-3 py-1 rounded-md text-sm"
        :title="analysis.firstLine"
      >
        {{ analysis.firstLine }}
      </span>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-neutral-400">Кол-во элементов в первой строке:</span>
      <span class="font-semibold">{{ analysis.elementCountInFirstLine }}</span>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-neutral-400">Макс. кол-во колонок:</span>
      <span class="font-semibold">{{ analysis.maxColumnCount }}</span>
    </div>

    <div>
      <button
        class="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
        @click="showEmptyRows = !showEmptyRows"
      >
        <component
          :is="showEmptyRows ? ChevronDown : ChevronRight"
          class="w-4 h-4 transition-transform duration-200"
        />
        <span class="font-medium">Пустые ячейки (строки)</span>
      </button>

      <transition name="fade">
        <div v-if="showEmptyRows" class="mt-2 flex flex-wrap gap-2">
          <template v-if="analysis.emptyCellRows.length">
            <span
              v-for="row in analysis.emptyCellRows"
              :key="row"
              class="bg-neutral-800 px-3 py-1 rounded text-sm"
            >
              {{ row }}
            </span>
          </template>
          <span v-else class="text-neutral-400 italic text-sm">
            Пустых строк нет
          </span>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
