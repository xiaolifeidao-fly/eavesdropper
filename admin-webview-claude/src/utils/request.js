import axios from 'axios'
import { ElMessageBox as MessageBox, ElMessage as Message } from 'element-plus'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/user'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    const userStore = useUserStore()
    console.log('请求拦截器,token:' + userStore.token)
    console.log(process.env)
    if (userStore.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
      // config.headers['X-Token'] = '197e6a89-09a7-4252-bf2a-2502e72ba459'
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    console.log('request.js response如下:')
    console.log(res)
    // if the custom code is not 0, it is judged as an error.
    if (res.code !== '0') {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === '50008' || res.code === '50012' || res.code === '50014') {
        console.log('request.js response登录失效')
        // to re-login
        MessageBox.confirm('登录失效,请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const userStore = useUserStore()
          userStore.resetToken().then(() => {
            location.reload()
          })
        })
      }
      // authType = 'NOT_LOGIN' 登录失效
      if (res.authType === 'NOT_LOGIN') {
        console.log('request.js response登录失效')
        // to re-login
        MessageBox.confirm('登录失效,请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const userStore = useUserStore()
          userStore.resetToken().then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
