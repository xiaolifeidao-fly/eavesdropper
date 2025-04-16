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
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </div>
        <el-dropdown-menu #dropdown>
          <!-- <router-link to="/profile/index">
            <el-dropdown-item>Profile</el-dropdown-item>
          </router-link>
          <router-link to="/">
            <el-dropdown-item>Dashboard</el-dropdown-item>
          </router-link>
          <a target="_blank" href="https://github.com/PanJiaChen/vue-element-admin/">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>
          <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
            <el-dropdown-item>Docs</el-dropdown-item>
          </a> -->
          <el-dropdown-item divided @click="showModifyPass">
            <span style="display:block;">修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
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
          <el-button type="primary" @click="modifyPass()">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { modifyPass } from '@/api/user'
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import { ElNotification } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    Search,
    ArrowDown
  },
  data() {
    return {
      modifyPassDialogFormVisible: false,
      userPass: {
        oldPass: '',
        newPass: ''
      },
      rules: {
        oldPass: [{ required: true, message: '原密码不能为空', trigger: 'change' }],
        newPass: [{ required: true, message: '新密码不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device',
      'name',
      'amount'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    showModifyPass() {
      this.modifyPassDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['modifyPassDataForm'].clearValidate()
      })
    },
    modifyPass() {
      this.$refs['modifyPassDataForm'].validate((valid) => {
        if (valid) {
          this.modifyPassDialogFormVisible = false
          modifyPass(this.userPass).then(response => {
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
  }
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
        display: flex;
        align-items: center;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          margin-right: 5px;
        }

        .el-icon--right {
           cursor: pointer;
           font-size: 12px;
           margin-left: 5px;
        }
      }
    }
  }
}
</style>
