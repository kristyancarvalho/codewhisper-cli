## CodeWhisper CLI
O CodeWhisper CLI é uma ferramenta de linha de comando que utiliza a API do OpenRouter para fornecer respostas a perguntas baseadas no contexto de arquivos de código fornecidos. Ele é projetado para ser fácil de usar e configurar, permitindo que desenvolvedores obtenham ajuda em suas tarefas de programação de forma rápida e eficiente.

### Instalação e Uso

#### Pré-requisitos
- Node.js instalado (versão compatível com o projeto)
- npm ou yarn para gerenciar pacotes
- Variável de ambiente `OPENROUTER_API_KEY` configurada com a chave da API do OpenRouter

#### Passo a Passo

1. **Clone o repositório ou baixe o projeto:**
   ```bash
   git clone https://github.com/kristyancarvalho/codewhisper-cli.git
   cd codewhisper-cli
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Compile o projeto:**
   ```bash
   npm run build
   ```

4. **Configure a permissão de execução para o script:**
   ```bash
   chmod +x bin/codewhisper
   ```

5. **Crie um link simbólico para facilitar o uso do comando:**
   - Para sistemas Unix/Linux (via terminal, como root ou utilizando `sudo`):
     ```bash
     sudo ln -s $(pwd)/bin/codewhisper /usr/local/bin/codewhisper
     ```
   - Certifique-se de que `/usr/local/bin` está incluído no seu `PATH`.

6. **Defina a variável de ambiente `OPENROUTER_API_KEY`:**
   - Adicione a seguinte linha ao seu arquivo de configuração de shell (`.bashrc`, `.zshrc`, etc.):
     ```bash
     export OPENROUTER_API_KEY="sua_chave_api_aqui"
     ```
   - Reinicie o terminal ou execute `source ~/.bashrc` (ou o arquivo correspondente) para aplicar as mudanças.

7. **Execute o CodeWhisper CLI:**
   ```bash
   codewhisper -F caminho/do/arquivo -P "Sua pergunta aqui"
   ```
   - Exemplo com múltiplos arquivos:
     ```bash
     codewhisper -F arquivo1.js -F arquivo2.js -P "Sua pergunta aqui"
     ```

### Opções de Linha de Comando
- `-F` ou `--file-path`: Especifica o caminho de um arquivo. Pode ser usado múltiplas vezes.
- `-P` ou `--prompt`: Define a pergunta a ser feita.
- `-M` ou `--model`: Especifica o modelo a ser usado (opcional, padrão é `meta-llama/llama-4-maverick:free`).

#### 🚨 Extra
**Este README foi totalmente gerado pelo próprio CodeWhisper e revisado por mim.**