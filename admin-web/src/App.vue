<template>
  <div id="app">
    <h1>Vue 3 + Element Plus 管理系统</h1>
    <el-button type="primary">Element Plus 按钮</el-button>
    <p>
      <router-link to="/dashboard">首页</router-link> | 
      <router-link to="/user/userList">用户管理</router-link>
    </p>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
