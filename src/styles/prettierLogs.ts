import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';
import gradient from 'gradient-string';

const titleGradient = gradient(['#36D7B7', '#3498DB', '#9B59B6']);
const codeGradient = gradient(['#3498DB', '#2980B9', '#1F618D']);

export const printAppTitle = () => {
  console.log('\n');

  const title = figlet.textSync('CodeWhisper', {
    font: 'ANSI Shadow',
    horizontalLayout: 'full'
  });

  console.log(titleGradient(title));

  const titleLines = title.split('\n');
  const titleWidth = Math.max(...titleLines.map(line => line.length));
  const tagline = 'Seu assistente de código inteligente!';
  const credits = 'github: kristyancarvalho'
  const padding = Math.floor((titleWidth - tagline.length) / 2);

  console.log(`${' '.repeat(padding)}${chalk.cyan(tagline)}\n`);
  console.log(`${' '.repeat(padding)}${chalk.grey(credits)}\n`);
};

export const printError = (message: string) => {
  console.log(boxen(chalk.redBright(`✖ ERRO: ${message}`), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'red'
  }));
};

export const printSuccess = (message: string) => {
  console.log(boxen(chalk.greenBright(`✓ SUCESSO: ${message}`), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green'
  }));
};

export const printWarning = (message: string) => {
  console.log(boxen(chalk.yellowBright(`⚠ AVISO: ${message}`), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'yellow'
  }));
};

export const printInfo = (message: string) => {
  console.log(boxen(chalk.blueBright(`ℹ INFO: ${message}`), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    textAlignment: 'center'
  }));
};

export const printCommandList = (commands: {name: string, description: string}[]) => {
  console.log(boxen(
    chalk.cyanBright('📋 COMANDOS DISPONÍVEIS:\n\n') +
    commands.map(cmd => 
      `  ${chalk.greenBright(cmd.name.padEnd(15))} ${cmd.description}`
    ).join('\n'),
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));
};

export const printFileAdded = (filePath: string) => {
  console.log(
    chalk.green('📄 ') + 
    chalk.white('Arquivo adicionado: ') + 
    chalk.yellowBright(filePath)
  );
};

export const printFilesDiscovered = (files: string[]) => {
  console.log(boxen(
    chalk.cyanBright('🔍 ARQUIVOS DESCOBERTOS:\n\n') +
    files.map((file, index) => 
      `  ${chalk.green((index + 1).toString().padEnd(3))} ${chalk.yellowBright(file)}`
    ).join('\n'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'blue'
    }
  ));
};

export const printUserMessage = (message: string) => {
  console.log(chalk.green('\n💬 Você: ') + message);
};

export const printAssistantMessage = (message: string) => {
  const formattedMessage = message.replace(/```([^`]+)```/g, (match, code) => {
    return '\n' + boxen(codeGradient(code), {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'yellow'
    }) + '\n';
  });
  
  console.log(chalk.blue('\n🤖 Assistente: ') + formattedMessage);
};

export const printDebug = (message: string) => {
  console.log(chalk.grey(`[DEBUG] ${message}`));
};

export const printSeparator = () => {
  console.log(chalk.gray('\n' + '─'.repeat(50) + '\n'));
};

export const printCodeContext = (fileCount: number) => {
  printSuccess(`${fileCount} arquivo(s) carregado(s) como contexto`);
};

export const printWaitingInput = () => {
  console.log(chalk.cyan('\nAguardando sua pergunta...'));
};

export const printModelInfo = (model: string) => {
  console.log(chalk.grey(`\nModelo em uso: ${chalk.white(model)}`));
};

export const printThinking = () => {
  console.log(chalk.cyan('\n⏳ Pensando...\n'));
};

export const printExitMessage = () => {
  console.log(boxen(
    gradient(['#5A4FCF', '#3498DB'])('👋 Sessão encerrada!\nAté a próxima!'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      textAlignment: 'center'
    }
  ));
};