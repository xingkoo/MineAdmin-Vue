<template>
  <a-scrollbar type="track" style="overflow: auto">
    <a-space size="mini">
      <slot name="operationBeforeExtend" v-bind="{ record, column, rowIndex }"></slot>
      <slot name="operationCell" v-bind="{ record, column, rowIndex }">
        <a-link
          v-if="
            (isFunction(options.see.show)
              ? options.see.show(record)
              : options.see.show) && !props.isRecovery
          "
          v-auth="options.see.auth || []"
          v-role="options.see.role || []"
          type="primary"
          :disabled="
            isFunction(options.see.disabled)
              ? options.see.disabled(record)
              : options.see.disabled
          "
          @click="clickAction('seeAction', record)"
          ><icon-eye /> {{ options.see.text || '查看' }}</a-link
        >
        <a-link
          v-if="
            (isFunction(options.edit.show)
              ? options.edit.show(record)
              : options.edit.show) && !props.isRecovery
          "
          v-auth="options.edit.auth || []"
          v-role="options.edit.role || []"
          type="primary"
          :disabled="
            isFunction(options.edit.disabled)
              ? options.edit.disabled(record)
              : options.edit.disabled
          "
          @click="editAction(record)"
        >
          <icon-edit /> {{ options.edit.text || '编辑' }}
        </a-link>

        <a-popconfirm
          content="确定要恢复该数据吗?"
          position="bottom"
          @ok="recoveryAction(record)"
          v-if="
            (isFunction(options.recovery.show)
              ? options.recovery.show(record)
              : options.recovery.show) && props.isRecovery
          "
          v-auth="options.recovery.auth || []"
          v-role="options.recovery.role || []"
        >
          <a-link type="primary"><icon-undo /> {{ options.recovery.text || '恢复' }} </a-link>
        </a-popconfirm>

        <a-popconfirm
          content="确定要删除该数据吗?"
          position="bottom"
          @ok="deleteAction(record)"
          v-if="
            isFunction(options.delete.show)
              ? options.delete.show(record)
              : options.delete.show
          "
        >
          <a-link
            type="primary"
            v-auth="options.delete.auth || []"
            v-role="options.delete.role || []"
            :disabled="
              isFunction(options.delete.disabled)
                ? options.delete.disabled(record)
                : options.delete.disabled
            "
          >
            <icon-delete />
            {{ props.isRecovery ? options.delete.realText || '删除' : options.delete.text || '删除' }}
          </a-link>
        </a-popconfirm>
      </slot>
      <slot name="operationAfterExtend" v-bind="{ record, column, rowIndex }"></slot>
    </a-space>
  </a-scrollbar>
</template>

<script>
  import { defineProps, defineExpose } from 'vue';
  defineExpose({ name: 'cell-operation' });
</script>
