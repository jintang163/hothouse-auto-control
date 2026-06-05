<template>
  <view class="page">
    <view class="filter-tabs">
      <view 
        class="filter-tab" 
        :class="{ active: activeFilter === null }"
        @click="switchFilter(null)"
      >
        全部
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeFilter === 0 }"
        @click="switchFilter(0)"
      >
        未处理
        <text class="badge" v-if="pendingCount > 0">{{ pendingCount }}</text>
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeFilter === 1 }"
        @click="switchFilter(1)"
      >
        处理中
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: activeFilter === 2 }"
        @click="switchFilter(2)"
      >
        已处理
      </view>
    </view>

    <view class="record-list">
      <view 
        class="record-item" 
        v-for="record in recordList" 
        :key="record.id"
        @click="goToDetail(record)"
      >
        <view class="record-image">
          <image 
            v-if="record.imageUrl" 
            :src="record.imageUrl" 
            mode="aspectFill"
          />
          <text v-else class="placeholder-icon">🌿</text>
        </view>
        <view class="record-content">
          <view class="record-header">
            <text class="record-pest">{{ record.pestName || '未识别' }}</text>
            <text 
              class="status-tag" 
              :style="{ background: getStatusBg(record.handleStatus), color: getStatusColor(record.handleStatus) }"
            >
              {{ getStatusText(record.handleStatus) }}
            </text>
          </view>
          <view class="record-meta">
            <view class="meta-item">
              <text class="meta-label">置信度</text>
              <text class="meta-value confidence" :style="{ color: getConfidenceColor(record.confidence) }">
                {{ formatConfidence(record.confidence) }}%
              </text>
            </view>
            <view class="meta-item">
              <text class="meta-label">识别时间</text>
              <text class="meta-value">{{ formatTime(record.identifyTime) }}</text>
            </view>
          </view>
          <view class="record-suggestion" v-if="record.suggestion">
            <text class="suggestion-icon">💡</text>
            <text class="suggestion-text">{{ record.suggestion }}</text>
          </view>
        </view>
        <view class="record-arrow">
          <text>›</text>
        </view>
      </view>

      <view class="empty" v-if="!loading && recordList.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无识别记录</text>
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

    <view class="bottom-action">
      <button class="btn-identify" @click="goToIdentify">
        <text class="btn-icon">📷</text>
        <text>新识别</text>
      </button>
    </view>
  </view>
</template>

<script>
import { api, handleStatusMap } from '@/config'

export default {
  data() {
    return {
      greenhouseId: 1,
      activeFilter: null,
      recordList: [],
      page: 1,
      size: 10,
      total: 0,
      hasMore: true,
      loading: false,
      pendingCount: 0
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
    switchFilter(status) {
      this.activeFilter = status
      this.refresh()
    },
    async refresh() {
      this.page = 1
      this.hasMore = true
      this.recordList = []
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
          greenhouseId: this.greenhouseId
        }
        if (this.activeFilter !== null) {
          params.handleStatus = this.activeFilter
        }
        const res = await api.getIdentifyList(params)
        if (res.records) {
          this.recordList = this.page === 1 ? res.records : [...this.recordList, ...res.records]
          this.total = res.total
          this.hasMore = this.recordList.length < this.total
        }
        await this.loadPendingCount()
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    async loadPendingCount() {
      try {
        const res = await api.getIdentifyList({
          page: 1,
          size: 1,
          greenhouseId: this.greenhouseId,
          handleStatus: 0
        })
        this.pendingCount = res.total || 0
      } catch (e) {
        console.error(e)
      }
    },
    getStatusText(status) {
      return handleStatusMap[status]?.text || '未知'
    },
    getStatusColor(status) {
      return handleStatusMap[status]?.color || '#999'
    },
    getStatusBg(status) {
      const colors = {
        0: '#fff1f0',
        1: '#e6f7ff',
        2: '#f6ffed'
      }
      return colors[status] || '#f5f5f5'
    },
    formatConfidence(confidence) {
      if (!confidence) return 0
      return (confidence * 100).toFixed(1)
    },
    getConfidenceColor(confidence) {
      const val = Number(confidence) || 0
      if (val >= 0.8) return '#52c41a'
      if (val >= 0.6) return '#faad14'
      return '#ff4d4f'
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
    goToDetail(record) {
      if (record.pestId) {
        uni.navigateTo({
          url: `/pages/pest-detail/pest-detail?id=${record.pestId}`
        })
      }
    },
    goToIdentify() {
      uni.navigateTo({
        url: '/pages/pest-identify/pest-identify'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.filter-tabs {
  display: flex;
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 8rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .filter-tab {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 26rpx;
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
      right: 16rpx;
      background: #ff4d4f;
      color: #fff;
      font-size: 20rpx;
      padding: 2rpx 8rpx;
      border-radius: 16rpx;
    }
  }
}

.record-list {
  padding: 0 24rpx 24rpx;
  
  .record-item {
    display: flex;
    align-items: flex-start;
    background: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    position: relative;
    
    .record-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      overflow: hidden;
      background: #f0f0f0;
      flex-shrink: 0;
      margin-right: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      image {
        width: 100%;
        height: 100%;
      }
      
      .placeholder-icon {
        font-size: 48rpx;
        opacity: 0.5;
      }
    }
    
    .record-content {
      flex: 1;
      
      .record-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        .record-pest {
          font-size: 28rpx;
          color: #333;
          font-weight: bold;
          flex: 1;
          margin-right: 12rpx;
        }
        
        .status-tag {
          padding: 4rpx 10rpx;
          border-radius: 6rpx;
          font-size: 22rpx;
          flex-shrink: 0;
        }
      }
      
      .record-meta {
        display: flex;
        gap: 24rpx;
        margin-bottom: 12rpx;
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6rpx;
          
          .meta-label {
            font-size: 22rpx;
            color: #999;
          }
          
          .meta-value {
            font-size: 22rpx;
            color: #333;
            
            &.confidence {
              font-weight: bold;
            }
          }
        }
      }
      
      .record-suggestion {
        display: flex;
        align-items: flex-start;
        gap: 6rpx;
        background: #f6ffed;
        padding: 10rpx 12rpx;
        border-radius: 6rpx;
        
        .suggestion-icon {
          font-size: 22rpx;
          flex-shrink: 0;
        }
        
        .suggestion-text {
          font-size: 22rpx;
          color: #52c41a;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }
    
    .record-arrow {
      align-self: center;
      color: #ccc;
      font-size: 28rpx;
      margin-left: 12rpx;
      flex-shrink: 0;
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

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  
  .btn-identify {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #1989fa;
    color: #fff;
    border-radius: 12rpx;
    font-size: 30rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    
    .btn-icon {
      font-size: 36rpx;
    }
  }
}
</style>
