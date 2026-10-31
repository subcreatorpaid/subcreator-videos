# Copies every finished video from GitHub to this PC, one numbered folder per video (same layout as 02-videos).
# No Claude needed: right-click > "Run with PowerShell" (or: powershell -ExecutionPolicy Bypass -File get_videos.ps1).
# Default folder: Downloads\subcreatorpaid-videos. New or re-rendered files are downloaded; unchanged ones are skipped.
param([string]$Out = "$env:USERPROFILE\Downloads\subcreatorpaid-videos")

$repo = "subcreatorpaid/subcreator-videos"
$ProgressPreference = "SilentlyContinue"
$reg = Invoke-RestMethod "https://raw.githubusercontent.com/$repo/main/content/plan100/registry.json"
# All releases in a few calls (GitHub allows 60 calls an hour without a login).
$rels = @{}; $page = 1
do {
    $batch = Invoke-RestMethod "https://api.github.com/repos/$repo/releases?per_page=100&page=$page"
    foreach ($b in $batch) { $rels[$b.tag_name] = $b }; $page++
} while ($batch.Count -eq 100)
$new = 0
foreach ($r in $reg) {
    $slug = $r.slug
    $rel = $rels["video-$slug-animated"]
    if (-not $rel) { continue }  # not rendered yet
    $dir = Join-Path $Out "$($r.n)_$slug"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    foreach ($a in $rel.assets) {
        if ($a.name -like "*_thumbnail.png") { $name = "thumbnail.png" }
        elseif ($a.name -like "*.mp4") { $name = $a.name.Replace("$($slug)_", "").Replace("animated", "video") }
        else { continue }
        $dest = Join-Path $dir $name
        if ((Test-Path $dest) -and ((Get-Item $dest).Length -eq $a.size)) { continue }
        Invoke-WebRequest $a.browser_download_url -OutFile $dest
        Write-Host "got $($r.n) $name"; $new++
    }
}
Write-Host "Done: $new new or updated files in $Out"
