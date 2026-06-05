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
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 3 }"
        @click="switchTab(3)"
      >
        已取消
      </view>
    </view>

    <view class="task-list">
      <view 
        class="task-item" 
        v-for="task in taskList" 
        :key="task.id"
        @click="goToDetail(task.id)"
      >
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
            <text class="meta-label">优先级</text>
            <text class="meta-value priority" :class="'p-' + task.priority">
              {{ getPriorityText(task.priority) }}
            </text>
          </view>
        </view>
        <view class="task-time">
          <text class="time-icon">📅</text>
          <text class="time-text">{{ formatTime(task.planStartTime) }} - {{ formatTime(task.planEndTime) }}</text>
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
        <text class="loading-text">加载中...</text>
      </view>

      <view class="load-more" v-if="hasMore && !loading">
        <text class="load-more-text">上拉加载更多</text>
      </view>

      <view class="no-more" v-if="!hasMore && taskList.length > 0">
        <text class="no-more-text">没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script>
import { api, taskStatusMap, taskTypeMap } from '@/config'

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
      counts: [0, 0, 0, 0]
    }
  },
  onLoad() {
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
        const res = await api.getTaskList(params)
        if (res.records) {
          this.taskList = this.page === 1 ? res.records : [...this.taskList, ...res.records]
          this.total = res.total
          this.hasMore = this.taskList.length < this.total
        }
        await this.loadCounts()
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    async loadCounts() {
      try {
        for (let i = 0; i < 4; i++) {
          const res = await api.getTaskList({
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
      return taskStatusMap[status]?.text || '未知'
    },
    getStatusColor(status) {
      return taskStatusMap[status]?.color || '#999'
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
    getTaskTypeText(type) {
      return taskTypeMap[type]?.text || '未知'
    },
    getTaskTypeColor(type) {
      return taskTypeMap[type]?.color || '#999'
    },
    getPriorityText(priority) {
      const texts = { 1: '低', 2: '中', 3: '高', 4: '紧急' }
      return texts[priority] || '中'
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
        url: `/pages/task-detail/task-detail?id=${id}`
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
      background: #1989fa;
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
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    position: relative;
    
    .task-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16rpx;
      
      .task-name {
        font-size: 30rpx;
        color: #333;
        font-weight: bold;
        flex: 1;
        margin-right: 16rpx;
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
          color: #333;
          
          &.priority {
            &.p-1 { color: #52c41a; }
            &.p-2 { color: #faad14; }
            &.p-3 { color: #fa8c16; }
            &.p-4 { color: #ff4d4f; }
          }
        }
      }
    }
    
    .task-time {
      display: flex;
      align-items: center;
      gap: 8rpx;
      
      .time-icon {
        font-size: 24rpx;
      }
      
      .time-text {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .task-arrow {
      position: absolute;
      right: 24rpx;
      top: 50%;
      transform: translateY(-50%);
      color: #ccc;
      font-size: 32rpx;
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
</style>
