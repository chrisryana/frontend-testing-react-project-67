## Скачивание остальных ресурсов

Реализуйте скачивание всех локальных ресурсов из тегов `link` и `script`.

Например, по ссылке https://ru.hexlet.io/courses (делать запрос туда не нужно, используйте фикстуры ниже) отдаётся такая страница:

```html
<!-- Используйте этот код в своём проекте -->
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <title>Курсы по программированию Хекслет</title>
    <link rel="stylesheet" media="all" href="https://cdn2.hexlet.io/assets/menu.css">
    <link rel="stylesheet" media="all" href="/assets/application.css" />
    <link href="/courses" rel="canonical">
  </head>
  <body>
    <img src="/assets/professions/nodejs.png" alt="Иконка профессии Node.js-программист" />
    <h3>
      <a href="/professions/nodejs">Node.js-программист</a>
    </h3>
    <script src="https://js.stripe.com/v3/"></script>
    <script src="https://ru.hexlet.io/packs/js/runtime.js"></script>
  </body>
</html>
```

Тогда скачанная страница с обработанными ссылками будет выглядеть так:

```html
<!-- Используйте этот код в своём проекте -->
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <title>Курсы по программированию Хекслет</title>
    <link rel="stylesheet" media="all" href="https://cdn2.hexlet.io/assets/menu.css">
    <link rel="stylesheet" media="all" href="ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css">
    <link href="ru-hexlet-io-courses_files/ru-hexlet-io-courses.html" rel="canonical">
  </head>
  <body>
    <img src="ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png" alt="Иконка профессии Node.js-программист">
    <h3>
      <a href="/professions/nodejs">Node.js-программист</a>
    </h3>
    <script src="https://js.stripe.com/v3/"></script>
    <script src="ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js"></script>
  </body>
</html>
```

## Задачи

1. Добавьте в тесты проверку скачивания ресурсов и изменения HTML.
2. Реализуйте скачивание всех локальных ресурсов со страницы.
3. Измените HTML так, чтобы все ссылки на локальные ресурсы указывали на скачанные файлы.
4. Добавьте в ридми аскинему с примером работы пакета.

## Подсказки

- [URL](https://nodejs.org/api/url.html#url_the_whatwg_url_api) – правильная работа с веб-адресами. Обратите внимание на второй параметр, он может сильно помочь при определении локальности ссылок.
- ресурс на cdn2.hexlet.io проигнорирован, потому что находится на другом хосте.