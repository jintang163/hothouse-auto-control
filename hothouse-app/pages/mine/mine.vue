<template>
  <view class="page">
    <view class="header">
      <view class="user-info">
        <view class="avatar">
          <text class="avatar-text">{{ userInfo.nickname ? userInfo.nickname.charAt(0) : '用' }}</text>
        </view>
        <view class="user-detail">
          <text class="nickname">{{ userInfo.nickname || '智慧大棚用户' }}</text>
          <text class="user-role">
            {{ getRoleText(userInfo.role) }}
            <text class="user-id">ID: {{ userInfo.id || '88888' }}</text>
          </text>
        </view>
      </view>
      <view class="settings-btn" @click="goToSettings">
        <text>⚙️</text>
      </view>
    </view>

    <view class="stats-card">
      <view class="stats-item" @click="goToPage('/pages/inspect/inspect')">
        <text class="stats-num">12</text>
        <text class="stats-label">今日巡检</text>
      </view>
      <view class="stats-item" @click="goToPage('/pages/alarm/alarm')">
        <text class="stats-num alarm">3</text>
        <text class="stats-label">待处理告警</text>
      </view>
      <view class="stats-item" @click="goToPage('/pages/device/device')">
        <text class="stats-num">21</text>
        <text class="stats-label">设备总数</text>
      </view>
      <view class="stats-item">
        <text class="stats-num">98.5%</text>
        <text class="stats-label">在线率</text>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-title">业务功能</view>
      <view class="menu-list">
        <view class="menu-item" @click="goToPage('/pages/history/history')">
          <view class="menu-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
            <text>📊</text>
          </view>
          <text class="menu-text">历史数据</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToPage('/pages/inspect/inspect')">
          <view class="menu-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
            <text>📋</text>
          </view>
          <text class="menu-text">巡检记录</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToPage('/pages/device/device')">
          <view class="menu-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
            <text>🔧</text>
          </view>
          <text class="menu-text">设备管理</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToPage('/pages/alarm/alarm')">
          <view class="menu-icon" style="background: linear-gradient(135deg, #fa709a, #fee140);">
            <text>🚨</text>
          </view>
          <text class="menu-text">告警中心</text>
          <view class="menu-badge" v-if="alarmCount > 0">{{ alarmCount }}</view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-title">系统设置</view>
      <view class="menu-list">
        <view class="menu-item" @click="showModeSetting = true">
          <view class="menu-icon" style="background: linear-gradient(135deg, #a8edea, #fed6e3);">
            <text>🎮</text>
          </view>
          <text class="menu-text">控制模式</text>
          <text class="menu-value">{{ getModeText(currentMode) }}</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="showNotificationSetting = true">
          <view class="menu-icon" style="background: linear-gradient(135deg, #d299c2, #fef9d7);">
            <text>🔔</text>
          </view>
          <text class="menu-text">消息通知</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="showGreenhouseSetting = true">
          <view class="menu-icon" style="background: linear-gradient(135deg, #89f7fe, #66a6ff);">
            <text>🏠</text>
          </view>
          <text class="menu-text">默认大棚</text>
          <text class="menu-value">{{ currentGreenhouse.name }}</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="clearCache">
          <view class="menu-icon" style="background: linear-gradient(135deg, #fddb92, #d1fdff);">
            <text>🗑️</text>
          </view>
          <text class="menu-text">清除缓存</text>
          <text class="menu-value">{{ cacheSize }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-title">其他</view>
      <view class="menu-list">
        <view class="menu-item" @click="showAbout = true">
          <view class="menu-icon" style="background: linear-gradient(135deg, #c1dfc4, #deecdd);">
            <text>ℹ️</text>
          </view>
          <text class="menu-text">关于我们</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="showHelp = true">
          <view class="menu-icon" style="background: linear-gradient(135deg, #e0c3fc, #8ec5fc);">
            <text>❓</text>
          </view>
          <text class="menu-text">帮助中心</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="feedback">
          <view class="menu-icon" style="background: linear-gradient(135deg, #fff1eb, #ace0f9);">
            <text>💬</text>
          </view>
          <text class="menu-text">意见反馈</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item logout" @click="logout">
          <view class="menu-icon" style="background: linear-gradient(135deg, #ff9a9e, #fecfef);">
            <text>🚪</text>
          </view>
          <text class="menu-text">退出登录</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="version">
      <text>智慧大棚 v1.0.0</text>
    </view>

    <view class="modal" v-if="showModeSetting" @click.self="showModeSetting = false">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">控制模式设置</text>
          <text class="modal-close" @click="showModeSetting = false">×</text>
        </view>
        <view class="modal-body">
          <view class="mode-list">
            <view 
              class="mode-item" 
              :class="{ active: currentMode === 0 }"
              @click="selectMode(0)"
            >
              <view class="mode-icon">👆</view>
              <view class="mode-info">
                <text class="mode-name">手动模式</text>
                <text class="mode-desc">完全由人工控制设备开关</text>
              </view>
              <view class="mode-check" v-if="currentMode === 0">✓</view>
            </view>
            <view 
              class="mode-item" 
              :class="{ active: currentMode === 1 }"
              @click="selectMode(1)"
            >
              <view class="mode-icon">🤖</view>
              <view class="mode-info">
                <text class="mode-name">自动模式</text>
                <text class="mode-desc">系统根据策略自动调节设备</text>
              </view>
              <view class="mode-check" v-if="currentMode === 1">✓</view>
            </view>
            <view 
              class="mode-item" 
              :class="{ active: currentMode === 2 }"
              @click="selectMode(2)"
            >
              <view class="mode-icon">⏰</view>
              <view class="mode-info">
                <text class="mode-name">定时模式</text>
                <text class="mode-desc">按照预设时间表控制设备</text>
              </view>
              <view class="mode-check" v-if="currentMode === 2">✓</view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showModeSetting = false">取消</view>
          <view class="modal-btn confirm" @click="saveMode">确认</view>
        </view>
      </view>
    </view>

    <view class="modal" v-if="showGreenhouseSetting" @click.self="showGreenhouseSetting = false">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">选择默认大棚</text>
          <text class="modal-close" @click="showGreenhouseSetting = false">×</text>
        </view>
        <view class="modal-body">
          <view 
            class="gh-item" 
            v-for="gh in greenhouseList" 
            :key="gh.id"
            :class="{ active: currentGreenhouse.id === gh.id }"
            @click="selectGreenhouse(gh)"
          >
            <view class="gh-info">
              <text class="gh-name">{{ gh.name }}</text>
              <text class="gh-code">{{ gh.code }}</text>
            </view>
            <view class="gh-check" v-if="currentGreenhouse.id === gh.id">✓</view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showGreenhouseSetting = false">取消</view>
          <view class="modal-btn confirm" @click="saveGreenhouse">确认</view>
        </view>
      </view>
    </view>

    <view class="modal" v-if="showNotificationSetting" @click.self="showNotificationSetting = false">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">消息通知设置</text>
          <text class="modal-close" @click="showNotificationSetting = false">×</text>
        </view>
        <view class="modal-body">
          <view class="setting-item">
            <view class="setting-info">
              <text class="setting-name">告警通知</text>
              <text class="setting-desc">接收设备告警推送</text>
            </view>
            <switch :checked="notifySettings.alarm" @change="e => notifySettings.alarm = e.detail.value" color="#1989fa" />
          </view>
          <view class="setting-item">
            <view class="setting-info">
              <text class="setting-name">设备异常通知</text>
              <text class="setting-desc">设备离线或故障时通知</text>
            </view>
            <switch :checked="notifySettings.device" @change="e => notifySettings.device = e.detail.value" color="#1989fa" />
          </view>
          <view class="setting-item">
            <view class="setting-info">
              <text class="setting-name">巡检提醒</text>
              <text class="setting-desc">待巡检任务提醒</text>
            </view>
            <switch :checked="notifySettings.inspect" @change="e => notifySettings.inspect = e.detail.value" color="#1989fa" />
          </view>
          <view class="setting-item">
            <view class="setting-info">
              <text class="setting-name">语音播报</text>
              <text class="setting-desc">告警时语音播报</text>
            </view>
            <switch :checked="notifySettings.voice" @change="e => notifySettings.voice = e.detail.value" color="#1989fa" />
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showNotificationSetting = false">取消</view>
          <view class="modal-btn confirm" @click="saveNotification">保存</view>
        </view>
      </view>
    </view>

    <view class="modal" v-if="showAbout" @click.self="showAbout = false">
      <view class="modal-content about">
        <view class="modal-header">
          <text class="modal-title">关于我们</text>
          <text class="modal-close" @click="showAbout = false">×</text>
        </view>
        <view class="modal-body">
          <view class="about-logo">
            <text class="logo-icon">🌱</text>
          </view>
          <text class="about-title">智慧大棚环控系统</text>
          <text class="about-version">Version 1.0.0</text>
          <view class="about-desc">
            <text>面向设施农业的智能环境控制系统，</text>
            <text>基于物联网技术实现温湿度自动调节，</text>
            <text>助力农业生产智能化、精细化。</text>
          </view>
          <view class="about-info">
            <view class="info-row">
              <text class="info-label">开发团队</text>
              <text class="info-value">IoT研发部</text>
            </view>
            <view class="info-row">
              <text class="info-label">联系电话</text>
              <text class="info-value">400-888-8888</text>
            </view>
            <view class="info-row">
              <text class="info-label">官方网站</text>
              <text class="info-value">www.hothouse-iot.com</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn confirm single" @click="showAbout = false">知道了</view>
        </view>
      </view>
    </view>

    <view class="modal" v-if="showHelp" @click.self="showHelp = false">
      <view class="modal-content help">
        <view class="modal-header">
          <text class="modal-title">帮助中心</text>
          <text class="modal-close" @click="showHelp = false">×</text>
        </view>
        <view class="modal-body">
          <view class="help-item" v-for="(item, idx) in helpList" :key="idx">
            <view class="help-question" @click="toggleHelp(idx)">
              <text class="q-icon">Q:</text>
              <text class="q-text">{{ item.question }}</text>
              <text class="q-arrow" :class="{ open: helpOpenIndex === idx }">›</text>
            </view>
            <view class="help-answer" v-if="helpOpenIndex === idx">
              <text class="a-icon">A:</text>
              <text class="a-text">{{ item.answer }}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn confirm single" @click="showHelp = false">关闭</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { greenhouseList } from '@/config'

export default {
  data() {
    return {
      userInfo: {
        id: '88888',
        nickname: '管理员',
        role: 1,
        phone: '138****8888'
      },
      alarmCount: 3,
      cacheSize: '12.5MB',
      currentMode: 1,
      tempMode: 1,
      greenhouseList,
      currentGreenhouse: greenhouseList[0],
      tempGreenhouse: greenhouseList[0],
      notifySettings: {
        alarm: true,
        device: true,
        inspect: true,
        voice: false
      },
      showModeSetting: false,
      showGreenhouseSetting: false,
      showNotificationSetting: false,
      showAbout: false,
      showHelp: false,
      helpOpenIndex: -1,
      helpList: [
        {
          question: '如何切换控制模式？',
          answer: '在"我的"页面点击"控制模式"，可以选择手动、自动或定时模式。自动模式下系统会根据预设策略自动控制设备。'
        },
        {
          question: '设备离线了怎么办？',
          answer: '首先检查设备电源和网络连接，然后尝试重启设备。如果问题持续，请联系技术支持。'
        },
        {
          question: '告警通知如何开启？',
          answer: '在"我的-消息通知"中开启告警通知，系统会在设备异常时推送消息给您。'
        },
        {
          question: '如何查看历史数据？',
          answer: '点击首页的"历史数据"或在"我的-业务功能"中进入历史数据页面，可以查看温度、湿度、光照的历史曲线。'
        },
        {
          question: '巡检记录如何提交？',
          answer: '在"巡检记录"页面点击待巡检项，填写巡检结果后提交即可。发现异常时请详细描述问题。'
        }
      ]
    }
  },
  methods: {
    getRoleText(role) {
      const roles = { 1: '系统管理员', 2: '运维工程师', 3: '农户', 4: '访客' }
      return roles[role] || '未知角色'
    },
    getModeText(mode) {
      const modes = { 0: '手动', 1: '自动', 2: '定时' }
      return modes[mode] || '未知'
    },
    goToPage(url) {
      uni.navigateTo({ url })
    },
    goToSettings() {
      uni.showToast({ title: '设置功能开发中', icon: 'none' })
    },
    selectMode(mode) {
      this.tempMode = mode
    },
    saveMode() {
      this.currentMode = this.tempMode
      uni.setStorageSync('controlMode', this.currentMode)
      this.showModeSetting = false
      uni.showToast({ title: '模式已切换', icon: 'success' })
    },
    selectGreenhouse(gh) {
      this.tempGreenhouse = gh
    },
    saveGreenhouse() {
      this.currentGreenhouse = this.tempGreenhouse
      uni.setStorageSync('defaultGreenhouse', this.currentGreenhouse.id)
      this.showGreenhouseSetting = false
      uni.showToast({ title: '设置成功', icon: 'success' })
    },
    saveNotification() {
      uni.setStorageSync('notifySettings', this.notifySettings)
      this.showNotificationSetting = false
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    toggleHelp(idx) {
      this.helpOpenIndex = this.helpOpenIndex === idx ? -1 : idx
    },
    clearCache() {
      uni.showModal({
        title: '清除缓存',
        content: '确定要清除本地缓存吗？',
        success: (res) => {
          if (res.confirm) {
            this.cacheSize = '0KB'
            uni.showToast({ title: '缓存已清除', icon: 'success' })
          }
        }
      })
    },
    feedback() {
      uni.showModal({
        title: '意见反馈',
        content: '请通过以下方式反馈：\n电话：400-888-8888\n邮箱：support@hothouse-iot.com',
        showCancel: false
      })
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token')
            uni.showToast({ title: '已退出', icon: 'success' })
          }
        }
      })
    }
  },
  onLoad() {
    const mode = uni.getStorageSync('controlMode')
    if (mode !== '') this.currentMode = mode
    const ghId = uni.getStorageSync('defaultGreenhouse')
    if (ghId) {
      const gh = this.greenhouseList.find(g => g.id === ghId)
      if (gh) this.currentGreenhouse = gh
    }
    const settings = uni.getStorageSync('notifySettings')
    if (settings) this.notifySettings = { ...this.notifySettings, ...settings }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 32rpx 60rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 24rpx;
    
    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 4rpx solid rgba(255,255,255,0.5);
      
      .avatar-text {
        font-size: 48rpx;
        color: #fff;
        font-weight: bold;
      }
    }
    
    .user-detail {
      .nickname {
        display: block;
        font-size: 36rpx;
        color: #fff;
        font-weight: bold;
        margin-bottom: 8rpx;
      }
      
      .user-role {
        font-size: 26rpx;
        color: rgba(255,255,255,0.85);
        
        .user-id {
          margin-left: 16rpx;
          opacity: 0.8;
        }
      }
    }
  }
  
  .settings-btn {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
  }
}

.stats-card {
  display: flex;
  background: #fff;
  margin: -30rpx 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 24rpx 0;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
  
  .stats-item {
    flex: 1;
    text-align: center;
    
    .stats-num {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
      
      &.alarm {
        color: #ff4d4f;
      }
    }
    
    .stats-label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.menu-group {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
  
  .menu-title {
    font-size: 28rpx;
    color: #999;
    padding: 20rpx 24rpx 12rpx;
  }
  
  .menu-list {
    .menu-item {
      display: flex;
      align-items: center;
      padding: 28rpx 24rpx;
      border-top: 1rpx solid #f5f5f5;
      
      .menu-icon {
        width: 72rpx;
        height: 72rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        margin-right: 20rpx;
      }
      
      .menu-text {
        flex: 1;
        font-size: 30rpx;
        color: #333;
      }
      
      .menu-value {
        font-size: 26rpx;
        color: #999;
        margin-right: 12rpx;
      }
      
      .menu-badge {
        background: #ff4d4f;
        color: #fff;
        font-size: 20rpx;
        padding: 2rpx 12rpx;
        border-radius: 20rpx;
        margin-right: 12rpx;
      }
      
      .menu-arrow {
        font-size: 32rpx;
        color: #ccc;
      }
      
      &.logout {
        .menu-text {
          color: #ff4d4f;
        }
      }
    }
  }
}

.version {
  text-align: center;
  font-size: 24rpx;
  color: #ccc;
  padding: 20rpx 0;
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
        
        &.single {
          border-right: none;
        }
      }
    }
  }
}

.mode-list {
  .mode-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border: 2rpx solid #f0f0f0;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
    
    &.active {
      border-color: #1989fa;
      background: #f0f7ff;
    }
    
    .mode-icon {
      font-size: 48rpx;
      margin-right: 20rpx;
    }
    
    .mode-info {
      flex: 1;
      
      .mode-name {
        display: block;
        font-size: 30rpx;
        color: #333;
        font-weight: bold;
        margin-bottom: 4rpx;
      }
      
      .mode-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .mode-check {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background: #1989fa;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
    }
  }
}

.gh-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  
  &.active {
    border-color: #1989fa;
    background: #f0f7ff;
  }
  
  .gh-info {
    .gh-name {
      display: block;
      font-size: 30rpx;
      color: #333;
      font-weight: bold;
      margin-bottom: 4rpx;
    }
    
    .gh-code {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .gh-check {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: #1989fa;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  .setting-info {
    .setting-name {
      display: block;
      font-size: 30rpx;
      color: #333;
      margin-bottom: 4rpx;
    }
    
    .setting-desc {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.about {
  .about-logo {
    text-align: center;
    padding: 20rpx 0;
    
    .logo-icon {
      font-size: 80rpx;
    }
  }
  
  .about-title {
    display: block;
    text-align: center;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .about-version {
    display: block;
    text-align: center;
    font-size: 26rpx;
    color: #999;
    margin-bottom: 24rpx;
  }
  
  .about-desc {
    background: #fafafa;
    border-radius: 12rpx;
    padding: 20rpx;
    margin-bottom: 24rpx;
    
    text {
      display: block;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .about-info {
    .info-row {
      display: flex;
      padding: 12rpx 0;
      
      .info-label {
        width: 120rpx;
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
}

.help {
  .help-item {
    margin-bottom: 16rpx;
    
    .help-question {
      display: flex;
      align-items: center;
      padding: 20rpx;
      background: #fafafa;
      border-radius: 12rpx;
      
      .q-icon {
        color: #1989fa;
        font-weight: bold;
        margin-right: 12rpx;
        font-size: 28rpx;
      }
      
      .q-text {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
      
      .q-arrow {
        font-size: 32rpx;
        color: #999;
        transition: transform 0.3s;
        
        &.open {
          transform: rotate(90deg);
        }
      }
    }
    
    .help-answer {
      display: flex;
      padding: 20rpx;
      background: #f0f7ff;
      border-radius: 0 0 12rpx 12rpx;
      margin-top: -8rpx;
      
      .a-icon {
        color: #52c41a;
        font-weight: bold;
        margin-right: 12rpx;
        font-size: 28rpx;
        flex-shrink: 0;
      }
      
      .a-text {
        flex: 1;
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}
</style>
