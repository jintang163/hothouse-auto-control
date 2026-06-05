<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
    this.checkUpdate()
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    checkUpdate() {
      // #ifdef MP-WEIXIN
      const updateManager = uni.getUpdateManager()
      updateManager.onUpdateReady(() => {
        uni.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success(res) {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })
      // #endif
    }
  }
}
</script>

<style lang="scss">
@import 'uview-plus/index.scss';

page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  padding: 24rpx;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
}
</style>
