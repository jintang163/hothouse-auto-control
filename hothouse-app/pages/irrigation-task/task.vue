<template>
  <view class="page">
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 0 }"
        @click="switchTab(0)"
      >
        待执行
        <text class="badge" v-if="counts[0] > 0">{{ counts[0] }}</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 1 }"
        @click="switchTab(1)"
      >
        执行中
        <text class="badge" v-if="counts[1] > 0">{{ counts[1] }}</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 2 }"
        @click="switchTab(2)"
      >
        已完成
      </view>
    </view>

    <view class="task-list">
      <view 
        class="task-item" 
        v-for="task in taskList" 
        :key="task.id"
        @click="goToDetail(task.id)"
      >
        <view class="task-icon" :style="{ background: getTaskTypeBg(task.taskType) }">
          {{ getTaskTypeIcon(task.taskType) }}
        </view>
        <view class="task-content">
          <view class="task-header">
            <text class="task-name">{{ task.taskName }}</text>
            <text class="status-tag" :style="{ background: getStatusBg(task.status), color: getStatusColor(task.status) }">
              {{ getStatusText(task.status) }}
            </text>
          </view>
          <view class="task-meta">
            <view class="meta-item">
              <text class="meta-label">类型</text>
              <text class="meta-value" :style="{ color: getTaskTypeColor(task.taskType) }">
                {{ getTaskTypeText(task.taskType) }}
              </text>
            </view>
            <view class="meta-item">
              <text class="meta-label">触发</text>
              <text class="meta-value" :style="{ color: getTriggerSourceColor(task.triggerSource) }">
                {{ getTriggerSourceText(task.triggerSource) }}
              </text>
            </view>
          </view>
          <view class="task-info">
            <text class="info-item">
              <text class="info-icon">📍</text>
              {{ task.area || '全区域' }}
            </text>
            <text class="info-item">
              <text class="info-icon">⏱️</text>
              {{ task.planDuration || 0 }}分钟
            </text>
            <text class="info-item">
              <text class="info-icon">💧</text>
              {{ task.planWaterUsage || 0 }}L
            </text>
          </view>
          <view class="task-time">
            <text class="time-icon">📅</text>
            <text class="time-text">{{ formatTime(task.planStartTime) }}</text>
          </view>
        </view>
        <view class="task-arrow">
          <text>›</text>
        </view>
      </view>

      <view class="empty" v-if="!loading && taskList.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无任务</text>
      </view>

      <view class="loading" v-if="loading">
        <u-loading-icon mode="flower" size="32"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>

      <view class="load-more" v-if="hasMore && !loading" @click="loadMore">
        <text class="load-more-text">上拉加载更多</text>
      </view>

      <view class="no-more" v-if="!hasMore && taskList.length > 0">
        <text class="no-more-text">没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api'
import { 
  irrigationTaskStatusMap, 
  irrigationTaskTypeMap, 
  irrigationTriggerSourceMap 
} from '@/config'

export default {
  data() {
    return {
      greenhouseId: 1,
      activeTab: 0,
      taskList: [],
      page: 1,
      size: 10,
      total: 0,
      hasMore: true,
      loading: false,
      counts: [0, 0, 0]
    }
  },
  onLoad(options) {
    if (options.greenhouseId) {
      this.greenhouseId = parseInt(options.greenhouseId)
    }
    this.loadData()
  },
  onPullDownRefresh() {
    this.refresh()
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
      this.refresh()
    },
    async refresh() {
      this.page = 1
      this.hasMore = true
      this.taskList = []
      await this.loadData()
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
          greenhouseId: this.greenhouseId,
          status: this.activeTab
        }
        const res = await api.getIrrigationTaskList(params)
        if (res.records) {
          this.taskList = this.page === 1 ? res.records : [...this.taskList, ...res.records]
          this.total = res.total
          this.hasMore = this.taskList.length < this.total
        } else {
          this.loadMockData()
        }
        await this.loadCounts()
      } catch (e) {
        console.error(e)
        this.loadMockData()
      } finally {
        this.loading = false
      }
    },
    loadMockData() {
      const mockTasks = [
        { id: 1, taskName: 'A区早间水肥灌溉', taskType: 'FERTIGATION', status: 0, triggerSource: 'AUTO_TIMED', area: 'A区', planDuration: 30, planWaterUsage: 180, planStartTime: new Date(Date.now() + 3600000).toISOString() },
        { id: 2, taskName: 'B区清水灌溉', taskType: 'WATER', status: 1, triggerSource: 'MANUAL', area: 'B区', planDuration: 25, planWaterUsage: 150, planStartTime: new Date(Date.now() - 1800000).toISOString() },
        { id: 3, taskName: '管道冲洗任务', taskType: 'FLUSH', status: 2, triggerSource: 'AUTO_THRESHOLD', area: '全区域', planDuration: 10, planWaterUsage: 80, planStartTime: new Date(Date.now() - 7200000).toISOString() },
        { id: 4, taskName: 'C区配方施肥', taskType: 'FERTIGATION', status: 0, triggerSource: 'FORMULA', area: 'C区', planDuration: 35, planWaterUsage: 200, planStartTime: new Date(Date.now() + 7200000).toISOString() },
        { id: 5, taskName: 'D区补水灌溉', taskType: 'WATER', status: 2, triggerSource: 'AUTO_THRESHOLD', area: 'D区', planDuration: 20, planWaterUsage: 120, planStartTime: new Date(Date.now() - 14400000).toISOString() }
      ]
      const filtered = mockTasks.filter(t => t.status === this.activeTab)
      this.taskList = this.page === 1 ? filtered : [...this.taskList, ...filtered]
      this.total = filtered.length
      this.hasMore = false
      this.counts = [1, 1, 2]
    },
    async loadCounts() {
      try {
        for (let i = 0; i < 3; i++) {
          const res = await api.getIrrigationTaskList({
            page: 1,
            size: 1,
            greenhouseId: this.greenhouseId,
            status: i
          })
          this.counts[i] = res.total || 0
        }
      } catch (e) {
        console.error(e)
      }
    },
    getStatusText(status) {
      return irrigationTaskStatusMap[status]?.text || '未知'
    },
    getStatusColor(status) {
      return irrigationTaskStatusMap[status]?.color || '#999'
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
    getTaskTypeIcon(type) {
      return irrigationTaskTypeMap[type]?.icon || '💧'
    },
    getTaskTypeText(type) {
      return irrigationTaskTypeMap[type]?.text || '灌溉'
    },
    getTaskTypeColor(type) {
      return irrigationTaskTypeMap[type]?.color || '#999'
    },
    getTaskTypeBg(type) {
      const color = irrigationTaskTypeMap[type]?.color || '#999'
      return color + '20'
    },
    getTriggerSourceText(source) {
      return irrigationTriggerSourceMap[source]?.text || '未知'
    },
    getTriggerSourceColor(source) {
      return irrigationTriggerSourceMap[source]?.color || '#999'
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
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/irrigation-task/task-detail?id=${id}`
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
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 8rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #666;
    border-radius: 12rpx;
    position: relative;
    
    &.active {
      background: #1890ff;
      color: #fff;
      font-weight: bold;
    }
    
    .badge {
      position: absolute;
      top: 8rpx;
      right: 20rpx;
      background: #ff4d4f;
      color: #fff;
      font-size: 20rpx;
      padding: 2rpx 10rpx;
      border-radius: 20rpx;
    }
  }
}

.task-list {
  padding: 0 24rpx 24rpx;
  
  .task-item {
    display: flex;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    position: relative;
    
    .task-icon {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    
    .task-content {
      flex: 1;
      min-width: 0;
      
      .task-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        .task-name {
          font-size: 30rpx;
          color: #333;
          font-weight: bold;
          flex: 1;
          margin-right: 16rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .status-tag {
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          font-size: 22rpx;
          flex-shrink: 0;
        }
      }
      
      .task-meta {
        display: flex;
        gap: 32rpx;
        margin-bottom: 12rpx;
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8rpx;
          
          .meta-label {
            font-size: 24rpx;
            color: #999;
          }
          
          .meta-value {
            font-size: 24rpx;
            font-weight: 500;
          }
        }
      }
      
      .task-info {
        display: flex;
        gap: 24rpx;
        margin-bottom: 12rpx;
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 4rpx;
          font-size: 22rpx;
          color: #666;
          
          .info-icon {
            font-size: 20rpx;
          }
        }
      }
      
      .task-time {
        display: flex;
        align-items: center;
        gap: 8rpx;
        
        .time-icon {
          font-size: 22rpx;
        }
        
        .time-text {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
    
    .task-arrow {
      display: flex;
      align-items: center;
      color: #ccc;
      font-size: 32rpx;
      margin-left: 16rpx;
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

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
</style>
