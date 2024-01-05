import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import nock from 'nock';

import pageLoader, { getFilenameByUrl } from '../src/pageLoader.js';

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

  test('getFilenameByUrl', () => {
    const filename = getFilenameByUrl('https://ru.hexlet.io/courSES_12');

    expect(filename).toBe('ru-hexlet-io-courses-12.html');
  });

  test('Скачивание html', async () => {
    const expectHtml = await readFile('index.html');

    const scope = nock(HOST)
      .get('/courses')
      .reply(200, expectHtml);

    const expectFilepath = path.join(tmpDir, 'ru-hexlet-io-courses.html');
    const response = await pageLoader(`${HOST}/courses`, tmpDir);
    const resultHTML = await fs.readFile(expectFilepath, 'utf-8');

    expect(scope.isDone()).toBeTruthy();
    expect(response?.filepath).toBe(expectFilepath);
    expect(resultHTML).toBe(expectHtml);
  });
});
