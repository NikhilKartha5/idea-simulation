param(
  [string]$Region = "us-east-1"
)

$ErrorActionPreference = 'Stop'
Write-Host "Detecting AWS account..."
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
if(-not $ACCOUNT_ID){ throw 'Could not determine AWS account id'; }

$repo = "$ACCOUNT_ID.dkr.ecr.$Region.amazonaws.com/ideas-gateway:latest"
Write-Host "Building gateway image with embedded frontend..."
# Build from project root so the multi-stage Dockerfile can access frontend
Push-Location (Split-Path $MyInvocation.MyCommand.Path -Parent)\..

docker build -t ideas-gateway -f gateway/Dockerfile .
if($LASTEXITCODE -ne 0){ throw 'Docker build failed'; }

Write-Host "Logging into ECR..."
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$Region.amazonaws.com"

Write-Host "Tagging image -> $repo"
docker tag ideas-gateway:latest $repo

Write-Host "Pushing image..."
docker push $repo
if($LASTEXITCODE -ne 0){ throw 'Docker push failed'; }

Write-Host "Done. Now cycle one ASG instance (terminate) or perform rolling update so new image is used." 
Pop-Location
