// 同步配置
// 安全说明：Token 不再写死在代码里（会被 GitHub 密码扫描拦截，且公开仓库任何人都能看到）。
// 请在 App「设置 → 配置同步 Token」里粘贴你的 GitHub Token（仅限本仓库、Contents: Read and write 的 Fine-grained PAT）。
// Token 仅保存在本机 localStorage，不会进入代码仓库。
window.APP_CONFIG = {
  github: {
    owner: 'liujing1234-567',
    repo: 'personal-workbench',
    branch: 'main',
    syncBranch: 'sync-data',   // 同步数据单独放在 sync-data 分支，不污染部署用的 main 分支
    syncPath: 'data/sync.json',
    token: ''                  // 运行时由 localStorage 注入，见 Sync.init()
  }
};
