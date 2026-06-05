<template>
  <view class="page">
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="title">智慧大棚监控</view>
        <view class="subtitle">{{ currentTime }}</view>
      </view>
    </view>

    <view class="greenhouse-tabs">
      <scroll-view scroll-x class="tabs-scroll">
        <view 
          v-for="gh in greenhouseList" 
          :key="gh.id"
          class="tab-item"
          :class="{ active: currentGreenhouseId === gh.id }"
          @click="switchGreenhouse(gh.id)"
        >
          {{ gh.name }}
        </view>
      </scroll-view>
    </view>

    <view class="content" v-if="realTimeData">
      <view class="env-card">
        <view class="env-title">
          <text class="env-icon">🌡️</text>
          <text>实时环境数据</text>
        </view>
        <view class="env-grid">
          <view class="env-item">
            <view class="env-value" :style="{ color: getTempColor(realTimeData.temperature) }">
              {{ realTimeData.temperature || '--' }}<text class="unit">℃</text>
            </view>
            <view class="env-label">温度</view>
          </view>
          <view class="env-item">
            <view class="env-value" :style="{ color: getHumidityColor(realTimeData.humidity) }">
              {{ realTimeData.humidity || '--' }}<text class="unit">%</text>
            </view>
            <view class="env-label">湿度</view>
          </view>
          <view class="env-item">
            <view class="env-value">
              {{ realTimeData.co2 || '--' }}<text class="unit">ppm</text>
            </view>
            <view class="env-label">CO₂</view>
          </view>
          <view class="env-item">
            <view class="env-value">
              {{ formatLight(realTimeData.lightIntensity) }}<text class="unit">lux</text>
            </view>
            <view class="env-label">光照</view>
          </view>
        </view>
      </view>

      <view class="device-card">
        <view class="card-title">
          <text>设备状态</text>
          <text class="mode-tag" :class="modeClass">
            {{ modeText }}
          </text>
        </view>
        <view class="device-list">
          <view class="device-item" @click="goToDevice">
            <view class="device-icon fan" :class="{ active: realTimeData.fanStatus === 1 }">
              <text>💨</text>
            </view>
            <view class="device-info">
              <view class="device-name">风机</view>
              <view class="device-status" :style="{ color: realTimeData.fanStatus === 1 ? '#52c41a' : '#999' }">
                {{ realTimeData.fanStatus === 1 ? '运行中' : '已关闭' }}
              </view>
            </view>
            <text class="arrow">›</text>
          </view>
          <view class="device-item" @click="goToDevice">
            <view class="device-icon wet" :class="{ active: realTimeData.wetCurtainStatus === 1 }">
              <text>💧</text>
            </view>
            <view class="device-info">
              <view class="device-name">湿帘</view>
              <view class="device-status" :style="{ color: realTimeData.wetCurtainStatus === 1 ? '#52c41a' : '#999' }">
                {{ realTimeData.wetCurtainStatus === 1 ? '运行中' : '已关闭' }}
              </view>
            </view>
            <text class="arrow">›</text>
          </view>
          <view class="device-item" @click="goToDevice">
            <view class="device-icon sun" :class="{ active: realTimeData.sunshadeStatus === 1 }">
              <text>☀️</text>
            </view>
            <view class="device-info">
              <view class="device-name">遮阳网</view>
              <view class="device-status" :style="{ color: realTimeData.sunshadeStatus === 1 ? '#52c41a' : '#999' }">
                {{ realTimeData.sunshadeStatus === 1 ? '已展开' : '已收起' }}
              </view>
            </view>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <view class="maintenance-card" v-if="needMaintenanceList && needMaintenanceList.length > 0">
        <view class="card-title">
          <text class="warning-icon">⚠️</text>
          <text>保养提醒</text>
          <text class="badge">{{ needMaintenanceList.length }}</text>
        </view>
        <view class="maintenance-list">
          <view 
            class="maintenance-item" 
            v-for="item in needMaintenanceList" 
            :key="item.id"
            @click="viewMaintenanceDetail(item)"
          >
            <view class="maintenance-info">
              <view class="device-name">{{ item.deviceName }}</view>
              <view class="maintenance-desc">
                <text class="status-tag" :class="'status-' + item.maintenanceStatus">
                  {{ item.maintenanceStatus === 2 ? '已超期' : '待保养' }}
                </text>
                <text class="run-hours">累计运行 {{ item.totalRunHours }} 小时</text>
              </view>
            </view>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <view class="quick-actions">
        <view class="action-item" @click="switchMode">
          <text class="action-icon">🔄</text>
          <text>切换模式</text>
        </view>
        <view class="action-item" @click="goToHistory">
          <text class="action-icon">📊</text>
          <text>历史数据</text>
        </view>
        <view class="action-item" @click="goToInspect">
          <text class="action-icon">📝</text>
          <text>巡检记录</text>
        </view>
      </view>
    </view>

    <view class="loading" v-else>
      <u-loading-icon mode="flower" size="48"></u-loading-icon>
      <text class="loading-text">数据加载中...</text>
    </view>
  </view>
</template>

<script>
import api from '@/api'
import { controlModeMap } from '@/config'

export default {
  data() {
    return {
      currentTime: '',
      currentGreenhouseId: 1,
      greenhouseList: [],
      realTimeData: null,
      currentMode: 1,
      timer: null,
      ws: null,
      needMaintenanceList: []
    }
  },
  computed: {
    modeText() {
      return controlModeMap[this.currentMode]?.text || '自动'
    },
    modeClass() {
      return 'mode-' + this.currentMode
    }
  },
  onLoad() {
    this.updateTime()
    this.loadGreenhouseList()
    this.loadNeedMaintenance()
    this.startTimer()
    this.connectWebSocket()
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.ws) {
      this.ws.close()
    }
  },
  onPullDownRefresh() {
    this.loadData()
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 1000)
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long'
      }) + ' ' + now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    startTimer() {
      this.timer = setInterval(() => {
        this.updateTime()
      }, 1000)
    },
    async loadGreenhouseList() {
      try {
        this.greenhouseList = await api.getGreenhouseList()
        if (this.greenhouseList.length > 0) {
          this.currentGreenhouseId = this.greenhouseList[0].id
        }
        this.loadData()
      } catch (e) {
        console.error('Load greenhouse list error', e)
        this.greenhouseList = [
          { id: 1, name: '1号大棚', code: 'GH001' },
          { id: 2, name: '2号大棚', code: 'GH002' },
          { id: 3, name: '3号大棚', code: 'GH003' }
        ]
        this.loadData()
      }
    },
    async loadNeedMaintenance() {
      try {
        this.needMaintenanceList = await api.getNeedMaintenance()
      } catch (e) {
        console.error('Load need maintenance error', e)
        this.needMaintenanceList = [
          { id: 1, deviceCode: 'FAN001', deviceName: '1号风机', maintenanceStatus: 1, totalRunHours: 1256.5 },
          { id: 2, deviceCode: 'WC001', deviceName: '1号湿帘', maintenanceStatus: 2, totalRunHours: 856.0 }
        ]
      }
    },
    viewMaintenanceDetail(item) {
      uni.showModal({
        title: '保养提醒',
        content: `${item.deviceName}需要保养，累计运行${item.totalRunHours}小时。\n是否前往设备页面查看详情？`,
        confirmText: '前往查看',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({ url: '/pages/device/device?greenhouseId=' + this.currentGreenhouseId })
          }
        }
      })
    },
    switchGreenhouse(id) {
      this.currentGreenhouseId = id
      this.loadData()
    },
    async loadData() {
      try {
        this.realTimeData = await api.getRealTimeData(this.currentGreenhouseId)
      } catch (e) {
        console.error('Load data error', e)
      }
    },
    connectWebSocket() {
      // #ifdef H5 || APP-PLUS
      try {
        this.ws = uni.connectSocket({
          url: this.$config.wsUrl,
          success: () => {
            console.log('WebSocket连接成功')
          }
        })
        
        uni.onSocketMessage((res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.greenhouseId === this.currentGreenhouseId) {
              this.realTimeData = data
            }
          } catch (e) {
            console.error('Parse message error', e)
          }
        })
      } catch (e) {
        console.error('WebSocket error', e)
      }
      // #endif
    },
    getTempColor(temp) {
      if (!temp) return '#333'
      if (temp >= 35) return '#ff4d4f'
      if (temp >= 30) return '#faad14'
      if (temp <= 10) return '#1890ff'
      return '#52c41a'
    },
    getHumidityColor(humidity) {
      if (!humidity) return '#333'
      if (humidity >= 90 || humidity <= 20) return '#ff4d4f'
      return '#52c41a'
    },
    formatLight(light) {
      if (!light) return '--'
      if (light >= 10000) {
        return (light / 10000).toFixed(1) + '万'
      }
      return light.toFixed(0)
    },
    switchMode() {
      uni.showActionSheet({
        itemList: ['手动模式', '自动模式', '定时模式'],
        success: (res) => {
          const mode = res.tapIndex
          this.currentMode = mode
          api.switchMode({
            greenhouseId: this.currentGreenhouseId,
            mode: mode
          })
          uni.showToast({
            title: '已切换为' + controlModeMap[mode].text,
            icon: 'success'
          })
        }
      })
    },
    goToDevice() {
      uni.navigateTo({ url: '/pages/device/device?greenhouseId=' + this.currentGreenhouseId })
    },
    goToHistory() {
      uni.navigateTo({ url: '/pages/history/history?greenhouseId=' + this.currentGreenhouseId })
    },
    goToInspect() {
      uni.navigateTo({ url: '/pages/inspect/inspect' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  position: relative;
  height: 320rpx;
  overflow: hidden;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1989fa 0%, #007aff 100%);
    border-radius: 0 0 40rpx 40rpx;
  }
  
  .header-content {
    position: relative;
    z-index: 1;
    padding: 80rpx 32rpx 0;
    color: #fff;
    
    .title {
      font-size: 44rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
    }
    
    .subtitle {
      font-size: 26rpx;
      opacity: 0.9;
    }
  }
}

.greenhouse-tabs {
  margin: -60rpx 24rpx 0;
  position: relative;
  z-index: 2;
  
  .tabs-scroll {
    white-space: nowrap;
  }
  
  .tab-item {
    display: inline-block;
    padding: 24rpx 40rpx;
    margin-right: 16rpx;
    background: #fff;
    border-radius: 16rpx;
    font-size: 28rpx;
    color: #666;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
    
    &.active {
      background: #1989fa;
      color: #fff;
    }
  }
}

.content {
  padding: 24rpx;
}

.env-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  
  .env-title {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 32rpx;
    
    .env-icon {
      margin-right: 12rpx;
    }
  }
  
  .env-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32rpx;
  }
  
  .env-item {
    text-align: center;
    
    .env-value {
      font-size: 56rpx;
      font-weight: bold;
      color: #333;
      
      .unit {
        font-size: 24rpx;
        font-weight: normal;
        margin-left: 4rpx;
      }
    }
    
    .env-label {
      font-size: 26rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }
}

.device-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  
  .card-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    
    .mode-tag {
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      font-weight: normal;
      
      &.mode-0 { background: #fff7e6; color: #fa8c16; }
      &.mode-1 { background: #f6ffed; color: #52c41a; }
      &.mode-2 { background: #e6f7ff; color: #1890ff; }
    }
  }
  
  .device-list {
    .device-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .device-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36rpx;
        margin-right: 24rpx;
        transition: all 0.3s;
        
        &.active {
          background: #e6f7ff;
          animation: pulse 2s infinite;
        }
        
        &.fan.active { background: #e6f7ff; }
        &.wet.active { background: #e6fffb; }
        &.sun.active { background: #fffbe6; }
      }
      
      .device-info {
        flex: 1;
        
        .device-name {
          font-size: 30rpx;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .device-status {
          font-size: 26rpx;
          color: #999;
        }
      }
      
      .arrow {
        color: #ccc;
        font-size: 36rpx;
      }
    }
  }
}

.maintenance-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  border-left: 8rpx solid #faad14;
  
  .card-title {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    
    .warning-icon {
      margin-right: 12rpx;
      font-size: 36rpx;
    }
    
    .badge {
      margin-left: auto;
      background: #ff7875;
      color: #fff;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      font-weight: normal;
    }
  }
  
  .maintenance-list {
    .maintenance-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .maintenance-info {
        flex: 1;
        
        .device-name {
          font-size: 30rpx;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .maintenance-desc {
          display: flex;
          align-items: center;
          gap: 16rpx;
          
          .status-tag {
            padding: 4rpx 16rpx;
            border-radius: 8rpx;
            font-size: 24rpx;
            
            &.status-1 {
              background: #fff7e6;
              color: #fa8c16;
            }
            
            &.status-2 {
              background: #fff1f0;
              color: #f5222d;
            }
          }
          
          .run-hours {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
      
      .arrow {
        color: #ccc;
        font-size: 36rpx;
      }
    }
  }
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx 0;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .action-icon {
      font-size: 48rpx;
      margin-bottom: 12rpx;
    }
    
    text {
      font-size: 26rpx;
      color: #666;
    }
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .loading-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #999;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
