// Demo 模块路由配置，如需删除Demo模块，请移除此项
const demoPageRoutes = [
    {
        path: "/demo",
        redirect: "/demo/crud",
        component: () => import("@/views/demo/index.vue"),
        meta: {
            title: "Demo 演示",
            icon: "icon-eye",
            hidden: false,
            type: "M",
            breadcrumb: [{ name: "demo" }], // 面包屑可以修复跨层次不自动展开菜单的问题。
        },
        children: [
            // 所有子菜单均在此部分设置
            {
                name: "demo:crud",
                path: "/demo/crud",
                code: "demo:crud",
                meta: {
                    title: "MaCrud组件 演示",
                    type: "M",
                },
                component: () => import("@/views/demo/crud/index.vue"),
            },
            {
                name: "demo:table",
                path: "/demo/table",
                code: "demo:table",
                meta: {
                    title: "MaTable组件 演示",
                    type: "M",
                },
                component: () => import("@/views/demo/table/index.vue"),
            },
            {
                name: "demo:form",
                path: "/demo/form",
                code: "demo:form",
                meta: {
                    title: "MaForm组件 演示",
                    type: "M",
                },
                component: () => import("@/views/demo/form/index.vue"),
            },
        ],
    },
];

export const demoPage = {
    name: "demo",
    path: "/demo",
    meta: {
        title: "Demo",
        icon: "icon-eye",
        hidden: false,
        type: "M",
        breadcrumb: [{ name: "demo" }],
    },
};

export default demoPageRoutes;
