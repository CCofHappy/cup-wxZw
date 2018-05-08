// mine-order-cancel.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({

    data: {
        customerInfo: {},
        orderList: [],
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
            orderList: {},
            hasMore: true,
            showLoading: true,
            start: 1,//从第几页开始
            count: 10, //一页展示多少行
            nullTip: {
                tipText: '数据加载中...'
            }
        })
        that.initData()
    },

    initData: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.hasMore) {
            var params = {
                apiname: 'person/getTreaty',
                customerSeq: that.data.customerInfo.customerSeq,
                states: that.data.orderState,
                page: that.data.start,
                rows: that.data.count
            }
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var data = res.data.data;
                    for (var i = 0; i < data.dataList.length; i++) {
                        for (var k = 0; k < data.dataList[i].lists.length; k++) {
                            data.dataList[i].lists[k].createTime = util.toDate(data.dataList[i].lists[k].createTime, 2)
                        }
                    }
                    that.setData({
                        orderList: data.dataList,
                        nullTip: {
                            tipText: '没有相关订单哦'
                        },
                        showLoading: false
                    });
                } else {
                    that.setData({
                        nullTip: {
                            tipText: '数据加载失败'
                        },
                        showLoading: false
                    })
                }
            }, that)
        }
    },

    appealSend:function(e){
        var that = this;
        var params = {
            apiname: 'person/insertOrderExplain',
            customerSeq: that.data.customerInfo.customerSeq,
            auctionSessionSeq: e.currentTarget.dataset.sessionSeq,
        }
        request.getData(params, function (res) {
           if(res.data.state==1){
               app.showToastMsg(0,"申诉成功")
               that.onPullDownRefresh();
           } else{
               app.showToastMsg(-1, res.data.message) 
           }
        }, that)
    }
})