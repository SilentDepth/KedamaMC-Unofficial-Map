var markerData = [
  {x: 2, z: 11, title: '世界出生点'},
  // {x: 411, z: -109, title: '奶油芒果蛋糕'},
  // {x: 250, z: -64, title: 'Fly_Goat的小屋'},
  // {x: 216, z: 24, title: 'EJQ\'s'},
  // {x: 111, z: 8, title: '251起飞台'},
  // {x: 110, z: 34, title: 'BlockTacker\'s'},
  // {x: 217, z: 184, title: 'Black_TeaAnna\'s'},
  // {x: 376, z: -541, title: 'EdwardWLH\'s'},
  // {x: 369, z: -631, title: 'Mynaemechengguan\'s'},
  {x: 299, z: -657, title: '圣诞树'},
  // {x: -3, z: -705, title: 'iPlayForKidYou\'s'},
  // {x: -412, z: 207, title: 'JieXia\'s'},
  {x: -645, z: 219, title: '死亡天坑'},
  {x: 17, z: 183, title: '冰帝宫'},
  // {x: -91, z: 258, title: 'loaring\'s'},
  {x: -304, z: 431, title: '山体峡谷的裂口'},
  // {x: -308, z: 507, title: 'Mr_Sachen\'s'},
  {x: -138, z: 541, title: '羊驼神社'},
  {x: -1, z: -89, title: '大圣诞树'},
  // {x: -897, z: 854, title: 'Ghastty\'s'},
  // {x: 388, z: 212, title: 'chrgs\''},
  // {x: 591, z: 359, title: 'EOH_JueQing\'s'},
  // {x: 642, z: 548, title: '荒村'},
  // {x: 785, z: 606, title: 'WitheringNight\'s'},
  // {x: 869, z: 366, title: 'nihui\'s?'},
  {x: -131, z: -262, y: 66, title: '僵尸刷怪笼'},
  // {x: -598, z: -341, y: 71, title: 'HY_HuanYao\'s'},
  // {x: 283, z: -1301, y: 76, title: 'Always_U\'s'},
  // {x: -267, z: -1020, y: 75, title: 'Budun\'s'},
  {x: -1170, z: 1058, title: '末地传送门'},
  {x: 124, z: -243, title: '僵尸刷怪笼'},
  // {x: 294, z: -63, y: 69, title: 'BlueMKY\'s'},
  // {x: 383, z: 6, y: 68, title: 'storm_Blues\''},
  // {x: 311, z: -227, y: 73, title: 'Vladimir503\'s'},
  // {x: 247, z: -229, y: 56, title: 'Xuha\'s'},
  // {x: -1964, z: -572, y: 69, title: 'ONEMOON\'s'},
  // {x: -2147, z: 220, y: 63, title: 'qumingjam\'s'},
  // {title: 'AqIu_\'s', x: -162, z: -907, y: 78},
  // {title: 'Tiande\'s', x: 250, z: -2165, y: 76},
  {title: "未知传送门", x: -719, z: 325, y: 64, type: 'portal'},
  // {title: "An_black's", x: 94, z: 1077, y: 72},
  {title: "砂砾山", x: 217, z: 919, y: 74},
  {title: "未知传送门", x: 297, z: 808, y: 70, type: 'portal'},
  // {title: "lilydjwg's", x: -107, z: -225, y: 70},
  // {title: "Physical_Hider's", x: -41, z: -348, y: 64},
  // {title: 'Zizi_Y\'s', x: -88, z: -925, y: 63},
  // {title: 'toastbread\'s', x: -162, z: -937, y: 78},
  // {title: 'Yukari_Nya\'s', x: -182, z: -879, y: 70},
  // {title: 'lyhyu__yi\'s', x: -209, z: -893, y: 72},
  {title: '未知传送门', x: 2258, z: 53, y: 64, type: 'portal'},
  // {title: 'sophist_Jun & _NR\'s', x: 3435, z: 1565, y: 54},
  {title: '未知传送门', x: 598, z: 841, y: 75, type: 'portal'},
  // {title: 'JZZ_233 & wzhgbb\'s', x: 905, z: 399, y: 65},
  // {title: 'GeneralStarfish\'s?', x: 704, z: 56, y: 64},
  {title: '原动力小镇', x: -178, z: -888},
  {title: '避暑山庄', x: -1153, z: -3604},
  {title: '亚特兰蒂斯', x: -232, z: -3880},
  {title: '浮游港', x: 3440, z: 510},
  {title: '空中羊场', x: 96, z: 400},
  {title: '虎崖村', x: -1277, z: -175},
  {title: 'Doraemon_sir\'s', x: -629, z: 909},
  {title: '棉花庄', x: -630, z: 801},
  {title: 'Ghastty\'s 大麦场', x: -849, z: 711},
  {title: '见泷原', x: -3140, z: -743},
  {title: '现充村', x: -4, z: 401},
  {title: '林狼原', x: 900, z: 300},
  {title: '雪峰乡', x: -18, y: 114, z: 1061},
  {title: '仙女山寨', x: -2145, z: 1005},
  {title: '西湖', x: -2320, z: 380},
  {title: '北方不死院', x: 1425, z: 270},
  {title: '绾颜山庄', x: 945, z: 135},
  {title: '低语教团', x: -1454, z: -365},
  {title: '剑栏平原', x: 2600, z: -1450},
  {title: '渔场', x: -1927, z: -3305},
  {title: '海风镇', x: 655, z: 1980},
  {title: '哲学镇', x: -1247, z: 1795},
  {title: '双子港', x: 2330, z: -1525},
  {title: '双子分港', x: 2363, z: -2249},
  {title: '旧山区南', x: 1162, z: 120},
  {title: '北忒伊亚（建设中）', x: 1408, z: -3037},
  {title: '西京', x: -2056, z: 861},
  {title: '山区', x: -550, z: 4100},
  {title: '南西岛', x: -2008, z: 2285},
  {title: 'Derp城', x: -600, z: 1269},
  {title: '红石渣', x: 246, z: 632},
  {title: '西国隘口', x: -860, z: 0},
  {title: '毛线第一图书馆', x: 2244, z: -1676},
];
