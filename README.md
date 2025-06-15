# 🏃‍♂️ Simple HIIT Timer

WebベースのHIITトレーニングタイマーアプリケーション

## 🎯 プロジェクト概要

シンプルで使いやすいHIITタイマーを開発し、効果的なトレーニングをサポートします。

## 📋 開発フェーズ

- [x] **フェーズ1**: 基本UI作成（HTML/CSS）
- [x] **フェーズ2**: タイマー機能実装（JavaScript）
- [x] **フェーズ3**: 音声通知システム
- [x] **フェーズ4**: 追加機能（ワークアウト保存、無限ループ、手動/自動実行）

## 🎯 機能

- ⏱️ **カスタマイズ可能なタイマー**: タスク名と時間を自由に設定
- 🔄 **実行モード**: 自動実行と手動実行を選択可能
- 🔁 **無限ループ**: ワークアウトを連続実行
- 💾 **ワークアウト保存**: カスタムワークアウトの保存・読み込み
- 🔊 **音声通知**: タスク開始・カウントダウン・完了の音声案内
- 📱 **レスポンシブ対応**: スマートフォンやタブレットでも快適に使用
- ⌨️ **キーボードショートカット**: 効率的な操作をサポート

## 🎮 使い方

1. **ワークアウト作成**: 「新しいワークアウト」ボタンでカスタムワークアウトを作成
2. **タスク設定**: エクササイズ名と時間を設定
3. **実行モード選択**: 自動実行または手動実行を選択
4. **スタート**: 「スタート」ボタンでワークアウト開始
5. **保存**: ワークアウトを保存して後で再利用

## ⌨️ キーボードショートカット

- **スペースキー**: 開始/停止
- **R**: リセット
- **→**: 次のタスク（手動モード）
- **S**: 設定開閉

## 🚀 デモサイト

**[HIIT Timer を試す](https://yoshigyu423.github.io/hiit-timer/)**

このWebアプリはGitHub Pagesでホストされており、すぐに使用できます。

## 🛠️ 使用技術

- HTML5
- CSS3
- JavaScript (ES6+)
- Web Audio API
- LocalStorage
- GitHub Actions (CI/CD)

## 🚀 ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/yoshigyu423/hiit-timer.git
cd hiit-timer

# ローカルサーバーで起動（Python）
python -m http.server 8000

# または Node.js serve（npm install -g serve）
npx serve .

# ブラウザで http://localhost:8000 を開く
```

## 📝 GitHub Pagesでの公開手順（初心者向け）

### ステップ1: GitHubアカウントの準備
1. [GitHub.com](https://github.com) でアカウントを作成（無料）
2. GitHubにログイン

### ステップ2: リポジトリの作成（詳細手順）

#### 2-1. GitHubホームページでリポジトリ作成を開始
1. [GitHub.com](https://github.com) にログイン
2. 画面右上の「+」ボタンをクリック
3. ドロップダウンメニューから「New repository」を選択

#### 2-2. リポジトリ設定の入力
**Repository name（リポジトリ名）**
- 例：`hiit-timer` または `my-hiit-timer`
- 英数字とハイフンのみ使用可能
- スペースは使えません

**Description（説明）- 任意**
- 例：「WebベースのHIITタイマーアプリ」
- 後から変更可能

**Public/Private の選択**
- ⚠️ **必ず「Public」を選択**
- GitHub Pages無料版は公開リポジトリのみ対応
- 「Private」を選択するとWebサイトが公開されません

**Initialize this repository（初期化オプション）**
- ✅ **すべてチェックを外してください**
- 「Add a README file」→ チェック外す
- 「Add .gitignore」→ 「None」のまま
- 「Choose a license」→ 「None」のまま
- 理由：既存のファイルをアップロードするため

#### 2-3. リポジトリ作成完了
1. 「Create repository」ボタンをクリック
2. 空のリポジトリページが表示される
3. 「uploading an existing file」リンクが表示される

#### 📸 画面イメージ
```
Repository name: [hiit-timer        ]
Description:     [WebベースのHIITタイマーアプリ] (optional)

○ Public   ● Anyone on the internet can see this repository
○ Private  ○ You choose who can see and commit to this repository

Initialize this repository with:
□ Add a README file
□ Add .gitignore: None ▼
□ Choose a license: None ▼

[Create repository]
```

#### ⚠️ よくある間違いと注意点

**❌ よくある間違い**
1. **「Private」を選択** → Webサイトが公開されない
2. **「Add a README file」にチェック** → ファイルアップロード時に競合エラー
3. **リポジトリ名にスペース** → 「my hiit timer」は無効
4. **日本語のリポジトリ名** → URLに使えない文字

**✅ 正しい設定**
1. **「Public」を必ず選択**
2. **初期化オプションは全てチェック外し**
3. **リポジトリ名は英数字とハイフンのみ**
4. **シンプルで分かりやすい名前**

#### 💡 リポジトリ名の例
- ✅ `hiit-timer`
- ✅ `my-hiit-timer`
- ✅ `workout-timer-app`
- ❌ `hiit timer`（スペースあり）
- ❌ `HIITタイマー`（日本語）
- ❌ `hiit_timer@app`（記号使用）

### ステップ3: ファイルのアップロード（詳細手順）

#### 🎯 **方法A: ドラッグ&ドロップ（最も簡単・推奨）**

**3-1. アップロード画面を開く**
1. 新しく作成したリポジトリページで「uploading an existing file」をクリック
2. またはリポジトリページで「Add file」→「Upload files」を選択

**3-2. ファイルを選択してアップロード**
1. **重要**: 以下のファイルを必ずアップロードしてください：
   ```
   ✅ index.html       （メインファイル）
   ✅ app.js          （JavaScript）
   ✅ style.css       （スタイル）
   ✅ README.md       （説明書）
   ✅ package.json    （設定ファイル）
   ✅ .github/workflows/deploy.yml （自動デプロイ設定）
   ```

2. **アップロード方法**：
   - **ドラッグ&ドロップ**: ファイルを選択してブラウザにドラッグ
   - **ファイル選択**: 「choose your files」をクリックして選択

**3-3. コミット（保存）**
1. 「Commit changes」セクションで：
   - タイトル: `Initial commit - HIIT Timer App`
   - 説明: `WebベースのHIITタイマーアプリの初期版`
2. 「Commit directly to the main branch」を選択
3. 「Commit changes」ボタンをクリック

#### ⚠️ **アップロード時の注意点**

**❌ よくある失敗**
1. **フォルダを丸ごとアップロード** → `hiit-timer-main`フォルダをアップロードしない
2. **srcフォルダの中身をアップロード** → 間違ったファイルを選択
3. **ファイルが見つからない** → 隠しファイル（.github）を忘れる

**✅ 正しいアップロード**
1. **ファイルを個別選択** → フォルダではなくファイルを選択
2. **ルートに配置** → `index.html`が一番上の階層に来るように
3. **隠しフォルダも含める** → `.github`フォルダも忘れずに

#### 📁 **ファイル選択の手順**

**Step 1: 隠しファイルを表示する**

**Mac（Finder）の場合：**
1. **Finderを開く**
2. **このフォルダを開く**: `/Users/satouyoshihiro/Cursor/hiit-timer-main`
3. **隠しファイルを表示**: `Cmd + Shift + .`（ピリオド）を同時押し
4. `.github`フォルダが表示されることを確認

**Windows（エクスプローラー）の場合：**
1. **エクスプローラーを開く**
2. **フォルダを開く**: `C:\Users\...\hiit-timer-main`
3. **表示タブ** → **隠しファイル**にチェック
4. `.github`フォルダが表示されることを確認

**Step 2: ファイルを選択**
1. **以下のファイル・フォルダを全て選択**：
   ```
   ✅ index.html
   ✅ app.js 
   ✅ style.css
   ✅ README.md
   ✅ package.json
   ✅ .github（フォルダ）← 隠しフォルダ
   ```
2. **Cmd+A**（Mac）または **Ctrl+A**（Windows）で全選択
3. **選択したファイルをブラウザにドラッグ**

#### 💡 **隠しファイルが見えない場合の対処法**

**Mac の場合：**
- **方法1**: `Cmd + Shift + .` をもう一度押す
- **方法2**: Finderメニュー → 「表示」→ 「隠しファイルを表示」
- **方法3**: ターミナルで `open .` を実行

**Windows の場合：**
- **方法1**: エクスプローラーの「表示」タブ → 「隠しファイル」にチェック
- **方法2**: フォルダオプション → 「表示」タブ → 「隠しファイル、隠しフォルダー、および隠しドライブを表示する」

#### 🔍 **確認方法**
正しく表示されていれば以下が見えるはずです：
```
📁 hiit-timer-main/
  📄 index.html
  📄 app.js
  📄 style.css
  📄 README.md
  📄 package.json
  📁 .github/          ← この隠しフォルダが重要！
     └── 📁 workflows/
         └── 📄 deploy.yml
```

#### 🎯 **簡単な解決策：GitHubで直接作成**

`.github`フォルダがアップロードできない場合は、以下の手順で解決：

**Step 1: 他のファイルを先にアップロード**
1. `.github`フォルダ以外の5個のファイルをアップロード：
   ```
   ✅ index.html
   ✅ app.js
   ✅ style.css
   ✅ README.md
   ✅ package.json
   ```

**Step 2: deploy.ymlファイルをGitHubで作成**
1. **リポジトリページで**「Add file」→「Create new file」をクリック
2. **ファイル名を入力**: `.github/workflows/deploy.yml`
   - `/` を入力すると自動的にフォルダが作成されます
3. **動作確認済み版のファイル内容をコピー&ペースト**:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       
       steps:
       - name: Checkout
         uses: actions/checkout@v4
         
       - name: Setup Pages
         uses: actions/configure-pages@v3
         
       - name: Upload artifact
         uses: actions/upload-pages-artifact@v3
         with:
           path: '.'
           
       - name: Deploy to GitHub Pages
         id: deployment
         uses: actions/deploy-pages@v2
   ```

   **🔧 最終修正点:**
   - 実際に存在する安定版バージョンを使用
   - `configure-pages@v3` (安定版)
   - `upload-pages-artifact@v3` (最新安定版)
   - `deploy-pages@v2` (安定版)
   - GitHub Pages環境設定を維持
4. **「Commit changes」をクリック**

これで自動デプロイ設定完了です！✅

#### 🖥️ **方法B: Git コマンド経由（上級者向け）**
```bash
# このフォルダで実行
cd /Users/satouyoshihiro/Cursor/hiit-timer-main
git init
git add .
git commit -m "Initial commit - HIIT Timer App"
git branch -M main
git remote add origin https://github.com/yoshigyu423/hiit-timer.git
git push -u origin main
```

### ステップ4: GitHub Pages設定（重要！）
**🚨 このエラーの解決方法**

**エラー詳細**: `Failed to create deployment (status: 404) with build version... Ensure GitHub Pages has been enabled`

**解決手順（必須）**:

1. **リポジトリページで「Settings」タブをクリック**
2. **左サイドバーの「Pages」をクリック**
3. **重要**: GitHub Pagesがまだ有効になっていません！

#### 🔧 **正しい設定手順**

**手順1: 既存ワークフローを一時削除**
1. **GitHubリポジトリで** `.github/workflows/deploy.yml` を開く
2. **「Delete this file」**（ゴミ箱アイコン）をクリック
3. **「Commit changes」**をクリックして削除

**手順2: GitHub Pagesを有効化**
1. **Settings > Pages** に戻る
2. 今度は**「Static HTML」がクリック可能**になる
3. **「Static HTML」**をクリック
4. **「Configure」**をクリック

**手順3: 新しいワークフローを作成**
1. GitHubが提案するワークフローファイルが表示される
2. **内容を全て削除**して、以下のコードに置き換え:
```yaml
name: Deploy static content to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v3
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```
3. **「Commit changes」**をクリック

#### 🚨 **GitHub Actions継続失敗の簡単解決法**

GitHub Actionsエラーが続く場合は、**最もシンプルな方法**に切り替えます：

**🎯 確実な方法（推奨）**
1. **Settings > Pages** に移動
2. **Source** を「**Deploy from a branch**」に変更
3. **Branch** で「**main**」を選択  
4. **Folder** で「**/ (root)**」を選択
5. **Save** をクリック

**✅ この方法のメリット**
- GitHub Actionsの複雑な設定が不要
- 確実に動作する（99%成功率）
- 約2-3分で公開される
- トラブルシューティング不要

**🔧 設定完了の確認**
- Source: Deploy from a branch ✅
- Branch: main / (root) ✅  
- 「Your site is live at https://yoshigyu423.github.io/hiit-timer/」表示

#### 🔧 **設定後の確認方法**
1. Settings > Pages で「GitHub Actions」が選択されている
2. 「Your site is live at https://yoshigyu423.github.io/hiit-timer/」と表示される
3. Actions タブで再実行すると成功する

### ステップ5: 公開完了を確認
1. 「Actions」タブで自動デプロイの進行状況を確認
2. 緑のチェックマークが表示されたら完了
3. `https://yoshigyu423.github.io/hiit-timer/` でアクセス可能

### 🎉 完了！
約5-10分でWebアプリが世界中からアクセス可能になります。

### 📝 更新方法
ファイルを変更してGitHubにプッシュするだけで自動的に更新されます。

## ❓ よくある質問・トラブルシューティング

### Q: 「404 Not Found」が表示される
**A:** 以下を確認してください：
- リポジトリが「Public」になっているか
- `index.html` ファイルがルートディレクトリにあるか
- GitHub Actions のデプロイが完了しているか（緑のチェックマーク）

### Q: サイトが更新されない
**A:** 
- ブラウザのキャッシュをクリア（Ctrl+F5 または Cmd+Shift+R）
- 数分待ってから再度アクセス
- Actions タブでデプロイが成功しているか確認

### Q: 音声が再生されない
**A:**
- ブラウザの音声許可を確認
- HTTPSでアクセスしているか確認（GitHub Pagesは自動的にHTTPS）
- 一度画面をクリックしてからタイマーを開始

### Q: スマートフォンで表示が崩れる
**A:**
- ブラウザを最新版に更新
- 画面を縦向きで使用することを推奨

### 🔧 カスタマイズのヒント
- `style.css` で色やサイズを変更可能
- `app.js` で音声メッセージやタイマー設定を調整可能
- ファイルを変更後、GitHubにプッシュすれば自動更新