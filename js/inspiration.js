// 灵感记录模块
(function() {
  const Inspiration = {
    state: {
      filter: 'dy-beauty',
      editingId: null,
      // 选题汇总编辑状态
      editingTopicId: null,
      showTopicInput: false
    },

    catLabels: {
      'dy-beauty': '🎵在下肥兔兔',
      'xhs-beauty': '📕在下肥兔兔',
      'xhs-home': '🏠长耳仔仔',
      'xhs-growth': '✨兔沫柔'
    },

    catColors: {
      'dy-beauty': 'tag',
      'xhs-beauty': 'tag-pink',
      'xhs-home': 'tag-blue',
      'xhs-growth': 'tag-warning'
    },

    render() {
      const list = Store.getInspirations();
      const filtered = list.filter(i => i.category === this.state.filter);
      const currentCatName = this.catLabels[this.state.filter];
      const currentCat = this.state.filter;

      // 选题汇总数据
      const topics = Store.getTopicsByCat(currentCat);
      const topicDone = topics.filter(t => t.done).length;
      const topicTotal = topics.length;

      const tabsHtml = Object.keys(this.catLabels).map(k => `
        <button class="tab ${k === this.state.filter ? 'active' : ''}" data-filter="${k}">${this.catLabels[k]}</button>
      `).join('');

      const html = `
        <div class="page">
          <div class="page-header">
            <div>
              <div class="page-title">🔥 灵感记录</div>
              <div class="page-sub">${currentCatName} · 本标签共 ${filtered.length} 条灵感</div>
            </div>
          </div>

          <div class="voice-row">
            <button class="voice-btn" id="voiceBtn">🎤 语音录入</button>
            <button class="btn btn-primary" id="textAddBtn" style="flex: 1;">+ 新增文字</button>
          </div>

          <div class="field" id="textAreaWrap" style="display:none;">
            <div class="input-hint">
              正在记录到：<strong>${currentCatName}</strong>
            </div>
            <textarea class="textarea" id="textInput" placeholder="记录当下的灵感/选题想法...
用 **包围文字** 可以加粗，如 **重点金句**" style="margin-top:8px;"></textarea>
            <div class="edit-toolbar">
              <button class="tool-btn" id="boldBtn" title="加粗选中文字"><b>B</b> 加粗</button>
            </div>
            <div style="display:flex; gap:8px; margin-top:8px;">
              <button class="btn btn-primary btn-block" id="saveTextBtn">保存灵感</button>
              <button class="btn btn-ghost" id="cancelTextBtn">取消</button>
            </div>
          </div>

          <div class="tabs" id="inspireTabs">${tabsHtml}</div>

          <!-- 选题汇总区块 -->
          <div class="card topic-summary-card">
            <div class="topic-summary-header">
              <div>
                <div class="topic-summary-title">📋 ${currentCatName} 选题汇总</div>
                <div class="topic-summary-sub">已完成 ${topicDone} / ${topicTotal}</div>
              </div>
              <div class="topic-summary-bar-wrap">
                <div class="topic-summary-bar" style="width:${topicTotal > 0 ? Math.round(topicDone / topicTotal * 100) : 0}%"></div>
              </div>
            </div>

            <div class="topic-add-row">
              <input type="text" class="input" id="topicInput" placeholder="添加选题，如「伪素颜通勤妆图文笔记」" />
              <button class="btn btn-primary btn-sm" id="topicAddBtn">+ 添加</button>
            </div>

            <div id="topicList">
              ${topics.length === 0 ? `
                <div class="topic-empty">还没有选题，在上方添加你的第一个选题</div>
              ` : topics.map(t => this.renderTopicItem(t, currentCat)).join('')}
            </div>
          </div>

          <!-- 灵感列表 -->
          <div class="section-title" style="margin: 16px 0 8px;">💡 灵感记录</div>
          <div id="inspireList">
            ${filtered.length === 0 ? this.renderEmpty() : this.renderList(filtered)}
          </div>
        </div>
      `;

      document.getElementById('app').innerHTML = html;
      this.bind();
    },

    renderTopicItem(t, cat) {
      const isEditing = this.state.editingTopicId === t.id;
      if (isEditing) {
        return `
          <div class="topic-item editing" data-id="${t.id}">
            <input type="text" class="input topic-edit-input" id="topicEditInput" value="${this.escapeAttr(t.text)}" />
            <button class="btn btn-primary btn-sm" data-action="topic-save" data-id="${t.id}">保存</button>
            <button class="btn btn-ghost btn-sm" data-action="topic-cancel">取消</button>
          </div>
        `;
      }
      return `
        <div class="topic-item ${t.done ? 'done' : ''}" data-id="${t.id}">
          <div class="topic-check ${t.done ? 'checked' : ''}" data-action="topic-toggle" data-id="${t.id}"></div>
          <div class="topic-text">${this.renderText(t.text)}</div>
          <button class="topic-edit-btn" data-action="topic-edit" data-id="${t.id}" aria-label="修改">✏️</button>
          <button class="topic-del-btn" data-action="topic-delete" data-id="${t.id}" aria-label="删除">×</button>
        </div>
      `;
    },

    renderEmpty() {
      return `
        <div class="empty">
          <div class="empty-icon">🌟</div>
          <div>${this.catLabels[this.state.filter]} 还没有灵感</div>
          <div style="font-size:12px; margin-top:6px; color:var(--text-mute)">点击上方按钮，灵感会自动保存到这个标签</div>
        </div>
      `;
    },

    renderText(text) {
      const escaped = this.escape(text);
      return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    },

    renderList(list) {
      return list.map(i => {
        const catName = this.catLabels[i.category] || '🎵在下肥兔兔';
        const catColor = this.catColors[i.category] || 'tag';
        const updated = i.updatedAt ? ` · 编辑过` : '';
        return `
          <div class="inspiration-card">
            <div class="inspiration-actions">
              <button class="inspiration-edit" data-id="${i.id}" data-action="edit" aria-label="修改">✏️</button>
              <button class="inspiration-delete" data-id="${i.id}" data-action="delete" aria-label="删除">×</button>
            </div>
            <span class="tag ${catColor}">${catName}</span>
            <div class="inspiration-text">${this.renderText(i.text)}</div>
            <div class="inspiration-meta">
              <span>🕒 ${Store.fmtTime(i.time)}${updated}</span>
            </div>
          </div>
        `;
      }).join('');
    },

    bind() {
      const voiceBtn = document.getElementById('voiceBtn');
      const textAddBtn = document.getElementById('textAddBtn');
      const textAreaWrap = document.getElementById('textAreaWrap');
      const textInput = document.getElementById('textInput');
      const saveTextBtn = document.getElementById('saveTextBtn');
      const cancelTextBtn = document.getElementById('cancelTextBtn');
      const boldBtn = document.getElementById('boldBtn');
      const tabs = document.getElementById('inspireTabs');
      const inspireList = document.getElementById('inspireList');

      // === 灵感录入 ===
      textAddBtn.onclick = () => {
        this.state.editingId = null;
        const show = textAreaWrap.style.display === 'none';
        textAreaWrap.style.display = show ? 'block' : 'none';
        if (show) {
          textInput.value = '';
          saveTextBtn.textContent = '保存灵感';
          setTimeout(() => textInput.focus(), 50);
        }
      };

      cancelTextBtn.onclick = () => {
        textAreaWrap.style.display = 'none';
        textInput.value = '';
        this.state.editingId = null;
      };

      saveTextBtn.onclick = () => {
        const v = textInput.value.trim();
        if (!v) { App.toast('请输入灵感内容'); return; }
        if (this.state.editingId) {
          Store.updateInspiration(this.state.editingId, v);
          this.state.editingId = null;
          App.toast('已修改 ✓');
        } else {
          Store.addInspiration(v, this.state.filter);
          App.toast('灵感已保存 ✨');
        }
        textInput.value = '';
        textAreaWrap.style.display = 'none';
        this.render();
      };

      boldBtn.onclick = () => {
        const start = textInput.selectionStart;
        const end = textInput.selectionEnd;
        const val = textInput.value;
        if (start === end) {
          textInput.value = val.slice(0, start) + '**加粗文字**' + val.slice(end);
          textInput.setSelectionRange(start + 2, start + 6);
        } else {
          const selected = val.slice(start, end);
          if (val.slice(start - 2, start) === '**' && val.slice(end, end + 2) === '**') {
            textInput.value = val.slice(0, start - 2) + selected + val.slice(end + 2);
            textInput.setSelectionRange(start - 2, end - 2);
          } else {
            textInput.value = val.slice(0, start) + '**' + selected + '**' + val.slice(end);
            textInput.setSelectionRange(start + 2, end + 2);
          }
        }
        textInput.focus();
      };

      voiceBtn.onclick = () => {
        if (Voice.isListening) {
          Voice.stop();
          voiceBtn.classList.remove('listening');
          voiceBtn.innerHTML = `🎤 语音录入`;
          return;
        }
        voiceBtn.classList.add('listening');
        voiceBtn.innerHTML = '🎙️ 正在聆听...';
        Voice.onResult = (text) => { textInput.value = text; };
        Voice.onEnd = (text) => {
          voiceBtn.classList.remove('listening');
          voiceBtn.innerHTML = `🎤 语音录入`;
          if (text && text.trim()) {
            textAreaWrap.style.display = 'block';
            textInput.value = text.trim();
            this.state.editingId = null;
            saveTextBtn.textContent = '保存灵感';
            App.toast('语音识别完成，可加粗重点后保存');
          }
        };
        Voice.onError = (msg) => {
          voiceBtn.classList.remove('listening');
          voiceBtn.innerHTML = `🎤 语音录入`;
          App.toast(msg);
        };
        Voice.start();
      };

      tabs.onclick = (e) => {
        const t = e.target.closest('.tab');
        if (!t) return;
        this.state.filter = t.dataset.filter;
        this.state.editingId = null;
        this.state.editingTopicId = null;
        this.render();
      };

      // 灵感列表操作
      inspireList.onclick = (e) => {
        const editBtn = e.target.closest('[data-action="edit"]');
        const delBtn = e.target.closest('[data-action="delete"]');
        if (delBtn) {
          if (confirm('确认删除这条灵感？')) {
            Store.deleteInspiration(delBtn.dataset.id);
            this.render();
            App.toast('已删除');
          }
        } else if (editBtn) {
          const id = editBtn.dataset.id;
          const item = Store.getInspirations().find(i => i.id === id);
          if (!item) return;
          this.state.editingId = id;
          textAreaWrap.style.display = 'block';
          textInput.value = item.text;
          saveTextBtn.textContent = '保存修改';
          textInput.focus();
          textAreaWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };

      // === 选题汇总操作 ===
      this.bindTopics();
    },

    bindTopics() {
      const cat = this.state.filter;
      const topicInput = document.getElementById('topicInput');
      const topicAddBtn = document.getElementById('topicAddBtn');
      const topicList = document.getElementById('topicList');

      const addTopic = () => {
        const v = topicInput.value.trim();
        if (!v) { App.toast('请输入选题内容'); return; }
        Store.addTopicItem(cat, v);
        topicInput.value = '';
        this.render();
        App.toast('选题已添加 ✓');
      };

      topicAddBtn.onclick = addTopic;
      topicInput.onkeydown = (e) => {
        if (e.key === 'Enter') addTopic();
      };

      topicList.onclick = (e) => {
        const el = e.target.closest('[data-action]');
        if (!el) return;
        const action = el.dataset.action;
        const id = el.dataset.id;

        if (action === 'topic-toggle') {
          Store.toggleTopicItem(cat, id);
          this.render();
        } else if (action === 'topic-delete') {
          if (confirm('确认删除这个选题？')) {
            Store.deleteTopicItem(cat, id);
            this.render();
            App.toast('已删除');
          }
        } else if (action === 'topic-edit') {
          this.state.editingTopicId = id;
          this.render();
          setTimeout(() => {
            const inp = document.getElementById('topicEditInput');
            if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
          }, 50);
        } else if (action === 'topic-save') {
          const inp = document.getElementById('topicEditInput');
          if (!inp) return;
          const v = inp.value.trim();
          if (!v) { App.toast('请输入选题内容'); return; }
          Store.updateTopicItem(cat, id, v);
          this.state.editingTopicId = null;
          this.render();
          App.toast('已修改 ✓');
        } else if (action === 'topic-cancel') {
          this.state.editingTopicId = null;
          this.render();
        }
      };
    },

    escape(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },

    escapeAttr(s) {
      return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  };

  window.Inspiration = Inspiration;
})();