<template>
  <view class="container">
    <view class="header">
      <text class="word">{{ word.word }}</text>
      <text class="phonetic">{{ word.phonetic }}</text>
    </view>
    
    <view class="content">
      <!-- 词根解析 -->
      <view class="section" v-if="word.roots && word.roots.length">
        <view class="section-title">💡 词根解析</view>
        <view class="roots-list">
          <view class="root-item" v-for="root in word.roots" :key="root">
            <text class="root-name">{{ root }}</text>
            <text class="root-meaning" v-if="getRootMeaning(root)">{{ getRootMeaning(root) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 释义 -->
      <view class="section">
        <view class="section-title">📖 释义</view>
        <view class="definition">
          <text class="pos">[{{ word.pos }}]</text>
          {{ word.definition }}
        </view>
      </view>
      
      <!-- 家族词汇 -->
      <view class="section" v-if="word.family && word.family.length">
        <view class="section-title">📦 家族词汇</view>
        <view class="family-list">
          <text 
            class="family-word" 
            v-for="(w, idx) in word.family" 
            :key="idx"
          >{{ w }}</text>
        </view>
      </view>
      
      <!-- 例句 -->
      <view class="section" v-if="word.examples && word.examples.length">
        <view class="section-title">📝 例句</view>
        <view class="example-list">
          <view class="example-item" v-for="(ex, idx) in word.examples" :key="idx">
            {{ ex }}
          </view>
        </view>
      </view>
      
      <!-- 搭配 -->
      <view class="section" v-if="word.collocations && word.collocations.length">
        <view class="section-title">🔗 搭配</view>
        <view class="collocations-list">
          <text 
            class="collocation" 
            v-for="(col, idx) in word.collocations" 
            :key="idx"
          >{{ col }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部操作 -->
    <view class="footer">
      <button class="share-btn" @tap="shareWord">
        <text>📤 分享</text>
      </button>
      <button class="add-btn" @tap="addToNewWords">
        <text>📝 加入生词本</text>
      </button>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      word: {}
    }
  },
  
  computed: {
    ...mapState(['roots'])
  },
  
  onLoad(options) {
    const wordId = options.id
    if (wordId) {
      this.loadWord(wordId)
    }
  },
  
  methods: {
    loadWord(wordId) {
      const word = this.$store.state.words.find(w => w.word_id === wordId)
      if (word) {
        this.word = word
      } else {
        alert('单词不存在')
        this.$router.back()
      }
    },
    
    getRootMeaning(root) {
      const rootData = this.roots.find(r => r.root === root)
      return rootData ? `${rootData.meaning}（${rootData.origin}）` : ''
    },
    
    shareWord() {
      alert('功能开发中')
    },
    
    addToNewWords() {
      alert('已加入生词本')
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #FFFFFF;
}

.header {
  padding: 32px 20px;
  text-align: center;
  background-color: #F8F9FA;
}

.word {
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

.content {
  padding: 20px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  color: #666666;
  margin-bottom: 12px;
}

.roots-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.root-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.root-name {
  padding: 6px 12px;
  background-color: #4A90D9;
  color: #FFFFFF;
  font-size: 14px;
  border-radius: 16px;
}

.root-meaning {
  font-size: 14px;
  color: #666666;
}

.definition {
  font-size: 16px;
  color: #333333;
  line-height: 1.6;
}

.pos {
  color: #4A90D9;
  margin-right: 8px;
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

.example-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.example-item {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  font-style: italic;
  padding-left: 12px;
  border-left: 3px solid #E5E5E5;
}

.collocations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.collocation {
  padding: 4px 10px;
  background-color: #F5F5F5;
  color: #666666;
  font-size: 13px;
  border-radius: 4px;
}

.footer {
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

.share-btn,
.add-btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-btn {
  background-color: #F5F5F5;
  color: #333333;
}

.add-btn {
  background-color: #4A90D9;
  color: #FFFFFF;
}
</style>
