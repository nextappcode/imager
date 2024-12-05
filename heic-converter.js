// Elementos del DOM
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const formatSelect = document.getElementById('imageFormat');
const formatInfoDiv = document.querySelector('.format-info');

// Constantes para formatos soportados
const SUPPORTED_INPUT_FORMATS = {
    'heic': 'HEIC',
    'heif': 'HEIF',
    'jpg': 'JPEG',
    'jpeg': 'JPEG',
    'png': 'PNG',
    'webp': 'WEBP',
    'avif': 'AVIF',
    'tiff': 'TIFF',
    'tif': 'TIFF',
    'bmp': 'BMP',
    'gif': 'GIF',
    'ico': 'ICO'
};

// Información sobre los formatos
const formatInfo = {
    'PNG': 'Formato sin pérdida, ideal para imágenes con texto o gráficos. Soporta transparencia.',
    'JPEG': 'Mejor opción para fotografías, buen balance entre calidad y tamaño. Compresión con pérdida.',
    'WEBP': 'Formato moderno de Google, excelente compresión manteniendo calidad. Soporta transparencia y animación.',
    'AVIF': 'Nuevo formato con excelente compresión, calidad superior a WEBP. Soporte limitado en navegadores antiguos.',
    'TIFF': 'Formato profesional sin pérdida, ideal para edición y archivo. Soporta capas y alta profundidad de color.',
    'ICO': 'Formato para favicon de sitios web. Soporta múltiples tamaños en un archivo.',
    'BMP': 'Formato básico sin compresión, compatible con software antiguo.',
    'GIF': 'Soporta animaciones simples y transparencia. Limitado a 256 colores.'
};

// Configurar eventos de arrastrar y soltar
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.backgroundColor = '#f0f0f0';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.backgroundColor = '';
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Evento para selección de archivos mediante el input
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Evento para mostrar información del formato
formatSelect.addEventListener('change', () => {
    const selectedFormat = formatSelect.value;
    formatInfoDiv.textContent = formatInfo[selectedFormat];
});

// Mostrar información inicial del formato
formatInfoDiv.textContent = formatInfo[formatSelect.value];

async function handleFiles(files) {
    for (const file of files) {
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (SUPPORTED_INPUT_FORMATS[extension]) {
            await processFile(file);
        } else {
            mostrarError(`El archivo ${file.name} no tiene un formato soportado`);
        }
    }
}

async function processFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'heic' || extension === 'heif') {
        await convertFile(file);
    } else {
        await convertOtherFormat(file);
    }
}

async function convertFile(file) {
    const fileElement = document.createElement('div');
    fileElement.innerHTML = `
        <p>Convirtiendo: ${file.name}</p>
        <div class="progress-bar">
            <div class="progress-bar-fill"></div>
        </div>
        <div class="progress-text">Iniciando conversión...</div>
    `;
    fileList.insertBefore(fileElement, fileList.firstChild);

    const progressBar = fileElement.querySelector('.progress-bar-fill');
    const progressText = fileElement.querySelector('.progress-text');

    try {
        // Obtener el formato seleccionado
        const format = formatSelect.value;
        const mimeType = getMimeType(format);
        const extension = getExtension(format);

        // Ajustar calidad según el formato
        const quality = getQualityForFormat(format);

        // Convertir HEIC al formato seleccionado
        const blob = await heic2any({
            blob: file,
            toType: mimeType,
            quality: quality,
            // Opciones adicionales según el formato
            ...getFormatOptions(format),
            onProgress: (progress) => {
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `Progreso: ${Math.round(progress)}%`;
            }
        });

        progressBar.style.width = '100%';
        progressText.textContent = '✅ ¡Conversión completada!';

        // Crear y agregar el enlace de descarga
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        const newFileName = file.name.replace('.heic', `.${extension}`);
        
        downloadLink.href = url;
        downloadLink.download = newFileName;
        downloadLink.innerHTML = ` Descargar ${newFileName}`;
        downloadLink.style.color = '#0066cc';
        downloadLink.style.textDecoration = 'none';
        downloadLink.style.display = 'block';
        downloadLink.style.marginTop = '10px';
        
        fileElement.appendChild(downloadLink);

        // Liberar memoria cuando se descargue
        downloadLink.addEventListener('click', () => {
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        });

    } catch (error) {
        progressBar.style.backgroundColor = '#ff4444';
        progressText.textContent = `❌ Error: ${error.message}`;
        mostrarError(`Error al convertir ${file.name}: ${error.message}`, fileElement);
    }
}

// Funciones auxiliares para manejar formatos
function getMimeType(format) {
    const mimeTypes = {
        'PNG': 'image/png',
        'JPEG': 'image/jpeg',
        'WEBP': 'image/webp',
        'AVIF': 'image/avif',
        'TIFF': 'image/tiff',
        'BMP': 'image/bmp',
        'GIF': 'image/gif',
        'ICO': 'image/x-icon'
    };
    return mimeTypes[format] || 'image/png';
}

function getExtension(format) {
    const extensions = {
        'PNG': 'png',
        'JPEG': 'jpg',
        'WEBP': 'webp',
        'AVIF': 'avif',
        'TIFF': 'tiff',
        'BMP': 'bmp',
        'GIF': 'gif',
        'ICO': 'ico'
    };
    return extensions[format] || 'png';
}

function mostrarError(mensaje, elemento = null) {
    const errorElement = document.createElement('div');
    errorElement.innerHTML = `<p style="color: red;">❌ ${mensaje}</p>`;
    
    if (elemento) {
        const progressText = elemento.querySelector('.progress-text');
        if (progressText) {
            progressText.innerHTML = errorElement.innerHTML;
        } else {
            elemento.appendChild(errorElement);
        }
    } else {
        fileList.insertBefore(errorElement, fileList.firstChild);
    }
}

function getQualityForFormat(format) {
    const qualities = {
        'JPEG': 0.92,
        'WEBP': 0.85,
        'AVIF': 0.85,
        'PNG': 1,
        'TIFF': 1,
        'ICO': 0.95,
        'BMP': 1,
        'GIF': 1
    };
    return qualities[format] || 0.92;
}

function getFormatOptions(format) {
    const options = {
        'TIFF': {
            compression: 'lzw',
            quality: 100
        },
        'WEBP': {
            lossless: false,
            quality: 85,
            effort: 6,
            smartSubsample: true
        },
        'AVIF': {
            speed: 5,
            quality: 85,
            chromaSubsampling: '4:4:4'
        },
        'JPEG': {
            mozjpeg: true,
            chromaSubsampling: '4:4:4',
            quantization: 'scalar'
        },
        'PNG': {
            compressionLevel: 9,
            palette: false
        },
        'GIF': {
            colors: 256,
            dither: true
        },
        'ICO': {
            sizes: [16, 32, 48]
        }
    };
    return options[format] || {};
}

// Función para manejar errores de formato no soportado
function handleUnsupportedFormat(format, fileElement) {
    const mensaje = `El formato ${format} no está soportado en este navegador. 
                    Por favor, seleccione otro formato.`;
    mostrarError(mensaje, fileElement);
}

// Función para convertir otros formatos
async function convertOtherFormat(file) {
    const fileElement = createProgressElement(file);
    const progressBar = fileElement.querySelector('.progress-bar-fill');
    const progressText = fileElement.querySelector('.progress-text');

    try {
        // Crear un canvas para procesar la imagen
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Cargar la imagen
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });

        // Configurar el canvas con las dimensiones de la imagen
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Obtener el formato de salida seleccionado
        const format = formatSelect.value;
        const mimeType = getMimeType(format);
        const extension = getExtension(format);
        const quality = getQualityForFormat(format);

        // Convertir la imagen
        progressBar.style.width = '50%';
        progressText.textContent = 'Procesando imagen...';

        // Convertir canvas a blob
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, mimeType, quality);
        });

        // Crear enlace de descarga
        const url = URL.createObjectURL(blob);
        const newFileName = `${file.name.split('.')[0]}.${extension}`;
        
        createDownloadLink(fileElement, url, newFileName);
        
        progressBar.style.width = '100%';
        progressText.textContent = '✅ ¡Conversión completada!';

        // Limpiar recursos
        URL.revokeObjectURL(img.src);

    } catch (error) {
        handleConversionError(error, fileElement);
    }
}

// Función auxiliar para crear el elemento de progreso
function createProgressElement(file) {
    const fileElement = document.createElement('div');
    fileElement.className = 'file-item';
    fileElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="margin: 0;">
                <strong>${file.name}</strong>
                <span style="color: #666; font-size: 0.9em;">
                    (${formatFileSize(file.size)})
                </span>
            </p>
            <span class="status-badge"></span>
        </div>
        <div class="progress-bar">
            <div class="progress-bar-fill"></div>
        </div>
        <div class="progress-text">Iniciando conversión...</div>
    `;
    fileList.insertBefore(fileElement, fileList.firstChild);
    return fileElement;
}

// Función auxiliar para crear el enlace de descarga
function createDownloadLink(fileElement, url, fileName) {
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.className = 'download-btn';
    downloadLink.innerHTML = ` Descargar ${fileName}`;
    
    fileElement.appendChild(downloadLink);

    // Añadir animación de completado
    const statusBadge = fileElement.querySelector('.status-badge');
    statusBadge.innerHTML = '✅';
    statusBadge.style.color = 'var(--primary-color)';

    downloadLink.addEventListener('click', () => {
        setTimeout(() => URL.revokeObjectURL(url), 100);
    });
}

// Función para manejar errores de conversión
function handleConversionError(error, fileElement) {
    const progressBar = fileElement.querySelector('.progress-bar-fill');
    const progressText = fileElement.querySelector('.progress-text');
    const statusBadge = fileElement.querySelector('.status-badge');
    
    progressBar.style.backgroundColor = 'var(--error-color)';
    progressText.innerHTML = `
        <div class="error-message">
            ❌ Error: ${error.message}
        </div>
    `;
    statusBadge.innerHTML = '❌';
    statusBadge.style.color = 'var(--error-color)';
}

// Añadir efecto visual para el drag and drop
dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Añadir función para formatear el tamaño del archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 