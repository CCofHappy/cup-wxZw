var app = getApp();
Page({
  data: {
    imgUrl: app.globalData.imagePath,
  },

  checkbox: function (event) {
    var num = parseInt(event.target.dataset.num);
    switch (num){
      case 1 :
        var open = this.data.checkOne == 'open' ? '' : 'open';
        this.setData({
          checkOne: open
        });
        break;
      case 2 :
        var open = this.data.checkTwo == 'open' ? '' : 'open';
        this.setData({
          checkTwo: open
        });
        break;  
      case 3:
        var open = this.data.checkThree == 'open' ? '' : 'open';
        this.setData({
          checkThree: open
        });
        break;
      case 4:
        var open = this.data.checkFour == 'open' ? '' : 'open';
        this.setData({
          checkFour: open
        });
        break; 
    }
  }
})