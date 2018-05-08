var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
    data: {
        imgUrl: app.globalData.imagePath,
        imgList: [],
        agree: true,
        customerInfo: {},
        auctionGoodsDesc: "",
        auctionGoodsName: "",
        lowestPrice: "",
        priceStep: 0,
        startingPrice: "",
        btnDisabled: "",
    },

    onShow: function () {
        var that = this;
        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
    },

    //提交送拍
    formSubmit: function (e) {
        var that = this;
        var formId = e.detail.formId;
        var openid = wx.getStorageSync("openId");
        if (!app.checkLogin()) return;//校验登录

        if (!that.data.agree) {
            wx.showModal({
                content: '请阅读并同意《委托拍卖合同》和《送拍声明书》',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                    } else if (res.cancel) {
                    }
                }
            })
            return;
        }
        if (!that.data.imgList.length) {
            app.showToastMsg(-1, '请上传图片')
            return
        }
        var value = e.detail.value;
        if (value.lowestPrice && value.auctionGoodsName) {
            var data = value;
            var imgs = '';
            for (var i = 0; i < that.data.imgList.length; i++) {
                if (i === 0) {
                    imgs += that.data.imgList[i];
                } else {
                    imgs += ',' + that.data.imgList[i];
                }
            }
            data.apiname = 'person/addAuctionSend';
            data.auctionIcon = imgs;
            data.customerSeq = that.data.customerInfo.customerSeq;
            data.sendMssageOpenId = openid;
            data.sendMessageFormId = formId;
            that.setData({
                btnDisabled: "disabled",
            })
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    wx.showModal({
                        title: res.data.message,
                        content: '是否继续发布拍品？',
                        confirmText: '继续',
                        cancelText: '否',
                        success: function (res) {
                            that.setData({
                                imgList: [],
                                auctionGoodsDesc: "",
                                auctionGoodsName: "",
                                lowestPrice: "",
                                priceStep: "",
                                startingPrice: "",
                                btnDisabled: "",
                            })
                            if (res.confirm) {

                            } else if (res.cancel) {
                                wx.navigateTo({
                                    url: '/pages/mine-send/mine-send',
                                })
                            }
                        }
                    })
                } else {
                    app.showToastMsg(-1, res.data.message)
                    that.setData({
                        btnDisabled: "",
                    })
                }
            }, that)
        } else {
            app.showToastMsg(-1, '请先填写信息')
        }
    },

    //上传图片
    uploadImg: function () {
        var that = this;
        if (!app.checkLogin()) return;//校验登录
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
                            //do something
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
                    }
                })
            }
        })
    },

    //是否同意
    checkboxChange: function (e) {
        var that = this;
        if (e.detail.value.length) {
            that.setData({
                agree: true,
                btnDisabled: false,
            })
        } else {
            that.setData({
                agree: false,
                btnDisabled: true,
            })
        }
    },

    //预览图片
    lookPic: function (e) {
        var count = e.target.id
        wx.previewImage({
            current: this.data.imgList[count], // 当前显示图片的http链接
            urls: this.data.imgList // 需要预览的图片http链接列表
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

    //输入起拍价决定起拍价
    startInput: function (e) {
        var value = parseFloat(e.detail.value);
        var step = 0;
        if (0 < value && value < 501) {
            step = 20;
        } else if (500 < value && value < 1001) {
            step = 50;
        } else if (1000 < value && value < 3001) {
            step = 100;
        } else if (3000 < value && value < 10001) {
            step = 200;
        } else if (10000 < value && value < 30001) {
            step = 500;
        } else if (30000 < value && value < 100001) {
            step = 1000;
        } else if (100000 < value && value < 200001) {
            step = 2000;
        } else if (200000 < value && value < 300001) {
            step = 3000;
        } else if (300000 < value) {
            step = 5000;
        } else {
            step = 0;
        }
        this.setData({
            priceStep: step,
        })
    }
})