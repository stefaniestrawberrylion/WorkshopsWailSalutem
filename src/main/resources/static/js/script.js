document.addEventListener('DOMContentLoaded', () => {

    // =======================
    // Elementen ophalen
    // =======================
    const addBtn = document.getElementById('addWorkshopBtn');
    const popup = document.getElementById('workshopPopup');
    const closeBtn = document.getElementById('closePopupBtn');
    const saveBtn = document.getElementById('saveWorkshopBtn');
    const grid = document.getElementById('workshopGrid');
    const detailsPopup = document.getElementById('workshopDetailsPopup');
    const closeDetailsBtn = document.getElementById('closeDetailsPopupBtn');
    const closeDetailsBtnCancel = document.getElementById('closePopupBtnCancel');
    const deleteBtn = document.getElementById('deleteWorkshopBtn');

    const mainImageInput = document.getElementById('workshopMainImage');
    const workshopImagesInput = document.getElementById('workshopImages');
    const workshopVideoInput = document.getElementById('workshopVideo');
    const workshopFilesInput = document.getElementById('workshopFiles');

    const addLabelBtn = document.getElementById('addLabelBtn');
    const labelInput = document.getElementById('workshopLabelInput');
    const labelColor = document.getElementById('workshopLabelColor');
    const labelPreview = document.getElementById('labelPreview');
    const detailLabelPreview = document.getElementById('detailLabelPreview');

    const searchInput = document.getElementById('searchInput');
    const prevBtn = document.getElementById('prevDetailMedia');
    const nextBtn = document.getElementById('nextDetailMedia');

    const workshopPreview = document.getElementById('workshopPreview');
    const workshopFilePreview = document.getElementById('workshopFilePreview');

    let currentWorkshopId = null;
    let labels = [];
    let mainImage = null;
    let selectedMedia = [];
    let selectedFiles = [];

    // =======================
    // Open/Close popup
    // =======================
    if (addBtn) addBtn.addEventListener('click', () => popup.style.display = 'flex');
    if (closeBtn) closeBtn.addEventListener('click', () => { popup.style.display = 'none'; clearPopup(); });
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => { detailsPopup.style.display = 'none'; clearDetailsPopup(); });
    if (closeDetailsBtnCancel) closeDetailsBtnCancel.addEventListener('click', () => { popup.style.display = 'none'; clearPopup(); });
    window.addEventListener('click', (e) => {
        if (e.target === popup) { popup.style.display = 'none'; clearPopup(); }
        if (e.target === detailsPopup) { detailsPopup.style.display = 'none'; clearDetailsPopup(); }
    });

    // =======================
    // Hoofdafbeelding selecteren
    // =======================
    if(mainImageInput){
        mainImageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if(file) mainImage = file;
            mainImageInput.value = '';
        });
    }

    // =======================
    // Media selecteren (afbeeldingen + video)
    // =======================
    if(workshopImagesInput){
        workshopImagesInput.addEventListener('change', e => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if(file.type.startsWith('image/') && selectedMedia.filter(f=>f.type.startsWith('image/')).length >= 5){
                    alert('Max 5 afbeeldingen toegestaan');
                    return;
                }
                selectedMedia.push(file);
            });
            workshopImagesInput.value = '';
            updateMediaPreview();
        });
    }

    if(workshopVideoInput){
        workshopVideoInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if(!file) return;
            if(selectedMedia.some(f=>f.type.startsWith('video/'))){
                alert('Max 1 video toegestaan');
                return;
            }
            selectedMedia.push(file);
            workshopVideoInput.value = '';
            updateMediaPreview();
        });
    }

    // =======================
    // Documenten selecteren
    // =======================
    if(workshopFilesInput){
        workshopFilesInput.addEventListener('change', e => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                // Voeg alleen toe als nog niet aanwezig
                if(!selectedFiles.some(f => f.name === file.name)) {
                    selectedFiles.push(file);
                }
            });
            updateFilesPreview();
            // Niet resetten van input, zodat "bestand gekozen" zichtbaar blijft
            // workshopFilesInput.value = '';
        });
    }

    // =======================
    // Labels toevoegen
    // =======================
    addLabelBtn.addEventListener('click', () => {
        const name = labelInput.value.trim();
        const color = labelColor.value;
        if(!name) return;

        labels.push({name, color});

        const span = document.createElement('span');
        span.textContent = name;
        span.style.backgroundColor = color;
        span.style.border = '1px solid ' + color;
        span.addEventListener('click', () => {
            labelPreview.removeChild(span);
            labels = labels.filter(l => l.name !== name || l.color !== color);
        });

        labelPreview.appendChild(span);
        labelInput.value = '';
    });

    // =======================
    // Preview functies
    // =======================
    function updateMediaPreview(){
        if(!workshopPreview) return;
        workshopPreview.innerHTML = '';
        selectedMedia.forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                const el = document.createElement('div');
                el.style.position = 'relative';
                el.style.display = 'inline-block';
                el.style.marginRight = '5px';

                if(file.type.startsWith('image/')){
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '100px';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '8px';
                    el.appendChild(img);
                } else if(file.type.startsWith('video/')){
                    const video = document.createElement('video');
                    video.src = e.target.result;
                    video.controls = true;
                    video.style.width = '150px';
                    video.style.height = '100px';
                    video.style.borderRadius = '8px';
                    el.appendChild(video);
                }

                const removeBtn = document.createElement('span');
                removeBtn.textContent = '✖';
                removeBtn.style.position = 'absolute';
                removeBtn.style.top = '2px';
                removeBtn.style.right = '5px';
                removeBtn.style.color = 'white';
                removeBtn.style.cursor = 'pointer';
                removeBtn.style.fontSize = '16px';
                removeBtn.style.background = 'rgba(0,0,0,0.5)';
                removeBtn.style.borderRadius = '50%';
                removeBtn.style.padding = '2px 5px';
                removeBtn.addEventListener('click', () => {
                    selectedMedia = selectedMedia.filter(f=>f.name!==file.name || f.type!==file.type);
                    updateMediaPreview();
                });

                el.appendChild(removeBtn);
                workshopPreview.appendChild(el);
            }
            reader.readAsDataURL(file);
        });
    }

    function updateFilesPreview(){
        if(!workshopFilePreview) return;
        workshopFilePreview.innerHTML = '';

        selectedFiles.forEach(file => {
            const li = document.createElement('li');
            li.classList.add('file-item');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.gap = '5px';

            // Icon
            const icon = document.createElement('i');
            icon.classList.add('fa', getFileIconClass(file.name));
            li.appendChild(icon);

            // Naam
            const fileName = document.createElement('span');
            fileName.textContent = file.name;
            li.appendChild(fileName);

            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.classList.add('remove-file-btn');
            removeBtn.addEventListener('click', () => {
                selectedFiles = selectedFiles.filter(f => f.name !== file.name);
                updateFilesPreview();
            });
            li.appendChild(removeBtn);

            workshopFilePreview.appendChild(li);
        });
    }

    function getFileIconClass(fileName){
        if(!fileName) return 'fa-file';
        const ext = fileName.split('.').pop().toLowerCase();
        switch(ext){
            case 'pdf': return 'fa-file-pdf';
            case 'doc': case 'docx': return 'fa-file-word';
            case 'xls': case 'xlsx': return 'fa-file-excel';
            case 'ppt': case 'pptx': return 'fa-file-powerpoint';
            case 'zip': return 'fa-file-archive';
            case 'txt': return 'fa-file-lines';
            default: return 'fa-file';
        }
    }


    // =======================
    // Workshop opslaan
    // =======================
    saveBtn.addEventListener('click', async () => {
        const name = document.getElementById('workshopName').value.trim();
        const desc = document.getElementById('workshopDesc').value.trim();
        const durationInput = document.getElementById('workshopDuration');
        let duration = 0;
        if(durationInput && durationInput.value){
            const [hours, minutes] = durationInput.value.split(':').map(Number);
            duration = hours + minutes/60;
        }

        if(!name || !desc || !duration){ alert('Vul alle verplichte velden in'); return; }
        if(duration <1 || duration>2){ alert('Duur moet tussen 1 en 2 uur liggen'); return; }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', desc);
        formData.append('duration', duration);
        formData.append('labels', JSON.stringify(labels));

        if(mainImage) formData.append('image', mainImage);
        selectedMedia.forEach(file=>formData.append('media', file));
        selectedFiles.forEach(file=>formData.append('files', file));

        try{
            let response;
            if(currentWorkshopId)
                response = await fetch(`/api/workshops/${currentWorkshopId}`, {method:'PUT', body: formData});
            else
                response = await fetch('/api/workshops', {method:'POST', body: formData});

            if(!response.ok) throw new Error('Fout bij opslaan workshop');

            // Reset
            clearPopup();
            popup.style.display='none';
            loadWorkshops();
        }catch(e){
            alert(e.message);
        }
    });

    // =======================
    // Workshops ophalen
    // =======================
    async function loadWorkshops(){
        try{
            const res = await fetch('/api/workshops');
            if(!res.ok) throw new Error('Fout bij ophalen workshops');
            const workshops = await res.json();
            renderWorkshops(workshops);
        }catch(e){ alert(e.message); }
    }

    function renderWorkshops(workshops){
        grid.innerHTML = '';
        workshops.forEach(w=>{
            const card = document.createElement('div');
            card.classList.add('workshop-card');

            let firstImage = w.files?.find(m=>m.type==='image');
            let imageUrl = firstImage ? firstImage.url : (w.imageUrl || '/image/default-workshop.png');
            card.style.backgroundImage = `url('${imageUrl}')`;

            let hours = Math.floor(w.duration);
            let minutes = Math.round((w.duration - hours) * 60);
            let durationStr = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;

            card.innerHTML = `
                <div class="workshop-top">
                    <div class="workshop-badge time">${durationStr}</div>
                    <div class="like">♡</div>
                </div>
                <div class="workshop-info">
                    <h3>${w.name}</h3>
                    <p>${w.review || 'Nog geen review'}</p>
                </div>
                <button class="workshop-btn">View workshop</button>
            `;

            const likeBadge = card.querySelector('.like');
            likeBadge.addEventListener('click', () => {
                likeBadge.textContent = likeBadge.textContent === '♡' ? '❤️' : '♡';
            });

            const btn = card.querySelector('.workshop-btn');
            btn.addEventListener('click', ()=>viewWorkshopDetails(w.id));

            grid.appendChild(card);
        });
    }

    // =======================
    // View details
    // =======================
    async function viewWorkshopDetails(id){
        try{
            currentWorkshopId = id;
            const res = await fetch(`/api/workshops/${id}`);
            if(!res.ok) throw new Error('Workshop niet gevonden');
            const w = await res.json();

            document.getElementById('detailName').value = w.name;
            document.getElementById('detailDesc').value = w.description;
            const detailDuration = document.getElementById('detailDuration');
            const hours = Math.floor(w.duration);
            const minutes = Math.round((w.duration - hours)*60);
            detailDuration.value = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;

            // =======================
// Labels in details popup
// =======================
            detailLabelPreview.innerHTML = '';
            const labelsArray = w.labels ? (typeof w.labels === 'string' ? JSON.parse(w.labels) : w.labels) : [];
            labelsArray.forEach(label => {
                const span = document.createElement('span');
                span.textContent = label.name;
                span.style.backgroundColor = label.color;
                span.style.border = '1px solid ' + label.color;
                span.style.color = getContrastYIQ(label.color); // tekstkleur automatisch contrasterend
                span.style.padding = '3px 8px';
                span.style.borderRadius = '12px';
                span.style.fontSize = '12px';
                span.style.display = 'inline-block';
                span.style.margin = '2px 2px 2px 0';
                detailLabelPreview.appendChild(span);
            });

            // Files in details popup (met icon, nette kaartstijl)
            const detailFileList = document.getElementById('workshopFilePreview');
            if(detailFileList) {
                detailFileList.innerHTML = '';

                // Flexbox instellingen voor 2 kaarten per rij
                detailFileList.style.display = 'flex';
                detailFileList.style.flexWrap = 'wrap';
                detailFileList.style.gap = '10px';
                detailFileList.style.padding = '0'; // verwijder standaard ul-padding
                detailFileList.style.listStyle = 'none'; // verwijder bullets
            }

            if(w.documents){
                w.documents.forEach(f=>{
                    const li = document.createElement('li');
                    li.classList.add('file-card');

                    // Breedte voor 2 kaarten per rij, iets kleiner zodat ze passen
                    li.style.width = 'calc(40% - 5px)';
                    li.style.margin = '0'; // geen extra margin
                    li.style.padding = '10px';
                    li.style.border = '1px solid #ddd';
                    li.style.borderRadius = '8px';
                    li.style.textAlign = 'center';
                    li.style.background = '#fff';
                    li.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                    li.style.cursor = 'pointer';
                    li.style.transition = 'transform 0.2s';

                    li.addEventListener('mouseenter', ()=>li.style.transform='scale(1.05)');
                    li.addEventListener('mouseleave', ()=>li.style.transform='scale(1)');

                    // Icon
                    const icon = document.createElement('i');
                    icon.classList.add('fa', getFileIconClass(f.name));
                    icon.style.fontSize = '36px';
                    icon.style.color = '#555';
                    li.appendChild(icon);

                    // Naam
                    const name = document.createElement('div');
                    name.textContent = f.name;
                    name.style.marginTop = '5px';
                    name.style.fontSize = '14px';
                    name.style.overflow = 'hidden';
                    name.style.textOverflow = 'ellipsis';
                    name.style.whiteSpace = 'nowrap';
                    name.title = f.name;
                    li.appendChild(name);

                    // Bestandsgrootte
                    const type = document.createElement('div');
                    type.textContent = f.size ? `${(f.size/1024).toFixed(1)} KB` : '';
                    type.style.fontSize = '12px';
                    type.style.color = '#777';
                    li.appendChild(type);

                    // Download knop
                    // Download knop
                    const downloadLink = document.createElement('a');
                    downloadLink.textContent = 'Download';
                    downloadLink.href = f.url;
                    downloadLink.setAttribute('download', f.name);
                    downloadLink.style.background = '#007bff';
                    downloadLink.style.color = 'white';
                    downloadLink.style.border = 'none';
                    downloadLink.style.padding = '4px 10px';
                    downloadLink.style.borderRadius = '4px';
                    downloadLink.style.cursor = 'pointer';
                    downloadLink.style.marginTop = '5px';
                    downloadLink.style.textDecoration = 'none';
                    downloadLink.style.display = 'inline-block';
                    downloadLink.style.marginTop = '10px';
                    downloadLink.addEventListener('click', (e) => e.stopPropagation());
                    li.appendChild(downloadLink);


                    // Klik op kaart opent bestand
                    li.addEventListener('click', ()=>window.open(f.url, '_blank'));

                    detailFileList.appendChild(li);
                });
            }


            // Slideshow
            const container = document.getElementById('detailMediaContainer');
            container.innerHTML = '';
            const mediaFiles = w.files || [];
            mediaFiles.forEach((file,i)=>{
                let el;
                if(file.type==='image'){
                    el = document.createElement('img');
                    el.src = file.url;
                } else if(file.type==='video'){
                    el = document.createElement('video');
                    el.src = file.url;
                    el.controls = true;
                }
                el.style.display = i===0?'block':'none';
                container.appendChild(el);
            });

            if(mediaFiles.length>0){
                let currentIndex = 0;
                prevBtn.onclick = ()=>{
                    container.children[currentIndex].style.display='none';
                    currentIndex = (currentIndex-1+container.children.length)%container.children.length;
                    container.children[currentIndex].style.display='block';
                };
                nextBtn.onclick = ()=>{
                    container.children[currentIndex].style.display='none';
                    currentIndex = (currentIndex+1)%container.children.length;
                    container.children[currentIndex].style.display='block';
                };
            }

            detailsPopup.style.display = 'flex';
        }catch(e){ alert(e.message); }
    }
// Helperfunctie voor contrast kleur
    function getContrastYIQ(hexcolor){
        hexcolor = hexcolor.replace('#','');
        const r = parseInt(hexcolor.substr(0,2),16);
        const g = parseInt(hexcolor.substr(2,2),16);
        const b = parseInt(hexcolor.substr(4,2),16);
        const yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? 'black' : 'white';
    }
    // =======================
    // Clear functies
    // =======================
    function clearPopup(){
        currentWorkshopId=null;
        mainImage=null;
        selectedMedia=[];
        selectedFiles=[];
        labels=[];
        document.getElementById('workshopName').value='';
        document.getElementById('workshopDesc').value='';
        document.getElementById('workshopDuration').value='';
        labelPreview.innerHTML='';
        if(workshopPreview) workshopPreview.innerHTML='';
        if(workshopFilePreview) workshopFilePreview.innerHTML='';
        if(mainImageInput) mainImageInput.value='';
        if(workshopImagesInput) workshopImagesInput.value='';
        if(workshopVideoInput) workshopVideoInput.value='';
        if(workshopFilesInput) workshopFilesInput.value='';
    }

    function clearDetailsPopup(){
        currentWorkshopId=null;
        document.getElementById('detailName').value='';
        document.getElementById('detailDesc').value='';
        document.getElementById('detailDuration').value='';
        detailLabelPreview.innerHTML='';
        const detailFileList = document.getElementById('workshopFilePreview');
        if(detailFileList) detailFileList.innerHTML='';
        const mediaContainer = document.getElementById('detailMediaContainer');
        if(mediaContainer) mediaContainer.innerHTML='';
    }

    // =======================
    // Delete workshop (globaal)
    // =======================
    if(deleteBtn){
        deleteBtn.addEventListener('click', async () => {
            if(!currentWorkshopId) return;
            const confirmDelete = confirm('Weet je zeker dat je deze workshop wilt verwijderen?');
            if(!confirmDelete) return;

            try{
                const res = await fetch(`/api/workshops/${currentWorkshopId}`, {method:'DELETE'});
                if(!res.ok) throw new Error('Fout bij verwijderen workshop');

                detailsPopup.style.display='none';
                clearDetailsPopup();
                await loadWorkshops();
                alert('Workshop succesvol verwijderd!');
            }catch(e){ alert(e.message); }
        });
    }

    // =======================
    // Search
    // =======================
    if(searchInput){
        searchInput.addEventListener('input', ()=>{
            const query = searchInput.value.toLowerCase();
            const cards = document.querySelectorAll('.workshop-card');
            cards.forEach(c=>{
                const name = c.querySelector('.workshop-info h3').textContent.toLowerCase();
                const desc = c.querySelector('.workshop-info p').textContent.toLowerCase();
                c.style.display = (name.includes(query)||desc.includes(query))?'flex':'none';
            });
        });
    }

    loadWorkshops();
});
