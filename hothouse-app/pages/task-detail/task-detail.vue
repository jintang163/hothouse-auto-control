<template>
  <view class="page">
    <view class="task-card" v-if="task">
      <view class="task-header">
        <text class="task-name">{{ task.taskName }}</text>
        <text class="status-tag" :style="{ background: getStatusBg(task.status), color: getStatusColor(task.status) }">
          {{ getStatusText(task.status) }}
        </text>
      </view>
      
      <view class="info-section">
        <view class="section-title">基本信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">任务编号</text>
            <text class="info-value">{{ task.taskCode }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">任务类型</text>
            <text class="info-value" :style="{ color: getTaskTypeColor(task.taskType) }">
              {{ getTaskTypeText(task.taskType) }}
            </text>
          </view>
          <view class="info-item">
            <text class="info-label">触发原因</text>
            <text class="info-value">{{ task.triggerReason || getTriggerSourceText(task.triggerSource) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">优先级</text>
            <text class="info-value priority" :class="'p-' + task.priority">
              {{ getPriorityText(task.priority) }}
            </text>
          </view>
          <view class="info-item">
            <text class="info-label">执行人</text>
            <text class="info-value">{{ task.executor || '-' }}</text>
          </view>
        </view>
      </view>

      <view class="info-section">
        <view class="section-title">时间计划</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">计划开始</text>
            <text class="info-value">{{ formatTime(task.planStartTime) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">计划结束</text>
            <text class="info-value">{{ formatTime(task.planEndTime) }}</text>
          </view>
          <view class="info-item" v-if="task.actualStartTime">
            <text class="info-label">实际开始</text>
            <text class="info-value">{{ formatTime(task.actualStartTime) }}</text>
          </view>
          <view class="info-item" v-if="task.actualEndTime">
            <text class="info-label">实际结束</text>
            <text class="info-value">{{ formatTime(task.actualEndTime) }}</text>
          </view>
          <view class="info-item" v-if="task.actualDuration">
            <text class="info-label">实际耗时</text>
            <text class="info-value">{{ task.actualDuration }} 分钟</text>
          </view>
        </view>
      </view>

      <view class="info-section" v-if="deviceList.length > 0">
        <view class="section-title">关联设备</view>
        <view class="device-list">
          <view class="device-item" v-for="device in deviceList" :key="device">
            <text class="device-icon">🔧</text>
            <text class="device-name">{{ device }}</text>
          </view>
        </view>
      </view>

      <view class="info-section" v-if="task.feedbackContent">
        <view class="section-title">执行反馈</view>
        <view class="feedback-content">
          <view class="feedback-row" v-if="task.actualDuration">
            <text class="feedback-label">实际耗时</text>
            <text class="feedback-value">{{ task.actualDuration }} 分钟</text>
          </view>
          <view class="feedback-row" v-if="task.actualUsage">
            <text class="feedback-label">实际用量</text>
            <text class="feedback-value">{{ task.actualUsage }} {{ task.usageUnit || '' }}</text>
          </view>
          <view class="feedback-row">
            <text class="feedback-label">反馈内容</text>
            <text class="feedback-value">{{ task.feedbackContent }}</text>
          </view>
        </view>
      </view>

      <view class="action-section">
        <view class="action-row" v-if="task.status === 0">
          <button class="action-btn primary" @click="startTask">开始执行</button>
          <button class="action-btn danger" @click="cancelTask">取消任务</button>
        </view>
        <view class="action-row" v-if="task.status === 1">
          <button class="action-btn success" @click="executeDevice">设备联动</button>
          <button class="action-btn primary" @click="showFeedbackPopup">提交反馈</button>
          <button class="action-btn danger" @click="cancelTask">取消任务</button>
        </view>
        <view class="action-row" v-if="task.status === 2 || task.status === 3 || task.status === 4">
          <button class="action-btn default" @click="viewLogs">查看关联日志</button>
        </view>
      </view>
    </view>

    <view class="loading" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <view class="popup-mask" v-if="showFeedback" @click="showFeedback = false">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">提交反馈</text>
          <text class="popup-close" @click="showFeedback = false">✕</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">实际耗时（分钟）</text>
            <input class="form-input" type="number" v-model="feedbackForm.actualDuration" placeholder="请输入实际耗时" />
          </view>
          <view class="form-item">
            <text class="form-label">实际用量</text>
            <input class="form-input" type="digit" v-model="feedbackForm.actualUsage" placeholder="请输入实际用量" />
          </view>
          <view class="form-item">
            <text class="form-label">单位</text>
            <input class="form-input" v-model="feedbackForm.usageUnit" placeholder="如：kg、L等" />
          </view>
          <view class="form-item">
            <text class="form-label">反馈内容</text>
            <textarea class="form-textarea" v-model="feedbackForm.feedbackContent" placeholder="请输入反馈内容"></textarea>
          </view>
        </view>
        <view class="popup-footer">
          <button class="popup-btn cancel" @click="showFeedback = false">取消</button>
          <button class="popup-btn confirm" @click="submitFeedback">提交</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { api, taskStatusMap, taskTypeMap, triggerSourceMap } from '@/config'

export default {
  data() {
    return {
      taskId: null,
      task: null,
      loading: true,
      showFeedback: false,
      deviceList: [],
      feedbackForm: {
        taskId: null,
        actualDuration: '',
        actualUsage: '',
        usageUnit: '',
        feedbackContent: ''
      }
    }
  },
  onLoad(options) {
    this.taskId = options.id
    this.feedbackForm.taskId = options.id
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        this.task = await api.getTask(this.taskId)
        if (this.task.deviceCodes) {
          this.deviceList = this.task.deviceCodes.split(',').filter(c => c)
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    getStatusText(status) {
      return taskStatusMap[status]?.text || '未知'
    },
    getStatusColor(status) {
      return taskStatusMap[status]?.color || '#999'
    },
    getStatusBg(status) {
      const colors = {
        0: '#fff7e6',
        1: '#e6f7ff',
        2: '#f6ffed',
        3: '#f5f5f5',
        4: '#fff1f0'
      }
      return colors[status] || '#f5f5f5'
    },
    getTaskTypeText(type) {
      return taskTypeMap[type]?.text || '未知'
    },
    getTaskTypeColor(type) {
      return taskTypeMap[type]?.color || '#999'
    },
    getTriggerSourceText(source) {
      return triggerSourceMap[source]?.text || '未知'
    },
    getPriorityText(priority) {
      const texts = { 1: '低', 2: '中', 3: '高', 4: '紧急' }
      return texts[priority] || '中'
    },
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    startTask() {
      uni.showModal({
        title: '确认开始',
        content: '确定要开始执行此任务吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.startTask(this.taskId, 'mobile_user')
              uni.showToast({ title: '已开始执行', icon: 'success' })
              this.loadData()
            } catch (e) {
              console.error(e)
            }
          }
        }
      })
    },
    executeDevice() {
      uni.showModal({
        title: '设备联动',
        content: '确定要一键执行设备联动吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.executeTaskByDevice(this.taskId)
              uni.showToast({ title: '执行成功', icon: 'success' })
            } catch (e) {
              console.error(e)
            }
          }
        }
      })
    },
    cancelTask() {
      uni.showModal({
        title: '取消任务',
        content: '确定要取消此任务吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.cancelTask(this.taskId, 'mobile_user')
              uni.showToast({ title: '已取消', icon: 'success' })
              this.loadData()
            } catch (e) {
              console.error(e)
            }
          }
        }
      })
    },
    showFeedbackPopup() {
      this.showFeedback = true
    },
    async submitFeedback() {
      if (!this.feedbackForm.feedbackContent) {
        uni.showToast({ title: '请填写反馈内容', icon: 'none' })
        return
      }
      try {
        const data = {
          ...this.feedbackForm,
          actualDuration: Number(this.feedbackForm.actualDuration) || 0,
          actualUsage: Number(this.feedbackForm.actualUsage) || 0
        }
        await api.submitTaskFeedback(data)
        uni.showToast({ title: '提交成功', icon: 'success' })
        this.showFeedback = false
        this.loadData()
      } catch (e) {
        console.error(e)
      }
    },
    viewLogs() {
      uni.navigateTo({
        url: `/pages/log/log?taskId=${this.taskId}`
      })
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

.task-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  
  .task-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .task-name {
      font-size: 34rpx;
      color: #333;
      font-weight: bold;
      flex: 1;
      margin-right: 16rpx;
    }
    
    .status-tag {
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      font-size: 24rpx;
      flex-shrink: 0;
    }
  }
}

.info-section {
  margin-bottom: 24rpx;
  
  .section-title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 16rpx;
    padding-left: 12rpx;
    border-left: 4rpx solid #1989fa;
  }
}

.info-list {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 16rpx;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    
    &:not(:last-child) {
      border-bottom: 1rpx solid #f0f0f0;
    }
    
    .info-label {
      font-size: 26rpx;
      color: #999;
    }
    
    .info-value {
      font-size: 26rpx;
      color: #333;
      max-width: 60%;
      text-align: right;
      
      &.priority {
        &.p-1 { color: #52c41a; }
        &.p-2 { color: #faad14; }
        &.p-3 { color: #fa8c16; }
        &.p-4 { color: #ff4d4f; }
      }
    }
  }
}

.device-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  
  .device-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
    background: #f0f5ff;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    
    .device-icon {
      font-size: 24rpx;
    }
    
    .device-name {
      font-size: 24rpx;
      color: #1989fa;
    }
  }
}

.feedback-content {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 16rpx;
  
  .feedback-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12rpx 0;
    
    &:not(:last-child) {
      border-bottom: 1rpx solid #f0f0f0;
    }
    
    .feedback-label {
      font-size: 26rpx;
      color: #999;
      flex-shrink: 0;
    }
    
    .feedback-value {
      font-size: 26rpx;
      color: #333;
      max-width: 70%;
      text-align: right;
      line-height: 1.5;
    }
  }
}

.action-section {
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
  
  .action-row {
    display: flex;
    gap: 16rpx;
    
    .action-btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      border: none;
      
      &.primary {
        background: #1989fa;
        color: #fff;
      }
      
      &.success {
        background: #52c41a;
        color: #fff;
      }
      
      &.danger {
        background: #ff4d4f;
        color: #fff;
      }
      
      &.default {
        background: #f0f0f0;
        color: #333;
      }
    }
  }
}

.loading {
  text-align: center;
  padding: 80rpx 0;
  
  .loading-text {
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
    width: 600rpx;
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    
    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
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
      }
    }
    
    .popup-footer {
      display: flex;
      border-top: 1rpx solid #f0f0f0;
      
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
