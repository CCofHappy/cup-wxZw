// component/auctionGoods/auctionGoods.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        auctionGoods: {
            type: Object,
            value: '',
            observer: function (newVal, oldVal) {
                if(newVal){
                    var pages = getCurrentPages();
                    var prePage = pages[pages.length - 1];
                    var serverTime = prePage.data.serverTime;//获取服务器时间 
                    var that = this, countTime = 0;
                    that.setData({
                        auctionList: newVal,
                        proUrl: "/pages/pro-detail/pro-detail?id=" + newVal.auctionGoodsSeq + "&sessionId=" + newVal.auctionSessionSeq,
                        mineUrl: "/pages/auction-record/auction-record?id=" + newVal.auctionGoodsSeq + "&type=1",
                        windowWidth: prePage.data.windowWidth ? prePage.data.windowWidth:0,
                    })
                    if (newVal.state > 3) return;
                    if (newVal.state == 2) {
                        countTime = newVal.startTime - serverTime;
                    } else if (newVal.state == 3) {
                        countTime = newVal.endTime - serverTime;
                    }

                    var countTimeArr = util.countDown(countTime);
                    that.setData({
                        countDownTime:
                        countTimeArr.day + "天" +
                        countTimeArr.hour + "时" +
                        countTimeArr.minute + "分" +
                        countTimeArr.second + "秒",
                    })
                    clearInterval(that.data.setIntervalTime);
                    var setIntervalTime = setInterval(function () {
                        countTime = countTime - 1000;
                        if (countTime < 0) {
                            that.setData({
                                countDownTime: "",
                            })
                            clearInterval(that.data.setIntervalTime);
                            if (!prePage.data.countDownStart) {
                                prePage.setData({
                                    countDownStart: true,
                                })
                                setTimeout(function () {
                                    prePage.onPullDownRefresh();
                                }, 3000)
                            }
                        } else {
                            countTimeArr = util.countDown(countTime)
                            that.setData({
                                countDownTime:
                                countTimeArr.day + "天" +
                                countTimeArr.hour + "时" +
                                countTimeArr.minute + "分" +
                                countTimeArr.second + "秒",
                            })
                        }
                    }, 1000)
                    that.setData({
                        setIntervalTime: setIntervalTime,
                    })
                }
            }
        },
        auctionType: {
            type: String,
            value: '',
            observer: function (newVal, oldVal) {
                this.setData({
                    auctionType :newVal
                })
            }
        },
        
    },

    /**
     * 组件的初始数据
     */
    data: {
        imgUrl: app.globalData.imagePath,
        countDownTime:'',
        auctionList:"",
        booked:false,
        bookedType:'',
        auctionGoodsUrl: "",
        bookedCount:1,
        setIntervalTime:"",
        privatelyPrice:0,
        navigatoLock:false,
        auctionType:'',
        windowWidth:0,
        delBtnWidth:210,

    },

    /**
     * 组件的方法列表
     */
    methods: {
        //预展期间报名
        getBond: function (e) {
            var that = this;
            var pages = getCurrentPages();
            var prePage = pages[pages.length - 1];
            var auctionList = that.data.auctionList;
            if (prePage.data.showLoading) return;
            prePage.setData({
                showLoading: true,
            })
            var loginCustseq = wx.getStorageSync('customerInfo').customerSeq;
            if (!app.checkLogin()) return;//校验登录
            var data = {
                apiname: 'auction/bondPayedOrNot',
                auctionGoodsSeq: auctionList.auctionGoodsSeq,
                auctionSessionSeq: auctionList.auctionSessionSeq,
                customerSeq: loginCustseq
            }
            request.getData(data, function (res) {
                if (res.data.state) {
                    app.showToastMsg(-1, '拍卖尚未开始')
                } else {
                    if (prePage.checkCustPro(auctionList.customerSeq)) return;
                    wx.navigateTo({
                        url: '/pages/pay-deposit/pay-deposit?id=' + data.auctionGoodsSeq + '&sessionId=' + data.auctionSessionSeq,
                    })
                }
            }, that)
        },

        //点击加一手按钮
        oneHandPrice: function (e) {
            var that = this;
            var pages = getCurrentPages();
            var prePage = pages[pages.length - 1];
            var auctionList = this.data.auctionList;
            if (prePage.checkCustPro(auctionList.senderSeq)) return;
            if (!prePage.data.oneHandPrice) return;
            if (!app.checkLogin(that.data.auctionList.customerSeq)) return;//校验登录
            var loginCustseq = wx.getStorageSync('customerInfo').customerSeq
            var data = {
                auctionGoodsSeq: auctionList.auctionGoodsSeq,
                auctionSessionSeq: auctionList.auctionSessionSeq,
                customerSeq: loginCustseq,
            }
            prePage.callPrice(data, 1);
            //限制一秒点一次
            prePage.setData({
                oneHandPrice: false,
                oneHandStep: auctionList.jiaJiaStep,
            })
            setTimeout(function () {
                prePage.setData({
                    oneHandPrice: true,
                })
            }, 1000)
        },

        //点击自由出价按钮
        freePrice: function (e) {
            var that = this;
            var auctionList = this.data.auctionList;
            var pages = getCurrentPages();
            var prePage = pages[pages.length - 1];
            if (prePage.checkCustPro(auctionList.senderSeq)) return;
            var data = {
                auctionGoodsSeq: auctionList.auctionGoodsSeq,
                auctionSessionSeq: auctionList.auctionSessionSeq,
                customerSeq: prePage.data.customerInfo.customerSeq,
            }
            if (!app.checkLogin(that.data.auctionList.customerSeq)) return;//校验登录
            prePage.callPrice(data, 2);
        },

        //我要私冾
        getOneClick: function (e) {
            var that = this;
            if (!app.checkLogin(that.data.auctionList.customerSeq)) return;//校验登录
            wx.showActionSheet({
                itemList: ['求购', '出售'],
                success: function (res) {
                    var auctionGoods = that.data.auctionGoods
                    var privatelyPrice = auctionGoods.state == 4 ? auctionGoods.currPrice : auctionGoods.referencePriceMin
                    that.setData({
                        bookedType: res.tapIndex+1,
                        privatelyPrice: privatelyPrice,
                    })
                },
                fail: function (res) {
                }
            })
        },

        //关闭求购、求售
        bookedCancel:function(){
            this.setData({
                bookedType: "",
                bookedCount: 1,
            })
        },

        countReduce:function(){
            var count = this.data.bookedCount;
            count = count>1?count-1:count;
            this.setData({
                bookedCount: count,
            })
        },

        countAdd: function () {
            var count = this.data.bookedCount+1;
            this.setData({
                bookedCount: count,
            })
        },

        //私冾提交
        bookedEnter: function () {
            var that = this;
            var pages = getCurrentPages();
            var prePage = pages[pages.length - 1];
            var auctionList = this.data.auctionList;
            var loginCustseq = wx.getStorageSync('customerInfo').customerSeq;
            if (!that.data.bookedCount){
                app.showToastMsg(-1, '数量不能为空');
                return;
            } else if (that.data.bookedCount == 0){
                app.showToastMsg(-1, '数量不能为0');
                return;
            }
            if (!that.data.privatelyPrice) {
                app.showToastMsg(-1, '出价不能为空');
                return;
            } else if (that.data.privatelyPrice == 0) {
                app.showToastMsg(-1, '出价不能为0');
                return;
            }
            var data = {
                apiname: 'auction/insertAuctionGoodsNegotiate', 
                auctionGoodsSeq: auctionList.auctionGoodsSeq,
                customerSeq: loginCustseq,
                number: that.data.bookedCount,
                price: that.data.privatelyPrice,
                type: that.data.bookedType-1
            }
            request.getData(data, function (res) {
                if (res.data.state==1) {
                    app.showToastMsg(0, '成功私冾')
                    var rows = prePage.data.start * prePage.data.count;
                    setTimeout(function () {
                        prePage.setData({
                            hasMore: true,
                        })
                        prePage.initData(1, rows);
                    }, 500)
                } else {
                    app.showToastMsg(-1, res.data.message)
                }
            }, that)
            this.setData({
                bookedType: "",
                bookedCount: 1,
            })
        },

        //修改求购、求售价格
        changePrice:function(e){
            this.setData({
                privatelyPrice: e.detail.value
            })
        },

        touchStart: function (e) {
            if (this.data.auctionType != 'mine' || this.data.auctionGoods.myPrice) return;
            if (e.touches.length == 1) {
                this.setData({
                    //记录触摸起始位置的X坐标
                    startX: e.touches[0].clientX
                });
            }
        },

        touchEnd: function (e) {
            var that = this
            if (that.data.auctionType != 'mine') return;
            if (e.changedTouches.length == 1) {
                var endX = e.changedTouches[0].clientX;
                var disX = that.data.startX - endX;
                var delBtnWidth = (that.data.delBtnWidth) * that.data.windowWidth / 750;
                var sliderOffset = disX > delBtnWidth / 2 ? delBtnWidth : "0";
                that.setData({
                    sliderOffset: -sliderOffset,
                })
            }
        },

        touchMove: function (e) {
            var that = this
            if (that.data.auctionType != 'mine')return;
            if (e.touches.length == 1) {
                var moveX = e.touches[0].clientX;
                var disX = that.data.startX - moveX;
                var delBtnWidth = (that.data.delBtnWidth) * that.data.windowWidth / 750;
                var sliderOffset = 0;
                if (disX == 0 || disX < 0) {
                    sliderOffset = 0;
                } else if (disX > 0) {
                    sliderOffset = disX ;
                    if (disX >= delBtnWidth) {
                        sliderOffset = delBtnWidth;
                    }
                }
                //更新列表的状态
                this.setData({
                    sliderOffset: -sliderOffset,
                });
            }
        },

        deleteAuction:function(){
            var that = this;
            var pages = getCurrentPages();
            var prePage = pages[pages.length - 1];
            var auctionList = that.data.auctionList;
            if (prePage.data.showLoading) return;
            var data = {
                apiname: 'person/delWishlist' ,
                wishListSeq: that.data.auctionGoods.wishListSeq
            }
            request.getData(data, function (res) {
                if (res.data.state) {
                    app.showToastMsg(-1, '删除成功')
                    prePage.onPullDownRefresh() 
                } else {
                    app.showToastMsg(0, res.data.message)
                }
            }, that)
        }
    }
})
