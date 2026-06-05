<template>
  <view class="page">
    <view class="control-panel" v-if="currentMode === 0">
      <view class="panel-header">
        <text class="panel-title">手动控制</text>
        <text class="panel-tip">请谨慎操作设备</text>
      </view>
      
      <view class="control-group">
        <view class="group-title">风机控制</view>
        <view class="control-card">
          <view class="card-header">
            <text class="device-emoji">💨</text>
            <view class="card-info">
              <text class="device-name">1号风机</text>
              <text class="device-desc">东区通风</text>
            </view>
            <u-switch 
              :value="fanStatus === 1" 
              @change="toggleFan"
              active-color="#52c41a"
            ></u-switch>
          </view>
          <view class="card-footer">
            <text class="status-text" :style="{ color: fanStatus === 1 ? '#52c41a' : '#999' }">
              {{ fanStatus === 1 ? '● 运行中' : '○ 已关闭' }}
            </text>
          </view>
        </view>
      </view>

      <view class="control-group">
        <view class="group-title">湿帘控制</view>
        <view class="control-card">
          <view class="card-header">
            <text class="device-emoji">💧</text>
            <view class="card-info">
              <text class="device-name">1号湿帘</text>
              <text class="device-desc">南侧降温</text>
            </view>
            <u-switch 
              :value="wetCurtainStatus === 1" 
              @change="toggleWetCurtain"
              active-color="#1890ff"
            ></u-switch>
          </view>
          <view class="card-footer">
            <text class="status-text" :style="{ color: wetCurtainStatus === 1 ? '#1890ff' : '#999' }">
              {{ wetCurtainStatus === 1 ? '● 运行中' : '○ 已关闭' }}
            </text>
            <text class="warning" v-if="fanStatus !== 1 && wetCurtainStatus === 1">
              ⚠️ 建议开启风机配合使用
            </text>
          </view>
        </view>
      </view>

      <view class="control-group">
        <view class="group-title">遮阳网控制</view>
        <view class="control-card">
          <view class="card-header">
            <text class="device-emoji">☀️</text>
            <view class="card-info">
              <text class="device-name">1号遮阳网</text>
              <text class="device-desc">顶部遮阳</text>
            </view>
            <u-switch 
              :value="sunshadeStatus === 1" 
              @change="toggleSunshade"
              active-color="#faad14"
            ></u-switch>
          </view>
          <view class="card-footer">
            <text class="status-text" :style="{ color: sunshadeStatus === 1 ? '#faad14' : '#999' }">
              {{ sunshadeStatus === 1 ? '● 已展开' : '○ 已收起' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="auto-tip" v-else>
      <text class="tip-icon">🤖</text>
      <text class="tip-title">当前为自动模式</text>
      <text class="tip-desc">系统将根据环境参数自动调控设备</text>
      <u-button type="primary" @click="switchToManual">切换到手动模式</u-button>
    </view>

    <view class="device-list-section">
      <view class="section-header">
        <text class="section-title">设备列表</text>
        <text class="online-count">在线 {{ onlineCount }}/{{ deviceList.length }}</text>
      </view>
      <view class="device-item" v-for="device in deviceList" :key="device.id">
        <view class="device-icon" :class="'type-' + device.deviceType">
          {{ getDeviceIcon(device.deviceType) }}
        </view>
        <view class="device-info">
          <view class="device-name">{{ device.deviceName }}</view>
          <view class="device-code">{{ device.deviceCode }} · {{ device.zone }}</view>
        </view>
        <view class="device-status" :class="'status-' + device.deviceStatus">
          {{ getStatusText(device.deviceStatus) }}
        </view>
      </view>
    </view>

    <view class="recent-logs">
      <view class="section-header">
        <text class="section-title">最近操作</text>
      </view>
      <view class="log-item" v-for="log in recentLogs" :key="log.id">
        <view class="log-time">{{ formatTime(log.commandTime) }}</view>
        <view class="log-content">
          <text class="log-device">{{ log.deviceName }}</text>
          <text class="log-action">{{ log.actionType === 1 ? '开启' : '关闭' }}</text>
        </view>
        <view class="log-source" :class="'source-' + log.triggerSource">
          {{ getSourceText(log.triggerSource) }}
        </view>
      </view>
      <view class="empty" v-if="!recentLogs.length">
        暂无操作记录
      </view>
    </view>
  </view>
</template>

<script>
import { api, deviceStatusMap } from '@/config'

export default {
  data() {
    return {
      greenhouseId: 1,
      currentMode: 1,
      fanStatus: 0,
      wetCurtainStatus: 0,
      sunshadeStatus: 0,
      deviceList: [],
      recentLogs: [],
      onlineCount: 0
    }
  },
  onLoad(options) {
    if (options.greenhouseId) {
      this.greenhouseId = parseInt(options.greenhouseId)
    }
    this.loadData()
  },
  methods: {
    async loadData() {
      await this.loadRealTimeData()
      await this.loadDeviceList()
      await this.loadRecentLogs()
    },
    async loadRealTimeData() {
      try {
        const data = await api.getRealTimeData(this.greenhouseId)
        this.fanStatus = data.fanStatus || 0
        this.wetCurtainStatus = data.wetCurtainStatus || 0
        this.sunshadeStatus = data.sunshadeStatus || 0
      } catch (e) {
        console.error(e)
      }
    },
    async loadDeviceList() {
      try {
        this.deviceList = await api.getDeviceByGreenhouse(this.greenhouseId)
        this.onlineCount = this.deviceList.filter(d => d.deviceStatus > 0).length
      } catch (e) {
        console.error(e)
      }
    },
    async loadRecentLogs() {
      try {
        const logs = await api.getControlHistory(
          this.greenhouseId,
          this.getDateBefore(7),
          new Date().toISOString()
        )
        this.recentLogs = logs.slice(0, 10)
      } catch (e) {
        console.error(e)
      }
    },
    getDateBefore(days) {
      const date = new Date()
      date.setDate(date.getDate() - days)
      return date.toISOString()
    },
    toggleFan(e) {
      const action = e.value ? 1 : 0
      this.controlDevice('FAN001', 1, action, e.value ? '开启风机' : '关闭风机')
    },
    toggleWetCurtain(e) {
      const action = e.value ? 1 : 0
      this.controlDevice('WC001', 2, action, e.value ? '开启湿帘' : '关闭湿帘')
    },
    toggleSunshade(e) {
      const action = e.value ? 1 : 0
      this.controlDevice('SN001', 3, action, e.value ? '展开遮阳网' : '收起遮阳网')
    },
    async controlDevice(deviceCode, deviceType, action, remark) {
      try {
        const success = await api.manualControl({
          deviceCode,
          deviceType,
          action,
          actionParams: remark,
          operator: 'mobile_user',
          remark
        })
        
        if (success) {
          uni.showToast({ title: '操作成功', icon: 'success' })
          setTimeout(() => this.loadData(), 1000)
        } else {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },
    switchToManual() {
      this.currentMode = 0
      api.switchMode({ greenhouseId: this.greenhouseId, mode: 0 })
    },
    getDeviceIcon(type) {
      const icons = { 1: '💨', 2: '💧', 3: '☀️', 10: '🌡️', 11: '💦', 99: '📡' }
      return icons[type] || '📱'
    },
    getStatusText(status) {
      return deviceStatusMap[status]?.text || '未知'
    },
    getSourceText(source) {
      const map = { 'MANUAL': '手动', 'AUTO': '自动', 'TIMED': '定时' }
      return map[source] || source
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
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.control-panel {
  .panel-header {
    background: linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%);
    border-radius: 20rpx;
    padding: 32rpx;
    color: #fff;
    margin-bottom: 24rpx;
    
    .panel-title {
      font-size: 36rpx;
      font-weight: bold;
      display: block;
    }
    
    .panel-tip {
      font-size: 26rpx;
      opacity: 0.9;
      margin-top: 8rpx;
      display: block;
    }
  }
  
  .control-group {
    margin-bottom: 24rpx;
    
    .group-title {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 16rpx;
      padding-left: 8rpx;
    }
  }
  
  .control-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
    
    .card-header {
      display: flex;
      align-items: center;
      
      .device-emoji {
        font-size: 48rpx;
        margin-right: 20rpx;
      }
      
      .card-info {
        flex: 1;
        
        .device-name {
          font-size: 30rpx;
          color: #333;
          font-weight: bold;
          display: block;
        }
        
        .device-desc {
          font-size: 24rpx;
          color: #999;
          margin-top: 4rpx;
          display: block;
        }
      }
    }
    
    .card-footer {
      margin-top: 16rpx;
      padding-top: 16rpx;
      border-top: 1rpx solid #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .status-text {
        font-size: 26rpx;
      }
      
      .warning {
        font-size: 24rpx;
        color: #ff4d4f;
      }
    }
  }
}

.auto-tip {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 32rpx;
  text-align: center;
  margin-bottom: 24rpx;
  
  .tip-icon {
    font-size: 80rpx;
    display: block;
    margin-bottom: 24rpx;
  }
  
  .tip-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .tip-desc {
    font-size: 28rpx;
    color: #999;
    display: block;
    margin-bottom: 32rpx;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .online-count {
    font-size: 26rpx;
    color: #52c41a;
  }
}

.device-list-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  
  .device-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .device-icon {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      margin-right: 20rpx;
    }
    
    .device-info {
      flex: 1;
      
      .device-name {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 4rpx;
      }
      
      .device-code {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .device-status {
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      
      &.status-0 { background: #f5f5f5; color: #999; }
      &.status-1 { background: #f6ffed; color: #52c41a; }
      &.status-2 { background: #e6f7ff; color: #1890ff; }
      &.status-3 { background: #fff1f0; color: #ff4d4f; }
    }
  }
}

.recent-logs {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  
  .log-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .log-time {
      width: 140rpx;
      font-size: 24rpx;
      color: #999;
    }
    
    .log-content {
      flex: 1;
      
      .log-device {
        font-size: 28rpx;
        color: #333;
        margin-right: 12rpx;
      }
      
      .log-action {
        font-size: 26rpx;
        color: #1890ff;
      }
    }
    
    .log-source {
      padding: 4rpx 12rpx;
      border-radius: 12rpx;
      font-size: 22rpx;
      
      &.source-MANUAL { background: #fff7e6; color: #fa8c16; }
      &.source-AUTO { background: #f6ffed; color: #52c41a; }
      &.source-TIMED { background: #e6f7ff; color: #1890ff; }
    }
  }
  
  .empty {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 26rpx;
  }
}
</style>
