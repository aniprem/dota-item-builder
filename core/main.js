const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Конфигурация
const CONFIG_PATH = path.join(app.getPath('userData'), 'user-config.json');

class ConfigManager {
    static getConfig() {
        try {
            if (fs.existsSync(CONFIG_PATH)) {
                const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
                return JSON.parse(configData);
            }
        } catch (error) {
            console.log('Ошибка чтения конфигурации:', error);
        }
        return { eulaAccepted: false };
    }

    static saveConfig(config) {
        try {
            const configDir = path.dirname(CONFIG_PATH);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
            return true;
        } catch (error) {
            console.log('Ошибка сохранения конфигурации:', error);
            return false;
        }
    }

    static acceptEULA() {
        const config = this.getConfig();
        config.eulaAccepted = true;
        config.acceptedAt = new Date().toISOString();
        return this.saveConfig(config);
    }

    static isEULAAccepted() {
        return this.getConfig().eulaAccepted || false;
    }
}

let mainWindow;
let splashWindow;

function createSplashWindow() {
    // Создаем splash окно МГНОВЕННО
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        resizable: false,
        movable: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        show: true
    });

    splashWindow.loadFile(path.join(__dirname, '..', 'splash', 'splash.html'));
    splashWindow.center();
    splashWindow.setMenuBarVisibility(false);
}

function createMainWindow() {
    // Создаем основное окно, но не показываем
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, '..', 'icon.png')
    });

    // Загружаем соответствующую страницу
    const eulaAccepted = ConfigManager.isEULAAccepted();
    const startPage = eulaAccepted 
        ? path.join(__dirname, '..', 'app', 'index.html')
        : path.join(__dirname, '..', 'eula', 'eula.html');

    mainWindow.loadFile(startPage);

    // Когда основное окно готово - закрываем splash
    mainWindow.once('ready-to-show', () => {
        // Минимальное время показа splash - 2 секунды
        setTimeout(() => {
            if (splashWindow && !splashWindow.isDestroyed()) {
                splashWindow.close();
            }
            mainWindow.show();
            mainWindow.focus();
        }, 2000);
    });

    // На всякий случай - закрываем splash через 5 секунд
    setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
        }
        if (mainWindow && !mainWindow.isVisible()) {
            mainWindow.show();
        }
    }, 5000);
}

// Главная функция
app.whenReady().then(() => {
    // Сначала показываем splash
    createSplashWindow();
    
    // Затем создаем основное окно
    createMainWindow();
});

// IPC обработчики
ipcMain.handle('config-get-eula-status', () => {
    return ConfigManager.isEULAAccepted();
});

ipcMain.handle('config-accept-eula', () => {
    return ConfigManager.acceptEULA();
});

ipcMain.handle('config-get-path', () => {
    return CONFIG_PATH;
});

ipcMain.on('reload-to-editor', () => {
    if (mainWindow) {
        mainWindow.loadFile(path.join(__dirname, '..', 'app', 'index.html'));
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createSplashWindow();
        createMainWindow();
    }
});