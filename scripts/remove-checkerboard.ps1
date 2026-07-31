param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies "System.Drawing.dll" -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class CheckerboardRemover
{
    public static void Process(string inputPath, string outputPath)
    {
        using (var source = new Bitmap(inputPath))
        using (var bitmap = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb))
        {
            using (var graphics = Graphics.FromImage(bitmap))
            {
                graphics.DrawImageUnscaled(source, 0, 0);
            }

            var rectangle = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
            var locked = bitmap.LockBits(rectangle, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            var bytes = Math.Abs(locked.Stride) * locked.Height;
            var pixels = new byte[bytes];
            Marshal.Copy(locked.Scan0, pixels, 0, bytes);

            var width = bitmap.Width;
            var height = bitmap.Height;
            var visited = new byte[width * height];
            var queue = new int[width * height];
            var head = 0;
            var tail = 0;

            Func<int, bool> isBackground = delegate(int index)
            {
                var x = index % width;
                var y = index / width;
                var offset = y * locked.Stride + x * 4;
                var blue = pixels[offset];
                var green = pixels[offset + 1];
                var red = pixels[offset + 2];
                var maximum = Math.Max(red, Math.Max(green, blue));
                var minimum = Math.Min(red, Math.Min(green, blue));
                return maximum - minimum <= 11 && (red + green + blue) / 3 >= 228;
            };

            Action<int> enqueue = delegate(int index)
            {
                if (visited[index] != 0 || !isBackground(index)) return;
                visited[index] = 1;
                queue[tail++] = index;
            };

            for (var x = 0; x < width; x++)
            {
                enqueue(x);
                enqueue((height - 1) * width + x);
            }

            for (var y = 0; y < height; y++)
            {
                enqueue(y * width);
                enqueue(y * width + width - 1);
            }

            while (head < tail)
            {
                var index = queue[head++];
                var x = index % width;
                var y = index / width;
                if (x > 0) enqueue(index - 1);
                if (x < width - 1) enqueue(index + 1);
                if (y > 0) enqueue(index - width);
                if (y < height - 1) enqueue(index + width);
            }

            for (var index = 0; index < visited.Length; index++)
            {
                if (visited[index] == 0) continue;
                var x = index % width;
                var y = index / width;
                pixels[y * locked.Stride + x * 4 + 3] = 0;
            }

            Marshal.Copy(pixels, 0, locked.Scan0, bytes);
            bitmap.UnlockBits(locked);
            bitmap.Save(outputPath, ImageFormat.Png);
        }
    }
}
"@

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
[CheckerboardRemover]::Process($resolvedInput, $resolvedOutput)
