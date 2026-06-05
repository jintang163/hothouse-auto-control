<template>
  <view class="page">
    <view class="filter-bar">
      <view class="greenhouse-select">
        <picker :range="greenhouseList" range-key="name" @change="onGreenhouseChange">
          <view class="picker-btn">
            <text>{{ currentGreenhouse.name }}</text>
            <text class="arrow">▼</text>
          </view>
        </picker>
      </view>
      <view class="time-select">
        <view 
          class="time-btn" 
          :class="{ active: timeRange === '1h' }" 
          @click="setTimeRange('1h')"
        >
          1小时
        </view>
        <view 
          class="time-btn" 
          :class="{ active: timeRange === '6h' }" 
          @click="setTimeRange('6h')"
        >
          6小时
        </view>
        <view 
          class="time-btn" 
          :class="{ active: timeRange === '24h' }" 
          @click="setTimeRange('24h')"
        >
          24小时
        </view>
        <view 
          class="time-btn" 
          :class="{ active: timeRange === '7d' }" 
          @click="setTimeRange('7d')"
        >
          7天
        </view>
      </view>
    </view>

    <view class="chart-tabs">
      <view 
        class="chart-tab" 
        :class="{ active: activeChart === 'temperature' }"
        @click="activeChart = 'temperature'"
      >
        🌡️ 温度
      </view>
      <view 
        class="chart-tab" 
        :class="{ active: activeChart === 'humidity' }"
        @click="activeChart = 'humidity'"
      >
        💧 湿度
      </view>
      <view 
        class="chart-tab" 
        :class="{ active: activeChart === 'light' }"
        @click="activeChart = 'light'"
      >
        ☀️ 光照
      </view>
    </view>

    <view class="chart-container">
      <view class="chart-header">
        <text class="chart-title">{{ chartTitle }}</text>
        <text class="chart-range">{{ getTimeRangeText() }}</text>
      </view>
      <view class="chart-area">
        <canvas 
          class="line-chart" 
          canvas-id="lineChart" 
          id="lineChart"
          disable-scroll="true"
        ></canvas>
        <view class="y-axis">
          <text v-for="(label, idx) in yLabels" :key="idx" class="y-label">{{ label }}</text>
        </view>
        <view class="x-axis">
          <text v-for="(label, idx) in xLabels" :key="idx" class="x-label">{{ label }}</text>
        </view>
      </view>
      <view class="chart-legend">
        <view class="legend-item">
          <view class="legend-dot" style="background: #ff6b6b;"></view>
          <text>上限</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot" style="background: #1989fa;"></view>
          <text>当前</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot" style="background: #52c41a;"></view>
          <text>下限</text>
        </view>
      </view>
    </view>

    <view class="stats-container">
      <view class="stats-title">数据统计</view>
      <view class="stats-grid">
        <view class="stats-item">
          <text class="stats-label">最大值</text>
          <text class="stats-value" :style="{ color: '#ff4d4f' }">{{ stats.max }}<text class="stats-unit">{{ unit }}</text></text>
        </view>
        <view class="stats-item">
          <text class="stats-label">最小值</text>
          <text class="stats-value" :style="{ color: '#52c41a' }">{{ stats.min }}<text class="stats-unit">{{ unit }}</text></text>
        </view>
        <view class="stats-item">
          <text class="stats-label">平均值</text>
          <text class="stats-value" :style="{ color: '#1890ff' }">{{ stats.avg }}<text class="stats-unit">{{ unit }}</text></text>
        </view>
        <view class="stats-item">
          <text class="stats-label">数据点</text>
          <text class="stats-value" style="color: #666;">{{ stats.count }}</text>
        </view>
      </view>
    </view>

    <view class="data-list">
      <view class="list-title">详细数据</view>
      <view class="list-header">
        <text class="col-time">时间</text>
        <text class="col-value">温度</text>
        <text class="col-value">湿度</text>
        <text class="col-value">光照</text>
      </view>
      <view class="list-body">
        <view class="list-row" v-for="(item, idx) in recentData" :key="idx">
          <text class="col-time">{{ formatTime(item.collectTime) }}</text>
          <text class="col-value" :class="getTempClass(item.temperature)">{{ item.temperature }}°C</text>
          <text class="col-value" :class="getHumidityClass(item.humidity)">{{ item.humidity }}%</text>
          <text class="col-value">{{ item.light }}lux</text>
        </view>
        <view class="empty" v-if="!recentData.length">
          <text class="empty-text">暂无数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { api, greenhouseList } from '@/config'

export default {
  data() {
    return {
      greenhouseList,
      currentGreenhouse: greenhouseList[0],
      timeRange: '6h',
      activeChart: 'temperature',
      historyData: [],
      recentData: [],
      chartData: [],
      stats: { max: 0, min: 0, avg: 0, count: 0 },
      yLabels: [],
      xLabels: [],
      chartContext: null
    }
  },
  computed: {
    chartTitle() {
      const titles = {
        temperature: '温度变化曲线',
        humidity: '湿度变化曲线',
        light: '光照强度曲线'
      }
      return titles[this.activeChart]
    },
    unit() {
      const units = { temperature: '°C', humidity: '%', light: 'lux' }
      return units[this.activeChart]
    },
    upperLimit() {
      const limits = { temperature: 30, humidity: 85, light: 60000 }
      return limits[this.activeChart]
    },
    lowerLimit() {
      const limits = { temperature: 15, humidity: 50, light: 5000 }
      return limits[this.activeChart]
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
    onGreenhouseChange(e) {
      this.currentGreenhouse = this.greenhouseList[e.detail.value]
      this.loadData()
    },
    setTimeRange(range) {
      this.timeRange = range
      this.loadData()
    },
    getTimeRangeText() {
      const texts = {
        '1h': '最近1小时',
        '6h': '最近6小时',
        '24h': '最近24小时',
        '7d': '最近7天'
      }
      return texts[this.timeRange]
    },
    getTimeRangeHours() {
      const hours = { '1h': 1, '6h': 6, '24h': 24, '7d': 168 }
      return hours[this.timeRange]
    },
    async loadData() {
      try {
        const endTime = new Date()
        const startTime = new Date(endTime.getTime() - this.getTimeRangeHours() * 3600000)
        this.historyData = await api.getSensorHistory(
          this.currentGreenhouse.id,
          startTime.toISOString(),
          endTime.toISOString()
        )
        this.recentData = this.historyData.slice(-20).reverse()
        this.processChartData()
        this.calculateStats()
        this.drawChart()
      } catch (e) {
        console.error(e)
        this.generateMockData()
      }
    },
    generateMockData() {
      const now = Date.now()
      const points = 50
      this.historyData = []
      for (let i = 0; i < points; i++) {
        this.historyData.push({
          collectTime: new Date(now - (points - i) * 12 * 60000).toISOString(),
          temperature: 22 + Math.sin(i / 5) * 5 + Math.random() * 2,
          humidity: 60 + Math.sin(i / 7) * 15 + Math.random() * 5,
          light: 30000 + Math.sin(i / 6) * 20000 + Math.random() * 5000
        })
      }
      this.recentData = this.historyData.slice(-20).reverse()
      this.processChartData()
      this.calculateStats()
      this.drawChart()
    },
    processChartData() {
      this.chartData = this.historyData.map(item => ({
        time: new Date(item.collectTime),
        value: item[this.activeChart]
      }))
      const values = this.chartData.map(d => d.value)
      const maxVal = Math.max(...values, this.upperLimit)
      const minVal = Math.min(...values, this.lowerLimit)
      const range = maxVal - minVal
      const step = range / 5
      this.yLabels = []
      for (let i = 5; i >= 0; i--) {
        this.yLabels.push((minVal + step * i).toFixed(this.activeChart === 'light' ? 0 : 1))
      }
      const xCount = 6
      this.xLabels = []
      const stepIdx = Math.floor(this.chartData.length / (xCount - 1))
      for (let i = 0; i < xCount; i++) {
        const idx = Math.min(i * stepIdx, this.chartData.length - 1)
        if (this.chartData[idx]) {
          const d = this.chartData[idx].time
          if (this.timeRange === '7d') {
            this.xLabels.push(`${d.getMonth() + 1}/${d.getDate()}`)
          } else {
            this.xLabels.push(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
          }
        }
      }
    },
    calculateStats() {
      const values = this.historyData.map(d => d[this.activeChart])
      if (values.length === 0) {
        this.stats = { max: 0, min: 0, avg: 0, count: 0 }
        return
      }
      const max = Math.max(...values)
      const min = Math.min(...values)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      this.stats = {
        max: max.toFixed(this.activeChart === 'light' ? 0 : 1),
        min: min.toFixed(this.activeChart === 'light' ? 0 : 1),
        avg: avg.toFixed(this.activeChart === 'light' ? 0 : 1),
        count: values.length
      }
    },
    drawChart() {
      if (!this.chartData.length) return
      const ctx = uni.createCanvasContext('lineChart', this)
      const width = 650
      const height = 350
      const padding = { top: 20, right: 20, bottom: 30, left: 50 }
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom
      ctx.clearRect(0, 0, width, height)
      const values = this.chartData.map(d => d.value)
      const maxVal = Math.max(...values, this.upperLimit) * 1.05
      const minVal = Math.min(...values, this.lowerLimit) * 0.95
      const range = maxVal - minVal
      ctx.setStrokeStyle('#f0f0f0')
      ctx.setLineWidth(1)
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight * i) / 5
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }
      ctx.setStrokeStyle('#52c41a')
      ctx.setLineWidth(1)
      ctx.setLineDash([5, 5])
      const upperY = padding.top + chartHeight - (this.upperLimit - minVal) / range * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding.left, upperY)
      ctx.lineTo(width - padding.right, upperY)
      ctx.stroke()
      ctx.setStrokeStyle('#ff4d4f')
      const lowerY = padding.top + chartHeight - (this.lowerLimit - minVal) / range * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding.left, lowerY)
      ctx.lineTo(width - padding.right, lowerY)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.setStrokeStyle('#1989fa')
      ctx.setLineWidth(2)
      ctx.beginPath()
      this.chartData.forEach((d, i) => {
        const x = padding.left + (chartWidth * i) / (this.chartData.length - 1)
        const y = padding.top + chartHeight - (d.value - minVal) / range * chartHeight
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      ctx.setFillStyle('#1989fa')
      this.chartData.forEach((d, i) => {
        if (i % 3 === 0) {
          const x = padding.left + (chartWidth * i) / (this.chartData.length - 1)
          const y = padding.top + chartHeight - (d.value - minVal) / range * chartHeight
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, 2 * Math.PI)
          ctx.fill()
        }
      })
      ctx.draw()
    },
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },
    getTempClass(temp) {
      if (temp > 30) return 'high'
      if (temp < 15) return 'low'
      return ''
    },
    getHumidityClass(hum) {
      if (hum > 85) return 'high'
      if (hum < 50) return 'low'
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.filter-bar {
  background: #fff;
  padding: 24rpx;
  
  .greenhouse-select {
    margin-bottom: 20rpx;
    
    .picker-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f7ff;
      color: #1989fa;
      padding: 16rpx 32rpx;
      border-radius: 30rpx;
      font-size: 28rpx;
      
      .arrow {
        margin-left: 8rpx;
        font-size: 20rpx;
      }
    }
  }
  
  .time-select {
    display: flex;
    gap: 16rpx;
    
    .time-btn {
      flex: 1;
      text-align: center;
      padding: 16rpx 0;
      background: #f5f5f5;
      border-radius: 8rpx;
      font-size: 26rpx;
      color: #666;
      
      &.active {
        background: #1989fa;
        color: #fff;
      }
    }
  }
}

.chart-tabs {
  display: flex;
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 8rpx;
  
  .chart-tab {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #666;
    border-radius: 12rpx;
    
    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      font-weight: bold;
    }
  }
}

.chart-container {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .chart-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .chart-range {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .chart-area {
    position: relative;
    height: 400rpx;
    
    .line-chart {
      width: 100%;
      height: 350rpx;
    }
    
    .y-axis {
      position: absolute;
      left: 0;
      top: 0;
      height: 350rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .y-label {
        font-size: 20rpx;
        color: #999;
        width: 80rpx;
        text-align: right;
        padding-right: 10rpx;
      }
    }
    
    .x-axis {
      position: absolute;
      bottom: 0;
      left: 80rpx;
      right: 20rpx;
      display: flex;
      justify-content: space-between;
      
      .x-label {
        font-size: 20rpx;
        color: #999;
      }
    }
  }
  
  .chart-legend {
    display: flex;
    justify-content: center;
    gap: 40rpx;
    margin-top: 10rpx;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 24rpx;
      color: #666;
      
      .legend-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
      }
    }
  }
}

.stats-container {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  
  .stats-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
    
    .stats-item {
      text-align: center;
      padding: 20rpx 0;
      background: #fafafa;
      border-radius: 12rpx;
      
      .stats-label {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-bottom: 8rpx;
      }
      
      .stats-value {
        font-size: 32rpx;
        font-weight: bold;
        
        .stats-unit {
          font-size: 22rpx;
          font-weight: normal;
          color: #999;
        }
      }
    }
  }
}

.data-list {
  background: #fff;
  margin: 0 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  
  .list-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .list-header, .list-row {
    display: flex;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    .col-time {
      flex: 2;
      font-size: 24rpx;
      color: #999;
    }
    
    .col-value {
      flex: 1;
      font-size: 24rpx;
      text-align: center;
      
      &.high { color: #ff4d4f; }
      &.low { color: #52c41a; }
    }
  }
  
  .list-header {
    background: #fafafa;
    margin: 0 -24rpx;
    padding: 16rpx 24rpx;
    font-weight: bold;
    
    .col-time, .col-value {
      color: #666;
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
}
</style>
