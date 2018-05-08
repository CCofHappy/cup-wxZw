var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
  data: {
  
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    //更新数据
    that.setData({
      customerInfo: wx.getStorageSync('customerInfo')
    })
    this.initData()
  },

  initData: function () {
    //初始化页面
    var that = this;
    message.hide.call(that)
    var data = {
      apiname: 'person/homepage/' + that.data.customerInfo.customerSeq,
    }
    request.getData(data, function (res) {
      var data = res.data.data;
      that.setData({
        userList: data[0]
      })
    }, that, 'get')
  }
  
})