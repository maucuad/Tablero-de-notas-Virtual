// Capturamos los elementos del DOM de forma segura
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const noteInput = document.getElementById('note-input');
    const noteDetails = document.getElementById('note-details');
    const noteOptions = document.getElementById('note-options');
    const subcategoryWrapper = document.getElementById('subcategory-wrapper');
    const noteSubcategory = document.getElementById('note-subcategory');
    const notePriority = document.getElementById('note-priority');
    const noteDueDate = document.getElementById('note-due-date');
    const noteColorInput = document.getElementById('note-color');
    const noteImageInput = document.getElementById('note-image');
    const noteTagsInput = document.getElementById('note-tags');
    const addBtn = document.getElementById('add-btn');
    const fabBtn = document.getElementById('fab-btn');
    const closeBtn = document.getElementById('close-btn');
    const formContainer = document.getElementById('form-container');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const searchInput = document.getElementById('search-input');

    // Elementos de Tableros Múltiples
    const boardSelect = document.getElementById('board-select');
    const newBoardBtn = document.getElementById('new-board-btn');

    // Elementos de Backup, Papelera y Calendario
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const trashBinBtn = document.getElementById('trash-bin-btn');
    const trashModal = document.getElementById('trash-modal');
    const closeTrashBtn = document.getElementById('close-trash-btn');
    const emptyTrashBtn = document.getElementById('empty-trash-btn');
    const trashListContainer = document.getElementById('trash-list-container');

    // Elementos del Visor de Imágenes con Galería
    const imageViewModal = document.getElementById('image-viewer-modal');
    const fullSizeImage = document.getElementById('full-size-image');
    const closeImageViewer = document.getElementById('close-image-viewer');
    const prevImageBtn = document.getElementById('prev-image-btn');
    const nextImageBtn = document.getElementById('next-image-btn');
    const imageCounter = document.getElementById('image-counter');

    let activeGalleryImages = [];
    let activeImageIndex = 0;

    const viewToggleBtn = document.getElementById('view-toggle-btn');
    const boardMain = document.getElementById('board');
    const calendarView = document.getElementById('calendar-view');
    const calendarGrid = document.getElementById('calendar-grid');
    const calendarMonthTitle = document.getElementById('calendar-month-title');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    let editingNoteState = null;
    let currentCalendarDate = new Date();
    let isCalendarViewActive = false;

    // Diccionario de colores base por categoría
    const colors = {
        proyecto: '#bbdefb',  // Azul
        idea: '#fff9c4',      // Amarillo
        tarea: '#c8e6c9',     // Verde
        contenido: '#ffe0b2', // Naranja
        otro: '#f8bbd0'       // Rosa
    };

    // 1. Inicializamos tableros y notas
    initBoardsSystem();

    const savedTheme = localStorage.getItem('my_board_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
    }

    // --- SISTEMA DE MÚLTIPLES TABLEROS ---
    function getAllBoards() {
        const boardsString = localStorage.getItem('my_corkboard_all_boards');
        if (boardsString) {
            try {
                return JSON.parse(boardsString);
            } catch (e) {
                console.error("Error al leer tableros", e);
            }
        }
        const defaultBoards = [
            { id: 'board_default', name: 'Tablero Principal', notes: [] }
        ];
        localStorage.setItem('my_corkboard_all_boards', JSON.stringify(defaultBoards));
        localStorage.setItem('my_corkboard_active_id', 'board_default');
        return defaultBoards;
    }

    function getActiveBoardId() {
        let activeId = localStorage.getItem('my_corkboard_active_id');
        if (!activeId) {
            activeId = 'board_default';
            localStorage.setItem('my_corkboard_active_id', activeId);
        }
        return activeId;
    }

    function setActiveBoardId(id) {
        localStorage.setItem('my_corkboard_active_id', id);
    }

    function initBoardsSystem() {
        renderBoardSelector();
        loadActiveBoardNotes();
    }

    function renderBoardSelector() {
        if (!boardSelect) return;
        const boards = getAllBoards();
        const activeId = getActiveBoardId();

        boardSelect.innerHTML = '';
        boards.forEach(board => {
            const option = document.createElement('option');
            option.value = board.id;
            option.textContent = board.name;
            if (board.id === activeId) {
                option.selected = true;
            }
            boardSelect.appendChild(option);
        });
    }

    if (boardSelect) {
        boardSelect.addEventListener('change', (e) => {
            setActiveBoardId(e.target.value);
            loadActiveBoardNotes();
        });
    }

    if (newBoardBtn) {
        newBoardBtn.addEventListener('click', () => {
            const boardName = prompt('Ingresa el nombre para el nuevo tablero:');
            if (!boardName || boardName.trim() === '') return;

            const newId = 'board_' + Date.now();
            const boards = getAllBoards();
            boards.push({ id: newId, name: boardName.trim(), notes: [] });
            
            localStorage.setItem('my_corkboard_all_boards', JSON.stringify(boards));
            setActiveBoardId(newId);
            
            renderBoardSelector();
            loadActiveBoardNotes();
        });
    }

    function loadActiveBoardNotes() {
        ['proyecto', 'idea', 'tarea', 'contenido', 'otro'].forEach(cat => {
            const container = document.getElementById(`container-${cat}`);
            if (container) container.innerHTML = '';
        });

        const boards = getAllBoards();
        const activeId = getActiveBoardId();
        const currentBoard = boards.find(b => b.id === activeId) || boards[0];

        if (currentBoard && currentBoard.notes) {
            currentBoard.notes.forEach(noteData => {
                createNoteElement(
                    noteData.text, 
                    noteData.details, 
                    noteData.tags, 
                    noteData.category, 
                    noteData.subcategory, 
                    noteData.completed,
                    noteData.priority,
                    noteData.dueDate,
                    noteData.customColor,
                    noteData.images
                );
            });
        }

        if (isCalendarViewActive) {
            renderCalendar();
        }
    }

    // 2. Evento para cambiar el Modo Oscuro / Claro
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                themeToggleBtn.textContent = '☀️';
                localStorage.setItem('my_board_theme', 'dark');
            } else {
                themeToggleBtn.textContent = '🌙';
                localStorage.setItem('my_board_theme', 'light');
            }
        });
    }

    // 3. EVENTOS DEL VISOR DE IMÁGENES (GALERÍA)
    function openImageViewer(imagesArray, startIndex) {
        activeGalleryImages = imagesArray || [];
        activeImageIndex = startIndex || 0;
        updateImageViewerContent();
        if (imageViewModal) imageViewModal.classList.remove('form-hidden');
    }

    function updateImageViewerContent() {
        if (!fullSizeImage || activeGalleryImages.length === 0) return;
        fullSizeImage.src = activeGalleryImages[activeImageIndex];
        
        if (activeGalleryImages.length > 1) {
            if (imageCounter) imageCounter.textContent = `${activeImageIndex + 1} de ${activeGalleryImages.length}`;
            if (prevImageBtn) prevImageBtn.style.display = 'flex';
            if (nextImageBtn) nextImageBtn.style.display = 'flex';
        } else {
            if (imageCounter) imageCounter.textContent = '';
            if (prevImageBtn) prevImageBtn.style.display = 'none';
            if (nextImageBtn) nextImageBtn.style.display = 'none';
        }
    }

    function showPrevImage() {
        if (activeGalleryImages.length <= 1) return;
        activeImageIndex = (activeImageIndex - 1 + activeGalleryImages.length) % activeGalleryImages.length;
        updateImageViewerContent();
    }

    function showNextImage() {
        if (activeGalleryImages.length <= 1) return;
        activeImageIndex = (activeImageIndex + 1) % activeGalleryImages.length;
        updateImageViewerContent();
    }

    function closeImageViewerModal() {
        if (imageViewModal) imageViewModal.classList.add('form-hidden');
        if (fullSizeImage) fullSizeImage.src = '';
        activeGalleryImages = [];
        activeImageIndex = 0;
    }

    if (closeImageViewer) closeImageViewer.addEventListener('click', closeImageViewerModal);
    if (prevImageBtn) prevImageBtn.addEventListener('click', showPrevImage);
    if (nextImageBtn) nextImageBtn.addEventListener('click', showNextImage);

    if (imageViewModal) {
        imageViewModal.addEventListener('click', (e) => {
            if (e.target === imageViewModal) {
                closeImageViewerModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (imageViewModal && !imageViewModal.classList.contains('form-hidden')) {
            if (e.key === 'Escape') {
                closeImageViewerModal();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            }
            return;
        }

        if (e.key === 'Escape') {
            closeForm();
            closeTrashModal();
        }
    });

    // 4. ALTERNAR ENTRE VISTA DE TABLERO Y CALENDARIO
    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', () => {
            isCalendarViewActive = !isCalendarViewActive;
            
            if (isCalendarViewActive) {
                document.body.classList.add('calendar-active');
                viewToggleBtn.textContent = '📌';
                viewToggleBtn.title = 'Cambiar a Tablero de Corcho';
                renderCalendar();
            } else {
                document.body.classList.remove('calendar-active');
                viewToggleBtn.textContent = '📅';
                viewToggleBtn.title = 'Cambiar a Vista de Calendario';
            }
        });
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    function renderCalendar() {
        if (!calendarGrid) return;
        calendarGrid.innerHTML = '';
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        if (calendarMonthTitle) {
            calendarMonthTitle.textContent = `${monthNames[month]} ${year}`;
        }

        const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        daysOfWeek.forEach(day => {
            const headerEl = document.createElement('div');
            headerEl.classList.add('calendar-header-names');
            headerEl.textContent = day;
            calendarGrid.appendChild(headerEl);
        });

        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; 
        const totalDays = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day-cell');
            emptyCell.style.opacity = '0.3';
            calendarGrid.appendChild(emptyCell);
        }

        const notes = getNotesFromStorage();

        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-day-cell');

            const formattedMonth = String(month + 1).padStart(2, '0');
            const formattedDay = String(day).padStart(2, '0');
            const dateString = `${year}-${formattedMonth}-${formattedDay}`;

            cell.innerHTML = `<div class="calendar-day-number">${day}</div>`;

            const notesForDay = notes.filter(n => n.dueDate === dateString);
            notesForDay.forEach(note => {
                const chip = document.createElement('div');
                chip.classList.add('calendar-note-chip');
                chip.style.backgroundColor = note.customColor || colors[note.category] || '#fff9c4';
                chip.textContent = note.text;
                chip.title = `${note.text} (${note.category})`;
                cell.appendChild(chip);
            });

            calendarGrid.appendChild(cell);
        }
    }

    // 5. EVENTOS DE EXPORTAR E IMPORTAR (BACKUPS)
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const notes = getNotesFromStorage();
            if (notes.length === 0) {
                alert('¡No hay notas en el tablero activo para exportar!');
                return;
            }

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `tablero_corkboard_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });

        importFile.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedNotes = JSON.parse(e.target.result);
                    if (!Array.isArray(importedNotes)) {
                        throw new Error('Formato inválido');
                    }

                    const replace = confirm(`¿Deseas REEMPLAZAR las notas del tablero actual con las ${importedNotes.length} notas del archivo?\n\n(Aceptar = Reemplazar todo | Cancelar = Combinar con las actuales)`);

                    let boards = getAllBoards();
                    const activeId = getActiveBoardId();
                    const boardIndex = boards.findIndex(b => b.id === activeId);

                    if (boardIndex !== -1) {
                        if (replace) {
                            boards[boardIndex].notes = importedNotes;
                        } else {
                            boards[boardIndex].notes = [...boards[boardIndex].notes, ...importedNotes];
                        }
                        localStorage.setItem('my_corkboard_all_boards', JSON.stringify(boards));
                    }

                    location.reload();
                } catch (error) {
                    alert('Error al leer el archivo JSON. Asegúrate de que sea un respaldo válido generado por la aplicación.');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        });
    }

    // 6. EVENTOS DE LA PAPELERA DE RECICLAJE
    if (trashBinBtn && trashModal) {
        trashBinBtn.addEventListener('click', () => {
            if (trashModal.classList.contains('form-hidden')) {
                openTrashModal();
            } else {
                closeTrashModal();
            }
        });
    }

    if (closeTrashBtn) closeTrashBtn.addEventListener('click', closeTrashModal);

    function openTrashModal() {
        renderTrashItems();
        if (trashModal) trashModal.classList.remove('form-hidden');
    }

    function closeTrashModal() {
        if (trashModal) trashModal.classList.add('form-hidden');
    }

    function getTrashFromStorage() {
        const trashString = localStorage.getItem('my_board_trash');
        return trashString ? JSON.parse(trashString) : [];
    }

    function saveToTrash(noteData) {
        const trash = getTrashFromStorage();
        trash.push(noteData);
        localStorage.setItem('my_board_trash', JSON.stringify(trash));
    }

    function renderTrashItems() {
        if (!trashListContainer) return;
        trashListContainer.innerHTML = '';
        const trashNotes = getTrashFromStorage();

        if (trashNotes.length === 0) {
            trashListContainer.innerHTML = '<p style="text-align: center; opacity: 0.6; padding: 20px;">La papelera está vacía.</p>';
            return;
        }

        trashNotes.forEach((noteData, index) => {
            const item = document.createElement('div');
            item.classList.add('trash-item');
            item.innerHTML = `
                <div class="trash-item-info">
                    <div class="trash-item-title">${noteData.text}</div>
                    <div class="trash-item-category">Categoría: ${noteData.category}</div>
                </div>
                <div class="trash-actions">
                    <button class="restore-btn" data-index="${index}" title="Restaurar nota">Restaurar</button>
                    <button class="permanent-delete-btn" data-index="${index}" title="Eliminar para siempre">Borrar</button>
                </div>
            `;
            trashListContainer.appendChild(item);
        });

        trashListContainer.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                restoreNoteFromTrash(index);
            });
        });

        trashListContainer.querySelectorAll('.permanent-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                permanentDeleteFromTrash(index);
            });
        });
    }

    function restoreNoteFromTrash(index) {
        let trashNotes = getTrashFromStorage();
        const noteToRestore = trashNotes[index];

        trashNotes.splice(index, 1);
        localStorage.setItem('my_board_trash', JSON.stringify(trashNotes));

        createNoteElement(
            noteToRestore.text, 
            noteToRestore.details, 
            noteToRestore.tags, 
            noteToRestore.category, 
            noteToRestore.subcategory, 
            noteToRestore.completed,
            noteToRestore.priority,
            noteToRestore.dueDate,
            noteToRestore.customColor,
            noteToRestore.images
        );
        saveNoteToStorage(
            noteToRestore.text, 
            noteToRestore.details, 
            noteToRestore.tags, 
            noteToRestore.category, 
            noteToRestore.subcategory, 
            noteToRestore.completed,
            noteToRestore.priority,
            noteToRestore.dueDate,
            noteToRestore.customColor,
            noteToRestore.images
        );

        renderTrashItems();
    }

    function permanentDeleteFromTrash(index) {
        let trashNotes = getTrashFromStorage();
        trashNotes.splice(index, 1);
        localStorage.setItem('my_board_trash', JSON.stringify(trashNotes));
        renderTrashItems();
    }

    if (emptyTrashBtn) {
        emptyTrashBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de vaciar la papelera? Esta acción eliminará todas las notas guardadas en ella para siempre.')) {
                localStorage.removeItem('my_board_trash');
                renderTrashItems();
            }
        });
    }

    // 7. EVENTO DE BÚSQUEDA EN TIEMPO REAL
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const allNotes = document.querySelectorAll('.note');

            allNotes.forEach(note => {
                const text = note.querySelector('.note-content').textContent.toLowerCase();
                const detailsEl = note.querySelector('.note-details');
                const details = detailsEl ? detailsEl.textContent.toLowerCase() : '';

                let tagsText = '';
                note.querySelectorAll('.note-tag').forEach(tagEl => {
                    tagsText += ' ' + tagEl.textContent.toLowerCase();
                });

                const matches = text.includes(searchTerm) || details.includes(searchTerm) || tagsText.includes(searchTerm);

                if (matches || searchTerm === '') {
                    note.classList.remove('note-hidden');
                } else {
                    note.classList.add('note-hidden');
                }
            });
        });
    }

    // 8. Funciones para abrir y cerrar el formulario flotante
    function openForm(noteDataToEdit = null) {
        if (!formContainer) return;
        formContainer.classList.remove('form-hidden');
        const formTitle = formContainer.querySelector('h3');

        if (noteDataToEdit) {
            editingNoteState = noteDataToEdit;
            if (formTitle) formTitle.textContent = 'Editar Nota';
            if (addBtn) addBtn.textContent = 'Guardar Cambios';

            if (noteInput) noteInput.value = noteDataToEdit.text;
            if (noteDetails) noteDetails.value = noteDataToEdit.details || '';
            if (noteOptions) noteOptions.value = noteDataToEdit.category;

            if (noteDataToEdit.category === 'contenido') {
                if (subcategoryWrapper) subcategoryWrapper.style.display = 'flex';
                if (noteSubcategory) noteSubcategory.value = noteDataToEdit.subcategory || 'Musica';
            } else {
                if (subcategoryWrapper) subcategoryWrapper.style.display = 'none';
            }

            if (notePriority) notePriority.value = noteDataToEdit.priority || 'media';
            if (noteDueDate) noteDueDate.value = noteDataToEdit.dueDate || '';
            if (noteColorInput) noteColorInput.value = noteDataToEdit.customColor || colors[noteDataToEdit.category] || '#fff9c4';
            if (noteImageInput) noteImageInput.value = ''; 
            if (noteTagsInput) noteTagsInput.value = noteDataToEdit.tags ? noteDataToEdit.tags.join(', ') : '';
        } else {
            editingNoteState = null;
            if (formTitle) formTitle.textContent = 'Nueva Nota';
            if (addBtn) addBtn.textContent = 'Insertar';

            if (noteInput) noteInput.value = '';
            if (noteDetails) noteDetails.value = '';
            if (notePriority) notePriority.value = 'media';
            if (noteDueDate) noteDueDate.value = '';
            if (noteColorInput) noteColorInput.value = '#fff9c4';
            if (noteImageInput) noteImageInput.value = '';
            if (noteTagsInput) noteTagsInput.value = '';
            if (noteOptions) noteOptions.value = 'proyecto';
            if (subcategoryWrapper) subcategoryWrapper.style.display = 'none';
        }

        if (noteInput) {
            noteInput.focus();
            noteInput.select();
        }
    }

    function closeForm() {
        if (!formContainer) return;
        formContainer.classList.add('form-hidden');
        editingNoteState = null;
        if (noteInput) noteInput.value = '';
        if (noteDetails) noteDetails.value = '';
        if (notePriority) notePriority.value = 'media';
        if (noteDueDate) noteDueDate.value = '';
        if (noteColorInput) noteColorInput.value = '#fff9c4';
        if (noteImageInput) noteImageInput.value = '';
        if (noteTagsInput) noteTagsInput.value = '';
        if (noteOptions) noteOptions.value = 'proyecto';
        if (subcategoryWrapper) subcategoryWrapper.style.display = 'none';
    }

    if (fabBtn) fabBtn.addEventListener('click', () => openForm(null));
    if (closeBtn) closeBtn.addEventListener('click', closeForm);

    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'n' && document.activeElement !== noteInput && document.activeElement !== noteDetails && document.activeElement !== noteTagsInput && document.activeElement !== searchInput && formContainer && formContainer.classList.contains('form-hidden')) {
            event.preventDefault();
            openForm(null);
        }
    });

    // 9. SECUENCIA DE TECLADO CON ENTER:
    if (noteInput) {
        noteInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const text = noteInput.value.trim();
                if (text === '') {
                    alert('¡Escribe un título o contenido para la nota!');
                    return;
                }
                if (noteDetails) noteDetails.focus();
            }
        });
    }

    if (noteDetails) {
        noteDetails.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (noteOptions) noteOptions.focus();
            }
        });
    }

    if (noteOptions) {
        noteOptions.addEventListener('change', () => {
            if (noteOptions.value === 'contenido') {
                if (subcategoryWrapper) subcategoryWrapper.style.display = 'flex';
            } else {
                if (subcategoryWrapper) subcategoryWrapper.style.display = 'none';
            }
            if (noteColorInput) noteColorInput.value = colors[noteOptions.value] || '#fff9c4';
        });

        noteOptions.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (noteOptions.value === 'contenido') {
                    if (subcategoryWrapper) subcategoryWrapper.style.display = 'flex';
                    if (noteSubcategory) noteSubcategory.focus();
                } else {
                    if (subcategoryWrapper) subcategoryWrapper.style.display = 'none';
                    if (notePriority) notePriority.focus();
                }
            }
        });
    }

    if (noteSubcategory) {
        noteSubcategory.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (notePriority) notePriority.focus();
            }
        });
    }

    if (notePriority) {
        notePriority.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (noteDueDate) noteDueDate.focus();
            }
        });
    }

    if (noteDueDate) {
        noteDueDate.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (noteColorInput) noteColorInput.focus();
            }
        });
    }

    if (noteColorInput) {
        noteColorInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (noteImageInput) noteImageInput.focus();
            }
        });
    }

    if (noteImageInput) {
        noteImageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (noteTagsInput) noteTagsInput.focus();
            }
        });
    }

    if (noteTagsInput) {
        noteTagsInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleFormSubmit();
            }
        });
    }

    if (addBtn) addBtn.addEventListener('click', handleFormSubmit);

    function handleFormSubmit() {
        if (!noteInput || !noteOptions) return;
        const text = noteInput.value.trim();
        const details = noteDetails ? noteDetails.value.trim() : '';
        const priority = notePriority ? notePriority.value : 'media';
        const dueDate = noteDueDate ? noteDueDate.value : '';
        const customColor = noteColorInput ? noteColorInput.value : '#fff9c4';
        let rawTags = noteTagsInput ? noteTagsInput.value.trim() : '';
        const category = noteOptions.value;
        const subcategory = category === 'contenido' && noteSubcategory ? noteSubcategory.value : null;

        if (text === '') {
            alert('¡Escribe algo en tu nota antes de guardarla!');
            return;
        }

        let tags = [];
        if (rawTags !== '') {
            tags = rawTags.split(',').map(tag => {
                tag = tag.trim();
                return tag.startsWith('#') ? tag : `#${tag}`;
            }).filter(tag => tag !== '#');
        }

        const imageFiles = noteImageInput ? noteImageInput.files : null;

        if (imageFiles && imageFiles.length > 0) {
            let loadedImages = [];
            let filesProcessed = 0;

            Array.from(imageFiles).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(uploadEvent) {
                    loadedImages[index] = uploadEvent.target.result;
                    filesProcessed++;

                    if (filesProcessed === imageFiles.length) {
                        processAndSaveNote(text, details, tags, category, subcategory, false, priority, dueDate, customColor, loadedImages);
                    }
                };
                reader.readAsDataURL(file);
            });
        } else {
            const existingImages = editingNoteState ? editingNoteState.images : [];
            processAndSaveNote(text, details, tags, category, subcategory, false, priority, dueDate, customColor, existingImages);
        }
    }

    function processAndSaveNote(text, details, tags, category, subcategory, completed, priority, dueDate, customColor, images) {
        if (editingNoteState) {
            removeNoteFromActiveBoardStorage(editingNoteState.originalText, editingNoteState.originalCategory);
            if (editingNoteState.elementRef) {
                editingNoteState.elementRef.remove();
            }
        }

        createNoteElement(text, details, tags, category, subcategory, completed, priority, dueDate, customColor, images);
        saveNoteToStorage(text, details, tags, category, subcategory, completed, priority, dueDate, customColor, images);
        closeForm();
    }

    function linkify(text) {
        if (!text) return '';
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
    }

    function isColorDark(hexColor) {
        if (!hexColor || !hexColor.startsWith('#')) return false;
        let color = hexColor.replace('#', '');
        if (color.length === 3) {
            color = color.split('').map(c => c + c).join('');
        }
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq < 128;
    }

    // Función para dibujar la nota en el tablero
    function createNoteElement(text, details, tags, category, subcategory, completed, priority, dueDate, customColor, images) {
        const container = document.getElementById(`container-${category}`);
        if (!container) return;

        const note = document.createElement('div');
        note.classList.add('note');
        if (completed) {
            note.classList.add('completed');
        }
        
        const finalColor = customColor || colors[category] || '#fff9c4';
        note.style.backgroundColor = finalColor;

        if (isColorDark(finalColor)) {
            note.classList.add('dark-bg-note');
        }

        let subcategoryHtml = subcategory ? `<div class="note-subcategory-badge">🎬 ${subcategory}</div>` : '';
        let formattedDetails = linkify(details);
        let detailsHtml = formattedDetails ? `<div class="note-details" data-raw="${details}">${formattedDetails}</div>` : '';
        
        let imagesHtml = '';
        if (images && images.length > 0) {
            imagesHtml = `<div class="note-images-grid">`;
            images.forEach(imgSrc => {
                imagesHtml += `
                    <div class="note-image-thumb-wrapper" title="Ver imagen en grande" style="cursor: pointer;">
                        <img src="${imgSrc}" class="note-image-thumb" alt="Miniatura adjunta">
                    </div>
                `;
            });
            imagesHtml += `</div>`;
        }

        let tagsHtml = '';
        if (tags && tags.length > 0) {
            tagsHtml = `<div class="note-tags-container">`;
            tags.forEach(tag => {
                tagsHtml += `<span class="note-tag">${tag}</span>`;
            });
            tagsHtml += `</div>`;
        }

        let priorityClass = `priority-${priority || 'media'}`;
        let priorityText = (priority || 'media').toUpperCase();
        let dueDateHtml = dueDate ? `<span class="due-date-badge">📅 ${dueDate}</span>` : '';

        let metaHtml = `
            <div class="note-meta-container">
                <span class="priority-badge ${priorityClass}">${priorityText}</span>
                ${dueDateHtml}
            </div>
        `;

        note.innerHTML = `
            <div class="note-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <input type="checkbox" class="note-checkbox" ${completed ? 'checked' : ''} title="Marcar como completada">
                    <div class="note-actions">
                        <button class="action-btn move-up" title="Mover arriba">▲</button>
                        <button class="action-btn move-down" title="Mover abajo">▼</button>
                    </div>
                </div>
                <button class="delete-btn" title="Enviar a la papelera">&times;</button>
            </div>
            ${subcategoryHtml}
            <div class="note-content">${text}</div>
            ${detailsHtml}
            ${imagesHtml}
            ${tagsHtml}
            ${metaHtml}
        `;

        if (images && images.length > 0) {
            const thumbWrappers = note.querySelectorAll('.note-image-thumb-wrapper');
            thumbWrappers.forEach((wrapper, idx) => {
                wrapper.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openImageViewer(images, idx);
                });
            });
        }

        note.addEventListener('dblclick', (e) => {
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.note-image-thumb-wrapper')) return;

            openForm({
                text: text,
                details: details,
                tags: tags,
                category: category,
                subcategory: subcategory,
                priority: priority,
                dueDate: dueDate,
                customColor: finalColor,
                images: images || [],
                originalText: text,
                originalCategory: category,
                elementRef: note
            });
        });

        const checkbox = note.querySelector('.note-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    note.classList.add('completed');
                } else {
                    note.classList.remove('completed');
                }
                updateStorageOrder();
            });
        }

        const deleteBtn = note.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                removeNoteFromActiveBoardStorage(text, category);
                
                saveToTrash({
                    text,
                    details,
                    tags,
                    category,
                    subcategory,
                    completed,
                    priority,
                    dueDate,
                    customColor: finalColor,
                    images: images || []
                });

                note.remove();
            });
        }

        const moveUpBtn = note.querySelector('.move-up');
        if (moveUpBtn) {
            moveUpBtn.addEventListener('click', () => {
                const prevSibling = note.previousElementSibling;
                if (prevSibling) {
                    container.insertBefore(note, prevSibling);
                    updateStorageOrder();
                }
            });
        }

        const moveDownBtn = note.querySelector('.move-down');
        if (moveDownBtn) {
            moveDownBtn.addEventListener('click', () => {
                const nextSibling = note.nextElementSibling;
                if (nextSibling) {
                    container.insertBefore(nextSibling, note);
                    updateStorageOrder();
                }
            });
        }

        container.appendChild(note);
    }

    // --- GESTIÓN DE ALMACENAMIENTO POR TABLERO ACTIVO ---

    function getNotesFromStorage() {
        const boards = getAllBoards();
        const activeId = getActiveBoardId();
        const currentBoard = boards.find(b => b.id === activeId) || boards[0];
        return currentBoard ? currentBoard.notes : [];
    }

    function saveNoteToStorage(text, details, tags, category, subcategory, completed, priority, dueDate, customColor, images) {
        let boards = getAllBoards();
        const activeId = getActiveBoardId();
        const boardIndex = boards.findIndex(b => b.id === activeId);

        if (boardIndex !== -1) {
            boards[boardIndex].notes.push({ text, details, tags, category, subcategory, completed, priority, dueDate, customColor, images: images || [] });
            localStorage.setItem('my_corkboard_all_boards', JSON.stringify(boards));
        }
    }

    function removeNoteFromActiveBoardStorage(textTarget, categoryTarget) {
        let boards = getAllBoards();
        const activeId = getActiveBoardId();
        const boardIndex = boards.findIndex(b => b.id === activeId);

        if (boardIndex !== -1) {
            let notes = boards[boardIndex].notes;
            const index = notes.findIndex(n => n.text === textTarget && n.category === categoryTarget);
            if (index !== -1) {
                notes.splice(index, 1);
                boards[boardIndex].notes = notes;
                localStorage.setItem('my_corkboard_all_boards', JSON.stringify(boards));
            }
        }
    }

    function updateStorageOrder() {
        let boards = getAllBoards();
        const activeId = getActiveBoardId();
        const boardIndex = boards.findIndex(b => b.id === activeId);
        if (boardIndex === -1) return;

        let allCategories = ['proyecto', 'idea', 'tarea', 'contenido', 'otro'];
        let reorderedNotes = [];

        allCategories.forEach(cat => {
            const container = document.getElementById(`container-${cat}`);
            if (!container) return;

            container.querySelectorAll('.note').forEach(noteEl => {
                const text = noteEl.querySelector('.note-content').textContent;
                const detailsEl = noteEl.querySelector('.note-details');
                const badgeEl = noteEl.querySelector('.note-subcategory-badge');
                const checkboxEl = noteEl.querySelector('.note-checkbox');
                const priorityEl = noteEl.querySelector('.priority-badge');
                const dateEl = noteEl.querySelector('.due-date-badge');
                
                const details = detailsEl ? detailsEl.getAttribute('data-raw') || detailsEl.textContent : '';
                const subcategory = badgeEl ? badgeEl.textContent.replace('🎬 ', '') : null;
                const completed = checkboxEl ? checkboxEl.checked : false;
                const priority = priorityEl ? priorityEl.textContent.toLowerCase() : 'media';
                const dueDate = dateEl ? dateEl.textContent.replace('📅 ', '') : '';
                const customColor = noteEl.style.backgroundColor;
                
                let images = [];
                noteEl.querySelectorAll('.note-image-thumb').forEach(imgEl => {
                    images.push(imgEl.src);
                });
                
                let tags = [];
                noteEl.querySelectorAll('.note-tag').forEach(tagEl => {
                    tags.push(tagEl.textContent);
                });

                reorderedNotes.push({ text, details, tags, category: cat, subcategory, completed, priority, dueDate, customColor, images });
            });
        });

        boards[boardIndex].notes = reorderedNotes;
        localStorage.setItem('my_corkboard_all_boards', JSON.stringify(boards));
    }
}