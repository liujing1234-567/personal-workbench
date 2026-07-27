// 主应用入口
(function() {
  const App = {
    currentPage: 'tasks',

    pages: {
      tasks: { title: '每日计划', render: () => Tasks.render() },
      topics: { title: '选题池', render: () => Topics.render() },
      inspiration: { title: '灵感记录', render: () => Inspiration.render() },
      finance: { title: '小富婆金库收入', render: () => Finance.render() },
      settings: { title: '设置', render: () => App.renderSettings() }
    },

    init() {
      // 注册 Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      }

      this.bindDrawer();
      this.bindMenu();
      this.updateUserStatus();
      this.navigate('tasks');

      // 启动云端同步
      if (window.Sync) Sync.init();
    },

    bindDrawer() {
      const drawer = document.getElementById('drawer');
      const btn = document.getElementById('menuBtn');
      const mask = document.getElementById('drawerMask');

      btn.onclick = () => drawer.classList.toggle('open');
      mask.onclick = () => drawer.classList.remove('open');

      // 桌面端默认展开
      if (window.innerWidth >= 1024) {
        drawer.classList.add('open');
        drawer.style.pointerEvents = 'auto';
      }
    },

    bindMenu() {
      const menu = document.getElementById('drawerMenu');
      menu.onclick = (e) => {
        const item = e.target.closest('.menu-item');
        if (!item) return;
        const page = item.dataset.page;
        this.navigate(page);
        if (window.innerWidth < 1024) {
          document.getElementById('drawer').classList.remove('open');
        }
      };
    },

    updateUserStatus() {
      const s = Store.getSettings();
      const statusEl = document.getElementById('userStatus');
      const timeEl = document.querySelector('.status-time');
      if (statusEl) statusEl.textContent = s.status || '复更中';
      if (timeEl) timeEl.textContent = s.autoTime || '09:00';
    },

    // 深色高级模块主题色
    themeColors: {
      tasks:      { primary: '#3D5A6C', dark: '#2A3F4D', soft: '#E8EDF0', accent: '#C9A96E', gradient: 'linear-gradient(135deg, #3D5A6C 0%, #2A3F4D 100%)' },
      topics:     { primary: '#8B4A4A', dark: '#6B3535', soft: '#F0E8E8', accent: '#B8936E', gradient: 'linear-gradient(135deg, #8B4A4A 0%, #6B3535 100%)' },
      inspiration:{ primary: '#5B3A7A', dark: '#42285C', soft: '#EDE8F2', accent: '#C47A7A', gradient: 'linear-gradient(135deg, #5B3A7A 0%, #42285C 100%)' },
      finance:    { primary: '#5C7F4F', dark: '#4A6A3F', soft: '#E8EFE3', accent: '#C4A24E', gradient: 'linear-gradient(135deg, #5C7F4F 0%, #4A6A3F 100%)' },
      settings:   { primary: '#3D5A6C', dark: '#2A3F4D', soft: '#E8EDF0', accent: '#C9A96E', gradient: 'linear-gradient(135deg, #3D5A6C 0%, #2A3F4D 100%)' }
    },

    setModuleTheme(page) {
      const colors = this.themeColors[page] || this.themeColors.tasks;
      const root = document.documentElement;
      root.style.setProperty('--module-primary', colors.primary);
      root.style.setProperty('--module-dark', colors.dark);
      root.style.setProperty('--module-soft', colors.soft);
      root.style.setProperty('--module-accent', colors.accent);
      root.style.setProperty('--module-gradient', colors.gradient);
    },

    navigate(page) {
      if (!this.pages[page]) return;
      this.currentPage = page;
      this.setModuleTheme(page);
      document.getElementById('pageTitle').textContent = this.pages[page].title;
      document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
      });
      this.pages[page].render();
    },

    renderSettings() {
      const s = Store.getSettings();
      const html = `
        <div class="page">
          <div class="page-header">
            <div>
              <div class="page-title">⚙️ 设置</div>
            </div>
          </div>

          <div class="setting-section">
            <div class="setting-row">
              <span class="setting-label">工作状态</span>
              <span class="setting-value">
                <select class="select" id="statusSel" style="width:auto; padding:6px 10px;">
                  <option ${s.status === '复更中' ? 'selected' : ''}>复更中</option>
                  <option ${s.status === '冲刺中' ? 'selected' : ''}>冲刺中</option>
                  <option ${s.status === '休息中' ? 'selected' : ''}>休息中</option>
                </select>
              </span>
            </div>
            <div class="setting-row">
              <span class="setting-label">每日灵感自动推送</span>
              <span class="setting-value">
                <select class="select" id="autoTimeSel" style="width:auto; padding:6px 10px;">
                  <option ${s.autoTime === '08:00' ? 'selected' : ''}>08:00</option>
                  <option ${s.autoTime === '09:00' ? 'selected' : ''}>09:00</option>
                  <option ${s.autoTime === '10:00' ? 'selected' : ''}>10:00</option>
                </select>
              </span>
            </div>
          </div>

          <div class="setting-section">
            <div class="setting-row" id="exportBtn" style="cursor:pointer;">
              <span class="setting-label">📤 导出数据备份</span>
              <span class="setting-value">→</span>
            </div>
            <div class="setting-row" id="importBtn" style="cursor:pointer;">
              <span class="setting-label">📥 导入数据备份</span>
              <span class="setting-value">→</span>
            </div>
            <input type="file" id="importFile" accept=".json" style="display:none;" />
            <div class="setting-row" id="clearBtn" style="cursor:pointer; color:var(--danger);">
              <span class="setting-label">清空所有数据</span>
              <span class="setting-value" style="color:var(--danger);">→</span>
            </div>
          </div>

          <div class="setting-section">
            <div class="setting-row">
              <span class="setting-label">☁️ 云端同步</span>
              <span class="setting-value"><span id="syncStatus" style="font-size:12px; color:var(--text-light);">初始化…</span></span>
            </div>
            <div class="setting-row" id="syncNowBtn" style="cursor:pointer;">
              <span class="setting-label">🔄 立即同步</span>
              <span class="setting-value">→</span>
            </div>
          </div>

          <div class="card" style="padding:12px 14px; font-size:12px; color:var(--text-light); line-height:1.7;">
            <div style="font-weight:600; color:var(--text); margin-bottom:6px;">💡 数据迁移说明</div>
            <div>1. 在旧设备点击「导出数据备份」，会下载一个 JSON 文件</div>
            <div>2. 将该文件发送到新设备（微信/邮件/云盘均可）</div>
            <div>3. 在新设备打开工作台，点击「导入数据备份」选择该文件</div>
            <div style="margin-top:6px; color:var(--text-mute);">数据已开启云端自动同步，换设备自动拉取最新数据</div>
          </div>

          <div class="setting-section">
            <div class="setting-row">
              <span class="setting-label">关于</span>
              <span class="setting-value">创作工作台 v1.0</span>
            </div>
            <div class="setting-row">
              <span class="setting-label">PWA 状态</span>
              <span class="setting-value">${'serviceWorker' in navigator ? '✓ 支持' : '✗ 不支持'}</span>
            </div>
            <div class="setting-row">
              <span class="setting-label">语音输入</span>
              <span class="setting-value">${'webkitSpeechRecognition' in window ? '✓ 支持' : '✗ 不支持'}</span>
            </div>
          </div>

          <p style="text-align:center; color:var(--text-mute); font-size:12px; margin-top:24px;">
            你的数据会安全地保存在本设备，并自动同步到云端
          </p>
        </div>
      `;
      document.getElementById('app').innerHTML = html;

      document.getElementById('statusSel').onchange = (e) => {
        Store.setSettings({ status: e.target.value });
        this.updateUserStatus();
        this.toast('已更新');
      };
      document.getElementById('autoTimeSel').onchange = (e) => {
        Store.setSettings({ autoTime: e.target.value });
        this.updateUserStatus();
        this.toast('已更新');
      };
      document.getElementById('exportBtn').onclick = () => {
        const data = {
          tasks: Store.get('tasks', {}),
          topics: Store.get('topics', {}),
          topicsList: Store.getTopicsList(),
          inspiration: Store.getInspirations(),
          finance: Store.getFinances(),
          settings: Store.getSettings(),
          exportAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `个人工作台数据_${Store.today()}.json`;
        a.click();
        this.toast('已导出 ✓ 可发送到新设备');
      };

      // 导入数据
      const importFile = document.getElementById('importFile');
      document.getElementById('importBtn').onclick = () => {
        importFile.click();
      };
      importFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (confirm('确认导入数据？将覆盖当前所有数据。')) {
              if (data.tasks) Store.set('tasks', data.tasks);
              if (data.topics) Store.set('topics', data.topics);
              if (data.topicsList) Store.set('topicsList', data.topicsList);
              if (data.inspiration) Store.set('inspiration', data.inspiration);
              if (data.finance) Store.set('finance', data.finance);
              if (data.settings) Store.set('settings', data.settings);
              this.toast('导入成功 ✓ 2秒后刷新');
              setTimeout(() => location.reload(), 2000);
            }
          } catch (err) {
            this.toast('文件格式错误，请选择正确的备份文件');
          }
        };
        reader.readAsText(file);
        // 重置 input 以便重复导入同一文件
        e.target.value = '';
      };

      document.getElementById('clearBtn').onclick = () => {
        if (confirm('确定清空所有数据？此操作不可恢复！')) {
          Object.keys(localStorage).filter(k => k.startsWith('workbench.')).forEach(k => localStorage.removeItem(k));
          this.toast('数据已清空，3秒后刷新');
          setTimeout(() => location.reload(), 1500);
        }
      };

      // 绑定云端同步按钮并刷新状态显示
      if (window.Sync) Sync.applyStatus();
    },

    toast(msg, duration = 1800) {
      const el = document.getElementById('toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(el._t);
      el._t = setTimeout(() => el.classList.remove('show'), duration);
    },

    // 重新渲染当前页（云端同步后刷新视图）
    refreshCurrent() {
      const page = this.currentPage;
      if (page && this.pages[page]) this.pages[page].render();
    }
  };

  window.App = App;
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
