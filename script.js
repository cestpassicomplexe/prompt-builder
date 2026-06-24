document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const promptEditor = document.getElementById('prompt-editor');
    const editorToolbar = document.getElementById('editor-toolbar');
    const insertFieldDropdown = document.getElementById('insert-field-dropdown');
    const propertiesContent = document.getElementById('properties-content');
    const previewSection = document.getElementById('preview-section');
    const previewHeader = document.getElementById('preview-header');
    const previewContent = document.getElementById('preview-content');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const loadConfigBtn = document.getElementById('load-config-btn');
    const loadConfigInput = document.getElementById('load-config-input');
    const copyTextBtn = document.getElementById('copy-text-btn');
    const generateHtmlBtn = document.getElementById('generate-html-btn');
    const emojiPickerContainer = document.getElementById('emoji-picker-container');
    const emojiPicker = emojiPickerContainer.querySelector('emoji-picker');

    // Data Model
    let fieldCounter = 0;
    let fields = {}; // { fieldId: { type, label, options, etc. } }
    let selectedFieldId = null;

    // Initialize
    initializeApp();

    function initializeApp() {
        // Set default prompt content
        promptEditor.value = `Ceci est le **prompt principal**. Il est mis à jour en direct.

**Uniquement** ce texte sera copié côté utilisateur. Il doit donc contenir l'entièreté de votre prompt et des champs personnalisables.

Vous pouvez créer des champs personnalisables en utilisant le menu "Insérer un champ" ci-dessus.

**Exemple de prompt :**

**Rôle** : Vous êtes un expert en marketing digital.

**Tâche** : Créer une campagne publicitaire pour un produit.

**Contraintes** : Le ton doit être professionnel et engageant.`;

        updatePreview();
        setupEventListeners();
    }

    function setupEventListeners() {
        // Editor input
        promptEditor.addEventListener('input', () => {
            updatePreview();
        });

        // Editor click - detect field references
        promptEditor.addEventListener('click', () => {
            detectAndSelectFieldAtCursor();
        });

        // Editor keyboard navigation
        promptEditor.addEventListener('keyup', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
                detectAndSelectFieldAtCursor();
            }
        });

        // Toolbar buttons
        editorToolbar.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const format = button.dataset.format;
            if (!format) return;

            if (format === 'emoji') {
                emojiPickerContainer.style.display =
                    emojiPickerContainer.style.display === 'block' ? 'none' : 'block';
                return;
            }

            applyFormat(format);
        });

        // Emoji picker
        emojiPicker.addEventListener('emoji-click', (e) => {
            insertAtCursor(e.detail.unicode);
            emojiPickerContainer.style.display = 'none';
        });

        // Insert field dropdown
        insertFieldDropdown.addEventListener('change', (e) => {
            if (e.target.value) {
                insertField(e.target.value);
                e.target.value = '';
            }
        });

        // Preview toggle
        previewHeader.addEventListener('click', () => {
            previewSection.classList.toggle('collapsed');
        });

        // Save/Load
        saveConfigBtn.addEventListener('click', saveConfiguration);
        loadConfigBtn.addEventListener('click', () => loadConfigInput.click());
        loadConfigInput.addEventListener('change', loadConfiguration);

        // Copy/Export
        copyTextBtn.addEventListener('click', copyPromptText);
        generateHtmlBtn.addEventListener('click', generateHtml);
    }

    function detectAndSelectFieldAtCursor() {
        const cursorPos = promptEditor.selectionStart;
        const text = promptEditor.value;

        const fieldPattern = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
        let match;

        while ((match = fieldPattern.exec(text)) !== null) {
            const matchStart = match.index;
            const matchEnd = match.index + match[0].length;

            if (cursorPos >= matchStart && cursorPos <= matchEnd) {
                const fieldId = match[1];

                if (fields[fieldId]) {
                    selectField(fieldId);
                    return;
                }
            }
        }
    }

    function applyFormat(format) {
        const start = promptEditor.selectionStart;
        const end = promptEditor.selectionEnd;
        const selectedText = promptEditor.value.substring(start, end);
        let replacement = '';
        let cursorOffset = 0;

        switch (format) {
            case 'bold':
                replacement = `**${selectedText}**`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'italic':
                replacement = `*${selectedText}*`;
                cursorOffset = selectedText ? 0 : 1;
                break;
            case 'underline':
                replacement = `<u>${selectedText}</u>`;
                cursorOffset = selectedText ? 0 : 3;
                break;
            case 'url':
                const url = prompt("URL:");
                if (url) {
                    replacement = `[${selectedText || 'Texte du lien'}](${url})`;
                    cursorOffset = selectedText ? 0 : 1;
                }
                break;
            case 'bullet-list':
                if (selectedText) {
                    replacement = selectedText.split('\n').map(line => `* ${line}`).join('\n');
                } else {
                    replacement = '* ';
                    cursorOffset = 2;
                }
                break;
            case 'numbered-list':
                if (selectedText) {
                    replacement = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
                } else {
                    replacement = '1. ';
                    cursorOffset = 3;
                }
                break;
        }

        if (replacement || format === 'url') {
            promptEditor.setRangeText(replacement, start, end, 'end');
            if (cursorOffset && !selectedText) {
                promptEditor.selectionStart = promptEditor.selectionEnd = start + cursorOffset;
            }
            promptEditor.dispatchEvent(new Event('input', { bubbles: true }));
        }
        promptEditor.focus();
    }

    function insertAtCursor(text) {
        promptEditor.focus();
        const start = promptEditor.selectionStart;
        const end = promptEditor.selectionEnd;
        promptEditor.setRangeText(text, start, end, 'end');
        promptEditor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function insertField(type) {
        fieldCounter++;
        const fieldId = `${type.replace(/-/g, '')}${fieldCounter}`;

        const field = {
            type: type,
            label: getDefaultLabel(type),
            placeholder: '',
            required: false
        };

        switch (type) {
            case 'qcm':
            case 'checkbox':
            case 'dropdown':
                field.options = ['Option 1', 'Option 2'];
                break;
            case 'textarea':
                field.rows = 4;
                break;
            case 'number-input':
                field.min = '';
                field.max = '';
                field.step = '1';
                break;
            case 'range-input':
                field.min = '0';
                field.max = '100';
                field.step = '1';
                field.value = '50';
                break;
        }

        fields[fieldId] = field;

        const fieldRef = `{{${fieldId}}}`;
        insertAtCursor(fieldRef);
        selectField(fieldId);
    }

    function getDefaultLabel(type) {
        const labels = {
            'text-input': 'Nouveau champ texte',
            'number-input': 'Champ numérique',
            'url-input': 'Champ URL',
            'textarea': 'Zone de texte multi-lignes',
            'dropdown': 'Liste déroulante',
            'qcm': 'Question à choix unique',
            'checkbox': 'Cases à cocher',
            'range-input': 'Curseur'
        };
        return labels[type] || 'Nouveau champ';
    }

    function selectField(fieldId) {
        selectedFieldId = fieldId;
        renderPropertiesPanel();
    }

    function renderPropertiesPanel() {
        if (!selectedFieldId || !fields[selectedFieldId]) {
            propertiesContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hand-pointer"></i>
                    <p>Cliquez sur un champ dans l'éditeur pour voir ses propriétés</p>
                </div>`;
            return;
        }

        const field = fields[selectedFieldId];
        const typeColors = {
            'text-input': '#2196f3',
            'number-input': '#4caf50',
            'url-input': '#ff9800',
            'textarea': '#9c27b0',
            'dropdown': '#03a9f4',
            'qcm': '#e91e63',
            'checkbox': '#8bc34a',
            'range-input': '#673ab7'
        };

        let html = `
            <div class="property-group">
                <label>ID (non modifiable)</label>
                <div class="id-display">${selectedFieldId}</div>
            </div>
            <div class="property-group">
                <label>Type</label>
                <span class="type-badge" style="background-color: ${typeColors[field.type]}20; color: ${typeColors[field.type]}; border: 1px solid ${typeColors[field.type]};">
                    ${getDefaultLabel(field.type)}
                </span>
            </div>
            <div class="property-group">
                <label for="prop-label">Label / Question</label>
                <input type="text" id="prop-label" value="${field.label || ''}">
            </div>`;

        if (['text-input', 'textarea', 'number-input', 'url-input', 'dropdown'].includes(field.type)) {
            html += `
                <div class="property-group">
                    <label for="prop-placeholder">Texte indicatif (Placeholder)</label>
                    <input type="text" id="prop-placeholder" value="${field.placeholder || ''}">
                </div>`;
        }

        if (['qcm', 'checkbox', 'dropdown'].includes(field.type)) {
            html += `
                <div class="property-group">
                    <label for="prop-options">Options (une par ligne)</label>
                    <textarea id="prop-options" rows="5">${(field.options || []).join('\n')}</textarea>
                </div>`;
        }

        if (field.type === 'textarea') {
            html += `
                <div class="property-group">
                    <label for="prop-rows">Nombre de lignes initial</label>
                    <input type="number" id="prop-rows" value="${field.rows || 4}" min="1">
                </div>`;
        }

        if (field.type === 'number-input' || field.type === 'range-input') {
            html += `
                <div class="property-group">
                    <label for="prop-min">Valeur minimale</label>
                    <input type="number" id="prop-min" value="${field.min || ''}">
                </div>
                <div class="property-group">
                    <label for="prop-max">Valeur maximale</label>
                    <input type="number" id="prop-max" value="${field.max || ''}">
                </div>
                <div class="property-group">
                    <label for="prop-step">Pas (Step)</label>
                    <input type="number" id="prop-step" value="${field.step || '1'}" min="0.01">
                </div>`;
        }

        if (field.type === 'range-input') {
            html += `
                <div class="property-group">
                    <label for="prop-value">Valeur par défaut</label>
                    <input type="number" id="prop-value" value="${field.value || '50'}">
                </div>`;
        }

        if (['text-input', 'textarea', 'number-input', 'url-input', 'dropdown', 'qcm', 'checkbox'].includes(field.type)) {
            html += `
                <div class="property-group">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="prop-required" ${field.required ? 'checked' : ''}>
                        <label for="prop-required" style="margin: 0;">Champ requis</label>
                    </div>
                </div>`;
        }

        html += `
            <div class="property-group">
                <button class="delete-field">
                    <i class="fas fa-trash"></i> Supprimer ce champ
                </button>
            </div>`;

        propertiesContent.innerHTML = html;
        addPropertyListeners();
    }

    function addPropertyListeners() {
        const field = fields[selectedFieldId];
        if (!field) return;

        const labelInput = document.getElementById('prop-label');
        if (labelInput) {
            labelInput.addEventListener('input', (e) => {
                field.label = e.target.value;
                updatePreview();
            });
        }

        const placeholderInput = document.getElementById('prop-placeholder');
        if (placeholderInput) {
            placeholderInput.addEventListener('input', (e) => {
                field.placeholder = e.target.value;
                updatePreview();
            });
        }

        const optionsTextarea = document.getElementById('prop-options');
        if (optionsTextarea) {
            optionsTextarea.addEventListener('input', (e) => {
                field.options = e.target.value.split('\n').filter(opt => opt.trim());
                updatePreview();
            });
        }

        const rowsInput = document.getElementById('prop-rows');
        if (rowsInput) {
            rowsInput.addEventListener('input', (e) => {
                field.rows = e.target.value;
                updatePreview();
            });
        }

        ['min', 'max', 'step', 'value'].forEach(prop => {
            const input = document.getElementById(`prop-${prop}`);
            if (input) {
                input.addEventListener('input', (e) => {
                    field[prop] = e.target.value;
                    updatePreview();
                });
            }
        });

        const requiredCheckbox = document.getElementById('prop-required');
        if (requiredCheckbox) {
            requiredCheckbox.addEventListener('change', (e) => {
                field.required = e.target.checked;
                updatePreview();
            });
        }

        const deleteBtn = propertiesContent.querySelector('.delete-field');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Supprimer le champ "${field.label}" ?\n\nCela supprimera également toutes les références {{${selectedFieldId}}} dans le texte.`)) {
                    deleteField(selectedFieldId);
                }
            });
        }
    }

    function deleteField(fieldId) {
        delete fields[fieldId];
        const pattern = new RegExp(`\\{\\{${fieldId}\\}\\}`, 'g');
        promptEditor.value = promptEditor.value.replace(pattern, '');
        selectedFieldId = null;
        renderPropertiesPanel();
        updatePreview();
    }

    // MODIFIÉ : Utilisation d'un Set interne pour éviter la duplication des inputs de même ID et gestion dynamique du rappel des variables
    function updatePreview() {
        const savedValues = {};
        if (previewContent) {
            previewContent.querySelectorAll('input, select, textarea').forEach(el => {
                const name = el.name;
                if (!name) return;
                if (el.type === 'radio') {
                    if (el.checked) savedValues[name] = el.value;
                } else if (el.type === 'checkbox') {
                    if (el.checked) {
                        if (!savedValues[name]) savedValues[name] = [];
                        savedValues[name].push(el.value);
                    }
                } else {
                    savedValues[name] = el.value;
                }
            });
        }

        let content = promptEditor.value;
        const fieldPattern = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
        const renderedFields = new Set();

        content = content.replace(fieldPattern, (match, fieldId) => {
            if (!fields[fieldId]) {
                return `<span style="color: red; font-weight: bold;">[Champ inconnu: ${fieldId}]</span>`;
            }
            
            // Si c'est la première fois qu'on croise cette variable, on affiche le formulaire complet
            if (!renderedFields.has(fieldId)) {
                renderedFields.add(fieldId);
                return generateFieldHtml(fieldId, fields[fieldId]);
            } else {
                // Sinon, on affiche un indicateur visuel (badge) sans dupliquer l'input HTML
                return `<span class="field-recall" data-field-id="${fieldId}">[Rappel : ${fields[fieldId].label || fieldId}]</span>`;
            }
        });

        const html = DOMPurify.sanitize(marked.parse(content), { ADD_ATTR: ['data-field-id'] });

        if (html.trim()) {
            previewContent.innerHTML = html;
            
            // Restauration des valeurs précédemment saisies
            previewContent.querySelectorAll('input, select, textarea').forEach(el => {
                const name = el.name;
                if (!name || savedValues[name] === undefined) return;
                
                if (el.type === 'radio') {
                    if (el.value === savedValues[name]) el.checked = true;
                } else if (el.type === 'checkbox') {
                    if (Array.isArray(savedValues[name]) && savedValues[name].includes(el.value)) {
                        el.checked = true;
                    }
                } else {
                    el.value = savedValues[name];
                    if (el.type === 'range') {
                        const output = el.nextElementSibling;
                        if (output && output.tagName === 'OUTPUT') {
                            output.value = el.value;
                        }
                    }
                }
            });

            attachPreviewListeners();
        } else {
            previewContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-eye"></i>
                    <p>L'aperçu de votre prompt apparaîtra ici</p>
                </div>`;
        }
    }

    function generateFieldHtml(fieldId, field) {
        const name = fieldId;
        const label = field.label || fieldId;
        const placeholder = field.placeholder || '';
        const required = field.required ? 'required' : '';
        let html = '';

        switch (field.type) {
            case 'text-input':
                html = `<fieldset><legend>${label}</legend><input type="text" id="${name}_input" name="${name}" placeholder="${placeholder}" ${required}></fieldset>`;
                break;

            case 'number-input':
                const numMin = field.min ? `min="${field.min}"` : '';
                const numMax = field.max ? `max="${field.max}"` : '';
                const numStep = field.step ? `step="${field.step}"` : '';
                html = `<fieldset><legend>${label}</legend><input type="number" id="${name}_input" name="${name}" placeholder="${placeholder}" ${required} ${numMin} ${numMax} ${numStep}></fieldset>`;
                break;

            case 'url-input':
                html = `<fieldset><legend>${label}</legend><input type="url" id="${name}_input" name="${name}" placeholder="${placeholder}" ${required}></fieldset>`;
                break;

            case 'textarea':
                const rows = field.rows || 4;
                html = `<fieldset><legend>${label}</legend><textarea id="${name}_textarea" name="${name}" rows="${rows}" placeholder="${placeholder}" ${required}></textarea></fieldset>`;
                break;

            case 'dropdown':
                html = `<fieldset><legend>${label}</legend><select id="${name}_select" name="${name}" ${required}>`;
                if (placeholder) html += `<option value="" disabled selected>${placeholder}</option>`;
                (field.options || []).forEach(opt => {
                    html += `<option value="${opt}">${opt}</option>`;
                });
                html += `</select></fieldset>`;
                break;

            case 'qcm':
                html = `<fieldset><legend>${label}</legend>`;
                (field.options || []).forEach((opt, index) => {
                    html += `<div><input type="radio" id="${name}_${index}" name="${name}" value="${opt}" ${required}><label for="${name}_${index}" style="margin-left: 5px;">${opt}</label></div>`;
                });
                html += `</fieldset>`;
                break;

            case 'checkbox':
                html = `<fieldset><legend>${label}</legend>`;
                (field.options || []).forEach((opt, index) => {
                    html += `<div><input type="checkbox" id="${name}_${index}" name="${name}" value="${opt}" ${required}><label for="${name}_${index}" style="margin-left: 5px;">${opt}</label></div>`;
                });
                html += `</fieldset>`;
                break;

            case 'range-input':
                const min = field.min || '0';
                const max = field.max || '100';
                const step = field.step || '1';
                const value = field.value || '50';
                html = `<fieldset><legend>${label}</legend><div style="display:flex; align-items:center; gap:10px;"><input type="range" id="${name}_range" name="${name}" min="${min}" max="${max}" step="${step}" value="${value}" style="flex-grow:1;"><output>${value}</output></div></fieldset>`;
                break;
        }

        return html;
    }

    function attachPreviewListeners() {
        // Range inputs
        previewContent.querySelectorAll('input[type="range"]').forEach(range => {
            range.addEventListener('input', (e) => {
                const output = e.target.nextElementSibling;
                if (output && output.tagName === 'OUTPUT') {
                    output.value = e.target.value;
                }
            });
        });

        // Fonction pour mettre à jour les rappels d'une variable spécifique
        const updateRecallsForField = (fieldId) => {
            const field = fields[fieldId];
            if (!field) return;

            const elements = previewContent.querySelectorAll(`[name="${fieldId}"]`);
            if (elements.length === 0) return;

            let value = '';
            if (field.type === 'checkbox') {
                const checkedOpts = [];
                previewContent.querySelectorAll(`input[name="${fieldId}"]:checked`).forEach(cb => {
                    checkedOpts.push(cb.value);
                });
                value = checkedOpts.join(', ');
            } else if (field.type === 'qcm') {
                const checkedRadio = previewContent.querySelector(`input[name="${fieldId}"]:checked`);
                value = checkedRadio ? checkedRadio.value : '';
            } else {
                value = elements[0].value;
            }

            const recalls = previewContent.querySelectorAll(`.field-recall[data-field-id="${fieldId}"]`);
            recalls.forEach(recall => {
                if (value && value.trim() !== '') {
                    recall.textContent = value;
                    recall.classList.add('filled');
                } else {
                    recall.textContent = `[Rappel : ${field.label || fieldId}]`;
                    recall.classList.remove('filled');
                }
            });
        };

        // Ecouter les modifications de tous les champs de saisie de l'aperçu
        previewContent.querySelectorAll('input, select, textarea').forEach(el => {
            const name = el.name;
            if (!name) return;

            el.addEventListener('input', () => updateRecallsForField(name));
            el.addEventListener('change', () => updateRecallsForField(name));
        });

        // Initialiser l'affichage de tous les rappels au chargement de l'aperçu
        Object.keys(fields).forEach(fieldId => {
            updateRecallsForField(fieldId);
        });
    }

    function copyPromptText() {
        let content = promptEditor.value;

        const formData = {};
        previewContent.querySelectorAll('input, select, textarea').forEach(el => {
            const name = el.name;
            if (!name) return;

            if (el.type === 'radio') {
                if (el.checked) formData[name] = el.value;
            } else if (el.type === 'checkbox') {
                if (el.checked) {
                    formData[name] = formData[name] ? `${formData[name]}, ${el.value}` : el.value;
                }
            } else {
                formData[name] = el.value;
            }
        });

        const fieldPattern = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
        content = content.replace(fieldPattern, (match, fieldId) => {
            return formData[fieldId] !== undefined ? formData[fieldId] : match;
        });

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = DOMPurify.sanitize(marked.parse(content));
        const plainText = tempDiv.innerText || tempDiv.textContent || '';

        navigator.clipboard.writeText(plainText.trim())
            .then(() => alert('Texte du Prompt copié !'))
            .catch(err => alert('Erreur lors de la copie : ' + err));
    }

    function generateHtml() {
        updatePreview();

        const formHtml = previewContent.innerHTML;
        const scriptForExport = getScriptForExportedPage();
        const buttonHtml = `<button class="js-copy-prompt-btn copy-prompt-btn-exported">Je veux mon prompt</button>`;

        const fullPageHtml = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Formulaire Interactif</title><script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script><script src="https://cdn.jsdelivr.net/npm/dompurify@2.3.6/dist/purify.min.js"><\/script><style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 2em; background-color: #f4f4f4; } 
.container { max-width: 800px; margin: auto; background: white; padding: 2em; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius: 8px; } 
fieldset { border: 1px solid #ddd; padding: 1em; border-radius: 5px; margin-bottom: 15px; } 
legend { font-weight: bold; } 
select, input[type="text"], input[type="number"], input[type="url"], input[type="email"], textarea { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ccc; border-radius: 4px; margin-top: 5px; margin-bottom: 5px;} 
input[type="range"] { width: 100%; }
input[type="range"] + output { margin-left: 10px; font-weight: 500; } 
.field-recall { font-size:0.85em; background:#e0e0e0; color:#666; padding:2px 6px; border-radius:4px; border:1px dashed #bbb; display:inline-block; margin: 2px 0; transition: all 0.2s ease; }
.field-recall.filled { background:#e2f0d9 !important; color:#385723 !important; border-color:#c5e0b4 !important; border-style:solid !important; font-weight: bold; }
.copy-prompt-btn-exported { 
    display: block; 
    padding: 12px 25px; 
    font-size: 1.1em; 
    cursor: pointer; 
    background-color:#A22B6E; 
    color:white; 
    border:none; 
    border-radius:5px; 
    font-weight: bold;
    margin-left: auto; 
    margin-right: auto; 
    margin-top: 2em;
    margin-bottom: 2em;
}
.copy-prompt-btn-exported:hover { background-color: #8C235D; }
.container > .js-copy-prompt-btn.copy-prompt-btn-exported:first-of-type {
    margin-bottom: 2em;
}
.container > .js-copy-prompt-btn.copy-prompt-btn-exported:last-of-type {
    margin-top: 2em;
}
<\/style></head><body><div class="container">${buttonHtml}${formHtml}${buttonHtml}</div>${scriptForExport}</body></html>`;

        navigator.clipboard.writeText(fullPageHtml)
            .then(() => {
                alert('Le code HTML du formulaire complet a été copié ! Un aperçu va s\'ouvrir.');
                const blob = new Blob([fullPageHtml], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            })
            .catch(err => alert('Erreur lors de la copie du HTML : ' + err));
    }

    function getScriptForExportedPage() {
        const promptContent = promptEditor.value;
        const fieldsData = fields;

        return `<script>
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const copyBtns = document.querySelectorAll('.js-copy-prompt-btn');
    const promptContent = ${JSON.stringify(promptContent)};
    const fieldsData = ${JSON.stringify(fieldsData)};

    const getFormData = () => {
        const formData = {};
        container.querySelectorAll('input, select, textarea').forEach(el => {
            const name = el.name;
            if (!name) return;

            if (el.type === 'radio') {
                if (el.checked) formData[name] = el.value;
            } else if (el.type === 'checkbox') {
                if (el.checked) {
                    formData[name] = formData[name] ? formData[name] + ', ' + el.value : el.value;
                }
            } else {
                formData[name] = el.value;
            }
        });
        return formData;
    };

    container.querySelectorAll('input[type="range"]').forEach(range => {
        range.addEventListener('input', (e) => {
            const output = e.target.nextElementSibling;
            if (output && output.tagName === 'OUTPUT') {
                output.value = e.target.value;
            }
        });
    });

    const updateRecallsForField = (fieldId) => {
        const field = fieldsData[fieldId];
        if (!field) return;

        const elements = container.querySelectorAll('[name="' + fieldId + '"]');
        if (elements.length === 0) return;

        let value = '';
        if (field.type === 'checkbox') {
            const checkedOpts = [];
            container.querySelectorAll('input[name="' + fieldId + '"]:checked').forEach(cb => {
                checkedOpts.push(cb.value);
            });
            value = checkedOpts.join(', ');
        } else if (field.type === 'qcm') {
            const checkedRadio = container.querySelector('input[name="' + fieldId + '"]:checked');
            value = checkedRadio ? checkedRadio.value : '';
        } else {
            value = elements[0].value;
        }

        const recalls = container.querySelectorAll('.field-recall[data-field-id="' + fieldId + '"]');
        recalls.forEach(recall => {
            if (value && value.trim() !== '') {
                recall.textContent = value;
                recall.classList.add('filled');
            } else {
                recall.textContent = '[Rappel : ' + (field.label || fieldId) + ']';
                recall.classList.remove('filled');
            }
        });
    };

    container.querySelectorAll('input, select, textarea').forEach(el => {
        const name = el.name;
        if (!name) return;

        el.addEventListener('input', () => updateRecallsForField(name));
        el.addEventListener('change', () => updateRecallsForField(name));
    });

    Object.keys(fieldsData).forEach(fieldId => {
        updateRecallsForField(fieldId);
    });

    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const formData = getFormData();
            let content = promptContent;

            const fieldPattern = /\\{\\{([a-zA-Z0-9_-]+)\\}\\}/g;
            content = content.replace(fieldPattern, (match, fieldId) => {
                return formData[fieldId] !== undefined ? formData[fieldId] : match;
            });

            const tempDiv = document.createElement('div');
            if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
                tempDiv.innerHTML = DOMPurify.sanitize(marked.parse(content));
            } else {
                tempDiv.textContent = content;
            }
            const plainText = tempDiv.innerText || tempDiv.textContent || '';

            navigator.clipboard.writeText(plainText.trim())
                .then(() => alert('Le contenu du prompt a été copié !'))
                .catch(err => {
                    console.error("Erreur de copie du prompt:", err);
                    alert("Erreur de copie: " + err);
                });
        });
    });
});
<\/script>`;
    }

    function saveConfiguration() {
        const configuration = {
            version: 3,
            elementCounter: fieldCounter,
            promptContent: promptEditor.value,
            fields: fields
        };

        const jsonData = JSON.stringify(configuration, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
        a.download = `config-constructeur-${timestamp}.technopedia`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Configuration sauvegardée !');
    }

    function loadConfiguration(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const configuration = JSON.parse(e.target.result);

                if (configuration.version === 3) {
                    fieldCounter = configuration.elementCounter || 0;
                    promptEditor.value = configuration.promptContent || '';
                    fields = configuration.fields || {};
                } else {
                    migrateOldFormat(configuration);
                }

                selectedFieldId = null;
                renderPropertiesPanel();
                updatePreview();

                alert('Configuration chargée avec succès !');

            } catch (error) {
                console.error("Erreur lors du chargement de la configuration:", error);
                alert("Erreur lors du chargement du fichier de configuration : " + error.message);
            } finally {
                loadConfigInput.value = '';
            }
        };
        reader.readAsText(file);
    }

    function migrateOldFormat(oldConfig) {
        const promptItem = oldConfig.items?.find(item => item.isPrompt === 'true');
        if (promptItem) {
            promptEditor.value = promptItem.content || '';
        }

        fields = {};
        fieldCounter = oldConfig.elementCounter || 0;

        oldConfig.items?.forEach(item => {
            if (item.isPrompt === 'true') return;

            const fieldId = item.variableId;
            if (!fieldId) return;

            const field = {
                type: item.type,
                label: item.label || '',
                placeholder: item.placeholder || '',
                required: item.required === 'true'
            };

            if (item.options) {
                field.options = item.options.split(';').filter(Boolean);
            }
            if (item.rows) field.rows = item.rows;
            if (item.min !== undefined) field.min = item.min;
            if (item.max !== undefined) field.max = item.max;
            if (item.step !== undefined) field.step = item.step;
            if (item.value !== undefined) field.value = item.value;

            fields[fieldId] = field;
        });

        console.log('Migrated old format to new format');
    }
});