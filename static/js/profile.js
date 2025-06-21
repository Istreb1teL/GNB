document.getElementById('generateBtn').addEventListener('click', function() {
    // Собираем данные формы
    const profileData = {
        title: document.getElementById('profileTitle').value,
        ground_lengths: document.getElementById('groundLengths').value,
        ground_heights: document.getElementById('groundHeights').value,
        pipes: [],
        pits: [],
        communications: []
    };

    // Заполняем трубы (если есть)
    document.querySelectorAll('.pipe-group').forEach(pipeGroup => {
        profileData.pipes.push({
            name: pipeGroup.querySelector('.pipeName').value,
            lengths: pipeGroup.querySelector('.pipeLengths').value,
            heights: pipeGroup.querySelector('.pipeHeights').value
        });
    });

    // Шаг 1: Выводим данные в консоль перед отправкой
    console.log("Данные для отправки на сервер:", profileData);

    // Отправляем запрос
    fetch('/generate_profile_image/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': '{{ csrf_token }}'
        },
        body: JSON.stringify(profileData)
    })
    .then(response => response.blob())
    .then(blob => {
        const imgUrl = URL.createObjectURL(blob);
        const imgElement = document.getElementById('profileChart');
        imgElement.src = imgUrl;
        //document.getElementById('profileChart').src = imgUrl;
        document.getElementById('resultContainer').style.display = 'block';
    })
    .catch(error => {
        console.error("Ошибка при генерации профиля:", error);
        alert("Ошибка: " + error.message);
    });
});
// сохранить профиль
document.getElementById('saveBtn').addEventListener('click', function() {
    const imgElement = document.getElementById('profileChart');
    if (!imgElement.src) {
        alert('Сначала сгенерируйте профиль!');
        return;
    }

    // Получаем адрес и описание
    const address = prompt('Введите адрес:');
    if (!address) return;

    const description = prompt('Введите описание:') || '';

    // Конвертируем изображение в base64
    fetch(imgElement.src)
        .then(res => res.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = function() {
                const base64data = reader.result;

                // Отправляем данные на сервер
                const formData = new FormData();
                formData.append('address', address);
                formData.append('description', description);
                formData.append('image_data', base64data);

                fetch('/save_profile/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': '{{ csrf_token }}'
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert('Профиль сохранен! ID: ' + data.id);
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Ошибка сохранения: ' + error.message);
                });
            }
            reader.readAsDataURL(blob);
        });
});
// Функция для кнопки "Сохранить профиль"
document.getElementById('saveBtn').addEventListener('click', async function() {
    console.log('Начато сохранение профиля...');

    try {
        const imgElement = document.getElementById('profileChart');
        if (!imgElement?.src) {
            alert('Сначала сгенерируйте профиль!');
            return;
        }

        const address = prompt('Введите адрес объекта:');
        if (!address) return;

        const description = prompt('Введите описание профиля (необязательно):') || '';

        // Конвертация изображения
        const response = await fetch(imgElement.src);
        if (!response.ok) throw new Error('Ошибка загрузки изображения');
        const blob = await response.blob();

        const base64data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });

        // Отправка данных
        const saveResponse = await fetch('/save_profile/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
            },
            body: JSON.stringify({
                address: address,
                description: description,
                image_data: base64data
            })
        });

        const result = await saveResponse.json();
        console.log('Результат сохранения:', result);

        if (result.status === 'success') {
            alert(`Профиль успешно сохранен! ID: ${result.id}`);
            window.location.href = '/'; // Переход на главную
        } else {
            throw new Error(result.message || 'Ошибка сохранения');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сохранения: ' + error.message);
    }
});

    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            console.log('Save button clicked'); // Для отладки
            // ... остальной код
        });
    } else {
        console.error('Save button not found! Check HTML');
    }
});
