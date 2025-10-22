# .githooks\pre-commit.ps1
# Logs go here:
$LogFile = Join-Path $PSScriptRoot "hook.log"
"----- $(Get-Date) pre-commit start -----" | Out-File $LogFile -Append

# Get staged files (Added, Copied, Modified)
$staged = git diff --cached --name-only --diff-filter=ACM
"Staged files:`n$staged" | Out-File $LogFile -Append

# Only .html files
$htmlFiles = $staged | Where-Object { $_ -match '\.html$' }
"HTML candidates:`n$($htmlFiles -join "`n")" | Out-File $LogFile -Append

function Increment-VersionInFile($path) {
    if (-not (Test-Path $path)) {
        "Missing file: $path" | Out-File $LogFile -Append
        return
    }

    $content = Get-Content -Path $path -Raw

    # Derive page tag from filename
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($path)

    # Case-sensitive match for "Version vX.Y.Z (tag)"
    $regex = 'Version v(\d+)\.(\d+)\.(\d+)\s*\((.*?)\)'

    if ($content -match $regex) {
        "Found badge in: $path" | Out-File $LogFile -Append
        $new = [regex]::Replace($content, $regex, {
            param($m)
            $major = [int]$m.Groups[1].Value
            $minor = [int]$m.Groups[2].Value
            $patch = [int]$m.Groups[3].Value + 1
            $tag   = $m.Groups[4].Value
            "Bumping $path to v$major.$minor.$patch ($tag)" | Out-File $LogFile -Append
            return "Version v$major.$minor.$patch ($tag)"
        }, 1) # only first badge per file
        if ($new -ne $content) {
            # WRITE WITHOUT BOM
            Set-Content -Path $path -Value $new -NoNewline -Encoding utf8NoBOM
            git add -- $path | Out-Null
        }
    }
    else {
        "No badge in: $path — inserting v0.0.1 ($fileName)" | Out-File $LogFile -Append
        $badge = "<div id=""version-badge"" class=""visually-muted"">Version v0.0.1 ($fileName)</div>"
        $inserted = $false

        $new = [regex]::Replace($content, '(?is)(<body[^>]*>)', {
            param($m)
            $inserted = $true
            return $m.Groups[1].Value + "`r`n  " + $badge
        }, 1)

        if (-not $inserted) {
            $new = $badge + "`r`n" + $content
        }

        # WRITE WITHOUT BOM
        Set-Content -Path $path -Value $new -NoNewline -Encoding utf8NoBOM
        git add -- $path | Out-Null
    }
}

foreach ($f in $htmlFiles) {
    Increment-VersionInFile $f
}

"----- pre-commit end -----`n" | Out-File $LogFile -Append
exit 0