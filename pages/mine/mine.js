var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var loginUrl = '/pages/login/login';
Page({
    data: {
        customerInfo: {},
        userList: {},
        settingUrl: loginUrl,
        bottleOrderUrl: loginUrl,
        shareOrderUrl: loginUrl,
        personUrl: loginUrl,
        orderUrl: loginUrl,
        unpayUrl: loginUrl,
        orderCancelUrl: loginUrl,
        auctionUrl: loginUrl,
        sendUrl: loginUrl,
        collectionUrl: loginUrl,
        footUrl: loginUrl,
        walletUrl: loginUrl,
        postUrl: loginUrl,
        followerUrl: loginUrl,
        followUrl: loginUrl,
        sendAuctionUrl: loginUrl,
        draftsUrl: loginUrl,
        imgUrl: app.globalData.imagePath,
    },
    openOrder: function (event) {//展开我的订单
        var open = this.data.checkOne == 'open' ? '' : 'open';
        this.setData({
            checkOne: open
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.setData({ showLoading: false })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
        if (that.data.customerInfo.customerSeq) {
            that.setData({
                settingUrl: "/pages/setting/setting",
                bottleOrderUrl: '/pages/share-bottle-order/share-bottle-order',
                shareOrderUrl: '/pages/share-order/share-order',
                auctionOrderUrl: '/pages/auction-order/auction-order',
                personUrl: "/pages/personalInfo-modify/personalInfo-modify",
                orderUrl: "/pages/mine-order/mine-order",
                unpayUrl: "/pages/order-unpay/order-unpay",
                orderCancelUrl: "/pages/mine-order-cancel/mine-order-cancel",
                auctionUrl: "/pages/mine-auction/mine-auction",
                sendUrl: "/pages/mine-send/mine-send",
                collectionUrl: "/pages/mine-collection/mine-collection",
                footUrl: "/pages/mine-foot/mine-foot",
                postUrl: "/pages/mine-post-chose/mine-post-chose",
                walletUrl: "/pages/mine-wallet/mine-wallet",
                followerUrl: "/pages/mine-follower/mine-follower",
                followUrl: "/pages/mine-follow/mine-follow",
                sendAuctionUrl: "/pages/proAdd/proAdd",
                draftsUrl: "/pages/drafts/drafts",
            })
            that.initData();
        } else {
            that.setData({
                userList: {},
                settingUrl: loginUrl,
                bottleOrderUrl: loginUrl,
                shareOrderUrl: loginUrl,
                personUrl: loginUrl,
                orderUrl: loginUrl,
                orderCancelUrl: loginUrl,
                unpayUrl: loginUrl,
                auctionUrl: loginUrl,
                sendUrl: loginUrl,
                collectionUrl: loginUrl,
                footUrl: loginUrl,
                postUrl: loginUrl,
                walletUrl: loginUrl,
                followerUrl: loginUrl,
                followUrl: loginUrl,
                sendAuctionUrl: loginUrl,
                draftsUrl: loginUrl,
            })
        }
    },

    //点击查看 经验值规则
    checkRule: function () {
        var userInfo = this.data.userList;
        var level = userInfo.experience + '/' + userInfo.upExp;
        var content = '您目前已是最高级别';
        if (userInfo.experience < userInfo.upExp){
            content = '以上是您当前的经验值以及下一次升级的经验值'
        }
        wx.showModal({
            title: '经验值：' + level,
            content: content,
            confirmText: '如何升级',
            confirmColor: '#A72125',
            cancelColor: '#A72125',
            success: function (res) {
                if (res.confirm) {
                    wx.navigateTo({
                        url: '/pages/point-rule/point-rule'
                    })
                }
            }
        })
    },
    //点击V图标
    applyVip: function () {
        var that = this
        //判断是否符合加V的条件
        var data = {
            apiname: 'bbs/post/ifV',
            uid: that.data.customerInfo.customerSeq
        }
        request.getData(data, function (res) {
            var state = res.data.state, msg = "", confirmTxt = "查看规则";
            if (state == 0) {
                var status = parseInt(res.data.message)
                if(status == 6){//已经在待审核或者审核通过
                    wx.showModal({
                        title: '温馨提示',
                        content: '您的加V申请正在审核中，请耐心等候...',
                        confirmText: '关闭',
                        confirmColor: '#A72125',
                        showCancel: false
                    })
                } else if (status == 7){
                    wx.showModal({
                        title: '温馨提示',
                        content: '您的账户异常，存在违规操作，不可申请加V',
                        confirmText: '关闭',
                        confirmColor: '#A72125',
                        showCancel: false
                    })
                }else{
                    switch (status) {
                        case 1:
                            msg = "关注人数超过10人才可申请";
                            break;
                        case 2:
                            msg = "粉丝人数超过20人才可申请";
                            break;
                        case 3:
                            msg = "成功发帖超过10次以上才可申请";
                            break;
                        case 4:
                            msg = "售出的分享瓶数量未达到50瓶";
                            break;
                        case 5:
                            msg = "等级达到10级才可申请";
                            confirmTxt = "如何升级"
                            break;
                    }
                    wx.showModal({
                        title: '温馨提示',
                        content: msg,
                        confirmText: confirmTxt,
                        confirmColor: '#A72125',
                        cancelColor: '#A72125',
                        success: function (res) {
                            if (res.confirm) {
                                var urls = ''
                                //不满足5级时 点击如何升级跳转到获取经验值说明页面  否则查看加V规则
                                if (status == 4) {
                                    urls = '/pages/point-rule/point-rule'
                                } else {
                                    urls = '/pages/vip-rule/vip-rule'
                                }
                                wx.navigateTo({
                                    url: urls
                                })
                            }
                        }
                    })
                }
            } else {
                wx.showModal({
                    title: '认证提示',
                    content: '认证之后，您的帖子更权威',
                    confirmText: '申请认证',
                    confirmColor: '#A72125',
                    cancelColor: '#A72125',
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '/pages/apply-vip/apply-vip'
                            })
                        }
                    }
                })
            }
        }, that, 'post')
    },
    //初始化页面
    initData: function () {
        var that = this;
        message.hide.call(that)
        var data = {
            apiname: 'person/homepage/' + that.data.customerInfo.customerSeq,
        }
        request.getData(data, function (res) {
            var data = res.data.data;
            if (data.length > 0) {
                that.setData({
                    userList: data[0]
                })
            }
        }, that, 'get')
    }
})