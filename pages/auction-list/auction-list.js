// auction-list.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    /**
     * 页面的初始数据
     */
    data: {
        auctionSessionList: [],
        hasMore: true,
        showLoading: true,
        start: 1,//从第几页开始
        count: 20, //一页展示多少行
        typ: '',
        nullTip: {
            tipText: '数据加载中...',
            actionText: '返回首页',
            routeUrl: '/pages/index/index'
        },
        listTime: [],
        listCount: [],
        setIntervalTime: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var _this = this
        var typ = parseInt(options.type)
        _this.setData({
            typ: typ,
        })
        var name = ""
        switch (typ) {
            case 3:
                name = "拍卖专区"
                break
            case 4:
                name = "历史专区"
                break
        }
        wx.setNavigationBarTitle({
            title: name
        })
    },

    onShow: function () {
        //更新数据
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            hasMore: true,
            start: 1,//从第几页开始
        })
        this.initData();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var _this = this;
        _this.setData({
            auctionSessionList: [],
            hasMore: true,
            showLoading: true,
            start: 1,//从第几页开始
            count: 20, //一页展示多少行
            nullTip: {
                tipText: '数据加载中...',
            }
        })
        _this.initData()
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var _this = this;
        if (!_this.data.showLoading) {
            _this.initData()
        }
    },

    initData: function (page, rows) {
        //初始化页面
        var that = this
        message.hide.call(that)
        if (that.data.hasMore){
            var data = {
                apiname: 'auction/sessionInfoPage',
                page: page ? page : that.data.start,
                rows: rows ? rows : that.data.count,
                state: [4],
            }
            if (that.data.typ == 3) {
                data.state = [2, 3];
            }
            request.getData(data, function (res) {
                var metaData = res.data.data.dataList;
                var timeArr = that.data.listTime;
                var countArr = that.data.listCount;
                if (res.data.state == 1) {
                    var serverTime = util.getServerTime();//获取服务器时间
                    for (var i = 0; i < metaData.length; i++) {
                        var countTime = 0;//根据拍品倒计时剩余时间
                        if (metaData[i].state == 2) {
                            countTime = metaData[i].auctionSessionStart - serverTime
                        } else if (metaData[i].state == 3) {
                            countTime = metaData[i].auctionSessionEnd - serverTime
                        }
                        countArr[i] = countTime;
                        timeArr[i] = util.countDown(countArr[i]);
                        that.setData({
                            listTime: timeArr,
                            listCount: countArr
                        })
                    }
                    //清除之前的倒计时
                    if (that.data.setIntervalTime) {
                        clearInterval(that.data.setIntervalTime);
                    }
                    //执行倒计时
                    var setIntervalTime = setInterval(function () {
                        for (var i = 0; i < that.data.listCount.length; i++) {
                            countArr[i] = that.data.listCount[i] - 1000;
                            timeArr[i] = util.countDown(countArr[i]);
                        }
                        that.setData({
                            listTime: timeArr,
                            listCount: countArr
                        })
                    }, 1000)
                    //记录倒计时编号
                    that.setData({
                        setIntervalTime: setIntervalTime
                    })

                    if (that.data.start == 1) {//只有初始化时时 需要重置
                        that.setData({
                            auctionSessionList: metaData,
                            nullTip: {
                                tipText: '没有相关拍场哦'
                            }
                        });
                    }
                    if (metaData.length === 0) {
                        setTimeout(function () {
                            that.setData({
                                hasMore: false,
                                showLoading: false
                            })
                        }, 200)
                    } else {
                        if (metaData.length < data.rows) {
                            that.setData({
                                hasMore: false
                            })
                        }
                        if (that.data.start != 1) {
                            that.setData({
                                auctionSessionList: that.data.auctionSessionList.concat(metaData),
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            start: that.data.start + 1,
                            showLoading: false
                        })
                    }
                } else {
                    that.setData({
                        nullTip: {
                            tipText: '数据加载失败'
                        }
                    })
                }
            }, that)
        }
        

    },

})