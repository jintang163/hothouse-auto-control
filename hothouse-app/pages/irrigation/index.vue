<template>
  <view class="page">
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="title">智能灌溉控制</view>
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

    <view class="content" v-if="homeData">
      <view class="realtime-card">
        <view class="card-title">
          <text class="card-icon">📊</text>
          <text>实时数据</text>
        </view>
        <view class="realtime-grid">
          <view class="realtime-item">
            <view class="realtime-icon" style="background: #e6f7ff;">💧</view>
            <view class="realtime-info">
              <view class="realtime-value" :style="{ color: getHumidityColor(homeData.soilHumidity) }">
                {{ homeData.soilHumidity || '--' }}<text class="unit">%</text>
              </view>
              <view class="realtime-label">土壤湿度</view>
            </view>
          </view>
          <view class="realtime-item">
            <view class="realtime-icon" style="background: #f6ffed;">🧪</view>
            <view class="realtime-info">
              <view class="realtime-value" :style="{ color: getEcColor(homeData.ecValue) }">
                {{ homeData.ecValue || '--' }}<text class="unit">ms/cm</text>
              </view>
              <view class="realtime-label">EC值</view>
            </view>
          </view>
          <view class="realtime-item">
            <view class="realtime-icon" style="background: #fff7e6;">⚗️</view>
            <view class="realtime-info">
              <view class="realtime-value" :style="{ color: getPhColor(homeData.phValue) }">
                {{ homeData.phValue || '--' }}<text class="unit">pH</text>
              </view>
              <view class="realtime-label">pH值</view>
            </view>
          </view>
          <view class="realtime-item">
            <view class="realtime-icon" style="background: #f9f0ff;">💨</view>
            <view class="realtime-info">
              <view class="realtime-value" :style="{ color: getPressureColor(homeData.waterPressure) }">
                {{ homeData.waterPressure || '--' }}<text class="unit">MPa</text>
              </view>
              <view class="realtime-label">水压</view>
            </view>
          </view>
        </view>
      </view>

      <view class="tanks-card">
        <view class="card-title">
          <text class="card-icon">🛢️</text>
          <text>储罐液位</text>
        </view>
        <view class="tanks-list">
          <view class="tank-item" v-for="tank in tanks" :key="tank.type">
            <view class="tank-header">
              <text class="tank-icon">{{ getTankIcon(tank.type) }}</text>
              <text class="tank-name">{{ getTankName(tank.type) }}</text>
              <text class="tank-percent" :style="{ color: getTankPercentColor(tank.percent) }">
                {{ tank.percent || 0 }}%
              </text>
            </view>
            <view class="tank-progress">
              <view class="progress-bar">
                <view 
                  class="progress-fill" 
                  :style="{ width: (tank.percent || 0) + '%', background: getTankColor(tank.type) }"
                ></view>
              </view>
            </view>
            <view class="tank-footer">
              <text class="tank-level">{{ tank.currentLevel || 0 }}L</text>
              <text class="tank-capacity">/ {{ tank.capacity || 0 }}L</text>
            </view>
          </view>
        </view>
      </view>

      <view class="quick-actions-card">
        <view class="card-title">
          <text class="card-icon">⚡</text>
          <text>快捷操作</text>
        </view>
        <view class="quick-actions">
          <view class="quick-btn water" @click="goToManualIrrigation">
            <text class="btn-icon">💧</text>
            <text class="btn-text">手动灌溉</text>
          </view>
          <view class="quick-btn fertigation" @click="oneClickFertigation">
            <text class="btn-icon">🌱</text>
            <text class="btn-text">一键水肥</text>
          </view>
          <view class="quick-btn stop" @click="emergencyStop">
            <text class="btn-icon">🛑</text>
            <text class="btn-text">紧急停止</text>
          </view>
        </view>
      </view>

      <view class="stats-card">
        <view class="card-title">
          <text class="card-icon">📈</text>
          <text>今日统计</text>
        </view>
        <view class="stats-grid">
          <view class="stats-item">
            <view class="stats-value" style="color: #1890ff;">{{ homeData.todayWaterUsage || 0 }}</view>
            <view class="stats-label">用水量 (L)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value" style="color: #52c41a;">{{ homeData.todayFertilizerUsage || 0 }}</view>
            <view class="stats-label">用肥量 (kg)</view>
          </view>
          <view class="stats-item">
            <view class="stats-value" style="color: #fa8c16;">{{ homeData.todayIrrigationCount || 0 }}</view>
            <view class="stats-label">灌溉次数</view>
          </view>
          <view class="stats-item">
            <view class="stats-value" style="color: #722ed1;">{{ homeData.todayAvgEc || '--' }}</view>
            <view class="stats-label">平均EC</view>
          </view>
        </view>
      </view>

      <view class="alarm-card" v-if="pendingAlarms && pendingAlarms.length > 0">
        <view class="card-title" @click="goToAlarmList">
          <text class="card-icon">⚠️</text>
          <text>待处理告警</text>
          <text class="badge">{{ pendingAlarms.length }}</text>
          <text class="more">查看全部 ›</text>
        </view>
        <view class="alarm-list">
          <view 
            class="alarm-item" 
            v-for="alarm in pendingAlarms.slice(0, 3)" 
            :key="alarm.id"
            @click="goToAlarmList"
          >
            <view class="alarm-icon" :class="'level-' + alarm.level">
              {{ getAlarmIcon(alarm.level) }}
            </view>
            <view class="alarm-content">
              <view class="alarm-type">{{ getAlarmTypeText(alarm.type) }}</view>
              <view class="alarm-desc">{{ alarm.content }}</view>
            </view>
            <text class="alarm-time">{{ formatTime(alarm.time) }}</text>
          </view>
        </view>
      </view>

      <view class="record-card">
        <view class="card-title" @click="goToRecordList">
          <text class="card-icon">📋</text>
          <text>最近灌溉记录</text>
          <text class="more">查看全部 ›</text>
        </view>
        <view class="record-list">
          <view 
            class="record-item" 
            v-for="record in recentRecords" 
            :key="record.id"
          >
            <view class="record-icon" :style="{ background: getTaskTypeBg(record.type) }">
              {{ getTaskTypeIcon(record.type) }}
            </view>
            <view class="record-content">
              <view class="record-type">{{ getTaskTypeText(record.type) }}</view>
              <view class="record-meta">
                <text>{{ record.area }}</text>
                <text>·</text>
                <text>{{ record.duration }}分钟</text>
                <text>·</text>
                <text>{{ record.waterUsage }}L</text>
              </view>
            </view>
            <view class="record-status">
              <text class="status-tag" :style="{ color: getTaskStatusColor(record.status), background: getTaskStatusBg(record.status) }">
                {{ getTaskStatusText(record.status) }}
              </text>
              <text class="record-time">{{ formatTime(record.startTime) }}</text>
            </view>
          </view>
          <view class="empty" v-if="!recentRecords || recentRecords.length === 0">
            <text class="empty-text">暂无灌溉记录</text>
          </view>
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
import { 
  irrigationTaskTypeMap, 
  irrigationTaskStatusMap, 
  irrigationAlarmLevelMap,
  irrigationAlarmTypeMap,
  tankTypeMap,
  greenhouseList 
} from '@/config'

export default {
  data() {
    return {
      currentTime: '',
      currentGreenhouseId: 1,
      greenhouseList: [],
      homeData: null,
      tanks: [],
      pendingAlarms: [],
      recentRecords: [],
      timer: null
    }
  },
  onLoad() {
    this.updateTime()
    this.loadGreenhouseList()
    this.startTimer()
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
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
        this.greenhouseList = greenhouseList
        this.loadData()
      }
    },
    switchGreenhouse(id) {
      this.currentGreenhouseId = id
      this.loadData()
    },
    async loadData() {
      try {
        this.homeData = await api.getIrrigationHome(this.currentGreenhouseId)
        await this.loadTanks()
        await this.loadPendingAlarms()
        await this.loadRecentRecords()
      } catch (e) {
        console.error('Load data error', e)
        this.loadMockData()
      }
    },
    loadMockData() {
      this.homeData = {
        soilHumidity: 65,
        ecValue: 1.8,
        phValue: 6.5,
        waterPressure: 0.35,
        todayWaterUsage: 1250,
        todayFertilizerUsage: 25.5,
        todayIrrigationCount: 4,
        todayAvgEc: 1.75
      }
      this.tanks = [
        { type: 'WATER', currentLevel: 850, capacity: 1000, percent: 85 },
        { type: 'NUTRIENT_A', currentLevel: 420, capacity: 500, percent: 84 },
        { type: 'NUTRIENT_B', currentLevel: 380, capacity: 500, percent: 76 },
        { type: 'ACID', currentLevel: 150, capacity: 200, percent: 75 }
      ]
      this.pendingAlarms = [
        { id: 1, type: 'SOIL_HUMIDITY_LOW', level: 2, content: 'A区土壤湿度低于阈值55%', time: new Date(Date.now() - 1800000).toISOString() },
        { id: 2, type: 'EC_LOW', level: 1, content: 'EC值偏低，建议调整配方', time: new Date(Date.now() - 3600000).toISOString() }
      ]
      this.recentRecords = [
        { id: 1, type: 'FERTIGATION', area: 'A区', duration: 30, waterUsage: 180, status: 2, startTime: new Date(Date.now() - 7200000).toISOString() },
        { id: 2, type: 'WATER', area: 'B区', duration: 20, waterUsage: 120, status: 2, startTime: new Date(Date.now() - 14400000).toISOString() },
        { id: 3, type: 'FERTIGATION', area: 'C区', duration: 25, waterUsage: 150, status: 1, startTime: new Date(Date.now() - 1800000).toISOString() }
      ]
    },
    async loadTanks() {
      try {
        this.tanks = await api.getIrrigationTanks(this.currentGreenhouseId)
      } catch (e) {
        console.error('Load tanks error', e)
      }
    },
    async loadPendingAlarms() {
      try {
        this.pendingAlarms = await api.getIrrigationPendingAlarms(this.currentGreenhouseId)
      } catch (e) {
        console.error('Load pending alarms error', e)
      }
    },
    async loadRecentRecords() {
      try {
        const res = await api.getIrrigationTodayRecords(this.currentGreenhouseId)
        this.recentRecords = res.slice(0, 3)
      } catch (e) {
        console.error('Load recent records error', e)
      }
    },
    getHumidityColor(humidity) {
      if (!humidity) return '#333'
      if (humidity < 40 || humidity > 85) return '#ff4d4f'
      if (humidity < 55 || humidity > 75) return '#faad14'
      return '#52c41a'
    },
    getEcColor(ec) {
      if (!ec) return '#333'
      if (ec < 1.0 || ec > 2.5) return '#ff4d4f'
      if (ec < 1.2 || ec > 2.2) return '#faad14'
      return '#52c41a'
    },
    getPhColor(ph) {
      if (!ph) return '#333'
      if (ph < 5.5 || ph > 7.5) return '#ff4d4f'
      if (ph < 5.8 || ph > 7.2) return '#faad14'
      return '#52c41a'
    },
    getPressureColor(pressure) {
      if (!pressure) return '#333'
      if (pressure < 0.2) return '#ff4d4f'
      if (pressure < 0.25) return '#faad14'
      return '#52c41a'
    },
    getTankIcon(type) {
      return tankTypeMap[type]?.icon || '🛢️'
    },
    getTankName(type) {
      return tankTypeMap[type]?.text || '储罐'
    },
    getTankColor(type) {
      return tankTypeMap[type]?.color || '#999'
    },
    getTankPercentColor(percent) {
      if (percent < 20) return '#ff4d4f'
      if (percent < 30) return '#faad14'
      return '#52c41a'
    },
    getTaskTypeIcon(type) {
      return irrigationTaskTypeMap[type]?.icon || '💧'
    },
    getTaskTypeText(type) {
      return irrigationTaskTypeMap[type]?.text || '灌溉'
    },
    getTaskTypeBg(type) {
      const color = irrigationTaskTypeMap[type]?.color || '#999'
      return color + '20'
    },
    getTaskStatusText(status) {
      return irrigationTaskStatusMap[status]?.text || '未知'
    },
    getTaskStatusColor(status) {
      return irrigationTaskStatusMap[status]?.color || '#999'
    },
    getTaskStatusBg(status) {
      const colors = {
        0: '#fff7e6',
        1: '#e6f7ff',
        2: '#f6ffed',
        3: '#f5f5f5',
        4: '#fff1f0'
      }
      return colors[status] || '#f5f5f5'
    },
    getAlarmIcon(level) {
      return irrigationAlarmLevelMap[level]?.icon || '⚠️'
    },
    getAlarmTypeText(type) {
      return irrigationAlarmTypeMap[type]?.text || '告警'
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
    goToManualIrrigation() {
      uni.navigateTo({ url: '/pages/irrigation-control/control?greenhouseId=' + this.currentGreenhouseId })
    },
    oneClickFertigation() {
      uni.showModal({
        title: '一键水肥',
        content: '确定要启动一键水肥灌溉吗？将按照当前配方自动执行水肥一体化灌溉。',
        confirmText: '确定启动',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showToast({ title: '已启动水肥灌溉', icon: 'success' })
              setTimeout(() => this.loadData(), 1000)
            } catch (e) {
              uni.showToast({ title: '启动失败', icon: 'none' })
            }
          }
        }
      })
    },
    emergencyStop() {
      uni.showModal({
        title: '紧急停止',
        content: '确定要紧急停止所有灌溉设备吗？此操作将立即关闭所有相关阀门和泵。',
        confirmText: '紧急停止',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showToast({ title: '已执行紧急停止', icon: 'success' })
              setTimeout(() => this.loadData(), 1000)
            } catch (e) {
              uni.showToast({ title: '操作失败', icon: 'none' })
            }
          }
        }
      })
    },
    goToAlarmList() {
      uni.navigateTo({ url: '/pages/irrigation-alarm/alarm?greenhouseId=' + this.currentGreenhouseId })
    },
    goToRecordList() {
      uni.navigateTo({ url: '/pages/irrigation-record/record?greenhouseId=' + this.currentGreenhouseId })
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
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
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
      background: #1890ff;
      color: #fff;
    }
  }
}

.content {
  padding: 24rpx;
}

.realtime-card, .tanks-card, .quick-actions-card, .stats-card, .alarm-card, .record-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  
  .card-title {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    
    .card-icon {
      margin-right: 12rpx;
      font-size: 36rpx;
    }
    
    .badge {
      margin-left: 12rpx;
      background: #ff4d4f;
      color: #fff;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      font-weight: normal;
    }
    
    .more {
      margin-left: auto;
      font-size: 24rpx;
      color: #1890ff;
      font-weight: normal;
    }
  }
}

.realtime-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  
  .realtime-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: #fafafa;
    border-radius: 16rpx;
    
    .realtime-icon {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      margin-right: 16rpx;
    }
    
    .realtime-info {
      .realtime-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        
        .unit {
          font-size: 20rpx;
          font-weight: normal;
          margin-left: 4rpx;
        }
      }
      
      .realtime-label {
        font-size: 22rpx;
        color: #999;
        margin-top: 4rpx;
      }
    }
  }
}

.tanks-list {
  .tank-item {
    margin-bottom: 20rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .tank-header {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      
      .tank-icon {
        font-size: 28rpx;
        margin-right: 8rpx;
      }
      
      .tank-name {
        font-size: 26rpx;
        color: #333;
        flex: 1;
      }
      
      .tank-percent {
        font-size: 28rpx;
        font-weight: bold;
      }
    }
    
    .tank-progress {
      .progress-bar {
        height: 16rpx;
        background: #f0f0f0;
        border-radius: 8rpx;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          border-radius: 8rpx;
          transition: width 0.3s;
        }
      }
    }
    
    .tank-footer {
      display: flex;
      align-items: baseline;
      margin-top: 8rpx;
      
      .tank-level {
        font-size: 24rpx;
        color: #333;
        font-weight: bold;
      }
      
      .tank-capacity {
        font-size: 22rpx;
        color: #999;
      }
    }
  }
}

.quick-actions {
  display: flex;
  gap: 20rpx;
  
  .quick-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32rpx 16rpx;
    border-radius: 16rpx;
    
    .btn-icon {
      font-size: 48rpx;
      margin-bottom: 12rpx;
    }
    
    .btn-text {
      font-size: 26rpx;
      font-weight: bold;
    }
    
    &.water {
      background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
      color: #1890ff;
    }
    
    &.fertigation {
      background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
      color: #52c41a;
    }
    
    &.stop {
      background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
      color: #ff4d4f;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  
  .stats-item {
    text-align: center;
    padding: 16rpx 8rpx;
    background: #fafafa;
    border-radius: 12rpx;
    
    .stats-value {
      font-size: 36rpx;
      font-weight: bold;
    }
    
    .stats-label {
      font-size: 22rpx;
      color: #999;
      margin-top: 4rpx;
    }
  }
}

.alarm-list {
  .alarm-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .alarm-icon {
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      margin-right: 16rpx;
      flex-shrink: 0;
      
      &.level-1 { background: #e6f7ff; }
      &.level-2 { background: #fff7e6; }
      &.level-3 { background: #fff1f0; }
      &.level-4 { background: #f9f0ff; }
    }
    
    .alarm-content {
      flex: 1;
      min-width: 0;
      
      .alarm-type {
        font-size: 26rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 4rpx;
      }
      
      .alarm-desc {
        font-size: 22rpx;
        color: #999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .alarm-time {
      font-size: 22rpx;
      color: #ccc;
      flex-shrink: 0;
      margin-left: 16rpx;
    }
  }
}

.record-list {
  .record-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .record-icon {
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      margin-right: 16rpx;
      flex-shrink: 0;
    }
    
    .record-content {
      flex: 1;
      min-width: 0;
      
      .record-type {
        font-size: 26rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 4rpx;
      }
      
      .record-meta {
        font-size: 22rpx;
        color: #999;
        
        text {
          margin-right: 4rpx;
        }
      }
    }
    
    .record-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex-shrink: 0;
      margin-left: 16rpx;
      
      .status-tag {
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        font-size: 20rpx;
        margin-bottom: 4rpx;
      }
      
      .record-time {
        font-size: 22rpx;
        color: #ccc;
      }
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

.empty {
  text-align: center;
  padding: 40rpx 0;
  
  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>
