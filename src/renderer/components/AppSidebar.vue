<script setup>
import { defineModel, defineEmits } from "vue";
import SidebarHeader from "@/renderer/components/sidebar/SidebarHeader.vue";
import SidebarNav from "@/renderer/components/sidebar/SidebarNav.vue";
import SidebarToggleChevron from "@/renderer/components/sidebar/SidebarToggleChevron.vue";
import SidebarToggleMenu from "@/renderer/components/sidebar/SidebarToggleMenu.vue";

const isCollapsed = defineModel();
</script>

<template>
  <aside
    :class="[
      'h-full bg-neutral-900 rounded-r-2xl shadow-lg flex flex-col justify-between overflow-hidden',
      'transition-[width] duration-300 ease-in-out',
      isCollapsed ? 'w-16' : 'w-56',
    ]"
  >
    <div class="flex-1">
      <SidebarToggleMenu v-model="isCollapsed" />
      <SidebarHeader :collapsed="isCollapsed" />
      <SidebarNav :collapsed="isCollapsed" />
    </div>

    <SidebarToggleChevron v-model="isCollapsed" />
  </aside>
</template>
