// 选题池 - 选题灵感生成器
(function() {
  const Topics = {
    state: {
      activeCat: 'dy-beauty',
      generated: {}
    },

    // 四个方向定义（与灵感记录标签对应）
    categories: {
      'dy-beauty':  { name: '在下肥兔兔', icon: '🎵', desc: '抖音颜值手势舞' },
      'xhs-beauty': { name: '在下肥兔兔', icon: '📕', desc: '小红书颜值变美' },
      'xhs-home':   { name: '长耳仔仔',   icon: '🏠', desc: '家居博主' },
      'xhs-growth': { name: '兔沫柔',     icon: '✨', desc: '女性成长' }
    },

    // 2025年7月热点趋势库（按方向分类）
    hotTrends: {
      'dy-beauty': [
        '滤镜操控特效舞蹈挑战', 'ACAI拖拉机舞', '一面双相把情绪藏进面具里',
        '古早森系穿搭氛围感', '男装品牌闯入女装赛道', 'JYP舞台造型',
        '小猫吵着要拍百万运镜', '带对象看痴迷的后果belike',
        '这次出发不是找你是去找自由', '相信我们会像童话故事里'
      ],
      'xhs-beauty': [
        '夏日清凉感妆容', '伪素颜通勤妆', '薄荷曼波妆',
        '老破小改造前后对比', '月薪3千住进月租8千的loft',
        '95后女焊工人设', '从柜姐到年入50万的穿搭博主',
        '小个子穿搭逆袭', '职场妈妈时间管理',
        '摆烂2小时后逆袭', '月薪3k的奢侈品平替'
      ],
      'xhs-home': [
        '10平米梦想改造', '北漂女孩的小花园', '租房仪式感',
        '30元改造ins桌搭', '老破小改造', '小户型收纳神器',
        '一人居的治愈角落', '断舍离后的人生',
        '极简风家居好物', '百元打造氛围感卧室'
      ],
      'xhs-growth': [
        '当妈后消失的自我时间', '专升本失败后的重生',
        '被领导PUA后的逆袭', '副业收入超主业3倍',
        '考研失眠的解决方案', '3个月涨粉5万',
        '职场妈妈副业月入2W', '从月薪2K到2W的成长型上班族',
        '情绪管理心得', '30岁后才明白的道理'
      ]
    },

    // 选题模板（结合热点+灵感记录内容）
    templates: {
      'dy-beauty': [
        '跟着热点跳：{trend}｜手势舞教学版',
        '{trend}｜0基础也能学会',
        '当热点遇上颜值：{trend}氛围感版',
        '{trend}挑战｜谁跳谁好看',
        '翻拍{trend}｜加入个人特色',
        '{trend}｜但用颜值打开',
        'BGM换了：{trend}慢动作版',
        '{trend}｜氛围感美女1秒换装'
      ],
      'xhs-beauty': [
        '{trend}｜我的真实体验分享',
        '被问爆的{trend}，一次说清楚',
        '{trend}避坑指南｜不花冤枉钱',
        '{trend}真的有用吗？实测30天',
        '关于{trend}，我想说的3件事',
        '{trend}｜普通人也能复制',
        '{trend}平替版｜月薪3k也能美',
        '手把手教你{trend}｜零基础入门'
      ],
      'xhs-home': [
        '{trend}｜租房党也能抄作业',
        '{trend}前后对比｜视觉冲击',
        '百元搞定{trend}｜预算有限也能美',
        '{trend}｜一人居的治愈感',
        '关于{trend}的5个避坑点',
        '{trend}｜小户型必备',
        '跟着我{trend}｜沉浸式改造',
        '{trend}｜断舍离后的人生'
      ],
      'xhs-growth': [
        '{trend}｜掏心窝分享',
        '关于{trend}的真心话',
        '{trend}之后才明白的事',
        '聊聊{trend}这件事',
        '{trend}｜越早知道越好',
        '{trend}的血泪教训',
        '{trend}｜我的3个改变',
        '从{trend}到逆袭｜成长记录'
      ]
    },

    render() {
      const cat = this.state.activeCat;
      const catInfo = this.categories[cat];
      const catGenerated = this.state.generated[cat] || [];

      // 标签栏
      let tabsHtml = '';
      for (const k of Object.keys(this.categories)) {
        const info = this.categories[k];
        const active = k === cat ? 'active' : '';
        tabsHtml += '<button class="tab ' + active + '" data-cat="' + k + '">' + info.icon + ' ' + info.name + '</button>';
      }

      // 已生成的选题列表
      let generatedHtml = '';
      if (catGenerated.length > 0) {
        let itemsHtml = '';
        for (let i = 0; i < catGenerated.length; i++) {
          const item = catGenerated[i];
          itemsHtml += '<div class="gen-item">' +
            '<span class="gen-item-text">' + this.escape(item.text) + '</span>' +
            '<button class="gen-item-add" data-idx="' + i + '" title="存为灵感">💡</button>' +
            '<button class="gen-item-del" data-idx="' + i + '" title="删除">×</button>' +
          '</div>';
        }
        generatedHtml = '<div class="gen-results">' +
          '<div class="gen-group">' +
            '<div class="gen-group-header">' +
              '<span class="gen-group-icon">' + catInfo.icon + '</span>' +
              '<span class="gen-group-name">' + catInfo.desc + '</span>' +
              '<span class="gen-group-count">' + catGenerated.length + '条</span>' +
            '</div>' +
            '<div class="gen-group-list">' + itemsHtml + '</div>' +
          '</div>' +
          '<button class="gen-clear" id="clearGenerated">清空本次生成</button>' +
        '</div>';
      }

      // 该方向的热点参考
      const trends = this.hotTrends[cat] || [];
      let trendTagsHtml = '';
      for (let i = 0; i < Math.min(5, trends.length); i++) {
        trendTagsHtml += '<span class="trend-tag">' + this.escape(trends[i]) + '</span>';
      }

      const html = '<div class="page">' +
        '<div class="page-header"><div><div class="page-title">选题池</div><div class="page-sub">选择标签，结合热点生成该方向选题</div></div></div>' +

        // 标签栏
        '<div class="tabs" id="topicTabs">' + tabsHtml + '</div>' +

        // 生成器卡片
        '<div class="generator-card">' +
          '<div class="generator-header"><div class="generator-icon">🎯</div><div class="generator-title">选题生成器</div></div>' +
          '<div class="generator-hint">不知道写什么？点一下，结合热点与你的灵感生成6条选题</div>' +
          '<button class="generator-btn" id="generateBtn">✨ 生成选题灵感</button>' +
          generatedHtml +
        '</div>' +

        // 热点参考
        '<div class="trend-section">' +
          '<div class="trend-title">🔥 本周热点参考</div>' +
          '<div class="trend-tags">' + trendTagsHtml + '</div>' +
        '</div>' +
      '</div>';

      document.getElementById('app').innerHTML = html;
      this.bind();
    },

    // 为当前标签生成6条选题
    generateTopics() {
      const cat = this.state.activeCat;
      const trends = this.hotTrends[cat] || [];
      const catTemplates = this.templates[cat] || [];
      const inspirations = Store.getInspirations();

      // 该方向灵感记录（去掉 ** 标记）
      const catInspirations = inspirations
        .filter(i => i.category === cat)
        .map(i => i.text.replace(/\*\*/g, '').trim())
        .filter(t => t.length >= 3);

      // 历史已生成的选题（避免重复）
      const history = Store.getGeneratedHistory()[cat] || [];
      const usedTexts = new Set(history);

      // 构造选题的辅助函数
      const buildTopic = () => {
        // 50% 概率用灵感记录，50% 概率用热点
        let keyword = '';
        if (catInspirations.length > 0 && Math.random() < 0.5) {
          keyword = catInspirations[Math.floor(Math.random() * catInspirations.length)];
        } else if (trends.length > 0) {
          keyword = trends[Math.floor(Math.random() * trends.length)];
        } else if (catInspirations.length > 0) {
          keyword = catInspirations[Math.floor(Math.random() * catInspirations.length)];
        } else {
          return null;
        }

        // 灵感记录可能较长，取前15字作为关键词
        keyword = keyword.slice(0, 15);
        const tmpl = catTemplates[Math.floor(Math.random() * catTemplates.length)];
        return tmpl.replace('{trend}', keyword);
      };

      const generated = [];
      let attempts = 0;

      while (generated.length < 6 && attempts < 60) {
        attempts++;
        const topicText = buildTopic();
        if (topicText && !usedTexts.has(topicText)) {
          generated.push({ text: topicText, category: cat });
          usedTexts.add(topicText);
        }
      }

      // 如果灵感+热点组合用尽仍不足6条，放宽限制用模板兜底
      while (generated.length < 6) {
        const tmpl = catTemplates[Math.floor(Math.random() * catTemplates.length)];
        const trend = trends.length > 0 ? trends[Math.floor(Math.random() * trends.length)] : '我的日常';
        const topicText = tmpl.replace('{trend}', trend);
        if (!usedTexts.has(topicText)) {
          generated.push({ text: topicText, category: cat });
          usedTexts.add(topicText);
        } else {
          // 避免死循环，加序号区分
          generated.push({ text: topicText + '（' + (generated.length + 1) + '）', category: cat });
          break;
        }
      }

      // 更新历史记录
      Store.addGeneratedHistory(cat, generated.map(g => g.text));

      this.state.generated[cat] = generated;
      this.render();
      App.toast('已生成 ' + generated.length + ' 条' + this.categories[cat].name + '选题 ✨');
    },

    bind() {
      // 标签切换
      const tabs = document.getElementById('topicTabs');
      if (tabs) {
        tabs.onclick = (e) => {
          const t = e.target.closest('.tab');
          if (!t) return;
          this.state.activeCat = t.dataset.cat;
          this.render();
        };
      }

      // 生成按钮
      const genBtn = document.getElementById('generateBtn');
      if (genBtn) {
        genBtn.onclick = () => this.generateTopics();
      }

      // 清空按钮
      const clearBtn = document.getElementById('clearGenerated');
      if (clearBtn) {
        clearBtn.onclick = () => {
          this.state.generated[this.state.activeCat] = [];
          Store.addGeneratedHistory(this.state.activeCat, []); // 清空历史，允许重新生成
          this.render();
          App.toast('已清空，可重新生成');
        };
      }

      // 选题操作
      const generatorCard = document.querySelector('.generator-card');
      if (generatorCard) {
        generatorCard.onclick = (e) => {
          const addBtn = e.target.closest('.gen-item-add');
          const delBtn = e.target.closest('.gen-item-del');
          const cat = this.state.activeCat;
          const catList = this.state.generated[cat] || [];

          if (addBtn) {
            const idx = Number(addBtn.dataset.idx);
            const item = catList[idx];
            if (item) {
              Store.addInspiration(item.text, cat);
              catList.splice(idx, 1);
              this.state.generated[cat] = catList;
              this.render();
              App.toast('已存为灵感 ✨');
            }
          } else if (delBtn) {
            const idx = Number(delBtn.dataset.idx);
            catList.splice(idx, 1);
            this.state.generated[cat] = catList;
            this.render();
          }
        };
      }
    },

    escape(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
  };

  window.Topics = Topics;
})();
