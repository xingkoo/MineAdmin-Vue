<template>
  {{ getIndex(page, pageSize, rowIndex) }}
</template>

<script setup>
import { defineProps, defineExpose } from 'vue';
import config from '@/config/crud';

defineProps({
  record: Object,
  columns: Array,
  rowIndex: Number,
  page: Number,
  pageSize: Number,
});

// 计算序列
const getIndex = (page, pageSize, rowIndex) => {
  console.log(config);
  const index = rowIndex + 1;
  if (page === 1) {
    return index;
  } else {
    return (page - 1) * pageSize + index;
  }
};

defineExpose({ name: 'cell-index' });
</script>
