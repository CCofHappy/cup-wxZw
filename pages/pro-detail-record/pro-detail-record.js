// pages/pro-detail-record/pro-detail-record.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        recordRecord: "", 
        showLoading: true,
        id: "",
        nullTip: {
            tipText: '数据加载中...'
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            id: options.id,
        })
        that.initData();
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
        var type = that.data.type;
        message.hide.call(that);
        var params = {
            apiname: 'person/auctionRecordDetail',
            customerSeq: that.data.customerInfo.customerSeq,
            auctionGoodsSeq: that.data.id,
        }

        request.getData(params, function (res) {
            if (res.data.state == 1) {
                var record = res.data.data.Record
                for (var i = 0; i < record.length; i++) {
                    record[i].createTime = util.toDate(record[i].createTime, 1).split(" ");
                }
                that.setData({
                    showLoading: false,
                    recordRecord: record,
                    nullTip: {
                        tipText: '暂无人参与叫价'
                    }
                })
            } else {
                app.showToastMsg(-1, res.data.message)
            }
        }, that)
    },
})