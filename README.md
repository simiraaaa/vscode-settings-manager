# vscode-settings-manager

.vscode/settings.json をプロジェクトで共有できるようにします。

## setup

`yarn add --dev https://github.com/simiraaaa/vscode-settings-manager`

`$(npm bin)/vscode-settings-manager setup`

設定を追加すると `commit` 時に `.vscode/settings.json` から管理用のjsonに書き込まれてコミットされます。
また、 `checkout` 時、 `pull` 時には、管理用のjsonから `.vscode/settings.json` にマージされます。

## リポジトリで管理する設定の追加

`npm run vsm:add 設定のID`

例) `npm run vsm:add editor.tabSize`

設定IDはカンマ区切りで複数指定可能です。


