// order-submit-list.js
Page({
  data: {
    itemList:{}
  },
  onLoad: function (options) {
    this.setData({
      itemList: wx.getStorageSync('orderSubmitList')
    })
  },

})