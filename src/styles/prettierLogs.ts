import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import figlet from 'figlet';

export const createSpinner = (text: string) => {
  return ora({
    text,
    spinner: 'dots',
    color: 'cyan'
  });
};

export const logError = (message: string) => {
  console.error(boxen(chalk.red.bold(message), {
    padding: 1,
    borderColor: 'red',
    borderStyle: 'round'
  }));
};

export const logWarning = (message: string) => {
  console.warn(boxen(chalk.yellow(message), {
    padding: 1,
    borderColor: 'yellow',
    borderStyle: 'round'
  }));
};

export const logSuccess = (message: string) => {
  console.log(boxen(chalk.green(message), {
    padding: 1,
    borderColor: 'green',
    borderStyle: 'round'
  }));
};

export const logInfo = (message: string) => {
  console.log(boxen(chalk.blue(message), {
    padding: 1,
    borderColor: 'blue',
    borderStyle: 'round'
  }));
};

export const printAppTitle = () => {
  console.log('\n\n' + chalk.yellowBright(
        figlet.textSync('CodeWhisper', {
            font: 'ANSI Shadow',
            horizontalLayout: 'full'
        })
    )
  );
  console.log(chalk.cyan('Seu assistente de código inteligente!') + '\n');
};

export const formatAssistantMessage = (message: string) => {
  return boxen(chalk.cyan(message), {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderColor: 'cyan',
    borderStyle: 'round',
    title: chalk.white.bold('Assistente'),
    titleAlignment: 'center'
  });
};

export const formatUserMessage = (message: string) => {
  return boxen(chalk.white(message), {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderColor: 'white',
    borderStyle: 'round',
    title: chalk.white.bold('Você'),
    titleAlignment: 'center'
  });
};

export const formatCodeBlock = (code: string, language: string = '') => {
  return boxen(chalk.yellowBright(code), {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderColor: 'yellow',
    borderStyle: 'round',
    title: language ? chalk.yellow.bold(language) : undefined,
    titleAlignment: 'center'
  });
};

export const printFileList = (files: string[], title: string) => {
  console.log(chalk.cyan.bold(`\n${title}:`));
  files.forEach((file, index) => {
    console.log(`  ${chalk.green(index + 1)}. ${chalk.white(file)}`);
  });
  console.log('');
};

export const printCommandHelp = (command: string, description: string) => {
  console.log(`  ${chalk.green(command.padEnd(25))} ${chalk.white(description)}`);
};

export const printSeparator = () => {
  console.log(chalk.gray('─'.repeat(process.stdout.columns || 80)));
};