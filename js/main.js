import { SUPPORTED_INPUT_FORMATS, FORMAT_INFO } from './config.js';
import { convertFile, convertOtherFormat } from './converter.js';
import { mostrarError } from './ui.js';
import { ImageCompressor } from './imageCompressor.js';

// Elementos del DOM
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const formatSelect = document.getElementById('imageFormat');
const formatInfoDiv = document.querySelector('.format-info');

// Configurar eventos
function setupEventListeners() {
    // Prevenir el comportamiento por defecto en todo el documento
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    // Event listeners para la zona de drop
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const dropText = dropZone.querySelector('p');
        const originalText = dropText.dataset.originalText || dropText.textContent;
        
        if (!dropText.dataset.originalText) {
            dropText.dataset.originalText = originalText;
        }

        if (e.dataTransfer.items) {
            const isValid = Array.from(e.dataTransfer.items).some(item => {
                if (item.kind === 'file') {
                    const extension = item.type.split('/')[1];
                    return SUPPORTED_INPUT_FORMATS[extension];
                }
                return false;
            });

            dropZone.classList.add('drag-over');
            if (!isValid) {
                dropZone.classList.add('not-allowed');
                dropText.textContent = '❌ Formato de archivo no soportado';
                e.dataTransfer.dropEffect = 'none';
            } else {
                dropZone.classList.remove('not-allowed');
                dropText.textContent = '✨ ¡Suelta para convertir!';
                e.dataTransfer.dropEffect = 'copy';
            }
        }
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dropZone.contains(e.relatedTarget)) {
            const dropText = dropZone.querySelector('p');
            dropZone.classList.remove('drag-over', 'not-allowed');
            dropText.textContent = dropText.dataset.originalText;
        }
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files).filter(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            return SUPPORTED_INPUT_FORMATS[extension];
        });

        if (files.length > 0) {
            handleFiles(files);
        } else {
            mostrarError('No se encontraron archivos con formatos soportados');
        }
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    formatSelect.addEventListener('change', () => {
        formatInfoDiv.textContent = FORMAT_INFO[formatSelect.value];
    });
}

// Inicializar la aplicación
function init() {
    setupEventListeners();
    formatInfoDiv.textContent = FORMAT_INFO[formatSelect.value];
}

// Manejar archivos
async function handleFiles(files) {
    for (const file of files) {
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (SUPPORTED_INPUT_FORMATS[extension]) {
            const format = formatSelect.value;
            if (extension === 'heic') {
                await convertFile(file, format, fileList);
            } else {
                await convertOtherFormat(file, format, fileList);
            }
        } else {
            mostrarError(`El archivo ${file.name} no tiene un formato soportado`);
        }
    }
}

async function processFile(file) {
    try {
        // Primero comprimir sin pérdida
        const compressedFile = await ImageCompressor.compressWithoutQualityLoss(file);
        
        // Luego continuar con la conversión
        const outputFormat = document.getElementById('imageFormat').value;
        // ... resto del código de procesamiento ...

        // Actualizar la UI para mostrar la reducción de tamaño
        const compressionRatio = ((1 - (compressedFile.size / file.size)) * 100).toFixed(2);
        if (compressionRatio > 0) {
            // Mostrar información de compresión en la UI
            const fileItem = document.querySelector(`[data-filename="${file.name}"]`);
            if (fileItem) {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'compression-info';
                infoDiv.textContent = `Compresión sin pérdida: ${compressionRatio}% de reducción`;
                fileItem.appendChild(infoDiv);
            }
        }

        // Continuar con el proceso de conversión
        return compressedFile;
    } catch (error) {
        console.error('Error en el procesamiento:', error);
        return file; // Devolver archivo original en caso de error
    }
}

// Iniciar la aplicación
init(); 