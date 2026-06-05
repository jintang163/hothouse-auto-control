<template>
  <view class="page" v-if="pest">
    <swiper class="image-swiper" indicator-dots autoplay circular>
      <swiper-item v-for="(img, index) in imageList" :key="index">
        <image :src="img" mode="aspectFill" class="swiper-image" />
      </swiper-item>
      <swiper-item v-if="imageList.length === 0">
        <view class="swiper-placeholder">
          <text class="placeholder-icon">🌿</text>
        </view>
      </swiper-item>
    </swiper>

    <view class="pest-card">
      <view class="pest-header">
        <text class="pest-name">{{ pest.pestName }}</text>
        <view class="pest-tags">
          <text class="type-tag" :style="{ background: getPestTypeBg(pest.pestType), color: getPestTypeColor(pest.pestType) }">
            {{ getPestTypeText(pest.pestType) }}
          </text>
          <text class="severity-tag" :style="{ color: getSeverityColor(pest.severityLevel) }">
            {{ getSeverityText(pest.severityLevel) }}
          </text>
        </view>
      </view>

      <view class="info-grid">
        <view class="info-item">
          <text class="info-label">别名</text>
          <text class="info-value">{{ pest.aliasNames || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">学名</text>
          <text class="info-value">{{ pest.scientificName || '-' }}</text>
        </view>
        <view class="info-item full">
          <text class="info-label">易感作物</text>
          <text class="info-value">{{ pest.susceptibleCrops || '-' }}</text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title">
        <text class="title-icon">📋</text>
        <text>症状描述</text>
      </view>
      <view class="section-content">
        <text>{{ pest.symptomDescription || '暂无数据' }}</text>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title">
        <text class="title-icon">⚠️</text>
        <text>危害特征</text>
      </view>
      <view class="section-content">
        <text>{{ pest.damageSymptom || '暂无数据' }}</text>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title">
        <text class="title-icon">🌡️</text>
        <text>发生条件</text>
      </view>
      <view class="section-content">
        <text>{{ pest.occurrenceCondition || '暂无数据' }}</text>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title">
        <text class="title-icon">📅</text>
        <text>发生时期</text>
      </view>
      <view class="section-content">
        <text>{{ pest.occurrencePeriod || '暂无数据' }}</text>
      </view>
    </view>

    <view class="section-card">
      <view class="section-title">
        <text class="title-icon">🛡️</text>
        <text>防治方法</text>
      </view>

      <view class="control-tabs">
        <view 
          class="control-tab" 
          :class="{ active: activeControlTab === 0 }"
          @click="activeControlTab = 0"
        >
          农业防治
        </view>
        <view 
          class="control-tab" 
          :class="{ active: activeControlTab === 1 }"
          @click="activeControlTab = 1"
        >
          物理防治
        </view>
        <view 
          class="control-tab" 
          :class="{ active: activeControlTab === 2 }"
          @click="activeControlTab = 2"
        >
          生物防治
        </view>
        <view 
          class="control-tab" 
          :class="{ active: activeControlTab === 3 }"
          @click="activeControlTab = 3"
        >
          药剂防治
        </view>
      </view>

      <view class="control-content">
        <view v-if="activeControlTab === 0">
          <text>{{ pest.agriculturalControl || '暂无数据' }}</text>
        </view>
        <view v-if="activeControlTab === 1">
          <text>{{ pest.physicalControl || '暂无数据' }}</text>
        </view>
        <view v-if="activeControlTab === 2">
          <text>{{ pest.biologicalControl || '暂无数据' }}</text>
        </view>
        <view v-if="activeControlTab === 3">
          <text>{{ pest.controlAgents || '暂无数据' }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-action">
      <button class="btn-identify" @click="goToIdentify">
        <text class="btn-icon">📷</text>
        <text>去识别</text>
      </button>
    </view>
  </view>

  <view class="loading" v-if="loading">
    <text class="loading-text">加载中...</text>
  </view>
</template>

<script>
import { api, pestTypeMap, severityLevelMap } from '@/config'

export default {
  data() {
    return {
      pestId: null,
      pest: null,
      loading: true,
      imageList: [],
      activeControlTab: 0
    }
  },
  onLoad(options) {
    this.pestId = options.id
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        this.pest = await api.getPest(this.pestId)
        if (this.pest.imageUrls) {
          this.imageList = this.pest.imageUrls.split(',').filter(u => u)
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
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

.image-swiper {
  width: 100%;
  height: 400rpx;
  
  .swiper-image {
    width: 100%;
    height: 100%;
  }
  
  .swiper-placeholder {
    width: 100%;
    height: 100%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .placeholder-icon {
      font-size: 120rpx;
      opacity: 0.5;
    }
  }
}

.pest-card {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  
  .pest-header {
    margin-bottom: 24rpx;
    
    .pest-name {
      font-size: 36rpx;
      color: #333;
      font-weight: bold;
      display: block;
      margin-bottom: 16rpx;
    }
    
    .pest-tags {
      display: flex;
      gap: 12rpx;
      
      .type-tag, .severity-tag {
        padding: 6rpx 16rpx;
        border-radius: 6rpx;
        font-size: 24rpx;
      }
    }
  }
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  
  .info-item {
    width: calc(50% - 8rpx);
    background: #fafafa;
    border-radius: 12rpx;
    padding: 16rpx;
    
    &.full {
      width: 100%;
    }
    
    .info-label {
      font-size: 24rpx;
      color: #999;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .info-value {
      font-size: 26rpx;
      color: #333;
      line-height: 1.5;
    }
  }
}

.section-card {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    
    .title-icon {
      font-size: 32rpx;
    }
  }
  
  .section-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
  }
}

.control-tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 6rpx;
  margin-bottom: 16rpx;
  
  .control-tab {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    font-size: 24rpx;
    color: #666;
    border-radius: 8rpx;
    
    &.active {
      background: #fff;
      color: #1989fa;
      font-weight: bold;
      box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
    }
  }
}

.control-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
  padding: 8rpx 0;
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

.loading {
  text-align: center;
  padding: 120rpx 0;
  
  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
