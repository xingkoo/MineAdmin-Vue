import { AxiosInstance } from 'axios';

// 表格组件需要传入的属性
export interface MaTProps {
  options: MaTOptions;
  columns: MaTColumn[];
  tableData?: MaTData;
}

// 表格组件的配置选项
export interface MaTOptions {
  pk: string;
}

// 表格组件的列配置
export interface MaTColumn {
  // 表单挂件 **（以后变更为 widget）**
  formType: string;
  // 列数据在数据项中对应的 key，支持 a.b.c 的嵌套写法 **（以后变更为 index）**
  dataIndex: string;
  // 字段业务标识名称,不填写则使用`index`的值
  title?: string;
  // 列宽（数字型表示 px 值，注意： 若固定列必须是数字），例如：100、10%、100px $可能需要增加字符串支持
  width?: string | number;
  // 是否显示省略号
  ellipsis?: string;
  // 设置表格列筛选功能，可参考 Arco 官方的 [排序和筛选示例](https://arco.design/vue/component/table#so
  filterable?: string;
  // 设置表格字段排序，可参考 Arco 官方的 [排序和筛选示例](https://arco.design/vue/component/table#sort
  sortable?: string;
  // 自定义单元格类名
  cellClass?: string;
  // 自定义表头单元格类名
  headerCellClass?: string;
  // 自定义内容单元格类名
  bodyCellClass?: string;
  // 自定义总结栏单元格类名
  summaryCellClass?: string;
  // 自定义单元格样式
  cellStyle?: string;
  // 自定义表头单元格样式
  headerCellStyle?: string;
  // 自定义内容单元格样式
  bodyCellStyle?: string;
  // 自定义总结栏单元格类名
  summaryCellStyle?: string;
  // 是否在显示省略号时显示文本提示
  tooltip?: string;
  // 表格列对齐方式：'center', 'left', 'right'
  align?: string;
  // 表格列固定方式：'left', 'right'
  fixed?: string;
  // 子列，适用于表头分组
  children?: string;
  // 自定义渲染方法
  // eslint-disable-next-line no-unused-vars
  customRender?: (record: any, column: any, rowIndex: number) => string;
  // 是否隐藏`@todo`
  hide?: boolean;
}
// 定义表格数据结构，如果是数组则直接使用，否则从远程获取数据（后续考虑字符串，当做接口地址）
export type MaTData = { [key: string]: any }[] | AxiosInstance;
