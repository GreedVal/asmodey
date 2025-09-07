<script setup>
import Button from "./ui/button/Button.vue";

defineProps({
  isPaused: Boolean,
});

const emit = defineEmits(["pause", "resume", "stop"]);
</script>

<template>
  <div class="flex gap-2">
    <Button
      v-if="!isPaused"
      icon="Pause"
      tooltip="Пауза"
      @click="emit('pause')"
    />
    <Button v-else icon="Play" tooltip="Продолжить" @click="emit('resume')" />
    <Button icon="Square" tooltip="Остановить" @click="emit('stop')" />
  </div>
</template>
