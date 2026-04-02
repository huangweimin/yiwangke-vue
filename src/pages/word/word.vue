<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="header">
      <span class="back-btn" @click="goBack">←</span>
      <span class="header-title">单词详情</span>
      <span class="speaker-btn" @click="speakWord">🔊</span>
    </div>
    
    <!-- 单词信息 -->
    <div class="word-info" v-if="word.word">
      <div class="word-main">
        <span class="word-text">{{ word.word }}</span>
        <span class="phonetic">{{ word.phonetic }}</span>
      </div>
      <div class="pos-tag">[{{ word.pos }}]</div>
    </div>
    
    <!-- 释义 -->
    <div class="section" v-if="word.definition">
      <div class="section-title">📖 释义</div>
      <div class="definition">{{ word.definition }}</div>
    </div>
    
    <!-- 词根解析 -->
    <div class="section" v-if="word.roots && word.roots.length">
      <div class="section-title">💡 词根解析</div>
      <div class="roots-list">
        <span 
          class="root-tag" 
          v-for="root in word.roots" 
          :key="root"
          @click="goToRoot(root)"
        >
          {{ root }}
        </span>
      </div>
    </div>
    
    <!-- 家族词汇 -->
    <div class="section" v-if="word.family && word.family.length">
      <div class="section-title">📦 家族词汇</div>
      <div class="family-list">
        <span 
          class="family-word" 
          v-for="fw in word.family" 
          :key="fw"
        >
          {{ fw }}
        </span>
      </div>
    </div>
    
    <!-- 例句 -->
    <div class="section" v-if="word.examples && word.examples.length">
      <div class="section-title">📝 例句</div>
      <div class="example-text">{{ word.examples[0] }}</div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-buttons" v-if="word.word">
      <button class="action-btn secondary" @click="goBack">
        返回
      </button>
      <button class="action-btn primary" @click="startLearn">
        开始学习
      </button>
      <button class="action-btn secondary" @click="addToReview">
        加入复习
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div class="loading" v-if="loading">
      加载中...
    </div>
    
    <!-- 不存在 -->
    <div class="not-found" v-if="!loading && !word.word">
      <p>单词不存在</p>
      <button @click="goBack">返回</button>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      word: {},
      loading: false
    }
  },
  
  mounted() {
    const wordId = this.$route.params.id || this.$route.query.id
    if (wordId) {
      this.loadWord(wordId)
    }
  },
  
  methods: {
    async loadWord(wordId) {
      this.loading = true
      try {
        const data = await api.getWord(wordId)
        this.word = data
      } catch (e) {
        console.error('加载单词失败:', e)
        this.word = {}
      } finally {
        this.loading = false
      }
    },
    
    speakWord() {
      if (!this.word || !this.word.word) return
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(this.word.word)
        utterance.lang = 'en-US'
        utterance.rate = 0.85
        window.speechSynthesis.speak(utterance)
      }
    },
    
    goBack() {
      this.$router.back()
    },
    
    goToRoot(root) {
      this.$router.push(`/root/${root}`)
    },
    
    async startLearn() {
      if (this.word.learn_status === 'learning') {
        alert('已在学习中')
        return
      }
      try {
        await api.learnNewWord({ wordId: this.word.word_id })
        this.word.learn_status = 'learning'
        alert('已加入学习中')
      } catch (e) {
        alert('添加失败')
      }
    },
    
    async addToReview() {
      try {
        await api.addToReview({ wordId: this.word.word_id })
        this.word.learn_status = 'learning'
        alert('已加入复习队列')
      } catch (e) {
        alert('添加失败')
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #FFFFFF;
  padding-bottom: 100px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: #F8F9FA;
  border-bottom: 1px solid #F0F0F0;
}

.back-btn {
  font-size: 24px;
  cursor: pointer;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

.speaker-btn {
  font-size: 24px;
  cursor: pointer;
}

.word-info {
  padding: 32px 20px;
  text-align: center;
  background-color: #F8F9FA;
}

.word-main {
  margin-bottom: 12px;
}

.word-text {
  display: block;
  font-size: 36px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.phonetic {
  font-size: 16px;
  color: #999999;
}

.pos-tag {
  font-size: 14px;
  color: #4A90D9;
}

.section {
  padding: 20px;
  border-bottom: 1px solid #F5F5F5;
}

.section-title {
  font-size: 14px;
  color: #666666;
  margin-bottom: 12px;
}

.definition {
  font-size: 16px;
  color: #333333;
  line-height: 1.6;
}

.roots-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.root-tag {
  padding: 6px 14px;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #FFFFFF;
  font-size: 14px;
  border-radius: 16px;
  cursor: pointer;
}

.family-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.family-word {
  padding: 6px 12px;
  background-color: #E8F4FD;
  color: #4A90D9;
  font-size: 14px;
  border-radius: 4px;
}

.example-text {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  font-style: italic;
  padding: 12px;
  background-color: #F8F9FA;
  border-radius: 8px;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background-color: #FFFFFF;
  border-top: 1px solid #F0F0F0;
}

.action-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 22px;
  font-size: 14px;
  cursor: pointer;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #FFFFFF;
}

.action-btn.secondary {
  background-color: #F5F5F5;
  color: #666666;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #4A90D9;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
