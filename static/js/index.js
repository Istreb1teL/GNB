document.getElementById('saveBtn').addEventListener('click', async function() {
    const imgElement = document.getElementById('profileChart');
    if (!imgElement.src || imgElement.src.startsWith('data:')) {
        alert('Сначала сгенерируйте профиль!');
        return;
    }

    // Получаем данные от пользователя
    const address = prompt('Введите адрес объекта:');
    if (!address) return;

    const description = prompt('Введите описание профиля (необязательно):') || '';

    try {
        // Конвертируем изображение в base64
        const response = await fetch(imgElement.src);
        const blob = await response.blob();
        const base64data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });

        // Отправляем данные на сервер
        const saveResponse = await fetch('/save_profile/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': '{{ csrf_token }}'
            },
            body: JSON.stringify({
                address: address,
                description: description,
                image_data: base64data
            })
        });

        const result = await saveResponse.json();

        if (result.status === 'success') {
            alert(`Профиль сохранен!\nАдрес: ${address}\nДата: ${result.created_at}`);
            // Обновляем страницу, чтобы показать новый профиль
            location.reload();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка сохранения: ' + error.message);
    }
});