document.addEventListener('DOMContentLoaded', () => {

    // ===================
    // Elementen ophalen
    // ===================
    const addBtn = document.getElementById('addWorkshopBtn');
    const popup = document.getElementById('workshopPopup');
    const closeBtn = document.getElementById('closePopupBtn');
    const saveBtn = document.getElementById('saveWorkshopBtn');
    const grid = document.getElementById('workshopGrid');

    const detailsPopup = document.getElementById('workshopDetailsPopup');
    const closeDetailsBtn = document.getElementById('closeDetailsPopupBtn');
    const closeDetailsBtnCancel = document.getElementById('closePopupBtnCancel');
    const deleteBtn = document.getElementById('deleteWorkshopBtn');

    const workshopFilesInput = document.getElementById('workshopFiles');
    const fileList = document.getElementById('fileList');
    const workshopMediaInput = document.getElementById('workshopMedia');

    const addLabelBtn = document.getElementById('addLabelBtn');
    const labelInput = document.getElementById('workshopLabelInput');
    const labelColor = document.getElementById('workshopLabelColor');
    const labelPreview = document.getElementById('labelPreview');
    const detailLabelPreview = document.getElementById('detailLabelPreview');

    const searchInput = document.getElementById('searchInput');
    const prevBtn = document.getElementById('prevDetailMedia');
    const nextBtn = document.getElementById('nextDetailMedia');

    // ===================
    // State
    // ===================
    let currentWorkshopId = null;
    let selectedFiles = [];
    let labels = [];

    // ===================
    // Open/close popup
    // ===================
    if (addBtn) addBtn.addEventListener('click', () => popup.style.display = 'flex');
    if (closeBtn) closeBtn.addEventListener('click', () => { popup.style.display = 'none'; clearPopup(); });
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => { detailsPopup.style.display = 'none'; clearDetailsPopup(); });
    if (closeDetailsBtnCancel) closeDetailsBtnCancel.addEventListener('click', () => { popup.style.display = 'none'; clearPopup(); });

    window.addEventListener('click', (e) => {
        if (e.target === popup) { popup.style.display = 'none'; clearPopup(); }
        if (e.target === detailsPopup) { detailsPopup.style.display = 'none'; clearDetailsPopup(); }
    });

    // ===================
    // Bestand selectie
    // ===================
    if (workshopFilesInput) {
        workshopFilesInput.addEventListener('change', (event) => {
            const allowedFileTypes = [
                'image/png', 'image/jpeg', 'video/mp4',
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
    }

    function updateFileListDisplay() {
        if (!fileList) return;
        fileList.textContent = selectedFiles.length ? `${selectedFiles.length} nieuw(e) bestand(en) toegevoegd` : '';
    }

    // ===================
    // Labels toevoegen
    // ===================
    if (addLabelBtn) {
        addLabelBtn.addEventListener('click', () => {
            const name = labelInput.value.trim();
            const color = labelColor.value;
            if (!name) return;

            // Label opslaan
            labels.push({ name, color });

            // Label tonen
            const span = document.createElement('span');
            span.textContent = name;
            span.style.backgroundColor = color;
            span.style.border = '1px solid ' + color;

            // Label verwijderen bij click
            span.addEventListener('click', () => {
                labelPreview.removeChild(span);
                labels = labels.filter(l => l.name !== name || l.color !== color);
            });

            labelPreview.appendChild(span);
            labelInput.value = '';
        });
    }

    // ===================
    // Opslaan workshop inclusief labels & bestanden
    // ===================
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const name = document.getElementById('workshopName').value.trim();
            const desc = document.getElementById('workshopDesc').value.trim();
            const durationInput = document.getElementById('workshopDuration');

            let duration = 0;
            if (durationInput && durationInput.value) {
                const [hours, minutes] = durationInput.value.split(':').map(Number);
                duration = hours + minutes / 60;
            }

            if (!name || !desc || !duration) {
                alert('Vul alle verplichte velden in.');
                return;
            }

            if (duration < 1 || duration > 2) {
                alert('De duur moet tussen 1 en 2 uur liggen.');
                return;
            }

            if (workshopMediaInput && workshopMediaInput.files.length > 0) {
                const mediaFile = workshopMediaInput.files[0];
                if (!['image/png','image/jpeg','video/mp4'].includes(mediaFile.type)) {
                    alert('Alleen PNG, JPEG afbeeldingen en MP4 video’s zijn toegestaan.');
                    return;
                }
            }

            if (selectedFiles.length > 10) {
                alert('Max 10 bestanden toegestaan.');
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', desc);
            formData.append('duration', duration);
            formData.append('labels', JSON.stringify(labels));

            if (workshopMediaInput && workshopMediaInput.files.length > 0) {
                formData.append('image', workshopMediaInput.files[0]);
            }
            selectedFiles.forEach(file => formData.append('files', file));

            try {
                let response;
                if (currentWorkshopId) response = await fetch(`/api/workshops/${currentWorkshopId}`, { method: 'PUT', body: formData });
                else response = await fetch('/api/workshops', { method: 'POST', body: formData });

                if (!response.ok) throw new Error('Fout bij opslaan workshop');

                // Labels tonen in detail popup
                detailLabelPreview.innerHTML = '';
                labels.forEach(label => {
                    const span = document.createElement('span');
                    span.textContent = label.name;
                    span.style.backgroundColor = label.color;
                    span.style.border = '1px solid ' + label.color;
                    detailLabelPreview.appendChild(span);
                });

                // Reset input
                labels = [];
                labelPreview.innerHTML = '';
                selectedFiles = [];
                popup.style.display = 'none';
                clearPopup();
                loadWorkshops();
            } catch (e) {
                alert(e.message);
            }
        });
    }

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
        if (!grid) return;
        grid.innerHTML = '';
        workshops.forEach(w => {
            const card = document.createElement('div');
            card.classList.add('workshop-card');

            let hours = Math.floor(w.duration);
            let minutes = Math.round((w.duration - hours) * 60);
            let durationStr = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;

            card.innerHTML = `
                <div class="workshop-top">
                    <div class="workshop-badge time">${durationStr}</div>
                    <div class="workshop-badge like" style="cursor:pointer;">♡</div>
                </div>
                <div class="workshop-image">
                    <img src="${w.imageUrl}" alt="${w.name}">
                </div>
                <div class="workshop-info">
                    <h3>${w.name}</h3>
                    <p>${w.review || 'Nog geen review'}</p>
                </div>
            `;

            // Like knop
            const likeBadge = card.querySelector('.like');
            likeBadge.addEventListener('click', () => {
                likeBadge.textContent = likeBadge.textContent === '♡' ? '❤️' : '♡';
            });

            // View workshop knop
            const viewBtn = document.createElement('button');
            viewBtn.classList.add('workshop-btn');
            viewBtn.textContent = 'View workshop';
            viewBtn.addEventListener('click', () => viewWorkshopDetails(w.id));
            card.appendChild(viewBtn);

            grid.appendChild(card);
        });
    }

    // ===================
    // Workshop details + slideshow
    // ===================
    async function viewWorkshopDetails(id) {
        try {
            currentWorkshopId = id;
            const res = await fetch(`/api/workshops/${id}`);
            if (!res.ok) throw new Error('Workshop niet gevonden');
            const w = await res.json();

            // Vul de basisvelden
            document.getElementById('detailName').value = w.name;
            document.getElementById('detailDesc').value = w.description;

            const detailDuration = document.getElementById('detailDuration');
            if (w.duration != null) {
                const hours = Math.floor(w.duration);
                const minutes = Math.round((w.duration - hours) * 60);
                detailDuration.value = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
            }

            // ===================
            // Labels tonen
            // ===================
            detailLabelPreview.innerHTML = '';

            // Labels ophalen, parseren indien nodig
            let labelsArray = [];
            if (w.labels) {
                if (typeof w.labels === 'string') {
                    try {
                        labelsArray = JSON.parse(w.labels);
                    } catch (err) {
                        console.error('Fout bij parsen labels:', err);
                    }
                } else if (Array.isArray(w.labels)) {
                    labelsArray = w.labels;
                }
            }

            // Labels in de DOM zetten
            labelsArray.forEach(label => {
                const span = document.createElement('span');
                span.textContent = label.name;
                span.style.backgroundColor = label.color;
                span.style.border = '1px solid ' + label.color;
                span.style.padding = '2px 6px';
                span.style.borderRadius = '4px';
                detailLabelPreview.appendChild(span);
            });

            // ===================
            // Bestanden tonen
            // ===================
            const detailFileList = document.getElementById('detailFileList');
            detailFileList.innerHTML = '';
            if (w.files) {
                w.files.forEach(file => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = file.url;
                    a.download = file.name;
                    a.textContent = file.name;
                    li.appendChild(a);
                    detailFileList.appendChild(li);
                });
            }

            // ===================
            // Slideshow
            // ===================
            const detailMediaContainer = document.getElementById('detailMediaContainer');
            detailMediaContainer.innerHTML = '';
            const mediaFiles = (w.media && w.media.length > 0) ? w.media : (w.imageUrl ? [{ url: w.imageUrl, type: 'image/jpeg' }] : []);

            mediaFiles.forEach((file, i) => {
                let el;
                if (file.type.startsWith('image/')) {
                    el = document.createElement('img');
                    el.src = file.url;
                } else if (file.type.startsWith('video/')) {
                    el = document.createElement('video');
                    el.src = file.url;
                    el.controls = true;
                }
                el.style.display = i === 0 ? 'block' : 'none';
                el.style.maxWidth = '100%';
                el.style.maxHeight = '300px';
                detailMediaContainer.appendChild(el);
            });

            // Slideshow navigatie
            if (mediaFiles.length > 0 && prevBtn && nextBtn) {
                let currentIndex = 0;
                prevBtn.onclick = () => {
                    const media = detailMediaContainer.children;
                    media[currentIndex].style.display = 'none';
                    currentIndex = (currentIndex - 1 + media.length) % media.length;
                    media[currentIndex].style.display = 'block';
                };
                nextBtn.onclick = () => {
                    const media = detailMediaContainer.children;
                    media[currentIndex].style.display = 'none';
                    currentIndex = (currentIndex + 1) % media.length;
                    media[currentIndex].style.display = 'block';
                };
            }

            detailsPopup.style.display = 'flex';
        } catch (e) {
            alert(e.message);
        }
    }


    // ===================
    // Workshop verwijderen
    // ===================
    if (deleteBtn) {
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
    }

    // ===================
    // Clear functies
    // ===================
    function clearPopup() {
        currentWorkshopId = null;
        selectedFiles = [];
        labels = [];
        document.getElementById('workshopName').value = '';
        document.getElementById('workshopDesc').value = '';
        document.getElementById('workshopDuration').value = '';
        labelPreview.innerHTML = '';
        if (workshopMediaInput) workshopMediaInput.value = '';
        if (fileList) fileList.textContent = '';
    }

    function clearDetailsPopup() {
        currentWorkshopId = null;
        document.getElementById('detailName').value = '';
        document.getElementById('detailDesc').value = '';
        document.getElementById('detailDuration').value = '';
        detailLabelPreview.innerHTML = '';
        document.getElementById('detailFileList').innerHTML = '';
        const detailMediaContainer = document.getElementById('detailMediaContainer');
        if (detailMediaContainer) detailMediaContainer.innerHTML = '';
    }

    // ===================
    // Zoekfunctie
    // ===================
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const workshopCards = document.querySelectorAll('.workshop-card');
            workshopCards.forEach(card => {
                const name = card.querySelector('.workshop-info h3').textContent.toLowerCase();
                const desc = card.querySelector('.workshop-info p').textContent.toLowerCase();
                card.style.display = (name.includes(query) || desc.includes(query)) ? 'flex' : 'none';
            });
        });
    }

    // ===================
    // Initial load
    // ===================
    loadWorkshops();

});
