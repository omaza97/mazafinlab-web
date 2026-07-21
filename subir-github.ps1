# Maza FinLab — Subir sitio a GitHub Pages
# Uso: clic derecho → Ejecutar con PowerShell (o desde terminal en esta carpeta)

$ErrorActionPreference = "Stop"
$SiteDir = $PSScriptRoot

function Find-Git {
    $candidates = @(
        "git",
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\bin\git.exe"
    )
    foreach ($c in $candidates) {
        if (Get-Command $c -ErrorAction SilentlyContinue) { return (Get-Command $c).Source }
        if (Test-Path $c) { return $c }
    }
    return $null
}

$git = Find-Git
if (-not $git) {
    Write-Host ""
    Write-Host "Git no esta instalado." -ForegroundColor Yellow
    Write-Host "1. Instala Git: https://git-scm.com/download/win"
    Write-Host "2. Cierra y abre la terminal, vuelve a ejecutar este script."
    Write-Host ""
    Write-Host "O sube los archivos manualmente en github.com (ver instrucciones en el chat)."
    exit 1
}

$remote = Read-Host "URL del repositorio GitHub (ej: https://github.com/TU_USUARIO/mazafinlab-web.git)"

Set-Location $SiteDir

if (-not (Test-Path ".git")) {
    & $git init -b main
}

& $git add index.html politica-privacidad.html robots.txt sitemap.xml CNAME .nojekyll .gitignore css js assets
& $git add -u 2>$null

$status = & $git status --porcelain
if (-not $status) {
    Write-Host "No hay cambios nuevos para subir." -ForegroundColor Cyan
} else {
    & $git commit -m "Publicar sitio corporativo Maza FinLab"
}

$remotes = & $git remote 2>$null
if ($remotes -notcontains "origin") {
    & $git remote add origin $remote
} else {
    & $git remote set-url origin $remote
}

& $git push -u origin main

Write-Host ""
Write-Host "Listo. Activa GitHub Pages:" -ForegroundColor Green
Write-Host "  Repo → Settings → Pages → Branch: main → Folder: / (root) → Save"
Write-Host "  URL temporal: https://TU_USUARIO.github.io/NOMBRE-REPO/"
Write-Host "  Dominio: https://mazafl.com"
