How to install (Windows, Git + GitKraken):

1) Extract the `.githooks` folder into the **root of your repo** (same folder as .git).
   Resulting paths:
     .githooks\pre-commit.bat
     .githooks\pre-commit.ps1

2) Open a terminal *in your repo root* and run (once):
     git config core.hooksPath .githooks

3) Test:
   - Edit and save index.html
   - Stage *only* index.html in GitKraken
   - Commit
   -> The hook will bump "Version vX.Y.Z (index)" to the next patch (Z+1),
      or add "Version v0.0.1 (index)" if no badge exists.

Notes:
- This hook only touches **staged** .html files.
- It increments the **patch** number only.
- You can still change major/minor manually whenever you want.
- If PowerShell execution is restricted, the .bat uses -ExecutionPolicy Bypass.
