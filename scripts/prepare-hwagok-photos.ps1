param(
    [string]$SourceDirectory = (Join-Path $PSScriptRoot '..\..\강의사진')
)

# Create web assets without changing the user-provided source photographs.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectDirectory = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$photoDirectory = Join-Path $projectDirectory 'public\images\education'
$thumbnailDirectory = Join-Path $photoDirectory 'thumbnails'
$reviewDirectory = Join-Path $projectDirectory 'output\news-review'
[IO.Directory]::CreateDirectory($thumbnailDirectory) | Out-Null
[IO.Directory]::CreateDirectory($reviewDirectory) | Out-Null
$jpegEncoder = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -EQ 'image/jpeg'

function Save-WebPhoto([string]$SourcePath, [string]$TargetPath, [int]$MaxWidth, [long]$Quality) {
    $sourceImage = [Drawing.Image]::FromFile($SourcePath)
    try {
        $targetWidth = [Math]::Min($MaxWidth, $sourceImage.Width)
        $targetHeight = [int][Math]::Round($sourceImage.Height * $targetWidth / $sourceImage.Width)
        $bitmap = [Drawing.Bitmap]::new($targetWidth, $targetHeight)
        $graphics = [Drawing.Graphics]::FromImage($bitmap)
        $encoderParameters = [Drawing.Imaging.EncoderParameters]::new(1)
        try {
            $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.DrawImage($sourceImage, 0, 0, $targetWidth, $targetHeight)
            $encoderParameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality, $Quality)
            $bitmap.Save($TargetPath, $jpegEncoder, $encoderParameters)
        } finally {
            $encoderParameters.Dispose()
            $graphics.Dispose()
            $bitmap.Dispose()
        }
    } finally {
        $sourceImage.Dispose()
    }
}

$photoManifest = @()
for ($photoIndex = 0; $photoIndex -lt 16; $photoIndex++) {
    $suffix = if ($photoIndex -eq 0) { '' } else { '_{0:00}' -f $photoIndex }
    $sourcePath = Join-Path $SourceDirectory "KakaoTalk_20260928_180305561$suffix.jpg"
    $assetName = 'hwagok-ai-{0:00}.jpg' -f ($photoIndex + 5)
    $targetPath = Join-Path $photoDirectory $assetName
    $thumbnailPath = Join-Path $thumbnailDirectory $assetName
    $sourceHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash
    Save-WebPhoto $sourcePath $targetPath 1600 86
    Save-WebPhoto $sourcePath $thumbnailPath 240 78
    if ((Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash -ne $sourceHash) {
        throw "Source photo changed: $sourcePath"
    }
    $photoManifest += [PSCustomObject]@{
        source = [IO.Path]::GetFileName($sourcePath)
        sourceSha256 = $sourceHash
        sourceBytes = (Get-Item -LiteralPath $sourcePath).Length
        asset = $assetName
        webBytes = (Get-Item -LiteralPath $targetPath).Length
        thumbnailBytes = (Get-Item -LiteralPath $thumbnailPath).Length
    }
}

for ($photoIndex = 1; $photoIndex -le 4; $photoIndex++) {
    $assetName = 'hwagok-ai-{0:00}.jpg' -f $photoIndex
    Save-WebPhoto (Join-Path $photoDirectory $assetName) (Join-Path $thumbnailDirectory $assetName) 240 78
}
$photoManifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $reviewDirectory 'hwagok-photo-manifest.json') -Encoding utf8
[PSCustomObject]@{
    AddedPhotos = $photoManifest.Count
    OriginalBytes = ($photoManifest | Measure-Object sourceBytes -Sum).Sum
    WebBytes = ($photoManifest | Measure-Object webBytes -Sum).Sum
    ThumbnailBytes = (Get-ChildItem -LiteralPath $thumbnailDirectory -File | Measure-Object Length -Sum).Sum
}
