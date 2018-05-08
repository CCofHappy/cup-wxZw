// address-list.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
    data: {
        customerInfo: {},
        addressList: {},
        nullTip: {
            tipText: '数据加载中...',
        }
    },
    onLoad: function (options) {
        var that = this;
        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
        })
    },
    onShow: function () {
        this.initData();
    },

    initData: function () {
        //初始化页面
        var that = this
        message.hide.call(that)
        var data = {
            apiname: 'person/customerSeqADD/' + that.data.customerInfo.customerSeq,
        }
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                var data = res.data.data;
                for (var i = 0; i < data.length; i++) {
                    var len = data[i].phone.length;
                    data[i].phone = data[i].phone.substring(0, 3) + " **** " + data[i].phone.substring(len - 4, len);
                }
                if (data.length == 0) {
                    that.setData({
                        nullTip: {
                            tipText: '您还没有设置收货地址'
                        }
                    })
                }
                that.setData({
                    addressList: data
                })
            }
        }, that)
    },

    radioChange: function (e) {
        var that = this;
        var data = {
            apiname: 'person/editDeliveryAddr',
            customerSeq: that.data.customerInfo.customerSeq,
            deliveryAddrSeq: e.detail.value,
            flag: 1
        };
        request.getData(data, function (res) {
            var data = res.data;
            if (data.state == 1) {
                app.showToastMsg(0, '设置成功')
                that.initData();
            }
        }, that)
    },

    deleteAddress: function (e) {
        var that = this;
        wx.showModal({
            content: '确定要删除该地址？',
            success: function (res) {
                if (res.confirm) {
                    var data = {
                        apiname: 'person/delDeliveryAddr/' + e.target.id + '/' + that.data.customerInfo.customerSeq
                    };
                    request.getData(data, function (res) {
                        var data = res.data;
                        if (data.state == 1) {
                            app.showToastMsg(0, '删除成功')
                            that.initData();
                        }
                    }, that)
                } else if (res.cancel) {
                }
            }
        })
    }
})