import axios from 'axios'
import router from '@/router'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: __API__, // api的base_url
  timeout: 5000                  // 请求超时时间
})

// request拦截器
service.interceptors.request.use(config => {
  // 让每个请求都携带token
  if (store.getters.auth_token) {
    config.headers['Authorization'] = 'TOKEN ' + getToken()
  }
  return config
}, error => {
  if (process.env.NODE_ENV === 'development') {  // for debug
    console.log(error)
  }
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => response,
  error => {
    if (process.env.NODE_ENV === 'development') {  // for debug
      console.log(error.response)
    }
    if (error.response.status === 429 || error.response.status >= 500) {
    	alert(error.response.data.detail)
    } else if (error.response.status === 404) {
      router.push({ path: '/404' })
    } else if (error.response.status === 401) {
      store.dispatch('FeLogOut').then(() => {
        location.reload()
        router.push({ path: '/login' })
      })
    }
    return Promise.reject(error)
  }
)

export default service
