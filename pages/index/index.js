Page({
  data: {
    uid: '33f8f472f80fda40a9dcc257ee7cf9c9',
    device:["半开", "全开", "暂停", "关闭"],
    topics: ["a006", "b006", "c006", "d006",],
    url:[
      '../../img/锁定.png',
      '../../img/开.png',
      '../../img/实心正方形.png',
      '../../img/关.png'
    ],
    statusimg:[
      '../../img/开关.png',
      '../../img/开关 (1).png'

    ],
    device_status: ["离线", "离线", "离线", "离线"], //默认离线
    powerstatus: ["已关闭", "已关闭", "已关闭", "已关闭"],   //默认关闭
    currentTime: ''
  },

  

  updateTime: function() {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
  
    this.setData({
      currentTime: `${hours}:${minutes}`
    });
  },
  
  toggleclick: function(e) {
    var index = e.currentTarget.dataset.index;
    var currentStatus = this.data.powerstatus[index];
    var newStatus = currentStatus === "已打开" ? "已关闭" : "已打开";
    this.setData({
      [`powerstatus[${index}]`]: newStatus
    });
    this.sendRequest(this.data.topics[index], newStatus === "已打开" ? "on" : "off");
  
    // 如果开关被打开，设置一个延迟1秒的定时器来关闭开关，并在设备振动
    if (newStatus === "已打开") {
      var that = this;
      setTimeout(function() {
        that.toggleclick({ currentTarget: { dataset: { index: index } } });
      }, 1000);
  
      // 开关打开时设备短暂振动
      wx.vibrateShort({
        type: 'heavy',
      });
    }
  },
  sendRequest: function(topic, status) {
    var that = this;
    wx.request({
      url: 'https://api.bemfa.com/api/device/v1/data/1/', 
      method: "POST",
      data: {
        uid: that.data.uid,
        topic: topic,
        msg: status
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success(res) {
        console.log(res.data);
  
        
      }
    });
  }
,  
  
  onLoad: function() {
    this.updateTime();
    var that = this;
    setInterval(function() {
      that.data.topics.forEach(function(topic, index) {
        wx.request({
          url: 'https://api.bemfa.com/api/device/v1/status/', 
          data: {
            uid: that.data.uid,
            topic: topic,
          },
          header: {
            'content-type': "application/x-www-form-urlencoded"
          },
          success(res) {
            
            that.setData({
              [`device_status[${index}]`]: res.data.status === "online" ? "在线" : "离线"
            });
          }
        });

        wx.request({
          url: 'https://api.bemfa.com/api/device/v1/data/1/', 
          data: {
            uid: that.data.uid,
            topic: topic,
          },
          header: {
            'content-type': "application/x-www-form-urlencoded"
          },
          success(res) {
            
            that.setData({
              [`powerstatus[${index}]`]: res.data.msg === "on" ? "已打开" : "已关闭"
            });
          }
        });
      });
    }, 5000);
  },

  onTapButton: function () {
    wx.request({
      url: 'https://o7b080b9.ala.cn-hangzhou.emqxsl.cn:8443/api/v5/publish', 
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic bjAxMTBiZDk6d2FmZmQ4YTEwZGQ1ZTExOQ=='
      },
      data: {
        topic: 'switch1',
        qos: 1,
        payload: 'on'
      },
      success: function(res) {
        console.log(res.data)
        wx.showToast({
          title: '已开/关',
          icon: 'success'
        })
      },
      fail: function(error) {
        console.log(error);
        console.log('erroroccers');
        wx.showToast({
          title: '操作失败',
        })
      }
    })
  }


});



