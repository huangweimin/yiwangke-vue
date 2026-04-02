<template>
  <view class="progress-bar-wrapper">
    <view class="progress-bar" :style="{ height: height + 'rpx', backgroundColor: trackColor }">
      <view 
        class="progress-fill" 
        :style="{ 
          width: percentage + '%', 
          backgroundColor: fillColor,
          borderRadius: height + 'rpx'
        }"
      ></view>
    </view>
    <text class="progress-text" v-if="showText">{{ percentage }}%</text>
  </view>
</template>

<script>
export default {
  name: 'ProgressBar',
  
  props: {
    percentage: {
      type: Number,
      default: 0,
      validator: val => val >= 0 && val <= 100
    },
    height: {
      type: Number,
      default: 8
    },
    fillColor: {
      type: String,
      default: '#4A90D9'
    },
    trackColor: {
      type: String,
      default: '#E5E5E5'
    },
    showText: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.progress-bar-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.progress-bar {
  flex: 1;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  margin-left: 16rpx;
  font-size: 24rpx;
  color: #666666;
  min-width: 80rpx;
  text-align: right;
}
</style>
