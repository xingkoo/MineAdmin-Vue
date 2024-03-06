<template>
  <template v-for="row in props.columns" :key="row[options.pk]">
    <template v-if="isFunction(row.hide) ? row.hide() : !row.hide">
      <a-table-column
        :title="row.title"
        :width="row.width"
        :ellipsis="row.ellipsis ?? true"
        :filterable="row.filterable"
        :cell-class="row.cellClass"
        :header-cell-class="row.headerCellClass"
        :body-cell-class="row.bodyCellClass"
        :summary-cell-class="row.summaryCellClass"
        :cell-style="row.cellStyle"
        :header-cell-style="row.headerCellStyle"
        :body-cell-style="row.bodyCellStyle"
        :summary-cell-style="row.summaryCellStyle"
        :tooltip="row.tooltip ?? true"
        :align="row.align || 'left'"
        :fixed="row.fixed"
        v-if="row.children && row.children.length > 0"
      >
        <column @refresh="() => refresh()" :isRecovery="props.isRecovery" :columns="row.children">
          <template
            v-for="(childRow, childIndex) in row.children"
            :key="childIndex"
            #[childRow.dataIndex]="{ record, column, rowIndex }"
          >
            <slot :name="`${childRow.dataIndex}`" v-bind="{ record, column, rowIndex }" />
          </template>
        </column>
      </a-table-column>
      <a-table-column
        :title="row.title"
        :data-index="row.dataIndex"
        :width="row.width"
        :ellipsis="row.ellipsis ?? true"
        :filterable="row.filterable"
        :cell-class="row.cellClass"
        :header-cell-class="row.headerCellClass"
        :body-cell-class="row.bodyCellClass"
        :summary-cell-class="row.summaryCellClass"
        :cell-style="row.cellStyle"
        :header-cell-style="row.headerCellStyle"
        :body-cell-style="row.bodyCellStyle"
        :summary-cell-style="row.summaryCellStyle"
        :tooltip="row.dataIndex === '__operation' ? false : row.tooltip ?? true"
        :align="row.align || 'left'"
        :fixed="row.fixed"
        :sortable="row.sortable"
        v-else
      >
        <template #title>
          <slot :name="`tableTitle-${row.dataIndex}`" v-bind="{ column: row }">{{ row.title }}</slot>
        </template>
        <template #cell="{ record, column, rowIndex }">
          <index-column
            v-if="row.type === 'index'"
            :record="record"
            :column="column"
            :rowIndex="rowIndex"
          ></index-column>
          <template v-if="row.type === 'operation'">
            <!-- 操作栏 -->
            <a-scrollbar type="track" style="overflow: auto">
              <a-space size="mini">
                <slot name="operationBeforeExtend" v-bind="{ record, column, rowIndex }"></slot>
                <slot name="operationCell" v-bind="{ record, column, rowIndex }"> 123</slot>
                <slot name="operationAfterExtend" v-bind="{ record, column, rowIndex }"></slot>
              </a-space>
            </a-scrollbar>
          </template>
          <slot :name="row.dataIndex" v-bind="{ record, column, rowIndex }" v-else>
            <template>{{ record[row.dataIndex] }}1123</template>
          </slot>
        </template>
      </a-table-column>
    </template>
  </template>
</template>

<script setup>
import IndexColumn from './widgets/index-column.vue';
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
  columns: Array,
  isRecovery: Boolean,
});

const options = inject('options'); // 表格配置信息
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

const action = (type, record, column, rowIndex) => {
  emit('operation', type, record, column, rowIndex);
};

defineExpose({});
</script>

<style scoped>
:deep(.arco-image-img) {
  object-fit: contain;
  background-color: var(--color-fill-4);
}
</style>
