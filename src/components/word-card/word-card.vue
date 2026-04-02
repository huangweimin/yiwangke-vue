<template>
  <view class="word-card" @tap="onClick">
    <view class="card-header">
      <text class="word">{{ word }}</text>
      <text class="phonetic">{{ phonetic }}</text>
    </view>
    
    <view class="card-body">
      <text class="definition" v-if="showDefinition">{{ definition }}</text>
      <view class="roots-preview" v-if="roots && roots.length">
        <text class="root-tag" v-for="root in roots.slice(0, 2)" :key="root">{{ root }}</text>
      </view>
    </view>
    
    <view class="card-footer">
      <text class="status-tag" :class="status">{{ statusText }}</text>
      <text class="next-review" v-if="nextReview">下次: {{ nextReviewText }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'WordCard',
  
  props: {
    word: {
      type: String,
      required: true
    },
    phonetic: {
      type: String,
      default: ''
    },
    definition: {
      type: String,
      default: ''
    },
    roots: {
      type: Array,
      default: () => []
    },
    status: {
      type: String,
      default: 'new' // new | learning | mastered
    },
    nextReview: {
      type: String,
      default: ''
    },
    showDefinition: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    statusText() {
      const map = {
        new: '新词',
        learning: '学习中',
        mastered: '已掌握'
      }
      return map[this.status] || '新词'
    },
    
    nextReviewText() {
      if (!this.nextReview) return ''
      const date = new Date(this.nextReview)
      const now = new Date()
      const diff = date - now
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      
      if (days <= 0) return '待复习'
      if (days === 1) return '明天'
      return `${days}天后`
    }
  },
  
  methods: {
    onClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.word-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
}

.word {
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin-right: 8px;
}

.phonetic {
  font-size: 12px;
  color: #999999;
}

.card-body {
  margin-bottom: 12px;
}

.definition {
  font-size: 14px;
  color: #666666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.roots-preview {
  display: flex;
  gap: 6px;
}

.root-tag {
  font-size: 11px;
  padding: 2px 8px;
  background-color: #E8F4FD;
  color: #4A90D9;
  border-radius: 10px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.status-tag.new {
  background-color: #F5F5F5;
  color: #999999;
}

.status-tag.learning {
  background-color: #FFF7E6;
  color: #FA8C16;
}

.status-tag.mastered {
  background-color: #F6FFED;
  color: #52C41A;
}

.next-review {
  font-size: 11px;
  color: #999999;
}
</style>
