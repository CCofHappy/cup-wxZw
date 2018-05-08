// mine-finance.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
  data: {
    customerInfo: {},
    financeList: [],
    checkTime: "",
    hasMore: true,
    showLoading: true,
    month: "",
    start: 1,//从第几页开始
    count: 10, //一页展示多少行
    nullTip: {
      tipText: '数据加载中...'
    }
  },
  onLoad: function (options) {
    this.setData({
      customerInfo: wx.getStorageSync('customerInfo')
    })
    if (!this.data.customerInfo.customerSeq) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  onShow:function(){
    var time = new Date();
    var nowTime = time.valueOf();
    this.setData({
      customerInfo: wx.getStorageSync('customerInfo'),
      checkTime: nowTime,
      nullTip: {
        tipText: '数据加载中...'
      },
      hasMore: true,
    })
    this.initData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    that.setData({
      hasMore: true,
      showLoading: true,
      start: 1,//从第几页开始
      count: 10, //一页展示多少行
      nullTip: {
        tipText: '数据加载中...'
      }
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
    var date = new Date(that.data.checkTime);
    var month = date.getMonth() + 1;
    if (month < 10) {month = "0" + parseInt(month);}
    that.setData({
      month: month
    })
    if (!that.data.customerInfo.customerSeq){
      that.setData({
        nullTip: {
          tipText: '数据加载失败',
        },
        showLoading: false,
        hasMore:false
      });
      return;  
    }
    if (that.data.hasMore) {
      var params = {
        apiname: 'person/getFinancialDes',
        customerSeq: that.data.customerInfo.customerSeq,
        createTime: that.data.checkTime,
        page: that.data.start,
        rows: that.data.count
      }
      request.getData(params, function (res) {
        if (res.data.state == 1) {
          var data = res.data.data;
          for (var i = 0; i < data.dataList.length; i++) {
            data.dataList[i].dayTime = util.toDate(data.dataList[i].createTime, 3)
            data.dataList[i].hourTime = util.toDate(data.dataList[i].createTime, 4)
          }
          if (that.data.start == 1) {//只有初始化时时 需要重置
            that.setData({
              financeList: data.dataList,
              nullTip: {
                tipText: '没有相关数据'
              },
              showLoading: false
            });
          }
          if (data.dataList.length == 0) {
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
                financeList: that.data.financeList.concat(data.dataList),
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
              tipText: '数据加载失败',
            },
            showLoading: false
          })
        }
      }, that)
    }
  },

  openDate: function(){
    var that = this;
    var date = new Date();
    var year = date.getFullYear(), month = date.getMonth() + 1;
    var dateList = [];
    var dateArr = {};
    for (var i = 0; i < 5; i++) {
      dateList[i] = year + ' 年 ' + month + ' 月 ';
      dateArr[i] = { month: month, year: year };
      month = month - 1;
      if (month == 0) {
        year = year - 1;
        month = 12;
      }  
    } 
    wx.showActionSheet({
      itemList: [dateList[0], dateList[1], dateList[2], dateList[3], dateList[4]],
      success: function (res) {
        var date = dateArr[res.tapIndex];
        if (!date) return;
        if (date.month < 10) { date.month = "0" + parseInt(date.month); }
        var stringTime = date.year + "/" + date.month + "/01 00:00:00";
        var createTime = new Date(stringTime).getTime();
        that.setData({
          month: date.month,
          financeList: [],
          checkTime: createTime,
          hasMore: true,
          showLoading: true,
          start: 1,//从第几页开始
          count: 10, //一页展示多少行
          nullTip: {
            tipText: '数据加载中...'
          }
        })
        that.initData();
      },
      fail: function (res) {}
    })
  }
})