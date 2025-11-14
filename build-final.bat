@echo off
chcp 65001
title Complete Build - Dota 2 Item Builder

echo ========================================
echo    COMPLETE BUILD - DOTA 2 ITEM BUILDER
echo ========================================
echo.

echo 1. Создание структуры папок...
if not exist "app\" mkdir app
if not exist "eula\" mkdir eula
if not exist "core\" mkdir core
if not exist "splash\" mkdir splash

echo 2. Очистка старых файлов...
rmdir /s /q dist 2>nul
rmdir /s /q portable 2>nul
rmdir /s /q node_modules 2>nul
del "Dota 2 Item Builder.exe" 2>nul
del package-lock.json 2>nul

echo 3. Создание package.json...
(
echo {
echo   "name": "dota-item-builder",
echo   "version": "1.0.0",
echo   "description": "Dota 2 Custom Item Builder",
echo   "main": "core/main.js",
echo   "scripts": {
echo     "start": "electron .",
echo     "build": "electron-builder --dir",
echo     "dist": "electron-builder --win portable"
echo   },
echo   "author": "AniPream",
echo   "license": "MIT",
echo   "devDependencies": {
echo     "electron": "^22.0.0",
echo     "electron-builder": "^23.0.0"
echo   },
echo   "build": {
echo     "appId": "com.AniPream.dota-item-builder",
echo     "productName": "Dota 2 Item Builder",
echo     "directories": {
echo       "output": "portable"
echo     },
echo     "files": [
echo       "app/**/*",
echo       "eula/**/*", 
echo       "core/**/*",
echo       "splash/**/*",
echo       "package.json",
echo       "icon.png"
echo     ],
echo     "win": {
echo       "target": "portable",
echo       "artifactName": "Dota 2 Item Builder.${ext}"
echo     }
echo   }
echo }
) > package.json

echo 4. Установка зависимостей...
call npm install

echo 5. Сборка приложения...
call npm run dist

echo 6. Проверка результата...
if exist "portable\Dota 2 Item Builder.exe" (
    copy "portable\Dota 2 Item Builder.exe" "Dota 2 Item Builder.exe"
    echo ✅ УСПЕХ! Приложение собрано!
    echo.
    echo 📍 Файл: Dota 2 Item Builder.exe
    echo 📁 Конфиг будет в: %%APPDATA%%\dota-item-builder\
    echo.
    echo 🚀 ОСОБЕННОСТИ:
    echo • Строгая валидация названия предмета
    echo • Максимум 100 уровней
    echo • Правильная генерация классов предметов
    echo • Все классы наследуются от первого уровня
    echo.
) else (
    echo ❌ Ошибка: EXE не создан
)

echo 7. Создание splash screen...
(
echo ^<!DOCTYPE html^>
echo ^<html^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<title^>Загрузка...^</title^>
echo     ^<style^>
echo         * ^{
echo             margin: 0;
echo             padding: 0;
echo             box-sizing: border-box;
echo         ^}
echo         body ^{
echo             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
echo             background: linear-gradient(135deg, #1e3c72 0%%, #2a5298 100%%^);
echo             color: white;
echo             display: flex;
echo             flex-direction: column;
echo             justify-content: center;
echo             align-items: center;
echo             height: 100vh;
echo             text-align: center;
echo         ^}
echo         .logo ^{
echo             font-size: 2.5em;
echo             margin-bottom: 20px;
echo             font-weight: bold;
echo         ^}
echo         .loader ^{
echo             width: 50px;
echo             height: 50px;
echo             border: 5px solid rgba(255, 255, 255, 0.3^);
echo             border-top: 5px solid white;
echo             border-radius: 50%%;
echo             animation: spin 1s linear infinite;
echo             margin: 20px auto;
echo         ^}
echo         .status ^{
echo             margin-top: 20px;
echo             font-size: 1.1em;
echo         ^}
echo         @keyframes spin ^{
echo             0%% ^{ transform: rotate(0deg^); ^}
echo             100%% ^{ transform: rotate(360deg^); ^}
echo         ^}
echo     ^</style^>
echo ^</head^>
echo ^<body^>
echo     ^<div class="logo"^>Dota 2 Item Builder^</div^>
echo     ^<div class="loader"^>^</div^>
echo     ^<div class="status" id="status"^>Загрузка приложения...^</div^>
echo     ^<script^>
echo         setTimeout^(^() =^> ^{
echo             document.getElementById^('status'^).textContent = 'Инициализация компонентов...';
echo         ^}, 1500^);
echo         setTimeout^(^() =^> ^{
echo             document.getElementById^('status'^).textContent = 'Почти готово...';
echo         ^}, 3000^);
echo     ^</script^>
echo ^</body^>
echo ^</html^>
) > splash\splash.html

pause