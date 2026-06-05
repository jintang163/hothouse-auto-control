<template>
  <view class="page">
    <view class="filter-tabs">
      <view 
        class="filter-tab" 
        :class="{ active: activeFilter === 'all' }"
        @click="switchFilter('all')"
      >
        全部
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeFilter === 'TASK' }"
        @click="switchFilter('TASK')"
      >
        任务日志
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeFilter === 'ENV' }"
        @click="switchFilter('ENV')"
      >
        环境日志
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeFilter === 'OPERATION' }"
        @click="switchFilter('OPERATION')"
      >
        操作日志
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeFilter === 'YIELD' }"
        @click="switchFilter('YIELD')"
      >
        产量日志
      </view>
    </view>

    <view class="add-btn-section">
      <button class="btn-add" @click="showAddPopup">
        <text class="add-icon">+</text>
        <text>新增日志</text>
      </button>
    </view>

    <view class="log-list">
      <view class="log-timeline" v-for="(group, groupIndex) in groupedLogs" :key="groupIndex">
        <view class="timeline-date">{{ group.date }}</view>
        <view class="log-group">
          <view 
            class="log-item" 
            v-for="log in group.items" 
            :key="log.id"
          >
            <view class="log-timeline-dot"></view>
            <view class="log-timeline-line" v-if="groupIndex < groupedLogs.length - 1"></view>
            <view class="log-card">
              <view class="log-header">
                <view class="log-time">
                  <text class="time-text">{{ formatTime(log.operationTime) }}</text>
                  <text 
                    class="type-tag" 
                    :style="{ background: getLogTypeBg(log.logType), color: getLogTypeColor(log.logType) }"
                  >
                    {{ getLogTypeText(log.logType) }}
                  </text>
                </view>
                <text class="log-operator" v-if="log.operator">操作人：{{ log.operator }}</text>
              </view>
              <view class="log-content">
                <text>{{ log.logContent }}</text>
              </view>
              <view class="log-images" v-if="log.images">
                <image 
                  v-for="(img, imgIndex) in getImageList(log.images)" 
                  :key="imgIndex"
                  :src="img" 
                  mode="aspectFill"
                  @click="previewImage(img, getImageList(log.images))"
                />
              </view>
              <view class="log-meta" v-if="log.envData">
                <text class="meta-text">环境数据：{{ log.envData }}</text>
              </view>
              <view class="log-meta" v-if="log.weatherData">
                <text class="meta-text">天气：{{ log.weatherData }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="empty" v-if="!loading && logList.length === 0">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无日志记录</text>
      </view>

      <view class="loading" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
    </view>

    <view class="load-more" v-if="hasMore && !loading">
      <text class="load-more-text">上拉加载更多</text>
    </view>

    <view class="no-more" v-if="!hasMore && logList.length > 0">
      <text class="no-more-text">没有更多了</text>
    </view>

    <view class="popup-mask" v-if="showAdd" @click="showAdd = false">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">新增日志</text>
          <text class="popup-close" @click="showAdd = false">✕</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">日志类型</text>
            <view class="type-options">
              <view 
                class="type-option" 
                v-for="item in typeOptions" 
                :key="item.code"
                :class="{ active: logForm.logType === item.code }"
                @click="logForm.logType = item.code"
              >
                {{ item.text }}
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">操作人</text>
            <input 
              class="form-input" 
              v-model="logForm.operator" 
              placeholder="请输入操作人" 
            />
          </view>
          <view class="form-item">
            <text class="form-label">日志内容</text>
            <textarea 
              class="form-textarea" 
              v-model="logForm.logContent" 
              placeholder="请输入日志内容"
            ></textarea>
          </view>
          <view class="form-item">
            <text class="form-label">上传图片</text>
            <view class="image-uploader">
              <view 
                class="upload-item" 
                v-for="(img, index) in uploadedImages" 
                :key="index"
              >
                <image :src="img" mode="aspectFill" />
                <view class="remove-btn" @click="removeImage(index)">✕</view>
              </view>
              <view class="upload-btn" v-if="uploadedImages.length < 9" @click="chooseImages">
                <text class="upload-icon">+</text>
                <text>上传</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">天气</text>
            <input 
              class="form-input" 
              v-model="logForm.weatherData" 
              placeholder="如：晴、多云" 
            />
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              v-model="logForm.remark" 
              placeholder="请输入备注"
            ></textarea>
          </view>
        </view>
        <view class="popup-footer">
          <button class="popup-btn cancel" @click="showAdd = false">取消</button>
          <button class="popup-btn confirm" @click="submitLog">提交</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { api, logTypeMap } from '@/config'

export default {
  data() {
    return {
      greenhouseId: 1,
      taskId: null,
      activeFilter: 'all',
      logList: [],
      page: 1,
      size: 10,
      total: 0,
      hasMore: true,
      loading: false,
      showAdd: false,
      uploadedImages: [],
      typeOptions: [
        { code: 'TASK', text: '任务日志' },
        { code: 'ENV', text: '环境日志' },
        { code: 'OPERATION', text: '操作日志' },
        { code: 'YIELD', text: '产量日志' }
      ],
      logForm: {
        greenhouseId: 1,
        logType: 'OPERATION',
        operator: '',
        logContent: '',
        weatherData: '',
        remark: ''
      }
    }
  },
  computed: {
    groupedLogs() {
      const groups = {}
      this.logList.forEach(log => {
        const date = this.formatDate(log.operationTime)
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(log)
      })
      return Object.keys(groups).map(date => ({
        date,
        items: groups[date]
      }))
    }
  },
  onLoad(options) {
    if (options.taskId) {
      this.taskId = options.taskId
    }
    this.loadData()
  },
  onPullDownRefresh() {
    this.refresh()
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    switchFilter(type) {
      this.activeFilter = type
      this.refresh()
    },
    async refresh() {
      this.page = 1
      this.hasMore = true
      this.logList = []
      await this.loadData()
      uni.stopPullDownRefresh()
    },
    async loadMore() {
      if (this.hasMore && !this.loading) {
        this.page++
        await this.loadData()
      }
    },
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.page,
          size: this.size,
          greenhouseId: this.greenhouseId
        }
        if (this.taskId) {
          this.logList = await api.getLogByTask(this.taskId)
          this.total = this.logList.length
          this.hasMore = false
        } else {
          if (this.activeFilter !== 'all') {
            params.logType = this.activeFilter
          }
          const res = await api.getLogList(params)
          if (res.records) {
            this.logList = this.page === 1 ? res.records : [...this.logList, ...res.records]
            this.total = res.total
            this.hasMore = this.logList.length < this.total
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    getImageList(images) {
      if (!images) return []
      return images.split(',').filter(u => u)
    },
    getLogTypeText(type) {
      return logTypeMap[type]?.text || '未知'
    },
    getLogTypeColor(type) {
      return logTypeMap[type]?.color || '#999'
    },
    getLogTypeBg(type) {
      const colors = {
        TASK: '#e6f7ff',
        ENV: '#f6ffed',
        OPERATION: '#f9f0ff',
        YIELD: '#fff7e6'
      }
      return colors[type] || '#f5f5f5'
    },
    formatDate(time) {
      if (!time) return ''
      const date = new Date(time)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    previewImage(current, urls) {
      uni.previewImage({
        current,
        urls
      })
    },
    showAddPopup() {
      this.logForm = {
        greenhouseId: 1,
        logType: 'OPERATION',
        operator: '',
        logContent: '',
        weatherData: '',
        remark: ''
      }
      this.uploadedImages = []
      this.showAdd = true
    },
    chooseImages() {
      uni.chooseImage({
        count: 9 - this.uploadedImages.length,
        success: (res) => {
          this.uploadedImages = [...this.uploadedImages, ...res.tempFilePaths]
        }
      })
    },
    removeImage(index) {
      this.uploadedImages.splice(index, 1)
    },
    async submitLog() {
      if (!this.logForm.logContent) {
        uni.showToast({ title: '请输入日志内容', icon: 'none' })
        return
      }
      try {
        const data = {
          ...this.logForm,
          images: this.uploadedImages.join(','),
          operationTime: new Date().toISOString()
        }
        await api.saveLog(data)
        uni.showToast({ title: '提交成功', icon: 'success' })
        this.showAdd = false
        this.refresh()
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.filter-tabs {
  display: flex;
  background: #fff;
  margin: 24rpx 24rpx 0;
  border-radius: 16rpx;
  padding: 8rpx;
  overflow-x: auto;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .filter-tab {
    flex: 1;
    min-width: 120rpx;
    text-align: center;
    padding: 20rpx 16rpx;
    font-size: 26rpx;
    color: #666;
    border-radius: 12rpx;
    white-space: nowrap;
    
    &.active {
      background: #1989fa;
      color: #fff;
      font-weight: bold;
    }
  }
}

.add-btn-section {
  padding: 24rpx;
  
  .btn-add {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background: #1989fa;
    color: #fff;
    border-radius: 12rpx;
    font-size: 28rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    
    .add-icon {
      font-size: 36rpx;
      line-height: 1;
    }
  }
}

.log-list {
  padding: 0 24rpx 24rpx;
  
  .log-timeline {
    position: relative;
    margin-bottom: 32rpx;
    
    .timeline-date {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 16rpx;
      padding-left: 8rpx;
    }
    
    .log-group {
      position: relative;
      
      .log-item {
        display: flex;
        position: relative;
        margin-bottom: 24rpx;
        
        .log-timeline-dot {
          width: 16rpx;
          height: 16rpx;
          background: #1989fa;
          border-radius: 50%;
          margin-top: 24rpx;
          margin-right: 20rpx;
          flex-shrink: 0;
          z-index: 1;
        }
        
        .log-timeline-line {
          position: absolute;
          left: 7rpx;
          top: 40rpx;
          bottom: -24rpx;
          width: 2rpx;
          background: #e0e0e0;
        }
        
        .log-card {
          flex: 1;
          background: #fff;
          border-radius: 12rpx;
          padding: 20rpx;
          box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
          
          .log-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12rpx;
            
            .log-time {
              display: flex;
              align-items: center;
              gap: 12rpx;
              
              .time-text {
                font-size: 26rpx;
                color: #333;
                font-weight: bold;
              }
              
              .type-tag {
                padding: 4rpx 10rpx;
                border-radius: 6rpx;
                font-size: 22rpx;
              }
            }
            
            .log-operator {
              font-size: 24rpx;
              color: #999;
            }
          }
          
          .log-content {
            font-size: 26rpx;
            color: #333;
            line-height: 1.6;
            margin-bottom: 12rpx;
          }
          
          .log-images {
            display: flex;
            flex-wrap: wrap;
            gap: 8rpx;
            margin-bottom: 12rpx;
            
            image {
              width: 160rpx;
              height: 160rpx;
              border-radius: 8rpx;
            }
          }
          
          .log-meta {
            font-size: 22rpx;
            color: #999;
            margin-top: 8rpx;
            
            .meta-text {
              display: block;
            }
          }
        }
      }
    }
  }
}

.empty, .loading, .load-more, .no-more {
  text-align: center;
  padding: 80rpx 0;
  
  .empty-icon {
    font-size: 80rpx;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .empty-text, .loading-text, .load-more-text, .no-more-text {
    font-size: 28rpx;
    color: #999;
  }
}

.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  
  .popup-content {
    width: 650rpx;
    max-height: 85vh;
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    
    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx;
      border-bottom: 1rpx solid #f0f0f0;
      flex-shrink: 0;
      
      .popup-title {
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
      }
      
      .popup-close {
        font-size: 32rpx;
        color: #999;
        padding: 8rpx;
      }
    }
    
    .popup-body {
      flex: 1;
      overflow-y: auto;
      padding: 24rpx;
      
      .form-item {
        margin-bottom: 24rpx;
        
        .form-label {
          display: block;
          font-size: 26rpx;
          color: #666;
          margin-bottom: 12rpx;
        }
        
        .form-input {
          width: 100%;
          height: 72rpx;
          padding: 0 16rpx;
          border: 1rpx solid #e0e0e0;
          border-radius: 8rpx;
          font-size: 28rpx;
          box-sizing: border-box;
        }
        
        .form-textarea {
          width: 100%;
          height: 160rpx;
          padding: 16rpx;
          border: 1rpx solid #e0e0e0;
          border-radius: 8rpx;
          font-size: 28rpx;
          box-sizing: border-box;
        }
        
        .type-options {
          display: flex;
          flex-wrap: wrap;
          gap: 12rpx;
          
          .type-option {
            padding: 12rpx 24rpx;
            border: 1rpx solid #e0e0e0;
            border-radius: 8rpx;
            font-size: 26rpx;
            color: #666;
            
            &.active {
              background: #e6f7ff;
              border-color: #1989fa;
              color: #1989fa;
              font-weight: bold;
            }
          }
        }
        
        .image-uploader {
          display: flex;
          flex-wrap: wrap;
          gap: 12rpx;
          
          .upload-item {
            width: 160rpx;
            height: 160rpx;
            position: relative;
            
            image {
              width: 100%;
              height: 100%;
              border-radius: 8rpx;
            }
            
            .remove-btn {
              position: absolute;
              top: -8rpx;
              right: -8rpx;
              width: 36rpx;
              height: 36rpx;
              background: rgba(0,0,0,0.6);
              border-radius: 50%;
              color: #fff;
              font-size: 20rpx;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
          
          .upload-btn {
            width: 160rpx;
            height: 160rpx;
            border: 2rpx dashed #ddd;
            border-radius: 8rpx;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 24rpx;
            
            .upload-icon {
              font-size: 48rpx;
              line-height: 1;
              margin-bottom: 4rpx;
            }
          }
        }
      }
    }
    
    .popup-footer {
      display: flex;
      border-top: 1rpx solid #f0f0f0;
      flex-shrink: 0;
      
      .popup-btn {
        flex: 1;
        height: 88rpx;
        line-height: 88rpx;
        border-radius: 0;
        font-size: 30rpx;
        border: none;
        
        &.cancel {
          background: #f5f5f5;
          color: #666;
        }
        
        &.confirm {
          background: #1989fa;
          color: #fff;
        }
      }
    }
  }
}
</style>
