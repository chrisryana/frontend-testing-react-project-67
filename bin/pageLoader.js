import { program } from 'commander';
import pageLoader from '../src/pageLoader.js';

program
  .name('page-loader')
  .description('CLI для скачивания сайта и его ресурсов')
  .version('1.0.0');

program
  .argument('<url>', 'Url для скачивания')
  .option('-o, --output <dir>', `Путь для сохранения файлов. По умолчанию ${process.cwd()}`)
  .action(async (url, options) => {
    try {
      console.log('Начало загрузки...\n');
      await pageLoader(url, options.output);
    } catch (error) {
      console.error(error.message || '\nНеизвестная ошибка. Проверте url');
      process.exit(1);
    }
  });

program.parse();
