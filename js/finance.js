// 小富婆金库收入模块
(function() {
  const Finance = {
    state: {
      showForm: false,
      editingId: null,        // 正在编辑的记录 ID
      expandedMonth: null
    },

    platformLabels: {
      'xhs': { name: '小红书', cls: 'xhs' },
      'dy': { name: '抖音', cls: 'dy' },
      'other': { name: '其他', cls: 'other' }
    },

    render() {
      const stats = Store.getMonthStats();
      const yearStats = Store.getYearStats();
      const m = Store.month();
      const y = new Date().getFullYear();
      const list = stats.list;

      // 生成全年 12 个月每月收入行
      const monthlyRows = [];
      for (let i = 1; i <= 12; i++) {
        const mm = `${y}-${String(i).padStart(2, '0')}`;
        const ms = Store.getMonthStatsBy(mm);
        monthlyRows.push({ month: mm, total: ms.total, count: ms.count, current: mm === m, items: ms.list });
      }
      const maxTotal = Math.max(1, ...monthlyRows.map(r => r.total));

      const monthlyHtml = monthlyRows.length === 0
        ? `<div class="empty" style="padding:20px;"><div class="empty-icon">📈</div><div>暂无历史月份收入</div></div>`
        : monthlyRows.map(r => this.renderMonthRow(r, maxTotal)).join('');

      const currentMonthVal = Store.month();
      const formTitle = this.state.editingId ? '✏️ 修改收入记录' : '➕ 新增收入记录';

      const html = `
        <div class="page">
          <div class="page-header">
            <div>
              <div class="page-title">💰 小富婆金库收入</div>
              <div class="page-sub">${y} 年 · ${m} 本月</div>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-card big">
              <div class="stat-num">¥ ${stats.total.toLocaleString()}</div>
              <div class="stat-label">本月总收入</div>
            </div>
            <div class="stat-card big year-card">
              <div class="stat-num">¥ ${yearStats.total.toLocaleString()}</div>
              <div class="stat-label">${y} 年度总收入 · ${yearStats.count} 笔</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">${stats.count}</div>
              <div class="stat-label">本月合作数</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">${stats.platforms.xhs}</div>
              <div class="stat-label">小红书</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">${stats.platforms.dy}</div>
              <div class="stat-label">抖音</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">${stats.platforms.other || 0}</div>
              <div class="stat-label">其他</div>
            </div>
          </div>

          <div class="card" style="padding:12px 16px;">
            <div class="finance-list-title" style="margin-bottom:8px;">📊 每月收入汇总（${y} 年，点击查看明细）</div>
            <div id="monthlyList">${monthlyHtml}</div>
          </div>

          <div class="finance-form" id="financeForm" style="display:${this.state.showForm ? 'block' : 'none'};">
            <div class="finance-form-title">${formTitle}</div>
            <div class="field">
              <label class="field-label">产品 / 项目名称</label>
              <input type="text" class="input" id="recName" placeholder="例：某品牌植入 / 商品种草" />
            </div>
            <div class="field">
              <label class="field-label">合作平台</label>
              <select class="select" id="recPlatform">
                <option value="xhs">小红书</option>
                <option value="dy">抖音</option>
                <option value="other">其他（计入总收入，不计合作数）</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">收入金额（元）</label>
              <input type="number" class="input" id="recAmount" placeholder="0" min="0" step="0.01" />
            </div>
            <div class="field">
              <label class="field-label">所属月份</label>
              <input type="month" class="input" id="recMonth" value="${currentMonthVal}" />
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-primary btn-block" id="saveBtn">${this.state.editingId ? '保存修改' : '保存记录'}</button>
              <button class="btn btn-ghost" id="cancelBtn">取消</button>
            </div>
          </div>

          <button class="btn btn-primary btn-block" id="toggleBtn" style="${this.state.showForm ? 'display:none;' : ''}">
            + 新增收入记录
          </button>

          <div style="margin-top: 16px;">
            <div class="finance-list-title">📋 本月明细（${list.length}）</div>
            <div id="financeList">
              ${list.length === 0 ? `
                <div class="empty">
                  <div class="empty-icon">💸</div>
                  <div>本月还没有收入记录</div>
                </div>
              ` : this.renderList(list)}
            </div>
          </div>
        </div>
      `;

      document.getElementById('app').innerHTML = html;
      this.bind();
    },

    renderMonthRow(r, maxTotal) {
      const isExpanded = this.state.expandedMonth === r.month;
      const hasItems = r.count > 0;
      return `
        <div class="monthly-block ${r.current ? 'current' : ''}">
          <div class="monthly-row ${isExpanded ? 'expanded' : ''}" data-month="${r.month}">
            <span class="monthly-toggle">${isExpanded ? '▼' : '▶'}</span>
            <span class="monthly-label">${r.month}</span>
            <span class="monthly-count">${r.count} 笔</span>
            <span class="monthly-bar-wrap"><span class="monthly-bar" style="width:${Math.round(r.total / maxTotal * 100)}%"></span></span>
            <span class="monthly-amount">¥${r.total.toLocaleString()}</span>
          </div>
          ${isExpanded && hasItems ? `
            <div class="monthly-detail">
              ${r.items.map(f => this.renderDetailItem(f)).join('')}
            </div>
          ` : ''}
          ${isExpanded && !hasItems ? `
            <div class="monthly-detail"><div class="monthly-empty">该月暂无记录</div></div>
          ` : ''}
        </div>
      `;
    },

    renderDetailItem(f) {
      const p = this.platformLabels[f.platform] || { name: f.platform, cls: '' };
      return `
        <div class="finance-item detail-item">
          <div class="finance-info">
            <div class="finance-name">${this.escape(f.name)}</div>
            <div class="finance-meta">
              <span class="platform-tag ${p.cls}">${p.name}</span>
            </div>
          </div>
          <div class="finance-amount">¥${Number(f.amount).toLocaleString()}</div>
          <button class="finance-edit" data-id="${f.id}" data-action="edit" aria-label="修改">✏️</button>
          <div class="finance-delete" data-id="${f.id}" data-action="delete" aria-label="删除">×</div>
        </div>
      `;
    },

    renderList(list) {
      return list.map(f => {
        const p = this.platformLabels[f.platform] || { name: f.platform, cls: '' };
        return `
          <div class="finance-item">
            <div class="finance-info">
              <div class="finance-name">${this.escape(f.name)}</div>
              <div class="finance-meta">
                <span class="platform-tag ${p.cls}">${p.name}</span>
              </div>
            </div>
            <div class="finance-amount">¥${Number(f.amount).toLocaleString()}</div>
            <button class="finance-edit" data-id="${f.id}" data-action="edit" aria-label="修改">✏️</button>
            <div class="finance-delete" data-id="${f.id}" data-action="delete" aria-label="删除">×</div>
          </div>
        `;
      }).join('');
    },

    bind() {
      const form = document.getElementById('financeForm');
      const toggleBtn = document.getElementById('toggleBtn');
      const saveBtn = document.getElementById('saveBtn');
      const cancelBtn = document.getElementById('cancelBtn');
      const list = document.getElementById('financeList');
      const monthlyList = document.getElementById('monthlyList');

      const showForm = () => {
        this.state.showForm = true;
        this.state.editingId = null;
        this.render();
        setTimeout(() => document.getElementById('recName').focus(), 100);
      };
      const hideForm = () => {
        this.state.showForm = false;
        this.state.editingId = null;
        this.render();
      };

      // 编辑：填充表单
      const startEdit = (id) => {
        const all = Store.getFinances();
        const item = all.find(f => f.id === id);
        if (!item) return;
        this.state.showForm = true;
        this.state.editingId = id;
        this.render();
        setTimeout(() => {
          document.getElementById('recName').value = item.name;
          document.getElementById('recPlatform').value = item.platform;
          document.getElementById('recAmount').value = item.amount;
          document.getElementById('recMonth').value = item.date;
          document.getElementById('recName').focus();
        }, 50);
      };

      toggleBtn.onclick = showForm;
      cancelBtn.onclick = hideForm;

      saveBtn.onclick = () => {
        const name = document.getElementById('recName').value.trim();
        const platform = document.getElementById('recPlatform').value;
        const amount = document.getElementById('recAmount').value;
        const monthVal = document.getElementById('recMonth').value;

        if (!name) return App.toast('请输入产品/项目名称');
        if (!amount || Number(amount) <= 0) return App.toast('请输入有效金额');
        if (!monthVal) return App.toast('请选择月份');

        if (this.state.editingId) {
          Store.updateFinance(this.state.editingId, { name, platform, amount: Number(amount), date: monthVal });
          App.toast('已修改 ✓');
        } else {
          Store.addFinance({ name, platform, amount: Number(amount), date: monthVal });
          App.toast('收入记录已添加 💰');
        }
        this.state.editingId = null;
        this.state.showForm = false;
        this.render();
      };

      // 本月明细操作
      list.onclick = (e) => {
        const editBtn = e.target.closest('[data-action="edit"]');
        const delBtn = e.target.closest('[data-action="delete"]');
        if (editBtn) {
          startEdit(editBtn.dataset.id);
        } else if (delBtn) {
          if (confirm('确认删除这条记录？')) {
            Store.deleteFinance(delBtn.dataset.id);
            this.render();
            App.toast('已删除');
          }
        }
      };

      // 每月汇总行：展开/收起 + 明细操作
      monthlyList.onclick = (e) => {
        const editBtn = e.target.closest('[data-action="edit"]');
        const delBtn = e.target.closest('[data-action="delete"]');
        if (editBtn) {
          startEdit(editBtn.dataset.id);
          return;
        }
        if (delBtn) {
          if (confirm('确认删除这条记录？')) {
            Store.deleteFinance(delBtn.dataset.id);
            this.render();
            App.toast('已删除');
          }
          return;
        }
        const row = e.target.closest('.monthly-row');
        if (!row) return;
        const month = row.dataset.month;
        this.state.expandedMonth = this.state.expandedMonth === month ? null : month;
        this.render();
      };
    },

    escape(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
  };

  window.Finance = Finance;
})();