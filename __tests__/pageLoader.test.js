import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const getFixturePath = (filename) => path.join(_dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFile(getFixturePath(filename), 'utf-8');

beforeAll(() => {
  
})

beforeEach(() => {
  
})

test('тестик', () => {
  expect(1).toBe(1)
})