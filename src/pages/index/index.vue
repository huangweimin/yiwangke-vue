<template>
  <div class="page">
    <!-- 顶部信息 -->
    <div class="header">
      <div class="user-info" @click="goLogin">
        <span class="nickname">{{ isLoggedIn ? user.nickname : '点击登录' }}</span>
        <span class="login-tip" v-if="!isLoggedIn">登录解锁完整功能</span>
      </div>
      <div class="header-actions">
        <span class="settings-icon" @click="$router.push('/settings')">⚙️</span>
      </div>
    </div>
    
    <!-- 连续学习 & 进度 -->
    <div class="streak-card">
      <div class="streak-info">
        <span class="streak-icon">📅</span>
        <span class="streak-text">连续学习</span>
        <span class="streak-days">{{ stats.streakDays || 0 }}</span>
        <span class="streak-unit">天</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="progress-label">
        <span>今日进度</span>
        <span>{{ todayProgress }}%</span>
      </div>
    </div>
    
    <!-- 今日任务 -->
    <div class="today-task">
      <div class="task-header">
        <span class="task-title">📌 今日任务</span>
        <span class="task-date">{{ todayDate }}</span>
      </div>
      
      <div class="task-stats">
        <div class="task-stat">
          <span class="stat-num">{{ todayTask.reviewCount }}</span>
          <span class="stat-label">复习</span>
        </div>
        <div class="task-stat-divider">+</div>
        <div class="task-stat">
          <span class="stat-num">{{ todayTask.newCount }}</span>
          <span class="stat-label">新词</span>
        </div>
        <div class="task-stat-divider">=</div>
        <div class="task-stat highlight">
          <span class="stat-num">{{ todayTask.reviewCount + todayTask.newCount }}</span>
          <span class="stat-label">总计</span>
        </div>
      </div>
      
      <button 
        class="start-btn" 
        :class="{ disabled: !canStart, completed: isTodayComplete }"
        @click="startLearn"
      >
        {{ isTodayComplete ? '✅ 今日已完成' : '开始学习' }}
      </button>
      
      <div class="login-prompt" v-if="!isLoggedIn" @click="goLogin">
        登录后学习记录自动同步云端 📱
      </div>
    </div>
    
    <!-- 快捷入口 -->
    <div class="quick-actions">
      <div class="action-item" @click="$router.push('/stats')">
        <span class="action-icon">📊</span>
        <span class="action-text">学习统计</span>
      </div>
      <div class="action-item" @click="$router.push('/library')">
        <span class="action-icon">📚</span>
        <span class="action-text">词库</span>
      </div>
      <div class="action-item" @click="$router.push('/challenge')">
        <span class="action-icon">🏆</span>
        <span class="action-text">打卡</span>
      </div>
      <div class="action-item" @click="$router.push('/community')">
        <span class="action-icon">💬</span>
        <span class="action-text">社区</span>
      </div>
    </div>
    
    <!-- 统计指标 -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">{{ stats.totalWords || 0 }}</div>
        <div class="stat-label">词汇总量</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.todayLearned + stats.todayReviewed }}</div>
        <div class="stat-label">今日已学</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.masteredWords || 0 }}</div>
        <div class="stat-label">已掌握</div>
      </div>
      <div class="stat-item" @click="$router.push('/challenge')">
        <div class="stat-value">0/7</div>
        <div class="stat-label">打卡挑战</div>
      </div>
    </div>
    
    <!-- 底部导航 -->
    <div class="tab-bar">
      <div class="tab-item active">
        <span class="tab-icon">🏠</span>
        <span class="tab-text">首页</span>
      </div>
      <div class="tab-item" @click="$router.push('/library')">
        <span class="tab-icon">📚</span>
        <span class="tab-text">词库</span>
      </div>
      <div class="tab-item" @click="$router.push('/community')">
        <span class="tab-icon">💬</span>
        <span class="tab-text">社区</span>
      </div>
      <div class="tab-item" @click="$router.push('/mine')">
        <span class="tab-icon">👤</span>
        <span class="tab-text">我的</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {}
  },
  
  computed: {
    ...mapState(['user', 'stats', 'todayTask', 'settings', 'isLoggedIn']),
    
    canStart() {
      return !this.isTodayComplete && 
             (this.todayTask.reviewCount > 0 || this.todayTask.newCount > 0)
    },
    
    isTodayComplete() {
      return this.todayTask.completed || 
             (this.todayTask.reviewCount === 0 && this.todayTask.newCount === 0)
    },
    
    todayProgress() {
      const total = this.todayTask.reviewCount + this.todayTask.newCount
      const done = this.stats.todayLearned + this.stats.todayReviewed
      if (total === 0) return 100
      return Math.min(100, Math.round((done / total) * 100))
    },
    
    progressPercentage() {
      if (this.stats.totalWords === 0) return 0
      return Math.round((this.stats.masteredWords / this.stats.totalWords) * 100)
    },
    
    todayDate() {
      const now = new Date()
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      return `${months[now.getMonth()]}${now.getDate()}日`
    }
  },
  
  async mounted() {
    this.checkLogin()
    await this.loadUserData()
    await this.calculateTodayTask()
  },
  
  methods: {
    ...mapActions(['loadUserData', 'calculateTodayTask', 'checkLogin']),
    
    startLearn() {
      const mode = this.todayTask.reviewCount > 0 ? 'review' : 'new'
      this.$store.commit('SET_LEARN_MODE', mode === 'review')
      this.$router.push('/learn')
    },
    
    goLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #FFFFFF;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.login-tip {
  font-size: 12px;
  color: #4A90D9;
  margin-top: 2px;
}

.settings-icon {
  font-size: 20px;
  cursor: pointer;
}

.streak-card {
  margin: 12px 16px;
  padding: 16px;
  background-color: #FFFFFF;
  border-radius: 12px;
}

.streak-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.streak-icon {
  font-size: 16px;
  margin-right: 6px;
}

.streak-text {
  font-size: 14px;
  color: #666666;
}

.streak-days {
  font-size: 24px;
  font-weight: 600;
  color: #4A90D9;
  margin-left: 8px;
}

.streak-unit {
  font-size: 14px;
  color: #666666;
  margin-left: 4px;
}

.progress-bar {
  height: 8px;
  background-color: #E5E5E5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4A90D9, #67AAFF);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999999;
  margin-top: 6px;
}

.today-task {
  margin: 12px 16px;
  padding: 20px;
  background-color: #FFFFFF;
  border-radius: 12px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.task-date {
  font-size: 12px;
  color: #999999;
}

.task-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.task-stat {
  text-align: center;
  padding: 0 16px;
}

.task-stat.highlight .stat-num {
  color: #4A90D9;
}

.stat-num {
  display: block;
  font-size: 32px;
  font-weight: 600;
  color: #333333;
}

.stat-label {
  font-size: 12px;
  color: #999999;
}

.task-stat-divider {
  font-size: 20px;
  color: #CCCCCC;
}

.start-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #FFFFFF;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.start-btn.disabled {
  background: #CCCCCC;
}

.start-btn.completed {
  background: #F6FFED;
  color: #52C41A;
}

.login-prompt {
  margin-top: 12px;
  text-align: center;
  padding: 10px;
  background-color: #F0F7FF;
  border-radius: 8px;
  font-size: 13px;
  color: #4A90D9;
  cursor: pointer;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 12px 16px;
  padding: 16px;
  background-color: #FFFFFF;
  border-radius: 12px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.action-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.action-text {
  font-size: 12px;
  color: #666666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 12px 16px;
}

.stat-item {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999999;
}

/* 底部导航 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background-color: #FFFFFF;
  border-top: 1px solid #E5E5E5;
  padding: 8px 0;
  padding-bottom: env(safe-area-inset-bottom, 8px);
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.tab-item:active {
  opacity: 0.7;
}

.tab-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.tab-text {
  font-size: 11px;
  color: #999999;
}

.tab-item.active .tab-text {
  color: #4A90D9;
}
</style>
