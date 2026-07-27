// 同步配置
// ⚠️ 安全提示：下面的 token 会随公开仓库一起发布到前端代码中，任何查看页面源码的人都能看到。
// 强烈建议：去 GitHub → Settings → Developer settings → Fine-grained PAT，
// 生成一个「仅限 personal-workbench 这一个仓库、只勾 Contents: Read and write」的 token 替换此处，
// 这样即使泄露，影响也仅限于这一个仓库。
window.APP_CONFIG = {
  github: {
    owner: 'liujing1234-567',
    repo: 'personal-workbench',
    branch: 'main',
    syncBranch: 'sync-data',   // 同步数据单独放在 sync-data 分支，不污染部署用的 main 分支
    syncPath: 'data/sync.json',
    token: 'REMOVED_TOKEN_PLACEHOLDER'
  }
};
