#!/usr/bin/env bash
# Atalho 1-clique pra iniciar o Digistore Forge local.
# Duplo-clique neste arquivo no Finder — Terminal abre, servidor sobe, browser abre.

cd "$(dirname "$0")"

# abre o navegador imediatamente (vai recarregar sozinho quando o server subir)
open "http://localhost:3100" 2>/dev/null &

# se por algum motivo pnpm não estiver no PATH do launchd, fallback via nvm/homebrew
if ! command -v pnpm >/dev/null 2>&1; then
  export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/current/bin:$PATH"
fi

exec pnpm dev
