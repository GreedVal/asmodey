<script setup>
defineProps({ collapsed: Boolean });
</script>

<template>
  <div
    class="h-16 flex items-center px-6 text-2xl pl-24 font-semibold tracking-wide text-white"
  >
    <span v-show="!collapsed" class="text-yellow-600">Asmodey</span>
  </div>
</template>
