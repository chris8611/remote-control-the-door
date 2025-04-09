Component({
  data: {
    navBarHeight: 0,    // 导航栏高度
    menuBottom: 0,      // 胶囊距底部间距（保持底部间距一致）
    menuRight: 0,       // 胶囊距右方间距（保持左、右间距一致）
    menuHeight: 0       // 胶囊高度（自定义内容可与胶囊高度保证一致）
  },
  lifetimes: {
    attached() {
      this.setNavBarInfo();
    }
  },
  methods: {
    setNavBarInfo() {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      // 获取胶囊按钮位置信息
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      // 计算导航栏高度：状态栏高度 + 胶囊距上距离（状态栏高度到胶囊顶部的距离）* 2 + 胶囊高度
      const navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
      const menuBottom = menuButtonInfo.top - systemInfo.statusBarHeight;
      const menuRight = systemInfo.screenWidth - menuButtonInfo.right;
      const menuHeight = menuButtonInfo.height;

      // 更新数据
      this.setData({
        navBarHeight: navBarHeight,
        menuBottom: menuBottom,
        menuRight: menuRight,
        menuHeight: menuHeight
      });
    }
  }
});
