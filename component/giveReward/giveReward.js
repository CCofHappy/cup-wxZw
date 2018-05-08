// component/giveReward/giveReward.js
var app = getApp();
var util = require('../../utils/util');
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        giveRewardOpen: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
            }
        },
        payAfter: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
            }
        },
        payAfterPrice: {
            type: Number,
            value: 0,
            observer: function (newVal, oldVal) {
            }
        },
        pid: {
            type: Number,
            value: "",
            observer: function (newVal, oldVal) {
                this.setData({
                    pid: newVal,
                })
            }
        },
        type: {
            type: String,
            value: "1",
            observer: function (newVal, oldVal) {
                this.setData({
                    type: newVal,
                })
            }
        },
        name: {
            type: String,
            value: 0,
            observer: function (newVal, oldVal) {
            }
        },
        headImg: {
            type: String,
            value: 0,
            observer: function (newVal, oldVal) {
            }
        },
        uCount: {
            type: String,
            value: 0,
            observer: function (newVal, oldVal) {
            }
        },
        amountAll: {
            type: String,
            value: 0,
            observer: function (newVal, oldVal) {
            }
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        imgUrl: app.globalData.imagePath,
        inputValue: "",
        buttonValue: "1",
        pid:"",
        type:"1",
    },

    /**
     * 组件的方法列表
     */

    methods: {
        changemoney:function(e){
            this.setData({
                buttonValue: e.currentTarget.dataset.money,
                inputValue: "",
            })
        },

        inputmoney:function(e){
            this.setData({
                inputValue: e.detail.value,
                buttonValue: "",
            })
        },

        giveReward: function (e) {
            var that = this;
            var pages = getCurrentPages();
            var page = pages[pages.length - 1];
            if (!that.data.inputValue && !that.data.buttonValue){
                app.showToastMsg(-1, '金额不能为空');
            } else {
                if (that.data.inputValue && that.data.inputValue==0){
                    app.showToastMsg(-1, '金额不能为0');
                    return;
                }
                var price = that.data.inputValue || that.data.buttonValue;
                wx.navigateTo({
                    url: '/pages/give-reward-pay/give-reward-pay?pid=' + that.data.pid + '&price=' + price + '&type=' + that.data.type, 
                    success: function(res) {},
                    fail: function(res) {},
                    complete: function(res) {},
                })
            }
        },

        closeReward: function(){
            var pages = getCurrentPages();
            var page = pages[pages.length - 1];
            this.setData({
                inputValue: "",
                buttonValue: "1",
            })
            page.setData({
                giveRewardOpen: false,
            })
        },

        closePayAfter:function() {
            var pages = getCurrentPages();
            var page = pages[pages.length - 1];
            page.setData({
                payAfter: false,
            })
        }
    },

})



