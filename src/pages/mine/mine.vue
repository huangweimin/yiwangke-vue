<template>
  <div class="page">
    <div class="profile-section">
      <div class="avatar">👤</div>
      <div class="user-info">
        <span class="nickname">{{ user.nickname || '学习者' }}</span>
        <span class="email">{{ user.email || '点击登录体验完整功能' }}</span>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-value">{{ stats.streakDays || 0 }}</span>
        <span class="stat-label">连续学习</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ totalWords }}</span>
        <span class="stat-label">已学单词</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ masteredWords }}</span>
        <span class="stat-label">已掌握</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.todayLearned + stats.todayReviewed }}</span>
        <span class="stat-label">今日学习</span>
      </div>
    </div>
    
    <div class="menu-list">
      <div class="menu-item" @click="$router.push('/settings')">
        <span class="menu-icon">⚙️</span>
        <span class="menu-text">设置</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item" @click="$router.push('/stats')">
        <span class="menu-icon">📊</span>
        <span class="menu-text">学习统计</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item" @click="shareApp">
        <span class="menu-icon">📤</span>
        <span class="menu-text">分享给好友</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item" @click="logout" v-if="isLoggedIn">
        <span class="menu-icon">🚪</span>
        <span class="menu-text logout">退出登录</span>
        <span class="arrow">›</span>
      </div>
    </div>
    
    <!-- 底部导航 -->
    <div class="tab-bar">
      <div class="tab-item" @click="$router.push('/')">
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
      <div class="tab-item active">
        <span class="tab-icon">👤</span>
        <span class="tab-text">我的</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['user', 'stats', 'isLoggedIn', 'learningRecords']),
    
    totalWords() {
      return Object.keys(this.learningRecords).length
    },
    
    masteredWords() {
      return Object.values(this.learningRecords).filter(r => r.status === 'mastered').length
    }
  },
  
  methods: {
    ...mapActions(['logout']),
    
    shareApp() {
      alert('分享功能开发中')
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

.profile-section {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  padding: 32px 20px;
}

.avatar {
  width: 64px;
  height: 64px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-right: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4px;
}

.email {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background-color: #E5E5E5;
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.stat-item {
  background-color: #FFFFFF;
  padding: 16px 8px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #4A90D9;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #999999;
}

.menu-list {
  padding: 0 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.menu-item:active {
  background-color: #F8F9FA;
}

.menu-icon {
  font-size: 20px;
  margin-right: 12px;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: #333333;
}

.menu-text.logout {
  color: #F5222D;
}

.arrow {
  font-size: 18px;
  color: #CCCCCC;
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
