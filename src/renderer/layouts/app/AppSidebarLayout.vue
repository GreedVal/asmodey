<script setup>
import { ref } from "vue";
import Sidebar from "@/renderer/components/AppSidebar.vue";

const isCollapsed = ref(false);
</script>

<template>
  <div class="flex w-screen h-screen bg-neutral-950 text-neutral-200">
    <Sidebar v-model="isCollapsed" />

    <div
      class="flex-1 overflow-y-hidden m-2 rounded-2xl bg-neutral-900 shadow-md"
    >
      <router-view :key="$route.fullPath" />
    </div>
  </div>
</template>
