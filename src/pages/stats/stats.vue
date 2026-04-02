<template>
  <div class="container">
    <div class="header">
      <h1 class="title">📊 学习统计</h1>
    </div>
    
    <div class="stats-overview">
      <div class="stat-card primary">
        <span class="stat-value">{{ stats.streakDays || 0 }}</span>
        <span class="stat-label">连续学习天数</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ totalWords }}</span>
        <span class="stat-label">已学单词</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ masteredWords }}</span>
        <span class="stat-label">已掌握</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">今日进度</div>
      <div class="today-progress">
        <div class="progress-item">
          <span class="progress-value">{{ stats.todayLearned || 0 }}</span>
          <span class="progress-label">新学</span>
        </div>
        <div class="progress-divider">+</div>
        <div class="progress-item">
          <span class="progress-value">{{ stats.todayReviewed || 0 }}</span>
          <span class="progress-label">复习</span>
        </div>
        <div class="progress-divider">=</div>
        <div class="progress-item highlight">
          <span class="progress-value">{{ stats.todayLearned + stats.todayReviewed }}</span>
          <span class="progress-label">总计</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">掌握度分布</div>
      <div class="mastery-chart">
        <div class="chart-bar">
          <div class="bar-fill mastered" :style="{ width: masteredPercent + '%' }"></div>
        </div>
        <div class="chart-legend">
          <span>已掌握 {{ masteredPercent }}%</span>
          <span>学习中 {{ learningPercent }}%</span>
        </div>
      </div>
    </div>
    
    <div class="back-btn" @click="goBack">
      <span>‹ 返回</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['stats', 'learningRecords']),
    
    totalWords() {
      return Object.keys(this.learningRecords).length
    },
    
    masteredWords() {
      return Object.values(this.learningRecords).filter(r => r.status === 'mastered').length
    },
    
    learningWords() {
      return Object.values(this.learningRecords).filter(r => r.status === 'learning').length
    },
    
    masteredPercent() {
      if (this.totalWords === 0) return 0
      return Math.round((this.masteredWords / this.totalWords) * 100)
    },
    
    learningPercent() {
      return 100 - this.masteredPercent
    }
  },
  
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 80px;
}

.header {
  background-color: #FFFFFF;
  padding: 20px;
  text-align: center;
  margin-bottom: 12px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 12px;
  margin-bottom: 12px;
}

.stat-card {
  background-color: #FFFFFF;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
}

.stat-card.primary {
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
}

.stat-card.primary .stat-value,
.stat-card.primary .stat-label {
  color: #FFFFFF;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999999;
}

.section {
  background-color: #FFFFFF;
  margin: 0 12px 12px;
  padding: 16px;
  border-radius: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
}

.today-progress {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-item {
  text-align: center;
  padding: 0 16px;
}

.progress-value {
  display: block;
  font-size: 32px;
  font-weight: 600;
  color: #333333;
}

.progress-item.highlight .progress-value {
  color: #4A90D9;
}

.progress-label {
  font-size: 12px;
  color: #999999;
}

.progress-divider {
  font-size: 24px;
  color: #CCCCCC;
}

.mastery-chart {
  padding: 0 8px;
}

.chart-bar {
  height: 12px;
  background-color: #E5E5E5;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s;
}

.bar-fill.mastered {
  background: linear-gradient(90deg, #52C41A, #73D13D);
}

.chart-legend {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999999;
}

.back-btn {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #FFFFFF;
  padding: 12px 32px;
  border-radius: 24px;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
}
</style>
