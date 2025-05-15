#!/bin/bash

set -e

echo "🚀 Iniciando instalação do CodeWhisper CLI..."

command -v node >/dev/null 2>&1 || { echo >&2 "❌ Node.js não está instalado. Instale e tente novamente."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "❌ npm não está instalado. Instale e tente novamente."; exit 1; }

if [ ! -d "codewhisper-cli" ]; then
  echo "🔄 Clonando repositório..."
  git clone https://github.com/kristyancarvalho/codewhisper-cli.git
fi

cd codewhisper-cli

echo "📦 Instalando dependências..."
npm install

echo "🛠️ Compilando o projeto..."
npm run build

echo "🔧 Ajustando permissões..."
chmod +x bin/codewhisper

echo "🔗 Criando link simbólico..."
sudo ln -sf $(pwd)/bin/codewhisper /usr/local/bin/codewhisper

echo "✅ Instalação concluída com sucesso!"
echo ""
echo "⚠️ Lembre-se de configurar a variável de ambiente OPENROUTER_API_KEY em seu ~/.bashrc ou ~/.zshrc:"
echo 'export OPENROUTER_API_KEY="sua_chave_api_aqui"'
echo ""
echo "Exemplo de uso:"
echo '  codewhisper -F caminho/do/arquivo -P "Sua pergunta aqui"'
