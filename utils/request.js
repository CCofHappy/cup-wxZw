var app = getApp()
var message = require('../component/message/message')
module.exports = {
    //获取数据
    getData: function (data, cb, that, method) {
        var pages = getCurrentPages();
        var prePage = pages[pages.length - 1];
        //请求方式默认为为POST，如果传入了请求方式参数，则按传入的方式请求
        wx.request({
            url: app.globalData.apiPath + '/' + data.apiname,
            data: data,
            method: method ? method : 'POST',
            header: {
                "content-type": "application/json",
                //公共参数
                "mode": app.globalData.telMode,
                "system": app.globalData.telSystem,
                "apiversion": app.globalData.version,
                "platform": 'miniwap',
                "etoken": wx.getStorageSync('customerInfo').etoken || '',
            },
            success: function (res) {
                prePage.setData({
                    loadError: false,
                })
                if (res.data.state == -1) {
                    wx.removeStorageSync('customerInfo');
                    app.showToastMsg(-1, "请先登录")
                    setTimeout(function () {
                        wx.navigateTo({
                            url: '/pages/login/login'
                        })
                    }, 500)
                } else {
                    cb(res)
                    wx.stopPullDownRefresh()
                //   typeof cb == 'function' && cb(res)
                }  
            },
            fail: function (e) {
                console.log("====天啦噜，request报异常了======"+e)
                prePage.setData({
                    nullTip: {
                        tipText: '数据加载失败，请检查您的网络'
                    },
                    showLoading: false,
                    loadError:true,
                })
                typeof fail_cb == 'function' && fail_cb()
            }
        })
    }
}