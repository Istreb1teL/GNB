document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена - начата инициализация');

    // Инициализация всех компонентов с обработкой ошибок
    try {
        initTabs();
        initLoginModal();
        initSearch();
        initButtons();
        console.log('Все компоненты успешно инициализированы');
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
});

// ================== ФУНКЦИИ ИНИЦИАЛИЗАЦИИ ==================

function initTabs() {
    const tabsContainer = document.querySelector('.tabs-container');
    if (!tabsContainer) {
        console.error('Контейнер вкладок не найден');
        return;
    }

    const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
    const tabContents = tabsContainer.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаляем активные классы
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });

            // Активируем текущую
            this.classList.add('active');
            const tabId = this.dataset.tab;
            const activeTab = document.getElementById(`${tabId}-tab`);

            if (activeTab) {
                activeTab.classList.add('active');
                activeTab.style.display = 'block';
                console.log(`Активирована вкладка: ${tabId}`);
            } else {
                console.error(`Вкладка ${tabId}-tab не найдена`);
            }
        });
    });

    // Активируем первую вкладку
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
}
document.addEventListener('DOMContentLoaded', initTabs);

// Обработка всех форм загрузки
document.querySelectorAll('.upload-form').forEach(form => {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Загрузка...';

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success') {
                    alert(result.message);
                    window.location.reload();
                } else {
                    throw new Error(result.message || 'Ошибка сервера');
                }
            } else {
                throw new Error('Ошибка сети');
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            alert('Ошибка: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Загрузить';
        }
    });
});

// Обработка модального окна
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("loginModal");
    const loginBtn = document.getElementById("loginBtn");
    const closeBtn = document.querySelector(".close-modal");
    const registerBtn = document.getElementById("registerBtn");

    // Открытие модального окна
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            modal.style.display = "block";
        });
    }

    // Закрытие модального окна
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = "none";
        });
    }

    // Закрытие при клике вне окна
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Обработка кнопки регистрации
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            // Здесь можно добавить переход на страницу регистрации
            window.location.href = "{% url 'register' %}";
        });
    }

    // Обработка формы входа
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: new FormData(this),
                    headers: {
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                    }
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    alert('Ошибка входа. Проверьте данные.');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при входе');
            }
        });
    }
});

function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (!searchBtn || !searchInput) return;

    const handleSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            console.log('Выполнение поиска:', query);
            window.location.href = `/search/?q=${encodeURIComponent(query)}`;
        }
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

function initButtons() {
    // Кнопка профиля
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            console.log('Переход на страницу профиля');
            window.location.href = '/profil/';
        });
    }

    // Кнопка сохранения профиля (если есть на странице)
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveProfile);
    }
}

// ================== ОБРАБОТЧИКИ ==================

async function handleSaveProfile() {
    console.log('Клик по кнопке сохранения профиля');

    try {
        const imgElement = document.getElementById('profileChart');
        if (!imgElement?.src) {
            alert('Сначала сгенерируйте профиль!');
            return;
        }

        const address = prompt('Введите адрес объекта:');
        if (!address) return;

        const description = prompt('Введите описание:') || '';

        console.log('Начато сохранение профиля...');

        // Конвертация изображения
        const response = await fetch(imgElement.src);
        if (!response.ok) throw new Error('Ошибка загрузки изображения');

        const blob = await response.blob();
        const base64data = await convertBlobToBase64(blob);

        // Отправка данных
        const result = await saveProfileData(address, description, base64data);

        if (result?.status === 'success') {
            alert(`Профиль сохранен! ID: ${result.id}`);
            window.location.reload();
        } else {
            throw new Error(result?.message || 'Неизвестная ошибка сервера');
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка: ' + error.message);
    }
}

// ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================

function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function saveProfileData(address, description, imageData) {
    try {
        const response = await fetch('/save_profile/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                address: address,
                description: description,
                image_data: imageData
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка запроса:', error);
        throw error;
    }
}

function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

// ================== ЛОГИРОВАНИЕ ДЕЙСТВИЙ ==================

window.logAction = function(action, data = {}) {
    console.log(`[ACTION] ${action}`, data);
    try {
        fetch('/log_action/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                action: action,
                data: data,
                page: window.location.pathname,
                timestamp: new Date().toISOString()
            })
        }).catch(e => console.error('Ошибка логирования:', e));
    } catch (e) {
        console.error('Ошибка при отправке лога:', e);
    }
};
// Настройка пагинации
function setupPagination() {
    const paginationLinks = document.querySelectorAll('.pagination a');
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.getAttribute('href');
            if (url) {
                window.location.href = url;
            }
        });
    });
};

