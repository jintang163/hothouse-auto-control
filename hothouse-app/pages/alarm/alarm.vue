<template>
  <view class="page">
    <view class="alarm-header" v-if="activeAlarms.length > 0">
      <view class="alarm-count">
        <text class="count-number">{{ activeAlarms.length }}</text>
        <text class="count-label">条活跃告警</text>
      </view>
      <view class="alarm-level">
        <view class="level-item critical">
          <text class="level-num">{{ criticalCount }}</text>
          <text class="level-text">严重</text>
        </view>
        <view class="level-item error">
          <text class="level-num">{{ errorCount }}</text>
          <text class="level-text">错误</text>
        </view>
        <view class="level-item warning">
          <text class="level-num">{{ warningCount }}</text>
          <text class="level-text">警告</text>
        </view>
      </view>
    </view>

    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'active' }"
        @click="activeTab = 'active'"
      >
        活跃告警
        <text class="badge" v-if="activeAlarms.length > 0">{{ activeAlarms.length }}</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        历史记录
      </view>
    </view>

    <view class="alarm-list" v-if="activeTab === 'active'">
      <view 
        class="alarm-item" 
        v-for="alarm in activeAlarms" 
        :key="alarm.id"
        @click="handleAlarm(alarm)"
      >
        <view class="alarm-icon" :class="'level-' + alarm.alarmLevel">
          {{ getLevelIcon(alarm.alarmLevel) }}
        </view>
        <view class="alarm-content">
          <view class="alarm-title">
            <text class="alarm-name">{{ alarm.alarmName }}</text>
            <text class="alarm-level-tag" :class="'level-' + alarm.alarmLevel">
              {{ getLevelText(alarm.alarmLevel) }}
            </text>
          </view>
          <view class="alarm-desc">{{ alarm.alarmContent }}</view>
          <view class="alarm-meta">
            <text class="alarm-device">{{ alarm.deviceCode }}</text>
            <text class="alarm-time">{{ formatTime(alarm.alarmTime) }}</text>
          </view>
        </view>
        <view class="alarm-action">
          <text>处理</text>
        </view>
      </view>
      <view class="empty" v-if="!activeAlarms.length">
        <text class="empty-icon">✅</text>
        <text class="empty-text">暂无活跃告警</text>
      </view>
    </view>

    <view class="alarm-list" v-if="activeTab === 'history'">
      <view 
        class="alarm-item history" 
        v-for="alarm in historyAlarms" 
        :key="alarm.id"
      >
        <view class="alarm-icon" :class="'level-' + alarm.alarmLevel">
          {{ getLevelIcon(alarm.alarmLevel) }}
        </view>
        <view class="alarm-content">
          <view class="alarm-title">
            <text class="alarm-name">{{ alarm.alarmName }}</text>
            <text class="status-tag" :class="{ handled: alarm.status === 1 }">
              {{ alarm.status === 1 ? '已处理' : '未处理' }}
            </text>
          </view>
          <view class="alarm-desc">{{ alarm.alarmContent }}</view>
          <view class="alarm-meta">
            <text class="alarm-time">{{ formatTime(alarm.alarmTime) }}</text>
            <text class="alarm-handler" v-if="alarm.handledBy">处理人: {{ alarm.handledBy }}</text>
          </view>
        </view>
      </view>
      <view class="empty" v-if="!historyAlarms.length">
        <text class="empty-text">暂无历史记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { api, alarmLevelMap } from '@/config'

export default {
  data() {
    return {
      greenhouseId: 1,
      activeTab: 'active',
      activeAlarms: [],
      historyAlarms: []
    }
  },
  computed: {
    criticalCount() {
      return this.activeAlarms.filter(a => a.alarmLevel === 4).length
    },
    errorCount() {
      return this.activeAlarms.filter(a => a.alarmLevel === 3).length
    },
    warningCount() {
      return this.activeAlarms.filter(a => a.alarmLevel === 2).length
    }
  },
  onLoad() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.loadData()
    setTimeout(() => uni.stopPullDownRefresh(), 1000)
  },
  methods: {
    async loadData() {
      await this.loadActiveAlarms()
      await this.loadHistoryAlarms()
    },
    async loadActiveAlarms() {
      try {
        this.activeAlarms = await api.getActiveAlarms(this.greenhouseId)
      } catch (e) {
        console.error(e)
      }
    },
    async loadHistoryAlarms() {
      try {
        const startTime = this.getDateBefore(30)
        this.historyAlarms = await api.getAlarmHistory(
          this.greenhouseId, startTime, new Date().toISOString()
        )
      } catch (e) {
        console.error(e)
      }
    },
    getDateBefore(days) {
      const date = new Date()
      date.setDate(date.getDate() - days)
      return date.toISOString()
    },
    getLevelIcon(level) {
      const icons = { 1: 'ℹ️', 2: '⚠️', 3: '❌', 4: '🔥' }
      return icons[level] || '⚠️'
    },
    getLevelText(level) {
      return alarmLevelMap[level]?.text || '未知'
    },
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    handleAlarm(alarm) {
      uni.showModal({
        title: '处理告警',
        content: `确定要标记该告警为已处理吗？\n${alarm.alarmContent}`,
        success: (res) => {
          if (res.confirm) {
            api.handleAlarm({
              id: alarm.id,
              handledBy: 'mobile_user',
              remark: '移动端确认处理'
            }).then(() => {
              uni.showToast({ title: '处理成功', icon: 'success' })
              this.loadData()
            })
          }
        }
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

.alarm-header {
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
  padding: 40rpx 32rpx;
  margin: 24rpx;
  border-radius: 20rpx;
  color: #fff;
  
  .alarm-count {
    display: flex;
    align-items: baseline;
    margin-bottom: 24rpx;
    
    .count-number {
      font-size: 72rpx;
      font-weight: bold;
      margin-right: 12rpx;
    }
    
    .count-label {
      font-size: 28rpx;
      opacity: 0.9;
    }
  }
  
  .alarm-level {
    display: flex;
    gap: 24rpx;
    
    .level-item {
      flex: 1;
      background: rgba(255,255,255,0.15);
      border-radius: 12rpx;
      padding: 16rpx;
      text-align: center;
      
      .level-num {
        font-size: 36rpx;
        font-weight: bold;
        display: block;
      }
      
      .level-text {
        font-size: 24rpx;
        opacity: 0.9;
      }
    }
  }
}

.tabs {
  display: flex;
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 8rpx;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #666;
    border-radius: 12rpx;
    position: relative;
    
    &.active {
      background: #1989fa;
      color: #fff;
      font-weight: bold;
    }
    
    .badge {
      position: absolute;
      top: 8rpx;
      right: 40rpx;
      background: #ff4d4f;
      color: #fff;
      font-size: 20rpx;
      padding: 2rpx 10rpx;
      border-radius: 20rpx;
    }
  }
}

.alarm-list {
  padding: 0 24rpx 24rpx;
  
  .alarm-item {
    display: flex;
    align-items: flex-start;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    .alarm-icon {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      margin-right: 20rpx;
      flex-shrink: 0;
      
      &.level-1 { background: #e6f7ff; }
      &.level-2 { background: #fff7e6; }
      &.level-3 { background: #fff1f0; }
      &.level-4 { background: #f9f0ff; }
    }
    
    .alarm-content {
      flex: 1;
      
      .alarm-title {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
        
        .alarm-name {
          font-size: 30rpx;
          color: #333;
          font-weight: bold;
          margin-right: 12rpx;
        }
        
        .alarm-level-tag {
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          font-size: 22rpx;
          
          &.level-1 { background: #e6f7ff; color: #1890ff; }
          &.level-2 { background: #fff7e6; color: #fa8c16; }
          &.level-3 { background: #fff1f0; color: #ff4d4f; }
          &.level-4 { background: #f9f0ff; color: #722ed1; }
        }
        
        .status-tag {
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          font-size: 22rpx;
          background: #fff1f0;
          color: #ff4d4f;
          
          &.handled {
            background: #f6ffed;
            color: #52c41a;
          }
        }
      }
      
      .alarm-desc {
        font-size: 26rpx;
        color: #666;
        margin-bottom: 8rpx;
        line-height: 1.5;
      }
      
      .alarm-meta {
        display: flex;
        gap: 24rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .alarm-action {
      background: #1989fa;
      color: #fff;
      padding: 12rpx 24rpx;
      border-radius: 8rpx;
      font-size: 26rpx;
      align-self: center;
    }
    
    &.history {
      .alarm-action {
        display: none;
      }
    }
  }
}

.empty {
  text-align: center;
  padding: 80rpx 0;
  
  .empty-icon {
    font-size: 80rpx;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
