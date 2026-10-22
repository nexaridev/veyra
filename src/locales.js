(function(root){
'use strict';
const catalog={
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
const languages=['ru','uk','en','de','fr','es','pl'];
function translate(value,language='ru'){
 const text=String(value??'');if(language==='ru'||!languages.includes(language))return text;
 const direct=(catalog[text]?.[language]||catalog[text]?.en);if(direct)return direct;
 const trimmed=text.trim();if(catalog[trimmed])return text.replace(trimmed,catalog[trimmed][language]||catalog[trimmed].en);
 const prefixes={
  'Не удалось сохранить профиль: ':['Не вдалося зберегти профіль: ','Unable to save profile: '],
  'Добавлено закладок: ':['Додано закладок: ','Bookmarks added: '],
  'Загружено: ':['Завантажено: ','Downloaded: '],
  'Обновлены: ':['Оновлено: ','Updated: ']
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
const api={translate,languages,catalog};
if(typeof module==='object'&&module.exports)module.exports=api;
else root.VeyraI18n=Object.freeze(api);
})(typeof globalThis!=='undefined'?globalThis:this);
