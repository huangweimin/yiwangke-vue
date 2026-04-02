<template>
  <div class="page">
    <div class="header">
      <h1 class="title">🏆 打卡挑战</h1>
    </div>
    
    <div class="content">
      <!-- 今日打卡状态 -->
      <div class="today-card">
        <div class="today-info">
          <span class="date">{{ todayDate }}</span>
          <span class="status" :class="{ checked: todayChecked }">
            {{ todayChecked ? '✅ 已打卡' : '⏳ 待打卡' }}
          </span>
        </div>
        <button 
          class="checkin-btn" 
          :disabled="todayChecked || checkingIn"
          @click="doCheckin"
        >
          {{ checkingIn ? '打卡中...' : todayChecked ? '今日已完成' : '立即打卡' }}
        </button>
      </div>
      
      <!-- 挑战列表 -->
      <div class="challenges">
        <div 
          class="challenge-card" 
          v-for="challenge in challenges" 
          :key="challenge.id"
          :class="{ active: challenge.status === 'active', completed: challenge.status === 'completed' }"
        >
          <div class="challenge-header">
            <span class="challenge-icon">{{ challenge.icon }}</span>
            <div class="challenge-info">
              <span class="challenge-name">{{ challenge.name }}</span>
              <span class="challenge-desc">{{ challenge.description }}</span>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (challenge.days / challenge.totalDays * 100) + '%' }"
              ></div>
            </div>
            <div class="progress-text">
              <span>{{ challenge.days }} / {{ challenge.totalDays }} 天</span>
              <span>{{ Math.round(challenge.days / challenge.totalDays * 100) }}%</span>
            </div>
          </div>
          
          <div class="challenge-status">
            <span class="badge" :class="challenge.status">
              {{ getStatusText(challenge.status) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 打卡日历 -->
      <div class="calendar-section">
        <div class="calendar-header">
          <span class="calendar-title">📅 {{ currentMonth }}</span>
          <div class="calendar-nav">
            <span @click="prevMonth">‹</span>
            <span @click="nextMonth">›</span>
          </div>
        </div>
        <div class="calendar-weekdays">
          <span v-for="day in weekdays" :key="day">{{ day }}</span>
        </div>
        <div class="calendar-days">
          <span 
            v-for="(day, idx) in calendarDays" 
            :key="idx"
            class="day"
            :class="{ 
              'has-record': day.hasRecord,
              'today': day.isToday,
              'empty': !day.day 
            }"
          >
            {{ day.day || '' }}
          </span>
        </div>
      </div>
      
      <!-- 打卡记录 -->
      <div class="records-section">
        <div class="records-title">📝 打卡记录</div>
        <div class="records-list" v-if="recentRecords.length > 0">
          <div class="record-item" v-for="record in recentRecords" :key="record.id">
            <span class="record-date">{{ formatDate(record.checkin_date) }}</span>
            <span class="record-time">{{ formatTime(record.created_at) }}</span>
          </div>
        </div>
        <div class="empty-records" v-else>
          暂无打卡记录
        </div>
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
      <div class="tab-item" @click="$router.push('/mine')">
        <span class="tab-icon">👤</span>
        <span class="tab-text">我的</span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      todayChecked: false,
      checkingIn: false,
      challenges: [],
      recentRecords: [],
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      weekdays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  
  computed: {
    todayDate() {
      const now = new Date()
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      return `${months[now.getMonth()]}${now.getDate()}日 周${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`
    },
    
    currentMonthLabel() {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      return `${this.currentYear}年${months[this.currentMonth - 1]}`
    },
    
    calendarDays() {
      const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay()
      const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate()
      const today = new Date()
      
      const days = []
      
      // 填充空白
      for (let i = 0; i < firstDay; i++) {
        days.push({ day: '', hasRecord: false, isToday: false })
      }
      
      // 填充日期
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        const hasRecord = this.recentRecords.some(r => r.checkin_date === dateStr)
        const isToday = today.getFullYear() === this.currentYear && 
                       today.getMonth() + 1 === this.currentMonth && 
                       today.getDate() === d
        
        days.push({ day: d, hasRecord, isToday })
      }
      
      return days
    }
  },
  
  async mounted() {
    await this.loadData()
  },
  
  methods: {
    async loadData() {
      try {
        // 获取挑战列表
        const challenges = await api.getChallenges()
        this.challenges = challenges
        
        // 获取今日状态
        const status = await api.getChallengeStatus()
        this.todayChecked = status.checkedIn
        
        // 获取打卡记录
        const records = await api.getCheckinRecords({
          year: this.currentYear,
          month: this.currentMonth
        })
        this.recentRecords = records || []
        
      } catch (e) {
        console.error('加载失败:', e)
      }
    },
    
    async getCheckinRecords() {
      try {
        const records = await api.getCheckinRecords({
          year: this.currentYear,
          month: this.currentMonth
        })
        return records || []
      } catch (e) {
        console.error('获取记录失败:', e)
        return []
      }
    },
    
    async doCheckin() {
      if (this.todayChecked || this.checkingIn) return
      
      this.checkingIn = true
      try {
        await api.checkin({
          challengeType: 'newbie'
        })
        this.todayChecked = true
        alert('打卡成功！🎉')
        await this.loadData()
      } catch (e) {
        console.error('打卡失败:', e)
        alert(e.error || '打卡失败，请重试')
      } finally {
        this.checkingIn = false
      }
    },
    
    getStatusText(status) {
      const map = {
        'not_started': '未开始',
        'active': '进行中',
        'completed': '已完成',
        'failed': '已失败'
      }
      return map[status] || status
    },
    
    prevMonth() {
      if (this.currentMonth === 1) {
        this.currentMonth = 12
        this.currentYear--
      } else {
        this.currentMonth--
      }
    },
    
    nextMonth() {
      if (this.currentMonth === 12) {
        this.currentMonth = 1
        this.currentYear++
      } else {
        this.currentMonth++
      }
    },
    
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    },
    
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
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
  background-color: #FFFFFF;
  padding: 16px 20px;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.content {
  padding: 12px;
}

.today-card {
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.today-info {
  display: flex;
  flex-direction: column;
}

.date {
  font-size: 16px;
  color: #FFFFFF;
  margin-bottom: 4px;
}

.status {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.status.checked {
  color: #FFFFFF;
}

.checkin-btn {
  padding: 10px 20px;
  background-color: #FFFFFF;
  color: #4A90D9;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.checkin-btn:disabled {
  background-color: rgba(255, 255, 255, 0.5);
  color: rgba(74, 144, 217, 0.5);
}

.challenges {
  margin-bottom: 16px;
}

.challenge-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}

.challenge-card.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #4A90D9, #67AAFF);
}

.challenge-card.completed::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #52C41A;
}

.challenge-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.challenge-icon {
  font-size: 32px;
  margin-right: 12px;
}

.challenge-info {
  flex: 1;
}

.challenge-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 2px;
}

.challenge-desc {
  font-size: 13px;
  color: #999999;
}

.progress-section {
  margin-bottom: 8px;
}

.progress-bar {
  height: 6px;
  background-color: #E5E5E5;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4A90D9, #67AAFF);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999999;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 10px;
}

.badge.not_started {
  background-color: #F5F5F5;
  color: #999999;
}

.badge.active {
  background-color: #E6F7FF;
  color: #1890FF;
}

.badge.completed {
  background-color: #F6FFED;
  color: #52C41A;
}

.calendar-section {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.calendar-title {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
}

.calendar-nav {
  display: flex;
  gap: 16px;
}

.calendar-nav span {
  font-size: 18px;
  color: #4A90D9;
  cursor: pointer;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.calendar-weekdays span {
  font-size: 12px;
  color: #999999;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #333333;
  border-radius: 50%;
}

.day.today {
  background-color: #4A90D9;
  color: #FFFFFF;
}

.day.has-record {
  background-color: #F6FFED;
  color: #52C41A;
}

.day.has-record.today {
  background-color: #52C41A;
  color: #FFFFFF;
}

.day.empty {
  background: none;
}

.records-section {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
}

.records-title {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 12px;
}

.records-list {
  max-height: 200px;
  overflow-y: auto;
}

.record-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #F0F0F0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-date {
  font-size: 14px;
  color: #333333;
}

.record-time {
  font-size: 13px;
  color: #999999;
}

.empty-records {
  text-align: center;
  padding: 20px;
  color: #999999;
  font-size: 14px;
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
