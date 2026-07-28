$root = 'C:\Users\User\Desktop\ecommerce'
$pkg = Get-Content "$root/package.json" -Raw | ConvertFrom-Json
$pkg.devDependencies | Add-Member -NotePropertyName '@tailwindcss/postcss' -NotePropertyValue '^4.3.3' -Force
$pkg.devDependencies.tailwindcss = '^4.3.3'
$pkg.devDependencies.postcss = '^8.4.23'
$pkg.devDependencies.autoprefixer = '^10.5.4'
$pkg | ConvertTo-Json -Depth 10 | Set-Content "$root/package.json" -Encoding utf8
Set-Content "$root/postcss.config.cjs" -Value "module.exports = {`n  plugins: {`n    '@tailwindcss/postcss': {},`n    autoprefixer: {},`n  },`n};`n" -Encoding utf8
$content = Get-Content "$root/app/globals.css" -Raw
$content = $content -replace '@tailwind base;\s*@tailwind components;\s*@tailwind utilities;\s*', '@import "tailwindcss";`n'
Set-Content "$root/app/globals.css" -Value $content -Encoding utf8
