import { parseCommandLineArgs, validateArgs, printUsage } from './utils/cliUtils';
import { runInteractiveMode } from './modes/interactiveMode';
import { runSinglePromptMode } from './modes/singlePromptMode';
import { logError } from './styles/prettierLogs';

const main = async () => {
  try {
    const args = process.argv.slice(2);
    const parsedArgs = parseCommandLineArgs(args);
    
    validateArgs(parsedArgs);
    
    if (parsedArgs.interactive) {
      await runInteractiveMode(
        parsedArgs.model, 
        parsedArgs.filePaths, 
        parsedArgs.prompt, 
        parsedArgs.autoDiscover,
        parsedArgs.maxFiles,
        parsedArgs.basePath
      );
    } else {
      await runSinglePromptMode(
        parsedArgs.filePaths, 
        parsedArgs.prompt!, 
        parsedArgs.model,
        parsedArgs.autoDiscover || false,
        parsedArgs.maxFiles,
        parsedArgs.basePath
      );
    }
  } catch (error: any) {
    logError(error.message);
    printUsage();
    process.exit(1);
  }
};

main();