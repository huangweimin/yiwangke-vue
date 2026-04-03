import { createStore } from 'vuex'
import api from '@/utils/api.js'

const store = createStore({
  state: {
    // 用户信息
    user: {
      user_id: '',
      nickname: '学习者',
      email: ''
    },
    
    // 是否已登录
    isLoggedIn: false,
    
    // 用户设置
    settings: {
      dailyGoal: 20,
      reminderTime: '08:00',
      darkMode: false,
      soundEnabled: true
    },
    
    // 学习进度统计
    stats: {
      totalWords: 0,
      masteredWords: 0,
      todayLearned: 0,
      todayReviewed: 0,
      streakDays: 0,
      lastStudyDate: null
    },
    
    // 今日学习状态
    todayTask: {
      reviewCount: 0,
      newCount: 0,
      completed: false
    },
    
    // 当前学习的词
    currentWord: null,
    currentWordIndex: 0,
    isReviewMode: true,
    
    // 学习记录 Map<word_id, record>
    learningRecords: {},
    
    // 词库数据
    words: [],
    roots: [],
    
    // 挑战数据
    challenges: []
  },
  
  mutations: {
    SET_LOGIN_STATUS(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn
    },
    
    INIT_USER(state, userData) {
      state.user = { ...state.user, ...userData }
    },
    
    UPDATE_SETTINGS(state, settings) {
      state.settings = { ...state.settings, ...settings }
    },
    
    UPDATE_STATS(state, stats) {
      state.stats = { ...state.stats, ...stats }
    },
    
    SET_TODAY_TASK(state, task) {
      state.todayTask = task
    },
    
    SET_CURRENT_WORD(state, word) {
      state.currentWord = word
    },
    
    SET_WORD_INDEX(state, index) {
      state.currentWordIndex = index
    },
    
    SET_LEARN_MODE(state, isReview) {
      state.isReviewMode = isReview
    },
    
    UPDATE_RECORD(state, { wordId, record }) {
      state.learningRecords[wordId] = record
    },
    
    LOAD_WORDS(state, words) {
      state.words = words
    },
    
    LOAD_ROOTS(state, roots) {
      state.roots = roots
    },
    
    SET_CHALLENGES(state, challenges) {
      state.challenges = challenges
    },
    
    INCREMENT_TODAY_LEARNED(state) {
      state.stats.todayLearned++
    },
    
    INCREMENT_TODAY_REVIEWED(state) {
      state.stats.todayReviewed++
    },
    
    COMPLETE_TODAY_TASK(state) {
      state.todayTask.completed = true
    }
  },
  
  actions: {
    // 检查登录状态
    checkLogin({ commit }) {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('userInfo')
      
      if (token && userInfo) {
        commit('SET_LOGIN_STATUS', true)
        commit('INIT_USER', userInfo)
        return true
      }
      return false
    },
    
    // 加载用户数据
    async loadUserData({ commit, dispatch }) {
      try {
        // 检查登录状态
        dispatch('checkLogin')
        
        // 从 API 加载词库
        const wordsData = await api.getWords()
        commit('LOAD_WORDS', wordsData.words || [])
        commit('UPDATE_STATS', { totalWords: wordsData.total || 0 })
        
        // 已登录，从 API 加载更多信息（ stats 单独处理，任一失败不影响其他）
        try {
          const profile = await api.getProfile()
          commit('SET_LOGIN_STATUS', true)
          commit('INIT_USER', profile)
        } catch (e) {
          console.error('加载用户信息失败:', e)
        }
        
        try {
          const stats = await api.getStats()
          commit('UPDATE_STATS', {
            todayLearned: stats.todayLearned || 0,
            todayReviewed: stats.todayReviewed || 0,
            masteredWords: stats.masteredWords || 0,
            streakDays: stats.streakDays || 0,
            lastStudyDate: stats.lastStudyDate || null
          })
        } catch (e) {
          console.error('获取统计数据失败:', e)
        }
        
        try {
          const challenges = await api.getChallenges()
          commit('SET_CHALLENGES', challenges)
        } catch (e) {
          console.error('获取挑战数据失败:', e)
        }
        
      } catch (e) {
        console.error('加载用户数据失败:', e)
      }
    },
    
    // 计算今日任务
    async calculateTodayTask({ commit, state }) {
      if (!state.isLoggedIn) {
        // 未登录模式，使用本地计算
        const records = Object.values(state.learningRecords)
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        
        const dueReviews = records.filter(r => {
          if (!r.next_review) return false
          return new Date(r.next_review) <= now
        })
        
        const studiedToday = state.stats.lastStudyDate === today
        const todayGoal = state.settings.dailyGoal
        
        let newCount = 0
        if (!studiedToday) {
          newCount = Math.min(5, Math.max(0, todayGoal - dueReviews.length))
        }
        
        commit('SET_TODAY_TASK', {
          reviewCount: dueReviews.length,
          newCount: newCount,
          completed: false
        })
        return
      }
      
      // 已登录，从 API 获取
      try {
        const task = await api.getTodayTask()
        commit('SET_TODAY_TASK', {
          reviewCount: task.reviewCount,
          newCount: task.newCount,
          completed: false
        })
        // 不再从 getTodayTask 覆盖今日已学数据，保持 getStats 的值
      } catch (e) {
        console.error('获取今日任务失败:', e)
      }
    },
    
    // 获取并同步后端统计（修复今日已学数据）
    async fetchStats({ commit }) {
      try {
        const stats = await api.getStats()
        commit('UPDATE_STATS', {
          todayLearned: stats.todayLearned || 0,
          todayReviewed: stats.todayReviewed || 0,
          masteredWords: stats.masteredWords || 0,
          streakDays: stats.streakDays || 0,
          lastStudyDate: stats.lastStudyDate || null
        })
      } catch (e) {
        console.error('获取统计失败:', e)
      }
    },
    
    // 提交复习评分
    async submitReview({ commit, dispatch, state }, { wordId, quality }) {
      if (!state.isLoggedIn) {
        // 未登录模式
        commit('INCREMENT_TODAY_REVIEWED')
        return { success: true }
      }
      
      try {
        const res = await api.submitReview({ wordId, quality })
        commit('INCREMENT_TODAY_REVIEWED')
        // 同步后端真实数据
        await dispatch('fetchStats')
        return res
      } catch (e) {
        console.error('提交复习失败:', e)
        throw e
      }
    },
    
    // 学习新词
    async learnNewWord({ commit, dispatch, state }, wordId) {
      if (!state.isLoggedIn) {
        commit('INCREMENT_TODAY_LEARNED')
        return { success: true }
      }
      
      try {
        const res = await api.learnNewWord({ wordId })
        commit('INCREMENT_TODAY_LEARNED')
        // 同步后端真实数据
        await dispatch('fetchStats')
        return res
      } catch (e) {
        console.error('学习新词失败:', e)
        throw e
      }
    },
    
    // 保存数据到本地
    saveToStorage({ state }) {
      try {
        localStorage.setItem('userData', JSON.stringify(state.user))
        localStorage.setItem('settings', JSON.stringify(state.settings))
        localStorage.setItem('stats', JSON.stringify(state.stats))
      } catch (e) {
        console.error('保存本地数据失败:', e)
      }
    },
    
    // 登出
    logout({ commit }) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      commit('SET_LOGIN_STATUS', false)
      commit('INIT_USER', { user_id: '', nickname: '学习者', email: '' })
    }
  },
  
  getters: {
    progressPercentage: state => {
      if (state.stats.totalWords === 0) return 0
      return Math.round((state.stats.masteredWords / state.stats.totalWords) * 100)
    },
    
    getWordById: state => id => {
      return state.words.find(w => w.word_id === id)
    },
    
    getRootById: state => id => {
      return state.roots.find(r => r.root_id === id)
    },
    
    getWordsByRoot: state => root => {
      return state.words.filter(w => w.roots && w.roots.includes(root))
    },
    
    isTodayTaskComplete: state => {
      return state.todayTask.completed || 
             (state.stats.todayLearned + state.stats.todayReviewed >= state.settings.dailyGoal)
    }
  }
})

export default store
