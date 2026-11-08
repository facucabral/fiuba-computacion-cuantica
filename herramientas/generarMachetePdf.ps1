# Genera material/machete.pdf imprimiendo la página del machete con Edge sin interfaz.
# Requiere el sitio servido en http://localhost:5173 (python -m http.server 5173).
# Usa un perfil temporal nuevo para que Edge no reutilice CSS viejo de su caché.
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$perfil = Join-Path $env:TEMP ("machete-" + [guid]::NewGuid())
$salida = Join-Path $PSScriptRoot "..\material\machete.pdf"
& $edge --headless=new --disable-gpu --no-first-run "--user-data-dir=$perfil" --virtual-time-budget=20000 `
  --run-all-compositor-stages-before-draw --no-pdf-header-footer "--print-to-pdf=$salida" `
  "http://localhost:5173/?imprimir=$(Get-Random)#/machete"
Remove-Item -Recurse -Force $perfil -ErrorAction SilentlyContinue
