// Глобальные переменные
let editor;
let terminal;
let minimap;
let selectedItem = null;
let settings = {
    theme: 'dracula',
    fontSize: 14,
    fontFamily: "'Fira Code', monospace",
    tabSize: 4,
    autocomplete: true,
    autoSave: true,
    autoSaveInterval: 30,
    terminal: {
        fontSize: 14,
        theme: 'dark'
    },
    minimap: {
        enabled: false
    },
    search: {
        caseSensitive: false,
        wholeWord: false,
        regex: false
    }
};

// Структура для хранения файлов
const fileSystem = {
    files: {
        'index.html': {
            type: 'html',
            content: `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Мой проект</title>
</head>
<body>
    <h1>Привет, мир!</h1>
</body>
</html>`
        },
        'styles.css': {
            type: 'css',
            content: `/* Стили */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
}`
        },
        'main.js': {
            type: 'js',
            content: `// JavaScript
console.log('Привет, мир!');`
        }
    },
    folders: {
        'src': {
            files: {},
            folders: {}
        }
    }
};

// Текущее состояние редактора
const state = {
    currentFile: 'index.html',
    openTabs: ['index.html'],
    activeTab: 'index.html',
    sidebarCollapsed: false,
    terminalVisible: false,
    settingsVisible: false
};

// Инициализация редактора
async function initEditor() {
    try {
        // Инициализация CodeMirror
        editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            mode: 'htmlmixed',
            theme: settings.theme,
            lineNumbers: true,
            lineWrapping: true,
            autoCloseTags: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: settings.tabSize,
            tabSize: settings.tabSize,
            fontSize: settings.fontSize,
            fontFamily: settings.fontFamily,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-S": saveFile,
                "Ctrl-/": "toggleComment",
                "Ctrl-F": "findPersistent",
                "Ctrl-H": "replace",
                "Ctrl-G": "findNext",
                "Shift-Ctrl-G": "findPrev",
                "Ctrl-J": "jumpToLine",
                "Ctrl-D": "selectNextOccurrence",
                "Alt-Space": "selectScope",
                "Ctrl-M": "toggleComment"
            },
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            hintOptions: {
                completeSingle: false,
                hint: CodeMirror.hint.anyword
            },
            matchBrackets: true,
            autoCloseBrackets: true,
            autoCloseTags: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            lineWrapping: true,
            scrollbarStyle: "native"
        });

        // Инициализация терминала
        initTerminal();

        // Открываем начальный файл
        openFile('index.html');
        updateFileTree();
        updateTabs();
        setupEventListeners();
        loadSettings();
        initGitStatus();
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showNotification('Ошибка при инициализации редактора', 'error');
    }
}

// Инициализация терминала
function initTerminal() {
    terminal = new Terminal({
        cursorBlink: true,
        theme: {
            background: '#1E1E1E',
            foreground: '#F8F9FA'
        }
    });
    terminal.open(document.getElementById('terminal'));
    terminal.write('$ ');
}

// Обработчики событий
function setupEventListeners() {
    // Существующие обработчики
    document.getElementById('saveBtn').addEventListener('click', saveFile);
    document.getElementById('runBtn').addEventListener('click', runCode);
    
    // Новые обработчики
    document.getElementById('settingsBtn').addEventListener('click', toggleSettings);
    document.getElementById('closeSettingsBtn').addEventListener('click', toggleSettings);
    document.getElementById('terminalBtn').addEventListener('click', toggleTerminal);
    document.querySelector('.search-input').addEventListener('input', handleSearch);
    
    // Обработчики настроек
    document.getElementById('themeSelect').addEventListener('change', handleThemeChange);
    document.getElementById('fontSize').addEventListener('change', handleFontSizeChange);
    document.getElementById('fontFamily').addEventListener('change', handleFontFamilyChange);
    document.getElementById('tabSize').addEventListener('change', handleTabSizeChange);
    document.getElementById('autocomplete').addEventListener('change', handleAutocompleteChange);
    document.getElementById('autoSave').addEventListener('change', handleAutoSaveChange);
    document.getElementById('autoSaveInterval').addEventListener('change', handleAutoSaveIntervalChange);
    document.getElementById('terminalFontSize').addEventListener('change', handleTerminalFontSizeChange);
    document.getElementById('terminalTheme').addEventListener('change', handleTerminalThemeChange);
    
    // Контекстное меню
    document.getElementById('fileTree').addEventListener('contextmenu', showContextMenu);
    document.addEventListener('click', hideContextMenu);
    
    // Git события
    document.addEventListener('keydown', handleGitShortcuts);
    
    // Автосохранение
    if (settings.autoSave) {
        setupAutoSave();
    }
    
    // Обработчики панели инструментов
    document.getElementById('formatBtn').addEventListener('click', formatCode);
    document.getElementById('minimapBtn').addEventListener('click', toggleMinimap);
    document.getElementById('problemsBtn').addEventListener('click', toggleProblems);
    document.getElementById('searchBtn').addEventListener('click', toggleSearch);
    document.getElementById('splitBtn').addEventListener('click', toggleSplit);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    document.getElementById('closeProblemsBtn').addEventListener('click', toggleProblems);
    
    // Обработчики поиска
    document.getElementById('searchInput').addEventListener('input', handleSearchInput);
    document.getElementById('replaceInput').addEventListener('input', handleReplaceInput);
    document.getElementById('caseSensitive').addEventListener('change', updateSearchSettings);
    document.getElementById('wholeWord').addEventListener('change', updateSearchSettings);
    document.getElementById('regex').addEventListener('change', updateSearchSettings);
    
    // Горячие клавиши для поиска
    document.addEventListener('keydown', handleSearchShortcuts);
    
    // Обработчики файловых операций
    document.getElementById('newFileBtn').addEventListener('click', showNewFileDialog);
    document.getElementById('newFolderBtn').addEventListener('click', showNewFolderDialog);
    document.getElementById('deleteBtn').addEventListener('click', showDeleteDialog);
    
    // Обработчики диалогов
    document.getElementById('closeNewFileDialog').addEventListener('click', hideNewFileDialog);
    document.getElementById('closeNewFolderDialog').addEventListener('click', hideNewFolderDialog);
    document.getElementById('closeDeleteDialog').addEventListener('click', hideDeleteDialog);
    
    document.getElementById('createFileBtn').addEventListener('click', createNewFile);
    document.getElementById('createFolderBtn').addEventListener('click', createNewFolder);
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteSelectedItem);
    
    document.getElementById('cancelNewFileBtn').addEventListener('click', hideNewFileDialog);
    document.getElementById('cancelNewFolderBtn').addEventListener('click', hideNewFolderDialog);
    document.getElementById('cancelDeleteBtn').addEventListener('click', hideDeleteDialog);

    // Form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            // Validate form
            if (!validateForm(data)) {
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'Отправка...';
                submitBtn.disabled = true;
                
                // Here you would typically send the data to your backend
                // For now, we'll simulate an API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message
                showNotification('Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
                contactForm.reset();
                
            } catch (error) {
                showNotification('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.', 'error');
            } finally {
                // Reset button state
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Автосохранение
function setupAutoSave() {
    setInterval(() => {
        if (settings.autoSave && editor) {
            saveFile();
        }
    }, settings.autoSaveInterval * 1000);
}

// Обработка поиска
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const fileTree = document.getElementById('fileTree');
    const items = fileTree.getElementsByClassName('file-item');
    
    Array.from(items).forEach(item => {
        const fileName = item.textContent.toLowerCase();
        item.style.display = fileName.includes(searchTerm) ? 'flex' : 'none';
    });
}

// Управление настройками
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    state.settingsVisible = !state.settingsVisible;
    panel.classList.toggle('visible', state.settingsVisible);
}

function loadSettings() {
    const savedSettings = localStorage.getItem('editorSettings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
        applySettings();
    }
}

function saveSettings() {
    localStorage.setItem('editorSettings', JSON.stringify(settings));
}

function applySettings() {
    editor.setOption('theme', settings.theme);
    editor.setOption('fontSize', settings.fontSize);
    editor.setOption('fontFamily', settings.fontFamily);
    editor.setOption('tabSize', settings.tabSize);
    editor.setOption('extraKeys', {
        ...editor.getOption('extraKeys'),
        "Ctrl-Space": settings.autocomplete ? "autocomplete" : null
    });
}

// Обработчики изменений настроек
function handleThemeChange(event) {
    settings.theme = event.target.value;
    applySettings();
    saveSettings();
}

function handleFontSizeChange(event) {
    settings.fontSize = parseInt(event.target.value);
    applySettings();
    saveSettings();
}

function handleFontFamilyChange(event) {
    settings.fontFamily = event.target.value;
    applySettings();
    saveSettings();
}

function handleTabSizeChange(event) {
    settings.tabSize = parseInt(event.target.value);
    applySettings();
    saveSettings();
}

function handleAutocompleteChange(event) {
    settings.autocomplete = event.target.checked;
    applySettings();
    saveSettings();
}

function handleAutoSaveChange(event) {
    settings.autoSave = event.target.checked;
    if (settings.autoSave) {
        setupAutoSave();
    }
    saveSettings();
}

function handleAutoSaveIntervalChange(event) {
    settings.autoSaveInterval = parseInt(event.target.value);
    if (settings.autoSave) {
        setupAutoSave();
    }
    saveSettings();
}

function handleTerminalFontSizeChange(event) {
    settings.terminal.fontSize = parseInt(event.target.value);
    if (terminal) {
        terminal.setOption('fontSize', settings.terminal.fontSize);
    }
    saveSettings();
}

function handleTerminalThemeChange(event) {
    settings.terminal.theme = event.target.value;
    if (terminal) {
        updateTerminalTheme();
    }
    saveSettings();
}

// Обновление темы терминала
function updateTerminalTheme() {
    const themes = {
        dark: {
            background: '#1E1E1E',
            foreground: '#F8F9FA'
        },
        light: {
            background: '#F8F9FA',
            foreground: '#1E1E1E'
        },
        contrast: {
            background: '#000000',
            foreground: '#FFFFFF'
        }
    };
    
    terminal.setOption('theme', themes[settings.terminal.theme]);
}

// Управление терминалом
function toggleTerminal() {
    const container = document.getElementById('terminalContainer');
    state.terminalVisible = !state.terminalVisible;
    container.classList.toggle('visible', state.terminalVisible);
}

// Git функционал
function initGitStatus() {
    // Здесь можно добавить реальную интеграцию с Git
    updateGitStatus();
}

function updateGitStatus() {
    const branchElement = document.getElementById('gitBranch');
    const statusElement = document.getElementById('gitStatus');
    
    // Имитация Git статуса
    branchElement.textContent = 'main';
    statusElement.textContent = 'Все изменения сохранены';
}

function handleGitShortcuts(event) {
    if (event.ctrlKey && event.key === 'g') {
        // Имитация Git команды
        showNotification('Git: Открытие репозитория', 'info');
    }
}

// Контекстное меню
function showContextMenu(event) {
    event.preventDefault();
    const menu = document.getElementById('contextMenu');
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    menu.classList.add('visible');
}

function hideContextMenu() {
    const menu = document.getElementById('contextMenu');
    menu.classList.remove('visible');
}

// Функция для отображения уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Add styles for notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '0.5rem';
    notification.style.color = '#fff';
    notification.style.zIndex = '1000';
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Функции управления файлами
function openFile(fileName) {
    const file = fileSystem.files[fileName];
    if (file) {
        editor.setValue(file.content);
        editor.setOption('mode', getFileMode(file.type));
        state.currentFile = fileName;
        state.activeTab = fileName;
        if (!state.openTabs.includes(fileName)) {
            state.openTabs.push(fileName);
        }
        updateTabs();
        updateFileTree();
    }
}

function saveFile() {
    const currentFile = state.currentFile;
    if (currentFile && fileSystem.files[currentFile]) {
        fileSystem.files[currentFile].content = editor.getValue();
        showNotification('Файл сохранен');
    }
}

function runCode() {
    const content = editor.getValue();
    const file = fileSystem.files[state.currentFile];
    
    if (file.type === 'html') {
        const win = window.open('', '_blank');
        win.document.write(content);
        win.document.close();
    } else if (file.type === 'js') {
        try {
            eval(content);
        } catch (error) {
            console.error('Ошибка выполнения:', error);
        }
    }
}

// Вспомогательные функции
function getFileMode(type) {
    const modes = {
        'html': 'htmlmixed',
        'css': 'css',
        'js': 'javascript'
    };
    return modes[type] || 'text';
}

function updateFileTree() {
    const fileTree = document.getElementById('fileTree');
    fileTree.innerHTML = '';
    
    // Отображение файлов
    Object.entries(fileSystem.files).forEach(([fileName, file]) => {
        const item = document.createElement('div');
        item.className = `file-item ${state.currentFile === fileName ? 'active' : ''}`;
        item.innerHTML = `<i class="fas fa-file-code"></i> ${fileName}`;
        item.addEventListener('click', () => {
            selectedItem = fileName;
            openFile(fileName);
        });
        fileTree.appendChild(item);
    });
    
    // Отображение папок
    Object.entries(fileSystem.folders).forEach(([folderName, folder]) => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.innerHTML = `
            <i class="fas fa-folder"></i>
            <span>${folderName}</span>
            <i class="fas fa-chevron-right folder-toggle"></i>
        `;
        
        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content';
        folderContent.style.display = 'none';
        
        // Рекурсивное отображение содержимого папки
        Object.entries(folder.files).forEach(([fileName, file]) => {
            const fileItem = document.createElement('div');
            fileItem.className = `file-item ${state.currentFile === fileName ? 'active' : ''}`;
            fileItem.innerHTML = `<i class="fas fa-file-code"></i> ${fileName}`;
            fileItem.addEventListener('click', () => {
                selectedItem = fileName;
                openFile(fileName);
            });
            folderContent.appendChild(fileItem);
        });
        
        folderItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('folder-toggle')) {
                const isOpen = folderContent.style.display === 'block';
                folderContent.style.display = isOpen ? 'none' : 'block';
                folderItem.querySelector('.folder-toggle').style.transform = 
                    isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
            }
        });
        
        fileTree.appendChild(folderItem);
        fileTree.appendChild(folderContent);
    });
}

function updateTabs() {
    const tabsContainer = document.getElementById('tabsContainer');
    tabsContainer.innerHTML = '';
    
    state.openTabs.forEach(fileName => {
        const tab = document.createElement('div');
        tab.className = `tab ${state.activeTab === fileName ? 'active' : ''}`;
        tab.innerHTML = `
            <i class="fas fa-file-code"></i>
            <span>${fileName}</span>
            <span class="tab-close">&times;</span>
        `;
        tab.addEventListener('click', () => openFile(fileName));
        tabsContainer.appendChild(tab);
    });
}

// Форматирование кода
function formatCode() {
    const mode = editor.getModeAt(editor.getCursor());
    const content = editor.getValue();
    let formatted = content;
    
    try {
        if (mode.name === 'javascript') {
            // Используем prettier для JavaScript
            formatted = prettier.format(content, {
                parser: 'babel',
                plugins: [prettierPlugins.babel],
                semi: true,
                singleQuote: true
            });
        } else if (mode.name === 'htmlmixed') {
            // Форматирование HTML
            formatted = formatHTML(content);
        } else if (mode.name === 'css') {
            // Форматирование CSS
            formatted = formatCSS(content);
        }
        
        editor.setValue(formatted);
        showNotification('Код отформатирован', 'success');
    } catch (error) {
        console.error('Ошибка форматирования:', error);
        showNotification('Ошибка форматирования кода', 'error');
    }
}

// Мини-карта кода
function toggleMinimap() {
    const minimapBtn = document.getElementById('minimapBtn');
    const minimapElement = document.getElementById('minimap');
    
    settings.minimap.enabled = !settings.minimap.enabled;
    minimapBtn.classList.toggle('active', settings.minimap.enabled);
    minimapElement.style.display = settings.minimap.enabled ? 'block' : 'none';
    
    if (settings.minimap.enabled) {
        initMinimap();
    }
}

function initMinimap() {
    if (!minimap) {
        minimap = CodeMirror(document.getElementById('minimap'), {
            value: editor.getValue(),
            mode: editor.getMode(),
            theme: editor.getTheme(),
            lineNumbers: false,
            readOnly: true,
            scrollbarStyle: 'null',
            lineWrapping: true,
            viewportMargin: Infinity
        });
        
        // Синхронизация скролла
        editor.on('scroll', () => {
            const scrollPercent = editor.getScrollInfo().top / (editor.getScrollInfo().height - editor.getScrollInfo().clientHeight);
            minimap.scrollTo(null, scrollPercent * (minimap.getScrollInfo().height - minimap.getScrollInfo().clientHeight));
        });
        
        // Синхронизация содержимого
        editor.on('change', () => {
            minimap.setValue(editor.getValue());
        });
    }
}

// Панель проблем
function toggleProblems() {
    const problemsPanel = document.getElementById('problemsPanel');
    problemsPanel.classList.toggle('visible');
    
    if (problemsPanel.classList.contains('visible')) {
        checkProblems();
    }
}

function checkProblems() {
    const problemsList = document.getElementById('problemsList');
    problemsList.innerHTML = '';
    
    // Проверка синтаксиса
    const mode = editor.getModeAt(editor.getCursor());
    const content = editor.getValue();
    
    try {
        if (mode.name === 'javascript') {
            // Проверка JavaScript
            const ast = parser.parse(content);
            traverse(ast, {
                // Добавить проверки
            });
        }
        
        // Добавить проблемы в список
        addProblem('Ошибка синтаксиса', 'error', 10);
        addProblem('Неиспользуемая переменная', 'warning', 15);
    } catch (error) {
        console.error('Ошибка проверки:', error);
        addProblem(error.message, 'error', 1);
    }
}

function addProblem(message, type, line) {
    const problemsList = document.getElementById('problemsList');
    const problem = document.createElement('div');
    problem.className = `problem-item ${type}`;
    problem.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'times-circle' : 'exclamation-circle'}"></i>
        <span>Строка ${line}: ${message}</span>
    `;
    problem.addEventListener('click', () => {
        editor.setCursor(line - 1);
        editor.focus();
    });
    problemsList.appendChild(problem);
}

// Поиск и замена
function toggleSearch() {
    const searchPanel = document.getElementById('searchPanel');
    searchPanel.classList.toggle('visible');
    
    if (searchPanel.classList.contains('visible')) {
        document.getElementById('searchInput').focus();
    }
}

function handleSearchInput(event) {
    const searchTerm = event.target.value;
    if (searchTerm) {
        findMatches(searchTerm);
    }
}

function handleReplaceInput(event) {
    const replaceTerm = event.target.value;
    // Обновить предпросмотр замены
}

function updateSearchSettings() {
    settings.search.caseSensitive = document.getElementById('caseSensitive').checked;
    settings.search.wholeWord = document.getElementById('wholeWord').checked;
    settings.search.regex = document.getElementById('regex').checked;
    
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        findMatches(searchTerm);
    }
}

function findMatches(searchTerm) {
    const content = editor.getValue();
    const matches = [];
    
    if (settings.search.regex) {
        try {
            const regex = new RegExp(searchTerm, settings.search.caseSensitive ? 'g' : 'gi');
            let match;
            while ((match = regex.exec(content)) !== null) {
                matches.push({
                    from: editor.posFromIndex(match.index),
                    to: editor.posFromIndex(match.index + match[0].length)
                });
            }
        } catch (error) {
            showNotification('Неверное регулярное выражение', 'error');
            return;
        }
    } else {
        const searchRegex = new RegExp(
            settings.search.wholeWord ? `\\b${searchTerm}\\b` : searchTerm,
            settings.search.caseSensitive ? 'g' : 'gi'
        );
        let match;
        while ((match = searchRegex.exec(content)) !== null) {
            matches.push({
                from: editor.posFromIndex(match.index),
                to: editor.posFromIndex(match.index + match[0].length)
            });
        }
    }
    
    // Подсветка совпадений
    editor.getAllMarks().forEach(mark => mark.clear());
    matches.forEach(match => {
        editor.markText(match.from, match.to, {
            className: 'search-match'
        });
    });
}

function handleSearchShortcuts(event) {
    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        toggleSearch();
    } else if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        toggleSearch();
        document.getElementById('replaceInput').focus();
    }
}

// Разделение экрана
function toggleSplit() {
    // Реализация разделения экрана
    showNotification('Функция разделения экрана в разработке', 'info');
}

// Полный экран
function toggleFullscreen() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// Диалоги создания файла
function showNewFileDialog() {
    const dialog = document.getElementById('newFileDialog');
    dialog.classList.add('visible');
    document.getElementById('newFileName').focus();
}

function hideNewFileDialog() {
    const dialog = document.getElementById('newFileDialog');
    dialog.classList.remove('visible');
    document.getElementById('newFileName').value = '';
    document.getElementById('newFilePath').value = '';
}

function createNewFile() {
    const fileName = document.getElementById('newFileName').value.trim();
    const fileType = document.getElementById('newFileType').value;
    const filePath = document.getElementById('newFilePath').value.trim();
    
    if (!fileName) {
        showNotification('Введите имя файла', 'error');
        return;
    }
    
    const fullPath = filePath ? `${filePath}/${fileName}` : fileName;
    
    if (fileSystem.files[fullPath]) {
        showNotification('Файл уже существует', 'error');
        return;
    }
    
    // Создаем новый файл
    fileSystem.files[fullPath] = {
        type: fileType,
        content: getDefaultContent(fileType)
    };
    
    hideNewFileDialog();
    updateFileTree();
    showNotification('Файл создан', 'success');
}

// Диалоги создания папки
function showNewFolderDialog() {
    const dialog = document.getElementById('newFolderDialog');
    dialog.classList.add('visible');
    document.getElementById('newFolderName').focus();
}

function hideNewFolderDialog() {
    const dialog = document.getElementById('newFolderDialog');
    dialog.classList.remove('visible');
    document.getElementById('newFolderName').value = '';
    document.getElementById('newFolderPath').value = '';
}

function createNewFolder() {
    const folderName = document.getElementById('newFolderName').value.trim();
    const folderPath = document.getElementById('newFolderPath').value.trim();
    
    if (!folderName) {
        showNotification('Введите имя папки', 'error');
        return;
    }
    
    const fullPath = folderPath ? `${folderPath}/${folderName}` : folderName;
    
    if (fileSystem.folders[fullPath]) {
        showNotification('Папка уже существует', 'error');
        return;
    }
    
    // Создаем новую папку
    fileSystem.folders[fullPath] = {
        files: {},
        folders: {}
    };
    
    hideNewFolderDialog();
    updateFileTree();
    showNotification('Папка создана', 'success');
}

// Диалоги удаления
function showDeleteDialog() {
    if (!selectedItem) {
        showNotification('Выберите файл или папку для удаления', 'error');
        return;
    }
    
    const dialog = document.getElementById('deleteDialog');
    document.getElementById('deleteItemName').textContent = selectedItem;
    dialog.classList.add('visible');
}

function hideDeleteDialog() {
    const dialog = document.getElementById('deleteDialog');
    dialog.classList.remove('visible');
}

function deleteSelectedItem() {
    if (!selectedItem) return;
    
    const isFile = fileSystem.files[selectedItem];
    const isFolder = fileSystem.folders[selectedItem];
    
    if (isFile) {
        delete fileSystem.files[selectedItem];
    } else if (isFolder) {
        delete fileSystem.folders[selectedItem];
    }
    
    selectedItem = null;
    hideDeleteDialog();
    updateFileTree();
    showNotification('Элемент удален', 'success');
}

// Вспомогательные функции
function getDefaultContent(type) {
    const defaults = {
        js: '// JavaScript\nconsole.log("Hello, World!");',
        html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>New Page</title>\n</head>\n<body>\n    \n</body>\n</html>',
        css: '/* Styles */\nbody {\n    \n}',
        json: '{\n    \n}',
        md: '# New Document\n\n'
    };
    return defaults[type] || '';
}

// Анимация появления элементов при скролле
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('visible');
        }
    });
};

// Добавляем обработчик скролла
window.addEventListener('scroll', animateOnScroll);
// Запускаем первую проверку при загрузке страницы
animateOnScroll();

// Добавляем стили для уведомлений
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        background: var(--card-bg);
        color: var(--text);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .notification.success {
        border-left: 4px solid #4CAF50;
    }
    
    .notification.error {
        border-left: 4px solid #f44336;
    }
    
    .notification.info {
        border-left: 4px solid #2196F3;
    }
    
    .animate {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    
    .animate.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .animate.delay-1 { transition-delay: 0.2s; }
    .animate.delay-2 { transition-delay: 0.4s; }
    .animate.delay-3 { transition-delay: 0.6s; }
    .animate.delay-4 { transition-delay: 0.8s; }
    .animate.delay-5 { transition-delay: 1s; }
`;

document.head.appendChild(style);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initEditor);

function validateForm(data) {
    // Basic validation
    if (!data.name || data.name.trim().length < 2) {
        showNotification('Пожалуйста, введите корректное имя', 'error');
        return false;
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        showNotification('Пожалуйста, введите корректный email', 'error');
        return false;
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        showNotification('Пожалуйста, введите корректный номер телефона', 'error');
        return false;
    }
    
    if (!data.city) {
        showNotification('Пожалуйста, укажите город', 'error');
        return false;
    }
    
    if (!data.program) {
        showNotification('Пожалуйста, выберите программу обучения', 'error');
        return false;
    }
    
    if (!data.experience) {
        showNotification('Пожалуйста, укажите ваш опыт в программировании', 'error');
        return false;
    }
    
    if (!data.goals) {
        showNotification('Пожалуйста, укажите цели обучения', 'error');
        return false;
    }
    
    if (!data.agreement) {
        showNotification('Необходимо согласиться с обработкой персональных данных', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhone(phone) {
    const re = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return re.test(phone);
} 