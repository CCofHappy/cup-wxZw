// home-auction.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
  data: {
    tab:0,
    customerInfo: {},
    auctionList: [],
    hasMore: true,
    showLoading: true,
    history: false,
    start: 1,//从第几页开始
    count: 10, //一页展示多少行
    nullTip: {
      tipText: '数据加载中...',
    }
  },
  onLoad: function (options) {
    var that = this
    //记录url传值
    that.setData({
      tab: options.tab
    })
    that.initData();
  },

  onShow: function(){
    //更新数据
    this.setData({
      customerInfo: wx.getStorageSync('customerInfo')
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    that.setData({
      auctionList: {},
      hasMore: true,
      showLoading: true,
      start: 1,//从第几页开始
      count: 10, //一页展示多少行
      nullTip: {
        tipText: '数据加载中...',
      }
    })
    that.initData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (!that.data.showLoading) {
      that.initData();
    }
  },

  initData: function () {
    //初始化页面
    var that = this;
    message.hide.call(that);
    var title = "";
    var params = {
      apiname: 'homepage/getAreaAuction',
      page: that.data.start,
      rows: that.data.count
    }
    switch (parseInt(that.data.tab)) {
      case 1:
        title = '每日一拍';
        params.auctionSessionType = "1";
        break;
      case 2:
        title = '推荐收藏';
        params.apiname = "homepage/getChoiceAndCollection";
        params.type = "1";
        break;
      case 3:
        title = '饮用精选';
        params.apiname = "homepage/getChoiceAndCollection";
        params.type = "2";
        break;
      case 4:
        title = '价格封顶区';
        params.auctionSessionType = "4";
        break;
      case 5:
        title = '历史拍品';
        params.apiname = "auction/getMoreHisAuction";
        that.setData({
          history:true, 
        })
        break;
    }
    wx.setNavigationBarTitle({
      title: title
    })

    if (that.data.hasMore) {
      request.getData(params, function (res) {
        if(res.data.state ==1){
          var data = res.data.data
          for (var i = 0; i < data.dataList.length; i++) {
            data.dataList[i].startTime = util.toDate(data.dataList[i].startTime, 2)
            data.dataList[i].endTime = util.toDate(data.dataList[i].endTime, 2)
          }
          if (that.data.start == 1) {//只有初始化时时 需要重置
            that.setData({
              auctionList: data.dataList,
            });
          }
          if (data.dataList.length === 0) {
            that.setData({
              hasMore: false,
            })
          } else {
            if (data.dataList.length < params.rows) {
              that.setData({
                hasMore: false
              })
            }
            if (that.data.start != 1) {
              that.setData({
                auctionList: that.data.auctionList.concat(data.dataList),
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
})
