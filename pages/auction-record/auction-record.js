// auction-record.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        customerInfo: {},
        recordDetail: {},
        recordRecord: {},
        showLoading: true,
        imgUrl: app.globalData.imagePath,
        id: "",
        type: "",
        nullTip: {
            tipText: '数据加载中...'
        }
    },
    onLoad: function (options) {
        var that = this
        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            sendSeq: options.sendSeq,
            id: options.id,
            type: options.type,
        })

        if (options.type == 1) {
            wx.setNavigationBarTitle({
                title: "竞拍详情"
            })
        } else {
            wx.setNavigationBarTitle({
                title: "叫价记录"
            })
        }
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
            apiname: 'person/getSendDeils',
            customerSeq: that.data.customerInfo.customerSeq,
            auctionGoodsSeq: that.data.id,
        }
        if (type == 1) {
            params.apiname = "person/auctionRecordDetail"
        }

        request.getData(params, function (res) {
            if (res.data.state == 1) {
                var recordDetail = res.data.data.wishList;
                if (type == 1) {
                    recordDetail = res.data.data.wishList[0]
                }
                recordDetail.showTime = util.toDate(recordDetail.showTime, 1)
                recordDetail.startTime = util.toDate(recordDetail.startTime, 1)
                recordDetail.endTime = util.toDate(recordDetail.endTime, 1)
                for (var i = 0; i < res.data.data.Record.length; i++) {
                    res.data.data.Record[i].createTime = util.toDate(res.data.data.Record[i].createTime, 1);
                }
                that.setData({
                    showLoading: false,
                    recordDetail: recordDetail,
                    recordRecord: res.data.data.Record,
                    nullTip: {
                        tipText: '没有相关数据'
                    }
                })
            } else {
                app.showToastMsg(-1, res.data.message)
            }
        }, that)
    },
})