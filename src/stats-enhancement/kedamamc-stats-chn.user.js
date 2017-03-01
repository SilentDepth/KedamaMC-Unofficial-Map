// ==UserScript==
// @name         毛线统计页增强脚本
// @namespace    silentdepth
// @version      4
// @updateURL    https://gist.githubusercontent.com/SilentDepth/a7d0e7986deca5dd9a7b1dbaccd09f78/raw/kedamamc-stats-chn.user.js
// @downloadURL  https://gist.githubusercontent.com/SilentDepth/a7d0e7986deca5dd9a7b1dbaccd09f78/raw/kedamamc-stats-chn.user.js
// @author       SilentDepth
// @match        https://stats.kedamamc.com/*
// ==/UserScript==

$(function () {
  'use strict';

  localStorage._usEnh = localStorage._usEnh || '{ver:4}';
  const data = JSON.parse(localStorage._usEnh);
  const i18n = {
    'deaths': '死亡次数',
    'fish caught': '捕鱼数',
    'meters crouched': '潜行距离（米）',
    'meters sprinted': '疾跑距离（米）',
    'traded with villagers': '村民交易次数',
    'mob killed': '生物击杀数',
    'meters with horse': '骑马移动距离（米）',
    'meters climbed': '攀爬高度（米）',
    'meters on boat': '坐船移动距离（米）',
    'damage dealt': '造成伤害',
    'meters in minecart': '坐矿车移动距离（米）',
    'meters dove': '水下移动距离（米）',
    'jumps': '跳跃次数',
    'damage taken': '受到伤害',
    'meters gliding with elytra': '飞行距离（米）',
    'meters fallen': '掉落高度（米）',
    'meters swum': '游泳距离（米）',
    'meters walked': '行走距离（米）',
    'player killed': '玩家击杀数',
    'first login': '初次登录',
    'last active': '最后在线',
    'total online': '总计在线',
    'initial': '初始',
    'Taking Inventory': '打开物品栏',
    'Getting Wood': '获得木头',
    'Benchmarking': '这是？工作台！',
    'Time to Mine!': '采矿时间到！',
    'Hot Topic': '“热”门话题',
    'Acquire Hardware': '来硬的',
    'Time to Farm!': '耕种时间到！',
    'Bake Bread': '烤面包',
    'The Lie': '蛋糕是个谎言',
    'Getting an Upgrade': '获得升级',
    'Delicious Fish': '美味的鱼儿',
    'On A Rail': '在铁路上',
    'Time to Strike!': '出击时间到！',
    'Monster Hunter': '怪物猎人',
    'Cow Tipper': '斗牛士',
    'When Pigs Fly': '当猪飞的时候！',
    'Sniper Duel': '狙击手的对决',
    'DIAMONDS!': '钻石！',
    'We Need to Go Deeper': '我们需要再深入些',
    'Return to Sender': '见鬼去吧！',
    'Into Fire': '与火共舞',
    'Local Brewery': '本地的酿造厂',
    'The End?': '结束了？',
    'The End.': '结束了。',
    'Enchanter': '附魔师',
    'Overkill': '赶尽杀绝',
    'Librarian': '图书管理员',
    'Adventuring Time': '探索的时光',
    'The Beginning?': '开始了？',
    'The Beginning.': '开始了。',
    'Beaconator': '信标工程师',
    'Repopulation': '种群恢复',
    'Diamonds to you!': '给你钻石！',
    'Overpowered': '君临天下',
  };

  function parseTime(str) {
    const RE = /^(\w+), (\w+) (\d+)\w\w, (\d{4}) (\d\d):(\d\d):(\d\d) ([-+]\d{4})$/;
    return RE.test(str) ? new Date(str.replace(RE, '$1, $3 $2 $4 $5:$6:$7 $8')) : new Date(str);
  }

  function getLocationType() {
    return /\/?[0-9a-f]{32}\/?/.test(location.pathname) ? 'user' : 'index';
  }

  function makeListItem(player) {
    return $('<a class="list-group-item">').text(player.playername).attr('href', '/' + player.uuid_short);
  }

  function save() {
    localStorage._usEnh = JSON.stringify(data);
  }

  function getPlayerNames(needIframe) {
    return new Promise(resolve => {
      if (needIframe) {
        $('<iframe id="_us-iframe" src="https://stats.kedamamc.com/">')
          .on('load', () => {
            resolve($('.media', $(this).contents()[0]));
          })
          .hide()
          .appendTo('body');
      } else {
        resolve($('.media'));
      }
    }).then($medias => {
      let map = {};
      $medias.each((idx, el) => {
        map[$('a', el).attr('href')] = $('h4', el).text();
      });
      $('#_us-iframe').remove();
      return map;
    });
  }

  let locationType = getLocationType();
  if (locationType === 'index') {
    // Gather uuid: playername
    data.players = data.players || {};
    $('.media').each((idx, el) => {
      let uuid = $('a', el).attr('href');
      data.players[uuid] = {
        playername: $('h4', el).text(),
        uuid_short: uuid,
      };
    });
    save();
    $('#search').attr('placeholder', `Search In ${Reflect.ownKeys(data.players).length} Players`);
  } else if (locationType === 'user') {
    // Translate (only on user page)
    let [, , $infoRow, , $achvRow, $statRow] = $('.row').map((idx, el) => $(el));
    let [$membership, $history] = $infoRow.find('.panel').map((idx, el) => $(el));
    $membership.find('h3').html($membership.find('h3').html().replace('Membership', '账号信息'));
    $membership.find('.list-group-item-heading').each((idx, el) => {
      let $el = $(el);
      if (idx < 2) {
        let str = $el.text()
          .split(', ')
          .map((s, idx) => idx === 1
            ? s.slice(0, -2).split(' ').reverse().join(' ')
            : s)
          .join(', ');
        $el.text(new Date(str).toLocaleString('chinese', {hour12: false}));
      } else if (idx === 2) {
        $el.text($el.text().replace('Hours', '小时'));
      }
      let $p = $el.next();
      $p.text(i18n[$p.text().toLowerCase()]);
    });
    $history.find('h3').html($history.find('h3').html().replace('Name History', '名称历史'));
    $history.find('small').each((idx, el) => {
      let $el = $(el);
      $el.text($el.text().toLowerCase() === 'initial'
        ? i18n['initial']
        : `修改于${new Date($el.text().slice(10)).toLocaleString('chinese', {hour12: false})}`);
    });
    $achvRow.find('h3').text('成就');
    $achvRow.find('h4').each((idx, el) => {
      let $el = $(el);
      $el.text(i18n[$el.text()]);
    });
    $statRow.find('h3').text('统计');
    $statRow.find('.text-muted').each((idx, el) => {
      let $el = $(el);
      $el.text(i18n[$el.text().trim().toLowerCase()]);
    });

    // Add serachbox (only if isPlayersUpdated is true)
    if (Reflect.ownKeys(data.players).length > 0) {
      let $navContainer = $('nav > .container').css('position', 'relative');
      let $search = $('<input type="text" class="form-control" id="search">')
        .attr('placeholder', `Search In ${Reflect.ownKeys(data.players).length} Players`)
        .wrap('<div class="navbar-form navbar-right form-group">');
      $search.parent().appendTo($navContainer);
      let $list = $('<div class="list-group">').css({
        display: 'none',
        position: 'absolute',
        top: '100%',
        right: '15px',
      }).appendTo($navContainer);
      $search.on('input', () => {
        let keyword = $search.val().trim().toLowerCase();
        if (keyword.length > 0) $list.show();
        else $list.hide();
        $list.html('');
        $list.append(
          Reflect.ownKeys(data.players)
            .filter(uuid => data.players[uuid].playername.toLowerCase().indexOf(keyword) >= 0)
            .map(uuid => makeListItem(data.players[uuid]))
        );
      }).on('focus', () => {
        $search.trigger('input');
      }).click(ev => ev.stopPropagation());
      $(document).on('click', () => {
        $list.hide();
      });
    }
  }
});