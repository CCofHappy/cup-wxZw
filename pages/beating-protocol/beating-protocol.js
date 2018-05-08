Page({
  data: {
    customerInfo:{},
  },
  onLoad: function (options) {
    this.setData({
      customerInfo: wx.getStorageSync('customerInfo')
    })
  },
})