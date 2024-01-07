import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import * as cheerio from 'cheerio';
import debug from 'debug';
import 'axios-debug-log';

const log = debug('page-loader');

/**
 * Ошибки node по кодам
 * @link https://severclimat.ru/node-js-error-codes/
 */
const ERRORS_BY_CODE = {
  ECONNREFUSED: '✗ Кажется сайт, который вы хотите скачать больше не доступен. Проверьте, что он открывается в браузере и попробуйте еще раз\n',
  ENOENT: '✗ Папка не найдена. Создайте ее и попробуйте еще раз\n',
  EACCES: '✗ Нет прав для выполнения\n',
  ETIMEDOUT: '✗ Процесс экстренно завершен изза превышения по времени\n',
  EEXIST: '✗ Папка для файлов сайта уже существует. Удалите или выберите другой путь для сохранения\n',
};

/**
 * Генерирует имя файла или папки из переданной строки
 *
 * @param {string} string – строка для генерации названия или пути файла
 * @param {string} extension – расширение файла или окончание для названия папки
 * @returns {string}
 */
export const getFilename = (string, extension) => {
  // Убираем протокол, заменяем все символы кроме букв и цифр на дефис
  const filename = string.toLocaleLowerCase().replace(/https?:\/\//, '').replace(/[\W_]+/gi, '-');

  return `${filename}${extension}`;
};

/**
 * Скачивает страницу и сохраняет ее в папку.
 * Если директория для сохранения не передана, то сохраняет в папку откуда был вызов скрипта.
 * Возвращает объект со свойством filepath, который содержит полный путь до загруженного html-файла.
 *
 * @param {string} url – урл для скачивания в формате https://your-site.ru
 * @param {string} src – папка для сохранения
 * @return {object} { filepath: string }
 */
export default async function pageLoader(url, src = process.cwd()) {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (error) {
    throw new Error(`Невалидный url: ${url}`);
  }

  const filename = getFilename(url, '.html');
  const assetsFolder = getFilename(url, '_files');

  const { data: html } = await axios.get(url);

  try {
    await fs.mkdir(path.join(src, assetsFolder));
    log('Создана папка', path.join(src, assetsFolder));
  } catch (error) {
    log('Ошибка создания папки', error);
    throw new Error(`${ERRORS_BY_CODE[error.code]} ${error.path}`);
  }

  const $ = cheerio.load(html, { decodeEntities: false });
  const srcList = [];

  // eslint-disable-next-line func-names
  $('img, link, script').each(function () {
    const attrName = $(this)[0].name === 'link' ? 'href' : 'src';
    const oldAttrValue = $(this).attr(attrName);
    const oldSrc = new URL(oldAttrValue, url);
    const entryLink = new URL(url);

    // Не скачиваем ресурсы с других доменов, даже с cdn
    if (oldSrc.origin === entryLink.origin && oldAttrValue) {
      const oldSrcSplited = oldSrc.pathname.split('/');
      const oldPath = oldSrcSplited.slice(0, -1);
      const file = oldSrcSplited.at(-1);
      const [fileName, fileExt] = file.split('.');

      const newFileName = getFilename([oldSrc.origin, oldPath, fileName].join('-'), `.${fileExt || 'html'}`);
      const newSrc = path.join(src, assetsFolder, newFileName);
      $(this).attr(attrName, path.join(assetsFolder, newFileName));

      srcList.push({ fileSrc: oldSrc.href, filePath: newSrc });
    }
  });

  await Promise.all([
    // Сохряняем html
    fs.writeFile(path.join(src, filename), $.html()),

    // Сохраняем все найденные файлы
    ...srcList.map(({ fileSrc, filePath }) => {
      log(`Начало запроса к ${fileSrc}`);
      return axios.get(fileSrc, { responseType: 'arraybuffer' }).then(({ data: file }) => {
        log(`Запись файла в ${filePath}`);
        console.log('✓', fileSrc);
        return fs.writeFile(filePath, file);
      });
    }),
  ]).catch((error) => {
    log(error);

    if (ERRORS_BY_CODE[error.code]) {
      console.log('✗', error.path.split('/').at(-1));
      throw new Error(`${ERRORS_BY_CODE[error.code]} ${error.path}`);
    } else if (error.response) {
      console.log('✗', error.config.url);
      throw new Error(`\nОшибка запроса ${error.response.status} ${error.response.statusText}`);
    } else {
      throw new Error(error.message);
    }
  });

  return { filepath: path.join(src, filename) };
}
