<template>
  <view class="page">
    <view class="stats-card">
      <view class="card-title">
        <text class="card-icon">📊</text>
        <text>本周统计</text>
      </view>
      <view class="stats-grid">
        <view class="stats-item">
          <view class="stats-value" style="color: #1890ff;">{{ weekStats.waterUsage || 0 }}</view>
          <view class="stats-label">用水量 (L)</view>
        </view>
        <view class="stats-item">
          <view class="stats-value" style="color: #52c41a;">{{ weekStats.fertilizerUsage || 0 }}</view>
          <view class="stats-label">用肥量 (kg)</view>
        </view>
        <view class="stats-item">
          <view class="stats-value" style="color: #fa8c16;">{{ weekStats.irrigationCount || 0 }}</view>
          <view class="stats-label">灌溉次数</view>
        </view>
      </view>
    </view>

    <view class="chart-card">
      <view class="chart-header">
        <view class="chart-tabs">
          <view 
            class="chart-tab" 
            :class="{ active: chartMode === 'day' }"
            @click="switchChartMode('day')"
          >
            日统计
          </view>
          <view 
            class="chart-tab" 
            :class="{ active: chartMode === 'month' }"
            @click="switchChartMode('month')"
          >
            月统计
          </view>
        </view>
      </view>
      <view class="chart-container">
        <canvas 
          class="bar-chart" 
          canvas-id="barChart" 
          id="barChart"
          disable-scroll="true"
        ></canvas>
        <view class="x-axis">
          <text v-for="(label, idx) in xLabels" :key="idx" class="x-label">{{ label }}</text>
        </view>
      </view>
      <view class="chart-legend">
        <view class="legend-item">
          <view class="legend-dot" style="background: #1890ff;"></view>
          <text>用水量 (L)</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot" style="background: #52c41a;"></view>
          <text>用肥量 (kg)</text>
        </view>
      </view>
    </view>

    <view class="record-card">
      <view class="card-title">
        <text class="card-icon">📋</text>
        <text>灌溉记录</text>
      </view>

      <view class="record-group" v-for="group in groupedRecords" :key="group.date">
        <view class="group-header">
          <text class="group-date">{{ group.date }}</text>
          <view class="group-summary">
            <text class="summary-item">
              <text class="summary-label">时长</text>
              <text class="summary-value">{{ group.totalDuration }}分钟</text>
            </text>
            <text class="summary-item">
              <text class="summary-label">水量</text>
              <text class="summary-value">{{ group.totalWater }}L</text>
            </text>
          </view>
        </view>
        <view class="record-list">
          <view 
            class="record-item" 
            v-for="record in group.records" 
            :key="record.id"
          >
            <view class="record-icon" :style="{ background: getTaskTypeBg(record.type) }">
              {{ getTaskTypeIcon(record.type) }}
            </view>
            <view class="record-content">
              <view class="record-header">
                <text class="record-type">{{ getTaskTypeText(record.type) }}</text>
                <text class="record-area">{{ record.area }}</text>
              </view>
              <view class="record-meta">
                <text class="meta-item">
                  <text class="meta-icon">⏱️</text>
                  {{ record.duration }}分钟
                </text>
                <text class="meta-item">
                  <text class="meta-icon">💧</text>
                  {{ record.waterUsage }}L
                </text>
                <text class="meta-item" v-if="record.fertilizerUsage">
                  <text class="meta-icon">🌱</text>
                  {{ record.fertilizerUsage }}kg
                </text>
              </view>
              <view class="record-data" v-if="record.avgEc || record.avgPh">
                <text class="data-item" v-if="record.avgEc">EC: {{ record.avgEc }}</text>
                <text class="data-item" v-if="record.avgPh">pH: {{ record.avgPh }}</text>
              </view>
            </view>
            <view class="record-time">
              {{ formatTime(record.startTime) }}
            </view>
          </view>
        </view>
      </view>

      <view class="empty" v-if="!groupedRecords || groupedRecords.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无灌溉记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api'
import { irrigationTaskTypeMap } from '@/config'

export default {
  data() {
    return {
      greenhouseId: 1,
      chartMode: 'day',
      weekStats: {},
      dailyStats: [],
      monthlyStats: [],
      recordList: [],
      xLabels: [],
      chartData: [],
      loading: false
    }
  },
  computed: {
    groupedRecords() {
      if (!this.recordList || this.recordList.length === 0) return []
      const groups = {}
      this.recordList.forEach(record => {
        const date = this.formatDate(record.startTime)
        if (!groups[date]) {
          groups[date] = {
            date,
            totalDuration: 0,
            totalWater: 0,
            records: []
          }
        }
        groups[date].totalDuration += record.duration || 0
        groups[date].totalWater += record.waterUsage || 0
        groups[date].records.push(record)
      })
      return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  },
  onLoad(options) {
    if (options.greenhouseId) {
      this.greenhouseId = parseInt(options.greenhouseId)
    }
    this.loadData()
  },
  onPullDownRefresh() {
    this.loadData()
    setTimeout(() => uni.stopPullDownRefresh(), 1000)
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadWeekStats(),
          this.loadDailyStats(),
          this.loadRecords()
        ])
      } catch (e) {
        console.error(e)
        this.loadMockData()
      } finally {
        this.loading = false
      }
      this.processChartData()
      this.drawChart()
    },
    loadMockData() {
      this.weekStats = {
        waterUsage: 8560,
        fertilizerUsage: 172.5,
        irrigationCount: 28
      }
      this.dailyStats = []
      const now = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 3600 * 1000)
        this.dailyStats.push({
          date: date.toISOString().split('T')[0],
          waterUsage: Math.floor(Math.random() * 500) + 800,
          fertilizerUsage: (Math.random() * 10 + 15).toFixed(1),
          irrigationCount: Math.floor(Math.random() * 3) + 3
        })
      }
      this.recordList = []
      for (let i = 0; i < 15; i++) {
        const types = ['WATER', 'FERTIGATION', 'FLUSH']
        const areas = ['A区', 'B区', 'C区', 'D区']
        const type = types[Math.floor(Math.random() * types.length)]
        this.recordList.push({
          id: i + 1,
          type,
          area: areas[Math.floor(Math.random() * areas.length)],
          duration: Math.floor(Math.random() * 30) + 10,
          waterUsage: Math.floor(Math.random() * 150) + 50,
          fertilizerUsage: type === 'FERTIGATION' ? (Math.random() * 3 + 1).toFixed(1) : null,
          avgEc: type === 'FERTIGATION' ? (Math.random() * 0.5 + 1.5).toFixed(1) : null,
          avgPh: type === 'FERTIGATION' ? (Math.random() * 0.5 + 6.0).toFixed(1) : null,
          startTime: new Date(now.getTime() - i * 3600000 * 6).toISOString()
        })
      }
    },
    async loadWeekStats() {
      try {
        const now = new Date()
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const res = await api.getIrrigationMonthlyStats(this.greenhouseId, month)
        this.weekStats = res || {}
      } catch (e) {
        console.error(e)
      }
    },
    async loadDailyStats() {
      try {
        const now = new Date()
        const date = now.toISOString().split('T')[0]
        const res = await api.getIrrigationDailyStats(this.greenhouseId, date)
        this.dailyStats = res || []
      } catch (e) {
        console.error(e)
      }
    },
    async loadRecords() {
      try {
        const params = {
          page: 1,
          size: 50,
          greenhouseId: this.greenhouseId
        }
        const res = await api.getIrrigationRecordList(params)
        this.recordList = res.records || []
      } catch (e) {
        console.error(e)
      }
    },
    switchChartMode(mode) {
      this.chartMode = mode
      this.processChartData()
      this.drawChart()
    },
    processChartData() {
      const data = this.chartMode === 'day' ? this.dailyStats : this.monthlyStats
      if (!data || data.length === 0) return
      this.chartData = data.map(item => ({
        label: this.chartMode === 'day' 
          ? new Date(item.date).getDate() + '日'
          : item.month,
        water: item.waterUsage || 0,
        fertilizer: parseFloat(item.fertilizerUsage) || 0
      }))
      this.xLabels = this.chartData.map(d => d.label)
    },
    drawChart() {
      if (!this.chartData || this.chartData.length === 0) return
      const ctx = uni.createCanvasContext('barChart', this)
      const width = 650
      const height = 300
      const padding = { top: 20, right: 20, bottom: 40, left: 60 }
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom
      ctx.clearRect(0, 0, width, height)
      const maxWater = Math.max(...this.chartData.map(d => d.water), 1)
      const maxFertilizer = Math.max(...this.chartData.map(d => d.fertilizer), 1)
      const barWidth = chartWidth / this.chartData.length / 3
      ctx.setStrokeStyle('#f0f0f0')
      ctx.setLineWidth(1)
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight * i) / 4
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }
      ctx.setFillStyle('#999')
      ctx.setFontSize(18)
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight * i) / 4
        const value = Math.round(maxWater * (4 - i) / 4)
        ctx.fillText(String(value), 10, y + 6)
      }
      this.chartData.forEach((d, i) => {
        const x = padding.left + (chartWidth * i) / this.chartData.length + chartWidth / this.chartData.length / 2
        const waterHeight = (d.water / maxWater) * chartHeight
        const fertilizerHeight = (d.fertilizer / maxFertilizer) * chartHeight
        ctx.setFillStyle('#1890ff')
        ctx.fillRect(x - barWidth - 4, padding.top + chartHeight - waterHeight, barWidth, waterHeight)
        ctx.setFillStyle('#52c41a')
        ctx.fillRect(x + 4, padding.top + chartHeight - fertilizerHeight, barWidth, fertilizerHeight)
      })
      ctx.draw()
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

.stats-card, .chart-card, .record-card {
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
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  
  .stats-item {
    text-align: center;
    padding: 20rpx 0;
    background: #fafafa;
    border-radius: 12rpx;
    
    .stats-value {
      font-size: 40rpx;
      font-weight: bold;
    }
    
    .stats-label {
      font-size: 22rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }
}

.chart-card {
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .chart-tabs {
      display: flex;
      background: #f5f5f5;
      border-radius: 12rpx;
      padding: 4rpx;
      
      .chart-tab {
        padding: 12rpx 24rpx;
        font-size: 24rpx;
        color: #666;
        border-radius: 8rpx;
        
        &.active {
          background: #1890ff;
          color: #fff;
          font-weight: bold;
        }
      }
    }
  }
  
  .chart-container {
    position: relative;
    height: 340rpx;
    
    .bar-chart {
      width: 100%;
      height: 300rpx;
    }
    
    .x-axis {
      position: absolute;
      bottom: 0;
      left: 60rpx;
      right: 20rpx;
      display: flex;
      justify-content: space-around;
      
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
    margin-top: 16rpx;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 22rpx;
      color: #666;
      
      .legend-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 4rpx;
      }
    }
  }
}

.record-group {
  margin-bottom: 24rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 20rpx;
    background: #fafafa;
    border-radius: 12rpx;
    margin-bottom: 12rpx;
    
    .group-date {
      font-size: 26rpx;
      font-weight: bold;
      color: #333;
    }
    
    .group-summary {
      display: flex;
      gap: 24rpx;
      
      .summary-item {
        font-size: 22rpx;
        color: #666;
        
        .summary-label {
          color: #999;
          margin-right: 4rpx;
        }
        
        .summary-value {
          color: #1890ff;
          font-weight: 500;
        }
      }
    }
  }
  
  .record-list {
    .record-item {
      display: flex;
      align-items: flex-start;
      padding: 20rpx;
      background: #fff;
      border: 1rpx solid #f0f0f0;
      border-radius: 12rpx;
      margin-bottom: 12rpx;
      
      &:last-child {
        margin-bottom: 0;
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
        
        .record-header {
          display: flex;
          align-items: center;
          gap: 12rpx;
          margin-bottom: 8rpx;
          
          .record-type {
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
          }
          
          .record-area {
            font-size: 22rpx;
            color: #999;
            padding: 2rpx 8rpx;
            background: #f5f5f5;
            border-radius: 6rpx;
          }
        }
        
        .record-meta {
          display: flex;
          gap: 20rpx;
          margin-bottom: 6rpx;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 4rpx;
            font-size: 22rpx;
            color: #666;
            
            .meta-icon {
              font-size: 20rpx;
            }
          }
        }
        
        .record-data {
          display: flex;
          gap: 16rpx;
          
          .data-item {
            font-size: 20rpx;
            color: #999;
            padding: 2rpx 8rpx;
            background: #f5f5f5;
            border-radius: 4rpx;
          }
        }
      }
      
      .record-time {
        font-size: 22rpx;
        color: #ccc;
        flex-shrink: 0;
        margin-left: 16rpx;
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
