const addBtn = document.getElementById('addWorkshopBtn');
const popup = document.getElementById('workshopPopup');
const closeBtn = document.getElementById('closePopupBtn');
const saveBtn = document.getElementById('saveWorkshopBtn');
const grid = document.getElementById('workshopGrid');

const detailsPopup = document.getElementById('workshopDetailsPopup');
const closeDetailsBtn = document.getElementById('closeDetailsPopupBtn');
const deleteBtn = document.getElementById('deleteWorkshopBtn');

let currentWorkshopId = null;
let selectedFiles = [];

const workshopFilesInput = document.getElementById('workshopFiles');
const fileList = document.getElementById('fileList');
const overlay = document.getElementById('imageOverlay');
const overlayImg = document.getElementById('overlayImg');
const detailImage = document.getElementById('detailImage');

// ===================
// Open/close popup
// ===================
addBtn.addEventListener('click', () => popup.style.display = 'flex');
closeBtn.addEventListener('click', () => { popup.style.display = 'none'; clearPopup(); });
document.getElementById('closePopupBtnCancel').addEventListener('click', () => { popup.style.display = 'none'; clearPopup(); });
closeDetailsBtn.addEventListener('click', () => { detailsPopup.style.display = 'none'; clearDetailsPopup(); });

window.addEventListener('click', (e) => {
    if (e.target === popup) { popup.style.display = 'none'; clearPopup(); }
    if (e.target === detailsPopup) { detailsPopup.style.display = 'none'; clearDetailsPopup(); }
});

// ===================
// Nieuwe bestanden selecteren
// ===================
workshopFilesInput.addEventListener('change', (event) => {
    const allowedFileTypes = [
        'image/png', 'image/jpeg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    const newFiles = Array.from(event.target.files);

    newFiles.forEach(file => {
        if (!allowedFileTypes.includes(file.type)) {
            alert(`Bestand ${file.name} is niet toegestaan.`);
            return;
        }
        if (selectedFiles.length < 10 && !selectedFiles.some(f => f.name === file.name)) {
            selectedFiles.push(file);
        }
    });

    updateFileListDisplay();
    workshopFilesInput.value = '';
});

function updateFileListDisplay() {
    if (selectedFiles.length === 0) {
        fileList.textContent = '';
    } else {
        fileList.textContent = `${selectedFiles.length} nieuw(e) bestand(en) toegevoegd`;
    }
}

// ===================
// Opslaan workshop
// ===================
saveBtn.addEventListener('click', async () => {
    const nameInput = document.getElementById('workshopName');
    const descInput = document.getElementById('workshopDesc');
    const durationInput = document.getElementById('workshopDuration');
    const workshopImageInput = document.getElementById('workshopImage');
    const currentImagePreview = document.getElementById('currentImagePreview');

    const name = nameInput ? nameInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const newImage = workshopImageInput ? workshopImageInput.files[0] : null;

    // Haal tijd op als "HH:MM" en zet om naar decimale uren
    let duration = 0;
    if (durationInput && durationInput.value) {
        const [hours, minutes] = durationInput.value.split(':').map(Number);
        duration = hours + minutes / 60; // 1:30 -> 1.5
    }

    // Controleer verplichte velden
    if (!name || !desc || !duration) {
        alert('Vul alle verplichte velden in.');
        return;
    }

    // Controleer of duur tussen 1 en 2 uur ligt
    if (duration < 1 || duration > 2) {
        alert('De duur moet tussen 1 en 2 uur liggen.');
        return;
    }

    // Controleer afbeeldingstype
    if (newImage && !['image/png','image/jpeg'].includes(newImage.type)) {
        alert('Alleen PNG of JPEG afbeeldingen zijn toegestaan.');
        return;
    }

    if (selectedFiles.length > 10) {
        alert('Max 10 bestanden toegestaan.');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', desc);
    formData.append('duration', duration);

    // Voeg nieuwe afbeelding toe
    if (newImage) {
        formData.append('image', newImage);
    } else if (currentImagePreview && currentImagePreview.src) {
        formData.append('existingImageUrl', currentImagePreview.src);
    }

    // Voeg nieuwe bestanden toe
    selectedFiles.forEach(file => formData.append('files', file));

    // Bestaande bestanden die verwijderd moeten worden
    const existingList = document.getElementById('existingFileList');
    const filesToRemove = [];
    if (existingList) {
        existingList.querySelectorAll('li').forEach(li => {
            if (li.toDelete && li.file) {
                filesToRemove.push(li.file.url);
            }
        });
    }
    formData.append('filesToRemove', JSON.stringify(filesToRemove));

    try {
        let response;
        if (currentWorkshopId) {
            response = await fetch(`/api/workshops/${currentWorkshopId}`, { method: 'PUT', body: formData });
        } else {
            response = await fetch('/api/workshops', { method: 'POST', body: formData });
        }

        if (!response.ok) throw new Error('Fout bij opslaan workshop');
        popup.style.display = 'none';
        clearPopup();
        loadWorkshops();
    } catch (e) {
        alert(e.message);
    }
});

// ===================
// Workshops ophalen & renderen
// ===================
async function loadWorkshops() {
    try {
        const res = await fetch('/api/workshops');
        if (!res.ok) throw new Error('Fout bij ophalen workshops');
        const workshops = await res.json();
        renderWorkshops(workshops);
    } catch (e) {
        alert(e.message);
    }
}

function renderWorkshops(workshops) {
    grid.innerHTML = '';
    workshops.forEach(w => {
        const hours = Math.floor(w.duration);
        const minutes = Math.round((w.duration - hours) * 60);
        const hh = hours.toString().padStart(2, '0');
        const mm = minutes.toString().padStart(2, '0');

        const card = document.createElement('div');
        card.classList.add('workshop-card');
        card.innerHTML = `
            <img src="${w.imageUrl}" alt="${w.name}" style="max-width:100%; height:auto; margin-bottom:5px;">
            <div class="info">
                <h3>${w.name}</h3>
                <p>${w.description.length > 50 ? w.description.substring(0,50)+'...' : w.description}</p>
                <small>Duur: ${hh}:${mm} uur</small>
            </div>
            <button onclick="viewWorkshopDetails(${w.id})">Zie workshop</button>
            <button onclick="editWorkshop(${w.id})" style="margin-top:5px; background-color:#FFA500;">Bewerk</button>
        `;
        grid.appendChild(card);
    });
}


// ===================
// Workshop details
// ===================
async function viewWorkshopDetails(id) {
    try {
        currentWorkshopId = id;
        const res = await fetch(`/api/workshops/${id}`);
        if (!res.ok) throw new Error('Workshop niet gevonden');
        const w = await res.json();

        const detailName = document.getElementById('detailName');
        const detailDesc = document.getElementById('detailDesc');
        const detailDuration = document.getElementById('detailDuration');
        if (detailName) detailName.textContent = w.name;
        if (detailDesc) detailDesc.textContent = w.description;

        // Decimaal naar HH:MM voor weergave
        if (detailDuration && w.duration != null) {
            const hours = Math.floor(w.duration);
            const minutes = Math.round((w.duration - hours) * 60);
            const hh = hours.toString().padStart(2, '0');
            const mm = minutes.toString().padStart(2, '0');
            detailDuration.textContent = `Duur: ${hh}:${mm} uur`;
        }

        if (detailImage) detailImage.src = w.imageUrl;

        const detailFileList = document.getElementById('detailFileList');
        if (detailFileList) {
            detailFileList.innerHTML = '';
            if (w.files && w.files.length > 0) {
                w.files.forEach(file => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = file.url;
                    a.textContent = file.name;
                    a.download = file.name;
                    li.appendChild(a);
                    detailFileList.appendChild(li);
                });
                const detailFilesDiv = document.getElementById('detailFiles');
                if (detailFilesDiv) detailFilesDiv.style.display = 'block';
            } else {
                const detailFilesDiv = document.getElementById('detailFiles');
                if (detailFilesDiv) detailFilesDiv.style.display = 'none';
            }
        }

        detailsPopup.style.display = 'flex';
    } catch (e) {
        alert(e.message);
    }
}

// ===================
// Workshop bewerken
// ===================
async function editWorkshop(id) {
    try {
        const res = await fetch(`/api/workshops/${id}`);
        if (!res.ok) throw new Error('Workshop niet gevonden');
        const w = await res.json();

        popup.style.display = 'flex';
        document.getElementById('existingFileListContainer').style.display = 'block';

        // Vul de velden
        const nameInput = document.getElementById('workshopName');
        const descInput = document.getElementById('workshopDesc');
        const durationInput = document.getElementById('workshopDuration');

        if (nameInput) nameInput.value = w.name;
        if (descInput) descInput.value = w.description;

        // Decimaal naar HH:MM voor input[type="time"]
        if (durationInput && w.duration != null) {
            const hours = Math.floor(w.duration);
            const minutes = Math.round((w.duration - hours) * 60);
            const hh = hours.toString().padStart(2, '0');
            const mm = minutes.toString().padStart(2, '0');
            durationInput.value = `${hh}:${mm}`;
        }

        selectedFiles = [];
        updateFileListDisplay();
        currentWorkshopId = id;

        // Bestaande bestanden tonen
        const existingList = document.getElementById('existingFileList');
        existingList.innerHTML = '';
        if (w.files && w.files.length > 0) {
            w.files.forEach(file => {
                const li = document.createElement('li');
                li.textContent = file.name + ' ';
                li.file = file;
                li.toDelete = false;

                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Verwijderen';
                removeBtn.style.marginLeft = '10px';
                removeBtn.addEventListener('click', () => {
                    li.toDelete = !li.toDelete;
                    li.style.textDecoration = li.toDelete ? 'line-through' : 'none';
                    li.style.color = li.toDelete ? 'red' : 'black';
                });

                li.appendChild(removeBtn);
                existingList.appendChild(li);
            });
        }
    } catch (e) {
        alert(e.message);
    }
}

// ===================
// Verwijderen workshop
// ===================
deleteBtn.addEventListener('click', async () => {
    if (!currentWorkshopId) return;
    if (!confirm('Weet je zeker dat je deze workshop wilt verwijderen?')) return;
    try {
        const res = await fetch(`/api/workshops/${currentWorkshopId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Fout bij verwijderen workshop');
        detailsPopup.style.display = 'none';
        clearDetailsPopup();
        loadWorkshops();
    } catch (e) {
        alert(e.message);
    }
});

// ===================
// Overlay afbeelding
// ===================
if (detailImage) {
    detailImage.addEventListener('click', () => {
        overlay.style.display = 'flex';
        overlayImg.src = detailImage.src;
    });
}
const closeOverlayBtn = document.getElementById('closeOverlay');
if (closeOverlayBtn) closeOverlayBtn.addEventListener('click', () => overlay.style.display = 'none');

// ===================
// Clear popups
// ===================
function clearPopup() {
    const nameInput = document.getElementById('workshopName');
    const descInput = document.getElementById('workshopDesc');
    const durationInput = document.getElementById('workshopDuration');
    const workshopImageInput = document.getElementById('workshopImage');

    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (durationInput) durationInput.value = '';
    if (workshopImageInput) workshopImageInput.value = '';

    workshopFilesInput.value = '';
    selectedFiles = [];
    updateFileListDisplay();

    // Verberg en leeg bestaande bestandenlijst
    const existingList = document.getElementById('existingFileList');
    if (existingList) existingList.innerHTML = '';
    document.getElementById('existingFileListContainer').style.display = 'none';

    currentWorkshopId = null;
}

function clearDetailsPopup() {
    const detailName = document.getElementById('detailName');
    const detailDesc = document.getElementById('detailDesc');
    const detailDuration = document.getElementById('detailDuration');
    const detailImageEl = document.getElementById('detailImage');
    const detailFileList = document.getElementById('detailFileList');
    const detailFilesDiv = document.getElementById('detailFiles');

    if (detailName) detailName.textContent = '';
    if (detailDesc) detailDesc.textContent = '';
    if (detailDuration) detailDuration.textContent = '';
    if (detailImageEl) detailImageEl.src = '';
    if (detailFileList) detailFileList.innerHTML = '';
    if (detailFilesDiv) detailFilesDiv.style.display = 'none';

    currentWorkshopId = null;
}

//zoekbalk
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.workshop-card');

    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        if (name.includes(filter)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// ===================
// Start laden workshops
// ===================
loadWorkshops();
