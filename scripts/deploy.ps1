# SnakeConverter -> Cloudflare Pages (push main)
# Usage (repo root):  pwsh -File scripts/deploy.ps1 -Message "fix(snake): static idle mascot"
# Or:                 .\scripts\deploy.ps1 -Message "chore: ship"

param(
  [Parameter(Mandatory = $true)]
  [string] $Message,
  [switch] $SkipBuild
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

if (-not $SkipBuild) {
  npm run build
}
npm run ship:qa

git add -A
git commit -m $Message
git push origin main

Write-Host "Done. Cloudflare will build from main in ~1 min." -ForegroundColor Green
