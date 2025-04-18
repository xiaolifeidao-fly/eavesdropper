<template>
  <div class="drawer-container">
    <div>
      <h3 class="drawer-title">页面样式设置</h3>

      <div class="drawer-item">
        <span>Open Tags-View</span>
        <el-switch v-model="tagsView" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>Fixed Header</span>
        <el-switch v-model="fixedHeader" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>Sidebar Logo</span>
        <el-switch v-model="sidebarLogo" class="drawer-switch" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/store/settings'

defineOptions({
  name: 'Settings'
})

const settingsStore = useSettingsStore()

const fixedHeader = computed({
  get: () => settingsStore.fixedHeader,
  set: (val) => {
    settingsStore.changeSetting({
      key: 'fixedHeader',
      value: val
    })
  }
})

const tagsView = computed({
  get: () => settingsStore.tagsView,
  set: (val) => {
    settingsStore.changeSetting({
      key: 'tagsView',
      value: val
    })
  }
})

const sidebarLogo = computed({
  get: () => settingsStore.sidebarLogo,
  set: (val) => {
    settingsStore.changeSetting({
      key: 'sidebarLogo',
      value: val
    })
  }
})
</script>

<style lang="scss" scoped>
.drawer-container {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;

  .drawer-title {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, .85);
    font-size: 14px;
    line-height: 22px;
  }

  .drawer-item {
    color: rgba(0, 0, 0, .65);
    font-size: 14px;
    padding: 12px 0;
  }

  .drawer-switch {
    float: right
  }
}
</style>
