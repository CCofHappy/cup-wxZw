var app = getApp()
Page({
    data: {},
    onLoad: function (options) {
        var that = this;
        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            nickValue: options.value,
        })
    },
    formSubmit: function (e) {
        var that = this;
        var data = e.detail.value;
        if (data.autograph) {
            data.uid = that.data.customerInfo.customerSeq;
            wx.request({
                url: app.globalData.apiPath + '/bbs/post/updateCustomer',
                method: 'post',
                data: data,
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    if (res.data.state == 1) {
                        app.showToastMsg(0, '修改成功')
                        setTimeout(function () {
                            wx.navigateBack({
                                delta: 1
                            })
                        }, 2000)
                    } else {
                        app.showToastMsg(-1, res.data.message)
                    }
                }
            })
        } else {
            app.showToastMsg(-1, '请输入签名')
        }
    },
})