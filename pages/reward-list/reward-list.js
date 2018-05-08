// pages/reward-list/reward-list.js
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
        pid:"",
        type: "",
        name: "",
        head: "",
        uCount: 0,
        amountAll: 0,
        giveRewardOpen: false,
        giveRewardOpen: false,
        payAfter: false,
        payAfterPrice: 0,
        showLoading: true,
        nullTip: {
            tipText: '数据加载中...'
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            uid: options.uid,
            pid: options.pid,
            type: options.type,
            name: options.name,
            head: options.head,
            customerInfo: wx.getStorageSync('customerInfo'),
        })
        this.initData();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            showLoading: true,
            nullTip: {
                tipText: '数据加载中...'
            }
        })
        this.initData();
    },

    initData: function () {
        //初始化页面
        var that = this;
        var type = that.data.type;
        message.hide.call(that);
        var params = {
            apiname: 'bbs/post/assess/queryPostReward',
            pid: that.data.pid,
            type: that.data.type,
        }

        request.getData(params, function (res) {
            if(res.data.state==1){
                that.setData({
                    rewardList: res.data.data,
                    showLoading: false,
                })
                var data = res.data.data;
                if (data.length==0){
                    that.setData({
                        nullTip: {
                            tipText: '暂无人打赏'
                        }
                    })
                }else{
                    var amountAll = 0;
                    for (var i = 0; i < data.length; i++){
                        amountAll += data[i].amountAll;
                    }
                    that.setData({
                        uCount: data.length,
                        amountAll: amountAll,
                    })
                }
            } else {
                that.setData({
                    nullTip: {
                        tipText: '数据加载失败...'
                    },
                    showLoading: false,
                });
            }
        }, that)
    },

    openGiveReward: function () {
        if (!app.checkLogin()) return;//校验登录
        this.setData({
            giveRewardOpen: true,
        })
    },
})