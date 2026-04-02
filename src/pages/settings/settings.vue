<template>
  <div class="container">
    <div class="header">
      <h1 class="title">设置</h1>
    </div>
    
    <div class="settings-list">
      <div class="setting-group">
        <div class="group-title">学习目标</div>
        
        <div class="setting-item">
          <span class="setting-label">每日目标</span>
          <select v-model="settings.dailyGoal" @change="updateDailyGoal">
            <option value="10">10词</option>
            <option value="20">20词</option>
            <option value="30">30词</option>
            <option value="50">50词</option>
          </select>
        </div>
      </div>
      
      <div class="setting-group">
        <div class="group-title">提醒</div>
        
        <div class="setting-item">
          <span class="setting-label">每日提醒</span>
          <label class="switch">
            <input type="checkbox" v-model="reminderEnabled" @change="toggleReminder">
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="setting-item" v-if="reminderEnabled">
          <span class="setting-label">提醒时间</span>
          <input type="time" v-model="settings.reminderTime" @change="updateReminderTime">
        </div>
      </div>
      
      <div class="setting-group">
        <div class="group-title">显示</div>
        
        <div class="setting-item">
          <span class="setting-label">暗黑模式</span>
          <label class="switch">
            <input type="checkbox" v-model="settings.darkMode">
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="setting-item">
          <span class="setting-label">音效</span>
          <label class="switch">
            <input type="checkbox" v-model="settings.soundEnabled">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-group">
        <div class="group-title">数据</div>
        
        <div class="setting-item danger" @click="clearData">
          <span>清除所有数据</span>
        </div>
      </div>
    </div>
    
    <div class="back-btn" @click="goBack">
      <span>‹ 返回</span>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      reminderEnabled: false
    }
  },
  
  computed: {
    ...mapState(['settings'])
  },
  
  watch: {
    'settings.darkMode': {
      handler(newVal) {
        this.applyDarkMode(newVal)
      },
      immediate: true
    }
  },
  
  mounted() {
    // 初始化暗黑模式
    this.applyDarkMode(this.settings.darkMode)
  },
  
  methods: {
    ...mapMutations(['UPDATE_SETTINGS']),
    
    updateDailyGoal() {
      this.UPDATE_SETTINGS({ dailyGoal: Number(this.settings.dailyGoal) })
      this.saveSettings()
    },
    
    toggleReminder() {
      // 提醒功能在网页版暂不开放
      if (this.reminderEnabled) {
        alert('网页版暂不支持每日提醒，请在手机App中使用此功能')
        this.reminderEnabled = false
      }
    },
    
    updateReminderTime() {
      this.UPDATE_SETTINGS({ reminderTime: this.settings.reminderTime })
      this.saveSettings()
    },
    
    saveSettings() {
      localStorage.setItem('settings', JSON.stringify(this.settings))
    },
    
    clearData() {
      if (confirm('确定要清除所有学习数据吗？此操作不可恢复。')) {
        localStorage.clear()
        alert('数据已清除，请刷新页面')
        window.location.reload()
      }
    },
    
    applyDarkMode(enabled) {
      if (enabled) {
        document.body.classList.add('dark-mode')
      } else {
        document.body.classList.remove('dark-mode')
      }
    },
    
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.settings-list {
  padding: 12px;
}

.setting-group {
  background-color: #FFFFFF;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.group-title {
  padding: 12px 16px 8px;
  font-size: 13px;
  color: #999999;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #F0F0F0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.danger {
  color: #F5222D;
  cursor: pointer;
  justify-content: center;
}

.setting-label {
  font-size: 15px;
  color: #333333;
}

select {
  padding: 6px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 14px;
  background: #FFFFFF;
}

input[type="time"] {
  padding: 6px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 14px;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #CCCCCC;
  transition: 0.3s;
  border-radius: 28px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4A90D9;
}

input:checked + .slider:before {
  transform: translateX(20px);
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
