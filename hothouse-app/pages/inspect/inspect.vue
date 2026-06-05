<template>
  <view class="page">
    <view class="header-card">
      <view class="header-info">
        <text class="header-title">今日巡检</text>
        <text class="header-date">{{ today }}</text>
      </view>
      <view class="header-stats">
        <view class="stat-item">
          <text class="stat-num">{{ todayStats.total }}</text>
          <text class="stat-label">应巡检</text>
        </view>
        <view class="stat-item done">
          <text class="stat-num">{{ todayStats.done }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-item pending">
          <text class="stat-num">{{ todayStats.pending }}</text>
          <text class="stat-label">待处理</text>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索设备/巡检点" 
          v-model="searchKeyword"
          @confirm="loadData"
        />
      </view>
      <view class="add-btn" @click="showAddModal = true">
        <text>+ 新建巡检</text>
      </view>
    </view>

    <view class="filter-tabs">
      <view 
        class="filter-tab" 
        :class="{ active: filterStatus === 'all' }"
        @click="filterStatus = 'all'; loadData()"
      >
        全部
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: filterStatus === 'pending' }"
        @click="filterStatus = 'pending'; loadData()"
      >
        待巡检
        <text class="badge" v-if="pendingCount > 0">{{ pendingCount }}</text>
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: filterStatus === 'done' }"
        @click="filterStatus = 'done'; loadData()"
      >
        已完成
      </view>
      <view 
        class="filter-tab" 
        :class="{ active: filterStatus === 'abnormal' }"
        @click="filterStatus = 'abnormal'; loadData()"
      >
        异常
      </view>
    </view>

    <view class="inspect-list">
      <view 
        class="inspect-item" 
        v-for="item in filteredList" 
        :key="item.id"
        @click="viewDetail(item)"
      >
        <view class="item-header">
          <view class="item-title">
            <text class="item-name">{{ item.checkPointName }}</text>
            <text class="item-type" :class="'type-' + item.type">{{ getTypeName(item.type) }}</text>
          </view>
          <text class="item-status" :class="'status-' + item.status">
            {{ getStatusText(item.status) }}
          </text>
        </view>
        
        <view class="item-content">
          <view class="item-row">
            <text class="row-label">📍 位置</text>
            <text class="row-value">{{ item.location }}</text>
          </view>
          <view class="item-row" v-if="item.deviceCode">
            <text class="row-label">🔧 设备</text>
            <text class="row-value">{{ item.deviceCode }}</text>
          </view>
          <view class="item-row" v-if="item.status === 1">
            <text class="row-label">⏰ 计划时间</text>
            <text class="row-value">{{ formatTime(item.planTime) }}</text>
          </view>
          <view class="item-row" v-if="item.status === 2 || item.status === 3">
            <text class="row-label">✅ 巡检时间</text>
            <text class="row-value">{{ formatTime(item.inspectTime) }}</text>
          </view>
          <view class="item-row" v-if="item.inspector">
            <text class="row-label">👤 巡检人</text>
            <text class="row-value">{{ item.inspector }}</text>
          </view>
          <view class="item-row abnormal" v-if="item.status === 3">
            <text class="row-label">⚠️ 异常描述</text>
            <text class="row-value">{{ item.remark }}</text>
          </view>
        </view>
        
        <view class="item-actions">
          <view 
            class="action-btn primary" 
            v-if="item.status === 1"
            @click.stop="doInspect(item)"
          >
            <text>立即巡检</text>
          </view>
          <view 
            class="action-btn" 
            v-if="item.status === 2"
            @click.stop="viewDetail(item)"
          >
            <text>查看详情</text>
          </view>
          <view 
            class="action-btn danger" 
            v-if="item.status === 3"
            @click.stop="handleAbnormal(item)"
          >
            <text>处理异常</text>
          </view>
        </view>
      </view>
      
      <view class="empty" v-if="!filteredList.length">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无巡检记录</text>
      </view>
    </view>

    <view class="modal" v-if="showAddModal" @click.self="showAddModal = false">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">新建巡检记录</text>
          <text class="modal-close" @click="showAddModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">巡检点名称</text>
            <input class="form-input" v-model="newRecord.checkPointName" placeholder="请输入巡检点名称" />
          </view>
          <view class="form-item">
            <text class="form-label">巡检类型</text>
            <picker :range="typeOptions" range-key="label" @change="onTypeChange">
              <view class="form-picker">
                <text>{{ typeOptions[newRecord.type]?.label || '请选择' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">位置</text>
            <input class="form-input" v-model="newRecord.location" placeholder="请输入具体位置" />
          </view>
          <view class="form-item">
            <text class="form-label">关联设备</text>
            <picker :range="deviceOptions" range-key="label" @change="onDeviceChange">
              <view class="form-picker">
                <text>{{ newRecord.deviceCode || '选择设备（可选）' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">巡检结果</text>
            <view class="radio-group">
              <view 
                class="radio-item" 
                :class="{ active: newRecord.status === 2 }"
                @click="newRecord.status = 2"
              >
                <text class="radio-dot">✓</text>
                <text>正常</text>
              </view>
              <view 
                class="radio-item abnormal" 
                :class="{ active: newRecord.status === 3 }"
                @click="newRecord.status = 3"
              >
                <text class="radio-dot">!</text>
                <text>异常</text>
              </view>
            </view>
          </view>
          <view class="form-item" v-if="newRecord.status === 3">
            <text class="form-label">异常描述</text>
            <textarea 
              class="form-textarea" 
              v-model="newRecord.remark" 
              placeholder="请描述异常情况"
              :maxlength="200"
            />
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showAddModal = false">取消</view>
          <view class="modal-btn confirm" @click="submitInspect">提交</view>
        </view>
      </view>
    </view>

    <view class="modal" v-if="showInspectModal" @click.self="showInspectModal = false">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">巡检确认 - {{ currentRecord?.checkPointName }}</text>
          <text class="modal-close" @click="showInspectModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="info-card">
            <view class="info-row">
              <text class="info-label">位置</text>
              <text class="info-value">{{ currentRecord?.location }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">设备</text>
              <text class="info-value">{{ currentRecord?.deviceCode || '无' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">计划时间</text>
              <text class="info-value">{{ formatTime(currentRecord?.planTime) }}</text>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">巡检结果</text>
            <view class="radio-group">
              <view 
                class="radio-item" 
                :class="{ active: inspectForm.status === 2 }"
                @click="inspectForm.status = 2"
              >
                <text class="radio-dot">✓</text>
                <text>正常</text>
              </view>
              <view 
                class="radio-item abnormal" 
                :class="{ active: inspectForm.status === 3 }"
                @click="inspectForm.status = 3"
              >
                <text class="radio-dot">!</text>
                <text>异常</text>
              </view>
            </view>
          </view>
          <view class="form-item" v-if="inspectForm.status === 3">
            <text class="form-label">异常描述</text>
            <textarea 
              class="form-textarea" 
              v-model="inspectForm.remark" 
              placeholder="请描述异常情况"
              :maxlength="200"
            />
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showInspectModal = false">取消</view>
          <view class="modal-btn confirm" @click="submitInspectConfirm">确认提交</view>
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
      today: '',
      searchKeyword: '',
      filterStatus: 'all',
      showAddModal: false,
      showInspectModal: false,
      currentRecord: null,
      inspectList: [],
      todayStats: { total: 0, done: 0, pending: 0 },
      typeOptions: [
        { value: 1, label: '设备巡检' },
        { value: 2, label: '环境巡检' },
        { value: 3, label: '安全巡检' },
        { value: 4, label: '日常巡检' }
      ],
      deviceOptions: [
        { value: '', label: '无' },
        { value: 'FAN001', label: 'FAN001 - 1号风机' },
        { value: 'FAN002', label: 'FAN002 - 2号风机' },
        { value: 'WET001', label: 'WET001 - 湿帘水泵' },
        { value: 'SHD001', label: 'SHD001 - 遮阳网电机' },
        { value: 'THS001', label: 'THS001 - 温湿度传感器' }
      ],
      newRecord: {
        checkPointName: '',
        type: 1,
        location: '',
        deviceCode: '',
        status: 2,
        remark: ''
      },
      inspectForm: {
        status: 2,
        remark: ''
      }
    }
  },
  computed: {
    pendingCount() {
      return this.inspectList.filter(i => i.status === 1).length
    },
    filteredList() {
      let list = this.inspectList
      if (this.filterStatus !== 'all') {
        const statusMap = { pending: 1, done: 2, abnormal: 3 }
        list = list.filter(i => i.status === statusMap[this.filterStatus])
      }
      if (this.searchKeyword) {
        const kw = this.searchKeyword.toLowerCase()
        list = list.filter(i => 
          i.checkPointName.toLowerCase().includes(kw) ||
          (i.deviceCode && i.deviceCode.toLowerCase().includes(kw)) ||
          i.location.toLowerCase().includes(kw)
        )
      }
      return list
    }
  },
  onLoad() {
    const d = new Date()
    this.today = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    this.loadData()
  },
  onPullDownRefresh() {
    this.loadData()
    setTimeout(() => uni.stopPullDownRefresh(), 1000)
  },
  methods: {
    async loadData() {
      try {
        const now = new Date()
        const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
        
        this.inspectList = this.generateMockData()
        
        this.todayStats = {
          total: this.inspectList.length,
          done: this.inspectList.filter(i => i.status === 2 || i.status === 3).length,
          pending: this.inspectList.filter(i => i.status === 1).length
        }
      } catch (e) {
        console.error(e)
      }
    },
    generateMockData() {
      const now = Date.now()
      return [
        {
          id: 1,
          checkPointName: '1号风机运行检查',
          type: 1,
          location: '1号大棚-东侧',
          deviceCode: 'FAN001',
          status: 1,
          planTime: new Date(now - 3600000).toISOString(),
          inspector: null,
          remark: ''
        },
        {
          id: 2,
          checkPointName: '湿帘水位检查',
          type: 1,
          location: '1号大棚-西侧',
          deviceCode: 'WET001',
          status: 2,
          planTime: new Date(now - 7200000).toISOString(),
          inspectTime: new Date(now - 7000000).toISOString(),
          inspector: '张三',
          remark: ''
        },
        {
          id: 3,
          checkPointName: '温湿度传感器校准',
          type: 2,
          location: '1号大棚-中部',
          deviceCode: 'THS001',
          status: 3,
          planTime: new Date(now - 10800000).toISOString(),
          inspectTime: new Date(now - 10000000).toISOString(),
          inspector: '李四',
          remark: '温度传感器读数偏高约2℃，需要重新校准'
        },
        {
          id: 4,
          checkPointName: '遮阳网机械结构检查',
          type: 1,
          location: '1号大棚-顶部',
          deviceCode: 'SHD001',
          status: 1,
          planTime: new Date(now + 3600000).toISOString(),
          inspector: null,
          remark: ''
        },
        {
          id: 5,
          checkPointName: '消防设施检查',
          type: 3,
          location: '1号大棚-入口',
          deviceCode: '',
          status: 2,
          planTime: new Date(now - 14400000).toISOString(),
          inspectTime: new Date(now - 14000000).toISOString(),
          inspector: '王五',
          remark: ''
        },
        {
          id: 6,
          checkPointName: '整体环境巡视',
          type: 4,
          location: '1号大棚-全域',
          deviceCode: '',
          status: 1,
          planTime: new Date(now + 7200000).toISOString(),
          inspector: null,
          remark: ''
        }
      ]
    },
    getTypeName(type) {
      const types = { 1: '设备', 2: '环境', 3: '安全', 4: '日常' }
      return types[type] || '未知'
    },
    getStatusText(status) {
      const statuses = { 1: '待巡检', 2: '正常', 3: '异常' }
      return statuses[status] || '未知'
    },
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },
    onTypeChange(e) {
      this.newRecord.type = this.typeOptions[e.detail.value].value
    },
    onDeviceChange(e) {
      this.newRecord.deviceCode = this.deviceOptions[e.detail.value].value
    },
    viewDetail(item) {
      console.log('查看详情', item)
    },
    doInspect(item) {
      this.currentRecord = item
      this.inspectForm = { status: 2, remark: '' }
      this.showInspectModal = true
    },
    handleAbnormal(item) {
      uni.showModal({
        title: '处理异常',
        content: `确定已处理该异常吗？\n${item.remark}`,
        success: (res) => {
          if (res.confirm) {
            item.status = 2
            uni.showToast({ title: '已标记为已处理', icon: 'success' })
          }
        }
      })
    },
    submitInspect() {
      if (!this.newRecord.checkPointName) {
        uni.showToast({ title: '请输入巡检点名称', icon: 'none' })
        return
      }
      if (!this.newRecord.location) {
        uni.showToast({ title: '请输入位置', icon: 'none' })
        return
      }
      const newItem = {
        id: Date.now(),
        ...this.newRecord,
        inspectTime: new Date().toISOString(),
        inspector: 'mobile_user',
        greenhouseId: 1
      }
      this.inspectList.unshift(newItem)
      this.showAddModal = false
      this.newRecord = {
        checkPointName: '',
        type: 1,
        location: '',
        deviceCode: '',
        status: 2,
        remark: ''
      }
      uni.showToast({ title: '提交成功', icon: 'success' })
      this.todayStats.total++
      this.todayStats.done++
    },
    submitInspectConfirm() {
      if (this.inspectForm.status === 3 && !this.inspectForm.remark) {
        uni.showToast({ title: '请描述异常情况', icon: 'none' })
        return
      }
      this.currentRecord.status = this.inspectForm.status
      this.currentRecord.inspectTime = new Date().toISOString()
      this.currentRecord.inspector = 'mobile_user'
      this.currentRecord.remark = this.inspectForm.remark
      this.showInspectModal = false
      this.todayStats.done++
      this.todayStats.pending--
      uni.showToast({ title: '巡检完成', icon: 'success' })
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

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 24rpx;
  border-radius: 20rpx;
  padding: 32rpx;
  color: #fff;
  
  .header-info {
    margin-bottom: 24rpx;
    
    .header-title {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 8rpx;
    }
    
    .header-date {
      font-size: 26rpx;
      opacity: 0.9;
    }
  }
  
  .header-stats {
    display: flex;
    justify-content: space-around;
    
    .stat-item {
      text-align: center;
      
      .stat-num {
        display: block;
        font-size: 48rpx;
        font-weight: bold;
      }
      
      .stat-label {
        font-size: 24rpx;
        opacity: 0.9;
      }
      
      &.done .stat-num {
        color: #52c41a;
      }
      
      &.pending .stat-num {
        color: #faad14;
      }
    }
  }
}

.action-bar {
  display: flex;
  gap: 16rpx;
  padding: 0 24rpx 20rpx;
  
  .search-box {
    flex: 1;
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 12rpx;
    padding: 0 20rpx;
    
    .search-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }
    
    .search-input {
      flex: 1;
      height: 72rpx;
      font-size: 28rpx;
    }
  }
  
  .add-btn {
    background: #1989fa;
    color: #fff;
    padding: 0 28rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    font-weight: bold;
  }
}

.filter-tabs {
  display: flex;
  background: #fff;
  margin: 0 24rpx 20rpx;
  border-radius: 12rpx;
  padding: 8rpx;
  
  .filter-tab {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    font-size: 26rpx;
    color: #666;
    border-radius: 8rpx;
    position: relative;
    
    &.active {
      background: #f0f7ff;
      color: #1989fa;
      font-weight: bold;
    }
    
    .badge {
      position: absolute;
      top: 4rpx;
      right: 20rpx;
      background: #ff4d4f;
      color: #fff;
      font-size: 18rpx;
      padding: 2rpx 10rpx;
      border-radius: 20rpx;
    }
  }
}

.inspect-list {
  padding: 0 24rpx;
  
  .inspect-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
      .item-title {
        display: flex;
        align-items: center;
        gap: 12rpx;
        
        .item-name {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
        }
        
        .item-type {
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          font-size: 22rpx;
          
          &.type-1 { background: #e6f7ff; color: #1890ff; }
          &.type-2 { background: #f6ffed; color: #52c41a; }
          &.type-3 { background: #fff1f0; color: #ff4d4f; }
          &.type-4 { background: #fff7e6; color: #fa8c16; }
        }
      }
      
      .item-status {
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        font-size: 24rpx;
        
        &.status-1 { background: #fff7e6; color: #fa8c16; }
        &.status-2 { background: #f6ffed; color: #52c41a; }
        &.status-3 { background: #fff1f0; color: #ff4d4f; }
      }
    }
    
    .item-content {
      .item-row {
        display: flex;
        margin-bottom: 8rpx;
        font-size: 26rpx;
        
        &.abnormal {
          background: #fff1f0;
          border-radius: 8rpx;
          padding: 8rpx 12rpx;
          margin: 8rpx 0;
          
          .row-label, .row-value {
            color: #ff4d4f;
          }
        }
        
        .row-label {
          width: 160rpx;
          color: #999;
          flex-shrink: 0;
        }
        
        .row-value {
          flex: 1;
          color: #333;
        }
      }
    }
    
    .item-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16rpx;
      margin-top: 16rpx;
      padding-top: 16rpx;
      border-top: 1rpx solid #f0f0f0;
      
      .action-btn {
        padding: 12rpx 28rpx;
        border-radius: 8rpx;
        font-size: 26rpx;
        background: #f5f5f5;
        color: #666;
        
        &.primary {
          background: #1989fa;
          color: #fff;
        }
        
        &.danger {
          background: #ff4d4f;
          color: #fff;
        }
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    width: 90%;
    max-width: 680rpx;
    background: #fff;
    border-radius: 20rpx;
    max-height: 80vh;
    overflow: hidden;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .modal-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .modal-close {
      font-size: 48rpx;
      color: #999;
      line-height: 1;
    }
  }
  
  .modal-body {
    padding: 24rpx 32rpx;
    max-height: 50vh;
    overflow-y: auto;
  }
  
  .modal-footer {
    display: flex;
    border-top: 1rpx solid #f0f0f0;
    
    .modal-btn {
      flex: 1;
      text-align: center;
      padding: 28rpx 0;
      font-size: 30rpx;
      
      &.cancel {
        color: #999;
        border-right: 1rpx solid #f0f0f0;
      }
      
      &.confirm {
        color: #1989fa;
        font-weight: bold;
      }
    }
  }
}

.form-item {
  margin-bottom: 24rpx;
  
  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
    font-weight: 500;
  }
  
  .form-input, .form-picker, .form-textarea {
    width: 100%;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }
  
  .form-textarea {
    height: 160rpx;
    resize: none;
  }
  
  .form-picker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .picker-arrow {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .radio-group {
    display: flex;
    gap: 24rpx;
    
    .radio-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      padding: 20rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      font-size: 28rpx;
      color: #666;
      border: 2rpx solid transparent;
      
      .radio-dot {
        width: 32rpx;
        height: 32rpx;
        border-radius: 50%;
        background: #ccc;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20rpx;
        font-weight: bold;
      }
      
      &.active {
        background: #e6f7ff;
        color: #1890ff;
        border-color: #1890ff;
        
        .radio-dot {
          background: #1890ff;
        }
      }
      
      &.abnormal.active {
        background: #fff1f0;
        color: #ff4d4f;
        border-color: #ff4d4f;
        
        .radio-dot {
          background: #ff4d4f;
        }
      }
    }
  }
}

.info-card {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
  
  .info-row {
    display: flex;
    padding: 8rpx 0;
    
    .info-label {
      width: 140rpx;
      font-size: 26rpx;
      color: #999;
    }
    
    .info-value {
      flex: 1;
      font-size: 26rpx;
      color: #333;
    }
  }
}
</style>
