# deploy.ps1
# Script tự động deploy Google Apps Script và cập nhật link vào frontend

Write-Host "--- Bắt đầu quá trình Deploy ---" -ForegroundColor Cyan

# 1. Push code lên Google
Write-Host "1. Đang push code lên Google..."
clasp push
if ($LASTEXITCODE -ne 0) { Write-Error "Clasp push thất bại!"; exit }

# 2. Tạo version mới và lấy link web app
Write-Host "2. Đang tạo version và lấy link deployment..."
$deployInfo = clasp deploy | Out-String
Write-Host $deployInfo

# Trích xuất link Web App hoặc ID
$newLink = [regex]::Match($deployInfo, "https://script.google.com/macros/s/[a-zA-Z0-9_-]+/exec").Value

if (-not $newLink) {
    # Thử tìm ID từ định dạng "Deployed <id> @<version>"
    $idMatch = [regex]::Match($deployInfo, "Deployed ([a-zA-Z0-9_-]+) @\d+")
    if ($idMatch.Success) {
        $deploymentId = $idMatch.Groups[1].Value
        $newLink = "https://script.google.com/macros/s/$deploymentId/exec"
    }
}

if (-not $newLink) {
    Write-Error "Không tìm thấy link Web App mới từ clasp deploy!"
    exit
}

Write-Host "Link mới: $newLink" -ForegroundColor Green

# 3. Cập nhật vào index.html (Calm Diary)
Write-Host "3. Cập nhật link vào Calm Diary..."
$indexPath = "stitch_sketch_to_mobile_web/index.html"
$indexContent = Get-Content $indexPath -Raw
$newIndexContent = $indexContent -replace 'const CONFIG_GOOGLE_URL = ".*?"', "const CONFIG_GOOGLE_URL = '$newLink'"
$newIndexContent = $newIndexContent -replace "const CONFIG_GOOGLE_URL = '.*?'", "const CONFIG_GOOGLE_URL = '$newLink'"
Set-Content $indexPath $newIndexContent

# 4. Cập nhật vào utils.js (Emotea Main)
Write-Host "4. Cập nhật link vào utils.js..."
$utilsPath = "utils.js"
if (Test-Path $utilsPath) {
    $utilsContent = Get-Content $utilsPath -Raw
    $newUtilsContent = $utilsContent -replace 'const CONFIG_GOOGLE_URL = ".*?"', "const CONFIG_GOOGLE_URL = '$newLink'"
    $newUtilsContent = $newUtilsContent -replace "const CONFIG_GOOGLE_URL = '.*?'", "const CONFIG_GOOGLE_URL = '$newLink'"
    Set-Content $utilsPath $newUtilsContent
}

Write-Host "--- HOÀN TẤT ---" -ForegroundColor Cyan
