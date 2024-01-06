import { program } from 'commander';
import pageLoader from './pageLoader.js';

program
  .name('page-loader')
  .description('CLI для скачивания ресурсов сайта')
  .version('1.0.0');

program
  .argument('<url>', 'Url для скачивания')
  .option('-o, --output <dir>', `Путь для сохранения файлов. По умолчанию ${process.cwd()}`)
  .action(async (url, options) => {
    try {
      console.log('Начало скачивания...');
      await pageLoader(url, options.output);
      console.log(`Страница ${url} была успешно скачана в ${options.output || 'текущую директорию'}`);
    } catch (error) {
      console.error(error || 'Неизвестная ошибка. Проверте url для скачивания');
    }
  });

program.parse();