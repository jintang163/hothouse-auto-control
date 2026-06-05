<template>
  <view class="page">
    <view class="realtime-card" v-if="realtimeData">
      <view class="card-title">
        <text class="card-icon">📊</text>
        <text>实时数据</text>
      </view>
      <view class="realtime-grid">
        <view class="realtime-item">
          <text class="realtime-icon">💧</text>
          <view class="realtime-info">
            <view class="realtime-value" :style="{ color: getHumidityColor(realtimeData.soilHumidity) }">
              {{ realtimeData.soilHumidity || '--' }}%
            </view>
            <view class="realtime-label">土壤湿度</view>
          </view>
        </view>
        <view class="realtime-item">
          <text class="realtime-icon">🧪</text>
          <view class="realtime-info">
            <view class="realtime-value" :style="{ color: getEcColor(realtimeData.ecValue) }">
              {{ realtimeData.ecValue || '--' }}
            </view>
            <view class="realtime-label">EC值</view>
          </view>
        </view>
        <view class="realtime-item">
          <text class="realtime-icon">⚗️</text>
          <view class="realtime-info">
            <view class="realtime-value" :style="{ color: getPhColor(realtimeData.phValue) }">
              {{ realtimeData.phValue || '--' }}
            </view>
            <view class="realtime-label">pH值</view>
          </view>
        </view>
      </view>
    </view>

    <view class="control-card">
      <view class="card-title">
        <text class="card-icon">🎛️</text>
        <text>灌溉控制</text>
      </view>

      <view class="form-section">
        <view class="form-label">选择区域</view>
        <view class="area-grid">
          <view 
            class="area-item" 
            v-for="area in areaList" 
            :key="area.code"
            :class="{ active: selectedArea === area.code }"
            @click="selectedArea = area.code"
          >
            <text class="area-icon">📍</text>
            <text class="area-name">{{ area.name }}</text>
          </view>
        </view>
      </view>

      <view class="form-section">
        <view class="form-label">灌溉类型</view>
        <view class="type-grid">
          <view 
            class="type-item water" 
            :class="{ active: irrigationType === 'WATER' }"
            @click="irrigationType = 'WATER'"
          >
            <text class="type-icon">💧</text>
            <text class="type-name">清水灌溉</text>
          </view>
          <view 
            class="type-item fertigation" 
            :class="{ active: irrigationType === 'FERTIGATION' }"
            @click="irrigationType = 'FERTIGATION'"
          >
            <text class="type-icon">🌱</text>
            <text class="type-name">水肥一体</text>
          </view>
        </view>
      </view>

      <view class="form-section">
        <view class="form-label">
          灌溉时长
          <text class="duration-value">{{ duration }} 分钟</text>
        </view>
        <view class="slider-container">
          <slider 
            :value="duration" 
            :min="1" 
            :max="60" 
            :step="1"
            activeColor="#1890ff"
            backgroundColor="#e0e0e0"
            block-size="24"
            @change="onDurationChange"
          />
          <view class="slider-labels">
            <text>1分钟</text>
            <text>30分钟</text>
            <text>60分钟</text>
          </view>
        </view>
      </view>

      <view class="form-section" v-if="irrigationType === 'FERTIGATION'">
        <view class="form-label">
          目标EC值
          <text class="target-value">{{ targetEc }} ms/cm</text>
        </view>
        <view class="slider-container">
          <slider 
            :value="targetEc * 10" 
            :min="5" 
            :max="30" 
            :step="1"
            activeColor="#52c41a"
            backgroundColor="#e0e0e0"
            block-size="24"
            @change="onEcChange"
          />
          <view class="slider-labels">
            <text>0.5</text>
            <text>1.8</text>
            <text>3.0</text>
          </view>
        </view>
      </view>

      <view class="form-section" v-if="irrigationType === 'FERTIGATION'">
        <view class="form-label">
          目标pH值
          <text class="target-value">{{ targetPh }}</text>
        </view>
        <view class="slider-container">
          <slider 
            :value="targetPh * 10" 
            :min="50" 
            :max="80" 
            :step="1"
            activeColor="#faad14"
            backgroundColor="#e0e0e0"
            block-size="24"
            @change="onPhChange"
          />
          <view class="slider-labels">
            <text>5.0</text>
            <text>6.5</text>
            <text>8.0</text>
          </view>
        </view>
      </view>

      <view class="countdown-section" v-if="isRunning">
        <view class="countdown-label">剩余时间</view>
        <view class="countdown-value">{{ formatCountdown(remainingTime) }}</view>
        <view class="countdown-progress">
          <view class="progress-bar">
            <view 
              class="progress-fill" 
              :style="{ width: progressPercent + '%' }"
            ></view>
          </view>
        </view>
      </view>

      <view class="action-section">
        <button 
          class="action-btn start" 
          v-if="!isRunning"
          :disabled="!selectedArea"
          @click="startIrrigation"
        >
          <text class="btn-icon">▶️</text>
          <text class="btn-text">一键开启</text>
        </button>
        <button 
          class="action-btn stop" 
          v-else
          @click="stopIrrigation"
        >
          <text class="btn-icon">⏹️</text>
          <text class="btn-text">停止灌溉</text>
        </button>
      </view>
    </view>

    <view class="tips-card">
      <view class="tips-title">
        <text class="tips-icon">💡</text>
        <text>操作提示</text>
      </view>
      <view class="tips-list">
        <view class="tip-item">
          <text class="tip-dot">•</text>
          <text class="tip-text">请确保储罐液位充足后再启动灌溉</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">•</text>
          <text class="tip-text">水肥一体模式下系统会自动调节EC/pH值</text>
        </view>
        <view class="tip-item">
          <text class="tip-dot">•</text>
          <text class="tip-text">灌溉过程中可随时点击停止按钮中断</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api'
import { irrigationAreaMap } from '@/config'

export default {
  data() {
    return {
      greenhouseId: 1,
      realtimeData: null,
      selectedArea: '',
      irrigationType: 'WATER',
      duration: 15,
      targetEc: 1.8,
      targetPh: 6.5,
      isRunning: false,
      remainingTime: 0,
      totalDuration: 0,
      timer: null,
      areaList: []
    }
  },
  computed: {
    progressPercent() {
      if (this.totalDuration === 0) return 0
      return ((this.totalDuration - this.remainingTime) / this.totalDuration * 100).toFixed(1)
    }
  },
  onLoad(options) {
    if (options.greenhouseId) {
      this.greenhouseId = parseInt(options.greenhouseId)
    }
    this.initAreaList()
    this.loadData()
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    initAreaList() {
      this.areaList = Object.keys(irrigationAreaMap).map(key => ({
        code: key,
        name: irrigationAreaMap[key].text
      }))
    },
    async loadData() {
      try {
        this.realtimeData = await api.getIrrigationRealtime(this.greenhouseId)
      } catch (e) {
        console.error(e)
        this.loadMockData()
      }
    },
    loadMockData() {
      this.realtimeData = {
        soilHumidity: 62,
        ecValue: 1.7,
        phValue: 6.4
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
    onDurationChange(e) {
      this.duration = e.detail.value
    },
    onEcChange(e) {
      this.targetEc = (e.detail.value / 10).toFixed(1)
    },
    onPhChange(e) {
      this.targetPh = (e.detail.value / 10).toFixed(1)
    },
    formatCountdown(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    },
    startIrrigation() {
      if (!this.selectedArea) {
        uni.showToast({ title: '请选择灌溉区域', icon: 'none' })
        return
      }
      uni.showModal({
        title: '确认开启',
        content: `确定要开启${irrigationAreaMap[this.selectedArea]?.text}的${this.irrigationType === 'WATER' ? '清水灌溉' : '水肥一体'}吗？\n时长：${this.duration}分钟`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const data = {
                greenhouseId: this.greenhouseId,
                area: this.selectedArea,
                type: this.irrigationType,
                duration: this.duration,
                targetEc: this.irrigationType === 'FERTIGATION' ? this.targetEc : null,
                targetPh: this.irrigationType === 'FERTIGATION' ? this.targetPh : null,
                operator: 'mobile_user'
              }
              await api.manualIrrigationControl(data)
              this.isRunning = true
              this.totalDuration = this.duration * 60
              this.remainingTime = this.totalDuration
              this.startCountdown()
              uni.showToast({ title: '灌溉已开启', icon: 'success' })
            } catch (e) {
              uni.showToast({ title: '开启失败', icon: 'none' })
            }
          }
        }
      })
    },
    stopIrrigation() {
      uni.showModal({
        title: '确认停止',
        content: '确定要停止当前灌溉吗？',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            try {
              this.stopCountdown()
              this.isRunning = false
              uni.showToast({ title: '灌溉已停止', icon: 'success' })
            } catch (e) {
              uni.showToast({ title: '停止失败', icon: 'none' })
            }
          }
        }
      })
    },
    startCountdown() {
      this.timer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--
        } else {
          this.stopCountdown()
          this.isRunning = false
          uni.showToast({ title: '灌溉已完成', icon: 'success' })
        }
      }, 1000)
    },
    stopCountdown() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
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

.realtime-card, .control-card, .tips-card {
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

.realtime-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  
  .realtime-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 12rpx;
    background: #fafafa;
    border-radius: 16rpx;
    
    .realtime-icon {
      font-size: 36rpx;
      margin-bottom: 12rpx;
    }
    
    .realtime-info {
      text-align: center;
      
      .realtime-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }
      
      .realtime-label {
        font-size: 22rpx;
        color: #999;
        margin-top: 4rpx;
      }
    }
  }
}

.form-section {
  margin-bottom: 32rpx;
  
  .form-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 16rpx;
    
    .duration-value, .target-value {
      font-size: 28rpx;
      color: #1890ff;
      font-weight: bold;
    }
  }
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  
  .area-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 24rpx 16rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    
    .area-icon {
      font-size: 28rpx;
    }
    
    .area-name {
      font-size: 26rpx;
      color: #666;
    }
    
    &.active {
      background: #e6f7ff;
      border-color: #1890ff;
      
      .area-name {
        color: #1890ff;
        font-weight: bold;
      }
    }
  }
}

.type-grid {
  display: flex;
  gap: 16rpx;
  
  .type-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 32rpx 16rpx;
    border-radius: 16rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    
    .type-icon {
      font-size: 48rpx;
    }
    
    .type-name {
      font-size: 26rpx;
      color: #666;
    }
    
    &.water {
      background: #f0f7ff;
      
      &.active {
        background: #e6f7ff;
        border-color: #1890ff;
        
        .type-name {
          color: #1890ff;
          font-weight: bold;
        }
      }
    }
    
    &.fertigation {
      background: #f0fff0;
      
      &.active {
        background: #f6ffed;
        border-color: #52c41a;
        
        .type-name {
          color: #52c41a;
          font-weight: bold;
        }
      }
    }
  }
}

.slider-container {
  padding: 0 8rpx;
  
  .slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8rpx;
    font-size: 22rpx;
    color: #999;
  }
}

.countdown-section {
  text-align: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border-radius: 16rpx;
  margin-bottom: 32rpx;
  
  .countdown-label {
    font-size: 26rpx;
    color: #1890ff;
    margin-bottom: 16rpx;
  }
  
  .countdown-value {
    font-size: 72rpx;
    font-weight: bold;
    color: #1890ff;
    font-family: monospace;
    margin-bottom: 24rpx;
  }
  
  .countdown-progress {
    .progress-bar {
      height: 12rpx;
      background: rgba(24, 144, 255, 0.2);
      border-radius: 6rpx;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background: #1890ff;
        border-radius: 6rpx;
        transition: width 0.3s;
      }
    }
  }
}

.action-section {
  .action-btn {
    width: 100%;
    height: 96rpx;
    line-height: 96rpx;
    border-radius: 48rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    
    .btn-icon {
      font-size: 36rpx;
    }
    
    &.start {
      background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
      color: #fff;
      
      &[disabled] {
        background: #d9d9d9;
        color: #fff;
      }
    }
    
    &.stop {
      background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
      color: #fff;
    }
  }
}

.tips-card {
  .tips-title {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 16rpx;
    
    .tips-icon {
      margin-right: 8rpx;
      font-size: 28rpx;
    }
  }
  
  .tips-list {
    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 8rpx;
      padding: 8rpx 0;
      
      .tip-dot {
        color: #1890ff;
        font-size: 24rpx;
        line-height: 1.6;
      }
      
      .tip-text {
        font-size: 24rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}
</style>
