<template>
  <view class="page">
    <view class="search-header">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          v-model="keyword" 
          placeholder="搜索病虫害名称" 
          @confirm="search"
        />
        <text class="search-clear" v-if="keyword" @click="clearKeyword">✕</text>
      </view>
      <view class="camera-btn" @click="goToIdentify">
        <text class="camera-icon">📷</text>
        <text class="camera-text">拍照识别</text>
      </view>
    </view>

    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }"
        @click="switchTab('all')"
      >
        全部
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'PEST' }"
        @click="switchTab('PEST')"
      >
        虫害
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'DISEASE' }"
        @click="switchTab('DISEASE')"
      >
        病害
      </view>
    </view>

    <view class="pest-grid">
      <view 
        class="pest-item" 
        v-for="pest in pestList" 
        :key="pest.id"
        @click="goToDetail(pest.id)"
      >
        <view class="pest-image">
          <image 
            v-if="getFirstImage(pest.imageUrls)" 
            :src="getFirstImage(pest.imageUrls)" 
            mode="aspectFill"
          />
          <text v-else class="placeholder-icon">🌿</text>
        </view>
        <view class="pest-info">
          <text class="pest-name">{{ pest.pestName }}</text>
          <view class="pest-tags">
            <text class="pest-type" :style="{ background: getPestTypeBg(pest.pestType), color: getPestTypeColor(pest.pestType) }">
              {{ getPestTypeText(pest.pestType) }}
            </text>
            <text class="pest-severity" :style="{ color: getSeverityColor(pest.severityLevel) }">
              {{ getSeverityText(pest.severityLevel) }}
            </text>
          </view>
        </view>
      </view>

      <view class="empty" v-if="!loading && pestList.length === 0">
        <text class="empty-icon">🌱</text>
        <text class="empty-text">暂无数据</text>
      </view>

      <view class="loading" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
    </view>

    <view class="load-more" v-if="hasMore && !loading">
      <text class="load-more-text">上拉加载更多</text>
    </view>

    <view class="no-more" v-if="!hasMore && pestList.length > 0">
      <text class="no-more-text">没有更多了</text>
    </view>

    <view class="bottom-btn">
      <button class="btn-identify" @click="goToIdentify">
        <text class="btn-icon">📷</text>
        <text>病虫害识别</text>
      </button>
      <button class="btn-records" @click="goToRecords">
        <text class="btn-icon">📋</text>
        <text>识别记录</text>
      </button>
    </view>
  </view>
</template>

<script>
import { api, pestTypeMap, severityLevelMap } from '@/config'

export default {
  data() {
    return {
      activeTab: 'all',
      keyword: '',
      pestList: [],
      page: 1,
      size: 10,
      total: 0,
      hasMore: true,
      loading: false
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
    search() {
      this.refresh()
    },
    clearKeyword() {
      this.keyword = ''
      this.refresh()
    },
    async refresh() {
      this.page = 1
      this.hasMore = true
      this.pestList = []
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
          status: 1
        }
        if (this.activeTab !== 'all') {
          params.pestType = this.activeTab
        }
        if (this.keyword) {
          params.keyword = this.keyword
        }
        const res = await api.getPestList(params)
        if (res.records) {
          this.pestList = this.page === 1 ? res.records : [...this.pestList, ...res.records]
          this.total = res.total
          this.hasMore = this.pestList.length < this.total
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    getFirstImage(urls) {
      if (!urls) return ''
      const urlList = urls.split(',').filter(u => u)
      return urlList[0] || ''
    },
    getPestTypeText(type) {
      return pestTypeMap[type]?.text || '未知'
    },
    getPestTypeColor(type) {
      return pestTypeMap[type]?.color || '#999'
    },
    getPestTypeBg(type) {
      const colors = {
        PEST: '#fff7e6',
        DISEASE: '#fff1f0'
      }
      return colors[type] || '#f5f5f5'
    },
    getSeverityText(level) {
      return severityLevelMap[level]?.text || '未知'
    },
    getSeverityColor(level) {
      return severityLevelMap[level]?.color || '#999'
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/pest-detail/pest-detail?id=${id}`
      })
    },
    goToIdentify() {
      uni.navigateTo({
        url: '/pages/pest-identify/pest-identify'
      })
    },
    goToRecords() {
      uni.navigateTo({
        url: '/pages/identify-records/identify-records'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}

.search-header {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .search-box {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 20rpx;
    height: 72rpx;
    
    .search-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }
    
    .search-input {
      flex: 1;
      font-size: 28rpx;
      height: 72rpx;
    }
    
    .search-clear {
      font-size: 28rpx;
      color: #ccc;
      padding: 8rpx;
    }
  }
  
  .camera-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #1989fa;
    border-radius: 12rpx;
    padding: 0 20rpx;
    height: 72rpx;
    
    .camera-icon {
      font-size: 28rpx;
    }
    
    .camera-text {
      font-size: 22rpx;
      color: #fff;
      margin-top: 2rpx;
    }
  }
}

.tabs {
  display: flex;
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 8rpx;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #666;
    border-radius: 12rpx;
    
    &.active {
      background: #1989fa;
      color: #fff;
      font-weight: bold;
    }
  }
}

.pest-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 0 24rpx;
  
  .pest-item {
    width: calc(50% - 8rpx);
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    .pest-image {
      width: 100%;
      height: 240rpx;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      
      image {
        width: 100%;
        height: 100%;
      }
      
      .placeholder-icon {
        font-size: 80rpx;
        opacity: 0.5;
      }
    }
    
    .pest-info {
      padding: 16rpx;
      
      .pest-name {
        font-size: 28rpx;
        color: #333;
        font-weight: bold;
        display: block;
        margin-bottom: 12rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .pest-tags {
        display: flex;
        gap: 8rpx;
        
        .pest-type, .pest-severity {
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
          font-size: 22rpx;
        }
      }
    }
  }
}

.empty, .loading, .load-more, .no-more {
  width: 100%;
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

.bottom-btn {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  
  button {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    
    .btn-icon {
      font-size: 32rpx;
    }
  }
  
  .btn-identify {
    background: #1989fa;
    color: #fff;
  }
  
  .btn-records {
    background: #f0f5ff;
    color: #1989fa;
  }
}
</style>
