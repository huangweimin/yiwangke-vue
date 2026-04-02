<template>
  <div class="container">
    <div class="header">
      <h1 class="title">📝 帖子详情</h1>
    </div>
    
    <div class="post-content">
      <div class="post-meta">
        <span class="post-title">{{ post.title }}</span>
        <span class="post-date">{{ post.date }}</span>
      </div>
      <div class="post-body">
        {{ post.content }}
      </div>
    </div>
    
    <div class="empty-state">
      <span class="empty-icon">📖</span>
      <span class="empty-text">帖子功能开发中</span>
    </div>
    
    <div class="back-btn" @click="goBack">
      <span>‹ 返回</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      post: {
        id: '',
        title: '帖子详情',
        date: '',
        content: '帖子内容加载中...'
      }
    }
  },
  
  mounted() {
    const postId = this.$route.query.id
    if (postId) {
      this.post.id = postId
    }
  },
  
  methods: {
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
  margin-bottom: 12px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.post-content {
  background-color: #FFFFFF;
  margin: 0 12px 12px;
  padding: 16px;
  border-radius: 12px;
}

.post-meta {
  margin-bottom: 12px;
}

.post-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 4px;
}

.post-date {
  font-size: 12px;
  color: #999999;
}

.post-body {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: #999999;
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
