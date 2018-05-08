var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
  data: {
    userInfo: {},
    collectionList: [],
    hasMore: true,
    showLoading: true,
    start: 1,//从第几页开始
    count: 10, //一页展示多少行
    nullTip: {
      tipText: '数据加载中...'
    }
  },
  onLoad: function (options) {
    var that = this
    //更新数据
    that.setData({
      customerInfo: wx.getStorageSync('customerInfo')
    })
    that.initData();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    that.setData({
      collectionList: {},
      hasMore: true,
      showLoading: true,
      start: 1,//从第几页开始
      count: 10, //一页展示多少行
      nullTip: {
        tipText: '数据加载中...'
      }
    })
    that.onLoad()
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
        apiname: 'person/queryFavorite',
        customerSeq: that.data.customerInfo.customerSeq,
        page: that.data.start,
        rows: that.data.count
      }
      request.getData(params, function (res) {
        var data = res.data.data;
        if (res.data.state == 1) {
          for (var i = 0; i < data.dataList.length; i++) {
            data.dataList[i].startTime = util.toDate(data.dataList[i].startTime, 2)
          }
          if (that.data.start == 1) {//只有初始化时时 需要重置
            that.setData({
              collectionList: data.dataList,
              nullTip: {
                tipText: '您还没有收藏拍品'
              },
              showLoading: false
            });
          }
          if (data.dataList.length === 0) {
            that.setData({
              hasMore: false
            })
          } else {
            if (data.dataList.length < params.rows) {
              that.setData({
                hasMore: false
              })
            }
            if (that.data.start != 1) {
              that.setData({
                collectionList: that.data.collectionList.concat(data.dataList)
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
  }
})