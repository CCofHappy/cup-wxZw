var app = getApp()
Page({
  data: {},
  outLoginClick: function(){
    wx.removeStorageSync('customerInfo');
    app.showToastMsg(0,'退出成功')
    setTimeout(function () {
      wx.switchTab({
        url: '/pages/mine/mine'
      })
    }, 1000)  
  },
  //呼叫客服
  callService: function () {
      wx.makePhoneCall({
          phoneNumber: app.globalData.kfPhone
      })
  },
})