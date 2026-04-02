<template>
  <div class="page">
    <div class="header">
      <h1 class="title">💬 社区</h1>
    </div>
    
    <!-- 标签栏 -->
    <div class="tabs">
      <div 
        class="tab" 
        :class="{ active: currentTab === 'dynamic' }"
        @click="switchTab('dynamic')"
      >
        动态
      </div>
      <div 
        class="tab" 
        :class="{ active: currentTab === 'leaderboard' }"
        @click="switchTab('leaderboard')"
      >
        排行榜
      </div>
    </div>
    
    <div class="content">
      <!-- 动态列表 -->
      <div v-if="currentTab === 'dynamic'" class="dynamic-list">
        <div class="publish-section">
          <button class="publish-btn" @click="showPublishModal = true">
            📝 发个动态，记录学习心得
          </button>
        </div>
        
        <div class="filter-tabs">
          <span 
            class="filter-tag" 
            :class="{ active: filterType === 'all' }"
            @click="filterType = 'all'; loadPosts()"
          >全部</span>
          <span 
            class="filter-tag" 
            :class="{ active: filterType === 'checkin' }"
            @click="filterType = 'checkin'; loadPosts()"
          >打卡</span>
          <span 
            class="filter-tag" 
            :class="{ active: filterType === 'note' }"
            @click="filterType = 'note'; loadPosts()"
          >笔记</span>
        </div>
        
        <div class="posts-list">
          <div class="post-card" v-for="post in posts" :key="post.id">
            <div class="post-header">
              <div class="user-info">
                <div class="avatar">{{ post.username?.charAt(0) || 'U' }}</div>
                <div class="user-detail">
                  <span class="username">{{ post.username }}</span>
                  <span class="post-time">{{ formatTime(post.created_at) }}</span>
                </div>
              </div>
              <span class="post-type" :class="post.post_type">
                {{ postTypeText(post.post_type) }}
              </span>
            </div>
            
            <div class="post-content">{{ post.content }}</div>
            
            <div class="post-actions">
              <span 
                class="action-btn" 
                :class="{ liked: post.is_liked }"
                @click="toggleLike(post)"
              >
                {{ post.is_liked ? '❤️' : '🤍' }} {{ post.like_count }}
              </span>
              <span 
                class="action-btn"
                :class="{ active: expandedPostId === post.id }"
                @click="toggleComments(post)"
              >
                💬 {{ post.comment_count || 0 }}
              </span>
            </div>
            
            <!-- 评论列表 -->
            <div class="comments-section" v-if="expandedPostId === post.id">
              <div class="comments-list">
                <div class="comment-item" v-for="comment in postComments[post.id]" :key="comment.id">
                  <div class="comment-header">
                    <span class="comment-user">{{ comment.username }}</span>
                    <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
                    <span 
                      class="comment-delete" 
                      v-if="comment.is_mine"
                      @click="deleteComment(post.id, comment.id)"
                    >删除</span>
                  </div>
                  <div class="comment-content">{{ comment.content }}</div>
                </div>
                <div class="empty-comments" v-if="!postComments[post.id] || postComments[post.id].length === 0">
                  暂无评论
                </div>
              </div>
              
              <!-- 评论输入框 -->
              <div class="comment-input-section">
                <input 
                  type="text" 
                  v-model="commentInputs[post.id]" 
                  class="comment-input"
                  placeholder="写下你的评论..."
                  @keyup.enter="submitComment(post.id)"
                />
                <button class="comment-submit-btn" @click="submitComment(post.id)">发送</button>
              </div>
            </div>
          </div>
          
          <div class="empty-posts" v-if="posts.length === 0">
            <span>还没有动态，快来发布第一条吧！</span>
          </div>
        </div>
      </div>
      
      <!-- 排行榜 -->
      <div v-if="currentTab === 'leaderboard'" class="leaderboard">
        <div class="rank-tabs">
          <span 
            class="rank-tab" 
            :class="{ active: rankType === 'streak' }"
            @click="rankType = 'streak'; loadLeaderboard()"
          >🔥 连续学习</span>
          <span 
            class="rank-tab" 
            :class="{ active: rankType === 'words' }"
            @click="rankType = 'words'; loadLeaderboard()"
          >📚 掌握词数</span>
          <span 
            class="rank-tab" 
            :class="{ active: rankType === 'checkin' }"
            @click="rankType = 'checkin'; loadLeaderboard()"
          >✅ 打卡次数</span>
        </div>
        
        <div class="rank-list">
          <div 
            class="rank-item" 
            v-for="(user, index) in leaderboard" 
            :key="user.id"
            :class="{ top3: index < 3 }"
          >
            <div class="rank-left">
              <span class="rank-num" v-if="index >= 3">{{ index + 1 }}</span>
              <span class="rank-medal" v-else-if="index === 0">🥇</span>
              <span class="rank-medal" v-else-if="index === 1">🥈</span>
              <span class="rank-medal" v-else-if="index === 2">🥉</span>
              <div class="rank-avatar">{{ user.username?.charAt(0) || 'U' }}</div>
              <span class="rank-username">{{ user.username }}</span>
            </div>
            <div class="rank-right">
              <span class="rank-value">
                {{ rankType === 'streak' ? user.streak + '天' : '' }}
                {{ rankType === 'words' ? user.wordsLearned + '词' : '' }}
                {{ rankType === 'checkin' ? user.checkins + '次' : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 发布弹窗 -->
    <div class="modal-overlay" v-if="showPublishModal" @click="showPublishModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span class="modal-title">发布动态</span>
          <span class="modal-close" @click="showPublishModal = false">×</span>
        </div>
        <div class="modal-body">
          <textarea 
            v-model="newPostContent" 
            class="post-input" 
            placeholder="分享你的学习心得..."
            rows="4"
          ></textarea>
          <div class="type-select">
            <label>
              <input type="radio" v-model="newPostType" value="share"> 📝 分享
            </label>
            <label>
              <input type="radio" v-model="newPostType" value="note"> 📖 笔记
            </label>
            <label>
              <input type="radio" v-model="newPostType" value="checkin"> ✅ 打卡
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showPublishModal = false">取消</button>
          <button class="publish-confirm-btn" @click="publishPost">发布</button>
        </div>
      </div>
    </div>
    
    <!-- 底部导航 -->
    <div class="tab-bar">
      <div class="tab-item" @click="$router.push('/')">
        <span class="tab-icon">🏠</span>
        <span class="tab-text">首页</span>
      </div>
      <div class="tab-item" @click="$router.push('/library')">
        <span class="tab-icon">📚</span>
        <span class="tab-text">词库</span>
      </div>
      <div class="tab-item active">
        <span class="tab-icon">💬</span>
        <span class="tab-text">社区</span>
      </div>
      <div class="tab-item" @click="$router.push('/mine')">
        <span class="tab-icon">👤</span>
        <span class="tab-text">我的</span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      currentTab: 'dynamic',
      filterType: 'all',
      rankType: 'streak',
      posts: [],
      leaderboard: [],
      showPublishModal: false,
      newPostContent: '',
      newPostType: 'share',
      expandedPostId: null,
      postComments: {},
      commentInputs: {}
    }
  },
  
  async mounted() {
    await this.loadPosts()
    await this.loadLeaderboard()
  },
  
  methods: {
    async loadPosts() {
      try {
        const params = {}
        if (this.filterType !== 'all') {
          params.type = this.filterType
        }
        this.posts = await api.getPosts(params)
      } catch (e) {
        console.error('加载动态失败:', e)
      }
    },
    
    async loadLeaderboard() {
      try {
        this.leaderboard = await api.getLeaderboard({ type: this.rankType })
      } catch (e) {
        console.error('加载排行榜失败:', e)
      }
    },
    
    switchTab(tab) {
      this.currentTab = tab
    },
    
    async toggleLike(post) {
      try {
        const result = await api.toggleLike(post.id)
        post.is_liked = result.liked
        post.like_count += result.liked ? 1 : -1
      } catch (e) {
        console.error('点赞失败:', e)
      }
    },
    
    async toggleComments(post) {
      if (this.expandedPostId === post.id) {
        this.expandedPostId = null
        return
      }
      this.expandedPostId = post.id
      if (!this.postComments[post.id]) {
        await this.loadComments(post.id)
      }
    },
    
    async loadComments(postId) {
      try {
        const comments = await api.getComments(postId)
        this.postComments[postId] = comments
      } catch (e) {
        console.error('加载评论失败:', e)
      }
    },
    
    async submitComment(postId) {
      const content = this.commentInputs[postId]
      if (!content || !content.trim()) {
        return
      }
      try {
        await api.addComment(postId, { content })
        this.commentInputs[postId] = ''
        await this.loadComments(postId)
        // 更新评论数
        const post = this.posts.find(p => p.id === postId)
        if (post) {
          post.comment_count = (post.comment_count || 0) + 1
        }
      } catch (e) {
        console.error('评论失败:', e)
        alert('评论失败，请重试')
      }
    },
    
    async deleteComment(postId, commentId) {
      if (!confirm('确定删除这条评论？')) return
      try {
        await api.deleteComment(commentId)
        await this.loadComments(postId)
        // 更新评论数
        const post = this.posts.find(p => p.id === postId)
        if (post && post.comment_count > 0) {
          post.comment_count--
        }
      } catch (e) {
        console.error('删除评论失败:', e)
        alert('删除失败，请重试')
      }
    },
    
    async publishPost() {
      if (!this.newPostContent.trim()) {
        alert('请输入内容')
        return
      }
      
      try {
        await api.createPost({
          content: this.newPostContent,
          postType: this.newPostType
        })
        this.showPublishModal = false
        this.newPostContent = ''
        this.newPostType = 'share'
        await this.loadPosts()
        alert('发布成功！')
      } catch (e) {
        console.error('发布失败:', e)
        alert('发布失败，请重试')
      }
    },
    
    postTypeText(type) {
      const map = {
        checkin: '打卡',
        note: '笔记',
        share: '分享'
      }
      return map[type] || type
    },
    
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 80px;
}

.header {
  background-color: #FFFFFF;
  padding: 16px 20px;
  text-align: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.tabs {
  display: flex;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  position: relative;
}

.tab.active {
  color: #4A90D9;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background-color: #4A90D9;
  border-radius: 2px;
}

.content {
  padding: 12px;
}

/* 发布区域 */
.publish-section {
  margin-bottom: 12px;
}

.publish-btn {
  width: 100%;
  padding: 12px 16px;
  background-color: #FFFFFF;
  border: 1px dashed #D9D9D9;
  border-radius: 8px;
  font-size: 14px;
  color: #999;
  text-align: left;
  cursor: pointer;
}

.publish-btn:hover {
  border-color: #4A90D9;
  color: #4A90D9;
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-tag {
  padding: 6px 12px;
  background-color: #FFFFFF;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.filter-tag.active {
  background-color: #4A90D9;
  color: #FFFFFF;
}

/* 动态卡片 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  margin-right: 10px;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-type {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.post-type.checkin {
  background-color: #FFF7E6;
  color: #FA8C16;
}

.post-type.note {
  background-color: #F6FFED;
  color: #52C41A;
}

.post-type.share {
  background-color: #E6F7FF;
  color: #1890FF;
}

.post-content {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}

.post-actions {
  display: flex;
  gap: 24px;
}

.action-btn {
  font-size: 13px;
  color: #999;
  cursor: pointer;
}

.action-btn.liked {
  color: #FF4D4F;
}

.empty-posts {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

/* 评论区域 */
.comments-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #F0F0F0;
}

.comments-list {
  max-height: 200px;
  overflow-y: auto;
}

.comment-item {
  padding: 8px 0;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.comment-user {
  font-size: 13px;
  font-weight: 500;
  color: #4A90D9;
  margin-right: 8px;
}

.comment-time {
  font-size: 12px;
  color: #999;
  flex: 1;
}

.comment-delete {
  font-size: 12px;
  color: #FF4D4F;
  cursor: pointer;
}

.comment-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.empty-comments {
  text-align: center;
  padding: 12px;
  color: #999;
  font-size: 13px;
}

.comment-input-section {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.comment-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 18px;
  font-size: 14px;
  outline: none;
}

.comment-input:focus {
  border-color: #4A90D9;
}

.comment-submit-btn {
  padding: 8px 16px;
  background-color: #4A90D9;
  color: #FFFFFF;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
}

/* 排行榜 */
.rank-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.rank-tab {
  flex: 1;
  text-align: center;
  padding: 8px;
  background-color: #FFFFFF;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.rank-tab.active {
  background-color: #4A90D9;
  color: #FFFFFF;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #FFFFFF;
  border-radius: 8px;
}

.rank-item.top3 {
  background: linear-gradient(135deg, #FFF7E6, #FFF2E8);
}

.rank-left {
  display: flex;
  align-items: center;
}

.rank-num {
  width: 24px;
  font-size: 14px;
  color: #999;
  text-align: center;
}

.rank-medal {
  width: 24px;
  font-size: 16px;
  text-align: center;
}

.rank-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin: 0 10px;
}

.rank-username {
  font-size: 14px;
  color: #333;
}

.rank-value {
  font-size: 14px;
  font-weight: 500;
  color: #4A90D9;
}

/* 发布弹窗 */
.modal-overlay {
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
  background: #FFFFFF;
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #E5E5E5;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 16px 20px;
}

.post-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 15px;
  resize: none;
  margin-bottom: 12px;
}

.post-input:focus {
  outline: none;
  border-color: #4A90D9;
}

.type-select {
  display: flex;
  gap: 16px;
}

.type-select label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.type-select input {
  margin-right: 6px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #E5E5E5;
}

.cancel-btn {
  flex: 1;
  padding: 10px;
  background-color: #F5F5F5;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  color: #666;
  cursor: pointer;
}

.publish-confirm-btn {
  flex: 1;
  padding: 10px;
  background-color: #4A90D9;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  color: #FFFFFF;
  cursor: pointer;
}

/* 底部导航 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background-color: #FFFFFF;
  border-top: 1px solid #E5E5E5;
  padding: 8px 0;
  padding-bottom: env(safe-area-inset-bottom, 8px);
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.tab-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.tab-text {
  font-size: 11px;
  color: #999999;
}

.tab-item.active .tab-text {
  color: #4A90D9;
}
</style>
