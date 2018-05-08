var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
    data: {
        customerInfo: {},
    },
    onLoad: function (options) {
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
    },
    feedSubmit: function (e) {
        var content = e.detail.value.feedbackContent;
        var that = this
        if (content) {
            message.hide.call(that)
            var data = {
                apiname: 'person/saveFeed',
                customerSeq: that.data.customerInfo.customerSeq,
                feedbackContent: content
            }
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0, '感谢您的宝贵意见')
                    setTimeout(function () {
                        wx.navigateBack({
                            delta: 1
                        })
                    }, 2000)
                } else {
                    app.showToastMsg(-1, res.data.data);
                }
            }, that)
        } else {
            app.showToastMsg(-1, '请输入内容');
        }
    }
})