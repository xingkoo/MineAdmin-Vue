<template>{{ getIndex(rowIndex) }}</template>

<script setup>
import { defineProps, defineExpose } from 'vue';
import { inject } from 'vue';

const options = inject('options'); // 表格配置信息
console.log(options);

defineProps({
  record: Object,
  columns: Array,
  rowIndex: Number,
});

// 计算序列
const getIndex = (rowIndex) => {
  const index = rowIndex * 1 + 1;
  console.log(options.value);
  if (options.value.pi === 1) {
    console.log(123);
    return index;
  } else {
    console.log(456);
    return (options.value.pi - 1) * options.value.ps + index;
  }
};

defineExpose({ name: 'index-cell' });
</script>
