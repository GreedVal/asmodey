<script setup>
import { computed } from "vue";
import * as LucideIcons from "lucide-vue-next";

const props = defineProps({
  label: { type: String, default: "" },
  type: { type: String, default: "button" },
  variant: { type: String, default: "default" },
  disabled: { type: Boolean, default: false },
  icon: { type: String, default: null },
  iconSize: { type: Number, default: 18 },
  tooltip: { type: String, default: "" },
});

const IconComponent = computed(() => {
  return props.icon && LucideIcons[props.icon] ? LucideIcons[props.icon] : null;
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :title="tooltip || label"
    class="inline-flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
    :class="{
      'bg-neutral-600 hover:bg-neutral-700 text-white focus:ring-neutral-500':
        variant === 'default' && !disabled,
      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500':
        variant === 'primary' && !disabled,
      'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400':
        variant === 'secondary' && !disabled,
      'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500':
        variant === 'danger' && !disabled,
      'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-300':
        variant === 'outline' && !disabled,
      'opacity-50 cursor-not-allowed': disabled,
    }"
  >
    <component v-if="IconComponent" :is="IconComponent" :size="iconSize" />
    <span v-if="label">{{ label }}</span>
  </button>
</template>
