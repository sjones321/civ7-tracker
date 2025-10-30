# Devlog Flow Checklist

Use this checklist to capture a full day in the devlog without missing the automation steps.

## 1. Kickoff

- [ ] Run the daily template generator if the file is missing.

    ```powershell
    PowerShell -NoProfile -ExecutionPolicy Bypass -File ./new-devlog.ps1 -Date YYYY-MM-DD
    ```

- [ ] Confirm the new entry opens in your editor and replace the placeholder focus text.

## 2. Capture work-in-progress notes

- [ ] Every time you complete a notable task, log it:

    ```powershell
    PowerShell -NoProfile -ExecutionPolicy Bypass -File ./tools/devlog-append.ps1 -Title "short title" -Description "what changed"
    ```

- [ ] Alternatively, launch from Windows Explorer:

    ```bat
    tools\devlog-append.bat
    ```

- [ ] Keep the DAILY SUMMARY section tidy. It should look like this after a few entries:

    ```md
    <!-- DAILY SUMMARY START -->
    ~~~md
    - docs: close missing code fence in devlog template — Annotated the snippet block with a language tag.
    - chore: pass markdownlint — Resolved MD040 by tagging fences.
    ~~~
    <!-- DAILY SUMMARY END -->
    ```

## 3. Wrap-up ritual

- [ ] Review the accomplishments list for duplicates and clarity.
- [ ] Generate the ready-to-share summary:

    ```powershell
    PowerShell -NoProfile -ExecutionPolicy Bypass -File ./tools/devlog-wrapup.ps1
    ```

- [ ] Or double-click from Explorer:

    ```bat
    tools\devlog-wrapup.bat
    ```

- [ ] Use the console output to post the daily summary, then commit the devlog entry.

## 4. Final checks

- [ ] Run markdownlint and html-validate (see `docs/CODEX_SOP.md` for the command block).
- [ ] Ensure the commit digest regenerated via `new-devlog.ps1` if you added late commits.
- [ ] Push the branch and open a pull request with the summary from the wrap-up script.
