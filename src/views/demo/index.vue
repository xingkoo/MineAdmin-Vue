<!--
 - MineAdmin is committed to providing solutions for quickly building web applications
 - Please view the LICENSE file that was distributed with this source code,
 - For the full copyright and license information.
 - Thank you very much for using MineAdmin.
 -
 - @Author X.Mo<root@imoi.cn>
 - @Link   https://gitee.com/xmo/mineadmin-vue
-->
<template>
  <a-layout-content class="flex flex-col">
    <a-alert type="warning" class="mb-4">
      当前页面仅在开发模式下可见，无需特意删除。如需删除，移除`@views/demo`目录、`src/router/demoPageRoutes.js`文件，移除`src/router/webRouter.js`、`src/store/modules/user.js`两个文件中关于demo部分，详见注释。
    </a-alert>
    <router-view></router-view>
  </a-layout-content>
</template>

<script setup></script>
<script>
export default { name: 'demo' };
</script>
