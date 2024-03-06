<!--
 - MineAdmin is committed to providing solutions for quickly building web applications
 - Please view the LICENSE file that was distributed with this source code,
 - For the full copyright and license information.
 - Thank you very much for using MineAdmin.
 -
 - @Author xing.gu<xing.gu@louku.com>
 - @Link   https://gitee.com/xmo/mineadmin-vue
-->
<template>
  <div class="_crud-content">
    <div class="operation-tools lg:flex justify-between mb-3" ref="crudOperationRef">
      <a-space class="lg:flex block lg:inline-block">
        <slot name="tableBeforeButtons"></slot>
        <slot name="tableButtons"> 此处为按钮区 </slot>
        <slot name="tableAfterButtons"></slot>
      </a-space>
      <a-space class="lg:mt-0 mt-2" v-if="options.showTools">
        <slot name="tools"></slot>
        <a-tooltip
          :content="isRecovery ? '显示正常数据' : '显示回收站数据'"
          v-if="options.recycleApi && isFunction(options.recycleApi)"
        >
          <a-button shape="circle" @click="switchDataType"><icon-swap /></a-button>
        </a-tooltip>
        <a-tooltip content="刷新表格"
          ><a-button shape="circle" @click="refresh"><icon-refresh /></a-button
        ></a-tooltip>
        <a-tooltip content="显隐搜索"
          ><a-button shape="circle" @click="toggleSearch"><icon-search /></a-button
        ></a-tooltip>
        <a-tooltip content="打印表格"
          ><a-button shape="circle" @click="printTable"><icon-printer /></a-button
        ></a-tooltip>
        <a-tooltip content="设置"
          ><a-button shape="circle" @click="tableSetting"><icon-settings /></a-button
        ></a-tooltip>
      </a-space>
    </div>
    <div ref="crudContentRef">
      <slot name="content" v-bind="tableData">
        <a-table
          v-if="!options.expandAllRows || tableData.length > 0"
          v-bind="$attrs"
          ref="tableRef"
          :key="options.pk"
          :data="tableData"
          :loading="loading"
          :sticky-header="options.stickyHeader"
          :pagination="options.tablePagination"
          :stripe="options.stripe"
          :bordered="options.bordered"
          :rowSelection="options.rowSelection ?? undefined"
          :row-key="options?.rowSelection?.key ?? options.pk"
          :scroll="options.scroll"
          :column-resizable="options.resizable"
          :size="options.size"
          :row-class="options.rowClass"
          :hide-expand-button-on-empty="options.hideExpandButtonOnEmpty"
          :default-expand-all-rows="options.expandAllRows"
          :summary="(options.customerSummary || options.showSummary) && __summary"
          @selection-change="setSelecteds"
          @sorter-change="handlerSort"
        >
          <template #tr="{ record, rowIndex }">
            <tr
              class="ma-crud-table-tr"
              :class="
                isFunction(options.rowCustomClass)
                  ? options.rowCustomClass(record, rowIndex) ?? []
                  : options.rowCustomClass
              "
              @contextmenu.prevent="openContextMenu($event, record)"
              @dblclick="dbClickOpenEdit(record)"
            />
          </template>

          <template #expand-row="record" v-if="options.showExpandRow">
            <slot name="expand-row" v-bind="record"></slot>
          </template>
          <template #columns>
            <!-- {{ columns }} -->
            <ma-column
              ref="crudColumnRef"
              v-if="reloadColumn"
              :pk="options.pk"
              :page="page"
              :columns="columns"
              :isRecovery="isRecovery"
              :crudFormRef="crudFormRef"
              @operation="operation"
              @refresh="() => refresh()"
              @showImage="showImage"
            >
              <template #operationBeforeExtend="{ record, column, rowIndex }">
                <slot name="operationBeforeExtend" v-bind="{ record, column, rowIndex }"></slot>
              </template>

              <template #operationCell="{ record, column, rowIndex }">
                <slot name="operationCell" v-bind="{ record, column, rowIndex }"></slot>
              </template>

              <template #operationAfterExtend="{ record, column, rowIndex }">
                <slot name="operationAfterExtend" v-bind="{ record, column, rowIndex }"></slot>
              </template>
              <!-- 列单元格式插槽 -->
              <template
                v-for="(slot, slotIndex) in getSlot(columns)"
                :key="slotIndex"
                #[slot]="{ record, column, rowIndex }"
              >
                <slot :name="`${slot}`" v-bind="{ record, column, rowIndex }" />
              </template>
              <!-- 标题插件 -->
              <template
                v-for="(slot, slotIndex) in getSlot(columns)"
                :key="slotIndex"
                #[`tableTitle-${slot}`]="{ record, column, rowIndex }"
              >
                <slot :name="`tableTitle-${slot}`" v-bind="{ record, column, rowIndex }" />
              </template>
            </ma-column>
          </template>
          <template #summary-cell="{ column, record, rowIndex }" v-if="options.customerSummary || options.showSummary">
            <slot name="summaryCell" v-bind="{ record, column, rowIndex }">{{ record[column.dataIndex] }}</slot>
          </template>
        </a-table>
      </slot>
    </div>
  </div>
  <!-- 导出组件 -->
  <ma-import ref="crudImportRef" />

  <!-- 表格列管理工具 -->
  <ma-setting ref="crudSettingRef" />

  <!-- 右键菜单 -->
  <ma-context-menu ref="crudContextMenuRef" @execCommand="execContextMenuCommand" />
</template>
<script setup lang="ts">
// 响应返回数据解析
import config from '@/config/crud';
import { ref, watch, provide, nextTick, inject, onMounted, onUnmounted } from 'vue';
import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';
import { request } from '@/utils/request';
import defaultOptions from './config/options-default';
import tool from '@/utils/tool';
import { Message } from '@arco-design/web-vue';
import checkAuth from '@/directives/auth/auth';
import { loadDict } from '@cps/ma-form/js/networkRequest.js';
import Print from '@/utils/print';

// 注册列组件
import MaColumn from './components/column.vue';
import MaImport from './components/import.vue';
import MaSetting from './components/setting.vue';
import MaContextMenu from './components/contextMenu.vue';

import { MaTOptions, MaTSearch, MaTProps } from './types';

const props = withDefaults(defineProps<MaTProps>(), {
  // search: (): MaTSearch => ({
  //   id: 'abc',
  // }),
  options: (): MaTOptions => ({
    pk: 'id',
    ps: 1,
    pi: 10,
  }),
  // columns: () => [{ title: 'name' }],
  // tableData: undefined,
});

// 数据加载状态
const loading = ref(true);
// 表格数据
const tableData = ref([]);
// 选中的数据
const selecteds = ref([]);
// 表格列配置
// @todo 定义接口
const columns: any = ref(props.columns);
// @todo 请求参数，此处应该是传入进来的, 注意定义接口
const requestParams: any = ref({});
const page: any = ref(requestParams[config.request.page]); // 第几页
const reloadColumn = ref(true);
const isRecovery = ref(false);
const openPagination = ref(false);
const currentApi = ref();
const total = ref(0);
const imgVisible = ref(false);
const imgUrl = ref(import.meta.env.VITE_APP_BASE + 'not-image.png');
const cascaders = ref([]);
const dicts = ref({});
const expandState = ref(false);

const crudFormRef = ref();
// 右键菜单引用
const crudContextMenuRef = ref();
const tableRef = ref();

// 表格设置
// @todo 改名
const crudSettingRef = ref();

// 表格导出工具
// @todo 改名
const crudImportRef = ref();

const options = ref(Object.assign(JSON.parse(JSON.stringify(defaultOptions)), props.options));

console.log(options);
// 把options设置为子组件可用
provide('options', options);

// 各种数据监听
watch(
  () => openPagination.value,
  () => options.value.pageLayout === 'fixed' && settingFixedPage(),
);

// 初始化
const init = async () => {
  // 设置 组件id
  if (isUndefined(options.value.id)) {
    options.value.id = 'MaCrud_' + Math.floor(Math.random() * 100000 + Math.random() * 20000 + Math.random() * 5000);
  }

  // 收集数据（统计联运表单）
  // @todo any
  columns.value.map((item: any) => {
    if (item.cascaderItem && item.cascaderItem.length > 0) {
      (cascaders.value as any[]).push(...item.cascaderItem);
    }
  });

  // @todo any
  await columns.value.map(async (item: any) => {
    // 字典
    if (!(cascaders.value as any[]).includes(item.dataIndex) && item.dict) {
      await loadDict(dicts.value, item);
    }
  });
};

const isBatch = (obj) => (isUndefined(obj) ? true : obj?.batch ?? true);

onMounted(async () => {
  if (typeof options.value.autoRequest == 'undefined' || options.value.autoRequest) {
    await requestData();
  }
});

onUnmounted(() => {});

const tableSetting = () => {
  crudSettingRef.value.open();
};

// 处理总结行
const __summary = ({ data }) => {
  if (options.value.showSummary && isArray(options.value.summary)) {
    const summary = options.value.summary;
    let summaryData = {};
    let summaryPrefixText = {};
    let summarySuffixText = {};
    let length = data.length || 0;
    summary.map((item) => {
      if (item.action && item.action === 'text') {
        summaryData[item.dataIndex] = item.content;
      } else {
        summaryData[item.dataIndex] = 0;
        summaryPrefixText[item.dataIndex] = item?.prefixText ?? '';
        summarySuffixText[item.dataIndex] = item?.suffixText ?? '';
        data.map((record) => {
          if (record[item.dataIndex]) {
            if (item.action && item.action === 'sum') {
              summaryData[item.dataIndex] += parseFloat(record[item.dataIndex]);
            }
            if (item.action && item.action === 'avg') {
              summaryData[item.dataIndex] += parseFloat(record[item.dataIndex]) / length;
            }
          }
        });
      }
    });

    for (let i in summaryData) {
      if (/^\d+(\.\d+)?$/.test(summaryData[i])) {
        summaryData[i] = summaryPrefixText[i] + tool.groupSeparator(summaryData[i].toFixed(2)) + summarySuffixText[i];
      }
    }

    return [summaryData];
  }
};

// @todo 未知功能
const setSelecteds = (key) => {
  selecteds.value = key;
};

// @todo 未知功能
const handlerSort = async (name, type) => {
  const col = columns.value.find((item) => name === item.dataIndex);
  if (col.sortable && col.sortable.sorter) {
    if (type) {
      requestParams.value.orderBy = name;
      requestParams.value.orderType = type === 'ascend' ? 'asc' : 'desc';
    } else {
      requestParams.value.orderBy = undefined;
      requestParams.value.orderType = undefined;
    }
    await refresh();
  }
};
const openContextMenu = (ev, record) => {
  options.value?.contextMenu?.enabled === true && crudContextMenuRef.value.openContextMenu(ev, record);
};

const addAction = () => {
  if (isFunction(options.value.beforeOpenAdd) && !options.value.beforeOpenAdd()) {
    return false;
  }
  if (options.value.add.action && isFunction(options.value.add.action)) {
    options.value.add.action();
  } else {
    crudFormRef.value.add();
  }
};

const editAction = (record) => {
  if (isFunction(options.value.beforeOpenEdit) && !options.value.beforeOpenEdit(record)) {
    return false;
  }
  if (options.value.edit.action && isFunction(options.value.edit.action)) {
    options.value.edit.action(record);
  } else {
    crudFormRef.value.edit(record);
  }
};
const dbClickOpenEdit = (record) => {
  if (options.value.isDbClickEdit) {
    if (isRecovery.value) {
      Message.error('回收站数据不可编辑');
      return;
    }

    if (isArray(options.value.edit.auth)) {
      for (let index in options.value.edit.auth) {
        if (!checkAuth(options.value.edit.auth[index])) {
          Message.error('没有编辑数据的权限');
          return;
        }
      }

      if (options.value.edit.api && options.value.edit.show && isFunction(options.value.edit.api)) {
        editAction(record);
      }
    }
  }
};
const importAction = () => crudImportRef.value.open();

const exportAction = () => {
  Message.info('请求服务器下载文件中...');
  const data = options.value.requestParamsLabel
    ? requestParams.value[options.value.requestParamsLabel]
    : requestParams.value;
  const download = (url) =>
    request({
      url,
      data,
      method: 'post',
      timeout: 60 * 1000,
      responseType: 'blob',
    });

  download(options.value.export.url)
    .then((res) => {
      tool.download(res);
      Message.success('请求成功，文件开始下载');
    })
    .catch(() => {
      Message.error('请求服务器错误，下载失败');
    });
};

const deletesMultipleAction = async () => {
  if (selecteds.value && selecteds.value.length > 0) {
    const api = isRecovery.value ? options.value.delete.realApi : options.value.delete.api;
    let data = {};
    if (isFunction(options.value.beforeDelete) && !(data = options.value.beforeDelete(selecteds.value))) {
      return false;
    }
    const response = await api(Object.assign({ ids: selecteds.value }, data));
    if (options.value.afterDelete && isFunction(options.value.afterDelete)) {
      options.value.afterDelete(response);
    }
    response.success && Message.success(response.message || `删除成功！`);
    await refresh();
  } else {
    Message.error('至少选择一条数据');
  }
};

const recoverysMultipleAction = async () => {
  if (selecteds.value && selecteds.value.length > 0) {
    const response = await options.value.recovery.api({
      ids: selecteds.value,
    });
    response.success && Message.success(response.message || `恢复成功！`);
    await refresh();
  } else {
    Message.error('至少选择一条数据');
  }
};

const switchDataType = async () => {
  isRecovery.value = !isRecovery.value;
  currentApi.value =
    isRecovery.value && options.value.recycleApi && isFunction(options.value.recycleApi)
      ? options.value.recycleApi
      : options.value.api;
  await requestData();
};

const handlerExpand = () => {
  expandState.value = !expandState.value;
  expandState.value ? tableRef.value.expandAll(true) : tableRef.value.expandAll(false);
};

const settingFixedPage = () => {
  // @todo 修正工作区高度。回头看是不是应该在crud组件中操作。
  // const workAreaHeight = document.querySelector('.work-area').offsetHeight
  // const tableHeight = workAreaHeight - headerHeight.value - (openPagination.value ? 152 : 108)
  // crudContentRef.value.style.height = tableHeight + 'px'
};

const requestHandle = async () => {
  loading.value = true;
  isFunction(options.value.beforeRequest) && options.value.beforeRequest(requestParams.value);
  if (isFunction(currentApi.value)) {
    const response = config.parseResponseData(await currentApi.value(requestParams.value));
    if (response.rows) {
      tableData.value = response.rows;
      if (response.pageInfo) {
        total.value = response.pageInfo.total;
        openPagination.value = true;
      } else {
        openPagination.value = false;
      }
    } else {
      tableData.value = response as any; // @todo 此处直接扔了个any，应该确认返回格式
    }
  } else {
    console.error(`ma-crud error：crud.api not is Function.`);
  }
  isFunction(options.value.afterRequest) && (tableData.value = options.value.afterRequest(tableData.value));
  loading.value = false;
};

const refresh = async () => {
  if (props.data) {
    loading.value = true;
    // @todo 接口类型处理
    // 以下这句有问题，暂停
    // const data: any = isArray(props.data) ? props.data : config.parseResponseData(await props.data(requestParams.value));
    const data: any = null;
    if (data.rows) {
      tableData.value = data.rows;
      openPagination.value = true;
    } else {
      tableData.value = data;
    }
    tableData.value = data;
    // 以上暂停使用
    loading.value = false;
  } else {
    currentApi.value =
      isRecovery.value && options.value.recycleApi && isFunction(options.value.recycleApi)
        ? options.value.recycleApi
        : options.value.api;
    await requestHandle();
  }
};
const showImage = (url) => {
  imgUrl.value = url;
  imgVisible.value = true;
};
// 这个方法有个问题，就是子字段不能与现有的字段同名，不知道对不对。需要考虑一下逻辑
const getSlot = (cls = []): string[] => {
  let sls: string[] = [];
  cls.map((item: any) => {
    // @todo any
    if (item.children && item.children.length > 0) {
      let tmp = getSlot(item.children);
      sls.push(...tmp);
    } else if (item.dataIndex) {
      sls.push(item.dataIndex as string);
    }
  });
  return sls;
};
provide('getSlot', getSlot);

// 运行右键菜单

// 请求数据
const requestData = async () => {
  await init();
  // 初始化请求参数
  initRequestParams();
  if (!options.value.tabs?.dataIndex && !options.value.tabs.data) {
    await refresh();
  } else {
    options.value.tabs.defaultKey = options.value.tabs?.defaultKey ?? options.value.tabs.data[0].value;
  }
};

const initRequestParams = () => {
  requestParams.value[config.request.page] = 1;
  requestParams.value[config.request.pageSize] = options.value.pageSize ?? 10;
  if (options.value.requestParamsLabel) {
    requestParams.value[options.value.requestParamsLabel] = options.value.requestParams;
  } else {
    requestParams.value = Object.assign(requestParams.value, options.value.requestParams);
  }
};

/**
 * 以下为已确认内容
 */

/**
 * 运行右键菜单
 * @todo 事件应该是传入的。
 * 事实上，点击后，应该可以执行默认操作，或者把对应的事件返回
 */
const execContextMenuCommand = async (args) => {
  const item = args.contextItem;
  const record = args.record;
  switch (item.operation) {
    case 'print':
      await printTable();
      break;
    case 'refresh':
      await refresh();
      break;
    case 'add':
      addAction();
      break;
    case 'edit':
      editAction(record);
      break;
    case 'delete':
      // crudColumnRef.value.deleteAction(record);
      break;
    default:
      // await runEvent(item, 'onCommand', undefined, args);
      break;
  }
};

const toggleSearch = () => {
  console.log('切换是否显示搜索区');
};
const crudContentRef = ref();
const printTable = () => {
  new Print(crudContentRef.value);
};
// 操作市场
const operation = (action, record) => {
  if (typeof action === 'string') {
    switch (action) {
      // case 'seeAction':
      //   seeAction(record);
      //   break;
      // case 'deleteAction':
      //   deleteAction(record);
      //   break;
      // case 'recoveryAction':
      //   recoveryAction(record);
      //   break;
      // case 'printTable':
      //   printTable(record);
      //   break;
      default:
        console.error(`Method ${action} not found!`);
    }
  }
};
defineExpose({
  requestData,
});
</script>
