// Inicializácia pri zavedení DOM
document.addEventListener('DOMContentLoaded', function() {
    initGallery();
    initFormValidation();
    initDataButtons();
});

// ========== GALERIA ==========
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close');

    if (!modal) return;

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            modal.style.display = 'block';
            modalImg.src = this.querySelector('img').src;
        });
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ========== VALIDÁCIA FORMULÁRA ==========
function initFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Očisti predchádzajúce chyby
        const errors = document.querySelectorAll('.error');
        errors.forEach(error => error.remove());

        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            input.classList.remove('invalid');
            
            // Validácia názvu
            if (input.name === 'name') {
                if (input.value.trim().length < 3) {
                    showError(input, 'Meno musí mať aspoň 3 znaky');
                    isValid = false;
                }
            }
            
            // Validácia emailu
            if (input.name === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    showError(input, 'Zadaj platný email');
                    isValid = false;
                }
            }
            
            // Validácia telefónu
            if (input.name === 'phone') {
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (input.value && !phoneRegex.test(input.value)) {
                    showError(input, 'Zadaj platný telefón');
                    isValid = false;
                }
            }
            
            // Validácia správy
            if (input.name === 'message') {
                if (input.value.trim().length < 10) {
                    showError(input, 'Správa musí mať aspoň 10 znakov');
                    isValid = false;
                }
            }

            // Validácia súboru
            if (input.name === 'file') {
                if (input.value) {
                    const validExtensions = ['pdf', 'doc', 'docx', 'txt'];
                    const fileName = input.value.split('.').pop().toLowerCase();
                    if (!validExtensions.includes(fileName)) {
                        showError(input, 'Podporované formáty: PDF, DOC, DOCX, TXT');
                        isValid = false;
                    }
                }
            }
        });

        // Validácia checkboxu
        const termsCheckbox = form.querySelector('input[name="terms"]');
        if (termsCheckbox && !termsCheckbox.checked) {
            showError(termsCheckbox, 'Musíš súhlasiť s podmienkami');
            isValid = false;
        }

        if (isValid) {
            // Zozbieraj dáta z formulára
            const formData = new FormData(form);
            console.log('Formulár je validný. Dáta:', Object.fromEntries(formData));
            
            // Zobraz úspešnú správu
            const successMsg = document.createElement('div');
            successMsg.className = 'success';
            successMsg.textContent = '✓ Formulár bol úspešne odoslaný!';
            form.insertBefore(successMsg, form.firstChild);
            
            // Vymaž správu po 3 sekundách
            setTimeout(() => successMsg.remove(), 3000);
            
            // Resetuj formulár
            form.reset();
        }
    });
}

function showError(element, message) {
    element.classList.add('invalid');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    element.parentNode.insertBefore(errorDiv, element.nextSibling);
}

// ========== AJAX - TLAČIDLÁ ==========
function initDataButtons() {
    const loadBtn = document.getElementById('loadDataBtn');
    const clearBtn = document.getElementById('clearDataBtn');

    if (loadBtn) {
        loadBtn.addEventListener('click', loadDataAjax);
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            const container = document.getElementById('dataContainer');
            if (container) {
                container.innerHTML = '<p class="placeholder">Kliknite na tlačidlo "Načítať dáta" pre zobrazenie tabuľky cez AJAX.</p>';
            }
        });
    }
}

// ========== AJAX - NAČÍTANIE DÁT ==========
function loadDataAjax() {
    const container = document.getElementById('dataContainer');
    if (!container) return;

    // Zobraz loading stav
    container.innerHTML = '<div class="loader"><div class="spinner"></div><p>Načítavam dáta cez AJAX...</p></div>';

    // AJAX požiadavka cez Fetch API
    fetch('../data/data.json')
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            displayDataInTable(data);
        })
        .catch(error => {
            console.error('Chyba pri načítavaní dát:', error);
            container.innerHTML = '<p style="color: red;">Chyba pri načítavaní dát: ' + error.message + '</p>';
        });
}

function displayDataInTable(data) {
    const container = document.getElementById('dataContainer');
    if (!container) return;

    const company = data.company;

    let html = '<h3>' + company.name + ' — ' + company.location + ' (založená ' + company.founded + ')</h3>';
    html += '<table><thead><tr>';
    html += '<th>Spoločnosť</th>';
    html += '<th>Zamestnanec</th>';
    html += '<th>Pozícia</th>';
    html += '<th>Plat (€)</th>';
    html += '<th>Projekty</th>';
    html += '</tr></thead><tbody>';

    if (company.employees && Array.isArray(company.employees)) {
        company.employees.forEach(employee => {
            html += '<tr>';
            html += `<td>${company.name}</td>`;
            html += `<td>${employee.name}</td>`;
            html += `<td>${employee.position}</td>`;
            html += `<td>${employee.salary}</td>`;

            if (employee.projects && Array.isArray(employee.projects)) {
                const projectList = employee.projects
                    .map(p => `${p.name} (${p.status}, ${p.budget} €)`)
                    .join('<br>');
                html += `<td>${projectList || '-'}</td>`;
            } else {
                html += '<td>-</td>';
            }

            html += '</tr>';
        });
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

