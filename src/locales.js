(function(root){
'use strict';
const catalog={
  "Запомнить для этого сайта":{"en":"Remember for this site","uk":"Запам'ятати для цього сайту"},
  "Микрофон":{"en":"Microphone","uk":"Мікрофон"},
  "Камера":{"en":"Camera","uk":"Камера"},
  "Запрос разрешения":{"en":"Permission request","uk":"Запит дозволу"},

  "Суммарный рабочий набор":{"en":"Total working set","uk":"Сумарний робочий набір"},
  "Рабочие наборы включают общие страницы памяти. Значение может отличаться от Диспетчера задач.":{"en":"Working sets include shared memory pages. This can differ from Task Manager.","uk":"Робочі набори включають спільні сторінки пам'яті. Значення може відрізнятися від Диспетчера завдань."},
  "Частная память":{"en":"Private memory","uk":"Приватна пам'ять"},
  "Процессы":{"en":"Processes","uk":"Процеси"},
  "Настройки": {
    "uk": "Налаштування",
    "en": "Settings",
    "de": "Einstellungen",
    "fr": "Paramètres",
    "es": "Configuración",
    "pl": "Ustawienia"
  },
  "Язык интерфейса": {
    "uk": "Мова інтерфейсу",
    "en": "Interface language",
    "de": "Sprache der Oberfläche",
    "fr": "Langue de l’interface",
    "es": "Idioma de la interfaz",
    "pl": "Język interfejsu"
  },
  "Применяется сразу.": {
    "uk": "Застосовується одразу.",
    "en": "Applies immediately."
  },
  "Меню": {
    "uk": "Меню",
    "en": "Menu"
  },
  "Новая вкладка": {
    "uk": "Нова вкладка",
    "en": "New tab",
    "de": "Neuer Tab",
    "fr": "Nouvel onglet",
    "es": "Nueva pestaña",
    "pl": "Nowa karta"
  },
  "Veyra — новая вкладка": {
    "uk": "Veyra — нова вкладка",
    "en": "Veyra — new tab"
  },
  "Вкладки": {
    "uk": "Вкладки",
    "en": "Tabs"
  },
  "Свернуть": {
    "uk": "Згорнути",
    "en": "Minimize"
  },
  "Развернуть": {
    "uk": "Розгорнути",
    "en": "Maximize"
  },
  "Закрыть": {
    "uk": "Закрити",
    "en": "Close"
  },
  "Назад": {
    "uk": "Назад",
    "en": "Back"
  },
  "Вперёд": {
    "uk": "Вперед",
    "en": "Forward"
  },
  "Обновить": {
    "uk": "Оновити",
    "en": "Reload"
  },
  "Добавить в закладки": {
    "uk": "Додати до закладок",
    "en": "Bookmark this page"
  },
  "Поиск или адрес сайта": {
    "uk": "Пошук або адреса сайту",
    "en": "Search or enter address",
    "de": "Suchen oder Adresse eingeben",
    "fr": "Rechercher ou saisir une adresse",
    "es": "Buscar o introducir dirección",
    "pl": "Szukaj lub wpisz adres"
  },
  "Адрес": {
    "uk": "Адреса",
    "en": "Address",
    "de": "Adresse",
    "fr": "Adresse",
    "es": "Dirección",
    "pl": "Adres"
  },
  "Поиск": {
    "uk": "Пошук",
    "en": "Search",
    "de": "Suche",
    "fr": "Recherche",
    "es": "Buscar",
    "pl": "Szukaj"
  },
  "Искать": {
    "uk": "Шукати",
    "en": "Search",
    "de": "Suche",
    "fr": "Recherche",
    "es": "Buscar",
    "pl": "Szukaj"
  },
  "Приватность": {
    "uk": "Приватність",
    "en": "Privacy",
    "de": "Datenschutz",
    "fr": "Confidentialité",
    "es": "Privacidad",
    "pl": "Prywatność"
  },
  "Загрузки": {
    "uk": "Завантаження",
    "en": "Downloads",
    "de": "Downloads",
    "fr": "Téléchargements",
    "es": "Descargas",
    "pl": "Pobrane"
  },
  "Боковая панель": {
    "uk": "Бічна панель",
    "en": "Sidebar"
  },
  "Панель инструментов": {
    "uk": "Панель інструментів",
    "en": "Tools panel"
  },
  "Закладки": {
    "uk": "Закладки",
    "en": "Bookmarks",
    "de": "Lesezeichen",
    "fr": "Favoris",
    "es": "Marcadores",
    "pl": "Zakładki"
  },
  "История": {
    "uk": "Історія",
    "en": "History",
    "de": "Verlauf",
    "fr": "Historique",
    "es": "Historial",
    "pl": "Historia"
  },
  "Пароли": {
    "uk": "Паролі",
    "en": "Passwords",
    "de": "Passwörter",
    "fr": "Mots de passe",
    "es": "Contraseñas",
    "pl": "Hasła"
  },
  "Производительность": {
    "uk": "Продуктивність",
    "en": "Performance"
  },
  "Временная вкладка": {
    "uk": "Тимчасова вкладка",
    "en": "Temporary tab"
  },
  "Временный профиль": {
    "uk": "Тимчасовий профіль",
    "en": "Temporary profile",
    "de": "Temporäres Profil",
    "fr": "Profil temporaire",
    "es": "Perfil temporal",
    "pl": "Profil tymczasowy"
  },
  "Защищённый профиль": {
    "uk": "Захищений профіль",
    "en": "Protected profile",
    "de": "Geschütztes Profil",
    "fr": "Profil protégé",
    "es": "Perfil protegido",
    "pl": "Profil chroniony"
  },
  "Google · совместимость": {
    "uk": "Google · сумісність",
    "en": "Google · compatibility"
  },
  "Сохранённые пароли": {
    "uk": "Збережені паролі",
    "en": "Saved passwords"
  },
  "Ресурсы": {
    "uk": "Ресурси",
    "en": "Resources"
  },
  "Память и вкладки": {
    "uk": "Пам'ять і вкладки",
    "en": "Memory and tabs"
  },
  "Общий временный профиль: без истории и сохранения паролей. Данные исчезнут после полного закрытия Veyra.": {
    "uk": "Спільний тимчасовий профіль: без історії та збереження паролів. Дані зникнуть після повного закриття Veyra.",
    "en": "Shared temporary profile: no history or password saving. Data is removed when Veyra fully closes."
  },
  "запросов заблокировано": {
    "uk": "запитів заблоковано",
    "en": "requests blocked"
  },
  "Ctrl + L — адресная строка": {
    "uk": "Ctrl + L — адресний рядок",
    "en": "Ctrl + L — address bar"
  },
  "Настроить": {
    "uk": "Налаштувати",
    "en": "Customize",
    "de": "Anpassen",
    "fr": "Personnaliser",
    "es": "Personalizar",
    "pl": "Dostosuj"
  },
  "Мягкая цель RAM": {
    "uk": "М'яка ціль RAM",
    "en": "RAM target"
  },
  "МБ": {
    "uk": "МБ",
    "en": "MB"
  },
  "Браузер усыпляет фоновые вкладки, чтобы снизить расход памяти. Значение может быть превышено.": {
    "uk": "Браузер присипляє фонові вкладки, щоб зменшити використання пам'яті. Значення може бути перевищене.",
    "en": "Background tabs are put to sleep to reduce memory use. Usage may exceed this target."
  },
  "Живых фоновых вкладок": {
    "uk": "Активних фонових вкладок",
    "en": "Live background tabs"
  },
  "Усыплять после, минут": {
    "uk": "Присипляти через, хвилин",
    "en": "Sleep after, minutes"
  },
  "Режим экономии": {
    "uk": "Режим економії",
    "en": "Efficiency mode"
  },
  "Усыплять подходящие фоновые вкладки по времени и потреблению памяти.": {
    "uk": "Присипляти фонові вкладки за часом і використанням пам'яті.",
    "en": "Put eligible background tabs to sleep based on time and memory use."
  },
  "Аппаратное ускорение": {
    "uk": "Апаратне прискорення",
    "en": "Hardware acceleration"
  },
  "Использовать GPU для отрисовки. Изменение требует перезапуска.": {
    "uk": "Використовувати GPU для відображення. Потрібен перезапуск.",
    "en": "Use the GPU for rendering. Requires a restart."
  },
  "Сохранить": {
    "uk": "Зберегти",
    "en": "Save",
    "de": "Speichern",
    "fr": "Enregistrer",
    "es": "Guardar",
    "pl": "Zapisz"
  },
  "ОФОРМЛЕНИЕ И ПОИСК": {
    "uk": "ВИГЛЯД І ПОШУК",
    "en": "APPEARANCE AND SEARCH"
  },
  "Оформление": {
    "uk": "Вигляд",
    "en": "Appearance",
    "de": "Darstellung",
    "fr": "Apparence",
    "es": "Apariencia",
    "pl": "Wygląd"
  },
  "Тёмное": {
    "uk": "Темний",
    "en": "Dark",
    "de": "Dunkel",
    "fr": "Sombre",
    "es": "Oscuro",
    "pl": "Ciemny"
  },
  "Светлое": {
    "uk": "Світлий",
    "en": "Light",
    "de": "Hell",
    "fr": "Clair",
    "es": "Claro",
    "pl": "Jasny"
  },
  "Системное": {
    "uk": "Системний",
    "en": "System",
    "de": "System",
    "fr": "Système",
    "es": "Sistema",
    "pl": "Systemowy"
  },
  "ПРИВАТНОСТЬ": {
    "uk": "ПРИВАТНІСТЬ",
    "en": "PRIVACY"
  },
  "Блокировка рекламы и трекеров": {
    "uk": "Блокування реклами та трекерів",
    "en": "Block ads and trackers"
  },
  "Использовать списки EasyList и EasyPrivacy.": {
    "uk": "Використовувати списки EasyList і EasyPrivacy.",
    "en": "Use EasyList and EasyPrivacy filter lists."
  },
  "Блокировать сторонние cookie": {
    "uk": "Блокувати сторонні cookie",
    "en": "Block third-party cookies"
  },
  "Ограничивать отправку и установку cookie сторонними ресурсами. Некоторые формы требуют исключения.": {
    "uk": "Обмежувати надсилання й установлення cookie сторонніми ресурсами. Деякі форми потребують винятку.",
    "en": "Limit third-party cookies. Some embedded forms may need an exception."
  },
  "Предпочитать HTTPS": {
    "uk": "Надавати перевагу HTTPS",
    "en": "Prefer HTTPS"
  },
  "Возврат к HTTP доступен вручную при ошибке.": {
    "uk": "У разі помилки можна вручну повернутися до HTTP.",
    "en": "You can allow HTTP manually if the secure connection fails."
  },
  "Ограничить прямые UDP-соединения WebRTC": {
    "uk": "Обмежити прямі UDP-з'єднання WebRTC",
    "en": "Limit direct WebRTC UDP connections"
  },
  "Снижает риск обхода прокси. Может влиять на звонки. IP обычного соединения не скрывает.": {
    "uk": "Зменшує ризик обходу проксі. Може впливати на дзвінки. IP звичайного з'єднання не приховує.",
    "en": "Reduces proxy bypass risk. May affect calls. Does not hide your connection's IP address."
  },
  "Сигналы отказа от отслеживания": {
    "uk": "Сигнали відмови від відстеження",
    "en": "Tracking opt-out signals"
  },
  "Заголовки DNT и Sec-GPC. Это запрос к сайту, а не принудительная блокировка.": {
    "uk": "Заголовки DNT і Sec-GPC. Це запит до сайту, а не примусове блокування.",
    "en": "Send DNT and Sec-GPC headers. Websites decide whether to honor these signals."
  },
  "Обновлять списки блокировки": {
    "uk": "Оновлювати списки блокування",
    "en": "Update filter lists"
  },
  "При запуске, если списки старше суток. Запросы идут к easylist.to.": {
    "uk": "Під час запуску, якщо списки старші за добу. Запити надсилаються до easylist.to.",
    "en": "At startup when lists are over a day old. Downloads come from easylist.to."
  },
  "Сохранить настройки": {
    "uk": "Зберегти налаштування",
    "en": "Save settings",
    "de": "Einstellungen speichern",
    "fr": "Enregistrer les paramètres",
    "es": "Guardar configuración",
    "pl": "Zapisz ustawienia"
  },
  "ПРОФИЛИ": {
    "uk": "ПРОФІЛІ",
    "en": "PROFILES"
  },
  "Отдельный профиль для сервисов Google. Вход может быть ограничен.": {
    "uk": "Окремий профіль для сервісів Google. Вхід може бути обмежений.",
    "en": "Separate profile for Google services. Sign-in may be restricted."
  },
  "Открыть": {
    "uk": "Відкрити",
    "en": "Open"
  },
  "Хранилища в памяти, без истории и сохранения паролей.": {
    "uk": "Дані в пам'яті, без історії та збереження паролів.",
    "en": "In-memory storage, without history or password saving."
  },
  "ПРОИЗВОДИТЕЛЬНОСТЬ": {
    "uk": "ПРОДУКТИВНІСТЬ",
    "en": "PERFORMANCE"
  },
  "ДАННЫЕ И РАЗРЕШЕНИЯ": {
    "uk": "ДАНІ ТА ДОЗВОЛИ",
    "en": "DATA AND PERMISSIONS"
  },
  "Локальная история посещений.": {
    "uk": "Локальна історія відвідувань.",
    "en": "Browsing history stored on this computer."
  },
  "Очистить": {
    "uk": "Очистити",
    "en": "Clear"
  },
  "Cookie, кэш и хранилища": {
    "uk": "Cookie, кеш і сховища",
    "en": "Cookies, cache and site data"
  },
  "Выход из аккаунтов. Менеджер паролей сохраняется.": {
    "uk": "Вихід з облікових записів. Менеджер паролів зберігається.",
    "en": "Signs you out of websites. Saved passwords are kept."
  },
  "Разрешения сайтов": {
    "uk": "Дозволи сайтів",
    "en": "Site permissions"
  },
  "Сбросить доступ к камере, микрофону и другим функциям.": {
    "uk": "Скинути доступ до камери, мікрофона та інших функцій.",
    "en": "Reset camera, microphone and other permissions."
  },
  "Сбросить": {
    "uk": "Скинути",
    "en": "Reset"
  },
  "О браузере": {
    "uk": "Про браузер",
    "en": "About Veyra"
  },
  "Защита от отпечатка устройства ограничена. IP-адрес не скрывается. Автообновление приложения не настроено.": {
    "uk": "Захист від відбитка пристрою обмежений. IP-адреса не приховується. Автооновлення програми не налаштовано.",
    "en": "Fingerprint protection is limited. Your IP address is not hidden. App auto-updates are not configured."
  },
  "Изменить закладку": {
    "uk": "Змінити закладку",
    "en": "Edit bookmark"
  },
  "Новая закладка": {
    "uk": "Нова закладка",
    "en": "New bookmark"
  },
  "Название": {
    "uk": "Назва",
    "en": "Name",
    "de": "Name",
    "fr": "Nom",
    "es": "Nombre",
    "pl": "Nazwa"
  },
  "Папка": {
    "uk": "Тека",
    "en": "Folder"
  },
  "Избранное": {
    "uk": "Обране",
    "en": "Favorites"
  },
  "Отмена": {
    "uk": "Скасувати",
    "en": "Cancel",
    "de": "Abbrechen",
    "fr": "Annuler",
    "es": "Cancelar",
    "pl": "Anuluj"
  },
  "Изменить": {
    "uk": "Змінити",
    "en": "Edit"
  },
  "Удалить": {
    "uk": "Видалити",
    "en": "Delete",
    "de": "Löschen",
    "fr": "Supprimer",
    "es": "Eliminar",
    "pl": "Usuń"
  },
  "Удалить закладку": {
    "uk": "Видалити закладку",
    "en": "Delete bookmark"
  },
  "Закладок пока нет.": {
    "uk": "Закладок ще немає.",
    "en": "No bookmarks yet."
  },
  "Добавь страницу звездой в адресной строке.": {
    "uk": "Додай сторінку зірочкою в адресному рядку.",
    "en": "Use the star in the address bar to save a page."
  },
  "Поиск закладок": {
    "uk": "Пошук закладок",
    "en": "Search bookmarks"
  },
  "Добавить закладку": {
    "uk": "Додати закладку",
    "en": "Add bookmark"
  },
  "Папка закладок": {
    "uk": "Тека закладок",
    "en": "Bookmark folder"
  },
  "Все папки": {
    "uk": "Усі теки",
    "en": "All folders"
  },
  "Импорт": {
    "uk": "Імпорт",
    "en": "Import"
  },
  "Экспорт": {
    "uk": "Експорт",
    "en": "Export"
  },
  "Здесь появится история посещений.": {
    "uk": "Тут з'явиться історія відвідувань.",
    "en": "Your browsing history will appear here."
  },
  "Сохранить данные входа?": {
    "uk": "Зберегти дані входу?",
    "en": "Save login details?"
  },
  "Не сейчас": {
    "uk": "Не зараз",
    "en": "Not now"
  },
  "Сначала разблокируй хранилище ниже.": {
    "uk": "Спочатку розблокуй сховище нижче.",
    "en": "Unlock your vault below first."
  },
  "Шифрование Windows недоступно. Сохранение паролей отключено.": {
    "uk": "Шифрування Windows недоступне. Збереження паролів вимкнено.",
    "en": "Windows encryption is unavailable. Password saving is disabled."
  },
  "Хранилище заблокировано": {
    "uk": "Сховище заблоковано",
    "en": "Vault locked"
  },
  "Пароли хранятся в зашифрованном виде на этом компьютере.": {
    "uk": "Паролі зберігаються на цьому комп'ютері в зашифрованому вигляді.",
    "en": "Passwords are stored encrypted on this computer."
  },
  "Мастер-пароль": {
    "uk": "Майстер-пароль",
    "en": "Master password"
  },
  "Придумай мастер-пароль": {
    "uk": "Створи майстер-пароль",
    "en": "Choose a master password"
  },
  "Повтори мастер-пароль": {
    "uk": "Повтори майстер-пароль",
    "en": "Confirm master password"
  },
  "Разблокировать": {
    "uk": "Розблокувати",
    "en": "Unlock"
  },
  "Создать хранилище": {
    "uk": "Створити сховище",
    "en": "Create vault"
  },
  "Автоблокировка через 5 минут без операций, при блокировке Windows и уходе ПК в сон.": {
    "uk": "Автоблокування через 5 хвилин без дій, під час блокування Windows і переходу ПК у сон.",
    "en": "Locks after 5 minutes without vault activity, when Windows locks or the PC sleeps."
  },
  "Не менее 12 символов. Мастер-пароль нельзя восстановить. Перенос хранилища на другой ПК не поддерживается.": {
    "uk": "Щонайменше 12 символів. Майстер-пароль неможливо відновити. Перенесення сховища на інший ПК не підтримується.",
    "en": "At least 12 characters. The master password cannot be recovered. Moving the vault to another PC is not supported."
  },
  "Разблокировано": {
    "uk": "Розблоковано",
    "en": "Unlocked"
  },
  "Заблокировать": {
    "uk": "Заблокувати",
    "en": "Lock"
  },
  "Заблокировать хранилище": {
    "uk": "Заблокувати сховище",
    "en": "Lock vault"
  },
  "Заполнение — только по нажатию для точного HTTPS-адреса сайта.": {
    "uk": "Заповнення — лише після натискання для точного HTTPS-сайту.",
    "en": "Fill only when you click, on the exact HTTPS site."
  },
  "Найти сайт или логин": {
    "uk": "Знайти сайт або логін",
    "en": "Search sites or usernames"
  },
  "Поиск паролей": {
    "uk": "Пошук паролів",
    "en": "Search passwords"
  },
  "Добавить пароль": {
    "uk": "Додати пароль",
    "en": "Add password"
  },
  "Сайт": {
    "uk": "Сайт",
    "en": "Website"
  },
  "Логин": {
    "uk": "Логін",
    "en": "Username"
  },
  "Пароль": {
    "uk": "Пароль",
    "en": "Password"
  },
  "Показать": {
    "uk": "Показати",
    "en": "Show"
  },
  "Показать пароль": {
    "uk": "Показати пароль",
    "en": "Show password"
  },
  "Создать": {
    "uk": "Створити",
    "en": "Generate"
  },
  "Без логина": {
    "uk": "Без логіна",
    "en": "No username"
  },
  "Заполнить на текущем сайте": {
    "uk": "Заповнити на поточному сайті",
    "en": "Fill on current site"
  },
  "Заполнить пароль": {
    "uk": "Заповнити пароль",
    "en": "Fill password"
  },
  "Удалить пароль": {
    "uk": "Видалити пароль",
    "en": "Delete password"
  },
  "Сохранённых записей нет.": {
    "uk": "Збережених записів немає.",
    "en": "No saved entries."
  },
  "Соединение не установлено": {
    "uk": "З'єднання не встановлено",
    "en": "Connection failed"
  },
  "Не удалось открыть страницу": {
    "uk": "Не вдалося відкрити сторінку",
    "en": "Unable to open page"
  },
  "Повторить": {
    "uk": "Повторити",
    "en": "Try again"
  },
  "На главную": {
    "uk": "На головну",
    "en": "Home"
  },
  "Разрешить HTTP, если переход был принудительно обновлён": {
    "uk": "Дозволити HTTP, якщо з'єднання автоматично оновлено",
    "en": "Allow HTTP if this connection was upgraded"
  },
  "Очистить историю": {
    "uk": "Очистити історію",
    "en": "Clear history"
  },
  "Менеджер паролей": {
    "uk": "Менеджер паролів",
    "en": "Password manager",
    "de": "Passwortmanager",
    "fr": "Gestionnaire de mots de passe",
    "es": "Gestor de contraseñas",
    "pl": "Menedżer haseł"
  },
  "Найти на странице": {
    "uk": "Знайти на сторінці",
    "en": "Find in page"
  },
  "Отдельный профиль со стандартным User-Agent.": {
    "uk": "Окремий профіль зі стандартним User-Agent.",
    "en": "Separate profile with the standard User-Agent."
  },
  "Названия приложения удалены из User-Agent.": {
    "uk": "Назви програми видалені з User-Agent.",
    "en": "Application names are removed from the User-Agent."
  },
  "Запрос разрешения": {
    "uk": "Запит дозволу",
    "en": "Permission request"
  },
  "Разрешить": {
    "uk": "Дозволити",
    "en": "Allow"
  },
  "Запретить": {
    "uk": "Заборонити",
    "en": "Deny"
  },
  "Запросов заблокировано": {
    "uk": "Запитів заблоковано",
    "en": "Requests blocked"
  },
  "Сетевая фильтрация": {
    "uk": "Мережеве фільтрування",
    "en": "Network filtering"
  },
  "Готова": {
    "uk": "Готове",
    "en": "Ready"
  },
  "Недоступна": {
    "uk": "Недоступне",
    "en": "Unavailable"
  },
  "Сторонние cookie": {
    "uk": "Сторонні cookie",
    "en": "Third-party cookies"
  },
  "Блокируются": {
    "uk": "Блокуються",
    "en": "Blocked"
  },
  "Разрешены": {
    "uk": "Дозволені",
    "en": "Allowed"
  },
  "Что видит сайт": {
    "uk": "Що бачить сайт",
    "en": "What the site sees"
  },
  "Убрать исключение": {
    "uk": "Прибрати виняток",
    "en": "Remove exception"
  },
  "Разрешить трекеры и сторонние cookie для сайта": {
    "uk": "Дозволити трекери та сторонні cookie для сайту",
    "en": "Allow trackers and third-party cookies for this site"
  },
  "Очистить данные этого сайта": {
    "uk": "Очистити дані цього сайту",
    "en": "Clear this site's data"
  },
  "СПИСКИ БЛОКИРОВКИ": {
    "uk": "СПИСКИ БЛОКУВАННЯ",
    "en": "FILTER LISTS"
  },
  "EasyList и EasyPrivacy": {
    "uk": "EasyList і EasyPrivacy",
    "en": "EasyList and EasyPrivacy"
  },
  "Обновлены:": {
    "uk": "Оновлено:",
    "en": "Updated:"
  },
  "нет данных": {
    "uk": "немає даних",
    "en": "no data"
  },
  "Обновление…": {
    "uk": "Оновлення…",
    "en": "Updating…"
  },
  "Обновить списки": {
    "uk": "Оновити списки",
    "en": "Update lists"
  },
  "IP-адрес не скрывается.": {
    "uk": "IP-адреса не приховується.",
    "en": "Your IP address is not hidden."
  },
  "Открыть настройки": {
    "uk": "Відкрити налаштування",
    "en": "Open settings"
  },
  "Память процессов": {
    "uk": "Пам'ять процесів",
    "en": "Process memory"
  },
  "Спят": {
    "uk": "Сплять",
    "en": "Sleeping"
  },
  "Живые": {
    "uk": "Активні",
    "en": "Live"
  },
  "Приблизительное потребление процессами браузера.": {
    "uk": "Приблизне споживання процесами браузера.",
    "en": "Estimated browser process usage."
  },
  "Вкладки со звуком, введёнными данными или загрузками не усыпляются. При пробуждении страница перезагружается.": {
    "uk": "Вкладки зі звуком, введеними даними або завантаженнями не присипляються. Після пробудження сторінка перезавантажується.",
    "en": "Tabs with audio, entered data or downloads stay awake. Waking a tab reloads its page."
  },
  "ВКЛАДКИ": {
    "uk": "ВКЛАДКИ",
    "en": "TABS"
  },
  "Спит": {
    "uk": "Спить",
    "en": "Sleeping"
  },
  "Активная": {
    "uk": "Активна",
    "en": "Active"
  },
  "Есть введённые данные": {
    "uk": "Є введені дані",
    "en": "Has entered data"
  },
  "Фоновая": {
    "uk": "Фонова",
    "en": "Background"
  },
  "Защитить от усыпления": {
    "uk": "Захистити від присипляння",
    "en": "Keep tab awake"
  },
  "Усыпить": {
    "uk": "Приспати",
    "en": "Put to sleep"
  },
  "Усыпить вкладку": {
    "uk": "Приспати вкладку",
    "en": "Put tab to sleep"
  },
  "Закрыть панель": {
    "uk": "Закрити панель",
    "en": "Close panel"
  },
  "Готово": {
    "uk": "Готово",
    "en": "Done"
  },
  "Отменено": {
    "uk": "Скасовано",
    "en": "Canceled"
  },
  "Прервано": {
    "uk": "Перервано",
    "en": "Interrupted"
  },
  "Показать в папке": {
    "uk": "Показати в теці",
    "en": "Show in folder"
  },
  "Загрузки появятся здесь.": {
    "uk": "Завантаження з'являться тут.",
    "en": "Downloads will appear here."
  },
  "Поиск на странице": {
    "uk": "Пошук на сторінці",
    "en": "Find in page"
  },
  "Текст на странице": {
    "uk": "Текст на сторінці",
    "en": "Text on page"
  },
  "Enter — следующее совпадение. Esc — закрыть.": {
    "uk": "Enter — наступний збіг. Esc — закрити.",
    "en": "Enter — next match. Esc — close."
  },
  "Мастер-пароли не совпадают.": {
    "uk": "Майстер-паролі не збігаються.",
    "en": "Master passwords do not match."
  },
  "Пароль сохранён в зашифрованном хранилище.": {
    "uk": "Пароль збережено в зашифрованому сховищі.",
    "en": "Password saved to your encrypted vault."
  },
  "Создан пароль из 24 символов.": {
    "uk": "Створено пароль із 24 символів.",
    "en": "Generated a 24-character password."
  },
  "Подтвердить": {
    "uk": "Підтвердити",
    "en": "Confirm"
  },
  "Нажми ещё раз для удаления": {
    "uk": "Натисни ще раз для видалення",
    "en": "Click again to delete"
  },
  "Закрыть вкладку": {
    "uk": "Закрити вкладку",
    "en": "Close tab"
  },
  "Камера и микрофон": {
    "uk": "Камера та мікрофон",
    "en": "Camera and microphone"
  },
  "Уведомления": {
    "uk": "Сповіщення",
    "en": "Notifications"
  },
  "Геолокация": {
    "uk": "Геолокація",
    "en": "Location"
  },
  "Чтение буфера обмена": {
    "uk": "Читання буфера обміну",
    "en": "Read clipboard"
  },
  "Демонстрация экрана": {
    "uk": "Демонстрація екрана",
    "en": "Screen sharing"
  },
  "Захват указателя": {
    "uk": "Захоплення вказівника",
    "en": "Pointer lock"
  },
  "Этот язык не поддерживается.": {
    "uk": "Ця мова не підтримується.",
    "en": "This language is not supported."
  },
  "Этот адрес не поддерживается.": {
    "uk": "Ця адреса не підтримується.",
    "en": "This address is not supported."
  },
  "Открыть в новой вкладке": {
    "uk": "Відкрити в новій вкладці",
    "en": "Open in new tab"
  },
  "Вырезать": {
    "uk": "Вирізати",
    "en": "Cut"
  },
  "Копировать": {
    "uk": "Копіювати",
    "en": "Copy",
    "de": "Kopieren",
    "fr": "Copier",
    "es": "Copiar",
    "pl": "Kopiuj"
  },
  "Вставить": {
    "uk": "Вставити",
    "en": "Paste"
  },
  "Сохранить файл": {
    "uk": "Зберегти файл",
    "en": "Save file"
  },
  "Без названия": {
    "uk": "Без назви",
    "en": "Untitled"
  },
  "Окно входа": {
    "uk": "Вікно входу",
    "en": "Sign-in window"
  },
  "Достигнут предел открытых дополнительных окон.": {
    "uk": "Досягнуто обмеження відкритих додаткових вікон.",
    "en": "Too many additional windows are open."
  },
  "Поддерживаются HTTP и HTTPS ссылки.": {
    "uk": "Підтримуються посилання HTTP і HTTPS.",
    "en": "Only HTTP and HTTPS links are supported."
  },
  "Процесс вкладки остановился. Обнови страницу.": {
    "uk": "Процес вкладки зупинився. Онови сторінку.",
    "en": "The tab stopped. Reload the page."
  },
  "Сначала открой сайт.": {
    "uk": "Спочатку відкрий сайт.",
    "en": "Open a website first."
  },
  "Вкладка активна, закреплена, воспроизводит звук, загружается или содержит введённые данные.": {
    "uk": "Вкладка активна, закріплена, відтворює звук, завантажується або містить введені дані.",
    "en": "This tab is active, pinned, playing audio, loading or contains entered data."
  },
  "Проверь адрес закладки.": {
    "uk": "Перевір адресу закладки.",
    "en": "Check the bookmark address."
  },
  "Экспорт закладок": {
    "uk": "Експорт закладок",
    "en": "Export bookmarks"
  },
  "Закладки экспортированы.": {
    "uk": "Закладки експортовано.",
    "en": "Bookmarks exported."
  },
  "Импорт закладок Veyra": {
    "uk": "Імпорт закладок Veyra",
    "en": "Import Veyra bookmarks"
  },
  "Файл слишком большой. Максимум 2 МБ.": {
    "uk": "Файл завеликий. Максимум 2 МБ.",
    "en": "File is too large. Maximum size is 2 MB."
  },
  "Нужен JSON-файл закладок Veyra.": {
    "uk": "Потрібен JSON-файл закладок Veyra.",
    "en": "Choose a Veyra bookmarks JSON file."
  },
  "В файле нет списка закладок.": {
    "uk": "У файлі немає списку закладок.",
    "en": "The file has no bookmark list."
  },
  "Настройки сохранены.": {
    "uk": "Налаштування збережено.",
    "en": "Settings saved."
  },
  "Аппаратное ускорение изменится после перезапуска.": {
    "uk": "Апаратне прискорення зміниться після перезапуску.",
    "en": "Hardware acceleration will change after restarting."
  },
  "Исключение изменено. Обнови страницу.": {
    "uk": "Виняток змінено. Онови сторінку.",
    "en": "Exception changed. Reload the page."
  },
  "Cookie, хранилища и кэш профилей очищены.": {
    "uk": "Cookie, сховища й кеш профілів очищено.",
    "en": "Profile cookies, site data and cache cleared."
  },
  "Хранилища сайта очищены. Обнови страницу.": {
    "uk": "Сховища сайту очищено. Онови сторінку.",
    "en": "Site data cleared. Reload the page."
  },
  "Разрешения сайтов сброшены.": {
    "uk": "Дозволи сайтів скинуто.",
    "en": "Site permissions reset."
  },
  "Предложение сохранения истекло.": {
    "uk": "Пропозиція збереження застаріла.",
    "en": "The save offer has expired."
  },
  "Заполнение отключено во временном профиле.": {
    "uk": "Заповнення вимкнено в тимчасовому профілі.",
    "en": "Password filling is disabled in temporary profiles."
  },
  "Подходящая форма входа не найдена. Заполнение не выполнено.": {
    "uk": "Відповідну форму входу не знайдено. Заповнення не виконано.",
    "en": "No suitable login form found. Nothing was filled."
  },
  "Поля заполнены. Проверь страницу и войди самостоятельно.": {
    "uk": "Поля заповнено. Перевір сторінку та увійди самостійно.",
    "en": "Fields filled. Review the page and sign in."
  },
  "Запись не найдена.": {
    "uk": "Запис не знайдено.",
    "en": "Entry not found."
  },
  "Используй мастер-пароль длиной от 12 символов.": {
    "uk": "Використовуй майстер-пароль довжиною від 12 символів.",
    "en": "Use a master password of at least 12 characters."
  },
  "Не удалось создать зашифрованное хранилище.": {
    "uk": "Не вдалося створити зашифроване сховище.",
    "en": "Unable to create the encrypted vault."
  },
  "Неверный мастер-пароль либо хранилище недоступно этому пользователю Windows.": {
    "uk": "Неправильний майстер-пароль або сховище недоступне цьому користувачу Windows.",
    "en": "Incorrect master password or vault unavailable to this Windows user."
  },
  "Некорректное хранилище.": {
    "uk": "Некоректне сховище.",
    "en": "Invalid vault."
  },
  "Некорректный формат хранилища.": {
    "uk": "Некоректний формат сховища.",
    "en": "Invalid vault format."
  },
  "Нужен корректный HTTPS-адрес сайта.": {
    "uk": "Потрібна коректна HTTPS-адреса сайту.",
    "en": "Enter a valid HTTPS website address."
  },
  "Операция отменена блокировкой.": {
    "uk": "Операцію скасовано блокуванням.",
    "en": "Operation canceled because the vault was locked."
  },
  "Пароли сохраняются только для HTTPS-сайтов.": {
    "uk": "Паролі зберігаються лише для HTTPS-сайтів.",
    "en": "Passwords can only be saved for HTTPS websites."
  },
  "Подожди несколько секунд перед следующей попыткой.": {
    "uk": "Зачекай кілька секунд перед наступною спробою.",
    "en": "Wait a few seconds before trying again."
  },
  "Проверь логин и пароль.": {
    "uk": "Перевір логін і пароль.",
    "en": "Check the username and password."
  },
  "Сначала разблокируй менеджер паролей.": {
    "uk": "Спочатку розблокуй менеджер паролів.",
    "en": "Unlock the password manager first."
  },
  "Сначала создай хранилище.": {
    "uk": "Спочатку створи сховище.",
    "en": "Create a vault first."
  },
  "Хранилище уже открывается.": {
    "uk": "Сховище вже відкривається.",
    "en": "The vault is already being unlocked."
  },
  "Хранилище уже существует.": {
    "uk": "Сховище вже існує.",
    "en": "A vault already exists."
  },
  "Шифрование операционной системы недоступно. Пароли не сохраняются.": {
    "uk": "Шифрування операційної системи недоступне. Паролі не зберігаються.",
    "en": "Operating system encryption is unavailable. Passwords will not be saved."
  },
  "Не удалось загрузить списки блокировки.": {
    "uk": "Не вдалося завантажити списки блокування.",
    "en": "Unable to load filter lists."
  },
  "Обновление списков не удалось. Используются прежние списки.": {
    "uk": "Не вдалося оновити списки. Використовуються попередні.",
    "en": "Unable to update filter lists. Previous lists are still in use."
  },
  "Диагностика": {
    "uk": "Діагностика",
    "en": "Diagnostics"
  },
  "Сервисы Google": {
    "uk": "Сервіси Google",
    "en": "Google services"
  },
  "Google ограничил встроенный вход": {
    "uk": "Google обмежив вбудований вхід",
    "en": "Google restricted embedded sign-in"
  },
  "Открой весь сайт в полноценном браузере, чтобы войти в аккаунт.": {
    "uk": "Відкрий увесь сайт у повноцінному браузері, щоб увійти в обліковий запис.",
    "en": "Open the whole site in a full browser to sign in."
  },
  "Открывай сервисы в полноценном браузере с сохранением входа.": {
    "uk": "Відкривай сервіси у повноцінному браузері зі збереженням входу.",
    "en": "Open services in a full browser that keeps you signed in."
  },
  "Браузер": {
    "uk": "Браузер",
    "en": "Browser"
  },
  "Используется отдельный профиль Veyra. Вход сохраняется в этом браузере.": {
    "uk": "Використовується окремий профіль Veyra. Вхід зберігається в цьому браузері.",
    "en": "Uses a separate Veyra profile. Sign-in stays in this browser."
  },
  "Firefox откроется в своём текущем профиле.": {
    "uk": "Firefox відкриється у своєму поточному профілі.",
    "en": "Firefox opens in its current profile."
  },
  "Открыть в браузере": {
    "uk": "Відкрити в браузері",
    "en": "Open in browser"
  },
  "Это отдельное окно другого браузера. Вход не переносится во вкладки Veyra; её настройки приватности в этом окне не применяются.": {
    "uk": "Це окреме вікно іншого браузера. Вхід не переноситься у вкладки Veyra; її налаштування приватності в цьому вікні не діють.",
    "en": "This is a separate browser window. Sign-in does not transfer to Veyra tabs, and Veyra privacy settings do not apply there."
  },
  "Выбрать другой сервис или браузер": {
    "uk": "Вибрати інший сервіс або браузер",
    "en": "Choose another service or browser"
  },
  "Настрой внешний вид под себя.": {
    "uk": "Налаштуй вигляд під себе.",
    "en": "Make Veyra look the way you like."
  },
  "ОФОРМЛЕНИЕ": {
    "uk": "ВИГЛЯД",
    "en": "APPEARANCE"
  },
  "ЦВЕТ": {
    "uk": "КОЛІР",
    "en": "COLOR"
  },
  "Фиолетовая": {
    "uk": "Фіолетова",
    "en": "Violet"
  },
  "Голубая": {
    "uk": "Блакитна",
    "en": "Blue"
  },
  "Зелёная": {
    "uk": "Зелена",
    "en": "Green"
  },
  "Розовая": {
    "uk": "Рожева",
    "en": "Pink"
  },
  "Янтарная": {
    "uk": "Бурштинова",
    "en": "Amber"
  },
  "Свой цвет": {
    "uk": "Власний колір",
    "en": "Custom color"
  },
  "ОБОИ": {
    "uk": "ШПАЛЕРИ",
    "en": "WALLPAPER"
  },
  "Без обоев": {
    "uk": "Без шпалер",
    "en": "No wallpaper"
  },
  "Сияние": {
    "uk": "Сяйво",
    "en": "Aurora"
  },
  "Закат": {
    "uk": "Захід сонця",
    "en": "Dusk"
  },
  "Океан": {
    "uk": "Океан",
    "en": "Ocean"
  },
  "Лес": {
    "uk": "Ліс",
    "en": "Forest"
  },
  "Выбрать своё изображение": {
    "uk": "Вибрати своє зображення",
    "en": "Choose your image"
  },
  "Удалить своё изображение": {
    "uk": "Видалити своє зображення",
    "en": "Remove your image"
  },
  "Затемнение": {
    "uk": "Затемнення",
    "en": "Dimming"
  },
  "Изображение хранится только на этом компьютере.": {
    "uk": "Зображення зберігається лише на цьому комп'ютері.",
    "en": "Your image stays on this computer."
  },
  "Все настройки": {
    "uk": "Усі налаштування",
    "en": "All settings"
  },
  "Поиск по вкладкам": {
    "uk": "Пошук у вкладках",
    "en": "Search tabs"
  },
  "Ничего не найдено.": {
    "uk": "Нічого не знайдено.",
    "en": "No matches found."
  },
  "Восстановить закрытую вкладку": {
    "uk": "Відновити закриту вкладку",
    "en": "Reopen closed tab"
  },
  "Назад к странице": {
    "uk": "Назад до сторінки",
    "en": "Back to page"
  },
  "Уменьшить": {
    "uk": "Зменшити",
    "en": "Zoom out"
  },
  "Увеличить": {
    "uk": "Збільшити",
    "en": "Zoom in"
  },
  "Адресная строка": {
    "uk": "Адресний рядок",
    "en": "Address bar"
  },
  "Печать": {
    "uk": "Друк",
    "en": "Print"
  },
  "Масштаб страницы": {
    "uk": "Масштаб сторінки",
    "en": "Page zoom"
  },
  "Сбросить масштаб": {
    "uk": "Скинути масштаб",
    "en": "Reset zoom"
  },
  "Полный экран": {
    "uk": "Повний екран",
    "en": "Full screen"
  },
  "Сочетания клавиш": {
    "uk": "Сполучення клавіш",
    "en": "Keyboard shortcuts"
  },
  "Темы и обои": {
    "uk": "Теми та шпалери",
    "en": "Themes and wallpaper",
    "de": "Designs und Hintergrund",
    "fr": "Thèmes et fond d’écran",
    "es": "Temas y fondo",
    "pl": "Motywy i tapeta"
  },
  "Цвета, фон новой вкладки и своё изображение.": {
    "uk": "Кольори, фон нової вкладки та власне зображення.",
    "en": "Colors, new tab backgrounds and your own image."
  },
  "Панель закладок": {
    "uk": "Панель закладок",
    "en": "Bookmarks toolbar"
  },
  "Показывать закладки под адресной строкой.": {
    "uk": "Показувати закладки під адресним рядком.",
    "en": "Show bookmarks below the address bar."
  },
  "Восстанавливать вкладки при запуске": {
    "uk": "Відновлювати вкладки під час запуску",
    "en": "Restore tabs at startup"
  },
  "Сохраняются адреса страниц. Введённые данные и временные вкладки не сохраняются.": {
    "uk": "Зберігаються адреси сторінок. Введені дані та тимчасові вкладки не зберігаються.",
    "en": "Saves page addresses. Entered data and temporary tabs are not saved."
  },
  "Открывать Google в полноценном браузере.": {
    "uk": "Відкривати Google у повноцінному браузері.",
    "en": "Open Google in a full browser."
  },
  "Режим чтения": {
    "uk": "Режим читання",
    "en": "Reader view"
  },
  "Сохранить PDF": {
    "uk": "Зберегти PDF",
    "en": "Save as PDF"
  },
  "Выключить звук": {
    "uk": "Вимкнути звук",
    "en": "Mute tab"
  },
  "Включить звук": {
    "uk": "Увімкнути звук",
    "en": "Unmute tab"
  },
  "Сервис открыт в браузере.": {
    "uk": "Сервіс відкрито в браузері.",
    "en": "Service opened in browser."
  },
  "Добавляй страницы звездой в адресной строке.": {
    "uk": "Додавай сторінки зірочкою в адресному рядку.",
    "en": "Use the address bar star to save pages."
  },
  "Браузер не найден.": {
    "uk": "Браузер не знайдено.",
    "en": "Browser not found."
  },
  "Браузер не найден. Установи Chrome, Edge или Firefox.": {
    "uk": "Браузер не знайдено. Встанови Chrome, Edge або Firefox.",
    "en": "No browser found. Install Chrome, Edge or Firefox."
  },
  "Не удалось открыть браузер.": {
    "uk": "Не вдалося відкрити браузер.",
    "en": "Unable to open browser."
  },
  "Выбери PNG, JPEG или WebP размером до 20 МБ.": {
    "uk": "Вибери PNG, JPEG або WebP розміром до 20 МБ.",
    "en": "Choose a PNG, JPEG or WebP image up to 20 MB."
  },
  "Не удалось прочитать изображение.": {
    "uk": "Не вдалося прочитати зображення.",
    "en": "Unable to read image."
  },
  "Изображение слишком большое.": {
    "uk": "Зображення завелике.",
    "en": "Image is too large."
  },
  "Нет закрытых вкладок.": {
    "uk": "Немає закритих вкладок.",
    "en": "No closed tabs to reopen."
  },
  "Дублировать вкладку": {
    "uk": "Дублювати вкладку",
    "en": "Duplicate tab"
  },
  "Открепить вкладку": {
    "uk": "Відкріпити вкладку",
    "en": "Unpin tab"
  },
  "Закрепить вкладку": {
    "uk": "Закріпити вкладку",
    "en": "Pin tab"
  },
  "На странице не найден текст для чтения.": {
    "uk": "На сторінці не знайдено тексту для читання.",
    "en": "No readable text found on this page."
  },
  "Страница изменилась. Повтори сохранение.": {
    "uk": "Сторінка змінилася. Повтори збереження.",
    "en": "The page changed. Try saving again."
  },
  "PDF сохранён.": {
    "uk": "PDF збережено.",
    "en": "PDF saved."
  },
  "Некорректные настройки.": {
    "uk": "Некоректні налаштування.",
    "en": "Invalid settings."
  },
  "Выбрать обои": {
    "uk": "Вибрати шпалери",
    "en": "Choose wallpaper"
  },
  "Изображения": {
    "uk": "Зображення",
    "en": "Images"
  },
  "Закрыть вкладку с введёнными данными?": {
    "uk": "Закрити вкладку з введеними даними?",
    "en": "Close this tab and discard entered data?"
  },
  "Закрыть браузер с введёнными данными?": {
    "uk": "Закрити браузер з введеними даними?",
    "en": "Close the browser and discard entered data?"
  },
  "Остаться": {
    "uk": "Залишитися",
    "en": "Stay"
  },
  "Auto Dark Mode": {
    "uk": "Auto Dark Mode",
    "en": "Auto Dark Mode"
  },
  "Ярлыки главной": {
    "uk": "Ярлики головної",
    "en": "Home shortcuts",
    "de": "Startseiten-Verknüpfungen",
    "fr": "Raccourcis d’accueil",
    "es": "Accesos de inicio",
    "pl": "Skróty strony głównej"
  },
  "Для всех сайтов по умолчанию.": {
    "uk": "Для всіх сайтів типово.",
    "en": "Default for all websites."
  },
  "Собственная тёмная тема сайта сохраняется. Перекраска применяется к светлым страницам; изображения и видео не меняются.": {
    "uk": "Власна темна тема сайту зберігається. Перефарбовуються світлі сторінки; зображення та відео не змінюються.",
    "en": "Keeps the website’s own dark theme. Recolors light pages; images and videos stay unchanged."
  },
  "Включить для сайта": {
    "uk": "Увімкнути для сайту",
    "en": "Enable for this site"
  },
  "Яркость": {
    "uk": "Яскравість",
    "en": "Brightness",
    "de": "Helligkeit",
    "fr": "Luminosité",
    "es": "Brillo",
    "pl": "Jasność"
  },
  "Контраст": {
    "uk": "Контраст",
    "en": "Contrast",
    "de": "Kontrast",
    "fr": "Contraste",
    "es": "Contraste",
    "pl": "Kontrast"
  },
  "Применить": {
    "uk": "Застосувати",
    "en": "Apply",
    "de": "Anwenden",
    "fr": "Appliquer",
    "es": "Aplicar",
    "pl": "Zastosuj"
  },
  "Открой сайт для индивидуальной настройки.": {
    "uk": "Відкрий сайт для окремого налаштування.",
    "en": "Open a website to adjust its settings."
  },
  "Добавь свои сайты. Пустой список оставляет главную минимальной.": {
    "uk": "Додай свої сайти. Порожній список залишає головну мінімальною.",
    "en": "Add your websites, or leave the list empty for a minimal home page."
  },
  "Добавить сайт": {
    "uk": "Додати сайт",
    "en": "Add website",
    "de": "Website hinzufügen",
    "fr": "Ajouter un site",
    "es": "Añadir sitio",
    "pl": "Dodaj witrynę"
  },
  "Выбрать изображение": {
    "uk": "Вибрати зображення",
    "en": "Choose image"
  },
  "Войди в своём аккаунте в отдельном окне Firefox и закрой его. Затем Veyra перенесёт доступные cookie Google и YouTube.": {
    "uk": "Увійди у свій акаунт в окремому вікні Firefox та закрий його. Потім Veyra перенесе доступні cookie Google і YouTube.",
    "en": "Sign in to your account in the separate Firefox window, then close it. Veyra will import available Google and YouTube cookies."
  },
  "Временный профиль будет удалён. Основной профиль Firefox не используется. Перенос не гарантирует сохранение входа: Google может запросить его повторно. Cookie контейнеров и разделённых хранилищ пропускаются.": {
    "uk": "Тимчасовий профіль буде видалено. Основний профіль Firefox не використовується. Google може вимагати повторного входу. Cookie контейнерів і розділених сховищ пропускаються.",
    "en": "The temporary profile will be deleted. Your main Firefox profile is not used. Google may require sign-in again. Container and partitioned cookies are skipped."
  },
  "Закрой Firefox для продолжения": {
    "uk": "Закрий Firefox для продовження",
    "en": "Close Firefox to continue"
  },
  "Открыть Firefox для входа": {
    "uk": "Відкрити Firefox для входу",
    "en": "Open Firefox to sign in"
  },
  "Не удалось удалить временный профиль.": {
    "uk": "Не вдалося видалити тимчасовий профіль.",
    "en": "Could not delete the temporary profile."
  },
  "Статус «Использует Veyra» и время работы. Сайты не передаются.": {
    "uk": "Статус «Використовує Veyra» та час роботи. Сайти не передаються.",
    "en": "Shows “Using Veyra” and elapsed time. Websites are never shared."
  },
  "Создай приложение Veyra в Discord Developer Portal и скопируй Application ID. Discord должен быть запущен на этом ПК.": {
    "uk": "Створи застосунок Veyra у Discord Developer Portal і скопіюй Application ID. Discord має працювати на цьому ПК.",
    "en": "Create a Veyra application in Discord Developer Portal and copy its Application ID. Discord must be running on this PC."
  },
  "Импорт уже выполняется.": {
    "uk": "Імпорт уже виконується.",
    "en": "An import is already running."
  },
  "Firefox не найден.": {
    "uk": "Firefox не знайдено.",
    "en": "Firefox not found."
  },
  "Не удалось открыть Firefox.": {
    "uk": "Не вдалося відкрити Firefox.",
    "en": "Could not open Firefox."
  },
  "Firefox завершился с ошибкой.": {
    "uk": "Firefox завершився з помилкою.",
    "en": "Firefox exited with an error."
  },
  "Cookie не найдены.": {
    "uk": "Cookie не знайдено.",
    "en": "No cookies found."
  },
  "Импорт недоступен во временной вкладке.": {
    "uk": "Імпорт недоступний у тимчасовій вкладці.",
    "en": "Import is unavailable in a temporary tab."
  },
  "Укажи название и адрес сайта.": {
    "uk": "Вкажи назву та адресу сайту.",
    "en": "Enter a website name and URL."
  },
  "Можно добавить до 12 ярлыков.": {
    "uk": "Можна додати до 12 ярликів.",
    "en": "You can add up to 12 shortcuts."
  },
  "Сначала закрой окно Firefox для завершения импорта.": {
    "uk": "Спочатку закрий вікно Firefox для завершення імпорту.",
    "en": "Close the Firefox window to finish importing first."
  },
  "Список совместимости": {
    "uk": "Список сумісності",
    "en": "Compatibility list",
    "de": "Kompatibilitätsliste",
    "fr": "Liste de compatibilité",
    "es": "Lista de compatibilidad",
    "pl": "Lista zgodności"
  },
  "Эти сайты автоматически открываются в профиле совместимости. Данные Chromium согласованы; параметры устройства не подделываются.": {
    "uk": "Ці сайти автоматично відкриваються у профілі сумісності. Дані Chromium узгоджені; параметри пристрою не підробляються.",
    "en": "These sites automatically open in the compatibility profile. Chromium identity stays consistent; device properties are not fabricated."
  },
  "Добавляй домены без https:// и пути, по одному в строке. Поддомены включаются автоматически. Изменения применятся при следующем открытии сайта.": {
    "uk": "Додавай домени без https:// та шляху, по одному в рядку. Піддомени включаються автоматично. Зміни діють після наступного відкриття сайту.",
    "en": "Enter one domain per line, without https:// or paths. Includes subdomains. Changes apply the next time you open the site."
  },
  "Домены": {
    "uk": "Домени",
    "en": "Domains",
    "de": "Domains",
    "fr": "Domaines",
    "es": "Dominios",
    "pl": "Domeny"
  },
  "Аккаунты этого профиля хранятся отдельно. Список не гарантирует вход в Google и не отключает защиту от трекеров.": {
    "uk": "Акаунти цього профілю зберігаються окремо. Список не гарантує вхід у Google та не вимикає захист від трекерів.",
    "en": "Accounts in this profile are stored separately. The list does not guarantee Google sign-in or disable tracker protection."
  },
  "Некорректный список доменов.": {
    "uk": "Некоректний список доменів.",
    "en": "Invalid domain list."
  },
  "Укажи домены без https:// и пути.": {
    "uk": "Вкажи домени без https:// та шляху.",
    "en": "Enter domains without https:// or paths."
  },
  "Подключение": {
    "uk": "Підключення",
    "en": "Connecting",
    "de": "Verbindung wird hergestellt",
    "fr": "Connexion",
    "es": "Conectando",
    "pl": "Łączenie"
  },
  "Подключено": {
    "uk": "Підключено",
    "en": "Connected",
    "de": "Verbunden",
    "fr": "Connecté",
    "es": "Conectado",
    "pl": "Połączono"
  },
  "Запусти Discord": {
    "uk": "Запусти Discord",
    "en": "Open Discord",
    "de": "Discord öffnen",
    "fr": "Ouvrir Discord",
    "es": "Abrir Discord",
    "pl": "Otwórz Discord"
  },
  "Ошибка подключения": {
    "uk": "Помилка підключення",
    "en": "Connection error"
  },
  "Укажи Application ID": {
    "uk": "Вкажи Application ID",
    "en": "Enter Application ID"
  },
  "Выключено": {
    "uk": "Вимкнено",
    "en": "Off",
    "de": "Aus",
    "fr": "Désactivé",
    "es": "Desactivado",
    "pl": "Wyłączone"
  },
  "Добавить": {
    "uk": "Додати",
    "en": "Add",
    "de": "Hinzufügen",
    "fr": "Ajouter",
    "es": "Añadir",
    "pl": "Dodaj"
  },
  "Копирование с сайтов": {
    "uk": "Копіювання із сайтів",
    "en": "Copying from websites",
    "de": "Kopieren von Websites",
    "fr": "Copie depuis les sites",
    "es": "Copia desde sitios",
    "pl": "Kopiowanie z witryn"
  },
  "Чтение буфера требует отдельного разрешения.": {
    "uk": "Читання буфера потребує окремого дозволу.",
    "en": "Reading the clipboard requires separate permission."
  },
  "Копировать сразу": {
    "uk": "Копіювати одразу",
    "en": "Copy immediately",
    "de": "Sofort kopieren",
    "fr": "Copier immédiatement",
    "es": "Copiar inmediatamente",
    "pl": "Kopiuj od razu"
  },
  "Спрашивать с предпросмотром": {
    "uk": "Питати з попереднім переглядом",
    "en": "Ask with preview",
    "de": "Mit Vorschau fragen",
    "fr": "Demander avec aperçu",
    "es": "Preguntar con vista previa",
    "pl": "Pytaj z podglądem"
  },
  "Сайт хочет скопировать текст": {
    "uk": "Сайт хоче скопіювати текст",
    "en": "Website wants to copy text"
  },
  "Общий профиль Veyra": {
    "uk": "Спільний профіль Veyra",
    "en": "Shared Veyra profile"
  },
  "Входы на сайты и настройки сохраняются между версиями на этом ПК.": {
    "uk": "Входи на сайти й налаштування зберігаються між версіями на цьому ПК.",
    "en": "Website sign-ins and settings are kept across versions on this PC."
  },
  "Открыть папку": {
    "uk": "Відкрити папку",
    "en": "Open folder"
  },
  "Не удалось сохранить сессии на диск.": {
    "uk": "Не вдалося зберегти сесії на диск.",
    "en": "Could not save sessions to disk."
  },
  "Сохранение сессий заняло слишком много времени.": {
    "uk": "Збереження сесій тривало занадто довго.",
    "en": "Saving sessions took too long."
  },
  "Статус на языке интерфейса Veyra.": {
    "uk": "Статус мовою інтерфейсу Veyra.",
    "en": "Status follows the Veyra interface language."
  },
  "Показывать домен сайта": {
    "uk": "Показувати домен сайту",
    "en": "Show website domain"
  },
  "Только домен активной обычной вкладки, без пути и параметров. Временные вкладки не передаются.": {
    "uk": "Лише домен активної звичайної вкладки, без шляху й параметрів. Тимчасові вкладки не передаються.",
    "en": "Only the active regular tab’s domain, without paths or parameters. Temporary tabs are never shared."
  },
  "Показывать время работы": {
    "uk": "Показувати час роботи",
    "en": "Show elapsed time"
  },
  "Время с запуска браузера.": {
    "uk": "Час від запуску браузера.",
    "en": "Time since the browser was started."
  },
  "Интервал обновления, секунд": {
    "uk": "Інтервал оновлення, секунд",
    "en": "Update interval, seconds"
  },
  "По умолчанию 60 секунд. Смена языка и скрытие домена применяются сразу.": {
    "uk": "Типово 60 секунд. Зміна мови й приховування домену діють одразу.",
    "en": "Defaults to 60 seconds. Language changes and hiding a domain apply immediately."
  },
  "Discord должен быть запущен на этом ПК.": {
    "uk": "Discord має працювати на цьому ПК.",
    "en": "Discord must be running on this PC."
  },
  "Скопировать текст?": {
    "uk": "Скопіювати текст?",
    "en": "Copy this text?"
  },
  "Показано начало текста. Всего символов: ": {
    "uk": "Показано початок тексту. Усього символів: ",
    "en": "Showing the start of the text. Total characters: "
  }
};
Object.assign(catalog,{"Сделать Veyra браузером по умолчанию?": {"en": "Make Veyra your default browser?", "uk": "Зробити Veyra типовим браузером?", "de": "Veyra als Standardbrowser festlegen?", "fr": "Définir Veyra comme navigateur par défaut ?", "es": "¿Establecer Veyra como navegador predeterminado?", "pl": "Ustawić Veyra jako domyślną przeglądarkę?"}, "Сделать основным": {"en": "Set as default", "uk": "Зробити типовим", "de": "Als Standard festlegen", "fr": "Définir par défaut", "es": "Establecer por defecto", "pl": "Ustaw jako domyślną"}, "Сделать браузером по умолчанию": {"en": "Set as default browser", "uk": "Зробити типовим браузером", "de": "Als Standardbrowser festlegen", "fr": "Définir comme navigateur par défaut", "es": "Establecer como navegador predeterminado", "pl": "Ustaw jako domyślną przeglądarkę"}, "Виджеты": {"en": "Widgets", "uk": "Віджети", "de": "Widgets", "fr": "Widgets", "es": "Widgets", "pl": "Widżety"}, "Профиль и синхронизация": {"en": "Profile and sync", "uk": "Профіль і синхронізація", "de": "Profil und Synchronisierung", "fr": "Profil et synchronisation", "es": "Perfil y sincronización", "pl": "Profil i synchronizacja"}, "Обновления": {"en": "Updates", "uk": "Оновлення", "de": "Updates", "fr": "Mises à jour", "es": "Actualizaciones", "pl": "Aktualizacje"}, "Проверить обновления": {"en": "Check for updates", "uk": "Перевірити оновлення", "de": "Nach Updates suchen", "fr": "Rechercher des mises à jour", "es": "Buscar actualizaciones", "pl": "Sprawdź aktualizacje"}, "Скачать проверенную сборку": {"en": "Download verified build", "uk": "Завантажити перевірену збірку", "de": "Geprüfte Version herunterladen", "fr": "Télécharger la version vérifiée", "es": "Descargar versión verificada", "pl": "Pobierz zweryfikowaną wersję"}, "Загрузка, Мбит/с": {"en": "Download, Mbps", "uk": "Завантаження, Мбіт/с", "de": "Download, Mbit/s", "fr": "Réception, Mbit/s", "es": "Descarga, Mbit/s", "pl": "Pobieranie, Mb/s"}, "Отправка, Мбит/с": {"en": "Upload, Mbps", "uk": "Надсилання, Мбіт/с", "de": "Upload, Mbit/s", "fr": "Envoi, Mbit/s", "es": "Subida, Mbit/s", "pl": "Wysyłanie, Mb/s"}, "Ответ": {"en": "Response", "uk": "Відповідь", "de": "Antwort", "fr": "Réponse", "es": "Respuesta", "pl": "Odpowiedź"}, "Продолжить": {"en": "Continue", "uk": "Продовжити", "de": "Weiter", "fr": "Continuer", "es": "Continuar", "pl": "Kontynuuj"}, "Твой порядок. Твой ритм.": {"en": "Arrange it your way.", "uk": "Твій порядок. Твій ритм.", "de": "Nach deinen Wünschen.", "fr": "À votre façon.", "es": "A tu manera.", "pl": "Po Twojemu."}, "На главной": {"en": "On your home page", "uk": "На головній", "de": "Auf der Startseite", "fr": "Sur la page d’accueil", "es": "En la página de inicio", "pl": "Na stronie głównej"}, "Часы": {"en": "Clock", "uk": "Годинник", "de": "Uhr", "fr": "Horloge", "es": "Reloj", "pl": "Zegar"}, "Обычный": {"en": "Plain", "uk": "Звичайний", "de": "Schlicht", "fr": "Simple", "es": "Sencillo", "pl": "Prosty"}, "Стекло": {"en": "Glass", "uk": "Скло", "de": "Glas", "fr": "Verre", "es": "Cristal", "pl": "Szkło"}, "Акцент": {"en": "Accent", "uk": "Акцент", "de": "Akzent", "fr": "Accent", "es": "Acento", "pl": "Akcent"}, "Широкий": {"en": "Wide", "uk": "Широкий", "de": "Breit", "fr": "Large", "es": "Ancho", "pl": "Szeroki"}, "Коллекция": {"en": "Collection", "uk": "Колекція", "de": "Sammlung", "fr": "Collection", "es": "Colección", "pl": "Kolekcja"}, "Календарь": {"en": "Calendar", "uk": "Календар", "de": "Kalender", "fr": "Calendrier", "es": "Calendario", "pl": "Kalendarz"}, "Заметки": {"en": "Notes", "uk": "Нотатки", "de": "Notizen", "fr": "Notes", "es": "Notas", "pl": "Notatki"}, "Таймер": {"en": "Timer", "uk": "Таймер", "de": "Timer", "fr": "Minuteur", "es": "Temporizador", "pl": "Minutnik"}, "Недавние запросы": {"en": "Recent searches", "uk": "Недавні запити", "de": "Letzte Suchanfragen", "fr": "Recherches récentes", "es": "Búsquedas recientes", "pl": "Ostatnie wyszukiwania"}, "Сообщество": {"en": "Community", "uk": "Спільнота", "de": "Community", "fr": "Communauté", "es": "Comunidad", "pl": "Społeczność"}, "Очистить недавние запросы": {"en": "Clear recent searches", "uk": "Очистити недавні запити", "de": "Letzte Suchanfragen löschen", "fr": "Effacer les recherches récentes", "es": "Borrar búsquedas recientes", "pl": "Wyczyść ostatnie wyszukiwania"}, "Аккаунт Veyra": {"en": "Veyra account", "uk": "Акаунт Veyra", "de": "Veyra-Konto", "fr": "Compte Veyra", "es": "Cuenta de Veyra", "pl": "Konto Veyra"}, "Пароль аккаунта": {"en": "Account password", "uk": "Пароль акаунта", "de": "Kontopasswort", "fr": "Mot de passe du compte", "es": "Contraseña de la cuenta", "pl": "Hasło konta"}, "Войти": {"en": "Sign in", "uk": "Увійти", "de": "Anmelden", "fr": "Se connecter", "es": "Iniciar sesión", "pl": "Zaloguj się"}, "Создать аккаунт": {"en": "Create account", "uk": "Створити акаунт", "de": "Konto erstellen", "fr": "Créer un compte", "es": "Crear cuenta", "pl": "Utwórz konto"}, "Подтвердить email": {"en": "Confirm email", "uk": "Підтвердити email", "de": "E-Mail bestätigen", "fr": "Confirmer l’adresse e-mail", "es": "Confirmar correo", "pl": "Potwierdź e-mail"}, "Код из письма": {"en": "Email code", "uk": "Код із листа", "de": "Code aus der E-Mail", "fr": "Code reçu par e-mail", "es": "Código del correo", "pl": "Kod z wiadomości"}, "Подтвердить и войти": {"en": "Confirm and sign in", "uk": "Підтвердити й увійти", "de": "Bestätigen und anmelden", "fr": "Confirmer et se connecter", "es": "Confirmar e iniciar sesión", "pl": "Potwierdź i zaloguj się"}, "Забыли пароль?": {"en": "Forgot password?", "uk": "Забули пароль?", "de": "Passwort vergessen?", "fr": "Mot de passe oublié ?", "es": "¿Olvidaste la contraseña?", "pl": "Nie pamiętasz hasła?"}, "Отправить код восстановления": {"en": "Send recovery code", "uk": "Надіслати код відновлення", "de": "Wiederherstellungscode senden", "fr": "Envoyer le code de récupération", "es": "Enviar código de recuperación", "pl": "Wyślij kod odzyskiwania"}, "Новый пароль": {"en": "New password", "uk": "Новий пароль", "de": "Neues Passwort", "fr": "Nouveau mot de passe", "es": "Nueva contraseña", "pl": "Nowe hasło"}, "Сохранить пароль и войти": {"en": "Save password and sign in", "uk": "Зберегти пароль і увійти", "de": "Passwort speichern und anmelden", "fr": "Enregistrer le mot de passe et se connecter", "es": "Guardar contraseña e iniciar sesión", "pl": "Zapisz hasło i zaloguj się"}, "Профиль": {"en": "Profile", "uk": "Профіль", "de": "Profil", "fr": "Profil", "es": "Perfil", "pl": "Profil"}, "Устройства": {"en": "Devices", "uk": "Пристрої", "de": "Geräte", "fr": "Appareils", "es": "Dispositivos", "pl": "Urządzenia"}, "Имя": {"en": "Name", "uk": "Ім’я", "de": "Name", "fr": "Nom", "es": "Nombre", "pl": "Imię"}, "Название устройства": {"en": "Device name", "uk": "Назва пристрою", "de": "Gerätename", "fr": "Nom de l’appareil", "es": "Nombre del dispositivo", "pl": "Nazwa urządzenia"}, "Это устройство": {"en": "This device", "uk": "Цей пристрій", "de": "Dieses Gerät", "fr": "Cet appareil", "es": "Este dispositivo", "pl": "To urządzenie"}, "Без названия": {"en": "Unnamed", "uk": "Без назви", "de": "Unbenannt", "fr": "Sans nom", "es": "Sin nombre", "pl": "Bez nazwy"}, "Завершить сеанс": {"en": "End session", "uk": "Завершити сеанс", "de": "Sitzung beenden", "fr": "Fermer la session", "es": "Cerrar sesión", "pl": "Zakończ sesję"}, "Облачные копии": {"en": "Cloud backups", "uk": "Хмарні копії", "de": "Cloud-Sicherungen", "fr": "Sauvegardes cloud", "es": "Copias en la nube", "pl": "Kopie w chmurze"}, "Пока нет копий": {"en": "No backups yet", "uk": "Копій ще немає", "de": "Noch keine Sicherungen", "fr": "Aucune sauvegarde", "es": "Aún no hay copias", "pl": "Brak kopii"}, "Сохранено": {"en": "Saved", "uk": "Збережено", "de": "Gespeichert", "fr": "Enregistré", "es": "Guardado", "pl": "Zapisano"}, "Только на этом устройстве": {"en": "Only on this device", "uk": "Лише на цьому пристрої", "de": "Nur auf diesem Gerät", "fr": "Uniquement sur cet appareil", "es": "Solo en este dispositivo", "pl": "Tylko na tym urządzeniu"}, "Здесь появятся твои запросы": {"en": "Your searches will appear here", "uk": "Тут з’являться твої запити", "de": "Deine Suchanfragen erscheinen hier", "fr": "Vos recherches apparaîtront ici", "es": "Tus búsquedas aparecerán aquí", "pl": "Tutaj pojawią się Twoje wyszukiwania"}, "Начать": {"en": "Start", "uk": "Почати", "de": "Starten", "fr": "Démarrer", "es": "Iniciar", "pl": "Rozpocznij"}, "Остановить": {"en": "Stop", "uk": "Зупинити", "de": "Stoppen", "fr": "Arrêter", "es": "Detener", "pl": "Zatrzymaj"}, "Время вышло": {"en": "Time is up", "uk": "Час вийшов", "de": "Die Zeit ist um", "fr": "Le temps est écoulé", "es": "Se acabó el tiempo", "pl": "Czas minął"}, "Опубликовать": {"en": "Publish", "uk": "Опублікувати", "de": "Veröffentlichen", "fr": "Publier", "es": "Publicar", "pl": "Opublikuj"}, "Опубликовать виджет": {"en": "Publish widget", "uk": "Опублікувати віджет", "de": "Widget veröffentlichen", "fr": "Publier le widget", "es": "Publicar widget", "pl": "Opublikuj widżet"}, "Удалить публикацию": {"en": "Remove publication", "uk": "Видалити публікацію", "de": "Veröffentlichung entfernen", "fr": "Supprimer la publication", "es": "Eliminar publicación", "pl": "Usuń publikację"}, "Описание": {"en": "Description", "uk": "Опис", "de": "Beschreibung", "fr": "Description", "es": "Descripción", "pl": "Opis"}, "Ширина": {"en": "Width", "uk": "Ширина", "de": "Breite", "fr": "Largeur", "es": "Ancho", "pl": "Szerokość"}, "Выше": {"en": "Move up", "uk": "Вище", "de": "Nach oben", "fr": "Monter", "es": "Subir", "pl": "W górę"}, "Ниже": {"en": "Move down", "uk": "Нижче", "de": "Nach unten", "fr": "Descendre", "es": "Bajar", "pl": "W dół"}, "Переместить": {"en": "Move", "uk": "Перемістити", "de": "Verschieben", "fr": "Déplacer", "es": "Mover", "pl": "Przenieś"}, "Изменить размер": {"en": "Resize", "uk": "Змінити розмір", "de": "Größe ändern", "fr": "Redimensionner", "es": "Cambiar tamaño", "pl": "Zmień rozmiar"}, "Открывать сайты отдельными окнами": {"en": "Open sites in separate windows", "uk": "Відкривати сайти окремими вікнами"}, "Если выключено, новые окна сайтов открываются вкладками.": {"en": "When off, sites open new windows as tabs.", "uk": "Якщо вимкнено, нові вікна сайтів відкриваються вкладками."}, "Проверка подписи и контрольной суммы. Установка вручную.": {"en": "Signature and checksum verification. Manual installation.", "uk": "Перевірка підпису та контрольної суми. Ручне встановлення."}, "Ограничение сети для каждого профиля. 0 — без ограничения.": {"en": "Network limit per profile. 0 means unlimited.", "uk": "Обмеження мережі для кожного профілю. 0 — без обмеження."}, "Публикуются только оформление и параметры. Текст заметок остаётся на устройстве.": {"en": "Only appearance and settings are published. Notes stay on your device.", "uk": "Публікуються лише оформлення й параметри. Текст нотаток залишається на пристрої."}, "Синхронизация закладок между Windows и Android": {"en": "Bookmark sync between Windows and Android", "uk": "Синхронізація закладок між Windows та Android"}, "Закладки шифруются на устройстве отдельной фразой. Используй одну фразу на всех устройствах. Восстановить её через сервер нельзя. Пароли, история и cookie не передаются.": {"en": "Bookmarks are encrypted on your device with a separate phrase. Use the same phrase on all devices. The server cannot recover it. Passwords, history and cookies are excluded.", "uk": "Закладки шифруються на пристрої окремою фразою. Використовуй одну фразу на всіх пристроях. Відновити її через сервер неможливо. Паролі, історія та cookie не передаються."}, "От 12 символов, до 72 байт UTF-8 (кириллица занимает больше одного байта).": {"en": "At least 12 characters, up to 72 UTF-8 bytes. Some characters use multiple bytes.", "uk": "Від 12 символів, до 72 байтів UTF-8 (кирилиця займає більше одного байта)."}, "Максимум 12 виджетов": {"en": "Maximum 12 widgets", "uk": "Максимум 12 віджетів"}, "Не удалось загрузить коллекцию": {"en": "Could not load collection", "uk": "Не вдалося завантажити колекцію"}, "Загрузка…": {"en": "Loading…", "uk": "Завантаження…"}});
const extendedTranslations={"Settings": {"de": "Einstellungen", "fr": "Paramètres", "es": "Configuración", "pl": "Ustawienia"}, "New tab": {"de": "Neuer Tab", "fr": "Nouvel onglet", "es": "Nueva pestaña", "pl": "Nowa karta"}, "Bookmarks": {"de": "Lesezeichen", "fr": "Favoris", "es": "Marcadores", "pl": "Zakładki"}, "History": {"de": "Verlauf", "fr": "Historique", "es": "Historial", "pl": "Historia"}, "Downloads": {"de": "Downloads", "fr": "Téléchargements", "es": "Descargas", "pl": "Pobrane"}, "Passwords": {"de": "Passwörter", "fr": "Mots de passe", "es": "Contraseñas", "pl": "Hasła"}, "Password manager": {"de": "Passwortmanager", "fr": "Gestionnaire de mots de passe", "es": "Gestor de contraseñas", "pl": "Menedżer haseł"}, "Privacy": {"de": "Datenschutz", "fr": "Confidentialité", "es": "Privacidad", "pl": "Prywatność"}, "Save": {"de": "Speichern", "fr": "Enregistrer", "es": "Guardar", "pl": "Zapisz"}, "Cancel": {"de": "Abbrechen", "fr": "Annuler", "es": "Cancelar", "pl": "Anuluj"}, "Copy": {"de": "Kopieren", "fr": "Copier", "es": "Copiar", "pl": "Kopiuj"}, "Delete": {"de": "Löschen", "fr": "Supprimer", "es": "Eliminar", "pl": "Usuń"}, "Search": {"de": "Suche", "fr": "Recherche", "es": "Buscar", "pl": "Szukaj"}, "Interface language": {"de": "Sprache der Oberfläche", "fr": "Langue de l’interface", "es": "Idioma de la interfaz", "pl": "Język interfejsu"}, "Appearance": {"de": "Darstellung", "fr": "Apparence", "es": "Apariencia", "pl": "Wygląd"}, "Dark": {"de": "Dunkel", "fr": "Sombre", "es": "Oscuro", "pl": "Ciemny"}, "Light": {"de": "Hell", "fr": "Clair", "es": "Claro", "pl": "Jasny"}, "System": {"de": "System", "fr": "Système", "es": "Sistema", "pl": "Systemowy"}, "Themes and wallpaper": {"de": "Designs und Hintergrund", "fr": "Thèmes et fond d’écran", "es": "Temas y fondo", "pl": "Motywy i tapeta"}, "Customize": {"de": "Anpassen", "fr": "Personnaliser", "es": "Personalizar", "pl": "Dostosuj"}, "Compatibility list": {"de": "Kompatibilitätsliste", "fr": "Liste de compatibilité", "es": "Lista de compatibilidad", "pl": "Lista zgodności"}, "Domains": {"de": "Domains", "fr": "Domaines", "es": "Dominios", "pl": "Domeny"}, "Brightness": {"de": "Helligkeit", "fr": "Luminosité", "es": "Brillo", "pl": "Jasność"}, "Contrast": {"de": "Kontrast", "fr": "Contraste", "es": "Contraste", "pl": "Kontrast"}, "Apply": {"de": "Anwenden", "fr": "Appliquer", "es": "Aplicar", "pl": "Zastosuj"}, "Home shortcuts": {"de": "Startseiten-Verknüpfungen", "fr": "Raccourcis d’accueil", "es": "Accesos de inicio", "pl": "Skróty strony głównej"}, "Add website": {"de": "Website hinzufügen", "fr": "Ajouter un site", "es": "Añadir sitio", "pl": "Dodaj witrynę"}, "Add": {"de": "Hinzufügen", "fr": "Ajouter", "es": "Añadir", "pl": "Dodaj"}, "Name": {"de": "Name", "fr": "Nom", "es": "Nombre", "pl": "Nazwa"}, "Address": {"de": "Adresse", "fr": "Adresse", "es": "Dirección", "pl": "Adres"}, "Off": {"de": "Aus", "fr": "Désactivé", "es": "Desactivado", "pl": "Wyłączone"}, "Connected": {"de": "Verbunden", "fr": "Connecté", "es": "Conectado", "pl": "Połączono"}, "Connecting": {"de": "Verbindung wird hergestellt", "fr": "Connexion", "es": "Conectando", "pl": "Łączenie"}, "Open Discord": {"de": "Discord öffnen", "fr": "Ouvrir Discord", "es": "Abrir Discord", "pl": "Otwórz Discord"}, "Save settings": {"de": "Einstellungen speichern", "fr": "Enregistrer les paramètres", "es": "Guardar configuración", "pl": "Zapisz ustawienia"}, "Search or enter address": {"de": "Suchen oder Adresse eingeben", "fr": "Rechercher ou saisir une adresse", "es": "Buscar o introducir dirección", "pl": "Szukaj lub wpisz adres"}, "Protected profile": {"de": "Geschütztes Profil", "fr": "Profil protégé", "es": "Perfil protegido", "pl": "Profil chroniony"}, "Temporary profile": {"de": "Temporäres Profil", "fr": "Profil temporaire", "es": "Perfil temporal", "pl": "Profil tymczasowy"}, "Copying from websites": {"de": "Kopieren von Websites", "fr": "Copie depuis les sites", "es": "Copia desde sitios", "pl": "Kopiowanie z witryn"}, "Copy immediately": {"de": "Sofort kopieren", "fr": "Copier immédiatement", "es": "Copiar inmediatamente", "pl": "Kopiuj od razu"}, "Ask with preview": {"de": "Mit Vorschau fragen", "fr": "Demander avec aperçu", "es": "Preguntar con vista previa", "pl": "Pytaj z podglądem"}};
for(const item of Object.values(catalog)){const e=extendedTranslations[item.en];if(e)for(const [lang,text] of Object.entries(e))if(!item[lang])item[lang]=text;}
Object.assign(catalog,{"Не усыплять эту вкладку": {"en": "Keep this tab awake", "uk": "Не присипляти цю вкладку", "de": "Diesen Tab wach halten", "fr": "Garder cet onglet actif", "es": "Mantener esta pestaña activa", "pl": "Nie usypiaj tej karty"}, "Подмена фокуса и fullscreen": {"en": "Focus and fullscreen compatibility", "uk": "Сумісність фокуса й fullscreen", "de": "Fokus- und Vollbildkompatibilität", "fr": "Compatibilité du focus et du plein écran", "es": "Compatibilidad de foco y pantalla completa", "pl": "Zgodność fokusu i pełnego ekranu"}, "Выйти": {"en": "Sign out", "uk": "Вийти", "de": "Abmelden", "fr": "Se déconnecter", "es": "Cerrar sesión", "pl": "Wyloguj się"}, "Выйти на всех устройствах": {"en": "Sign out everywhere", "uk": "Вийти на всіх пристроях", "de": "Überall abmelden", "fr": "Se déconnecter partout", "es": "Cerrar todas las sesiones", "pl": "Wyloguj się wszędzie"}, "Фраза шифрования": {"en": "Encryption phrase", "uk": "Фраза шифрування", "de": "Verschlüsselungsphrase", "fr": "Phrase de chiffrement", "es": "Frase de cifrado", "pl": "Fraza szyfrowania"}, "Отправить закладки": {"en": "Upload bookmarks", "uk": "Надіслати закладки", "de": "Lesezeichen hochladen", "fr": "Envoyer les favoris", "es": "Subir marcadores", "pl": "Wyślij zakładki"}, "Получить закладки": {"en": "Download bookmarks", "uk": "Отримати закладки", "de": "Lesezeichen herunterladen", "fr": "Télécharger les favoris", "es": "Descargar marcadores", "pl": "Pobierz zakładki"}, "Безопасность аккаунта": {"en": "Account security", "uk": "Безпека акаунта", "de": "Kontosicherheit", "fr": "Sécurité du compte", "es": "Seguridad de la cuenta", "pl": "Bezpieczeństwo konta"}, "Текущий пароль": {"en": "Current password", "uk": "Поточний пароль", "de": "Aktuelles Passwort", "fr": "Mot de passe actuel", "es": "Contraseña actual", "pl": "Aktualne hasło"}, "Сменить пароль": {"en": "Change password", "uk": "Змінити пароль", "de": "Passwort ändern", "fr": "Changer le mot de passe", "es": "Cambiar contraseña", "pl": "Zmień hasło"}, "Удалить аккаунт": {"en": "Delete account", "uk": "Видалити акаунт", "de": "Konto löschen", "fr": "Supprimer le compte", "es": "Eliminar cuenta", "pl": "Usuń konto"}, "Фильтрация готова": {"en": "Filtering ready", "uk": "Фільтрація готова", "de": "Filterung bereit", "fr": "Filtrage prêt", "es": "Filtrado listo", "pl": "Filtrowanie gotowe"}, "Загрузка фильтров…": {"en": "Loading filters…", "uk": "Завантаження фільтрів…", "de": "Filter werden geladen…", "fr": "Chargement des filtres…", "es": "Cargando filtros…", "pl": "Ładowanie filtrów…"}, "При запуске, если списки старше суток. Запросы идут к источникам списков uBlock Origin.": {"en": "Allow uBlock Origin to update its filter lists automatically. Requests go to the list providers.", "uk": "Дозволити uBlock Origin автоматично оновлювати списки. Запити надсилаються до їхніх постачальників."}, "Лимит скорости каждой вкладки. 0 — без ограничения. В профиле Google не применяется.": {"en": "Speed limit per tab. 0 means unlimited. Not applied to Google compatibility tabs.", "uk": "Ліміт швидкості кожної вкладки. 0 — без обмеження. У профілі Google не застосовується."}, "Не менее 16 символов. Передача ручная. Получение объединяет закладки, сохраняя местные. Удаления между устройствами не распространяются.": {"en": "At least 16 characters. Transfers are manual. Downloading merges bookmarks and keeps local entries. Deletions do not propagate between devices.", "uk": "Щонайменше 16 символів. Передавання ручне. Отримання об’єднує закладки та зберігає місцеві. Видалення між пристроями не поширюються."}, "После смены пароля потребуется войти заново на всех устройствах.": {"en": "After changing your password, sign in again on every device.", "uk": "Після зміни пароля потрібно увійти знову на всіх пристроях."}, "Будут удалены аккаунт и его облачные копии. Местные закладки сохранятся.": {"en": "Your account and cloud backups will be deleted. Local bookmarks are kept.", "uk": "Акаунт і хмарні копії буде видалено. Місцеві закладки збережуться."}});
Object.assign(catalog,{"Закрыть до следующего запуска": {"en": "Dismiss until next launch", "uk": "Закрити до наступного запуску", "de": "Bis zum nächsten Start ausblenden", "fr": "Masquer jusqu’au prochain lancement", "es": "Ocultar hasta el próximo inicio", "pl": "Ukryj do następnego uruchomienia"}, "Подмена фокуса и fullscreen (перезагрузит страницу)": {"en": "Focus and fullscreen compatibility (reloads page)", "uk": "Сумісність фокуса й fullscreen (перезавантажить сторінку)", "de": "Fokus- und Vollbildkompatibilität (lädt die Seite neu)", "fr": "Compatibilité du focus et du plein écran (recharge la page)", "es": "Compatibilidad de foco y pantalla completa (recarga la página)", "pl": "Zgodność fokusu i pełnego ekranu (odświeża stronę)"}});
Object.assign(catalog,{"Действует сетевой лимит": {"en": "Network limit active", "uk": "Діє мережевий ліміт", "de": "Netzwerklimit aktiv", "fr": "Limite réseau active", "es": "Límite de red activo", "pl": "Limit sieci jest aktywny"}, "Сетевой лимит": {"en": "Network limit", "uk": "Мережевий ліміт", "de": "Netzwerklimit", "fr": "Limite réseau", "es": "Límite de red", "pl": "Limit sieci"}, "Изменить лимит": {"en": "Change limit", "uk": "Змінити ліміт", "de": "Limit ändern", "fr": "Modifier la limite", "es": "Cambiar límite", "pl": "Zmień limit"}, "Скорость ограничена в настройках производительности.": {"en": "Speed is limited in performance settings.", "uk": "Швидкість обмежена в налаштуваннях продуктивності.", "de": "Die Geschwindigkeit ist in den Leistungseinstellungen begrenzt.", "fr": "La vitesse est limitée dans les paramètres de performances.", "es": "La velocidad está limitada en los ajustes de rendimiento.", "pl": "Prędkość jest ograniczona w ustawieniach wydajności."}, "Мбит/с": {"en": "Mbps", "uk": "Мбіт/с", "de": "Mbit/s", "fr": "Mbit/s", "es": "Mbit/s", "pl": "Mb/s"}});
Object.assign(catalog,{" · Загрузка завершена": {"en": " · Download complete"}, " · Ошибка загрузки": {"en": " · Download failed"}, "Аккаунт и облачные копии закладок будут удалены без возможности восстановления.": {"en": "Your account and cloud bookmark backups will be permanently deleted."}, "Аккаунт удалён.": {"en": "Account deleted."}, "Вход выполнен.": {"en": "Signed in."}, "Выделить всё": {"en": "Select all"}, "Диагностика выполняется на странице; её JavaScript может менять результаты. Это не сертификат анонимности.": {"en": "Diagnostics run inside the page; its JavaScript can affect the results. This does not certify anonymity."}, "Для выбора браузером по умолчанию запусти собранную Veyra.exe.": {"en": "Run the installed Veyra.exe to set it as your default browser."}, "Для этого окна включи отдельные окна сайтов в настройках.": {"en": "Enable separate site windows in settings to open this window."}, "Доступна версия ": {"en": "Version available: "}, "Загружается: ": {"en": "Downloading: "}, "Закладки объединены.": {"en": "Bookmarks merged."}, "Закладки отправлены.": {"en": "Bookmarks uploaded."}, "Запрос не выполнен: ": {"en": "Request failed: "}, "Играть без интернета": {"en": "Play offline"}, "Код восстановления отправлен. Проверь почту и папку «Спам».": {"en": "Recovery code sent. Check your inbox and spam folder."}, "Код отправлен. Открой «Подтвердить email» и введи код из письма.": {"en": "Code sent. Open Confirm email and enter the code from your email."}, "Контрольная сумма обновления не совпала.": {"en": "Update checksum does not match."}, "Копировать адрес изображения": {"en": "Copy image address"}, "Копировать адрес ссылки": {"en": "Copy link address"}, "Копировать изображение": {"en": "Copy image"}, "Не удалось загрузить обновление.": {"en": "Could not download the update."}, "Неверный формат копии.": {"en": "Invalid backup format."}, "Недопустимый адрес.": {"en": "Invalid address."}, "Некорректная копия.": {"en": "Invalid backup."}, "Некорректное обновление.": {"en": "Invalid update."}, "Некорректный ответ.": {"en": "Invalid response."}, "Некорректный путь приложения.": {"en": "Invalid application path."}, "Несохранённые данные": {"en": "Unsaved changes"}, "Открыть изображение в новой вкладке": {"en": "Open image in new tab"}, "Отменить": {"en": "Undo"}, "Пароль изменён. Войди снова.": {"en": "Password changed. Sign in again."}, "Пароль: минимум 12 символов, максимум 72 байта UTF-8.": {"en": "Password: at least 12 characters, up to 72 UTF-8 bytes."}, "Подписанное обновление пока не опубликовано.": {"en": "A signed update has not been published yet."}, "Подпись обновления недействительна.": {"en": "The update signature is invalid."}, "Размер обновления не совпал.": {"en": "Update size does not match."}, "Сборка проверена и сохранена.": {"en": "The build has been verified and saved."}, "Сервер обновлений: ": {"en": "Update server: "}, "Синхронизация": {"en": "Sync"}, "Синхронизация уже выполняется.": {"en": "Sync is already running."}, "Сначала войди в аккаунт.": {"en": "Sign in first."}, "Сначала проверь обновления.": {"en": "Check for updates first."}, "Сообщение сайта": {"en": "Message from website"}, "Сохранить изображение как…": {"en": "Save image as…"}, "Сохранить медиа как…": {"en": "Save media as…"}, "Сохранить обновление": {"en": "Save update"}, "Сохранить ссылку как…": {"en": "Save link as…"}, "Стиль": {"en": "Style"}, "Удалить аккаунт?": {"en": "Delete account?"}, "Удалить копию": {"en": "Delete backup"}, "Установлена актуальная версия": {"en": "You are up to date"}, "Фраза синхронизации: от 16 до 1024 символов.": {"en": "Sync phrase: 16 to 1024 characters."}, "Сохранение сессий заняло слишком много времени.": {"en": "Saving sessions took too long. Please try closing again."}, "Не удалось применить настройки сети и оформления.": {"en": "Could not apply network and appearance settings."}, "Этот компьютер": {"en": "This computer"}, "Слишком много запросов. Попробуй через 10 минут.": {"en": "Too many requests. Try again in 10 minutes."}, "Проверь email.": {"en": "Check your email address."}, "Повторный код можно запросить через минуту.": {"en": "You can request another code in one minute."}, "Дневной лимит писем исчерпан. Попробуй завтра.": {"en": "The daily email limit has been reached. Try again tomorrow."}, "Неверный или просроченный код.": {"en": "Incorrect or expired code."}, "Слишком много попыток входа.": {"en": "Too many sign-in attempts."}, "Неверный email или пароль.": {"en": "Incorrect email or password."}, "Войди в аккаунт.": {"en": "Sign in to your account."}, "Сессия завершена. Войди снова.": {"en": "Your session has ended. Sign in again."}, "Неверный текущий пароль.": {"en": "Incorrect current password."}, "Лимит: 10 устройств.": {"en": "Maximum 10 devices."}, "Отправка писем ещё не настроена.": {"en": "Email delivery is not configured yet."}, "Некорректный или слишком большой запрос.": {"en": "The request is invalid or too large."}, "Сервис временно недоступен.": {"en": "The service is temporarily unavailable."}, "Сервис временно недоступен. Попробуй ещё раз.": {"en": "The service is temporarily unavailable. Please try again."}, "Доступ запрещён.": {"en": "Forbidden"}, "Не найдено.": {"en": "Not found"}, "Некорректный запрос.": {"en": "Invalid request"}, "Слишком много запросов.": {"en": "Too many requests"}, "Некорректные данные профиля.": {"en": "Invalid profile"}, "Некорректный идентификатор.": {"en": "Invalid id"}, "Некорректный шаблон виджета.": {"en": "Invalid widget template"}, "Можно опубликовать не больше 20 виджетов.": {"en": "Maximum 20 publications"}, "Некорректное устройство.": {"en": "Invalid device"}, "Некорректная зашифрованная копия.": {"en": "Invalid encrypted payload"}, "Сервис аккаунтов недоступен.": {"en": "Account service unavailable"}, "Источник запроса не разрешён.": {"en": "Forbidden origin"}, "Нужен запрос JSON.": {"en": "Use application/json"}, "Не удалось подключиться. Проверь интернет и попробуй снова.": {"en": "Could not connect. Check your internet connection and try again."}, "Сервер не ответил вовремя. Попробуй снова.": {"en": "The server did not respond in time. Please try again."}, "Не удалось выполнить действие. Попробуй снова.": {"en": "Could not complete the action. Please try again."}, "Не удалось прочитать копию. Проверь фразу шифрования.": {"en": "Could not read the backup. Check your encryption phrase."}, "Ответ сервера слишком большой.": {"en": "Response too large"}});
Object.assign(catalog,{'Виджеты на новой вкладке':{en:'Widgets on the new tab page'}});
Object.assign(catalog,{'Интерфейс меняется сразу. Язык расширений — после перезапуска.':{en:'The interface changes immediately. Extension language changes after restart.',uk:'Інтерфейс змінюється одразу. Мова розширень — після перезапуску.'}});
Object.assign(catalog,{"mfa_invalid_code": {"ru": "Неверный или уже использованный код. Дождись нового кода или используй резервный.", "en": "Invalid or already used code. Wait for a new code or use a recovery code."}, "mfa_enrollment_expired": {"ru": "Время подключения истекло. Начни подключение заново.", "en": "Setup expired. Start setup again."}, "mfa_rate_limited": {"ru": "Слишком много попыток. Попробуй через 10 минут.", "en": "Too many attempts. Try again in 10 minutes."}, "mfa_already_enabled": {"ru": "Двухфакторная защита уже включена.", "en": "Two-factor authentication is already enabled."}, "mfa_not_enabled": {"ru": "Двухфакторная защита ещё не включена.", "en": "Two-factor authentication is not enabled."}, "Свой виджет": {"ru": "Свой виджет", "en": "Custom widget"}, "Конструктор виджетов": {"ru": "Конструктор виджетов", "en": "Widget builder"}, "Файл виджета слишком большой.": {"ru": "Файл виджета слишком большой.", "en": "The widget file is too large."}, "Изображение слишком большое.": {"ru": "Изображение слишком большое.", "en": "The image is too large."}, "Не удалось прочитать изображение.": {"ru": "Не удалось прочитать изображение.", "en": "Could not read the image."}});
Object.assign(catalog,{"Проверь пароль регистрации и код из письма.":{en:"Check your registration password and email code."}});
Object.assign(catalog,{"Вход выполнен.":{en:"Signed in."},"Изображение":{en:"Image"}});
const languages=['ru','uk','en','de','fr','es','pl'];
function translate(value,language='ru'){
 let text=String(value??'');if(!languages.includes(language))return text;
 // Normalize known service messages only; user content is excluded by the UI.
 if(language==='ru'){if(catalog[text]?.ru)return catalog[text].ru;for(const [source,entry] of Object.entries(catalog))if(entry.en===text)return entry.ru||source;return text;}
 const direct=(catalog[text]?.[language]||catalog[text]?.en);if(direct)return direct;
 const trimmed=text.trim();if(catalog[trimmed])return text.replace(trimmed,catalog[trimmed][language]||catalog[trimmed].en);
 const prefixes={
  'Не удалось сохранить профиль: ':['Не вдалося зберегти профіль: ','Unable to save profile: '],
  'Добавлено закладок: ':['Додано закладок: ','Bookmarks added: '],
  'Загружено: ':['Завантажено: ','Downloaded: '],
  'Обновлены: ':['Оновлено: ','Updated: '],
  'Доступна версия ':['Доступна версія ','Version available: '],
  'Загружается: ':['Завантажується: ','Downloading: '],
  'Сервер обновлений: ':['Сервер оновлень: ','Update server: '],
  'Запрос не выполнен: ':['Запит не виконано: ','Request failed: ']
 };
 for(const [prefix,values] of Object.entries(prefixes))if(trimmed.startsWith(prefix))return text.replace(prefix,values[language==='uk'?0:1]);
 if(/^\d+(?:[.,]\d+)? МБ$/.test(trimmed)&&language==='en')return text.replace('МБ','MB');
 if(/^\d+(?:[.,]\d+)? \/ \d+(?:[.,]\d+)? МБ$/.test(trimmed)&&language==='en')return text.replace('МБ','MB');
 if(trimmed.startsWith('Открой HTTPS-страницу ')&&trimmed.endsWith(' в текущей вкладке.')){
  const origin=trimmed.slice('Открой HTTPS-страницу '.length,-' в текущей вкладке.'.length);
  return language==='uk'?'Відкрий HTTPS-сторінку '+origin+' в поточній вкладці.':'Open the HTTPS page '+origin+' in the current tab.';
 }
 return text;
}
function errorMessage(error,language='ru'){
 const message=String(error?.message??error??'');
 if(catalog[message]||Object.values(catalog).some(x=>x.en===message))return translate(message,language);
 if(/timeout|timed out|aborted/i.test(message))return translate('Сервер не ответил вовремя. Попробуй снова.',language);
 if(/fetch failed|network|ENOTFOUND|ECONN|ERR_INTERNET|ERR_NAME/i.test(message))return translate('Не удалось подключиться. Проверь интернет и попробуй снова.',language);
 if(/authenticate data|decrypt|AEADBadTag/i.test(message))return translate('Не удалось прочитать копию. Проверь фразу шифрования.',language);
 // Keep known Russian validation messages; generic copy for engine/internal errors.
 if(/[А-Яа-яЁё]/.test(message)){const result=translate(message,language);if(language==='ru'||result!==message)return result;}
 return translate('Не удалось выполнить действие. Попробуй снова.',language);
}
Object.assign(catalog,{"Обычные ссылки открываются вкладками. Явные всплывающие окна сайтов сохраняются.":{"en":"Ordinary links open in tabs. Explicit site popups keep their own windows.","uk":"Звичайні посилання відкриваються у вкладках. Явні спливні вікна сайтів зберігаються."}});
Object.assign(catalog,{"Совместимость сайта":{"en":"Site compatibility","uk":"Сумісність сайту"},"Защита сайта":{"en":"Site protection","uk":"Захист сайту"}});
Object.assign(catalog,{"Открыть внешнее приложение?": {"en": "Open an external application?"}, "Приложение не найдено": {"en": "Application not found"}, "Этот сайт хочет открыть приложение на компьютере.": {"en": "This site wants to open an application on your computer."}, "Установи приложение для этого типа ссылок и попробуй снова.": {"en": "Install an application for this type of link and try again."}, "Всегда разрешать этому сайту открывать это приложение": {"en": "Always allow this site to open this application"}, "Открыть приложение": {"en": "Open application"}, "Внешние приложения": {"en": "External applications"}, "Разрешения на открытие приложений сохраняются отдельно для каждого сайта.": {"en": "Permissions to open applications are saved separately for each site."}, "Сохранённых разрешений нет.": {"en": "No saved permissions."}, "Сбросить": {"en": "Reset"}, "Сбросить все разрешения приложений": {"en": "Reset all application permissions"}, "Разрешения приложений сброшены.": {"en": "Application permissions reset."}, "Не удалось открыть приложение.": {"en": "Could not open the application."}, "Копировать чистую ссылку": {"en": "Copy clean link"}, "Чистая ссылка скопирована.": {"en": "Clean link copied."}, "Ссылка скопирована.": {"en": "Link copied."}});
Object.assign(catalog,{'Сервер поддержки в Discord':{en:'Discord support server',uk:'Сервер підтримки у Discord'}});
const api={translate,errorMessage,languages,catalog};
if(typeof module==='object'&&module.exports)module.exports=api;
else root.VeyraI18n=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this);
