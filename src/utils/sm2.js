/**
 * SM-2 间隔重复算法变体
 * 用于计算单词的最佳复习间隔
 * 
 * @param {Object} record - 用户学习记录
 * @param {number} quality - 评分: 0=忘记, 1=模糊, 2=记住
 * @returns {Object} 更新后的记录
 */
function calculateNextReview(record, quality) {
  let { ease_factor = 2.5, interval = 0, correct_count = 0 } = record

  if (quality === 0) {
    // 忘记：重置，1分钟后重新出现
    interval = 0 // 立即复习
    correct_count = 0
  } else if (quality === 1) {
    // 模糊：缩短间隔
    interval = Math.max(1, Math.floor(interval * 0.5))
  } else {
    // 记住：延长间隔
    correct_count++
    if (correct_count === 1) {
      interval = 1
    } else if (correct_count === 2) {
      interval = 3
    } else {
      interval = Math.round(interval * ease_factor)
    }
    // 调整难度因子
    ease_factor = Math.max(1.3, ease_factor + (quality === 2 ? 0.1 : -0.2))
  }

  const now = new Date()
  let next_review_at

  if (quality === 0) {
    // 忘记：1分钟后
    next_review_at = new Date(now.getTime() + 1 * 60 * 1000)
  } else {
    // 其他：N天后
    next_review_at = addDays(now, interval)
  }

  return {
    ease_factor: Math.round(ease_factor * 100) / 100,
    interval,
    correct_count,
    next_review_at: next_review_at.toISOString(),
    status: correct_count >= 3 ? 'mastered' : 'learning'
  }
}

/**
 * 添加天数
 */
function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 检查是否需要复习
 */
function needsReview(record) {
  if (!record.next_review_at) return true
  return new Date(record.next_review_at) <= new Date()
}

/**
 * 获取今日需要复习的单词列表
 * @param {Array} records - 用户所有学习记录
 * @returns {Array} 需要复习的记录
 */
function getDueReviews(records) {
  return records.filter(record => needsReview(record))
}

/**
 * 获取今日应学习的新词数量
 * @param {Object} settings - 用户设置
 * @param {number} reviewedToday - 今日已复习词数
 * @returns {number} 新词数量
 */
function getDailyNewWords(settings, reviewedToday = 0) {
  const dailyGoal = settings.dailyGoal || 20
  const remaining = dailyGoal - reviewedToday
  return Math.max(0, Math.min(remaining, 5)) // 最多5个新词/天
}

export {
  calculateNextReview,
  addDays,
  needsReview,
  getDueReviews,
  getDailyNewWords
}
