// 选题来源模块
(function() {
  const Topics = {
    state: {
      category: 'dy-beauty'
    },

    // 赛道对应的平台
    catPlatform: {
      'dy-beauty': 'douyin',
      'xhs-beauty': 'xhs',
      'xhs-home': 'xhs',
      'xhs-growth': 'xhs'
    },

    render() {
      const topics = Store.getTopics();
      const cats = Object.keys(topics);
      const platform = this.catPlatform[this.state.category] || 'xhs';
      const openBtnText = platform === 'douyin' ? '▶ 去抖音看' : '▶ 复制去小红书看';

      const tabsHtml = cats.map(c => `
        <button class="tab ${c === this.state.category ? 'active' : ''}" data-cat="${c}">
          ${topics[c].icon} ${topics[c].name.replace(/^(抖音|小红书)/, '')}
        </button>
      `).join('');

      const listHtml = (topics[this.state.category]?.items || []).map(item => `
        <div class="topic-card">
          <div class="topic-title">
            <span>🔥 ${this.escape(item.title)}</span>
            <span class="tag">${this.escape(item.tag)}</span>
          </div>
          <div class="topic-data">
            <span class="data-likes">❤️ ${this.escape(item.likes)} 赞</span>
            <span class="data-date">${this.escape(item.date)}</span>
            <span class="data-source">来源：${this.escape(item.source)}</span>
          </div>
          <div class="topic-hotwords">
            ${item.hotWords ? item.hotWords.map(w => `<span class="hotword">#${this.escape(w)}</span>`).join('') : ''}
          </div>
          <div class="topic-desc"><strong>📈 爆文数据方向：</strong>${this.escape(item.reason)}</div>
          <div class="topic-desc"><strong>🎬 二创角度：</strong>${this.escape(item.angle)}</div>
          <div class="topic-actions">
            <button class="btn btn-primary btn-sm" data-action="open" data-id="${item.id}">${openBtnText}</button>
            <button class="btn btn-outline btn-sm" data-action="task" data-id="${item.id}">+ 加入今日任务</button>
            <button class="btn btn-outline btn-sm" data-action="inspire" data-id="${item.id}">★ 存为灵感</button>
          </div>
        </div>
      `).join('');

      const html = `
        <div class="page">
          <div class="page-header">
            <div>
              <div class="page-title">💡 选题来源</div>
              <div class="page-sub">每日爆文 · 千赞万赞真实笔记 · 可二创翻拍</div>
            </div>
          </div>

          <div class="tabs" id="topicTabs">${tabsHtml}</div>

          <div class="refresh-row">
            <button class="btn btn-outline btn-sm" id="refreshBtn">🔄 换一批</button>
          </div>

          <div id="topicList">
            ${listHtml || '<div class="empty"><div class="empty-icon">💡</div><div>暂无选题</div></div>'}
          </div>
        </div>
      `;

      document.getElementById('app').innerHTML = html;
      this.bind();
    },

    bind() {
      const tabs = document.getElementById('topicTabs');
      tabs.onclick = (e) => {
        const t = e.target.closest('.tab');
        if (!t) return;
        this.state.category = t.dataset.cat;
        this.render();
      };

      document.getElementById('refreshBtn').onclick = () => {
        Store.refreshTopics(this.state.category);
        this.render();
        App.toast('已换一批 ✨');
      };

      const list = document.getElementById('topicList');
      list.onclick = (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const topics = Store.getTopics();
        const item = (topics[this.state.category]?.items || []).find(i => i.id === id);
        if (!item) return;

        const platform = this.catPlatform[this.state.category] || 'xhs';

        if (action === 'open') {
          // 复制笔记标题到剪贴板
          if (navigator.clipboard) {
            navigator.clipboard.writeText(item.title).catch(() => {});
          }
          // 如果有真实链接，直接打开
          if (item.url) {
            App.toast(platform === 'douyin' ? '已复制标题，正在打开抖音...' : '已复制标题，正在打开小红书...');
            setTimeout(() => window.open(item.url, '_blank'), 600);
          } else {
            App.toast(platform === 'douyin' ? '已复制标题，打开抖音搜索即可' : '已复制标题，打开小红书搜索即可');
          }
        } else if (action === 'task') {
          Store.addTask(Store.today(), `📹 翻拍：${item.title}`);
          App.toast('已加入今日任务 ✓');
        } else if (action === 'inspire') {
          Store.addInspiration(
            `[${item.tag}] ${item.title}\n二创角度：${item.angle}`,
            this.state.category
          );
          App.toast('已存为灵感 🔖');
        }
      };
    },

    escape(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
  };

  window.Topics = Topics;
})();