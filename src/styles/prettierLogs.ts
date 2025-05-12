import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import figlet from 'figlet';
import gradient from 'gradient-string';

const titleGradient = gradient(['#36D7B7', '#3498DB', '#9B59B6']);

export const printAppTitle = () => {
  console.log('\n');
  
  const title = figlet.textSync('CodeWhisper', {
    font: 'ANSI Shadow',
    horizontalLayout: 'full'
  });
  
  console.log(titleGradient(title));
  
  const tagline = 'Seu assistente de código inteligente!';
  console.log(`${' '.repeat(Math.floor((process.stdout.columns - tagline.length) / 2))}${chalk.cyan(tagline)}\n`);
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
    borderColor: 'blue'
  }));
};

export const createSpinner = (text: string) => {
  return ora({
    text,
    color: 'cyan',
    spinner: 'dots'
  });
};

export const printCommandList = (commands: {name: string, description: string}[]) => {
  console.log(chalk.cyanBright('\n📋 COMANDOS DISPONÍVEIS:'));
  
  const maxLength = Math.max(...commands.map(cmd => cmd.name.length));
  
  commands.forEach(cmd => {
    console.log(`  ${chalk.greenBright(cmd.name.padEnd(maxLength + 2))} ${cmd.description}`);
  });
  console.log('');
};

export const printFileAdded = (filePath: string) => {
  console.log(
    chalk.green('📄 ') + 
    chalk.white('Arquivo adicionado: ') + 
    chalk.yellowBright(filePath)
  );
};

export const printFilesDiscovered = (files: string[]) => {
  console.log(chalk.cyanBright('🔍 Arquivos descobertos:'));
  files.forEach((file, index) => {
    console.log(`  ${chalk.green(index + 1)}. ${chalk.yellowBright(file)}`);
  });
};

export const printPrompt = () => {
  return chalk.greenBright('\n➤ ');
};

export const printSeparator = () => {
  console.log(chalk.gray('\n----------------------------------------\n'));
};