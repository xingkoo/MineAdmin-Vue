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
    <div class="ma-content-block lg:flex justify-between p-4">
        <ma-table :options="options" :columns="columns" :="data"></ma-table>
    </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import user from "@/api/system/user";
const data = ref([]);

const options = reactive({
    api: user.getPageList,
    recycleApi: user.getRecyclePageList,
    searchColNumber: 3,
    showIndex: false,
    pageLayout: "fixed",
    rowSelection: { showCheckedAll: true },
    operationColumn: true,
    operationColumnWidth: 200,
    add: { show: true, api: user.save, auth: ["system:user:save"] },
    edit: { show: true, api: user.update, auth: ["system:user:update"] },
    delete: {
        show: true,
        api: user.deletes,
        auth: ["system:user:delete"],
        realApi: user.realDeletes,
        realAuth: ["system:user:realDeletes"],
    },
    recovery: {
        show: true,
        api: user.recoverys,
        auth: ["system:user:recovery"],
    },
    import: {
        show: true,
        url: "system/user/import",
        templateUrl: "system/user/downloadTemplate",
        auth: ["system:user:import"],
    },
    export: {
        show: true,
        url: "system/user/export",
        auth: ["system:user:export"],
    },
    formOption: {
        width: 800,
        layout: [
            {
                formType: "grid",
                cols: [{ span: 24, formList: [{ dataIndex: "avatar" }] }],
            },
            {
                formType: "grid",
                cols: [
                    { span: 12, formList: [{ dataIndex: "username" }] },
                    { span: 12, formList: [{ dataIndex: "dept_ids" }] },
                ],
            },
            {
                formType: "grid",
                cols: [
                    { span: 12, formList: [{ dataIndex: "password" }] },
                    { span: 12, formList: [{ dataIndex: "nickname" }] },
                ],
            },
            {
                formType: "grid",
                cols: [
                    { span: 12, formList: [{ dataIndex: "role_ids" }] },
                    { span: 12, formList: [{ dataIndex: "phone" }] },
                ],
            },
            {
                formType: "grid",
                cols: [
                    { span: 12, formList: [{ dataIndex: "post_ids" }] },
                    { span: 12, formList: [{ dataIndex: "email" }] },
                ],
            },
            {
                formType: "grid",
                cols: [{ span: 24, formList: [{ dataIndex: "status" }] }],
            },
            {
                formType: "grid",
                cols: [{ span: 24, formList: [{ dataIndex: "remark" }] }],
            },
        ],
    },
    isDbClickEdit: false,
    beforeOpenEdit: (record) => {
        if (record.id === 1) {
            Message.error("创始人不可编辑");
            return false;
        }
        return true;
    },
    beforeDelete: (ids) => {
        if (ids.includes(1)) {
            Message.error("创始人不可删除");
            return false;
        }
        return true;
    },
});
const columns = reactive([
    {
        title: "ID",
        dataIndex: "id",
        addDisplay: false,
        editDisplay: false,
        width: 50,
        hide: true,
    },
    {
        title: "头像",
        dataIndex: "avatar",
        width: 75,
        formType: "upload",
        returnType: "hash",
        type: "image",
        rounded: true,
        labelWidth: "86px",
    },
    {
        title: "账户",
        dataIndex: "username",
        width: 130,
        search: true,
        addDisabled: false,
        editDisabled: true,
        commonRules: [{ required: true, message: "账户必填" }],
    },
    {
        title: "所属部门",
        dataIndex: "dept_ids",
        hide: true,
        formType: "tree-select",
        multiple: true,
        treeCheckable: true,
        treeCheckStrictly: true,
        dict: { url: "system/dept/tree" },
        commonRules: [{ required: true, message: "所属部门必选" }],
        editDefaultValue: async (record) => {
            const response = await user.read(record.id);
            return response.data.deptList.map((item) => item.id);
        },
    },
    {
        title: "密码",
        dataIndex: "password",
        hide: true,
        autocomplete: "off",
        addDefaultValue: "123456",
        editDefaultValue: "",
        addDisabled: false,
        editDisabled: true,
        type: "password",
        addRules: [{ required: true, message: "密码必填" }],
    },
    { title: "昵称", dataIndex: "nickname", width: 120 },
    {
        title: "角色",
        dataIndex: "role_ids",
        width: 120,
        formType: "select",
        multiple: true,
        dict: {
            url: "system/role/list",
            props: { label: "name", value: "id" },
        },
        hide: true,
        commonRules: [{ required: true, message: "角色必选" }],
        editDefaultValue: async (record) => {
            const response = await user.read(record.id);
            return response.data.roleList.map((item) => item.id);
        },
    },
    {
        title: "手机",
        dataIndex: "phone",
        width: 150,
        search: true,
        commonRules: [
            {
                match: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
                message: "请输入正确的手机号码",
            },
        ],
    },
    {
        title: "岗位",
        dataIndex: "post_ids",
        width: 120,
        formType: "select",
        multiple: true,
        dict: {
            url: "system/post/list",
            props: { label: "name", value: "id" },
        },
        hide: true,
        editDefaultValue: async (record) => {
            const response = await user.read(record.id);
            const ids = response.data.postList.map((item) => item.id);
            return ids;
        },
    },
    {
        title: "邮箱",
        dataIndex: "email",
        width: 200,
        search: true,
        commonRules: [{ type: "email", message: "请输入正确的邮箱" }],
    },
    {
        title: "状态",
        dataIndex: "status",
        width: 100,
        search: true,
        formType: "radio",
        dict: { name: "data_status", props: { label: "title", value: "key" } },
        addDefaultValue: "1",
        labelWidth: "86px",
    },
    {
        title: "备注",
        dataIndex: "remark",
        width: 180,
        hide: true,
        formType: "textarea",
        labelWidth: "86px",
    },
    {
        title: "注册时间",
        dataIndex: "created_at",
        width: 180,
        addDisplay: false,
        editDisplay: false,
        search: true,
        formType: "range",
    },
]);
</script>

<script>
export default { name: "demo:table" };
</script>

<style scoped></style>
