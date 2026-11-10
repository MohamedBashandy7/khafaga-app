
!ifndef BUILD_UNINSTALLER

!include LogicLib.nsh
!include nsDialogs.nsh

Var DataDirectory
Var DataDirectoryInput
Var DataDirectoryBrowse
Var DataDirectoryDialog

!macro customPageAfterChangeDir
    Page custom DataDirectoryPage DataDirectoryPageLeave
!macroend

Function DataDirectoryPage
    StrCpy $DataDirectory "$DOCUMENTS\Fresh Invoices Data"

    nsDialogs::Create 1018
    Pop $DataDirectoryDialog

    ${If} $DataDirectoryDialog == error
        Abort
    ${EndIf}

    ${NSD_CreateLabel} 0 10 100% 20u "Choose where Fresh Invoices will save its database:"
    Pop $0

    ${NSD_CreateText} 0 40 75% 14u "$DataDirectory"
    Pop $DataDirectoryInput

    ${NSD_CreateBrowseButton} 77% 40 23% 14u "Browse"
    Pop $DataDirectoryBrowse

    ${NSD_OnClick} $DataDirectoryBrowse BrowseDataDirectory

    nsDialogs::Show
FunctionEnd

Function BrowseDataDirectory
    ${NSD_GetText} $DataDirectoryInput $0
    nsDialogs::SelectFolderDialog "Choose data folder" "$0"
    Pop $0

    ${If} $0 != error
        ${NSD_SetText} $DataDirectoryInput "$0"
    ${EndIf}
FunctionEnd

Function DataDirectoryPageLeave
    ${NSD_GetText} $DataDirectoryInput $DataDirectory

    ${If} $DataDirectory == ""
        MessageBox MB_ICONEXCLAMATION|MB_OK "Please choose a data folder."
        Abort
    ${EndIf}

    CreateDirectory "$DataDirectory"

    IfErrors 0 +2
        Abort
FunctionEnd

!macro customInstall
    CreateDirectory "$APPDATA\Fresh Invoices"

    FileOpen $0 "$APPDATA\Fresh Invoices\database-location.txt" w
    FileWrite $0 "$DataDirectory"
    FileClose $0
!macroend

!endif
