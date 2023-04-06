# vscode-settings-manager

.vscode/settings.json をプロジェクトで共有できるようにします。

## setup

`yarn add --dev https://github.com/simiraaaa/vscode-settings-manager`

`npx vscode-settings-manager setup`

設定を追加すると `commit` 時に `.vscode/settings.json` から管理用のjsonに書き込まれてコミットされます。
また、 `checkout` 時、 `pull` 時には、管理用のjsonから `.vscode/settings.json` にマージされます。

## リポジトリで管理する設定の追加

`npm run vsm:add 設定のID`

例) `npm run vsm:add editor.tabSize`

設定IDはカンマ区切りで複数指定可能です。

### ワイルドカード

全ての設定を管理
`npm run vsm:add "*"`

xxx. から始まる設定を全て管理
`npm run vsm:add "xxx.*"`

## 設定の削除

`npm run vsm:remove 設定のID`

`npm run vsm:add` で追加した設定を削除できます。


## コミットするファイル

`.husky`, `.vscode-settings-manager` はコミットしてください。

`.vscode/settings.json` は `.gitignore` に追加してください。
