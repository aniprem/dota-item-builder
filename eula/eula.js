const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    console.log('EULA страница загружена');
    
    const acceptBtn = document.getElementById('acceptBtn');
    const rejectBtn = document.getElementById('rejectBtn');

    acceptBtn.addEventListener('click', async function() {
        try {
            console.log('Пользователь принимает EULA...');
            
            // Показываем индикатор загрузки
            acceptBtn.disabled = true;
            acceptBtn.textContent = 'Сохранение...';
            
            // Сохраняем согласие через IPC
            const success = await ipcRenderer.invoke('config-accept-eula');
            
            if (success) {
                console.log('EULA успешно принята, переходим к редактору...');
                // Переходим к редактору
                ipcRenderer.send('reload-to-editor');
            } else {
                console.error('Ошибка при сохранении EULA');
                alert('Ошибка при сохранении соглашения. Попробуйте снова.');
                acceptBtn.disabled = false;
                acceptBtn.textContent = '✅ Я согласен';
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка: ' + error.message);
            acceptBtn.disabled = false;
            acceptBtn.textContent = '✅ Я согласен';
        }
    });

    rejectBtn.addEventListener('click', function() {
        console.log('Пользователь отказался от EULA');
        // Показываем экран отказа
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                color: white;
                text-align: center;
                padding: 40px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <div>
                    <h1 style="font-size: 3em; margin-bottom: 20px;">😕 Ну и ладно... Подумаешь.</h1>
                    <p style="font-size: 1.5em; margin-bottom: 30px;">Программа будет закрыта.</p>
                    <button onclick="window.close()" style="
                        background: white;
                        color: #e74c3c;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 1.2em;
                        cursor: pointer;
                        font-weight: bold;
                    ">Закрыть</button>
                </div>
            </div>
        `;
    });
});