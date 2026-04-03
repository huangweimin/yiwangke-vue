<template>
  <div class="container">
    <!-- 加载中 -->
    <div class="loading-overlay" v-if="loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">加载中...</span>
    </div>
    
    <!-- 顶部进度 -->
    <div class="header">
      <div class="header-top">
        <span class="back-btn" @click="goBack">‹ 返回</span>
        <span class="mode-label">{{ isReviewMode ? '复习' : '新词' }}</span>
        <span class="progress-text">{{ currentIndex + 1 }} / {{ totalCount }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>
    
    <!-- 单词卡片 -->
    <div class="word-card" v-if="currentWord && !isComplete">
      <div class="word-main">
        <span class="word">{{ currentWord.word }}</span>
        <span class="phonetic">{{ currentWord.phonetic }}</span>
        <span class="speaker-btn" @click="speakWord(currentWord)">🔊</span>
      </div>
      
      <!-- 词根展示 -->
      <div class="roots-section" v-if="currentWord.roots && currentWord.roots.length">
        <div class="roots-title">💡 词根解析</div>
        <div class="roots-list">
          <span class="root-tag" v-for="root in currentWord.roots" :key="root">
            {{ root }}
          </span>
        </div>
      </div>
      
      <!-- 释义 -->
      <div class="definition-section">
        <div class="definition" v-if="showDefinition">
          <span class="pos">[{{ currentWord.pos }}]</span>
          {{ currentWord.definition }}
        </div>
        <button class="show-btn" v-if="!showDefinition" @click="showDefinition = true">
          点击显示释义
        </button>
      </div>
      
      <!-- 家族词汇 -->
      <div class="family-section" v-if="showDefinition && currentWord.family && currentWord.family.length">
        <div class="family-title">📦 家族词汇</div>
        <div class="family-list">
          <span class="family-word" v-for="(fw, idx) in currentWord.family" :key="idx">
            {{ fw }}
          </span>
        </div>
      </div>
      
      <!-- 例句 -->
      <div class="example-section" v-if="showDefinition && currentWord.examples && currentWord.examples.length">
        <div class="example-title">📝 例句</div>
        <div class="example-text">{{ currentWord.examples[0] }}</div>
      </div>
    </div>
    
    <!-- 评分按钮（复习模式） -->
    <div class="rating-section" v-if="showDefinition && isReviewMode && !isComplete">
      <div class="rating-prompt">记住了吗？</div>
      <div class="rating-buttons">
        <button class="rating-btn forget" @click="rateWord(0)">
          <span class="emoji">😵</span>
          <span class="btn-text">忘记</span>
        </button>
        <button class="rating-btn fuzzy" @click="rateWord(1)">
          <span class="emoji">😐</span>
          <span class="btn-text">模糊</span>
        </button>
        <button class="rating-btn remember" @click="rateWord(2)">
          <span class="emoji">✅</span>
          <span class="btn-text">记住</span>
        </button>
      </div>
    </div>
    
    <!-- 新词学习按钮 -->
    <div class="learning-section" v-if="showDefinition && !isReviewMode && !isComplete">
      <button class="next-btn" @click="learnAndNext">
        {{ isLastWord ? '完成学习' : '下一个 →' }}
      </button>
    </div>
    
    <!-- 完成页 -->
    <div class="complete-section" v-if="isComplete">
      <div class="complete-icon">🎉</div>
      <div class="complete-title">太棒了！</div>
      <div class="complete-subtitle">今日学习已完成</div>
      <div class="complete-stats">
        <div class="stat-row">
          <span class="stat-label">复习词数</span>
          <span class="stat-value">{{ stats.reviewed }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">新学词数</span>
          <span class="stat-value">{{ stats.learned }}</span>
        </div>
      </div>
      <button class="back-home-btn" @click="goBack">返回首页</button>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      loading: true,
      isReviewMode: true,
      currentIndex: 0,
      showDefinition: false,
      isComplete: false,
      wordList: [],
      totalCount: 0,
      stats: {
        reviewed: 0,
        learned: 0
      }
    }
  },
  
  computed: {
    currentWord() {
      return this.wordList[this.currentIndex] || null
    },
    
    progressPercent() {
      if (this.totalCount === 0) return 0
      return Math.round((this.currentIndex / this.totalCount) * 100)
    },
    
    isLastWord() {
      return this.currentIndex >= this.totalCount - 1
    }
  },
  
  async mounted() {
    await this.loadTodayTask()
  },
  
  methods: {
    async loadTodayTask() {
      this.loading = true
      try {
        // 从 API 获取今日任务
        const task = await api.getTodayTask()
        
        if (!task) {
          this.wordList = []
          this.totalCount = 0
          this.isComplete = true
          this.loading = false
          return
        }
        
        // 设置学习模式
        this.isReviewMode = (task.reviewCount || 0) > 0
        
        // 设置单词列表
        if (this.isReviewMode) {
          this.wordList = task.reviews || []
        } else {
          this.wordList = task.newWords || []
        }
        
        this.totalCount = this.wordList.length
        
        // 从 store 获取今日统计
        const storeStats = await api.getStats().catch(() => null)
        if (storeStats) {
          this.stats = {
            reviewed: storeStats.todayReviewed || 0,
            learned: storeStats.todayLearned || 0
          }
        }
        
        if (this.totalCount === 0) {
          this.isComplete = true
        }
        
      } catch (e) {
        console.error('加载任务失败:', e)
        alert('加载失败，请重试')
        this.$router.push('/')
      } finally {
        this.loading = false
      }
    },
    
    async rateWord(quality) {
      const word = this.currentWord
      if (!word) return
      
      try {
        await api.submitReview({
          wordId: word.word_id,
          quality: quality
        })
        this.stats.reviewed++
      } catch (e) {
        console.error('提交复习失败:', e)
      }
      
      this.nextWord()
    },
    
    async learnAndNext() {
      const word = this.currentWord
      if (!word) return
      
      try {
        await api.learnNewWord({
          wordId: word.word_id
        })
        this.stats.learned++
      } catch (e) {
        console.error('学习新词失败:', e)
      }
      
      this.nextWord()
    },
    
    nextWord() {
      if (this.isLastWord) {
        // 检查是否还有新词要学
        if (this.isReviewMode && this.stats.learned < 5) {
          // 复习完成，切换到新词学习
          this.isReviewMode = false
          this.currentIndex = 0
          this.showDefinition = false
          // 从 API 重新获取新词
          this.loadNewWords()
        } else {
          this.isComplete = true
        }
      } else {
        this.currentIndex++
        this.showDefinition = false
      }
    },
    
    async loadNewWords() {
      try {
        const task = await api.getTodayTask()
        this.wordList = task?.newWords || []
        this.totalCount = this.wordList.length
        if (this.totalCount === 0) {
          this.isComplete = true
        }
      } catch (e) {
        console.error('加载新词失败:', e)
      }
    },
    
    speakWord(word) {
      if (!word || !word.word) return
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(word.word)
        utterance.lang = 'en-US'
        utterance.rate = 0.85
        window.speechSynthesis.speak(utterance)
      }
    },
    
    goBack() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 20px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E5E5E5;
  border-top-color: #4A90D9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.header {
  background-color: #4A90D9;
  padding: 16px 20px;
  padding-top: 48px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.back-btn {
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.mode-label {
  color: #fff;
  font-size: 14px;
  opacity: 0.9;
}

.progress-text {
  color: #fff;
  font-size: 14px;
}

.progress-bar {
  height: 4px;
  background-color: rgba(255,255,255,0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #fff;
  border-radius: 2px;
  transition: width 0.3s;
}

.word-card {
  margin: 16px;
  padding: 24px 20px;
  background-color: #fff;
  border-radius: 16px;
  min-height: 300px;
}

.word-main {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
}

.word {
  display: block;
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.phonetic {
  font-size: 16px;
  color: #999;
}

.speaker-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  cursor: pointer;
  opacity: 0.7;
}

.speaker-btn:hover {
  opacity: 1;
}

.roots-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #F8F9FA;
  border-radius: 12px;
}

.roots-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.roots-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.root-tag {
  padding: 6px 14px;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #fff;
  font-size: 14px;
  border-radius: 16px;
}

.definition-section {
  margin-bottom: 20px;
}

.definition {
  font-size: 18px;
  color: #333;
  line-height: 1.6;
  padding: 16px;
  background-color: #F8F9FA;
  border-radius: 8px;
}

.pos {
  color: #4A90D9;
  margin-right: 8px;
}

.show-btn {
  width: 100%;
  padding: 14px;
  background-color: #fff;
  border: 1px solid #4A90D9;
  color: #4A90D9;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

.family-section, .example-section {
  margin-bottom: 16px;
}

.family-title, .example-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.family-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.family-word {
  padding: 4px 10px;
  background-color: #F0F7FF;
  color: #4A90D9;
  font-size: 13px;
  border-radius: 4px;
}

.example-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  font-style: italic;
}

.rating-section {
  margin: 0 16px;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  text-align: center;
}

.rating-prompt {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
}

.rating-buttons {
  display: flex;
  justify-content: space-around;
  gap: 12px;
}

.rating-btn {
  flex: 1;
  padding: 14px 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rating-btn.forget {
  background-color: #FFF2E8;
}

.rating-btn.fuzzy {
  background-color: #FFF7E6;
}

.rating-btn.remember {
  background-color: #F6FFED;
}

.emoji {
  font-size: 28px;
  margin-bottom: 4px;
}

.btn-text {
  font-size: 13px;
  color: #333;
}

.learning-section {
  margin: 16px;
}

.next-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  cursor: pointer;
}

.complete-section {
  margin: 60px 32px;
  padding: 40px 20px;
  background-color: #fff;
  border-radius: 16px;
  text-align: center;
}

.complete-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.complete-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.complete-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.complete-stats {
  border-top: 1px solid #F0F0F0;
  padding-top: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.back-home-btn {
  width: 100%;
  margin-top: 24px;
  padding: 14px;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  cursor: pointer;
}
</style>
