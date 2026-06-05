<template>
  <view class="page">
    <view class="chart-card">
      <view class="chart-header">
        <text class="chart-title">产量趋势</text>
        <text class="chart-unit">单位：kg</text>
      </view>
      <view class="chart-container">
        <view class="chart-y-axis">
          <text class="y-label" v-for="(label, index) in yAxisLabels" :key="index">{{ label }}</text>
        </view>
        <view class="chart-body">
          <view class="chart-bars">
            <view 
              class="bar-item" 
              v-for="(item, index) in chartData" 
              :key="index"
            >
              <view class="bar-wrapper">
                <view 
                  class="bar" 
                  :style="{ height: getBarHeight(item.value) }"
                >
                  <text class="bar-value">{{ item.value }}</text>
                </view>
              </view>
              <text class="bar-label">{{ item.label }}</text>
            </view>
          </view>
          <view class="chart-x-axis">
            <text class="x-label" v-for="(item, index) in chartData" :key="index">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section-header">
      <text class="section-title">产量记录</text>
      <view class="add-btn" @click="showAddPopup">
        <text class="add-icon">+</text>
        <text>新增</text>
      </view>
    </view>

    <view class="record-list">
      <view 
        class="record-item" 
        v-for="record in recordList" 
        :key="record.id"
      >
        <view class="record-date">
          <text class="date-day">{{ formatDay(record.harvestDate) }}</text>
          <text class="date-month">{{ formatMonth(record.harvestDate) }}</text>
        </view>
        <view class="record-content">
          <view class="record-main">
            <text class="record-yield">{{ record.yieldQuantity }} <text class="yield-unit">{{ record.yieldUnit || 'kg' }}</text></text>
            <text class="quality-tag" :style="{ color: getQualityColor(record.qualityLevel) }">
              {{ getQualityText(record.qualityLevel) }}
            </text>
          </view>
          <view class="record-meta">
            <view class="meta-item">
              <text class="meta-label">商品率</text>
              <text class="meta-value">{{ record.commodityRate ? (record.commodityRate * 100).toFixed(1) : '-' }}%</text>
            </view>
            <view class="meta-item" v-if="record.averageWeight">
              <text class="meta-label">平均单重</text>
              <text class="meta-value">{{ record.averageWeight }}g</text>
            </view>
            <view class="meta-item" v-if="record.weather">
              <text class="meta-label">天气</text>
              <text class="meta-value">{{ record.weather }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty" v-if="!loading && recordList.length === 0">
        <text class="empty-icon">📊</text>
        <text class="empty-text">暂无产量记录</text>
      </view>

      <view class="loading" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
    </view>

    <view class="load-more" v-if="hasMore && !loading">
      <text class="load-more-text">上拉加载更多</text>
    </view>

    <view class="no-more" v-if="!hasMore && recordList.length > 0">
      <text class="no-more-text">没有更多了</text>
    </view>

    <view class="popup-mask" v-if="showAdd" @click="showAdd = false">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">新增产量记录</text>
          <text class="popup-close" @click="showAdd = false">✕</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">采收日期</text>
            <picker mode="date" :value="yieldForm.harvestDate" @change="onDateChange">
              <view class="form-picker">
                {{ yieldForm.harvestDate || '请选择日期' }}
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">产量</text>
            <view class="form-input-row">
              <input 
                class="form-input" 
                type="digit" 
                v-model="yieldForm.yieldQuantity" 
                placeholder="请输入产量" 
              />
              <input 
                class="form-input unit" 
                v-model="yieldForm.yieldUnit" 
                placeholder="kg" 
              />
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">品质等级</text>
            <view class="quality-options">
              <view 
                class="quality-option" 
                v-for="item in qualityOptions" 
                :key="item.code"
                :class="{ active: yieldForm.qualityLevel === item.code }"
                @click="yieldForm.qualityLevel = item.code"
              >
                {{ item.text }}
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">商品率（%）</text>
            <input 
              class="form-input" 
              type="digit" 
              v-model="yieldForm.commodityRate" 
              placeholder="如：95" 
            />
          </view>
          <view class="form-item">
            <text class="form-label">平均单重（g）</text>
            <input 
              class="form-input" 
              type="digit" 
              v-model="yieldForm.averageWeight" 
              placeholder="请输入平均单重" 
            />
          </view>
          <view class="form-item">
            <text class="form-label">天气</text>
            <input 
              class="form-input" 
              v-model="yieldForm.weather" 
              placeholder="如：晴、多云" 
            />
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              v-model="yieldForm.remark" 
              placeholder="请输入备注"
            ></textarea>
          </view>
        </view>
        <view class="popup-footer">
          <button class="popup-btn cancel" @click="showAdd = false">取消</button>
          <button class="popup-btn confirm" @click="submitYield">提交</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { api, qualityLevelMap } from '@/config'

export default {
  data() {
    return {
      greenhouseId: 1,
      recordList: [],
      page: 1,
      size: 10,
      total: 0,
      hasMore: true,
      loading: false,
      showAdd: false,
      chartData: [],
      yAxisLabels: ['0', '500', '1000', '1500', '2000'],
      qualityOptions: [
        { code: 1, text: '特级' },
        { code: 2, text: '一级' },
        { code: 3, text: '二级' },
        { code: 4, text: '三级' }
      ],
      yieldForm: {
        greenhouseId: 1,
        harvestDate: '',
        yieldQuantity: '',
        yieldUnit: 'kg',
        qualityLevel: 2,
        commodityRate: '',
        averageWeight: '',
        weather: '',
        remark: ''
      }
    }
  },
  onLoad() {
    this.loadData()
    this.loadChartData()
  },
  onPullDownRefresh() {
    this.refresh()
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    async refresh() {
      this.page = 1
      this.hasMore = true
      this.recordList = []
      await this.loadData()
      await this.loadChartData()
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
        const res = await api.getYieldList(params)
        if (res.records) {
          this.recordList = this.page === 1 ? res.records : [...this.recordList, ...res.records]
          this.total = res.total
          this.hasMore = this.recordList.length < this.total
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    loadChartData() {
      const mockData = [
        { label: '6/1', value: 1200 },
        { label: '6/5', value: 1500 },
        { label: '6/10', value: 1350 },
        { label: '6/15', value: 1800 },
        { label: '6/20', value: 1650 },
        { label: '6/25', value: 2000 },
        { label: '6/30', value: 1750 }
      ]
      this.chartData = mockData
    },
    getBarHeight(value) {
      const max = 2000
      const height = (value / max) * 200
      return `${Math.max(height, 20)}rpx`
    },
    formatDay(date) {
      if (!date) return ''
      return new Date(date).getDate()
    },
    formatMonth(date) {
      if (!date) return ''
      return `${new Date(date).getMonth() + 1}月`
    },
    getQualityText(level) {
      return qualityLevelMap[level]?.text || '未知'
    },
    getQualityColor(level) {
      return qualityLevelMap[level]?.color || '#999'
    },
    showAddPopup() {
      this.yieldForm = {
        greenhouseId: 1,
        harvestDate: '',
        yieldQuantity: '',
        yieldUnit: 'kg',
        qualityLevel: 2,
        commodityRate: '',
        averageWeight: '',
        weather: '',
        remark: ''
      }
      this.showAdd = true
    },
    onDateChange(e) {
      this.yieldForm.harvestDate = e.detail.value
    },
    async submitYield() {
      if (!this.yieldForm.harvestDate) {
        uni.showToast({ title: '请选择采收日期', icon: 'none' })
        return
      }
      if (!this.yieldForm.yieldQuantity) {
        uni.showToast({ title: '请输入产量', icon: 'none' })
        return
      }
      try {
        const data = {
          ...this.yieldForm,
          yieldQuantity: Number(this.yieldForm.yieldQuantity) || 0,
          commodityRate: this.yieldForm.commodityRate ? Number(this.yieldForm.commodityRate) / 100 : null,
          averageWeight: this.yieldForm.averageWeight ? Number(this.yieldForm.averageWeight) : null
        }
        await api.saveYield(data)
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
  padding: 24rpx;
}

.chart-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  
  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
    
    .chart-title {
      font-size: 30rpx;
      color: #333;
      font-weight: bold;
    }
    
    .chart-unit {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .chart-container {
    display: flex;
    height: 280rpx;
    
    .chart-y-axis {
      width: 60rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-right: 12rpx;
      
      .y-label {
        font-size: 20rpx;
        color: #999;
        text-align: right;
      }
    }
    
    .chart-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .chart-bars {
        flex: 1;
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        border-bottom: 1rpx solid #f0f0f0;
        
        .bar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .bar-wrapper {
            height: 200rpx;
            display: flex;
            align-items: flex-end;
            
            .bar {
              width: 40rpx;
              background: linear-gradient(180deg, #1989fa 0%, #91caff 100%);
              border-radius: 8rpx 8rpx 0 0;
              display: flex;
              align-items: flex-start;
              justify-content: center;
              padding-top: 8rpx;
              position: relative;
              
              .bar-value {
                font-size: 18rpx;
                color: #fff;
                transform: translateY(-100%);
                margin-bottom: 4rpx;
                position: absolute;
                top: 0;
              }
            }
          }
        }
      }
      
      .chart-x-axis {
        display: flex;
        justify-content: space-around;
        padding-top: 8rpx;
        
        .x-label {
          font-size: 20rpx;
          color: #999;
        }
      }
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  
  .section-title {
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
  }
  
  .add-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    background: #1989fa;
    color: #fff;
    padding: 12rpx 24rpx;
    border-radius: 20rpx;
    font-size: 26rpx;
    
    .add-icon {
      font-size: 32rpx;
      line-height: 1;
    }
  }
}

.record-list {
  .record-item {
    display: flex;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    .record-date {
      width: 100rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f0f5ff;
      border-radius: 12rpx;
      margin-right: 20rpx;
      flex-shrink: 0;
      
      .date-day {
        font-size: 40rpx;
        color: #1989fa;
        font-weight: bold;
        line-height: 1;
      }
      
      .date-month {
        font-size: 22rpx;
        color: #1989fa;
        margin-top: 4rpx;
      }
    }
    
    .record-content {
      flex: 1;
      
      .record-main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        .record-yield {
          font-size: 36rpx;
          color: #333;
          font-weight: bold;
          
          .yield-unit {
            font-size: 24rpx;
            color: #999;
            font-weight: normal;
          }
        }
        
        .quality-tag {
          font-size: 24rpx;
          font-weight: bold;
        }
      }
      
      .record-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 24rpx;
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6rpx;
          
          .meta-label {
            font-size: 24rpx;
            color: #999;
          }
          
          .meta-value {
            font-size: 24rpx;
            color: #333;
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
    max-height: 80vh;
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
        
        .form-input-row {
          display: flex;
          gap: 12rpx;
          
          .form-input {
            flex: 1;
            height: 72rpx;
            padding: 0 16rpx;
            border: 1rpx solid #e0e0e0;
            border-radius: 8rpx;
            font-size: 28rpx;
            box-sizing: border-box;
            
            &.unit {
              flex: 0 0 120rpx;
              text-align: center;
            }
          }
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
        
        .form-picker {
          width: 100%;
          height: 72rpx;
          padding: 0 16rpx;
          border: 1rpx solid #e0e0e0;
          border-radius: 8rpx;
          font-size: 28rpx;
          line-height: 72rpx;
          box-sizing: border-box;
          color: #333;
        }
        
        .form-textarea {
          width: 100%;
          height: 120rpx;
          padding: 16rpx;
          border: 1rpx solid #e0e0e0;
          border-radius: 8rpx;
          font-size: 28rpx;
          box-sizing: border-box;
        }
        
        .quality-options {
          display: flex;
          gap: 12rpx;
          
          .quality-option {
            flex: 1;
            text-align: center;
            padding: 16rpx 0;
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
