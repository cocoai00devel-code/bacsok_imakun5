Option Explicit
Dim WshShell, fso, currentDir
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 1. 現在のパスを取得（一瞬）
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 2. 【ここが爆速の鍵】
' メッセージを出す「前」に、設定画面を「待機なし」で裏側で即座に起動命令を飛ばします
WshShell.Run "rundll32.exe sysdm.cpl,EditEnvironmentVariables", 1, False

' 3. そのまま間髪入れずにパス確認メッセージを表示
' これにより、人間がメッセージを読んでいる間にシステムが画面準備を終えます
MsgBox "【確認】現在のパスを取得しました：" & vbCrLf & vbCrLf & _
       currentDir & vbCrLf & vbCrLf & _
       "「OK」を押すとパスをコピーします。" & vbCrLf & _
       "その後、[新規] ＞ [Ctrl+V] で貼り付けてください。", 64, "PE 爆速モード"

' 4. OKが押された瞬間にコピー（ここで初めてコピー処理を実行）
WshShell.Run "cmd /c echo " & currentDir & "| clip", 0, True

Set fso = Nothing
Set WshShell = Nothing