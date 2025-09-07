<script setup>
import TaskControls from "./TaskControls.vue";

defineProps({
  row: {
    type: Object,
    required: true,
  },
  isPaused: Boolean,
});

const emit = defineEmits(["pause", "resume", "stop"]);
</script>

<template>
  <div
    :class="
      row.type === 'range'
        ? 'text-white'
        : row.valid === false
          ? 'text-red-800'
          : 'text-green-800'
    "
  >
    <template v-if="row.type === 'range'">
      {{ row.text }}
    </template>

    <template v-else>
      <div class="flex gap-2 mt-2">
        <TaskControls
          :isPaused="isPaused"
          @pause="pauseTask"
          @resume="resumeTask"
          @stop="stopTask"
        />
      </div>

      <span v-for="(value, key) in row.text" :key="key">
        {{ key }}: {{ value }}
      </span>
    </template>
  </div>
</template>
