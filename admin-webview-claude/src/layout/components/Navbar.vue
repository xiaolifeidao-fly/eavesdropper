<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <span class="right-menu-item">当前用户:{{ name }} 余额(元):{{ amount }}</span>
        <search v-if="false" id="header-search" class="right-menu-item" />

        <error-log class="errLog-container right-menu-item hover-effect" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="Global Size" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item divided @click="showModifyPass">
              <span style="display:block;">修改密码</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <span style="display:block;">退出</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-dialog title="修改密码" v-model="modifyPassDialogFormVisible">
      <el-form ref="modifyPassDataForm" :rules="rules" :model="userPass" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="原密码" prop="oldPass">
          <el-input v-model="userPass.oldPass" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPass">
          <el-input v-model="userPass.newPass" :autosize="{ minRows: 2, maxRows: 4}" type="text" placeholder="请输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="modifyPassDialogFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="submitModifyPass">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { modifyPass } from '@/api/user'
import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import ErrorLog from '@/components/ErrorLog/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import SizeSelect from '@/components/SizeSelect/index.vue'
import Search from '@/components/HeaderSearch/index.vue'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { ElNotification } from 'element-plus'

defineOptions({
  name: 'Navbar'
})

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const modifyPassDialogFormVisible = ref(false)
const modifyPassDataForm = ref(null)
const userPass = ref({
  oldPass: '',
  newPass: ''
})
const rules = ref({
  oldPass: [{ required: true, message: '原密码不能为空', trigger: 'change' }],
  newPass: [{ required: true, message: '新密码不能为空', trigger: 'change' }]
})

// 计算属性
const sidebar = computed(() => appStore.sidebar)
const avatar = computed(() => userStore.avatar)
const device = computed(() => appStore.device)
const name = computed(() => userStore.name)
const amount = computed(() => userStore.amount)

// 方法
const toggleSideBar = () => {
  appStore.toggleSideBar()
}

const logout = async () => {
  await userStore.logout()
  router.push(`/login?redirect=${route.fullPath}`)
}

const showModifyPass = () => {
  modifyPassDialogFormVisible.value = true
  nextTick(() => {
    modifyPassDataForm.value.clearValidate()
  })
}

const submitModifyPass = () => {
  modifyPassDataForm.value.validate((valid) => {
    if (valid) {
      modifyPassDialogFormVisible.value = false
      modifyPass(userPass.value).then(response => {
        ElNotification({
          title: '操作成功',
          message: '您的密码已修改成功',
          type: 'success',
          duration: 3000
        })
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #D6F7C6;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
