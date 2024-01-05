import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';

/**
 * Генерирует имя файла из переданного урла
 *
 * @param {string} url – урл для генерации ex. https://your-site.ru
 * @returns {string}
 */
export const getFilenameByUrl = (url) => {
  try {
    const { hostname, pathname } = new URL(url);
    const filename = [hostname, pathname].join('').toLocaleLowerCase().replace(/[\W_]+/gi, '-');
    return `${filename}.html`;
  } catch (error) {
    throw new Error(`Переданный аргумент ${url} не является урлом`);
  }
};

/**
 * Скачивает страницу и сохраняет в папку.
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

  const filename = getFilenameByUrl(url);

  const { data } = await axios.get(url);

  await fs.writeFile(path.join(src, filename), data);

  return { filepath: path.join(src, filename) };
}
