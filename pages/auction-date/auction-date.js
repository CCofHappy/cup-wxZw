// auction-date.js
Page({ 
    data: {
        auctionDate: [
            {//拍场开拍日期
                year: 2017,
                month: 5,
                auction: {
                    one: [0, 0, 0, 0],  //拍场1[开始日期，展示日期，结束日期，拍场id] 
                    two: [29, 31, 0, 334], //拍场2[开始日期，展示日期，结束日期，拍场id] 
                }
            },{//拍场开拍日期
                year: 2017,
                month: 6,
                auction: {
                    one: [1, 7, 10, 334],  //拍场1[开始日期，展示日期，结束日期，拍场id] 
                    two: [21, 25, 28, 336], //拍场2[开始日期，展示日期，结束日期，拍场id] 
                }
            },{//拍场开拍日期
                year: 2017,
                month: 11,
                auction: {
                    one: [0, 0, 0, 0],  //拍场1[开始日期，展示日期，结束日期，拍场id] 
                    two: [24, 30, 31, 338], //拍场2[开始日期，展示日期，结束日期，拍场id] 
                }
            }, {//拍场开拍日期
                year: 2017,
                month: 12,
                auction: {
                    one: [0, 0, 2, 338],  //拍场1[开始日期，展示日期，结束日期，拍场id] 
                    two: [13, 15, 17, 339], //拍场2[开始日期，展示日期，结束日期，拍场id] 
                }
            }, {//拍场开拍日期
                year: 2018,
                month: 1,
                specialId: 1,
                auction: {
                    one: [5, 10, 14, 341],  //拍场1[开始日期，展示日期，结束日期，拍场id] 
                    two: [32, 32, 32, 32], //拍场2[开始日期，展示日期，结束日期，拍场id] 
                }
            }, {//拍场开拍日期
                year: 2018,
                month: 3,
                auction: {
                    one: [26, 29, 31, 343],  //拍场1[开始日期，展示日期，结束日期，拍场id] 
                    two: [32, 32, 32, 32], //拍场2[开始日期，展示日期，结束日期，拍场id] 
                }
            }, {//拍场开拍日期
                year: 2018,
                month: 4,
                auction: {
                    one: [10, 12, 14, 344],  //拍场1[开始日期，展示日期，结束日期，拍场id] 
                    two: [32, 32, 32, 32], //拍场2[开始日期，展示日期，结束日期，拍场id] 
                }
            }
        ],
        auctionDateOpen: {//当前显示月份
            one: [0, 0, 0, 0],  
            two: [0, 0, 0, 0], 
        },
        date: {
            year: 0,   //当前年份
            month: 0,   //当前月份
        },
        empty: [],
        days: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var date = new Date;
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        this.setData({
            date: {
                year: year,
                month: month,
            },
        })
        this.initData();
    },

    initData: function () {
        var year = this.data.date.year, month = this.data.date.month;
        var auctionDate = this.data.auctionDate;
        for (var i in auctionDate){
            if (year == auctionDate[i].year && month == auctionDate[i].month){
                this.setData({
                    auctionDateOpen: auctionDate[i].auction
                })  
            }
        }
        var days = [], empty = [];
        var MonthDays = this.getMonthDays(year, month);
        var emptyDays = this.getFirstDayOfWeek(year, month) == 0 ? 7 : this.getFirstDayOfWeek(year, month);
        for (var i = 1; i <= MonthDays; i++) {
            days.push(i);
        }
        for (var i = 1; i < emptyDays; i++) {
            empty.push(i);
        }
        this.setData({
            empty: empty,
            days: days,
        })
    },

    // 获取当月共多少天
    getMonthDays: function (year, month) {
        return new Date(year, month, 0).getDate();
    },
    // 获取当月第一天星期几
    getFirstDayOfWeek: function (year, month) {
        return new Date(Date.UTC(year, month - 1, 1)).getDay();
    },

    leftTap: function () {
        var year = this.data.date.year, month = this.data.date.month;
        if (month == 1) {
            year = year - 1;
            month = 12;
        } else {
            month = month - 1;
        }
        this.setData({
            date: {
                year: year,
                month: month,
            },
            auctionDateOpen: {
                one: [0, 0, 0],
                two: [0, 0, 0],
            },
        });
        this.initData();
    },

    rightTap: function () {
        var year = this.data.date.year, month = this.data.date.month;
        if (month == 12) {
            year = year + 1;
            month = 1;
        } else {
            month = month + 1;
        }
        this.setData({
            date: {
                year: year,
                month: month,
            },
            auctionDateOpen: {
                one: [0, 0, 0],
                two: [0, 0, 0],
            },
        });
        this.initData();
    },

    jumpSession: function(e){
        var date = e.currentTarget.dataset.date;
        var id = date >= this.data.auctionDateOpen.two[0] ? this.data.auctionDateOpen.two[3] : this.data.auctionDateOpen.one[3];
        if(id==-1){
            if (date == 5 || date == 11 || date==12){
                id = 340;
            } else if (date == 6 || date == 13) {
                id = 341;
            } else if (date == 7 || date == 8 || date == 9 || date == 10 || date == 14) {
                id = 342;
            }
        }
        if (id > 0) {
            wx.navigateTo({
                url: '/pages/auction-detail/auction-detail?id=' + id
            })
        }
    },
})