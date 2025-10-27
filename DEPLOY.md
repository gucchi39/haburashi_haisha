# GitHub Pages デプロイ手順

## ✅ 完了した作業

1. **Vite設定の調整**: `vite.config.ts` に `base: '/haburashi_haisha/'` を追加
2. **GitHub Actions ワークフロー**: `.github/workflows/deploy.yml` を作成
3. **TypeScriptエラー修正**: ビルドエラーを全て解消
4. **プロダクションビルド確認**: ビルド成功（dist/フォルダに出力）
5. **GitHubにプッシュ**: 変更をmainブランチにプッシュ完了

## 📋 次のステップ（GitHubでの設定）

### 1. GitHubリポジトリでPages設定を有効化

1. ブラウザで https://github.com/gucchi39/haburashi_haisha を開く
2. リポジトリの **Settings** タブをクリック
3. 左サイドバーから **Pages** をクリック
4. **Source** セクションで以下を選択:
   - Source: **GitHub Actions** を選択
5. 設定は自動保存されます

### 2. GitHub Actionsワークフローの確認

1. リポジトリの **Actions** タブをクリック
2. "Deploy to GitHub Pages" ワークフローが実行中であることを確認
3. ワークフローが完了するまで待つ（通常2〜3分）

### 3. デプロイ完了後のアクセス

デプロイが完了すると、以下のURLでアクセスできます:

**🌐 https://gucchi39.github.io/haburashi_haisha/**

## 🔧 GitHub Pages設定の詳細手順（画像で説明）

### Settings → Pages の設定画面

```
┌─────────────────────────────────────────────┐
│ Pages                                        │
├─────────────────────────────────────────────┤
│                                              │
│ Build and deployment                         │
│                                              │
│ Source                                       │
│ ┌─────────────────────────────────────┐    │
│ │ GitHub Actions                       │◀── │
│ └─────────────────────────────────────┘    │
│                                              │
│ ℹ️  Your site will be deployed from the    │
│    gh-pages branch automatically when       │
│    you push to main.                        │
│                                              │
└─────────────────────────────────────────────┘
```

## ⚙️ 自動デプロイの仕組み

1. `main`ブランチにプッシュ
2. GitHub Actionsが自動実行
3. 以下の処理を実行:
   - Node.js環境のセットアップ
   - 依存関係のインストール (`npm ci`)
   - プロダクションビルド (`npm run build`)
   - GitHub Pagesへのデプロイ
4. デプロイ完了

## 🔄 更新方法

コードを変更して`main`ブランチにプッシュするだけで、自動的に再デプロイされます:

```bash
git add .
git commit -m "機能追加"
git push
```

## 📝 トラブルシューティング

### デプロイが失敗する場合

1. **Actions** タブでエラーログを確認
2. ビルドエラーがある場合は、ローカルで `npm run build` を実行して確認
3. パーミッションエラーの場合:
   - Settings → Actions → General
   - "Workflow permissions" で "Read and write permissions" を選択

### 404エラーが出る場合

1. `vite.config.ts` の `base` パスが正しいか確認
2. ブラウザのキャッシュをクリア
3. 数分待ってから再度アクセス

## 🎉 完了

上記の手順でGitHub Pagesの設定を行うと、アプリケーションが公開されます！
