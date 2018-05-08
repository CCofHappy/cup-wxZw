var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
    data: {
        userList: {},
        customerInfo: {},
        imgUrl: app.globalData.imagePath,
    },
    onLoad: function (options) {
        var that = this;
        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
    },
    onShow: function () {
        var that = this;
        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
        that.initData();
    },

    initData: function () {
        //初始化页面
        var that = this
        message.hide.call(that)
        var data = {
            apiname: 'person/queryCustomerInfo/' + that.data.customerInfo.customerSeq,
        }
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                var data = res.data.data;
                that.setData({
                    userList: data,
                })
            } else {
                app.showToastMsg(-1, res.data.message)
            }
        }, that, 'get')
    },

    //修改性别
    changeSex: function () {
        var that = this;
        wx.showActionSheet({
            itemList: ['男', '女'],
            success: function (res) {
                console.log(res.tapIndex)
                var data = { sex: 1, sextxt: '男' };
                if (res.tapIndex == 1) {
                    data = { sex: 0, sextxt: '女' }
                }
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
                            that.initData();
                        } else {
                            app.showToastMsg(-1, res.data.message)
                        }
                    }
                })
            }
        })
    },

    //上传头像
    uploadHead: function () {
        var that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                wx.uploadFile({
                    url: app.globalData.apiPath + '/common/attachment/upload',
                    filePath: tempFilePaths[0],
                    name: 'myfile',
                    success: function (res) {
                        if (res.statusCode == 200) {
                            var resData = JSON.parse(res.data);
                            var data = {
                                apiname: 'person/updateCustomerInfo',
                                customerSeq: that.data.customerInfo.customerSeq,
                                imgUrl: resData.data
                            }
                            request.getData(data, function (sRes) {
                                if (sRes.data.state == 1) {
                                    that.data.userList.headerPic = data.imgUrl;
                                    that.setData({
                                        userList: that.data.userList
                                    })
                                    app.showToastMsg(0, '头像修改成功')
                                } else {
                                    app.showToastMsg(-1, '头像修改失败')
                                }
                            }, that)
                        } else {
                            app.showToastMsg(-1, '头像上传失败')
                        }
                    },
                    fail: function () {
                        app.showToastMsg(-1, '头像上传失败')
                    }
                })
            }
        })
    }
})