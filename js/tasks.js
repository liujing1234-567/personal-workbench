// 每日计划模块
(function() {
  const Tasks = {
    state: {
      inputText: ''
    },

    render() {
      const today = Store.today();
      const tasks = Store.getTasks(today);
      const done = tasks.filter(t => t.done).length;
      const total = tasks.length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;

      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const dateObj = new Date();
      const dateLabel = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日 ${weekdays[dateObj.getDay()]}`;

      const html = `
        <div class="page">
          <div class="page-header">
            <div>
              <div class="page-title">📋 今日任务</div>
              <div class="page-sub">${dateLabel}</div>
            </div>
          </div>

          <div class="card progress-card">
            <div class="progress-info">
              <div class="progress-title">今日完成率</div>
              <div class="progress-num">${done}<span> / ${total}</span></div>
            </div>
            <div class="progress-ring">
              <svg viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="5"/>
                <circle cx="30" cy="30" r="26" fill="none" stroke="#FFFFFF" stroke-width="5"
                  stroke-dasharray="${2 * Math.PI * 26}"
                  stroke-dashoffset="${2 * Math.PI * 26 * (1 - rate / 100)}"
                  stroke-linecap="round"/>
              </svg>
              <div class="progress-ring-text">${rate}%</div>
            </div>
          </div>

          <div class="task-add-row">
            <input type="text" class="input" id="taskInput" placeholder="添加新任务，按 Enter 保存..." />
            <button class="btn btn-primary" id="taskAddBtn">+ 新增</button>
          </div>

          <div class="card" id="taskList">
            ${tasks.length === 0 ? this.renderEmpty() : this.renderList(tasks)}
          </div>
        </div>
      `;

      document.getElementById('app').innerHTML = html;
      this.bind();
    },

    renderEmpty() {
      return `
        <div class="empty">
          <div class="empty-icon">📝</div>
          <div>今日还没有任务</div>
          <div style="font-size:12px; margin-top:6px; color:var(--text-mute)">在上方添加你的第一条任务吧</div>
        </div>
      `;
    },

    renderList(tasks) {
      return tasks.map(t => `
        <div class="task-item ${t.done ? 'done' : ''}" data-id="${t.id}">
          <div class="task-check ${t.done ? 'checked' : ''}" data-action="toggle"></div>
          <div class="task-text">${this.escape(t.text)}</div>
          <div class="task-delete" data-action="delete" aria-label="删除">×</div>
        </div>
      `).join('');
    },

    bind() {
      const input = document.getElementById('taskInput');
      const addBtn = document.getElementById('taskAddBtn');
      const list = document.getElementById('taskList');

      const add = () => {
        const v = input.value.trim();
        if (!v) {
          App.toast('请输入任务内容');
          return;
        }
        Store.addTask(Store.today(), v);
        input.value = '';
        this.render();
        App.toast('已添加 ✓');
      };

      addBtn.onclick = add;
      input.onkeydown = (e) => {
        if (e.key === 'Enter') add();
      };

      list.onclick = (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        const id = item.dataset.id;
        const action = e.target.dataset.action;
        if (action === 'toggle') {
          Store.toggleTask(Store.today(), id);
          this.render();
        } else if (action === 'delete') {
          if (confirm('确认删除这条任务？')) {
            Store.deleteTask(Store.today(), id);
            this.render();
            App.toast('已删除');
          }
        }
      };
    },

    escape(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
  };

  window.Tasks = Tasks;
})();