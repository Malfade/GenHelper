// Функция для плавной прокрутки к секциям
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const headerOffset = 80; // Фиксированное значение для фиксированной навигации
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Функция для добавления анимации при прокрутке
const sections = document.querySelectorAll('section');
const observerOptions = {
    threshold: 0.1,
    rootMargin: '-100px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Функция для подсветки активного раздела в навигации
function highlightCurrentSection() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const id = section.getAttribute('id');
        
        if (rect.top <= 150 && rect.bottom >= 150) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightCurrentSection);

// Добавление стилей для активного пункта меню
const style = document.createElement('style');
style.textContent = `
    nav a.active {
        color: #3498db;
        font-weight: bold;
    }
`;
document.head.appendChild(style);

// Interactive Console
const consoleOutput = document.getElementById('consoleOutput');
const consoleInput = document.getElementById('consoleInput');
const consoleSubmit = document.querySelector('.console-submit');

const commands = {
    'help': 'Доступные команды: help, clear, echo, test',
    'clear': () => {
        consoleOutput.innerHTML = '';
        return 'Консоль очищена';
    },
    'echo': (args) => args.join(' '),
    'test': () => 'Тестовая команда выполнена успешно'
};

function executeCommand(input) {
    const [command, ...args] = input.trim().split(' ');
    
    if (commands[command]) {
        if (typeof commands[command] === 'function') {
            return commands[command](args);
        }
        return commands[command];
    }
    
    return `Команда "${command}" не найдена. Введите "help" для списка команд.`;
}

function appendToConsole(text, type = 'output') {
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = text;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

consoleSubmit.addEventListener('click', () => {
    const input = consoleInput.value;
    if (input.trim()) {
        appendToConsole(`> ${input}`, 'input');
        const result = executeCommand(input);
        appendToConsole(result);
        consoleInput.value = '';
    }
});

consoleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        consoleSubmit.click();
    }
});

// Initialize console with welcome message
appendToConsole('Добро пожаловать в интерактивную консоль! Введите "help" для списка команд.', 'info');

// Code Editor Functionality
const codeEditor = document.getElementById('code-editor');
const languageSelect = document.getElementById('language-select');
const runButton = document.querySelector('.run-code');
const resetButton = document.querySelector('.reset-code');
const outputContent = document.querySelector('.output-content');
const lineNumbers = document.querySelector('.line-numbers');

// Initialize code editor with default language
function initializeEditor() {
    const defaultCode = {
        javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");',
        python: '# Write your Python code here\nprint("Hello, World!")',
        java: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
    };
    
    codeEditor.value = defaultCode[languageSelect.value];
    updateLineNumbers();
}

// Update line numbers
function updateLineNumbers() {
    const lines = codeEditor.value.split('\n');
    lineNumbers.innerHTML = lines.map((_, i) => i + 1).join('<br>');
}

// Run code
function runCode() {
    const code = codeEditor.value;
    const language = languageSelect.value;
    
    try {
        let result;
        switch(language) {
            case 'javascript':
                result = eval(code);
                break;
            case 'python':
                result = 'Python execution is not supported in this demo';
                break;
            case 'java':
                result = 'Java execution is not supported in this demo';
                break;
        }
        outputContent.textContent = result !== undefined ? result : 'Code executed successfully';
    } catch (error) {
        outputContent.textContent = `Error: ${error.message}`;
    }
}

// Event Listeners
codeEditor.addEventListener('input', updateLineNumbers);
languageSelect.addEventListener('change', initializeEditor);
runButton.addEventListener('click', runCode);
resetButton.addEventListener('click', initializeEditor);

// Initialize editor on page load
initializeEditor();

// Learning Path Animation
const pathItems = document.querySelectorAll('.path-item');
const pathConnector = document.querySelector('.path-connector');

function animatePath() {
    pathItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 300);
    });
}

// Intersection Observer for Learning Path
const pathObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animatePath();
            pathObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

pathObserver.observe(document.querySelector('.learning-path')); 