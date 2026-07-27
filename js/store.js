// localStorage 数据管理
(function() {
  const KEY_PREFIX = 'workbench.';

  const Store = {
    // 通用获取
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(KEY_PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        console.warn('Store.get error:', key, e);
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('Store.set error:', key, e);
        return false;
      }
    },

    remove(key) {
      localStorage.removeItem(KEY_PREFIX + key);
    },

    // 生成 ID
    uid() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    // 今天日期 YYYY-MM-DD
    today() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },

    // 当前月份 YYYY-MM
    month() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    },

    // 友好显示日期
    fmtDate(date) {
      const d = new Date(date);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${m}-${day}`;
    },

    fmtTime(ts) {
      const d = new Date(ts);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${m}-${day} ${h}:${min}`;
    },

    // ===========================
    // 任务管理
    // ===========================
    getTasks(date) {
      const all = this.get('tasks', {});
      return all[date] || [];
    },

    setTasks(date, tasks) {
      const all = this.get('tasks', {});
      all[date] = tasks;
      this.set('tasks', all);
    },

    addTask(date, text) {
      const tasks = this.getTasks(date);
      tasks.push({
        id: this.uid(),
        text: text.trim(),
        done: false,
        createdAt: Date.now()
      });
      this.setTasks(date, tasks);
      return tasks;
    },

    toggleTask(date, id) {
      const tasks = this.getTasks(date);
      const idx = tasks.findIndex(t => t.id === id);
      if (idx >= 0) {
        tasks[idx].done = !tasks[idx].done;
        this.setTasks(date, tasks);
      }
      return tasks;
    },

    deleteTask(date, id) {
      const tasks = this.getTasks(date).filter(t => t.id !== id);
      this.setTasks(date, tasks);
      return tasks;
    },

    // ===========================
    // 选题库
    // ===========================
    getTopics() {
      const SEED_VERSION = 'v2'; // 每次更新种子数据时递增
      const stored = this.get('topics');
      const storedVer = this.get('topicsVersion');
      if (!stored || storedVer !== SEED_VERSION) {
        this.set('topics', window.SEED_TOPICS);
        this.set('topicsVersion', SEED_VERSION);
      }
      return this.get('topics');
    },

    refreshTopics(category) {
      // 模拟「换一批」：在原数组上重新打乱顺序并加上刷新时间
      const topics = this.getTopics();
      if (topics[category]) {
        const items = topics[category].items;
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [items[i], items[j]] = [items[j], items[i]];
        }
        items.unshift({
          id: this.uid(),
          title: `[新] ${['手势舞 0 基础挑战','氛围感美女 1 秒换装','夏日清凉感妆容','30 元改造 ins 桌搭'][Math.floor(Math.random() * 4)]}`,
          tag: ['化妆','穿搭','搞笑','家居'][Math.floor(Math.random() * 4)],
          date: this.today(),
          source: 'AI 推荐',
          reason: '基于本周热点趋势实时推荐，建议尽快翻拍/二创。',
          angle: '可在原视频基础上加入「楚楚版」个人特色，强化颜值/反差标签。'
        });
        this.set('topics', topics);
      }
      return topics[category]?.items || [];
    },

    // ===========================
    // 选题池
    // ===========================
    getPoolTopics() {
      return this.get('poolTopics', []);
    },

    addPoolTopic({ text, category, priority = 2 }) {
      const list = this.getPoolTopics();
      list.unshift({
        id: this.uid(),
        text: text.trim(),
        category,
        priority,
        done: false,
        createdAt: Date.now()
      });
      this.set('poolTopics', list);
      return list;
    },

    togglePoolTopic(id) {
      const list = this.getPoolTopics();
      const idx = list.findIndex(t => t.id === id);
      if (idx >= 0) {
        list[idx].done = !list[idx].done;
        this.set('poolTopics', list);
      }
      return list;
    },

    deletePoolTopic(id) {
      const list = this.getPoolTopics().filter(t => t.id !== id);
      this.set('poolTopics', list);
      return list;
    },

    // 选题生成历史（避免重复生成）
    getGeneratedHistory() {
      return this.get('topicGenHistory', {});
    },

    addGeneratedHistory(category, texts) {
      const history = this.getGeneratedHistory();
      if (!history[category]) history[category] = [];
      const existing = new Set(history[category]);
      texts.forEach(t => existing.add(t));
      history[category] = Array.from(existing);
      // 限制历史长度，避免无限增长
      if (history[category].length > 200) {
        history[category] = history[category].slice(-200);
      }
      this.set('topicGenHistory', history);
      return history[category];
    },

    clearGeneratedHistory() {
      this.set('topicGenHistory', {});
    },

    // ===========================
    // 灵感记录
    // ===========================
    getInspirations() {
      if (!this.get('inspiration')) {
        this.set('inspiration', window.SEED_INSPIRATION);
      }
      return this.get('inspiration') || [];
    },

    addInspiration(text, category = 'dy-beauty') {
      const list = this.getInspirations();
      list.unshift({
        id: this.uid(),
        text: text.trim(),
        category,
        time: Date.now()
      });
      this.set('inspiration', list);
      return list;
    },

    updateInspiration(id, text) {
      const list = this.getInspirations();
      const idx = list.findIndex(i => i.id === id);
      if (idx >= 0) {
        list[idx].text = text.trim();
        list[idx].updatedAt = Date.now();
        this.set('inspiration', list);
      }
      return list;
    },

    deleteInspiration(id) {
      const list = this.getInspirations().filter(i => i.id !== id);
      this.set('inspiration', list);
      return list;
    },

    getWeekInspirations() {
      const now = Date.now();
      const weekAgo = now - 7 * 86400000;
      return this.getInspirations().filter(i => i.time >= weekAgo);
    },

    // ===========================
    // 选题汇总（每个标签独立，用户自行编辑维护）
    // ===========================
    getTopicsList() {
      if (!this.get('topicsList')) {
        this.set('topicsList', {});
      }
      return this.get('topicsList') || {};
    },

    getTopicsByCat(cat) {
      const all = this.getTopicsList();
      return all[cat] || [];
    },

    addTopicItem(cat, text) {
      const all = this.getTopicsList();
      if (!all[cat]) all[cat] = [];
      all[cat].unshift({
        id: this.uid(),
        text: text.trim(),
        done: false,
        createdAt: Date.now()
      });
      this.set('topicsList', all);
      return all[cat];
    },

    toggleTopicItem(cat, id) {
      const all = this.getTopicsList();
      if (!all[cat]) return;
      const idx = all[cat].findIndex(t => t.id === id);
      if (idx >= 0) {
        all[cat][idx].done = !all[cat][idx].done;
        this.set('topicsList', all);
      }
      return all[cat];
    },

    updateTopicItem(cat, id, text) {
      const all = this.getTopicsList();
      if (!all[cat]) return;
      const idx = all[cat].findIndex(t => t.id === id);
      if (idx >= 0) {
        all[cat][idx].text = text.trim();
        this.set('topicsList', all);
      }
      return all[cat];
    },

    deleteTopicItem(cat, id) {
      const all = this.getTopicsList();
      if (!all[cat]) return;
      all[cat] = all[cat].filter(t => t.id !== id);
      this.set('topicsList', all);
      return all[cat];
    },

    // ===========================
    // 记账本
    // ===========================
    getFinances() {
      if (!this.get('finance')) {
        this.set('finance', []);
      }
      return this.get('finance') || [];
    },

    addFinance(record) {
      const list = this.getFinances();
      list.unshift({
        id: this.uid(),
        ...record,
        time: Date.now()
      });
      this.set('finance', list);
      return list;
    },

    updateFinance(id, record) {
      const list = this.getFinances();
      const idx = list.findIndex(f => f.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...record };
        this.set('finance', list);
      }
      return list;
    },

    deleteFinance(id) {
      const list = this.getFinances().filter(f => f.id !== id);
      this.set('finance', list);
      return list;
    },

    getMonthStats() {
      const m = this.month();
      const list = this.getFinances().filter(f => f.date && f.date.startsWith(m));
      const total = list.reduce((sum, f) => sum + Number(f.amount || 0), 0);
      // 合作数只算小红书和抖音，不算「其他」
      const coopList = list.filter(f => f.platform === 'xhs' || f.platform === 'dy');
      const count = coopList.length;
      const platforms = { xhs: 0, dy: 0, other: 0 };
      list.forEach(f => { if (platforms[f.platform] !== undefined) platforms[f.platform]++; });
      return { total, count, list, platforms };
    },

    // 按指定月份统计（YYYY-MM）
    getMonthStatsBy(monthStr) {
      const list = this.getFinances().filter(f => f.date && f.date.startsWith(monthStr));
      // 按平台排序：抖音 > 小红书 > 其他
      const order = { 'dy': 0, 'xhs': 1, 'other': 2 };
      list.sort((a, b) => (order[a.platform] ?? 3) - (order[b.platform] ?? 3));
      const total = list.reduce((sum, f) => sum + Number(f.amount || 0), 0);
      const count = list.length;
      return { total, count, list };
    },

    // 年度统计
    getYearStats() {
      const y = String(new Date().getFullYear());
      const list = this.getFinances().filter(f => f.date && f.date.startsWith(y));
      const total = list.reduce((sum, f) => sum + Number(f.amount || 0), 0);
      const count = list.length;

      // 按月分组
      const monthly = {};
      for (let i = 1; i <= 12; i++) {
        const mm = `${y}-${String(i).padStart(2, '0')}`;
        monthly[mm] = 0;
      }
      list.forEach(f => {
        const m = f.date.slice(0, 7);
        if (monthly[m] !== undefined) monthly[m] += Number(f.amount || 0);
      });

      return { total, count, list, monthly };
    },

    // ===========================
    // 设置
    // ===========================
    getSettings() {
      return this.get('settings', { status: '复更中', autoTime: '09:00' });
    },

    setSettings(settings) {
      this.set('settings', { ...this.getSettings(), ...settings });
    }
  };

  window.Store = Store;
})();