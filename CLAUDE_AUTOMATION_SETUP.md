# 🤖 Claude Code 完全自動化セットアップガイド

GitHub ActionsとClaude Codeを連携させて、Issue作成からPR・レビュー・修正・マージまでを完全自動化する方法を初心者向けに説明します。

## 📋 目次

1. [事前準備](#事前準備)
2. [シークレット設定](#シークレット設定)
3. [自動化の流れ](#自動化の流れ)
4. [使い方](#使い方)
5. [トラブルシューティング](#トラブルシューティング)

## 🛠️ 事前準備

### 1. Claude API キーの取得

1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. アカウント作成/ログイン
3. API Keys セクションで新しいキーを作成
4. キーをコピーして保存（後で使用）

### 2. GitHub リポジトリの権限設定

1. リポジトリの **Settings** → **Actions** → **General** に移動
2. **Workflow permissions** で以下を選択：
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

## 🔐 シークレット設定

### GitHub Repository Secrets の設定

1. リポジトリの **Settings** → **Secrets and variables** → **Actions** に移動

2. **New repository secret** をクリックして以下を追加：

| シークレット名 | 値 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | あなたのClaude APIキー | Claude Code APIアクセス用 |

### 設定手順（画像付き説明）

```bash
# 1. リポジトリページで Settings をクリック
# 2. 左サイドバーで "Secrets and variables" → "Actions" をクリック
# 3. "New repository secret" ボタンをクリック
# 4. Name: ANTHROPIC_API_KEY
# 5. Secret: sk-ant-api03-xxx... (あなたのAPIキー)
# 6. "Add secret" をクリック
```

## 🔄 自動化の流れ

### 完全自動化プロセス

```mermaid
graph TD
    A[Issue作成] --> B[Claude Code分析]
    B --> C[機能ブランチ作成]
    C --> D[コード自動実装]
    D --> E[PR自動作成]
    E --> F[コード自動レビュー]
    F --> G[レビューコメント投稿]
    G --> H{修正必要?}
    H -->|Yes| I[@claude-code fix コメント]
    I --> J[自動修正実行]
    J --> F
    H -->|No| K[@claude-code merge コメント]
    K --> L[自動マージ]
    L --> M[GitHub Pages自動デプロイ]
```

### 各ステップの詳細

#### 1️⃣ Issue分析 & PR作成 (`analyze-issue`)
- **トリガー**: 新しいIssueが作成されたとき
- **処理内容**:
  - Issue内容をClaude Codeで分析
  - 機能ブランチを自動作成
  - コードを自動実装
  - Pull Requestを自動作成

#### 2️⃣ 自動レビュー (`auto-review`)
- **トリガー**: PRが作成/更新されたとき
- **処理内容**:
  - 変更差分を分析
  - コード品質をチェック
  - 改善提案をコメント

#### 3️⃣ 自動修正 (`auto-fix`)
- **トリガー**: `@claude-code fix` コメント
- **処理内容**:
  - レビューコメントを解析
  - 指摘箇所を自動修正
  - 修正内容をプッシュ

#### 4️⃣ 自動マージ (`auto-merge`)
- **トリガー**: `@claude-code merge` コメント
- **処理内容**:
  - 最終チェック実行
  - PRを自動マージ
  - 完了通知を投稿

## 📱 使い方

### 基本的な使用方法

#### 1. 新機能の追加

```markdown
# Issue例
タイトル: HIITタイマーに休憩時間カスタマイズ機能を追加

内容:
現在のHIITタイマーでは休憩時間が固定ですが、
ユーザーが休憩時間を自由に設定できる機能を追加したいです。

## 要求仕様
- 休憩時間を5秒〜60秒の範囲で設定可能
- 設定は画面上のスライダーで操作
- 設定値はlocalStorageに保存
- リセットボタンでデフォルト値に戻る
```

→ **自動で以下が実行されます**:
1. 🤖 Claude CodeがIssue内容を分析
2. 🌿 `feature/issue-X-hiit-timer-rest-time-customize` ブランチ作成
3. 💻 必要なコード実装
4. 📋 Pull Request自動作成

#### 2. バグ修正

```markdown
# Issue例
タイトル: タイマーが0秒で停止しない不具合

内容:
HIITタイマーでカウントダウンが0になっても
タイマーが停止せず、マイナス値になってしまいます。

## 発生条件
- ワークアウト時間を短く設定した場合
- ブラウザタブを切り替えた後

## 期待動作
- 0秒になったらタイマー停止
- 次のフェーズに自動移行
```

→ **自動で修正PRが作成されます**

#### 3. コメントでの修正指示

PRが作成された後、レビューで気になる点があれば：

```markdown
@claude-code fix タイマーの精度を改善してください。setIntervalではなくrequestAnimationFrameを使用して、より正確なタイミングにしてください。
```

→ **自動で修正が実行されます**

#### 4. 最終マージ

すべて確認できたら：

```markdown
@claude-code merge
```

→ **自動でマージされ、GitHub Pagesにデプロイされます**

## 🎯 HIITタイマー専用コマンド

### プロジェクト固有の機能

```markdown
# タイマー精度の改善
@claude-code fix timer-accuracy

# レスポンシブデザインの最適化  
@claude-code fix responsive-design

# アクセシビリティの向上
@claude-code fix accessibility

# パフォーマンスの最適化
@claude-code fix performance
```

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. ワークフローが実行されない

**症状**: Issueを作成してもGitHub Actionsが動かない

**解決方法**:
```bash
# 1. リポジトリ設定を確認
Settings → Actions → General → Workflow permissions
→ "Read and write permissions" にチェック

# 2. シークレットを確認
Settings → Secrets and variables → Actions
→ ANTHROPIC_API_KEY が設定されているか確認
```

#### 2. Claude Code APIエラー

**症状**: `ANTHROPIC_API_KEY` エラーが出る

**解決方法**:
```bash
# APIキーの形式を確認
# 正しい形式: sk-ant-api03-xxxxx...
# 間違った形式: Claude APIキーではない文字列

# 新しいAPIキーを取得
# https://console.anthropic.com/ でキーを再生成
```

#### 3. PR作成権限エラー

**症状**: PRが作成できない

**解決方法**:
```bash
# GitHub Token の権限を確認
Settings → Actions → General
→ "Allow GitHub Actions to create and approve pull requests"
にチェックを入れる
```

#### 4. マージが失敗する

**症状**: `@claude-code merge` でマージできない

**解決方法**:
```bash
# 手動確認項目:
# 1. PRにコンフリクトがないか
# 2. Required reviewsが設定されていないか
# 3. Status checksが通っているか

# 手動マージする場合:
# GitHub上で通常通りマージボタンをクリック
```

## 📊 監視とログ

### 実行状況の確認方法

1. **Actions タブ**で各ワークフローの実行状況を確認
2. **失敗した場合**は詳細ログをチェック
3. **成功した場合**は変更内容がGitHub Pagesに反映

### ログの見方

```bash
# GitHub Actions の画面で:
# 1. Actions タブをクリック
# 2. 該当するワークフローをクリック  
# 3. 失敗したステップの詳細を確認
# 4. エラーメッセージを元に対処
```

## 🔧 カスタマイズ

### 自動化設定の調整

ワークフローファイル `.github/workflows/claude-automation.yml` を編集して：

```yaml
# 実行条件の変更例
on:
  issues:
    types: [opened, labeled]  # ← labeled を追加
  
# 特定ラベルでのみ実行
if: contains(github.event.issue.labels.*.name, 'claude-auto')
```

### HIITタイマー固有設定

```yaml
# プロジェクト固有の分析設定
claude code analyze-issue \
  --title="${{ github.event.issue.title }}" \
  --body="${{ github.event.issue.body }}" \
  --project-type="hiit-timer" \        # ← HIITタイマー専用設定
  --features="timer,audio,responsive" \ # ← 機能指定
  --output=analysis.json
```

## 🎉 活用例

### 実際の開発シナリオ

#### シナリオ1: 新機能追加
```markdown
Issue: "ワークアウト履歴保存機能の追加"
↓ 自動実装
Result: localStorage使用の履歴機能が完成
```

#### シナリオ2: UI改善
```markdown
Issue: "ダークモード対応"
↓ 自動実装  
Result: CSS変数とトグル機能が追加
```

#### シナリオ3: バグ修正
```markdown
Issue: "モバイルでタイマーが見切れる"
↓ 自動修正
Result: レスポンシブデザインが改善
```

## 📚 さらなる活用

### 高度な使い方

```markdown
# 複数機能の同時開発
Issue: "タイマー機能の大幅改善 (音声通知 + 統計表示 + カスタムワークアウト)"

# A/Bテスト用の実装
@claude-code fix create-ab-test-version

# パフォーマンス最適化
@claude-code fix optimize-for-mobile-performance  
```

---

## 🆘 サポート

問題が解決しない場合は：

1. **GitHub Issues**で質問を投稿
2. **Actions実行ログ**を添付
3. **エラーメッセージ**を詳細に記載

**Happy Coding with Claude! 🤖✨**