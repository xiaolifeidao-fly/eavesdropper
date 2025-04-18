import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { useTagsViewStore } from './tagsView'
import { usePermissionStore } from './permission'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    menuList: [],
    buttonList: [],
    amount: ''
  }),
  
  actions: {
    // 设置token
    setToken(token) {
      this.token = token
    },
    
    // 设置用户介绍
    setIntroduction(introduction) {
      this.introduction = introduction
    },
    
    // 设置用户名
    setName(name) {
      this.name = name
    },
    
    // 设置头像
    setAvatar(avatar) {
      this.avatar = avatar
    },
    
    // 设置角色
    setRoles(roles) {
      this.roles = roles
    },
    
    // 设置菜单列表
    setMenuList(menuList) {
      this.menuList = menuList
    },
    
    // 设置按钮权限列表
    setButtonList(buttonList) {
      this.buttonList = buttonList
    },
    
    // 设置账户余额
    setAmount(amount) {
      this.amount = amount
    },
    
    // 用户登录
    login(userInfo) {
      const { username, password } = userInfo
      return new Promise((resolve, reject) => {
        login({ username: username.trim(), password: password }).then(response => {
          const { data } = response
          console.log('登录请求成功,返回如下')
          console.log(data.token)
          this.setToken(data.token)
          setToken(data.token)
          this.setMenuList([])
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo(this.token).then(response => {
          const { data } = response

          if (!data) {
            reject('Verification failed, please Login again.')
          }
          
          const { roles, name, avatar, introduction, menuList, amount, buttonList } = data
          console.log('userjs-getInfo-1:')
          console.log(roles)
          console.log('userjs-getInfo-2:')
          console.log(menuList)

          this.setRoles(roles)
          this.setName(name)
          this.setAvatar(avatar)
          this.setIntroduction(introduction)
          this.setMenuList(menuList)
          this.setButtonList(buttonList)
          this.setAmount(amount)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    
    // 用户登出
    logout() {
      return new Promise((resolve, reject) => {
        logout(this.token).then(() => {
          this.setToken('')
          this.setRoles([])
          removeToken()
          resetRouter()

          // 清除所有标签视图
          const tagsViewStore = useTagsViewStore()
          tagsViewStore.delAllViews()

          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    
    // 重置令牌
    resetToken() {
      return new Promise(resolve => {
        this.setToken('')
        this.setRoles([])
        removeToken()
        resolve()
      })
    },
    
    // 动态修改权限
    async changeRoles(role) {
      const token = role + '-token'

      this.setToken(token)
      setToken(token)

      const { roles } = await this.getInfo()

      resetRouter()

      // 基于角色生成可访问路由映射
      const permissionStore = usePermissionStore()
      const accessRoutes = await permissionStore.generateRoutes(roles)

      // 动态添加可访问路由
      accessRoutes.forEach(route => {
        router.addRoute(route)
      })

      // 重置访问的视图和缓存的视图
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delAllViews()
    }
  }
}) 