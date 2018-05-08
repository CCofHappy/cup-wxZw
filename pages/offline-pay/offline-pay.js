var app = getApp()
Page({
  data: {
      imgUrl: app.globalData.imagePath,
  },
  //呼叫客服
  callService: function () {
      wx.makePhoneCall({
          phoneNumber: app.globalData.kfPhone
      })
  }
})