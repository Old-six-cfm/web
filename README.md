# web_2026

一个日历形式的媒体网站：
- 首页是日历（可切换月份）
- 点击日期进入当日媒体页
- 默认浏览模式只看媒体
- 左下角可切换编辑模式
- 编辑模式支持上传图片/视频、调整媒体宽度、删除

## 目标：任何访客看到同一份上传内容

本项目已支持 Supabase 云端共享存储（兼容 GitHub Pages 静态托管）。

### 1. 创建 Supabase 资源

1. 在 Supabase 新建项目。
2. 打开 SQL Editor，执行 [schema.sql](/home/wgc-learning/web_2026/supabase/schema.sql)。
3. 在 Storage 新建公开 bucket，名称建议 `media-files`。
4. 在 Storage Policies 给该 bucket 放开公开读写（按你项目安全策略配置）。

### 2. 配置前端

编辑 [config.js](/home/wgc-learning/web_2026/public/js/config.js)：

- `url` 填 `https://<project-ref>.supabase.co`
- `anonKey` 填项目 `anon public key`
- `bucket` 填你的 bucket 名
- `table` 默认 `media_items`

配置完成后，网站就会切换为云端共享模式。

## GitHub Pages 部署（无需本地启动）

工作流文件： [pages.yml](/home/wgc-learning/web_2026/.github/workflows/pages.yml)

1. 推送代码到 GitHub 仓库 `main` 分支。
2. 仓库中 `Settings -> Pages -> Source` 选择 `GitHub Actions`。
3. Actions 完成后访问分配域名。

## 本地预览（可选）

```bash
cd /home/wgc-learning/web_2026/public
python3 -m http.server 8080
```

## 回退说明

如果 [config.js](/home/wgc-learning/web_2026/public/js/config.js) 没配置，系统会自动回退到浏览器本地 IndexedDB 模式。
