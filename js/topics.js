// 选题池 - 选题灵感生成器
(function() {
  const Topics = {
    state: {
      generated: []
    },

    // 四个方向定义
    categories: {
      'dy-beauty': { name: '抖音颜值手势舞', icon: '?', color: '#8B4A4A' },
      'xhs-beauty': { name: '小红书颜值变美', icon: '?', color: '#B73E5E' },
      'xhs-home': { name: '家居博主', icon: '?', color: '#3D5A6C' },
      'xhs-growth': { name: '女性成长', icon: '?', color: '#5B3A7A' }
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
      const currentGenerated = this.state.generated;
      const cats = Object.keys(this.categories);

      // 按方向分组展示已生成的选题
      let generatedHtml = '';
      if (currentGenerated.length > 0) {
        let groupHtml = '';
        for (const cat of cats) {
          const catItems = currentGenerated.filter(g => g.category === cat);
          if (catItems.length === 0) continue;
          const catInfo = this.categories[cat];
          groupHtml += '<div class="gen-group">' +
            '<div class="gen-group-header">' +
              '<span class="gen-group-icon">' + catInfo.icon + '</span>' +
              '<span class="gen-group-name">' + catInfo.name + '</span>' +
              '<span class="gen-group-count">' + catItems.length + '条</span>' +
            '</div>' +
            '<div class="gen-group-list">' +
              catItems.map(item => {
                const idx = currentGenerated.indexOf(item);
                return '<div class="gen-item">' +
                  '<span class="gen-item-text">' + this.escape(item.text) + '</span>' +
                  '<button class="gen-item-add" data-idx="' + idx + '" title="存为灵感">?</button>' +
                  '<button class="gen-item-del" data-idx="' + idx + '" title="删除">×</button>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>';
        }
        generatedHtml = '<div class="gen-results">' + groupHtml +
          '<button class="gen-clear" id="clearGenerated">清空本次生成</button>' +
        '</div>';
      }

      const html = '<div class="page">' +
        '<div class="page-header"><div><div class="page-title">选题池</div><div class="page-sub">结合近期热点 × 你的灵感记录，智能生成选题</div></div></div>' +

        '<div class="generator-card">' +
          '<div class="generator-header"><div class="generator-icon">?</div><div class="generator-title">选题灵感生成器</div></div>' +
          '<div class="generator-hint">不知道写什么？点一下，每次生成6+条选题</div>' +
          '<button class="generator-btn" id="generateBtn">? 生成选题灵感</button>' +
          generatedHtml +
        '</div>' +

        '<div class="trend-section">' +
          '<div class="trend-title">? 本周热点趋势参考</div>' +
          '<div class="trend-tags">' +
            this.getTrendTags() +
          '</div>' +
        '</div>' +
      '</div>';

      document.getElementById('app').innerHTML = html;
      this.bind();
    },

    getTrendTags() {
      let tags = '';
      for (const cat of Object.keys(this.categories)) {
        const trends = this.hotTrends[cat] || [];
        for (let i = 0; i < Math.min(3, trends.length); i++) {
          tags += '<span class="trend-tag">' + this.categories[cat].icon + ' ' + this.escape(trends[i]) + '</span>';
        }
      }
      return tags;
    },

    // 智能生成选题
    generateTopics() {
      const inspirations = Store.getInspirations();
      const cats = Object.keys(this.categories);
      const generated = [];
      const usedTexts = new Set();

      // 每个方向至少生成2条（共8条），保证6+条
      for (const cat of cats) {
        const catInfo = this.categories[cat];
        const trends = this.hotTrends[cat] || [];
        const catTemplates = this.templates[cat] || [];

        // 从该方向的灵感记录中提取关键词
        const catInspirations = inspirations.filter(i => {
          const inferCat = this.inferCategory(i.category);
          return inferCat === cat;
        });

        // 生成2条选题
        for (let i = 0; i < 2; i++) {
          let topicText = '';

          // 第一条：结合热点趋势
          if (i === 0 && trends.length > 0) {
            const trend = trends[Math.floor(Math.random() * trends.length)];
            const tmpl = catTemplates[Math.floor(Math.random() * catTemplates.length)];
            topicText = tmpl.replace('{trend}', trend);
          }
          // 第二条：结合灵感记录内容
          else if (i === 1 && catInspirations.length > 0) {
            const insp = catInspirations[Math.floor(Math.random() * catInspirations.length)];
            const inspText = insp.text.replace(/\*\*/g, '').trim().slice(0, 12);
            const trend = trends[Math.floor(Math.random() * trends.length)];
            const tmpl = catTemplates[Math.floor(Math.random() * catTemplates.length)];
            topicText = tmpl.replace('{trend}', inspText || trend);
          }
          // 备选：纯热点
          else if (trends.length > 0) {
            const trend = trends[Math.floor(Math.random() * trends.length)];
            const tmpl = catTemplates[Math.floor(Math.random() * catTemplates.length)];
            topicText = tmpl.replace('{trend}', trend);
          }

          if (topicText && !usedTexts.has(topicText)) {
            generated.push({ text: topicText, category: cat });
            usedTexts.add(topicText);
          }
        }
      }

      // 如果不足6条，补充
      while (generated.length < 6) {
        const cat = cats[Math.floor(Math.random() * cats.length)];
        const trends = this.hotTrends[cat] || [];
        const catTemplates = this.templates[cat] || [];
        const trend = trends[Math.floor(Math.random() * trends.length)];
        const tmpl = catTemplates[Math.floor(Math.random() * catTemplates.length)];
        const topicText = tmpl.replace('{trend}', trend);
        if (!usedTexts.has(topicText)) {
          generated.push({ text: topicText, category: cat });
          usedTexts.add(topicText);
        }
      }

      this.state.generated = generated;
      this.render();
      App.toast('已生成 ' + generated.length + ' 条选题灵感 ?');
    },

    inferCategory(inspCat) {
      const map = {
        'dy-beauty': 'dy-beauty',
        'xhs-beauty': 'xhs-beauty',
        'xhs-home': 'xhs-home',
        'xhs-growth': 'xhs-growth'
      };
      return map[inspCat] || 'xhs-beauty';
    },

    bind() {
      document.getElementById('generateBtn').onclick = () => this.generateTopics();

      const clearBtn = document.getElementById('clearGenerated');
      if (clearBtn) {
        clearBtn.onclick = () => {
          this.state.generated = [];
          this.render();
        };
      }

      const generatorCard = document.querySelector('.generator-card');
      if (generatorCard) {
        generatorCard.onclick = (e) => {
          const addBtn = e.target.closest('.gen-item-add');
          const delBtn = e.target.closest('.gen-item-del');

          if (addBtn) {
            const idx = Number(addBtn.dataset.idx);
            const item = this.state.generated[idx];
            if (item) {
              // 存为灵感记录
              Store.addInspiration(item.text, item.category);
              this.state.generated.splice(idx, 1);
              this.render();
              App.toast('已存为灵感 ?');
            }
          } else if (delBtn) {
            const idx = Number(delBtn.dataset.idx);
            this.state.generated.splice(idx, 1);
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
