<template>
  <div class="page">
    <!-- 头部 -->
    <div class="header">
      <h1 class="title">📚 词库</h1>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索单词"
          class="search-input"
          @input="onSearch"
        />
      </div>
    </div>
    
    <!-- 字母分类 -->
    <div class="category-bar">
      <span 
        class="category-letter" 
        :class="{ active: currentCategory === '' }"
        @click="selectCategory('')"
      >全部</span>
      <span 
        v-for="cat in categories" 
        :key="cat.letter"
        class="category-letter"
        :class="{ active: currentCategory === cat.letter }"
        @click="selectCategory(cat.letter)"
      >
        {{ cat.letter }}
      </span>
    </div>
    
    <!-- 状态筛选 -->
    <div class="filter-tabs">
      <div 
        class="filter-tab" 
        :class="{ active: currentFilter === 'all' }"
        @click="currentFilter = 'all'"
      >
        全部
      </div>
      <div 
        class="filter-tab" 
        :class="{ active: currentFilter === 'new' }"
        @click="currentFilter = 'new'"
      >
        未学
      </div>
      <div 
        class="filter-tab" 
        :class="{ active: currentFilter === 'learning' }"
        @click="currentFilter = 'learning'"
      >
        学习中
      </div>
      <div 
        class="filter-tab" 
        :class="{ active: currentFilter === 'mastered' }"
        @click="currentFilter = 'mastered'"
      >
        已掌握
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats-bar">
      <span>共 {{ total }} 词</span>
      <span v-if="hasMore">加载更多...</span>
    </div>
    
    <!-- 单词列表 -->
    <div class="word-list" ref="wordListRef">
      <div 
        class="word-item" 
        v-for="word in displayWords" 
        :key="word.word_id"
      >
        <div class="word-main" @click="showWordDetail(word)">
          <span class="word-text">{{ word.word }}</span>
          <span class="word-phonetic">{{ word.phonetic }}</span>
        </div>
        <div class="word-meta">
          <span class="word-def">{{ word.definition }}</span>
          <div class="word-actions">
            <span class="word-status" :class="word.learn_status">
              {{ getStatusText(word.learn_status) }}
            </span>
            <span class="speaker-btn" @click.stop="speakWord(word)">
              🔊
            </span>
          </div>
        </div>
      </div>
      
      <!-- 加载提示 -->
      <div class="loading-more" v-if="loading">
        <span>加载中...</span>
      </div>
      
      <!-- 空状态 -->
      <div class="empty-state" v-if="!loading && displayWords.length === 0">
        <span class="empty-icon">📭</span>
        <span class="empty-text">暂无单词</span>
      </div>
    </div>
    
    <!-- 单词详情弹窗 -->
    <div class="modal" v-if="selectedWord" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="word-header">
            <span class="word">{{ selectedWord.word }}</span>
            <span class="phonetic">{{ selectedWord.phonetic }}</span>
          </div>
          <div class="header-actions">
            <span class="speaker-btn large" @click="speakWord(selectedWord)">🔊</span>
            <span class="close-btn" @click="closeModal">×</span>
          </div>
        </div>
        
        <div class="modal-body">
          <div class="definition">
            <span class="pos">[{{ selectedWord.pos }}]</span>
            {{ selectedWord.definition }}
          </div>
          
          <div class="section" v-if="selectedWord.roots && selectedWord.roots.length">
            <div class="section-title">💡 词根解析</div>
            <div class="roots-list">
              <span 
                class="root-tag" 
                v-for="root in selectedWord.roots" 
                :key="root"
                @click="goToRoot(root)"
              >
                {{ root }}
              </span>
            </div>
          </div>
          
          <div class="section" v-if="selectedWord.family && selectedWord.family.length">
            <div class="section-title">📦 家族词汇</div>
            <div class="family-list">
              <span 
                class="family-word" 
                v-for="fw in selectedWord.family" 
                :key="fw"
              >
                {{ fw }}
              </span>
            </div>
          </div>
          
          <div class="section" v-if="selectedWord.examples && selectedWord.examples.length">
            <div class="section-title">📝 例句</div>
            <div class="example-text">{{ selectedWord.examples[0] }}</div>
          </div>
          
          <div class="action-buttons">
            <button class="action-btn primary" @click="startLearn(selectedWord)">
              开始学习
            </button>
            <button class="action-btn secondary" @click="addToReview(selectedWord)">
              加入复习
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      searchKeyword: '',
      currentFilter: 'all',
      currentCategory: '',
      categories: [],
      words: [],
      total: 0,
      page: 1,
      limit: 30,
      hasMore: false,
      loading: false,
      scrollLoading: false,
      selectedWord: null
    }
  },
  
  computed: {
    displayWords() {
      if (this.currentFilter === 'all') {
        return this.words
      }
      return this.words.filter(w => w.learn_status === this.currentFilter)
    }
  },
  
  async mounted() {
    await this.loadWords()
    this.loadCategories()
    window.addEventListener('scroll', this.handleScroll)
  },
  
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  
  methods: {
    async loadWords(reset = false) {
      if (this.loading) return
      if (reset) {
        this.page = 1
        this.words = []
      }
      
      this.loading = true
      try {
        const params = {
          page: this.page,
          limit: this.limit
        }
        if (this.searchKeyword) {
          params.search = this.searchKeyword
        }
        if (this.currentCategory) {
          params.category = this.currentCategory
        }
        
        const data = await api.getWords(params)
        
        if (!data) {
          this.words = []
          this.total = 0
          this.hasMore = false
          return
        }
        
        if (reset) {
          this.words = data.words || []
        } else {
          this.words = [...this.words, ...(data.words || [])]
        }
        
        this.total = data.total || 0
        this.hasMore = data.hasMore || false
        this.categories = data.categories || []
        
      } catch (e) {
        console.error('加载单词失败:', e)
      } finally {
        this.loading = false
      }
    },
    
    async loadCategories() {
      try {
        const data = await api.getWords({ limit: 1 })
        this.categories = data?.categories || []
      } catch (e) {
        console.error('加载分类失败:', e)
      }
    },
    
    async loadMore() {
      if (!this.hasMore || this.loading) return
      this.page++
      await this.loadWords()
    },
    
    onSearch() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.loadWords(true)
      }, 300)
    },
    
    selectCategory(letter) {
      this.currentCategory = letter
      this.loadWords(true)
    },
    
    showWordDetail(word) {
      this.selectedWord = word
    },
    
    closeModal() {
      this.selectedWord = null
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
    
    getStatusText(status) {
      const map = {
        not_learned: '未学',
        new: '新词',
        learning: '学习中',
        mastered: '已掌握'
      }
      return map[status] || status
    },
    
    async startLearn(word) {
      // 检查是否已在学习中
      if (word.learn_status === 'learning') {
        alert('已在学习中')
        return
      }
      // 开始学习 +1 今日已学
      try {
        await api.learnNewWord({ wordId: word.word_id })
        word.learn_status = 'learning'
        alert('已加入学习中')
        this.closeModal()
      } catch (e) {
        alert('添加失败')
      }
    },
    
    async addToReview(word) {
      try {
        await api.addToReview({ wordId: word.word_id })
        word.learn_status = 'learning'
        alert('已加入学习中')
        this.closeModal()
      } catch (e) {
        alert('添加失败')
      }
    },
    
    goToRoot(root) {
      this.$router.push(`/root/${root}`)
    },
    
    handleScroll() {
      // 防止重复触发
      if (this.scrollLoading) return
      this.scrollLoading = true
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      
      if (scrollHeight - scrollTop - clientHeight < 100 && this.hasMore && !this.loading) {
        this.loadMore().finally(() => {
          this.scrollLoading = false
        })
      } else {
        this.scrollLoading = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 20px;
}

.header {
  background-color: #FFFFFF;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0 0 12px 0;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #F5F5F5;
  border-radius: 20px;
  padding: 8px 16px;
}

.search-icon {
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

.category-bar {
  background-color: #FFFFFF;
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border-bottom: 1px solid #F0F0F0;
}

.category-letter {
  padding: 4px 8px;
  font-size: 12px;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
}

.category-letter.active {
  background-color: #4A90D9;
  color: #FFFFFF;
}

.filter-tabs {
  background-color: #FFFFFF;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 6px 12px;
  font-size: 13px;
  color: #666;
  background-color: #F5F5F5;
  border-radius: 16px;
  cursor: pointer;
}

.filter-tab.active {
  background-color: #4A90D9;
  color: #FFFFFF;
}

.stats-bar {
  padding: 8px 16px;
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
}

.word-list {
  padding: 12px;
}

.word-item {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 8px;
}

.word-main {
  display: flex;
  align-items: baseline;
  margin-bottom: 6px;
}

.word-text {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-right: 8px;
}

.word-phonetic {
  font-size: 13px;
  color: #999;
}

.word-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-def {
  font-size: 14px;
  color: #666;
  flex: 1;
}

.word-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.word-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.word-status.not_learned,
.word-status.new {
  background-color: #F5F5F5;
  color: #999;
}

.word-status.learning {
  background-color: #FFF7E6;
  color: #FA8C16;
}

.word-status.mastered {
  background-color: #F6FFED;
  color: #52C41A;
}

.speaker-btn {
  font-size: 16px;
  cursor: pointer;
  opacity: 0.7;
}

.speaker-btn:hover {
  opacity: 1;
}

.loading-more {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-height: 85vh;
  background: #FFFFFF;
  border-radius: 16px 16px 0 0;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #F0F0F0;
  position: sticky;
  top: 0;
  background: #FFFFFF;
}

.word-header {
  display: flex;
  flex-direction: column;
}

.word {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.phonetic {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.speaker-btn.large {
  font-size: 28px;
}

.close-btn {
  font-size: 28px;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.definition {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 16px;
}

.pos {
  color: #4A90D9;
  margin-right: 6px;
}

.section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.roots-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.root-tag {
  padding: 6px 12px;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #FFFFFF;
  font-size: 13px;
  border-radius: 16px;
  cursor: pointer;
}

.family-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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
  padding: 12px;
  background-color: #F8F9FA;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #FFFFFF;
}

.action-btn.secondary {
  background-color: #F5F5F5;
  color: #666;
}
</style>
