// 云端同步模块：把数据自动读写到 GitHub 仓库的 data/sync.json
// 策略：按 key 的「末写获胜（LWW）」——每个 key 带时间戳，谁的时间新谁赢，删除也会带上新时间戳。
(function() {
  const Sync = {
    cfg: null,
    meta: {},            // { key: ts } 当前持有值的时间戳（本地或远程）
    pending: new Set(),  // 待上传的 key
    uploading: false,
    timer: null,
    suppress: false,     // 应用远程数据时抑制本地变更钩子
    ready: false,

    // 需要同步的数据键（均为 Store 中用户数据，不含种子 topics）
    SYNC_KEYS: ['tasks', 'poolTopics', 'topicGenHistory', 'inspiration', 'finance', 'topicsList', 'settings'],
    META_KEY: '_syncMeta',

    init() {
      this.cfg = (window.APP_CONFIG && window.APP_CONFIG.github) || null;
      this.meta = Store.get(this.META_KEY, {}) || {};
      // Token 优先用 localStorage 中用户配置的（不写死在代码里，避免泄露被 GitHub 拦截）
      if (this.cfg && !this.cfg.token) {
        const saved = localStorage.getItem('workbench.syncToken') || '';
        if (saved) this.cfg.token = saved;
      }
      if (!this.cfg || !this.cfg.token) {
        console.warn('[Sync] 未配置 token，云端同步已禁用');
        this.lastStatus = 'no-token';
        return;
      }
      this.ready = true;
      this.bindUI();
      // 启动即拉取远程并合并；随后把本地已有数据推上去（首次建立基准）
      this.download().then(() => {
        this.scheduleUpload(800);
      });
      // 后台定时拉取，保证多设备接近实时
      setInterval(() => this.download(), 45000);
      // 离开页面前尝试补传
      window.addEventListener('beforeunload', () => {
        if (this.pending.size) this.upload();
      });
    },

    // ---- 本地变更钩子（由 Store.set 调用）----
    onLocalChange(key) {
      if (!this.ready || this.suppress) return;
      if (!this.SYNC_KEYS.includes(key)) return;
      this.meta[key] = Date.now();
      Store.set(this.META_KEY, this.meta);
      this.pending.add(key);
      this.scheduleUpload(2500);
    },

    scheduleUpload(delay) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.upload(), delay || 2500);
    },

    apiUrl() {
      const c = this.cfg;
      return `https://api.github.com/repos/${c.owner}/${c.repo}/contents/${c.syncPath}?ref=${c.syncBranch}`;
    },

    headers(extra) {
      return Object.assign({
        'Authorization': 'Bearer ' + this.cfg.token,
        'Accept': 'application/vnd.github+json'
      }, extra || {});
    },

    // ---- 拉取远程并合并 ----
    async download() {
      if (!this.ready) return;
      try {
        this.setStatus('syncing');
        const res = await fetch(this.apiUrl(), { headers: this.headers() });
        if (res.status === 404) { this.setStatus('idle'); return; }
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const raw = atob((json.content || '').replace(/\s/g, ''));
        const content = JSON.parse(decodeURIComponent(escape(raw)));
        const keys = (content && content.keys) || {};
        let applied = 0;
        this.suppress = true;
        for (const fullKey of Object.keys(keys)) {
          const storeKey = fullKey.replace(/^workbench\./, '');
          const remoteTs = keys[fullKey].ts || 0;
          const localTs = this.meta[storeKey] || 0;
          if (remoteTs > localTs) {
            Store.set(storeKey, keys[fullKey].data);
            this.meta[storeKey] = remoteTs;
            applied++;
          }
        }
        this.suppress = false;
        Store.set(this.META_KEY, this.meta);
        this.setStatus('synced');
        if (applied > 0) {
          if (window.App && App.toast) App.toast('已从云端同步 ' + applied + ' 项数据 ☁️');
          if (window.App && App.refreshCurrent) App.refreshCurrent();
        }
      } catch (e) {
        console.warn('[Sync] 下载失败', e);
        this.setStatus('error');
      }
    },

    // ---- 确保同步分支存在（首次使用时自动从 main 创建）----
    async ensureBranch() {
      if (this.branchReady) return;
      const c = this.cfg;
      try {
        const r = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}/git/refs/heads/main`, { headers: this.headers() });
        if (!r.ok) return;
        const sha = (await r.json()).object.sha;
        const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}/git/refs`, {
          method: 'POST',
          headers: this.headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ ref: 'refs/heads/' + c.syncBranch, sha: sha })
        });
        if (res.ok || res.status === 422 || res.status === 409) this.branchReady = true;
      } catch (e) {
        console.warn('[Sync] ensureBranch failed', e);
      }
    },

    // ---- 上传本地快照 ----
    async upload() {
      if (!this.ready || this.uploading) return;
      if (this.pending.size === 0) return;
      await this.ensureBranch();
      this.uploading = true;
      this.setStatus('syncing');
      try {
        const c = this.cfg;
        const keysPayload = {};
        for (const k of this.SYNC_KEYS) {
          const data = Store.get(k, null);
          if (data === null) continue;
          keysPayload['workbench.' + k] = { ts: this.meta[k] || Date.now(), data: data };
        }
        const body = JSON.stringify({ v: 1, updatedAt: Date.now(), keys: keysPayload });
        const content = btoa(unescape(encodeURIComponent(body)));

        // 取 sha（存在则更新，不存在则新建）
        let sha = null;
        const head = await fetch(this.apiUrl(), { headers: this.headers() });
        if (head.ok) { const hj = await head.json(); sha = hj.sha; }

        const putBody = { message: 'sync: ' + new Date().toISOString(), content: content, branch: this.cfg.syncBranch };
        if (sha) putBody.sha = sha;
        const res = await fetch(this.apiUrl(), {
          method: 'PUT',
          headers: this.headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(putBody)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        this.pending.clear();
        this.setStatus('synced');
      } catch (e) {
        console.warn('[Sync] 上传失败', e);
        this.setStatus('error');
      } finally {
        this.uploading = false;
      }
    },

    // ---- UI ----
    bindUI() {
      const btn = document.getElementById('syncNowBtn');
      if (btn) btn.onclick = () => { this.scheduleUpload(0); App.toast('正在同步…'); };
      const cfgBtn = document.getElementById('syncCfgBtn');
      if (cfgBtn) cfgBtn.onclick = () => {
        const t = prompt('粘贴你的 GitHub Token（仅限本仓库、Contents: Read and write 的 Fine-grained PAT）：', '');
        if (t && t.trim()) {
          this.cfg.token = t.trim();
          window.APP_CONFIG.github.token = t.trim();
          localStorage.setItem('workbench.syncToken', t.trim());   // 持久化到本机，刷新后无需重填
          this.ready = true;
          this.download().then(() => this.scheduleUpload(500));
          App.toast('Token 已保存，开始同步');
          this.applyStatus();
        }
      };
    },

    setStatus(s) {
      this.lastStatus = s;
      const el = document.getElementById('syncStatus');
      if (!el) return;
      const map = { syncing: '☁️ 同步中…', synced: '✅ 已同步', error: '⚠️ 同步失败（检查网络/Token）', idle: '○ 未同步', 'no-token': '🔑 需在设置里配置 Token' };
      el.textContent = map[s] || '';
      el.dataset.status = s;
    },

    // 设置页渲染后重新绑定按钮并刷新状态显示
    applyStatus() {
      this.bindUI();
      if (this.lastStatus) this.setStatus(this.lastStatus);
    }
  };

  window.Sync = Sync;
})();
