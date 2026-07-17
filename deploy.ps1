# -----------------------------------------------------------------------------
# Compass — one-command Docker build + push + deploy
#
# Usage (default data folder):
#   .\deploy.ps1
#
# Usage (custom data folder):
#   .\deploy.ps1 -DataDir "C:\your\path\to\data"
#
# Usage (custom registry):
#   .\deploy.ps1 -Registry "ghcr.io/your-username" -Tag "v1.2.0"
# -----------------------------------------------------------------------------
param(
    [string]$DataDir  = "data",
    [string]$Registry = "ghcr.io/puru-nayak-labs",
    [string]$AppName  = "compass-app",
    [string]$Tag      = "latest"
)

$IMAGE = "$Registry/${AppName}:$Tag"

Write-Host ""
Write-Host "Compass — Deploy" -ForegroundColor Cyan
Write-Host "------------------------------------" -ForegroundColor DarkGray
Write-Host "   Data source : $DataDir"  -ForegroundColor DarkGray
Write-Host "   Image       : $IMAGE"    -ForegroundColor DarkGray

# -- 1. Build Docker image -----------------------------------------------------
Write-Host ""
Write-Host "[1/3] Building Docker image..." -ForegroundColor Yellow
docker build --build-arg "DATA_SRC=$DataDir" -t $IMAGE .
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Docker build failed." -ForegroundColor Red; exit 1 }
Write-Host "OK: Build complete." -ForegroundColor Green

# -- 2. Push image to registry -------------------------------------------------
Write-Host ""
Write-Host "[2/3] Pushing image to $Registry..." -ForegroundColor Yellow
docker push $IMAGE
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Push failed. Make sure you are logged in: docker login $Registry" -ForegroundColor Red; exit 1 }
Write-Host "OK: Image pushed." -ForegroundColor Green

# -- 3. Deploy hint ------------------------------------------------------------
Write-Host ""
Write-Host "[3/3] Deploy" -ForegroundColor Yellow
Write-Host "   Image is ready at: $IMAGE" -ForegroundColor Green
Write-Host ""
Write-Host "   Deploy options:" -ForegroundColor Cyan
Write-Host "   • Fly.io   : flyctl deploy"
Write-Host "   • Railway  : railway up"
Write-Host "   • Render   : push to your connected git branch"
Write-Host "   • Docker   : docker run -p 3000:3000 $IMAGE"
Write-Host ""
Write-Host "Deploy complete!" -ForegroundColor Green
