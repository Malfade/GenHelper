// Code Editor Functionality
const editor = document.getElementById('codeEditor');
const preview = document.getElementById('livePreview');
const runButton = document.getElementById('runCode');
const resetButton = document.getElementById('resetCode');

// Initial render
preview.innerHTML = editor.value;

// Update preview on input or button click
function updatePreview() {
    try {
        preview.innerHTML = editor.value;
    } catch (e) {
        preview.innerHTML = `<div style="color: #ff5f56;">Ошибка: ${e.message}</div>`;
    }
}

editor.addEventListener('input', updatePreview);
runButton.addEventListener('click', updatePreview);
resetButton.addEventListener('click', () => {
    editor.value = '';
    preview.innerHTML = '';
});

// Tab support in editor
editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.fade-in');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Initial check
animateOnScroll();

// Check on scroll
window.addEventListener('scroll', animateOnScroll);

// Анимация появления элементов при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// Плавный скролл к секциям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Загрузка демо в iframe
const demoButtons = document.querySelectorAll('.demo-button');
const demoFrame = document.getElementById('demo-frame');

demoButtons.forEach(button => {
    button.addEventListener('click', () => {
        const demoType = button.dataset.demo;
        const demoPath = `demo-${demoType}.html`;
        
        // Показываем iframe
        demoFrame.style.display = 'block';
        
        // Загружаем демо
        demoFrame.src = demoPath;
        
        // Активируем кнопку
        demoButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Анимация прогресс-баров
const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progress = entry.target;
            const targetProgress = progress.dataset.progress;
            progress.style.width = targetProgress + '%';
            progress.classList.add('animate');
            progressObserver.unobserve(progress);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.progress-bar').forEach(bar => progressObserver.observe(bar));

// Анимация при наведении на модули
document.querySelectorAll('.module').forEach(module => {
    module.addEventListener('mouseenter', () => {
        module.style.transform = 'translateY(-5px)';
    });
    
    module.addEventListener('mouseleave', () => {
        module.style.transform = 'translateY(0)';
    });
});

// Анимация кнопок
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
});

// Функционал просмотрщика кода
document.addEventListener('DOMContentLoaded', () => {
    const codeViewer = document.getElementById('codeViewer');
    const closeViewer = document.querySelector('.close-viewer');
    const codeContent = codeViewer.querySelector('code');
    
    // Обработчики для кнопок просмотра кода
    document.querySelectorAll('.view-code').forEach(button => {
        button.addEventListener('click', async () => {
            const filePath = button.dataset.code;
            try {
                const response = await fetch(filePath);
                const code = await response.text();
                codeContent.textContent = code;
                codeViewer.classList.add('active');
                
                // Подсветка синтаксиса
                if (window.Prism) {
                    Prism.highlightElement(codeContent);
                }
            } catch (error) {
                console.error('Ошибка при загрузке кода:', error);
            }
        });
    });
    
    // Закрытие просмотрщика
    closeViewer.addEventListener('click', () => {
        codeViewer.classList.remove('active');
    });
    
    // Закрытие по клику вне просмотрщика
    codeViewer.addEventListener('click', (e) => {
        if (e.target === codeViewer) {
            codeViewer.classList.remove('active');
        }
    });
    
    // Обработчики для кнопок открытия демо
    document.querySelectorAll('.view-demo').forEach(button => {
        button.addEventListener('click', () => {
            const demoPath = button.dataset.demo;
            window.open(demoPath, '_blank');
        });
    });
});

// Функционал интерактивных практик
document.addEventListener('DOMContentLoaded', () => {
    // HTML практика
    const htmlPractice = document.querySelector('.practice-card:nth-child(1)');
    const htmlCode = htmlPractice.querySelector('.practice-code');
    const htmlPreview = htmlPractice.querySelector('.practice-preview');
    const htmlRunBtn = htmlPractice.querySelector('.run-practice');
    const htmlCheckBtn = htmlPractice.querySelector('.check-practice');
    const htmlResetBtn = htmlPractice.querySelector('.reset-practice');
    
    // CSS практика
    const cssPractice = document.querySelector('.practice-card:nth-child(2)');
    const cssCode = cssPractice.querySelector('.practice-code');
    const cssPreview = cssPractice.querySelector('.practice-preview');
    const cssPreviewElement = cssPractice.querySelector('.preview-element');
    const cssRunBtn = cssPractice.querySelector('.run-practice');
    const cssCheckBtn = cssPractice.querySelector('.check-practice');
    const cssResetBtn = cssPractice.querySelector('.reset-practice');
    
    // JavaScript практика
    const jsPractice = document.querySelector('.practice-card:nth-child(3)');
    const jsCode = jsPractice.querySelector('.practice-code');
    const jsConsole = jsPractice.querySelector('.console-output');
    const jsInput = jsPractice.querySelector('.console-command');
    const jsRunBtn = jsPractice.querySelector('.run-practice');
    const jsCheckBtn = jsPractice.querySelector('.check-practice');
    const jsResetBtn = jsPractice.querySelector('.reset-practice');
    
    // HTML практика - запуск
    htmlRunBtn.addEventListener('click', () => {
        try {
            htmlPreview.innerHTML = htmlCode.value;
        } catch (error) {
            htmlPreview.innerHTML = `<div style="color: #ff5f56;">Ошибка: ${error.message}</div>`;
        }
    });
    
    // HTML практика - проверка
    htmlCheckBtn.addEventListener('click', () => {
        // Здесь можно добавить логику проверки HTML кода
        alert('Функция проверки HTML кода будет добавлена в следующем обновлении');
    });
    
    // HTML практика - сброс
    htmlResetBtn.addEventListener('click', () => {
        htmlCode.value = '';
        htmlPreview.innerHTML = '';
    });
    
    // CSS практика - запуск
    cssRunBtn.addEventListener('click', () => {
        try {
            // Создаем стиль и применяем его к элементу
            const style = document.createElement('style');
            style.textContent = cssCode.value;
            document.head.appendChild(style);
            
            // Очищаем предыдущие стили
            cssPreviewElement.removeAttribute('style');
            cssPreviewElement.className = 'preview-element';
            
            // Применяем новые стили
            cssPreviewElement.setAttribute('style', cssCode.value);
            
            // Удаляем временный стиль
            document.head.removeChild(style);
        } catch (error) {
            cssPreview.innerHTML = `<div style="color: #ff5f56;">Ошибка: ${error.message}</div>`;
        }
    });
    
    // CSS практика - проверка
    cssCheckBtn.addEventListener('click', () => {
        // Здесь можно добавить логику проверки CSS кода
        alert('Функция проверки CSS кода будет добавлена в следующем обновлении');
    });
    
    // CSS практика - сброс
    cssResetBtn.addEventListener('click', () => {
        cssCode.value = '';
        cssPreviewElement.removeAttribute('style');
        cssPreviewElement.className = 'preview-element';
    });
    
    // JavaScript практика - запуск
    jsRunBtn.addEventListener('click', () => {
        try {
            // Очищаем консоль
            jsConsole.innerHTML = '';
            
            // Перехватываем console.log
            const originalConsoleLog = console.log;
            console.log = (...args) => {
                const output = args.map(arg => {
                    if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                    }
                    return arg;
                }).join(' ');
                
                jsConsole.innerHTML += `<div style="color: #64ffda;">${output}</div>`;
                originalConsoleLog.apply(console, args);
            };
            
            // Выполняем код
            eval(jsCode.value);
            
            // Восстанавливаем console.log
            console.log = originalConsoleLog;
        } catch (error) {
            jsConsole.innerHTML += `<div style="color: #ff5f56;">Ошибка: ${error.message}</div>`;
        }
    });
    
    // JavaScript практика - проверка
    jsCheckBtn.addEventListener('click', () => {
        // Здесь можно добавить логику проверки JavaScript кода
        alert('Функция проверки JavaScript кода будет добавлена в следующем обновлении');
    });
    
    // JavaScript практика - сброс
    jsResetBtn.addEventListener('click', () => {
        jsCode.value = '';
        jsConsole.innerHTML = '';
    });
    
    // JavaScript консоль - ввод команд
    jsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = jsInput.value;
            jsConsole.innerHTML += `<div style="color: #8892b0;">> ${command}</div>`;
            
            try {
                const result = eval(command);
                if (result !== undefined) {
                    jsConsole.innerHTML += `<div style="color: #64ffda;">${result}</div>`;
                }
            } catch (error) {
                jsConsole.innerHTML += `<div style="color: #ff5f56;">Ошибка: ${error.message}</div>`;
            }
            
            jsInput.value = '';
            jsConsole.scrollTop = jsConsole.scrollHeight;
        }
    });
});