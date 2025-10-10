const API_URL = 'https://study-notes-backend.onrender.com/api';
let selectedSubject = null;
let messageTimeout;

// --- DOM Element Selectors ---
const fileModal = document.getElementById("file-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalBody = document.getElementById("modal-body");
const subjectInput = document.getElementById("subjectInput");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const subjectList = document.getElementById("subjectList");
const notesList = document.getElementById("notesList");
const fileList = document.getElementById("fileList");
const notesHeader = document.getElementById("notesHeader");
const filesHeader = document.getElementById("filesHeader");
const messageBox = document.getElementById("messageBox");
const messageText = document.getElementById("messageText");
const closeMessageBtn = document.getElementById("closeMessageBtn");
const loadingIndicator = document.getElementById("loadingIndicator");

const mainView = document.getElementById("main-view");
const addContentView = document.getElementById("add-content-view");
const showAddViewBtn = document.getElementById("showAddViewBtn");
const addContentHeader = document.getElementById("addContentHeader");

const noteInput = document.getElementById("noteInput");
const fileInput = document.getElementById("fileInput");
const fileInputLabel = document.getElementById("fileInputLabel");

const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");

const editNoteModal = document.getElementById("edit-note-modal");
const editNoteIdInput = document.getElementById("edit-note-id");
const editNoteContentInput = document.getElementById("edit-note-content");
const saveChangesBtn = document.getElementById("save-changes-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const editModalCloseBtn = document.getElementById("edit-modal-close-btn");
const logoutBtn = document.getElementById("logoutBtn");
// Add these with your other DOM element selectors at the top
const editSubjectModal = document.getElementById("edit-subject-modal");
const editSubjectIdInput = document.getElementById("edit-subject-id");
const editSubjectNameInput = document.getElementById("edit-subject-name");
const saveSubjectChangesBtn = document.getElementById("save-subject-changes-btn");
const cancelEditSubjectBtn = document.getElementById("cancel-edit-subject-btn");
const editSubjectModalCloseBtn = document.getElementById("edit-subject-modal-close-btn");
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Remove the token from local storage
        localStorage.removeItem('token');
        
        // Show a message to the user
        alert("You have been logged out.");
        
        // Redirect to the login page
        window.location.href = './login.html';
    });
}

// --- View Management ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    const viewToShow = document.getElementById(viewId);
    if(viewToShow) {
        viewToShow.classList.remove('hidden');
    }
}

// --- UI Feedback ---
function showMessage(text, type = "success") {
    clearTimeout(messageTimeout);
    messageText.textContent = text;
    messageBox.className = `message-box show ${type}`;
    messageTimeout = setTimeout(() => {
        messageBox.classList.remove('show');
    }, 5000);
}

// --- API Fetching ---
async function fetchSubjects() {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage("You are not logged in.", "error");
        return;
    }
    try {
        const response = await fetch(`${API_URL}/subjects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const subjects = await response.json();
        renderSubjects(subjects);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        showMessage("Failed to load subjects.", "error");
    }
}

// REPLACE your existing fetchNotes function with this one

async function fetchNotes(subjectId) {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const response = await fetch(`${API_URL}/notes?subjectId=${subjectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const notes = await response.json();
        renderNotes(notes); // On success, this function will replace the loader with notes
    } catch (error) {
        console.error("Error fetching notes:", error);
        // On failure, replace the loader with an error message
        notesList.innerHTML = `<div class="empty-state" style="color: red;">Failed to load notes.</div>`;
    }
}

// REPLACE your existing fetchFiles function with this one

async function fetchFiles(subjectId) {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const response = await fetch(`${API_URL}/files?subjectId=${subjectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const files = await response.json();
        renderFiles(files); // On success, this will replace the loader with files
    } catch (error) {
        console.error("Error fetching files:", error);
        // On failure, replace the loader with an error message
        fileList.innerHTML = `<div class="empty-state" style="color: red;">Failed to load files.</div>`;
    }
}

// --- Rendering Functions ---
// REPLACE your existing renderSubjects function with this one

function renderSubjects(subjects) {
    subjectList.innerHTML = "";
    subjects.forEach(subject => {
        // Create a container for the subject and its buttons
        const subjectItem = document.createElement("div");
        subjectItem.className = "subject-item";

        // Create the main subject button (for selecting)
        const btn = document.createElement("button");
        btn.textContent = subject.name;
        btn.className = "subject-button";
        if (selectedSubject && selectedSubject.id === subject._id) {
            btn.classList.add("active");
        }
        btn.onclick = () => {
            // This selection logic remains the same
            selectedSubject = { id: subject._id, name: subject.name };
            notesHeader.textContent = `Notes for: ${subject.name}`;
            filesHeader.textContent = `Files for: ${subject.name}`;
            notesList.innerHTML = '<div class="loader"></div>';
            fileList.innerHTML = '<div class="loader"></div>';
            fetchNotes(selectedSubject.id);
            fetchFiles(selectedSubject.id); 
            renderSubjects(subjects);
            showView('main-view');
        };

        // Create a container for action buttons
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "subject-actions";

        // Create Edit Button
        const editBtn = document.createElement("button");
        editBtn.innerHTML = '✏️';
        editBtn.title = "Edit Subject";
        editBtn.onclick = (e) => {
            e.stopPropagation(); // Prevents the subject from being selected
            openEditSubjectModal(subject._id, subject.name);
        };

        // Create Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = "Delete Subject";
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // Prevents the subject from being selected
            deleteSubject(subject._id, subject.name);
        };

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        subjectItem.appendChild(btn);
        subjectItem.appendChild(actionsDiv);
        
        subjectList.appendChild(subjectItem);
    });
}

function renderNotes(notes) {
    notesList.innerHTML = "";
    if (notes.length === 0) {
        notesList.innerHTML = `<div class="empty-state">No notes found for this subject.</div>`;
    } else {
        notes.forEach(note => {
            const div = document.createElement("div");
            div.className = "note-card";
            div.dataset.id = note._id; // Set the note's ID here

            // Container for note text and timestamp
            const detailsDiv = document.createElement("div");
            detailsDiv.className = "note-details";

            const noteText = document.createElement("p");
            noteText.className = "note-text";
            noteText.textContent = note.content;
            detailsDiv.appendChild(noteText);
            
            const noteTimestamp = document.createElement("p");
            noteTimestamp.className = "note-timestamp";
            noteTimestamp.textContent = new Date(note.createdAt).toLocaleString();
            detailsDiv.appendChild(noteTimestamp);

            // Container for action buttons
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "note-actions";

            // Edit Button
            const editBtn = document.createElement("button");
            editBtn.innerHTML = '✏️';
            editBtn.title = "Edit Note";
            editBtn.onclick = () => openEditModal(note._id, note.content);
            actionsDiv.appendChild(editBtn);

            // Delete Button
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = "Delete Note";
            deleteBtn.onclick = () => deleteNote(note._id);
            actionsDiv.appendChild(deleteBtn);

            div.appendChild(detailsDiv);
            div.appendChild(actionsDiv);
            notesList.appendChild(div);
        });
    }
}

// REPLACE your existing renderFiles function with this one

function renderFiles(files) {
    fileList.innerHTML = "";
    if (files.length === 0) {
        fileList.innerHTML = `<div class="empty-state">No files found for this subject.</div>`;
        return;
    }

    const fileIconSvg = `
        <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    `;

    files.forEach(file => {
        // Main container is now a DIV instead of a BUTTON
        const cardContainer = document.createElement("div");
        cardContainer.className = "file-card";
        cardContainer.title = `View ${file.name}`;
        cardContainer.innerHTML = `
            ${fileIconSvg}
            <p class="file-name">${file.name}</p>
        `;

        // Event listener to open the file viewer modal
        cardContainer.addEventListener('click', () => {
            modalBody.innerHTML = '';
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = file.url;
                modalBody.appendChild(img);
            } else if (file.type === 'application/pdf') {
                const iframe = document.createElement('iframe');
                iframe.src = file.url;
                modalBody.appendChild(iframe);
            } else {
                modalBody.innerHTML = `
                    <p>This file cannot be previewed directly.</p>
                    <a href="${file.url}" download="${file.name}" class="add-button">Download ${file.name}</a>
                `;
            }
            openFileModal();
        });
        
        // --- NEW DELETE BUTTON ---
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'file-delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete File';
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // VERY IMPORTANT: Prevents the card's click event from firing
            deleteFile(file._id, file.name);
        });

        cardContainer.appendChild(deleteBtn);
        fileList.appendChild(cardContainer);
    });
}

// --- Modal Controls ---
function openFileModal() {
    fileModal.classList.remove('hidden');
}

function closeFileModal() {
    fileModal.classList.add('hidden');
    modalBody.innerHTML = '';
}

// --- Functions for Edit/Delete ---
function openEditModal(noteId, currentContent) {
    editNoteIdInput.value = noteId;
    editNoteContentInput.value = currentContent;
    editNoteModal.classList.remove('hidden');
}

function closeEditModal() {
    editNoteModal.classList.add('hidden');
}

async function deleteNote(noteId) {
    const isConfirmed = confirm('Are you sure you want to delete this note?');
    if (!isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to delete note.');
        }

        showMessage("Note deleted successfully.", "success");
        fetchNotes(selectedSubject.id); // Refresh the notes list
    } catch (error) {
        showMessage(error.message, "error");
    }
}

async function handleUpdateNote() {
    const noteId = editNoteIdInput.value;
    const newContent = editNoteContentInput.value;
    const token = localStorage.getItem('token');

    if (!newContent.trim()) {
        return showMessage("Note content cannot be empty.", "error");
    }

    try {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: newContent })
        });

        if (!response.ok) {
            throw new Error('Failed to update note.');
        }

        showMessage("Note updated successfully.", "success");
        closeEditModal();
        fetchNotes(selectedSubject.id); // Refresh the notes list
    } catch (error) {
        showMessage(error.message, "error");
    }
}

// --- Event Listeners ---
closeMessageBtn.onclick = () => messageBox.classList.remove('show');

showAddViewBtn.addEventListener('click', () => {
    if (!selectedSubject) {
        showMessage("Please select a subject first.", "error");
        return;
    }
    addContentHeader.textContent = `Add New Entry to: ${selectedSubject.name}`;
    showView('add-content-view');
});

cancelBtn.addEventListener('click', () => {
    noteInput.value = '';
    fileInput.value = null;
    fileInputLabel.textContent = "Click to select a file";
    showView('main-view');
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileInputLabel.textContent = fileInput.files[0].name;
    } else {
        fileInputLabel.textContent = "Click to select a file";
    }
});

modalCloseBtn.addEventListener('click', closeFileModal);
fileModal.addEventListener('click', (event) => {
    if (event.target === fileModal) {
        closeFileModal();
    }
});

addSubjectBtn.onclick = async () => {
    const name = subjectInput.value.trim();
    if (!name) return showMessage("Subject name is required.", "error");
    
    const token = localStorage.getItem('token');
    if (!token) return showMessage("You are not logged in.", "error");
    
    try {
        const response = await fetch(`${API_URL}/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        
        subjectInput.value = "";
        showMessage("Subject added successfully!", "success");
        fetchSubjects();
    } catch (error) {
        console.error("Error adding subject:", error);
        showMessage("Failed to add subject.", "error");
    }
};

saveBtn.onclick = async () => {
    const token = localStorage.getItem('token');
    if (!token) return showMessage("You are not logged in.", "error");

    const noteContent = noteInput.value.trim();
    const file = fileInput.files[0];

    if (!noteContent && !file) {
        return showMessage("Please either write a note or select a file.", "error");
    }
    
    loadingIndicator.style.display = 'inline';
    saveBtn.disabled = true;
    cancelBtn.disabled = true;

    try {
        if (file) {
            // Note: This file handling logic might need adjustment.
            // Sending file content as a Data URL is not efficient for large files.
            // Using FormData is the standard approach.
            const noteResponse = await fetch(`${API_URL}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ subjectId: selectedSubject.id, content: `File: ${file.name}` })
            });
            if (!noteResponse.ok) throw new Error('Failed to create note for file.');
            const newNote = await noteResponse.json();

            const reader = new FileReader();
            reader.onload = async (event) => {
                const filePayload = { noteId: newNote._id, name: file.name, type: file.type, fileContent: event.target.result };
                const fileResponse = await fetch(`${API_URL}/files`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(filePayload)
                });
                if (!fileResponse.ok) throw new Error('File upload failed.');
                
                if (noteContent) {
                    await saveTextNote(token, noteContent);
                }
                finalizeSave();
            };
            reader.readAsDataURL(file);
        } else if (noteContent) {
            await saveTextNote(token, noteContent);
            finalizeSave();
        }
    } catch (error) {
        console.error("Error saving entry:", error);
        showMessage(error.message, "error");
        loadingIndicator.style.display = 'none';
        saveBtn.disabled = false;
        cancelBtn.disabled = false;
    }
};

async function saveTextNote(token, content) {
    const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ subjectId: selectedSubject.id, content: content })
    });
    if (!response.ok) throw new Error('Failed to save text note.');
}

function finalizeSave() {
    showMessage("Entry saved successfully!", "success");
    fetchNotes(selectedSubject.id);
    fetchFiles(selectedSubject.id);
    loadingIndicator.style.display = 'none';
    saveBtn.disabled = false;
    cancelBtn.disabled = false;
    noteInput.value = '';
    fileInput.value = null;
    fileInputLabel.textContent = "Click to select a file";
    showView('main-view');
}

// Event Listeners for Edit Modal
saveChangesBtn.addEventListener('click', handleUpdateNote);
cancelEditBtn.addEventListener('click', closeEditModal);
editModalCloseBtn.addEventListener('click', closeEditModal);
editNoteModal.addEventListener('click', (event) => {
    if (event.target === editNoteModal) {
        closeEditModal();
    }
});


// --- Initial App Load ---
fetchSubjects();
showView('main-view');
// Add these new functions and listeners at the end of script.js

// --- Functions for Subject Edit/Delete ---

function openEditSubjectModal(subjectId, currentName) {
    editSubjectIdInput.value = subjectId;
    editSubjectNameInput.value = currentName;
    editSubjectModal.classList.remove('hidden');
}

function closeEditSubjectModal() {
    editSubjectModal.classList.add('hidden');
}

async function deleteSubject(subjectId, subjectName) {
    const isConfirmed = confirm(`Are you sure you want to delete the subject "${subjectName}"? This will also delete all associated notes and files.`);
    if (!isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to delete subject.');
        }

        showMessage("Subject deleted successfully.", "success");
        // If the deleted subject was the selected one, clear the view
        if (selectedSubject && selectedSubject.id === subjectId) {
            selectedSubject = null;
            notesList.innerHTML = '<div class="empty-state">Select a subject to see its notes.</div>';
            fileList.innerHTML = '<div class="empty-state">Select a subject to see its files.</div>';
        }
        fetchSubjects(); // Refresh the subjects list
    } catch (error) {
        showMessage(error.message, "error");
    }
}

async function handleUpdateSubject() {
    const subjectId = editSubjectIdInput.value;
    const newName = editSubjectNameInput.value.trim();
    const token = localStorage.getItem('token');

    if (!newName) {
        return showMessage("Subject name cannot be empty.", "error");
    }

    try {
        const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: newName })
        });

        if (!response.ok) {
            throw new Error('Failed to update subject.');
        }

        showMessage("Subject updated successfully.", "success");
        closeEditSubjectModal();
        // If the updated subject was the selected one, update its name
        if (selectedSubject && selectedSubject.id === subjectId) {
            selectedSubject.name = newName;
            notesHeader.textContent = `Notes for: ${newName}`;
            filesHeader.textContent = `Files for: ${newName}`;
        }
        fetchSubjects(); // Refresh the subjects list
    } catch (error) {
        showMessage(error.message, "error");
    }
}


// --- Event Listeners for Edit Subject Modal ---
saveSubjectChangesBtn.addEventListener('click', handleUpdateSubject);
cancelEditSubjectBtn.addEventListener('click', closeEditSubjectModal);
editSubjectModalCloseBtn.addEventListener('click', closeEditSubjectModal);
editSubjectModal.addEventListener('click', (event) => {
    if (event.target === editSubjectModal) {
        closeEditSubjectModal();
    }
});
// Add this new function at the end of script.js

async function deleteFile(fileId, fileName) {
    const isConfirmed = confirm(`Are you sure you want to delete the file "${fileName}"?`);
    if (!isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/files/${fileId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to delete file.');
        }

        showMessage("File deleted successfully.", "success");
        fetchFiles(selectedSubject.id); // Refresh the files list
    } catch (error) {
        showMessage(error.message, "error");
    }
}