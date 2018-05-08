var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')

Page({
  data: {
    customerInfo: {},
    batchDetail: {},
    showLoading: true,
    nullTip: {
      tipText: '数据加载中...'
    },
  },
  onLoad: function (options) {
    //更新数据
    this.setData({
      batch: options.batch
    })
  },

  onShow: function () {
    //更新数据
    this.setData({
      customerInfo: wx.getStorageSync('customerInfo'),
    })
    this.initData()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      showLoading: true,
      nullTip: {
        tipText: '数据加载中...'
      }
    })
    this.initData();
  },

  initData: function () {
    //初始化页面
    var that = this;
    message.hide.call(that);
    if (!that.data.customerInfo.customerSeq) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return;
    }
    var params = {
      apiname: 'person/queryBatchStatus',
      customerSeq: that.data.customerInfo.customerSeq,
      batch: that.data.batch,
    }
    request.getData(params, function (res) {
      if (res.data.state == 1) {
        var data = res.data.data;
        data.sendTime = util.toDate(data.sendTime, 1)
        for (var i = 0; i < data.stateList.length; i++) {
          data.stateList[i].auditTime = util.toDate(data.stateList[i].auditTime, 1)
        }
        that.setData({
          showLoading: false,
          batchDetail: data,
        })
      } else {
        that.setData({
          nullTip: {
            tipText: '数据加载失败'
          },
        })
      }
    }, that)
  },

})
