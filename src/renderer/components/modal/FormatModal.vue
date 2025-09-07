<script setup>
import { ref, watch, computed } from "vue";
import { X, Plus } from "lucide-vue-next";
import { availableFilters } from "../../../shared/constants/filters";

const props = defineProps({
  visible: Boolean,
  max: Number,
});
const emit = defineEmits(["close", "confirm"]);

const columns = ref([]);

// Инициализация колонок при открытии модалки
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      columns.value = [
        {
          key: "field1",
          filters: [],
          columnIndex: 1,
        },
      ];
    }
  },
);

// Добавление новой колонки
function addColumn() {
  if (columns.value.length < props.max) {
    const usedIndices = columns.value.map((c) => c.columnIndex);
    let nextIndex = 1;
    while (usedIndices.includes(nextIndex)) nextIndex++;
    columns.value.push({
      key: `field${columns.value.length + 1}`,
      filters: [],
      columnIndex: nextIndex,
    });
  }
}

// Удаление колонки
function removeColumn(index) {
  columns.value.splice(index, 1);
  columns.value.forEach((col, i) => {
    if (col.key.startsWith("field")) col.key = `field${i + 1}`;
    if (!col.columnIndex) col.columnIndex = i + 1;
  });
}

// Добавление фильтра или действия
function addFilter(col, type, filterName) {
  if (
    filterName &&
    !col.filters.some((f) => f.name === filterName && f.type === type)
  ) {
    col.filters.push({ type, name: filterName });
  }
}

// Удаление фильтра
function removeFilter(col, filter) {
  col.filters = col.filters.filter(
    (f) => !(f.name === filter.name && f.type === filter.type),
  );
}

// Подтверждение выбора колонок
function confirm() {
  emit("confirm", {
    columnCount: columns.value.length,
    columns: columns.value.map(({ key, filters, columnIndex }) => ({
      key,
      filters,
      columnIndex,
    })),
  });
}

// Разделяем фильтры по типам
const validators = availableFilters.filter((f) => f.type === "validator");
const actions = availableFilters.filter((f) => f.type === "action");

// Функция для доступных индексов столбцов для конкретной колонки
function availableIndices(col) {
  // Получаем все columnIndex, кроме текущей колонки
  const used = columns.value.filter((c) => c !== col).map((c) => c.columnIndex);

  // Возвращаем массив доступных индексов
  return Array.from({ length: props.max }, (_, i) => i + 1).filter(
    (i) => !used.includes(i),
  );
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-neutral-900 text-white rounded-lg p-6 w-[800px] shadow-lg border border-neutral-700"
    >
      <h3 class="text-lg font-bold mb-4">Настройка ключей и фильтров</h3>

      <div class="mb-4 flex justify-between items-center">
        <span>Количество элементов: {{ columns.length }} / {{ max }}</span>
        <button
          class="bg-gray-700 hover:bg-gray-600 p-2 rounded disabled:opacity-50"
          @click="addColumn"
          :disabled="columns.length >= max"
        >
          <Plus size="18" />
        </button>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto"
      >
        <div
          v-for="(col, index) in columns"
          :key="index"
          class="bg-neutral-800 border border-neutral-700 p-3 rounded-lg shadow-sm"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium">Ключ {{ index + 1 }}</span>
            <button
              @click="removeColumn(index)"
              class="text-red-400 hover:text-red-200"
              title="Удалить колонку"
            >
              <X size="14" />
            </button>
          </div>

          <!-- Название ключа -->
          <input
            type="text"
            v-model="col.key"
            placeholder="Название ключа"
            class="bg-neutral-900 border border-neutral-600 text-sm p-2 rounded w-full mb-2"
          />

          <!-- Выбор уникального номера столбца -->
          <select
            v-model="col.columnIndex"
            class="bg-neutral-900 border border-neutral-600 text-sm p-2 rounded mb-2 w-full"
          >
            <option v-for="n in availableIndices(col)" :key="n" :value="n">
              Столбец {{ n }}
            </option>
          </select>

          <!-- Добавление фильтров и действий -->
          <div class="flex justify-between gap-2 mb-2">
            <select
              class="bg-neutral-900 border border-neutral-600 text-sm p-2 rounded"
              style="width: 48%"
              @change="
                addFilter(col, 'validator', $event.target.value);
                $event.target.value = '';
              "
            >
              <option value="">Добавить проверку...</option>
              <option
                v-for="filter in validators.filter(
                  (f) =>
                    !col.filters.some(
                      (c) => c.name === f.name && c.type === 'validator',
                    ),
                )"
                :key="filter.name"
                :value="filter.name"
              >
                {{ filter.label }}
              </option>
            </select>

            <select
              class="bg-neutral-900 border border-neutral-600 text-sm p-2 rounded"
              style="width: 48%"
              @change="
                addFilter(col, 'action', $event.target.value);
                $event.target.value = '';
              "
            >
              <option value="">Добавить действие...</option>
              <option
                v-for="filter in actions.filter(
                  (f) =>
                    !col.filters.some(
                      (c) => c.name === f.name && c.type === 'action',
                    ),
                )"
                :key="filter.name"
                :value="filter.name"
              >
                {{ filter.label }}
              </option>
            </select>
          </div>

          <!-- Отображение фильтров -->
          <div class="flex flex-wrap gap-1">
            <span
              v-for="filter in col.filters"
              :key="filter.name + filter.type"
              :class="[
                'px-2 py-0.5 rounded text-xs flex items-center gap-1',
                filter.type === 'validator' ? 'bg-blue-800' : 'bg-yellow-800',
              ]"
            >
              {{
                availableFilters.find((f) => f.name === filter.name)?.label ||
                filter.name
              }}
              <button
                @click="removeFilter(col, filter)"
                class="text-red-400 hover:text-red-200"
                type="button"
              >
                <X size="12" />
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="flex justify-end gap-2 mt-4">
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
          Применить
        </button>
      </div>
    </div>
  </div>
</template>
