// pages/comment-publish/comment-publish.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.globalData.imagePath,
        imgList: [],
        fontCount: 0,
        value1: 0,
        value2: 0,
        value3: 0,
        value4: 0,
        wineDetail:"",
        aroma: "",
        mouthFeel: "",
        rhyme: "",
        degree: "",
        content: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {// 读取草稿
        if (options.id) {
            var that = this;
            var params = {
                apiname: '/bbs/post/assess/queryPostDraftById/' + options.id,
            }
            that.setData({
                draftId: options.id
            })
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var data = res.data.data.post_json;
                    that.setData({
                        value1: data.aromaNumber,
                        value2: data.mouthFeelNumber,
                        value3: data.rhymeNumber,
                        value4: data.degreeNumber,
                        wineDetail: {
                            brand: data.brand,
                            name: data.title,
                            strength: data.strength,
                            productId: data.productId,
                            image: data.productImg,
                        },
                        aroma: data.aroma,
                        mouthFeel: data.mouthFeel,
                        rhyme: data.rhyme,
                        degree: data.degree,
                        content: data.content,
                        imgList: data.postImg,
                    })
                } else {
                    app.showToastMsg(-1, res.data.message)
                }
            });
        }
    },

    onShow: function (options) {
        if (wx.getStorageSync('wineDetail')) {
            this.setData({
                wineDetail: wx.getStorageSync('wineDetail')
            })
        }
        wx.removeStorageSync('wineDetail')
    },

    //上传图片
    uploadImg: function () {
        var that = this;
        var count = 6 - that.data.imgList.length;
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

    fontCount: function (e) {
        this.setData({
            fontCount: e.detail.value.length
        })
    },

    sliderChange:function(e){
        var that = this;
        var index = parseInt(e.target.dataset.index);
        switch (index){
            case 1:
                that.setData({
                    value1: e.detail.value,
                })
            break;
            case 2:
                that.setData({
                    value2: e.detail.value,
                })
                break;
            case 3:
                that.setData({
                    value3: e.detail.value,
                })
                break;
            case 4:
                that.setData({
                    value4: e.detail.value,
                })
                break;
        }
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

    formSubmit: function (e) {
        var formVal = e.detail.value;
        if (e.detail.target.dataset.type == 'send') {
            this.sendFrom(formVal);
        } else {
            this.saveDraft(formVal)
        }
    },

    //发布提交
    sendFrom:function(e){
        var that = this;
        var formData = e;
        if (!that.data.wineDetail.name) {
            app.showToastMsg(-1, '请选择酒款')
            return;
        }
        if (!formData.aroma || !formData.mouthFeel || !formData.rhyme || !formData.degree || !formData.content ) {
            app.showToastMsg(-1, '请完善信息')
            return;
        }
        if (!that.data.imgList.length) {
            app.showToastMsg(-1, '请上传图片')
            return;
        }
        
        var ortherData = {
            apiname: 'bbs/post/assess/insertPost' ,
            uid: wx.getStorageSync('customerInfo').customerSeq,
            postImg: that.data.imgList,
            aromaNumber: that.data.value1,
            mouthFeelNumber: that.data.value2,
            rhymeNumber: that.data.value3,
            degreeNumber: that.data.value4,
            name: that.data.wineDetail.name ? that.data.wineDetail.name : '',
            brand: that.data.wineDetail.brand,
            strength: that.data.wineDetail.strength,
            productId: that.data.wineDetail.productId ? that.data.wineDetail.productId:'',
        }
        var data = Object.assign(formData, ortherData);
        data.draftId = that.data.draftId || "";
        that.setData({
            btnDisabled: "disabled",
        })
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                wx.showModal({
                    content: "发布成功",
                    confirmText: '确定',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '/pages/mine-post/mine-post?type=3',
                            })
                        } else if (res.cancel) {
                        }
                    }
                })
            } else {
                app.showToastMsg(-2, res.data.message)     
            }
            that.setData({
                btnDisabled: "",
            })
        }, that)
    },

    //保存草稿
    saveDraft: function (formVal) {
        var that = this;
        var data = {
            apiname: 'bbs/post/assess/insertPostDraft',
            type: 2,
            uid: wx.getStorageSync('customerInfo').customerSeq,
            title: that.data.wineDetail.name ? that.data.wineDetail.name : '',
            content: formVal.content,
            postImg: that.data.imgList,
            aroma: formVal.aroma,
            aromaNumber: that.data.value1,
            mouthFeel: formVal.mouthFeel,
            mouthFeelNumber: that.data.value2,
            rhyme: formVal.rhyme,
            rhymeNumber: that.data.value3,
            degree: formVal.degree,
            degreeNumber: that.data.value4,
            brand: that.data.wineDetail.brand ? that.data.wineDetail.brand : '',
            strength: that.data.wineDetail.strength ? that.data.wineDetail.strength : '',
            productImg: that.data.wineDetail.image ? that.data.wineDetail.image : '',
            productId: that.data.wineDetail.productId ? that.data.wineDetail.productId:'',
            draftId: that.data.draftId || "",
        }
        if (data.title && data.brand){
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0, '保存成功')
                } else {
                    app.showToastMsg(-2, res.data.message)
                }
            }, that)
        }else{
            app.showToastMsg(-1, '请选择一个酒款')
        }  
    }


})