## Школа разработки интерфейсов 2017
### Вступительное задание №2

>Напишите библиотеку, предоставляющую API для работы с расписанием лекций из первого задания.

Решение представляет собой сервер, построенный на базе фреймворка Express. Сервер предоставляет REST API.
При проектировании API руководствовалась рекомендациями из стратьи на [habrahabr](https://habrahabr.ru/post/181988/).

Хранение данных производится при помощи MongoDB.
Взаимодействие с MongoDB осуществляется при помощи mongoose.

Тестирование производится при помощи Mocha и chai. При написании тестов руководствовалась статьёй на [ScotchIO](https://scotch.io/tutorials/test-a-node-restful-api-with-mocha-and-chai) и документацией chai.

Для разработки пользовательского интерфейса использованы React + Redux. При разработке руководствовалась серией статей из блога [thegreatcodeadventure](http://www.thegreatcodeadventure.com/building-a-simple-crud-app-with-react-redux-part-1/).

#### Структура API
В проекте выделено 3 основных сущности: лекция, школа, аудитория.
Схемы для них можно найти в директории /models.

Для оперирования данными предоставляютя следующие запросы:
* [GET] [/v1/lectures/school/:id]()- возвращает все лекции для данной школы.
  В параметрах запроса можно передать from и to (даты начала и окнончания поиска) в формате гггг-мм-дд
* [GET] [/v1/lectures/classroom/:id]() - возвращает все лекции для данной аудитории.
  в параметрах запроса можно передать from и to (даты начала и окнончания поиска) в формате гггг-мм-дд
* [GET] [/v1/lectures]() - возвращает данные всех лекций
* [GET] [/v1/lectures/:id]() - возвращает данные лекции по id
* [POST] [/v1/lectures]() - служит для создания новой лекции
  в параметрах ожидаются следующие данные:
  * name - название лекции
  * date - дата, ожидается в формате: гггг-мм-дд чч-мм
  * classroom - id (для создания лекции необходимо предварительно создать аудиторию и передать её id)
  * schools[] - id[] (для создания лекции необходимо предварительно создать по крайней мере одну школу и передать её id)
  * teacher - фамилия преподавателя
* [PUT] [/v1/lectures/:id]() - служит для редактирования данных школы
  в параметрах ожидаются одни из слудующих данных:
  * name - название лекции
  * date - дата, ожидается в формате: гггг-мм-дд чч-мм
  * classroom - id (для создания лекции необходимо предварительно создать аудиторию и передать её id)
  * schools[] - id[] (для создания лекции необходимо предварительно создать по крайней мере одну школу и передать её id)
  * teacher - фамилия преподавателя
* [DELETE] [/v1/lectures/:id]() - служит для удаления лекции по id
* [GET] [/v1/classrooms]() - возвращает данные всех аудитории
* [GET] [/v1/classrooms/:id]() - возвращает данные аудитории по id
* [POST] [/v1/classrooms]() - служит для создания новой аудитории
  в параметрах ожидаются следующие данные:
  name - название аудитории
  location - местоположение аудитории
  volume - число посадочных мест в аудитории
* [PUT] [/v1/classrooms/:id]() - служит для редактирования данных аудитории
  в параметрах ожидаются одни из следующих данных:
  name - название аудитории
  location - местоположение аудитории
  volume - число посадочных мест в аудитории
* [DELETE] [/v1/classrooms/:id]() - служит для удаления аудитории по id
* [GET] [/v1/schools]() - возвращает данные всех школ
* [GET] [/v1/schools/:id]() - возвращает данные школы по id
* [POST] [/v1/schools]() - служит для добавления школы
  в параметрах ожидаются следующие данные:
  name - название школы
  students - число учащихся
* [PUT] [/v1/schools/:id]() - служит для редактирования данных школы по id
  в параметрах ожидаются одни из следующих данных:
  name - название школы
  students - число учащихся
* [DELETE] [/v1/schools/:id]() - служит для удаления школы по id

Для корректной работы сервера необходимо установить последнюю версию NodeJS и MongoBD.
Запустить сервер можно при помощи команды npm start из основной директории проекта.
Сервер запустится по адресу 9090. Для конфигурации следует использовать файлы, находящиеся в директории /config.

#### Структура проекта
Серверная часть:
* [/config]() - конфигурационные файлы. Здесь можно указать порт для запуска сервера и базу данных.
* [/controllers]() - в директории находится "мозг" сервера. В файл 'crudHelper.js' вынесены переиспользуемые функции.
* [/models]() - модели сущностей БД.
* [/routes]() - пути и обработчики для них вынесены в отдельный файл.
* [/test]() - тесты для сервера (разделены по сущностям для более удобного ориентирования)
* [server.js]() - непосредственно файл сервера.

Директории веб-интерфейса:
* [/public]() - директория содержит статические ресурсы и скомпилированный js код ('bundle.js')
* [/src]() - директория содержит исходный код веб-интерфейса

#### Веб-интерфейс
Для доступа к веб-интерфейсу необходимо обратиться по пути [/]().
В веб-интерфейсе доступно 4 страницы:
* [indexPage]() - на странице отображаются перечни лекций, школ и удиторий.
На данной странице либо посмотреть данные лекций, школ или аудиторий, либо добавить новые.
* [lecturePage]() - на странице отображаются данные лекции, а так же можно редактировать лекцию или удалить её.
* [classroomPage]() - на странице отображаются данные аудитории, а так же можно редактировать адуиторию или удалить её.
* [schoolPage]() - на странице отображаются данные школы, а так же можно редактировать школу или удалить её.
