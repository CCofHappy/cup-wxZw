// pages/interflow-publish/interflow-publish.js
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
        btnDisabled: "",
        content:"",
        title:"",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 读取草稿
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
                        imgList: data.postImg,
                        content: data.content,
                        title: data.title,
                    })
                } else {
                    app.showToastMsg(-1, res.data.message)
                }
            });
        }
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

    sendFrom: function (e) {
        var that = this;
        var data = e
        if (!data.title || !data.content) {
            app.showToastMsg(-1, '请完善信息')
            return
        }
        data.postImg = that.data.imgList;
        data.apiname = 'bbs/post/assess/insertInterflowPost';
        data.uid = wx.getStorageSync('customerInfo').customerSeq;
        data.draftId = that.data.draftId||"";
        that.setData({
            btnDisabled: "disabled",
        })
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                that.setData({
                    imgList: [],
                    content: "",
                    title: "",
                });
                wx.showModal({
                    content: "发布成功",
                    confirmText: '确定',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '/pages/mine-post/mine-post?type=2',
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
            type: 3,
            uid: wx.getStorageSync('customerInfo').customerSeq,
            title: formVal.title,
            content: formVal.content,
            postImg: that.data.imgList,
            draftId : that.data.draftId || "",
        }
        if (data.title || data.content || data.postImg.length > 0) {
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0, '保存成功')
                } else {
                    app.showToastMsg(-2, res.data.message)
                }
            }, that)
        } else {
            app.showToastMsg(-1, '至少填选一个信息')
        }  
       
    }

})