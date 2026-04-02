<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <span class="logo">📚</span>
        <h1 class="title">遗忘客</h1>
        <p class="subtitle">托福2000词·词根穿透记忆</p>
      </div>
      
      <div class="login-form">
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'"
          >登录</button>
          <button 
            class="tab" 
            :class="{ active: mode === 'register' }"
            @click="mode = 'register'"
          >注册</button>
        </div>
        
        <div class="input-group" v-if="mode === 'register'">
          <label class="label">昵称</label>
          <input 
            class="input" 
            v-model="form.nickname" 
            placeholder="给自己起个名字"
          />
        </div>
        
        <div class="input-group">
          <label class="label">邮箱</label>
          <input 
            class="input" 
            v-model="form.email" 
            type="email"
            placeholder="输入邮箱"
          />
        </div>
        
        <div class="input-group">
          <label class="label">密码</label>
          <div class="password-wrapper">
            <input 
              class="input" 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="输入密码"
            />
            <span class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </span>
          </div>
        </div>
        
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        
        <button class="submit-btn" @click="submit" :disabled="loading">
          <span v-if="loading">处理中...</span>
          <span v-else>{{ mode === 'login' ? '登 录' : '注 册' }}</span>
        </button>
        
        <div class="skip" @click="goHome">
          <span>稍后再说 ›</span>
        </div>
      </div>
    </div>
    
    <!-- Toast 通知 -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      mode: 'login',
      loading: false,
      showPassword: false,
      errorMsg: '',
      form: {
        nickname: '',
        email: '',
        password: ''
      },
      toast: {
        show: false,
        message: '',
        type: ''
      }
    }
  },
  
  mounted() {
    const token = localStorage.getItem('token')
    if (token) {
      this.$router.push('/')
    }
  },
  
  methods: {
    showToast(message, type = 'info') {
      this.toast = { show: true, message, type }
      setTimeout(() => {
        this.toast.show = false
      }, 2000)
    },
    
    async submit() {
      if (this.loading) return
      
      if (!this.form.email) {
        this.errorMsg = '请输入邮箱'
        return
      }
      if (!this.form.password) {
        this.errorMsg = '请输入密码'
        return
      }
      if (this.mode === 'register' && !this.form.nickname) {
        this.errorMsg = '请输入昵称'
        return
      }
      
      this.errorMsg = ''
      this.loading = true
      
      try {
        let res
        if (this.mode === 'login') {
          res = await api.login({
            email: this.form.email,
            password: this.form.password
          })
        } else {
          res = await api.register({
            nickname: this.form.nickname,
            email: this.form.email,
            password: this.form.password
          })
        }
        
        localStorage.setItem('token', res.token)
        localStorage.setItem('userInfo', JSON.stringify(res.user))
        
        this.showToast(this.mode === 'login' ? '登录成功' : '注册成功', 'success')
        
        setTimeout(() => {
          this.$router.push('/')
        }, 1000)
        
      } catch (e) {
        console.error('提交失败:', e)
        this.errorMsg = e.error || '请求失败，请重试'
      } finally {
        this.loading = false
      }
    },
    
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #4A90D9 0%, #67AAFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 380px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 64px;
  display: block;
  margin-bottom: 12px;
}

.title {
  font-size: 32px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.login-form {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.tabs {
  display: flex;
  margin-bottom: 24px;
  background: #F5F5F5;
  border-radius: 8px;
  padding: 4px;
}

.tab {
  flex: 1;
  padding: 10px 0;
  font-size: 15px;
  color: #666666;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background-color: #FFFFFF;
  color: #4A90D9;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 16px;
}

.label {
  display: block;
  font-size: 14px;
  color: #333333;
  margin-bottom: 6px;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 44px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #4A90D9;
}

.password-wrapper {
  position: relative;
}

.password-wrapper .input {
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  cursor: pointer;
  opacity: 0.6;
}

.toggle-password:hover {
  opacity: 1;
}

.error-msg {
  color: #F5222D;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  height: 46px;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #FFFFFF;
  border-radius: 23px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  margin-top: 8px;
}

.submit-btn:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn[disabled] {
  background: #CCCCCC;
  cursor: not-allowed;
  transform: none;
}

.skip {
  text-align: center;
  margin-top: 16px;
  cursor: pointer;
}

.skip span {
  font-size: 13px;
  color: #999999;
}

.skip:hover span {
  color: #666666;
}

/* Toast 动画 */
.toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  color: #FFFFFF;
}

.toast.success {
  background-color: #52C41A;
}

.toast.error {
  background-color: #F5222D;
}

.toast.info {
  background-color: #1890FF;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
