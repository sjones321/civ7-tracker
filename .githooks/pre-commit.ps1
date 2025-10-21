# Auto-increment per-page version badges on staged HTML files.
# - If a staged HTML file contains:  Version vX.Y.Z (pageTag)
#     -> increments patch (Z).
# - If no badge exists:
#     -> inserts default badge after <body>: Version v0.0.1 (filenameWithoutExt)

# Get staged files (Added, Copied, Modified)
$staged = git diff --cached --name-only --diff-filter=ACM
$htmlFiles = $staged | Where-Object { $_ -match '\.html$' }

function Increment-VersionInFile($path) {
    if (-not (Test-Path $path)) { return }

    $content = Get-Content -Path $path -Raw

    # Derive a human-friendly page tag from filename (index.html -> index)
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($path)

    # Regex to find existing badge: Version vX.Y.Z (anything)
    $regex = 'Version v(\d+)\.(\d+)\.(\d+)\s*\((.*?)\)'
    if ($content -match $regex) {
        $new = [regex]::Replace($content, $regex, {
            param($m)
            $major = [int]$m.Groups[1].Value
            $minor = [int]$m.Groups[2].Value
            $patch = [int]$m.Groups[3].Value + 1
            $tag   = $m.Groups[4].Value
            return "Version v$major.$minor.$patch ($tag)"
        }, 1) # only replace first badge per file
        if ($new -ne $content) {
            Set-Content -Path $path -Value $new -NoNewline
            git add -- $path | Out-Null
        }
    }
    else {
        # No badge found -> insert at top of <body>
        $badge = "<div id=""version-badge"" class=""visually-muted"">Version v0.0.1 ($fileName)</div>"
        $inserted = $false

        # Try to insert right after opening <body>
        $new = [regex]::Replace($content, '(?is)(<body[^>]*>)', {
            param($m)
            $inserted = $true
            return $m.Groups[1].Value + "`r`n  " + $badge
        }, 1)

        if (-not $inserted) {
            # Fallback: prepend to file
            $new = $badge + "`r`n" + $content
        }

        Set-Content -Path $path -Value $new -NoNewline
        git add -- $path | Out-Null
    }
}

foreach ($f in $htmlFiles) {
    Increment-VersionInFile $f
}
exit 0
