<template>
  <!-- 分享卡片组件 - 用于生成单词图片分享 -->
  <view class="share-card-wrapper">
    <!-- 隐藏的 Canvas 用于绘制 -->
    <canvas 
      canvas-id="shareCard" 
      id="shareCard" 
      class="card-canvas"
      :style="{ width: cardWidth + 'px', height: cardHeight + 'px' }"
    ></canvas>
    
    <!-- 预览区域 -->
    <view class="preview-area" v-if="showPreview">
      <image :src="previewUrl" class="preview-image" mode="aspectFit"></image>
      <view class="preview-actions">
        <button class="action-btn" @tap="saveToAlbum">保存图片</button>
        <button class="action-btn primary" @tap="shareToFriend">分享给好友</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShareCard',
  
  props: {
    wordData: {
      type: Object,
      required: true
    },
    template: {
      type: Object,
      default() {
        return {
          bgColor: '#FFFFFF',
          textColor: '#333333',
          accentColor: '#4A90D9'
        }
      }
    }
  },
  
  data() {
    return {
      cardWidth: 300,
      cardHeight: 400,
      previewUrl: '',
      showPreview: false
    }
  },
  
  methods: {
    /**
     * 生成分享卡片
     * @param {string} templateType - 模板类型：default/pink/green/dark/minimal
     */
    generateCard(templateType = 'default') {
      const templates = {
        default: { bgColor: '#FFFFFF', textColor: '#333333', accentColor: '#4A90D9' },
        pink: { bgColor: '#FFF5F5', textColor: '#333333', accentColor: '#F50057' },
        green: { bgColor: '#F6FFED', textColor: '#333333', accentColor: '#52C41A' },
        dark: { bgColor: '#1A1A1A', textColor: '#E5E5E5', accentColor: '#67AAFF' },
        minimal: { bgColor: '#F8F9FA', textColor: '#333333', accentColor: '#999999' }
      }
      
      const tpl = templates[templateType] || templates.default
      
      const ctx = console.log('createCanvasContext not available on web')
      
      // 绘制背景
      ctx.setFillStyle(tpl.bgColor)
      ctx.fillRect(0, 0, this.cardWidth, this.cardHeight)
      
      // 绘制装饰线
      ctx.setStrokeStyle(tpl.accentColor)
      ctx.setLineWidth(2)
      ctx.moveTo(20, 60)
      ctx.lineTo(100, 60)
      ctx.stroke()
      
      // 绘制单词
      ctx.setFontSize(36)
      ctx.setFillStyle(tpl.textColor)
      ctx.fillText(this.wordData.word, 20, 110)
      
      // 绘制音标
      ctx.setFontSize(14)
      ctx.setFillStyle('#999999')
      ctx.fillText(this.wordData.phonetic, 20, 140)
      
      // 绘制词根
      if (this.wordData.roots && this.wordData.roots.length) {
        ctx.setFontSize(14)
        ctx.setFillStyle(tpl.accentColor)
        const rootsText = '💡 ' + this.wordData.roots.join(' + ')
        ctx.fillText(rootsText, 20, 180)
      }
      
      // 绘制释义
      if (this.wordData.pos || this.wordData.definition) {
        ctx.setFontSize(14)
        ctx.setFillStyle(tpl.textColor)
        const defText = (this.wordData.pos ? '[' + this.wordData.pos + '] ' : '') + this.wordData.definition
        ctx.fillText(defText, 20, 220)
      }
      
      // 绘制例句
      if (this.wordData.examples && this.wordData.examples.length) {
        ctx.setFontSize(12)
        ctx.setFillStyle('#666666')
        const example = this.wordData.examples[0]
        // 换行处理
        const maxWidth = this.cardWidth - 40
        const lines = this.wrapText(ctx, example, maxWidth)
        let y = 260
        lines.forEach(line => {
          ctx.fillText(line, 20, y)
          y += 18
        )
      }
      
      // 绘制分隔线
      ctx.setStrokeStyle('#E5E5E5')
      ctx.setLineWidth(1)
      ctx.moveTo(20, 340)
      ctx.lineTo(this.cardWidth - 20, 340)
      ctx.stroke()
      
      // 绘制水印
      ctx.setFontSize(10)
      ctx.setFillStyle('#CCCCCC')
      ctx.fillText('🏆 遗忘客·每天10分钟', 20, 365)
      ctx.fillText('托福2000词·词根穿透记忆', 20, 382)
      
      // 执行绘制
      ctx.draw()
      
      // 导出图片
      setTimeout(() => {
        console.log({
          canvasId: 'shareCard',
          success: (res) => {
            this.previewUrl = res.tempFilePath
            this.showPreview = true
            this.$emit('onGenerated', res.tempFilePath)
          },
          fail: (err) => {
            console.error('生成卡片失败:', err)
            this.$emit('onError', err)
          }
        }, this)
      }, 300)
    },
    
    /**
     * 文本换行处理
     */
    wrapText(ctx, text, maxWidth) {
      const chars = text.split('')
      let lines = []
      let currentLine = ''
      
      chars.forEach(char => {
        const testLine = currentLine + char
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = char
        } else {
          currentLine = testLine
        }
      )
      
      if (currentLine) {
        lines.push(currentLine)
      }
      
      return lines.slice(0, 3) // 最多3行
    },
    
    /**
     * 保存到相册
     */
    saveToAlbum() {
      console.log({
        filePath: this.previewUrl,
        success: () => {
          alert(
            title: '保存成功',
            icon: 'success'
          )
        },
        fail: (err) => {
          console.error('保存失败:', err)
          alert(
            title: '保存失败',
            icon: 'none'
          )
        }
      )
    },
    
    /**
     * 分享给好友
     */
    shareToFriend() {
      // #ifdef MP-WEIXIN
      console.log({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 'image',
        imageUrl: this.previewUrl,
        success: () => {
          alert(
            title: '分享成功',
            icon: 'success'
          )
        },
        fail: () => {
          alert(
            title: '分享失败',
            icon: 'none'
          )
        }
      )
      // #endif
    }
  }
}
</script>

<style scoped>
.share-card-wrapper {
  width: 100%;
}

.card-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}

.preview-area {
  padding: 20px;
  background-color: #F5F5F5;
}

.preview-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  margin: 0 auto;
  display: block;
}

.preview-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
}

.action-btn {
  padding: 10px 24px;
  background-color: #FFFFFF;
  color: #333333;
  font-size: 14px;
  border-radius: 20px;
  border: 1px solid #E5E5E5;
}

.action-btn.primary {
  background-color: #4A90D9;
  color: #FFFFFF;
  border: none;
}
</style>
