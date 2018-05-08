// cate-list.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
    data: {
        chanDi: "",
        cateList: {},
        hasMore: true,
        showLoading: true,
        start: 1,//从第几页开始
        count: 10, //一页展示多少行
        nullTip: {
            tipText: '数据加载中...'
        }
    },
    onLoad: function (options) {
        var that = this
        //更新数据
        that.setData({
            chanDi: options.id
        })
        that.initData();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var that = this
        that.setData({
            cateList: {},
            hasMore: true,
            showLoading: true,
            start: 1,//从第几页开始
            count: 10, //一页展示多少行
            nullTip: {
                tipText: '数据加载中...'
            }
        })
        that.initData()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (!that.data.showLoading) {
            that.initData()
        }
    },

    /**
  * 转发页面
  */
    onShareAppMessage: function (res) {
        var that = this;
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: that.data.cateTile,
            path: '/pages/cate-list/cate-list?id=' + that.data.chanDi,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },

    initData: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.hasMore) {
            var params = {
                apiname: 'classify/findAuctionGoods',
                chanDi: that.data.chanDi,
                page: that.data.start,
                rows: that.data.count
            }
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var data = res.data.data;
                    if (that.data.start == 1) {//只有初始化时时 需要重置
                        wx.setNavigationBarTitle({
                            title: data.chaiInfo.metaDataValue
                        })
                        that.setData({
                            cateList: data.page.dataList,
                            cateTile: data.chaiInfo.metaDataValue,
                            nullTip: {
                                tipText: '没有相关数据'
                            }
                        });
                    }
                    if (data.page.dataList.length === 0) {
                        that.setData({
                            hasMore: false,
                            nullTip: {
                                tipText: '没有相关数据'
                            }
                        })
                    } else {
                        if (data.page.dataList.length < params.rows) {
                            that.setData({
                                hasMore: false
                            })
                        }
                        if (that.data.start != 1) {
                            that.setData({
                                cateList: that.data.cateList.concat(data.page.dataList),
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            start: that.data.start + 1,
                            showLoading: false
                        })
                    }
                } else {
                    app.showToastMsg(-1, '数据加载失败')
                    that.setData({
                        hasMore: false,
                        nullTip: {
                            tipText: '没有相关数据'
                        }
                    })
                }
            }, that)
        }
    }
})