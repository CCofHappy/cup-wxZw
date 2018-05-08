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
            nickValue: options.value,
        })
    },
    formSubmit: function (e) {
        var that = this;
        var data = e.detail.value;
        if (data.customerName.length<3){
            app.showToastMsg(-1, '昵称不能少于3个字');
            return;
        }
        if (app.checkStrCn(data.customerName)) {
            data.customerSeq = that.data.customerInfo.customerSeq;
            wx.request({
                url: app.globalData.apiPath + '/person/updateCustomerInfo',
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
            app.showToastMsg(-1, '输入的昵称不符合要求')
        }
    },
})