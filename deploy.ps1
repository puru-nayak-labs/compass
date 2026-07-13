# ─────────────────────────────────────────────────────────────
# IBM Compass — one-command deploy / update to IBM Code Engine
# Usage: .\deploy.ps1
# ─────────────────────────────────────────────────────────────

$IMAGE    = "us.icr.io/ibm-compass/compass-app:latest"
$APP_NAME = "compass-app"
$PROJECT  = "ibm-compass"

Write-Host "`n🚀 IBM Compass — Deploy" -ForegroundColor Cyan
Write-Host "────────────────────────────────────" -ForegroundColor DarkGray

# 1. Build Docker image
Write-Host "`n[1/4] Building Docker image..." -ForegroundColor Yellow
docker build -t $IMAGE .
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Docker build failed." -ForegroundColor Red; exit 1 }
Write-Host "✅ Build complete." -ForegroundColor Green

# 2. Log in to IBM Container Registry
Write-Host "`n[2/4] Logging into IBM Container Registry..." -ForegroundColor Yellow
ibmcloud cr login
if ($LASTEXITCODE -ne 0) { Write-Host "❌ CR login failed. Run: ibmcloud login --sso" -ForegroundColor Red; exit 1 }

# 3. Push image
Write-Host "`n[3/4] Pushing image to IBM Container Registry..." -ForegroundColor Yellow
docker push $IMAGE
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Push failed." -ForegroundColor Red; exit 1 }
Write-Host "✅ Image pushed." -ForegroundColor Green

# 4. Update Code Engine application
Write-Host "`n[4/4] Updating Code Engine application..." -ForegroundColor Yellow
ibmcloud ce project select --name $PROJECT
ibmcloud ce application update --name $APP_NAME --image $IMAGE
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Update failed — trying first-time create..." -ForegroundColor Yellow
    ibmcloud ce application create `
        --name $APP_NAME `
        --image $IMAGE `
        --port 3000 `
        --min-scale 1 `
        --max-scale 3 `
        --memory 2G `
        --cpu 0.5
}

Write-Host "`n✅ Deploy complete!" -ForegroundColor Green

# Print the live URL
$url = ibmcloud ce application get --name $APP_NAME --output json | ConvertFrom-Json | Select-Object -ExpandProperty status | Select-Object -ExpandProperty url
Write-Host "🌐 Live URL: $url`n" -ForegroundColor Cyan
