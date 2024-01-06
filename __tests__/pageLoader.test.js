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

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFile(getFixturePath(filename), 'utf-8');

describe('page-loader', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  test('getFilename', () => {
    const url = 'https://ru.hexlet.io/courSES_12';
    const htmlFile = getFilename(url, '.html');
    const folder = getFilename(url, '_files');

    expect(htmlFile).toBe('ru-hexlet-io-courses-12.html');
    expect(folder).toBe('ru-hexlet-io-courses-12_files');
  });

  test('Скачивание файлов', async () => {
    const initialHtml = await readFile('index_before.html');
    const expectHtml = await readFile('index_after.html');
    const nodeLogo = await readFile('nodejs_logo.png');

    const scope = nock(HOST)
      .get('/courses')
      .reply(200, initialHtml)
      .get('/assets/professions/nodejs.png')
      .reply(200, nodeLogo);

    const expectFilepath = path.join(tmpDir, 'ru-hexlet-io-courses.html');
    const expectFilepathAssets = path.join(tmpDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png');
    const response = await pageLoader(`${HOST}/courses`, tmpDir);
    const resultHTML = await fs.readFile(expectFilepath, 'utf-8');
    const resultNodeLogo = await fs.readFile(expectFilepathAssets, 'utf-8');

    expect(scope.isDone()).toBeTruthy();
    expect(response?.filepath).toBe(expectFilepath);
    expect(resultHTML).toBe(expectHtml);
    expect(resultNodeLogo).toBe(nodeLogo);
  });
});
