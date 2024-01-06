import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import * as cheerio from 'cheerio';

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
  if (!url) {
    throw new Error(`Отсутствует url: ${url} для скачивания`);
  }

  const filename = getFilename(url, '.html');
  const assetsFolder = getFilename(url, '_files');

  const { data: html } = await axios.get(url);

  await fs.mkdir(path.join(src, assetsFolder));

  const $ = cheerio.load(html, { decodeEntities: false });
  const srcList = [];

  // eslint-disable-next-line func-names
  $('img').each(function () {
    const { origin } = new URL(url);
    const oldSrc = $(this).attr('src');
    const fullOldScr = oldSrc.startsWith('http') ? oldSrc : `${origin}${oldSrc}`;

    const oldSrcSplited = oldSrc.split('/');
    const oldPath = oldSrcSplited.slice(0, -1);
    const imgFile = oldSrcSplited.at(-1);
    const [imgName, imgExt] = imgFile.split('.');
    const newImgName = getFilename([origin, oldPath, imgName].join('-'), `.${imgExt}`);
    const newSrc = path.join(src, assetsFolder, newImgName);
    $(this).attr('src', path.join(assetsFolder, newImgName));

    srcList.push({ imgSrc: fullOldScr, imgPath: newSrc });
  });

  await Promise.all([
    // Сохряняем html
    fs.writeFile(path.join(src, filename), $.html()),
    // Сохраняем все найденные картинки
    ...srcList.map(({ imgSrc, imgPath }) => {
      console.log(`Начало запроса к ${imgSrc}`);
      return axios.get(imgSrc, { responseType: 'arraybuffer' }).then(({ data: image }) => {
        console.log(`Запись файла изображения в ${imgPath}`);
        return fs.writeFile(imgPath, image);
      });
    }),
  ]);

  return { filepath: path.join(src, filename) };
}
