# informatika-test4
Тестовое задание для АО Информатика на должность Программист-разработчик.

### Задание
Необходимо хранить информацию о товарах (единице его измерения,  виде его упаковки). Также необходимо хранить информацию о складах (адресе склада, наличие на нем специализированной техники, площади склада). Товар может перемещаться со склада на склад.

Нужно получать данные в табличном виде:
- Отчет о складах пустующих за определенный период времени, со всей информацией по складу
- Интенсивность использования складов
- История движение товара на складе за определенный период
- Отчет о движении заданного товара по складам

В результате нужно получить структуру взаимосвязанных таблиц и работающие запросы (с необходимыми параметрами) в соответствии с приведенным списком заданий.  Необходимо заполнить структуры  данными для тестирования запросов, дать описание параметров.

### Инициализация
- Склонируйте репозиторий, установите зависимости
- Создайте тестовую базу данных PostgreSQL
- Создайте в корне проекта файл с именем '.env' со следующим контентом:
```
PORT=<порт_веб_сервера> (опционально, по умолчанию используется 3000)
PG_USER=<пользователь_PostgreSQL>
PG_PASSWORD=<пароль_PostgreSQL>
PG_HOST=<хост_PostgreSQL> (для запуска на локальной БД "localhost")
PG_PORT=<порт_PostgeSQL> (по умолчанию 5432)
PG_DB_NAME=<название_тестовой_БД>

```
- Создайте тестовые записи в базе данных: ``npm run populatedb``
- Запустите сервер: ``npm run start``

### API
Для получения данных в виде HTML таблиц используйте следующие эндпоинты:
- __/goods__ - все записи из таблицы goods
- __/warehouses__ - все записи из таблицы warehouses
- __/equipment__ - все записи из таблицы equipment 
- __/warehouses/equipment__ - все оборудование на всех складах
- __/warehouses/load?date=\*__ - статистика загруженности всех складов на указанную дату. Параметр ``date`` - время в формате YYYY-MM-DD
- __/warehouses/trafic?start=\*&end=\*__ - статистика передвижений товара на всех складах за период времени. Параметры ``start`` и ``end`` - дата начала и конца отчетного периода в формате YYYY-MM-DD
- __/warehouse/trafic?name=\*start=\*&end=\*__- история передвижений товара на заданном складе за период времени. Параметр ``name`` - имя склада, параметры ``start`` и ``end`` - дата начала и конца отчетного периода в формате YYYY-MM-DD
- __/goods/trafic?name=\*__ - история передвижений заданного товара. Параметр ``name`` - наименование товара

Для получения данных в формате JSON добавьте '/api' перед любым эндпоинтом. Например:
- __/api/goods__ - все записи из таблицы goods в формате JSON
