var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.globalData.imagePath,
        imgList: [],
        formValue:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
    },
    onShow: function () {
        var that = this
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
    },

    //提交申请认证资料
    formSubmit: function (e) {
        var that = this;
        var formId = e.detail.formId;
        var openid = wx.getStorageSync("openId");
        var data = e.detail.value;
        if (!data.trueName) {
            app.showToastMsg(-1, '请填写真实姓名')
            return
        }
        if (!that.data.imgList.length) {
            app.showToastMsg(-1, '请上传照片')
            return
        }
        if (that.data.imgList.length<2) {
            app.showToastMsg(-1, '请再上传1张')
            return
        }
        var data = {
            apiname: 'bbs/post/insertV',
            uid: that.data.customerInfo.customerSeq,
            name: data.trueName,
            frontUrl: that.data.imgList[0],
            backUrl: that.data.imgList[1],
            sendMssageOpenId: wx.getStorageSync("openId"),
            sendMessageFormId: formId
        }
        request.getData(data, function (res) {
            if(res.data.state){
                that.setData({
                    imgList: [],
                    formValue:''
                })
                wx.showModal({
                    title: '资料提交成功',
                    content: '您提交的资料需系统管理员审核',
                    confirmText: '关闭',
                    confirmColor: '#A72125',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateBack({
                                url: '/pages/mine/mine'
                            })
                        } 
                    }
                })
            }
        }, that, 'post')
    },
    //上传图片
    uploadImg: function () {
        var that = this
        var count = 2 - that.data.imgList.length
        wx.chooseImage({
            count: count, // 一次选择数量
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                var lock = 1;
                that.setData({
                    showLoading: true,
                })
                for (var i = 0; i < tempFilePaths.length; i++) {
                    wx.uploadFile({
                        url: app.globalData.apiPath + '/common/attachment/upload',
                        filePath: tempFilePaths[i],
                        name: 'myfile',
                        success: function (res) {
                            if (res.statusCode == 200) {
                                var resData = JSON.parse(res.data);
                                var imgList = that.data.imgList;
                                imgList.push(resData.data);
                                that.setData({
                                    imgList: imgList
                                })
                            } else {
                                app.showToastMsg(-1, '图片获取失败')
                            }
                        },
                        fail: function () {
                            app.showToastMsg(-1, '上传失败')
                        },
                        complete: function () {
                            if (lock == tempFilePaths.length) {
                                that.setData({
                                    showLoading: false,
                                })
                            }
                            lock++
                        }
                    })
                }
            }
        })
    },
    //删除图片
    deleteBtn: function (e) {
        var that = this;
        wx.showModal({
            content: '确定要删除图片吗？',
            confirmText: '确定',
            cancelText: '取消',
            success: function (res) {
                if (res.confirm) {
                    var imgList = that.data.imgList;
                    var num = parseInt(e.currentTarget.id);
                    imgList.splice(num, 1);
                    that.setData({
                        imgList: imgList,
                    })
                } else if (res.cancel) { }
            }
        })
    },
})