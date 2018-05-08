// mine-weibi.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    weibiType: 0,
    weibiCount: 0,
    weibiList: {},
    customerInfo:{},
    hasMore: true,
    showLoading: true,
    start: 1,//从第几页开始
    count: 10, //一页展示多少行
    nullTip: {
      tipText: '数据加载中...',
    }
  },
  onShow: function () {
    var that = this;
    //更新数据
    that.setData({
      customerInfo: wx.getStorageSync('customerInfo')
    })
    that.initData();  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (!that.data.showLoading) {
      that.initData()
    }
  },

  initData: function () {
    //初始化页面
    var that = this;
    message.hide.call(that);
    if (that.data.hasMore) {
      var params = {
        apiname: 'person/myWallet/',
        customerSeq: that.data.customerInfo.customerSeq,
        page: that.data.start,
        rows: that.data.count
      }
      request.getData(params, function (res) {
        var data = res.data.data;
        if (res.data.state == 1) {
          for (var i = 0; i < data.wbHistory.dataList.length; i++) {
            data.wbHistory.dataList[i].createTime = util.toDate(data.wbHistory.dataList[i].createTime, 1)
          }
          if (that.data.start == 1) {//只有初始化时时 需要重置
            that.setData({
              weibiCount: data.weibiCount,
              weibiList: data.wbHistory.dataList,
              nullTip: {
                tipText: '暂无相关数据'
              },
              showLoading: false
            });
          }
          if (data.wbHistory.dataList.length === 0) {
            that.setData({
              hasMore: false,
            })
          } else {
            if (data.wbHistory.dataList.length < params.rows) {
              that.setData({
                hasMore: false
              })
            }
            if (that.data.start != 1) {
              that.setData({
                weibiList: that.data.weibiList.concat(data.wbHistory.dataList)
              })
            }
            that.setData({
              //每次查询之后 将页码+1
              start: that.data.start + 1,
              showLoading: false
            })
          }
        } else {
          that.setData({
            nullTip: {
              tipText: '数据加载失败...'
            }
          });
        }
      }, that)
    }
  },

  weibiList: function(){
    this.setData({
      weibiType:0,
    })
  },
  weibiText: function(){
    this.setData({
      weibiType:1,
    })
  }
})