import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import nock from 'nock';

import pageLoader, { getFilename } from '../src/pageLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HOST = 'https://ru.hexlet.io';
let tmpDir = '';
let initialHtml;
let expectHtml;
let expectImg;
let expectJs;
let expectCss;
let scope;

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFile(getFixturePath(filename), 'utf-8');

describe('page-loader', () => {
  beforeAll(async () => {
    nock.disableNetConnect();

    initialHtml = await readFile('index_before.html');
    expectHtml = await readFile('index_after.html');
    expectImg = await readFile('nodejs_logo.png');
    expectJs = await readFile('runtime.js');
    expectCss = await readFile('application.css');

    scope = nock(HOST)
      .get('/courses')
      .reply(200, initialHtml)
      .get('/assets/professions/nodejs.png')
      .reply(200, expectImg)
      .get('/packs/js/runtime.js')
      .reply(200, expectJs)
      .get('/assets/application.css')
      .reply(200, expectCss)
      .get('/courses')
      .reply(200, initialHtml);
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  test('Получение названия файла или папки', () => {
    const url = 'https://ru.hexlet.io/courSES_12';
    const htmlFile = getFilename(url, '.html');
    const folder = getFilename(url, '_files');

    expect(htmlFile).toBe('ru-hexlet-io-courses-12.html');
    expect(folder).toBe('ru-hexlet-io-courses-12_files');
  });

  test('Скачивание файлов', async () => {
    const htmlFilepath = path.join(tmpDir, 'ru-hexlet-io-courses.html');
    const imgFilepath = path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png');
    const jsFilepath = path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-packs-js-runtime.js');
    const cssFilepath = path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-application.css');

    const response = await pageLoader(`${HOST}/courses`, tmpDir);
    const resultHTML = await fs.readFile(htmlFilepath, 'utf-8');
    const resultImg = await fs.readFile(imgFilepath, 'utf-8');
    const resultJs = await fs.readFile(jsFilepath, 'utf-8');
    const resultCss = await fs.readFile(cssFilepath, 'utf-8');

    expect(scope.isDone()).toBeTruthy();
    expect(response?.filepath).toBe(htmlFilepath);
    expect(resultHTML).toBe(expectHtml);
    expect(resultImg).toBe(expectImg);
    expect(resultJs).toBe(expectJs);
    expect(resultCss).toBe(expectCss);
  });
});
