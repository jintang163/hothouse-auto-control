<template>
  <view class="page">
    <view class="upload-section">
      <view class="image-preview" v-if="imageUrl">
        <image :src="imageUrl" mode="aspectFill" class="preview-image" />
        <view class="remove-btn" @click="removeImage">
          <text>✕</text>
        </view>
      </view>
      <view class="upload-placeholder" v-else>
        <text class="upload-icon">📷</text>
        <text class="upload-text">点击上传图片</text>
        <text class="upload-tip">支持拍照或从相册选择</text>
      </view>
      <view class="upload-btns" v-if="!imageUrl">
        <button class="upload-btn camera" @click="chooseImage('camera')">
          <text class="btn-icon">📸</text>
          <text>拍照</text>
        </button>
        <button class="upload-btn album" @click="chooseImage('album')">
          <text class="btn-icon">🖼️</text>
          <text>从相册选择</text>
        </button>
      </view>
    </view>

    <view class="identify-btn-section" v-if="imageUrl && !identifyResult">
      <button class="btn-identify" @click="startIdentify" :disabled="identifying">
        <text v-if="identifying" class="loading-icon">⏳</text>
        <text>{{ identifying ? '识别中...' : '开始识别' }}</text>
      </button>
    </view>

    <view class="result-section" v-if="identifyResult">
      <view class="result-card">
        <view class="result-header">
          <text class="result-title">识别结果</text>
          <text class="confidence" :style="{ color: getConfidenceColor(identifyResult.confidence) }">
            置信度 {{ formatConfidence(identifyResult.confidence) }}%
          </text>
        </view>

        <view class="result-content">
          <view class="result-item main">
            <text class="result-label">匹配病虫害</text>
            <text class="result-value pest-name">{{ identifyResult.pestName || '未知' }}</text>
          </view>

          <view class="result-item" v-if="identifyResult.identifyResult">
            <text class="result-label">识别说明</text>
            <text class="result-value">{{ identifyResult.identifyResult }}</text>
          </view>

          <view class="result-item" v-if="identifyResult.damageLevel">
            <text class="result-label">危害程度</text>
            <text class="result-value" :style="{ color: getSeverityColor(identifyResult.damageLevel) }">
              {{ getSeverityText(identifyResult.damageLevel) }}
            </text>
          </view>

          <view class="result-item" v-if="identifyResult.suggestion">
            <text class="result-label">处置建议</text>
            <text class="result-value suggestion">{{ identifyResult.suggestion }}</text>
          </view>
        </view>

        <view class="result-actions">
          <button class="action-btn secondary" @click="reIdentify">重新识别</button>
          <button class="action-btn primary" @click="submitRecord">提交记录</button>
        </view>
      </view>

      <view class="view-knowledge" v-if="identifyResult.pestId" @click="goToPestDetail">
        <text>查看病虫害知识库</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="tip-section">
      <view class="tip-card">
        <text class="tip-title">📌 识别小贴士</text>
        <view class="tip-list">
          <text class="tip-item">• 请确保图片清晰，对焦准确</text>
          <text class="tip-item">• 尽量拍摄病虫害的典型特征部位</text>
          <text class="tip-item">• 光线充足的环境下识别效果更好</text>
          <text class="tip-item">• 识别结果仅供参考，如有疑问请咨询专业人员</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { api, severityLevelMap } from '@/config'

export default {
  data() {
    return {
      greenhouseId: 1,
      imageUrl: '',
      identifying: false,
      identifyResult: null
    }
  },
  methods: {
    chooseImage(source) {
      uni.chooseImage({
        count: 1,
        sourceType: source === 'camera' ? ['camera'] : ['album'],
        success: (res) => {
          this.imageUrl = res.tempFilePaths[0]
          this.identifyResult = null
        }
      })
    },
    removeImage() {
      this.imageUrl = ''
      this.identifyResult = null
    },
    async startIdentify() {
      if (!this.imageUrl) {
        uni.showToast({ title: '请先选择图片', icon: 'none' })
        return
      }
      
      this.identifying = true
      try {
        uni.showLoading({ title: '识别中...' })
        
        const identifyDTO = {
          greenhouseId: this.greenhouseId,
          imageUrl: this.imageUrl,
          identifyMethod: 'AI'
        }
        
        this.identifyResult = await api.identifyPest(identifyDTO)
        
        uni.hideLoading()
        uni.showToast({ title: '识别完成', icon: 'success' })
      } catch (e) {
        console.error(e)
        uni.hideLoading()
        uni.showToast({ title: '识别失败，请重试', icon: 'none' })
      } finally {
        this.identifying = false
      }
    },
    reIdentify() {
      this.identifyResult = null
      this.imageUrl = ''
    },
    async submitRecord() {
      try {
        uni.showToast({ title: '记录已提交', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (e) {
        console.error(e)
      }
    },
    formatConfidence(confidence) {
      if (!confidence) return 0
      return (confidence * 100).toFixed(1)
    },
    getConfidenceColor(confidence) {
      const val = Number(confidence) || 0
      if (val >= 0.8) return '#52c41a'
      if (val >= 0.6) return '#faad14'
      return '#ff4d4f'
    },
    getSeverityText(level) {
      return severityLevelMap[level]?.text || '未知'
    },
    getSeverityColor(level) {
      return severityLevelMap[level]?.color || '#999'
    },
    goToPestDetail() {
      if (this.identifyResult.pestId) {
        uni.navigateTo({
          url: `/pages/pest-detail/pest-detail?id=${this.identifyResult.pestId}`
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}

.upload-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  
  .image-preview {
    position: relative;
    width: 100%;
    height: 500rpx;
    border-radius: 12rpx;
    overflow: hidden;
    background: #f0f0f0;
    
    .preview-image {
      width: 100%;
      height: 100%;
    }
    
    .remove-btn {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
      width: 48rpx;
      height: 48rpx;
      background: rgba(0,0,0,0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24rpx;
    }
  }
  
  .upload-placeholder {
    width: 100%;
    height: 400rpx;
    border: 2rpx dashed #ddd;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 32rpx;
    
    .upload-icon {
      font-size: 80rpx;
      margin-bottom: 16rpx;
    }
    
    .upload-text {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .upload-tip {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .upload-btns {
    display: flex;
    gap: 24rpx;
    
    .upload-btn {
      flex: 1;
      height: 88rpx;
      line-height: 88rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      
      .btn-icon {
        font-size: 32rpx;
      }
      
      &.camera {
        background: #1989fa;
        color: #fff;
      }
      
      &.album {
        background: #f0f5ff;
        color: #1989fa;
      }
    }
  }
}

.identify-btn-section {
  margin-bottom: 24rpx;
  
  .btn-identify {
    width: 100%;
    height: 96rpx;
    line-height: 96rpx;
    background: linear-gradient(135deg, #1989fa 0%, #096dd9 100%);
    color: #fff;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    
    .loading-icon {
      font-size: 36rpx;
      animation: spin 1s linear infinite;
    }
    
    &[disabled] {
      opacity: 0.7;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.result-section {
  margin-bottom: 24rpx;
  
  .result-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    .result-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24rpx;
      padding-bottom: 16rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .result-title {
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
      }
      
      .confidence {
        font-size: 26rpx;
        font-weight: bold;
      }
    }
    
    .result-content {
      .result-item {
        margin-bottom: 20rpx;
        
        &.main {
          .pest-name {
            font-size: 30rpx;
            font-weight: bold;
            color: #1989fa;
          }
        }
        
        .result-label {
          font-size: 26rpx;
          color: #999;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .result-value {
          font-size: 28rpx;
          color: #333;
          line-height: 1.6;
          
          &.suggestion {
            background: #f6ffed;
            padding: 16rpx;
            border-radius: 8rpx;
            color: #52c41a;
            display: block;
          }
        }
      }
    }
    
    .result-actions {
      display: flex;
      gap: 16rpx;
      margin-top: 24rpx;
      
      .action-btn {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
        border: none;
        
        &.secondary {
          background: #f5f5f5;
          color: #666;
        }
        
        &.primary {
          background: #1989fa;
          color: #fff;
        }
      }
    }
  }
  
  .view-knowledge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    margin-top: 16rpx;
    padding: 24rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #1989fa;
    
    .arrow {
      font-size: 32rpx;
      color: #ccc;
    }
  }
}

.tip-section {
  .tip-card {
    background: #fffbe6;
    border: 1rpx solid #ffe58f;
    border-radius: 12rpx;
    padding: 24rpx;
    
    .tip-title {
      font-size: 28rpx;
      color: #d48806;
      font-weight: bold;
      display: block;
      margin-bottom: 16rpx;
    }
    
    .tip-list {
      .tip-item {
        font-size: 24rpx;
        color: #d48806;
        line-height: 2;
        display: block;
      }
    }
  }
}
</style>
