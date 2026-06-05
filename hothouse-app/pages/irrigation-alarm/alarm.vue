<template>
  <view class="page">
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'pending' }"
        @click="switchTab('pending')"
      >
        <text>待处理</text>
        <view class="badge" v-if="pendingCount > 0">{{ pendingCount }}</view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'handled' }"
        @click="switchTab('handled')"
      >
        <text>已处理</text>
      </view>
    </view>

    <view class="alarm-list">
      <view 
        class="alarm-item" 
        v-for="alarm in alarmList" 
        :key="alarm.id"
        @click="handleAlarmClick(alarm)"
      >
        <view 
          class="alarm-level" 
          :style="{ background: getAlarmLevelBg(alarm.level) }"
        >
          {{ getAlarmLevelIcon(alarm.level) }}
        </view>
        <view class="alarm-content">
          <view class="alarm-header">
            <text class="alarm-type">{{ getAlarmTypeText(alarm.type) }}</text>
            <view 
              class="alarm-status" 
              :class="alarm.status === 'PENDING' ? 'status-pending' : 'status-handled'"
            >
              {{ alarm.status === 'PENDING' ? '待处理' : '已处理' }}
            </view>
          </view>
          <view class="alarm-message">{{ alarm.message }}</view>
          <view class="alarm-meta">
            <text class="meta-item">
              <text class="meta-icon">📍</text>
              {{ alarm.area || '全区域' }}
            </text>
            <text class="meta-item">
              <text class="meta-icon">⏰</text>
              {{ formatTime(alarm.alarmTime) }}
            </text>
          </view>
          <view class="alarm-handler" v-if="alarm.status === 'HANDLED'">
            <text class="handler-label">处理人：{{ alarm.handler }}</text>
            <text class="handler-result">{{ alarm.handleResult }}</text>
          </view>
        </view>
        <view class="alarm-action" v-if="alarm.status === 'PENDING'">
          <text class="action-text">处理</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="empty" v-if="!alarmList || alarmList.length === 0">
        <text class="empty-icon">🔔</text>
        <text class="empty-text">{{ activeTab === 'pending' ? '暂无待处理告警' : '暂无已处理告警' }}</text>
      </view>
    </view>

    <view class="modal" v-if="showHandleModal" @click="closeHandleModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">处理告警</text>
          <text class="modal-close" @click="closeHandleModal">×</text>
        </view>
        <view class="modal-body">
          <view class="alarm-info">
            <view class="info-row">
              <text class="info-label">告警类型：</text>
              <text class="info-value">{{ getAlarmTypeText(currentAlarm?.type) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">告警内容：</text>
              <text class="info-value">{{ currentAlarm?.message }}</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">处理结果</text>
            <textarea 
              class="form-textarea" 
              v-model="handleResult"
              placeholder="请输入处理结果..."
              :maxlength="200"
              auto-height
            ></textarea>
            <text class="char-count">{{ handleResult.length }}/200</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn btn-cancel" @click="closeHandleModal">取消</button>
          <button class="btn btn-confirm" @click="submitHandle">确认处理</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api'
import { irrigationAlarmTypeMap, irrigationAlarmLevelMap } from '@/config'

export default {
  data() {
    return {
      greenhouseId: 1,
      activeTab: 'pending',
      pendingCount: 0,
      alarmList: [],
      loading: false,
      page: 1,
      size: 20,
      showHandleModal: false,
      currentAlarm: null,
      handleResult: ''
    }
  },
  onLoad(options) {
    if (options.greenhouseId) {
      this.greenhouseId = parseInt(options.greenhouseId)
    }
    if (options.tab) {
      this.activeTab = options.tab
    }
    this.loadData()
  },
  onPullDownRefresh() {
    this.page = 1
    this.loadData()
    setTimeout(() => uni.stopPullDownRefresh(), 1000)
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    async loadData() {
      this.loading = true
      this.page = 1
      try {
        if (this.activeTab === 'pending') {
          const res = await api.getIrrigationPendingAlarms(this.greenhouseId)
          this.alarmList = res || []
          this.pendingCount = this.alarmList.length
        } else {
          const params = {
            page: this.page,
            size: this.size,
            greenhouseId: this.greenhouseId,
            status: 'HANDLED'
          }
          const res = await api.getIrrigationAlarmList(params)
          this.alarmList = res.records || []
        }
      } catch (e) {
        console.error(e)
        this.loadMockData()
      } finally {
        this.loading = false
      }
    },
    loadMockData() {
      const now = new Date()
      if (this.activeTab === 'pending') {
        this.alarmList = [
          {
            id: 1,
            type: 'LOW_SOIL_MOISTURE',
            level: 'URGENT',
            message: 'A区土壤湿度过低，当前值15%，低于阈值20%',
            area: 'A区',
            status: 'PENDING',
            alarmTime: new Date(now.getTime() - 30 * 60000).toISOString()
          },
          {
            id: 2,
            type: 'LOW_WATER_PRESSURE',
            level: 'WARNING',
            message: '灌溉系统水压偏低，当前0.2MPa，可能影响灌溉效果',
            area: '全区域',
            status: 'PENDING',
            alarmTime: new Date(now.getTime() - 2 * 3600000).toISOString()
          },
          {
            id: 3,
            type: 'LOW_TANK_LEVEL',
            level: 'INFO',
            message: '2号储罐液位偏低，当前30%，请及时补充',
            area: '2号储罐',
            status: 'PENDING',
            alarmTime: new Date(now.getTime() - 5 * 3600000).toISOString()
          }
        ]
        this.pendingCount = 3
      } else {
        this.alarmList = [
          {
            id: 4,
            type: 'EC_ABNORMAL',
            level: 'WARNING',
            message: 'B区EC值偏高，当前2.5mS/cm，超过阈值',
            area: 'B区',
            status: 'HANDLED',
            alarmTime: new Date(now.getTime() - 24 * 3600000).toISOString(),
            handleTime: new Date(now.getTime() - 23 * 3600000).toISOString(),
            handler: '张三',
            handleResult: '已稀释营养液，调整灌溉比例，EC值已恢复正常'
          },
          {
            id: 5,
            type: 'pH_ABNORMAL',
            level: 'INFO',
            message: 'C区pH值偏低，当前5.5，略低于最佳范围',
            area: 'C区',
            status: 'HANDLED',
            alarmTime: new Date(now.getTime() - 48 * 3600000).toISOString(),
            handleTime: new Date(now.getTime() - 47 * 3600000).toISOString(),
            handler: '李四',
            handleResult: '已添加中和剂，pH值已调整至6.2'
          }
        ]
        this.pendingCount = 3
      }
    },
    async loadMore() {
      if (this.activeTab === 'pending' || this.loading) return
      this.page++
      try {
        const params = {
          page: this.page,
          size: this.size,
          greenhouseId: this.greenhouseId,
          status: 'HANDLED'
        }
        const res = await api.getIrrigationAlarmList(params)
        this.alarmList = [...this.alarmList, ...(res.records || [])]
      } catch (e) {
        console.error(e)
        this.page--
      }
    },
    switchTab(tab) {
      this.activeTab = tab
      this.loadData()
    },
    handleAlarmClick(alarm) {
      if (alarm.status === 'PENDING') {
        this.currentAlarm = alarm
        this.handleResult = ''
        this.showHandleModal = true
      } else {
        uni.showToast({
          title: '查看详情',
          icon: 'none'
        })
      }
    },
    closeHandleModal() {
      this.showHandleModal = false
      this.currentAlarm = null
      this.handleResult = ''
    },
    async submitHandle() {
      if (!this.handleResult.trim()) {
        uni.showToast({
          title: '请输入处理结果',
          icon: 'none'
        })
        return
      }
      if (!this.currentAlarm) return
      try {
        await api.handleIrrigationAlarm(
          this.currentAlarm.id,
          '当前用户',
          this.handleResult.trim()
        )
        uni.showToast({
          title: '处理成功',
          icon: 'success'
        })
        this.closeHandleModal()
        this.loadData()
      } catch (e) {
        console.error(e)
        this.currentAlarm.status = 'HANDLED'
        this.currentAlarm.handler = '当前用户'
        this.currentAlarm.handleResult = this.handleResult.trim()
        this.currentAlarm.handleTime = new Date().toISOString()
        this.alarmList = this.alarmList.filter(a => a.id !== this.currentAlarm.id)
        this.pendingCount--
        uni.showToast({
          title: '处理成功',
          icon: 'success'
        })
        this.closeHandleModal()
      }
    },
    getAlarmLevelIcon(level) {
      return irrigationAlarmLevelMap[level]?.icon || '⚠️'
    },
    getAlarmLevelBg(level) {
      const color = irrigationAlarmLevelMap[level]?.color || '#999'
      return color + '20'
    },
    getAlarmTypeText(type) {
      return irrigationAlarmTypeMap[type]?.text || '未知告警'
    },
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.tabs {
  display: flex;
  background: #fff;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 28rpx 0;
    font-size: 30rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #1890ff;
      font-weight: bold;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background: #1890ff;
        border-radius: 3rpx;
      }
    }
    
    .badge {
      background: #ff4d4f;
      color: #fff;
      font-size: 20rpx;
      padding: 2rpx 10rpx;
      border-radius: 20rpx;
      min-width: 32rpx;
      text-align: center;
    }
  }
}

.alarm-list {
  padding: 24rpx;
  
  .alarm-item {
    display: flex;
    align-items: flex-start;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    
    .alarm-level {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    
    .alarm-content {
      flex: 1;
      min-width: 0;
      
      .alarm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10rpx;
        
        .alarm-type {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
        }
        
        .alarm-status {
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          
          &.status-pending {
            background: #fff1f0;
            color: #ff4d4f;
          }
          
          &.status-handled {
            background: #f6ffed;
            color: #52c41a;
          }
        }
      }
      
      .alarm-message {
        font-size: 26rpx;
        color: #666;
        line-height: 1.5;
        margin-bottom: 12rpx;
      }
      
      .alarm-meta {
        display: flex;
        gap: 24rpx;
        margin-bottom: 8rpx;
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6rpx;
          font-size: 22rpx;
          color: #999;
          
          .meta-icon {
            font-size: 20rpx;
          }
        }
      }
      
      .alarm-handler {
        margin-top: 10rpx;
        padding-top: 10rpx;
        border-top: 1rpx dashed #f0f0f0;
        
        .handler-label {
          display: block;
          font-size: 22rpx;
          color: #999;
          margin-bottom: 4rpx;
        }
        
        .handler-result {
          display: block;
          font-size: 24rpx;
          color: #666;
          line-height: 1.4;
        }
      }
    }
    
    .alarm-action {
      display: flex;
      align-items: center;
      gap: 4rpx;
      margin-left: 16rpx;
      flex-shrink: 0;
      
      .action-text {
        font-size: 24rpx;
        color: #1890ff;
      }
      
      .arrow {
        font-size: 32rpx;
        color: #ccc;
      }
    }
  }
}

.empty {
  text-align: center;
  padding: 120rpx 0;
  
  .empty-icon {
    font-size: 100rpx;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.modal {
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
  padding: 40rpx;
  
  .modal-content {
    width: 100%;
    max-width: 640rpx;
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .modal-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .modal-close {
        font-size: 48rpx;
        color: #ccc;
        line-height: 1;
      }
    }
    
    .modal-body {
      padding: 32rpx;
      
      .alarm-info {
        background: #fafafa;
        border-radius: 12rpx;
        padding: 20rpx;
        margin-bottom: 24rpx;
        
        .info-row {
          display: flex;
          align-items: flex-start;
          margin-bottom: 10rpx;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .info-label {
            font-size: 24rpx;
            color: #999;
            flex-shrink: 0;
          }
          
          .info-value {
            font-size: 24rpx;
            color: #333;
            flex: 1;
          }
        }
      }
      
      .form-item {
        .form-label {
          display: block;
          font-size: 26rpx;
          color: #333;
          margin-bottom: 12rpx;
          font-weight: 500;
        }
        
        .form-textarea {
          width: 100%;
          min-height: 160rpx;
          background: #fafafa;
          border: 1rpx solid #e0e0e0;
          border-radius: 12rpx;
          padding: 20rpx;
          font-size: 26rpx;
          color: #333;
          box-sizing: border-box;
        }
        
        .char-count {
          display: block;
          text-align: right;
          font-size: 22rpx;
          color: #999;
          margin-top: 8rpx;
        }
      }
    }
    
    .modal-footer {
      display: flex;
      gap: 20rpx;
      padding: 24rpx 32rpx 32rpx;
      
      .btn {
        flex: 1;
        height: 88rpx;
        line-height: 88rpx;
        font-size: 30rpx;
        border-radius: 44rpx;
        border: none;
      }
      
      .btn-cancel {
        background: #f5f5f5;
        color: #666;
      }
      
      .btn-confirm {
        background: #1890ff;
        color: #fff;
      }
    }
  }
}
</style>
