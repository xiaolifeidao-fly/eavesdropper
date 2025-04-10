!macro customUnInstall
  ; 保留更新目录
  IfFileExists "$APPDATA\${PRODUCT_NAME}-updater" 0 +2
    RMDir /r "$APPDATA\${PRODUCT_NAME}-updater"
!macroend

!macro customInstall
  ; 设置更新目录权限
  AccessControl::GrantOnFile "$APPDATA\${PRODUCT_NAME}-updater" "(BU)" "FullAccess"
!macroend 