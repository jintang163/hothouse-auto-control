<template>
  <view class="page">
    <view class="task-card" v-if="task">
      <view class="task-header">
        <view class="task-icon" :style="{ background: getTaskTypeBg(task.taskType) }">
          {{ getTaskTypeIcon(task.taskType) }}
        </view>
        <view class="task-title-info">
          <text class="task-name">{{ task.taskName }}</text>
          <text class="status-tag" :style="{ background: getStatusBg(task.status), color: getStatusColor(task.status) }">
            {{ getStatusText(task.status) }}
          </text>
        </view>
      </view>

      <view class="info-section">
        <view class="section-title">基本信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">任务编号</text>
            <text class="info-value">{{ task.taskCode || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">任务类型</text>
            <text class="info-value" :style="{ color: getTaskTypeColor(task.taskType) }">
              {{ getTaskTypeText(task.taskType) }}
            </text>
          </view>
          <view class="info-item">
            <text class="info-label">触发来源</text>
            <text class="info-value" :style="{ color: getTriggerSourceColor(task.triggerSource) }">
              {{ getTriggerSourceText(task.triggerSource) }}
            </text>
          </view>
          <view class="info-item">
            <text class="info-label">灌溉区域</text>
            <text class="info-value">{{ task.area || '全区域' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">执行人</text>
            <text class="info-value">{{ task.executor || '-' }}</text>
          </view>
        </view>
      </view>

      <view class="info-section">
        <view class="section-title">计划数据</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">计划时长</text>
            <text class="info-value">{{ task.planDuration || 0 }} 分钟</text>
          </view>
          <view class="info-item">
            <text class="info-label">计划用水量</text>
            <text class="info-value">{{ task.planWaterUsage || 0 }} L</text>
          </view>
          <view class="info-item" v-if="task.taskType === 'FERTIGATION'">
            <text class="info-label">计划用肥量</text>
            <text class="info-value">{{ task.planFertilizerUsage || 0 }} kg</text>
          </view>
          <view class="info-item" v-if="task.taskType === 'FERTIGATION'">
            <text class="info-label">目标EC值</text>
            <text class="info-value">{{ task.targetEc || '-' }} ms/cm</text>
          </view>
          <view class="info-item" v-if="task.taskType === 'FERTIGATION'">
            <text class="info-label">目标pH值</text>
            <text class="info-value">{{ task.targetPh || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">计划开始</text>
            <text class="info-value">{{ formatTime(task.planStartTime) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">计划结束</text>
            <text class="info-value">{{ formatTime(task.planEndTime) }}</text>
          </view>
          <view class="info-item" v-if="task.actualStartTime">
            <text class="info-label">实际开始</text>
            <text class="info-value">{{ formatTime(task.actualStartTime) }}</text>
          </view>
          <view class="info-item" v-if="task.actualEndTime">
            <text class="info-label">实际结束</text>
            <text class="info-value">{{ formatTime(task.actualEndTime) }}</text>
          </view>
          <view class="info-item" v-if="task.actualDuration">
            <text class="info-label">实际耗时</text>
            <text class="info-value">{{ task.actualDuration }} 分钟</text>
          </view>
        </view>
      </view>

      <view class="info-section" v-if="deviceList && deviceList.length > 0">
        <view class="section-title">设备列表</view>
        <view class="device-list">
          <view class="device-item" v-for="device in deviceList" :key="device.code">
            <text class="device-icon">🔧</text>
            <view class="device-info">
              <text class="device-name">{{ device.name }}</text>
              <text class="device-code">{{ device.code }}</text>
            </view>
            <text class="device-status" :class="'status-' + device.status">
              {{ getDeviceStatusText(device.status) }}
            </text>
          </view>
        </view>
      </view>

      <view class="info-section" v-if="executionRecords && executionRecords.length > 0">
        <view class="section-title">执行记录</view>
        <view class="timeline">
          <view class="timeline-item" v-for="(record, index) in executionRecords" :key="record.id">
            <view class="timeline-dot" :class="{ active: index === 0 }"></view>
            <view class="timeline-line" v-if="index < executionRecords.length - 1"></view>
            <view class="timeline-content">
              <view class="timeline-header">
                <text class="timeline-action">{{ record.action }}</text>
                <text class="timeline-time">{{ formatTime(record.time) }}</text>
              </view>
              <text class="timeline-operator" v-if="record.operator">操作人：{{ record.operator }}</text>
              <text class="timeline-remark" v-if="record.remark">{{ record.remark }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="action-section">
        <view class="action-row" v-if="task.status === 0">
          <button class="action-btn primary" @click="startTask">开始执行</button>
          <button class="action-btn danger" @click="cancelTask">取消任务</button>
        </view>
        <view class="action-row" v-if="task.status === 1">
          <button class="action-btn success" @click="executeDevice">设备执行</button>
          <button class="action-btn primary" @click="completeTask">完成任务</button>
          <button class="action-btn danger" @click="cancelTask">取消任务</button>
        </view>
        <view class="action-row" v-if="task.status === 2 || task.status === 3 || task.status === 4">
          <button class="action-btn default" @click="viewLogs">关联日志</button>
        </view>
      </view>
    </view>

    <view class="loading" v-if="loading">
      <u-loading-icon mode="flower" size="48"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>

    <view class="popup-mask" v-if="showCompletePopup" @click="showCompletePopup = false">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">完成任务</text>
          <text class="popup-close" @click="showCompletePopup = false">✕</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">实际耗时（分钟）</text>
            <input class="form-input" type="number" v-model="completeForm.actualDuration" placeholder="请输入实际耗时" />
          </view>
          <view class="form-item">
            <text class="form-label">实际用水量（L）</text>
            <input class="form-input" type="digit" v-model="completeForm.actualWaterUsage" placeholder="请输入实际用水量" />
          </view>
          <view class="form-item" v-if="task?.taskType === 'FERTIGATION'">
            <text class="form-label">实际用肥量（kg）</text>
            <input class="form-input" type="digit" v-model="completeForm.actualFertilizerUsage" placeholder="请输入实际用肥量" />
          </view>
          <view class="form-item">
            <text class="form-label">完成备注</text>
            <textarea class="form-textarea" v-model="completeForm.remark" placeholder="请输入完成备注"></textarea>
          </view>
        </view>
        <view class="popup-footer">
          <button class="popup-btn cancel" @click="showCompletePopup = false">取消</button>
          <button class="popup-btn confirm" @click="submitComplete">提交</button>
        </view>
      </view>
    </view>

    <view class="popup-mask" v-if="showCancelPopup" @click="showCancelPopup = false">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">取消任务</text>
          <text class="popup-close" @click="showCancelPopup = false">✕</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">取消原因</text>
            <textarea class="form-textarea" v-model="cancelReason" placeholder="请输入取消原因"></textarea>
          </view>
        </view>
        <view class="popup-footer">
          <button class="popup-btn cancel" @click="showCancelPopup = false">取消</button>
          <button class="popup-btn confirm" @click="submitCancel">确认取消</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api'
import { 
  irrigationTaskStatusMap, 
  irrigationTaskTypeMap, 
  irrigationTriggerSourceMap,
  deviceStatusMap
} from '@/config'

export default {
  data() {
    return {
      taskId: null,
      task: null,
      loading: true,
      deviceList: [],
      executionRecords: [],
      showCompletePopup: false,
      showCancelPopup: false,
      cancelReason: '',
      completeForm: {
        actualDuration: '',
        actualWaterUsage: '',
        actualFertilizerUsage: '',
        remark: ''
      }
    }
  },
  onLoad(options) {
    this.taskId = options.id
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        this.task = await api.getIrrigationTask(this.taskId)
        this.loadMockData()
      } catch (e) {
        console.error(e)
        this.loadMockData()
      } finally {
        this.loading = false
      }
    },
    loadMockData() {
      this.task = {
        id: this.taskId,
        taskName: 'A区早间水肥灌溉',
        taskCode: 'IRR20260605001',
        taskType: 'FERTIGATION',
        status: 1,
        triggerSource: 'AUTO_TIMED',
        area: 'A区',
        executor: '张三',
        planDuration: 30,
        planWaterUsage: 180,
        planFertilizerUsage: 3.6,
        targetEc: 1.8,
        targetPh: 6.5,
        planStartTime: new Date(Date.now() - 1800000).toISOString(),
        planEndTime: new Date(Date.now() + 1620000).toISOString(),
        actualStartTime: new Date(Date.now() - 1800000).toISOString(),
        actualDuration: 15
      }
      this.deviceList = [
        { code: 'VALVE_A01', name: 'A区进水阀', status: 2 },
        { code: 'PUMP_W01', name: '主水泵', status: 2 },
        { code: 'MIXER_01', name: '肥液混合器', status: 1 },
        { code: 'SENSOR_EC01', name: 'EC传感器', status: 1 }
      ]
      this.executionRecords = [
        { id: 1, action: '任务开始执行', time: new Date(Date.now() - 1800000).toISOString(), operator: '张三', remark: '按照计划开始水肥灌溉' },
        { id: 2, action: '设备启动', time: new Date(Date.now() - 1700000).toISOString(), operator: '系统', remark: '主水泵、进水阀已启动' },
        { id: 3, action: '肥液混合', time: new Date(Date.now() - 1200000).toISOString(), operator: '系统', remark: '肥液混合器启动，EC值1.75ms/cm' },
        { id: 4, action: '灌溉进行中', time: new Date(Date.now() - 600000).toISOString(), operator: '系统', remark: '已灌溉10分钟，用水量65L' }
      ]
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
    getDeviceStatusText(status) {
      return deviceStatusMap[status]?.text || '未知'
    },
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    startTask() {
      uni.showModal({
        title: '确认开始',
        content: '确定要开始执行此灌溉任务吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.startIrrigationTask(this.taskId, 'mobile_user')
              uni.showToast({ title: '已开始执行', icon: 'success' })
              this.loadData()
            } catch (e) {
              uni.showToast({ title: '操作失败', icon: 'none' })
            }
          }
        }
      })
    },
    executeDevice() {
      uni.showModal({
        title: '设备执行',
        content: '确定要启动相关设备执行灌溉吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.executeIrrigationTask(this.taskId)
              uni.showToast({ title: '设备已启动', icon: 'success' })
              this.loadData()
            } catch (e) {
              uni.showToast({ title: '操作失败', icon: 'none' })
            }
          }
        }
      })
    },
    completeTask() {
      this.showCompletePopup = true
    },
    async submitComplete() {
      if (!this.completeForm.remark) {
        uni.showToast({ title: '请填写完成备注', icon: 'none' })
        return
      }
      try {
        const data = {
          actualDuration: Number(this.completeForm.actualDuration) || 0,
          actualWaterUsage: Number(this.completeForm.actualWaterUsage) || 0,
          actualFertilizerUsage: Number(this.completeForm.actualFertilizerUsage) || 0,
          remark: this.completeForm.remark
        }
        await api.completeIrrigationTask(this.taskId, data)
        uni.showToast({ title: '任务已完成', icon: 'success' })
        this.showCompletePopup = false
        this.loadData()
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },
    cancelTask() {
      this.showCancelPopup = true
    },
    async submitCancel() {
      if (!this.cancelReason) {
        uni.showToast({ title: '请填写取消原因', icon: 'none' })
        return
      }
      try {
        await api.cancelIrrigationTask(this.taskId, 'mobile_user', this.cancelReason)
        uni.showToast({ title: '任务已取消', icon: 'success' })
        this.showCancelPopup = false
        this.loadData()
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },
    viewLogs() {
      uni.navigateTo({
        url: `/pages/log/log?taskId=${this.taskId}`
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

.task-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  
  .task-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 24rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .task-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    
    .task-title-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      
      .task-name {
        font-size: 34rpx;
        color: #333;
        font-weight: bold;
      }
      
      .status-tag {
        align-self: flex-start;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        font-size: 24rpx;
      }
    }
  }
}

.info-section {
  margin-bottom: 24rpx;
  
  .section-title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 16rpx;
    padding-left: 12rpx;
    border-left: 4rpx solid #1890ff;
  }
}

.info-list {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 16rpx;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    
    &:not(:last-child) {
      border-bottom: 1rpx solid #f0f0f0;
    }
    
    .info-label {
      font-size: 26rpx;
      color: #999;
    }
    
    .info-value {
      font-size: 26rpx;
      color: #333;
      max-width: 60%;
      text-align: right;
    }
  }
}

.device-list {
  .device-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .device-icon {
      font-size: 28rpx;
      margin-right: 16rpx;
    }
    
    .device-info {
      flex: 1;
      
      .device-name {
        font-size: 28rpx;
        color: #333;
        display: block;
        margin-bottom: 4rpx;
      }
      
      .device-code {
        font-size: 22rpx;
        color: #999;
      }
    }
    
    .device-status {
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      font-size: 22rpx;
      
      &.status-0 { background: #f5f5f5; color: #999; }
      &.status-1 { background: #f6ffed; color: #52c41a; }
      &.status-2 { background: #e6f7ff; color: #1890ff; }
      &.status-3 { background: #fff1f0; color: #ff4d4f; }
    }
  }
}

.timeline {
  padding-left: 20rpx;
  
  .timeline-item {
    position: relative;
    padding-left: 40rpx;
    padding-bottom: 24rpx;
    
    &:last-child {
      padding-bottom: 0;
      
      .timeline-line {
        display: none;
      }
    }
    
    .timeline-dot {
      position: absolute;
      left: 0;
      top: 8rpx;
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      background: #d9d9d9;
      
      &.active {
        background: #1890ff;
        box-shadow: 0 0 0 6rpx rgba(24, 144, 255, 0.2);
      }
    }
    
    .timeline-line {
      position: absolute;
      left: 7rpx;
      top: 28rpx;
      width: 2rpx;
      height: calc(100% - 20rpx);
      background: #f0f0f0;
    }
    
    .timeline-content {
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8rpx;
        
        .timeline-action {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
        }
        
        .timeline-time {
          font-size: 22rpx;
          color: #999;
        }
      }
      
      .timeline-operator {
        font-size: 22rpx;
        color: #666;
        display: block;
        margin-bottom: 4rpx;
      }
      
      .timeline-remark {
        font-size: 22rpx;
        color: #999;
        line-height: 1.5;
      }
    }
  }
}

.action-section {
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
  
  .action-row {
    display: flex;
    gap: 16rpx;
    
    .action-btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      border: none;
      
      &.primary {
        background: #1890ff;
        color: #fff;
      }
      
      &.success {
        background: #52c41a;
        color: #fff;
      }
      
      &.danger {
        background: #ff4d4f;
        color: #fff;
      }
      
      &.default {
        background: #f0f0f0;
        color: #333;
      }
    }
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .loading-text {
    margin-top: 24rpx;
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
    width: 600rpx;
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    
    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
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
      padding: 24rpx;
      
      .form-item {
        margin-bottom: 24rpx;
        
        .form-label {
          display: block;
          font-size: 26rpx;
          color: #666;
          margin-bottom: 12rpx;
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
        
        .form-textarea {
          width: 100%;
          height: 160rpx;
          padding: 16rpx;
          border: 1rpx solid #e0e0e0;
          border-radius: 8rpx;
          font-size: 28rpx;
          box-sizing: border-box;
        }
      }
    }
    
    .popup-footer {
      display: flex;
      border-top: 1rpx solid #f0f0f0;
      
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
          background: #1890ff;
          color: #fff;
        }
      }
    }
  }
}
</style>
