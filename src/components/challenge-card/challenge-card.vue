<template>
  <view class="challenge-card" @tap="onClick">
    <view class="card-header">
      <text class="challenge-icon">{{ challenge.icon || '🎯' }}</text>
      <view class="challenge-info">
        <text class="challenge-name">{{ challenge.name }}</text>
        <text class="challenge-desc">{{ challenge.desc || challenge.description }}</text>
      </view>
    </view>
    
    <view class="card-meta">
      <view class="meta-item">
        <text class="meta-icon">⏱</text>
        <text class="meta-text">{{ challenge.duration || challenge.target }}天</text>
      </view>
      <view class="meta-item">
        <text class="meta-icon">🎯</text>
        <text class="meta-text">{{ challenge.dailyGoal || 10 }}词/天</text>
      </view>
    </view>
    
    <view class="card-progress" v-if="showProgress">
      <view class="progress-bar-wrapper">
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: (challenge.progress || 0) + '%' }"></view>
        </view>
        <text class="progress-text">{{ challenge.current || 0 }}/{{ challenge.target || 7 }}天</text>
      </view>
    </view>
    
    <view class="card-footer">
      <view class="participants" v-if="challenge.participants && challenge.participants.length">
        <text class="participant" v-for="(p, i) in challenge.participants.slice(0, 3)" :key="i">{{ p }}</text>
        <text class="participant-more" v-if="challenge.participants.length > 3">+{{ challenge.participants.length - 3 }}</text>
      </view>
      
      <button class="join-btn" v-if="!challenge.joined" @tap.stop="joinChallenge">
        加入
      </button>
      <text class="joined-tag" v-else>已加入</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChallengeCard',
  
  props: {
    challenge: {
      type: Object,
      required: true
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  
  methods: {
    onClick() {
      this.$emit('click', this.challenge)
    },
    
    joinChallenge() {
      this.$emit('join', this.challenge)
    }
  }
}
</script>

<style scoped>
.challenge-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.challenge-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.challenge-info {
  flex: 1;
}

.challenge-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 4rpx;
}

.challenge-desc {
  font-size: 24rpx;
  color: #999999;
}

.card-meta {
  display: flex;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #666666;
}

.card-progress {
  margin-bottom: 16rpx;
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-track {
  flex: 1;
  height: 8rpx;
  background-color: #E5E5E5;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4A90D9, #67AAFF);
  border-radius: 4rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 22rpx;
  color: #999999;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participants {
  display: flex;
  align-items: center;
}

.participant {
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background-color: #4A90D9;
  color: #FFFFFF;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -10rpx;
}

.participant-more {
  font-size: 22rpx;
  color: #999999;
  margin-left: 16rpx;
}

.join-btn {
  padding: 12rpx 32rpx;
  background-color: #4A90D9;
  color: #FFFFFF;
  font-size: 24rpx;
  border-radius: 28rpx;
  border: none;
}

.joined-tag {
  font-size: 24rpx;
  color: #52C41A;
}
</style>
