# -----------------------------------------------------------------------------
# IBM Compass -- one-command deploy / update to IBM Code Engine
#
# Usage (default -- uses the committed data dump):
#   .\deploy.ps1
#
# Usage (custom data folder):
#   .\deploy.ps1 -DataDir "C:\Users\you\ibm-compass\.bob\tmp\xlsx-dumps\TLS Performance Data-e90c662f31f06851"
# -----------------------------------------------------------------------------
param(
    [string]$DataDir = ".bob\tmp\xlsx-dumps\TLS Performance Data-e90c662f31f06851"
)

$IMAGE    = "us.icr.io/ibm-compass/compass-app:latest"
$APP_NAME = "compass-app"
$PROJECT  = "ibm-compass"

Write-Host ""
Write-Host "IBM Compass -- Deploy" -ForegroundColor Cyan
Write-Host "------------------------------------" -ForegroundColor DarkGray
Write-Host "   Data source : $DataDir" -ForegroundColor DarkGray
Write-Host "   Image       : $IMAGE" -ForegroundColor DarkGray

# -- 1. Build Docker image -----------------------------------------------------
Write-Host ""
Write-Host "[1/4] Building Docker image..." -ForegroundColor Yellow
docker build --build-arg "DATA_SRC=$DataDir" -t $IMAGE .
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Docker build failed." -ForegroundColor Red; exit 1 }
Write-Host "OK: Build complete." -ForegroundColor Green

# -- 2. Log in to IBM Container Registry ---------------------------------------
Write-Host ""
Write-Host "[2/4] Logging into IBM Container Registry..." -ForegroundColor Yellow
ibmcloud cr login
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: CR login failed. Run: ibmcloud login --sso" -ForegroundColor Red; exit 1 }

# -- 3. Push image -------------------------------------------------------------
Write-Host ""
Write-Host "[3/4] Pushing image to IBM Container Registry..." -ForegroundColor Yellow
docker push $IMAGE
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Push failed." -ForegroundColor Red; exit 1 }
Write-Host "OK: Image pushed." -ForegroundColor Green

# -- 4. Update / create Code Engine application --------------------------------
Write-Host ""
Write-Host "[4/4] Updating Code Engine application..." -ForegroundColor Yellow
ibmcloud ce project select --name $PROJECT
ibmcloud ce application update --name $APP_NAME --image $IMAGE
if ($LASTEXITCODE -ne 0) {
    Write-Host "NOTE: Update failed -- trying first-time create..." -ForegroundColor Yellow
    ibmcloud ce application create `
        --name $APP_NAME `
        --image $IMAGE `
        --port 3000 `
        --min-scale 1 `
        --max-scale 3 `
        --memory 2G `
        --cpu 0.5
}

Write-Host ""
Write-Host "Deploy complete!" -ForegroundColor Green

# -- Print the live URL --------------------------------------------------------
$url = ibmcloud ce application get --name $APP_NAME --output json |
       ConvertFrom-Json |
       Select-Object -ExpandProperty status |
       Select-Object -ExpandProperty url
Write-Host "Live URL: $url" -ForegroundColor Cyan
Write-Host ""
