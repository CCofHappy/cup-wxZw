var app = getApp()
Page({
    data: {
        customerInfo: {},
    },
    onLoad: function (options) {
        var that = this;
        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            emailValue: options.value,
        })
    },
    formSubmit: function (e) {
        var that = this;
        var pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        if (pattern.test(e.detail.value.customerEmail)) {
            var data = e.detail.value;
            data.customerSeq = that.data.customerInfo.customerSeq;
            wx.request({
                url: app.globalData.apiPath + '/person/postBox',
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
            app.showToastMsg(-1, '邮箱格式不正确')
        }
    },
})