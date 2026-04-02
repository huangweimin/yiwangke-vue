<template>
  <view class="empty-state">
    <image class="empty-icon" :src="iconPath" mode="aspectFit" v-if="iconPath" />
    <text class="empty-emoji" v-else>{{ icon || '📭' }}</text>
    <text class="empty-title">{{ title || '暂无内容' }}</text>
    <text class="empty-desc" v-if="description">{{ description }}</text>
    <button class="empty-btn" v-if="actionText" @tap="onAction">{{ actionText }}</button>
  </view>
</template>

<script>
export default {
  name: 'EmptyState',
  
  props: {
    icon: {
      type: String,
      default: '📭'
    },
    iconPath: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '暂无内容'
    },
    description: {
      type: String,
      default: ''
    },
    actionText: {
      type: String,
      default: ''
    }
  },
  
  methods: {
    onAction() {
      this.$emit('action')
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
  text-align: center;
}

.empty-icon {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
}

.empty-emoji {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999999;
  line-height: 1.5;
  max-width: 500rpx;
}

.empty-btn {
  margin-top: 32rpx;
  padding: 16rpx 48rpx;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #FFFFFF;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: none;
}
</style>
