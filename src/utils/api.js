import axios from 'axios'

const API_BASE = '/api'

// 创建 axios 实例
const instance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：添加 token
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器：处理错误
instance.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      // token 过期
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        window.location.href = '/login'
      }
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)

// API 方法
export const api = {
  // 认证
  register: (data) => instance.post('/auth/register', data),
  login: (data) => instance.post('/auth/login', data),
  getProfile: () => instance.get('/auth/profile'),
  
  // 单词
  getWords: (params) => instance.get('/words', { params }),
  getWord: (id) => instance.get('/words/' + id),
  getRoots: () => instance.get('/words/roots'),
  
  // 学习
  getTodayTask: () => instance.get('/learn/today-task'),
  submitReview: (data) => instance.post('/learn/review', data),
  learnNewWord: (data) => instance.post('/learn/new', data),
  getStats: () => instance.get('/learn/stats'),
  
  // 挑战
  getChallenges: () => instance.get('/challenge'),
  checkin: (data) => instance.post('/challenge/checkin', data),
  getChallengeStatus: () => instance.get('/challenge/status'),
  getCheckinRecords: (params) => instance.get('/challenge/records', { params }),
  
  // 词根
  getRoots: () => instance.get('/roots'),
  getRootDetail: (root) => instance.get('/roots/' + root),
  
  // 社区
  getPosts: (params) => instance.get('/posts', { params }),
  createPost: (data) => instance.post('/posts', data),
  toggleLike: (postId) => instance.post('/posts/' + postId + '/like'),
  getLeaderboard: (params) => instance.get('/posts/leaderboard', { params }),
  
  // 评论
  getComments: (postId) => instance.get('/comments/' + postId),
  addComment: (postId, data) => instance.post('/comments/' + postId, data),
  deleteComment: (commentId) => instance.delete('/comments/' + commentId)
}

export default api
