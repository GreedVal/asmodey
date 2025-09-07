<script setup>
import { ref, watch } from "vue";
import { X } from "lucide-vue-next";

const props = defineProps({
  visible: Boolean,
  initialDelimiter: { type: String, default: "," },
});

const emit = defineEmits(["close", "confirm"]);
const delimiter = ref(props.initialDelimiter);

watch(
  () => props.visible,
  (val) => {
    if (val) delimiter.value = props.initialDelimiter;
  },
);

const selectDelimiter = (value) => {
  delimiter.value = value;
};

const confirm = () => {
  emit("confirm", delimiter.value);
};
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
  >
    <div
      class="bg-neutral-900 text-neutral-200 rounded-2xl shadow-xl w-96 p-6 relative"
    >
      <button
        @click="$emit('close')"
        class="absolute top-2 right-2 text-neutral-400 hover:text-white"
      >
        <X class="w-5 h-5" />
      </button>

      <h2 class="text-lg font-semibold mb-4 text-white">
        Выберите разделитель CSV
      </h2>

      <div class="flex gap-2 mb-4 flex-wrap">
        <button
          v-for="opt in [',', ';', '|', 'Tab']"
          :key="opt"
          @click="selectDelimiter(opt === 'Tab' ? '\t' : opt)"
          :class="[
            'px-3 py-1 rounded border transition',
            delimiter.value === (opt === 'Tab' ? '\t' : opt)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700',
          ]"
        >
          {{ opt }}
        </button>
      </div>

      <input
        v-model="delimiter"
        placeholder="Введите свой разделитель"
        class="border border-neutral-700 bg-neutral-800 text-neutral-200 rounded w-full px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div class="flex justify-end space-x-2">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-200"
        >
          Отмена
        </button>
        <button
          @click="confirm"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
        >
          Продолжить
        </button>
      </div>
    </div>
  </div>
</template>
