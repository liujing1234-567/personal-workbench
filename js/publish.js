// 发布更新 - 每日打卡记录4个账号的发布情况
(function() {
  const Publish = {
    state: {
      view: 'daily',       // daily | monthly | yearly
      currentMonth: '',
      selectedDate: ''
    },

    // 4个账号定义（与选题池/灵感记录对应）
    accounts: [
      { id: 'dy-beauty',   name: '在下肥兔兔', icon: '🎵', desc: '抖音颜值手势舞', color: '#8B4A4A' },
      { id: 'xhs-beauty',  name: '在下肥兔兔', icon: '📕', desc: '小红书颜值变美', color: '#C47A7A' },
      { id: 'xhs-home',    name: '长耳仔仔',   icon: '🏠', desc: '家居博主',     color: '#5C7F4F' },
      { id: 'xhs-growth',  name: '兔沫柔',     icon: '✨', desc: '女性成长',     color: '#5B3A7A' }
    ],

    init() {
      this.state.currentMonth = Store.month();
      this.state.selectedDate = Store.today();
    },

    render() {
      const view = this.state.view;
      if (view === 'monthly') return this.renderMonthly();
      if (view === 'yearly')  return this.renderYearly();
      return this.renderDaily();
    },

    // ===== 每日打卡视图 =====
    renderDaily() {
      const today = Store.today();
      const date = this.state.selectedDate || today;
      const records = Store.getPublishRecords(date) || {};
      const weekDates = this.getWeekDates(date);

      // 周日期条
      let weekHtml = '';
      for (const d of weekDates) {
        const isToday = d === today;
        const isSelected = d === date;
        weekHtml += '<button class="pub-date-btn ' + (isSelected ? 'active' : '') + '" data-date="' + d + '">' +
          '<span class="pub-date-dow">' + this.getDOW(d) + '</span>' +
          '<span class="pub-date-num">' + d.slice(8) + '</span>' +
          (isToday ? '<span class="pub-date-today">今日</span>' : '') +
        '</button>';
      }

      // 账号卡片
      let cardsHtml = '';
      for (const acc of this.accounts) {
        const done = !!records[acc.id];
        cardsHtml += '<div class="pub-card" data-acc="' + acc.id + '" style="border-left:3px solid ' + acc.color + '">' +
          '<div class="pub-card-left">' +
            '<span class="pub-card-icon">' + acc.icon + '</span>' +
            '<div class="pub-card-info">' +
              '<div class="pub-card-name">' + acc.name + '</div>' +
              '<div class="pub-card-desc">' + acc.desc + '</div>' +
            '</div>' +
          '</div>' +
          '<button class="pub-check-btn ' + (done ? 'done' : '') + '" data-acc="' + acc.id + '">' +
            (done ? '✓' : '○') +
          '</button>' +
        '</div>';
      }

      const html = '<div class="page">' +
        '<div class="page-header"><div><div class="page-title">发布更新</div><div class="page-sub">记录每日各账号发布情况</div></div></div>' +

        // 视图切换
        '<div class="pub-view-tabs">' +
          '<button class="pub-view-tab active" data-v="daily">每日打卡</button>' +
          '<button class="pub-view-tab" data-v="monthly">月报表</button>' +
          '<button class="pub-view-tab" data-v="yearly">年报表</button>' +
        '</div>' +

        // 周日期选择器
        '<div class="pub-week-strip"><div class="pub-week-inner">' + weekHtml + '</div></div>' +

        // 账号列表
        '<div class="pub-cards">' + cardsHtml + '</div>' +

        // 今日统计
        '<div class="pub-today-stat">' + this.buildTodayStat(today) + '</div>' +
      '</div>';

      document.getElementById('app').innerHTML = html;
      this.bindDaily();
    },

    buildTodayStat(date) {
      const records = Store.getPublishRecords(date) || {};
      const total = this.accounts.length;
      const doneCount = this.accounts.filter(a => records[a.id]).length;
      return '今日已更新 <b>' + doneCount + '/' + total + '</b> 个账号';
    },

    // ===== 月报表视图 =====
    renderMonthly() {
      const m = this.state.currentMonth;
      const [year, month] = m.split('-');
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

      // 月切换
      const prevMonth = this.prevMonth(m);
      const nextMonth = this.nextMonth(m);
      const monthLabel = year + '年' + Number(month) + '月';

      let gridsHtml = '';
      for (const acc of this.accounts) {
        const monthRecords = Store.getPublishMonth(acc.id, m);
        const doneDays = Object.keys(monthRecords).filter(d => monthRecords[d]).length;
        const pct = daysInMonth > 0 ? ((doneDays / daysInMonth) * 100).toFixed(1) : 0;

        // 日历格子
        let calHtml = '';
        for (let d = 1; d <= daysInMonth; d++) {
          const dayStr = m + '-' + String(d).padStart(2, '0');
          const isDone = monthRecords[dayStr];
          const isFuture = dayStr > Store.today();
          calHtml += '<span class="pub-cal-cell ' + (isDone ? 'done' : '') + (isFuture ? ' future' : '') + '" style="' + (isDone ? 'background:' + acc.color : '') + '">' + d + '</span>';
        }

        gridsHtml += '<div class="pub-month-card" style="border-top:3px solid ' + acc.color + '">' +
          '<div class="pub-month-header">' +
            '<span class="pub-month-acc-icon">' + acc.icon + '</span>' +
            '<span class="pub-month-acc-name">' + acc.name + ' · ' + acc.desc.split(' ')[0] + '</span>' +
          '</div>' +
          '<div class="pub-calendar">' + calHtml + '</div>' +
          '<div class="pub-month-footer">' +
            '<span class="pub-pct" style="color:' + acc.color + '">● ' + pct + '%</span>' +
            '<span class="pub-days">📅 ' + doneDays + '天</span>' +
          '</div>' +
        '</div>';
      }

      const html = '<div class="page">' +
        '<div class="page-header"><div><div class="page-title">月报表</div></div></div>' +

        '<div class="pub-view-tabs">' +
          '<button class="pub-view-tab" data-v="daily">每日打卡</button>' +
          '<button class="pub-view-tab active" data-v="monthly">月报表</button>' +
          '<button class="pub-view-tab" data-v="yearly">年报表</button>' +
        '</div>' +

        '<div class="pub-month-nav">' +
          '<button class="pub-nav-btn" data-m="' + prevMonth + '">◀</button>' +
          '<span class="pub-month-label">' + monthLabel + '</span>' +
          '<button class="pub-nav-btn" data-m="' + nextMonth + '">▶</button>' +
        '</div>' +

        '<div class="pub-month-grid">' + gridsHtml + '</div>' +
      '</div>';

      document.getElementById('app').innerHTML = html;
      this.bindMonthly();
    },

    // ===== 年报表视图 =====
    renderYearly() {
      const year = String(new Date().getFullYear());
      let monthsHtml = '';
      for (let m = 1; m <= 12; m++) {
        const mm = year + '-' + String(m).padStart(2, '0');
        const daysInMonth = new Date(Number(year), m, 0).getDate();
        let rowHtml = '<td class="pub-y-cell pub-y-label">' + m + '月</td>';
        for (const acc of this.accounts) {
          const rec = Store.getPublishMonth(acc.id, mm);
          const done = Object.keys(rec).filter(d => rec[d]).length;
          const pct = daysInMonth > 0 ? Math.round((done / daysInMonth) * 100) : 0;
          const barW = Math.min(pct, 100);
          rowHtml += '<td class="pub-y-cell">' +
            '<div class="pub-y-bar-wrap"><div class="pub-y-bar" style="width:' + barW + '%;background:' + acc.color + '"></div></div>' +
            '<span class="pub-y-text">' + done + '天/' + pct + '%</span></td>';
        }
        monthsHtml += '<tr>' + rowHtml + '</tr>';
      }

      // 表头
      let headHtml = '<th class="pub-y-head">月份</th>';
      for (const acc of this.accounts) {
        headHtml += '<th class="pub-y-head">' + acc.icon + ' ' + acc.name + '</th>';
      }

      const html = '<div class="page">' +
        '<div class="page-header"><div><div class="page-title">年报表 · ' + year + '年</div></div></div>' +

        '<div class="pub-view-tabs">' +
          '<button class="pub-view-tab" data-v="daily">每日打卡</button>' +
          '<button class="pub-view-tab" data-v="monthly">月报表</button>' +
          '<button class="pub-view-tab active" data-v="yearly">年报表</button>' +
        '</div>' +

        '<div class="pub-year-table-wrap"><table class="pub-year-table">' +
          '<thead><tr>' + headHtml + '</tr></thead>' +
          '<tbody>' + monthsHtml + '</tbody>' +
        '</table></div>' +
      '</div>';

      document.getElementById('app').innerHTML = html;
      this.bindYearly();
    },

    // ===== 工具方法 =====
    getWeekDates(dateStr) {
      const d = new Date(dateStr);
      const dow = d.getDay(); // 0=Sun
      const mondayOffset = dow === 0 ? -6 : 1 - dow;
      const monday = new Date(d); monday.setDate(d.getDate() + mondayOffset);
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const dd = new Date(monday); dd.setDate(monday.getDate() + i);
        dates.push(this.formatDate(dd));
      }
      return dates;
    },

    formatDate(d) {
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    },

    getDOW(dateStr) {
      const d = new Date(dateStr);
      const days = ['日','一','二','三','四','五','六'];
      return days[d.getDay()];
    },

    prevMonth(m) {
      const [y, mo] = m.split('-');
      const d = new Date(Number(y), Number(mo)-1, 0);
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
    },

    nextMonth(m) {
      const [y, mo] = m.split('-');
      const d = new Date(Number(y), Number(mo), 1);
      d.setMonth(d.getMonth() + 1);
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
    },

    // ===== 事件绑定 =====
    bindDaily() {
      // 视图切换标签
      this.bindViewTabs();

      // 日期选择
      const strip = document.querySelector('.pub-week-strip');
      if (strip) {
        strip.onclick = (e) => {
          const btn = e.target.closest('.pub-date-btn');
          if (!btn) return;
          this.state.selectedDate = btn.dataset.date;
          this.render();
        };
      }

      // 打卡勾选
      const cards = document.querySelector('.pub-cards');
      if (cards) {
        cards.onclick = (e) => {
          const btn = e.target.closest('.pub-check-btn');
          if (!btn) return;
          const accId = btn.dataset.acc;
          const date = this.state.selectedDate || Store.today();
          Store.togglePublishRecord(date, accId);
          this.render();
        };
      }
    },

    bindMonthly() {
      // 视图切换
      this.bindViewTabs();

      // 月份导航
      document.querySelectorAll('.pub-nav-btn').forEach(btn => {
        btn.onclick = () => { this.state.currentMonth = btn.dataset.m; this.render(); };
      });

      // 点击某一天跳到当日打卡
      document.querySelectorAll('.pub-cal-cell:not(.future)').forEach(cell => {
        cell.style.cursor = 'pointer';
        cell.onclick = () => {
          const day = cell.textContent.padStart(2,'0');
          this.state.selectedDate = this.state.currentMonth + '-' + day;
          this.state.view = 'daily';
          this.render();
        };
      });
    },

    bindYearly() {
      this.bindViewTabs();
      // 点击某月跳到月报
      document.querySelectorAll('.pub-y-label').forEach(th => {
        th.style.cursor = 'pointer';
        th.onclick = () => {
          const mNum = th.textContent.replace('月','');
          this.state.currentMonth = new Date().getFullYear() + '-' + mNum.padStart(2,'0');
          this.state.view = 'monthly';
          this.render();
        };
      });
    },

    bindViewTabs() {
      document.querySelectorAll('.pub-view-tab').forEach(tab => {
        tab.onclick = () => {
          this.state.view = tab.dataset.v;
          this.render();
        };
      });
    },

    escape(s) {
      var m={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
      return String(s).replace(/[&<>"']/g,function(c){return m[c];});
    }
  };

  window.Publish = Publish;
})();
