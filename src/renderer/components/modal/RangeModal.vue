<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  visible: Boolean,
  max: Number,
});
const emit = defineEmits(["close", "confirm"]);

const start = ref(1);
const end = ref(1);
const errorMessage = ref("");

watch(
  () => props.visible,
  (val) => {
    if (val) {
      start.value = 1;
      end.value = Math.min(100, props.max);
      errorMessage.value = "";
    }
  },
);

function confirm() {
  if (start.value < 1 || end.value < start.value) {
    errorMessage.value = "Неверный диапазон.";
    return;
  }
  if (end.value - start.value + 1 > 100) {
    errorMessage.value = "Нельзя выгрузить более 100 строк за раз.";
    return;
  }
  if (end.value > props.max) {
    errorMessage.value = `Максимум строк: ${props.max}`;
    return;
  }

  emit("confirm", { start: start.value, end: end.value });
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-neutral-900 text-white rounded-lg p-6 w-96 shadow-lg border border-neutral-700"
    >
      <h3 class="text-lg font-bold mb-4">
        Выберите диапазон строк, максимальное количество {{ max }}
      </h3>

      <div class="flex gap-4 mb-4">
        <input
          type="number"
          v-model.number="start"
          min="1"
          :max="max"
          class="bg-neutral-800 border border-neutral-600 p-2 rounded w-1/2 text-white focus:outline-none focus:border-blue-500"
        />
        <input
          type="number"
          v-model.number="end"
          min="1"
          :max="max"
          class="bg-neutral-800 border border-neutral-600 p-2 rounded w-1/2 text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <p v-if="errorMessage" class="text-red-400 mb-4">{{ errorMessage }}</p>

      <div class="flex justify-end gap-2">
        <button
          class="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded transition"
          @click="$emit('close')"
        >
          Отмена
        </button>
        <button
          class="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
          @click="confirm"
        >
          Выгрузить
        </button>
      </div>
    </div>
  </div>
</template>
