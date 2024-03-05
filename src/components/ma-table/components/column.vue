<template>
  <template v-for="column in props.columns" :key="column[props.pk]">
    <template v-if="isFunction(column.hide) ? columnhide() : !column.hide">
      <!-- 处理含有子列的列 -->
      <a-table-column
        :title="column.title"
        :width="column.width"
        :ellipsis="column.ellipsis ?? true"
        :filterable="column.filterable"
        :cell-class="column.cellClass"
        :header-cell-class="column.headerCellClass"
        :body-cell-class="column.bodyCellClass"
        :summary-cell-class="column.summaryCellClass"
        :cell-style="column.cellStyle"
        :header-cell-style="column.headerCellStyle"
        :body-cell-style="column.bodyCellStyle"
        :summary-cell-style="column.summaryCellStyle"
        :tooltip="column.tooltip ?? true"
        :align="column.align || 'left'"
        :fixed="column.fixed"
        v-if="column.children && column.children.length > 0"
      >
        <column
          @refresh="() => refresh()"
          :isRecovery="props.isRecovery"
          :crudFormRef="props.crudFormRef"
          :columns="column.children"
        >
          <template
            v-for="(childRow, childIndex) in column.children"
            :key="childIndex"
            #[childRow.dataIndex]="{ record, column, rowIndex }"
          >
            <slot :name="`${childRow.dataIndex}`" v-bind="{ record, column, rowIndex }" />
          </template>
        </column>
      </a-table-column>
      <!-- 处理无子列的列 -->
      <a-table-column
        :title="column.title"
        :data-index="column.dataIndex"
        :width="column.width"
        :ellipsis="column.ellipsis ?? true"
        :filterable="column.filterable"
        :cell-class="column.cellClass"
        :header-cell-class="column.headerCellClass"
        :body-cell-class="column.bodyCellClass"
        :summary-cell-class="column.summaryCellClass"
        :cell-style="column.cellStyle"
        :header-cell-style="column.headerCellStyle"
        :body-cell-style="column.bodyCellStyle"
        :summary-cell-style="column.summaryCellStyle"
        :tooltip="column.dataIndex === '__operation' ? false : column.tooltip ?? true"
        :align="column.align || 'left'"
        :fixed="column.fixed"
        :sortable="column.sortable"
        v-else
      >
        <template #title>
          <slot :name="`tableTitle-${column.dataIndex}`" v-bind="{ column: row }">{{ column.title }}</slot>
        </template>
        <!-- 自定义各列的单元格 -->
        <!-- 根据列类型，按染操插槽、自定义插槽、通用渲染方式的顺序来处理各列 -->
        <template #cell="{ record, column, rowIndex }">
          <!-- 操作栏 -->
          <template v-if="column.widgit === 'index'">
            {{ rowIndex }}
          </template>
          <template v-if="column.widgit === 'operation'"> 操作 </template>
          <template v-else> 默认 </template>
        </template>
      </a-table-column>
    </template>
  </template>
</template>

<script setup>
import CellIndex from './cell/cell-index.vue';
import { inject, provide } from 'vue';
import config from '@/config/crud';
import uploadConfig from '@/config/upload';
import { Message } from '@arco-design/web-vue';
import { isFunction, get, isArray, isObject } from 'lodash';
import CustomRender from '../config/custom-render';
import tool from '@/utils/tool';
import commonApi from '@/api/common';

const emit = defineEmits(['refresh', 'showImage']);
const props = defineProps({
  pk: String,
  columns: Array,
  isRecovery: Boolean,
  crudFormRef: Object,
});

const options = inject('options');
const requestParams = inject('requestParams');
const getSlot = inject('getSlot');

provide('options', options);
provide('requestParams', requestParams);

// 由crud组件中移入
const dictTrans = (dataIndex, value) => {
  if (dicts.value[dataIndex] && dicts.value[dataIndex].tran) {
    return dicts.value[dataIndex].tran[value];
  } else {
    return value;
  }
};

// 由crud组件中移入
const dictColors = (dataIndex, value) => {
  if (dicts.value[dataIndex] && dicts.value[dataIndex].colors) {
    return dicts.value[dataIndex].colors[value];
  } else {
    return undefined;
  }
};
const imageSee = async (row, record, dataIndex) => {
  if (row.returnType) {
    if (row.returnType === 'url') {
      emit('showImage', record[dataIndex]);
      return;
    }

    if (row.returnType === 'hash') {
      emit('showImage', tool.showFile(record[dataIndex]));
      return;
    }

    if (row.returnType === 'id') {
      Message.info('该图片无法查看');
      return;
    }
  } else {
    if (!record[row.dataIndex]) {
      Message.info('无图片');
      return;
    }
    emit('showImage', record[row.dataIndex] ?? 'not-image.png');
  }
};

const getTagColor = (row, record) => {
  return dictColors(
    row.dataIndex,
    row.dataIndex.indexOf('.') > -1 ? get(record, row.dataIndex) : record[row.dataIndex],
  );
};

const getDataIndex = (row, record) => {
  if (isObject(record)) {
    return dictTrans(
      row.dataIndex,
      row.dataIndex.indexOf('.') > -1 ? get(record, row.dataIndex) : record[row.dataIndex],
    );
  } else {
    return dictTrans(row.dataIndex, record);
  }
};

// 计算序列
const getIndex = (rowIndex) => {
  const index = rowIndex + 1;
  if (requestParams[config.request.page] === 1) {
    return index;
  } else {
    return (requestParams[config.request.page] - 1) * requestParams[config.request.pageSize] + index;
  }
};

const seeAction = (record) => {
  if (isFunction(options.beforeOpenSee) && !options.beforeOpenSee(record)) {
    return false;
  }
  if (options.see.action && isFunction(options.see.action)) {
    options.see.action(record);
  } else {
    props.crudFormRef.see(record);
  }
};

const editAction = (record) => {
  if (isFunction(options.beforeOpenEdit) && !options.beforeOpenEdit(record)) {
    return false;
  }
  if (options.edit.action && isFunction(options.edit.action)) {
    options.edit.action(record);
  } else {
    props.crudFormRef.edit(record);
  }
};

const recoveryAction = async (record) => {
  const response = await options.recovery.api({ ids: [record[props.pk]] });
  response.success && Message.success(response.message || `恢复成功！`);
  emit('refresh');
};

const deleteAction = async (record) => {
  let data = {};
  if (isFunction(options.beforeDelete) && !(data = options.beforeDelete([record[props.pk]]))) {
    return false;
  }
  const api = props.isRecovery ? options.delete.realApi : options.delete.api;
  const response = await api(Object.assign({ ids: [record[props.pk]] }, data));
  if (options.afterDelete && isFunction(options.afterDelete)) {
    options.afterDelete(response, record);
  }
  response.success && Message.success(response.message || `删除成功！`);
  emit('refresh');
};

const refresh = () => {
  emit('refresh');
};

const clickAction = (type, record, column, rowIndex) => {
  emit('operation', type, record, column, rowIndex);
};

defineExpose({ deleteAction, recoveryAction });
</script>

<style scoped>
:deep(.arco-image-img) {
  object-fit: contain;
  background-color: var(--color-fill-4);
}
</style>
../../config/custom-render
