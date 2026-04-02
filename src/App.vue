<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 暗黑模式变量 */
body.dark-mode {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --card-bg: #2d2d2d;
  --border-color: #404040;
  --primary-color: #4A90D9;
}

/* 暗黑模式全局样式 */
body.dark-mode {
  background-color: #1a1a1a !important;
  color: #e0e0e0 !important;
}

body.dark-mode .container,
body.dark-mode .header,
body.dark-mode .content,
body.dark-mode .settings-list,
body.dark-mode .setting-group,
body.dark-mode .word-card,
body.dark-mode .post-card,
body.dark-mode .rank-item,
body.dark-mode .calendar-section,
body.dark-mode .records-section,
body.dark-mode .challenge-card,
body.dark-mode .tab-bar {
  background-color: #2d2d2d !important;
  color: #e0e0e0 !important;
}

body.dark-mode .title,
body.dark-mode .setting-label,
body.dark-mode .username,
body.dark-mode .word,
body.dark-mode .definition,
body.dark-mode .challenge-name {
  color: #e0e0e0 !important;
}

body.dark-mode .group-title,
body.dark-mode .post-time,
body.dark-mode .phonetic,
body.dark-mode .challenge-desc {
  color: #999 !important;
}

body.dark-mode select,
body.dark-mode input[type="time"],
body.dark-mode input[type="text"],
body.dark-mode textarea {
  background-color: #3d3d3d !important;
  color: #e0e0e0 !important;
  border-color: #404040 !important;
}

body.dark-mode .back-btn {
  background: linear-gradient(135deg, #4A90D9, #67AAFF);
  color: #fff;
}

body.dark-mode .tab-bar {
  border-top-color: #404040;
}

body.dark-mode .tab-text {
  color: #999;
}

body.dark-mode .tab-item.active .tab-text {
  color: #4A90D9;
}

body.dark-mode .progress-bar {
  background-color: #404040;
}

body.dark-mode .root-tag {
  background: linear-gradient(135deg, #4A6FA5, #5B8FB9);
}

body.dark-mode .family-word,
body.dark-mode .filter-tag {
  background-color: #3d3d3d;
  color: #67AAFF;
}

body.dark-mode .publish-btn {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #999;
}

body.dark-mode .post-type.share {
  background-color: #1a3a5c;
  color: #67AAFF;
}

body.dark-mode .post-type.checkin {
  background-color: #3d2d1a;
  color: #FA8C16;
}

body.dark-mode .post-type.note {
  background-color: #1a3a1a;
  color: #52C41A;
}

body.dark-mode .rank-item.top3 {
  background: linear-gradient(135deg, #2d2d1a, #3d3d2a) !important;
}
</style>
