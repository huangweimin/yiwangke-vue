<template>
  <div class="page">
    <div class="header">
      <span class="back-btn" @click="$router.back()">‹ 返回</span>
      <h1 class="title">词根详情</h1>
    </div>
    
    <!-- 加载状态 -->
    <div class="loading" v-if="loading">
      <div class="spinner"></div>
    </div>
    
    <div class="content" v-else-if="rootData">
      <!-- 词根信息卡片 -->
      <div class="root-card">
        <div class="root-main">
          <span class="root-name">{{ rootData.root }}</span>
          <span class="root-meaning">含义：{{ rootData.meaning }}</span>
        </div>
        <div class="root-tip">
          <span class="tip-label">💡 记忆法</span>
          <p class="tip-text">{{ rootData.tip }}</p>
        </div>
      </div>
      
      <!-- 单词列表 -->
      <div class="words-section">
        <div class="section-header">
          <span class="section-title">📚 相关词汇</span>
          <span class="word-count">共 {{ rootData.wordCount }} 个</span>
        </div>
        
        <div class="words-list">
          <div 
            class="word-item" 
            v-for="word in rootData.words" 
            :key="word.word_id"
            @click="goToWord(word.word_id)"
          >
            <div class="word-info">
              <span class="word">{{ word.word }}</span>
              <span class="phonetic">{{ word.phonetic }}</span>
            </div>
            <span class="definition">{{ word.definition }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty" v-else>
      <p>未找到该词根</p>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      loading: true,
      rootData: null
    }
  },
  
  async mounted() {
    const root = this.$route.params.root
    if (root) {
      await this.loadRootDetail(root)
    }
  },
  
  methods: {
    async loadRootDetail(root) {
      this.loading = true
      try {
        const data = await api.getRootDetail(root)
        this.rootData = data || {}
      } catch (e) {
        console.error('加载词根详情失败:', e)
      } finally {
        this.loading = false
      }
    },
    
    goToWord(wordId) {
      this.$router.push(`/word/${wordId}`)
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F5F5F5;
}

.header {
  background-color: #FFFFFF;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  font-size: 18px;
  color: #4A90D9;
  margin-right: 16px;
  cursor: pointer;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E5E5;
  border-top-color: #4A90D9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.content {
  padding: 12px;
}

.root-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.root-main {
  margin-bottom: 16px;
}

.root-name {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #4A90D9;
  margin-bottom: 8px;
}

.root-meaning {
  font-size: 15px;
  color: #666666;
}

.root-tip {
  padding: 16px;
  background: linear-gradient(135deg, #F0F7FF, #E8F4FF);
  border-radius: 8px;
  border-left: 4px solid #4A90D9;
}

.tip-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4A90D9;
  margin-bottom: 8px;
}

.tip-text {
  font-size: 14px;
  color: #333333;
  line-height: 1.6;
  margin: 0;
}

.words-section {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
}

.word-count {
  font-size: 13px;
  color: #999999;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.word-item {
  padding: 12px;
  background-color: #F8F9FA;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.word-item:hover {
  background-color: #F0F7FF;
}

.word-info {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.word {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-right: 8px;
}

.phonetic {
  font-size: 13px;
  color: #999999;
}

.definition {
  font-size: 14px;
  color: #666666;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999999;
}
</style>
