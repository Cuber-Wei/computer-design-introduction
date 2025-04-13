<template>
  <a-layout class="app-container">
    <a-layout-header class="a-header">
      <a-menu v-model:selectedKeys="state.selectedKeys" mode="horizontal" :items="items" theme="light"
        style="line-height: 60px; border-bottom: none">
        <template #item="{ icon, label }">
          <span style="display: inline-flex; align-items: center">
            <component :is="icon" style="margin-right: 8px" />
            {{ label }}
          </span>
        </template>
      </a-menu>
    </a-layout-header>
    <a-layout>
      <a-layout-content class="a-content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="a-footer">面向子图匹配的并行聚合计算框架设计与实现</a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.a-content {
  flex: 1;
  overflow: auto;
}

.a-header {
  height: 60px;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 2px 8px #f0f1f2;
  z-index: 1;
}

.a-sider {
  display: none;
}
</style>
<script setup lang="ts">
import { h, reactive, watch } from 'vue';
import { DesktopOutlined, PieChartOutlined } from '@ant-design/icons-vue';
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const state = reactive({
  collapsed: false,
  selectedKeys: [route.path],
  openKeys: ['sub1'],
  preOpenKeys: ['sub1'],
});
const items = reactive([
  {
    key: '/',
    icon: () => h(PieChartOutlined),
    label: '项目成果',
    title: '项目成果',
  },
  {
    key: '/datasets',
    icon: () => h(DesktopOutlined),
    label: '数据集展示',
    title: '数据集展示',
  },
]);
watch(
  () => state.openKeys,
  (_val, oldVal) => {
    state.preOpenKeys = oldVal;
  },
);
// 路由变化时更新选中状态
watch(() => route.path, (newPath) => {
  state.selectedKeys = [newPath];
});

// 菜单选择时跳转路由
watch(
  () => state.selectedKeys,
  (newVal) => {
    if (newVal[0] !== route.path) {
      router.push(newVal[0]);
    }
  }
)

</script>
<style scoped>
.a-header {
  text-align: center;
  color: #000;
  height: 64px;
  padding-inline: 50px;
  line-height: 64px;
  background-color: #fff;
  border: 1px solid #000000;
}

.a-content {
  text-align: center;
  color: #000;
  min-height: 120px;
  border: 1px solid #000000;
  padding: 1rem;
}

.a-sider {
  height: 100vh;
  width: 200px;
}

.a-footer {
  text-align: center;
  color: #000;
  height: 64px;
  border: 1px solid #000000;
}
</style>