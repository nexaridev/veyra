# Android 0.2.0

См. [описание выпуска](../RELEASE-0.6.0.md). Локальный файл `release/Veyra-Android-0.2.0-arm64.apk` — release APK без отладки, подписанный тем же сертификатом, что и 0.1.0. Можно устанавливать поверх первой сборки; сначала рекомендуется сохранить важные данные.

Сборка `BUILD-ANDROID.ps1` создаёт тестовую debug APK. Для release передай Gradle свойство `-PveyraReleaseStore=<путь>` и переменные окружения `VEYRA_ANDROID_STORE_PASSWORD` / `VEYRA_ANDROID_KEY_PASSWORD`, затем `assembleRelease lintRelease`. Не добавляй ключи и пароли в Git. Локальная защищённая копия ключа подготовлена в `%LOCALAPPDATA%/VeyraReleaseKeys`, сохраняй её резервную копию вне исходников.

GitHub workflow создаёт отдельную CI debug APK; она не заменяет подписанный release и не должна использоваться для обновления существующей установки.
