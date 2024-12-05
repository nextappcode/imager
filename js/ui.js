import { formatFileSize } from './utils.js';

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
    return fileElement;
}

function createDownloadLink(fileElement, url, fileName) {
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.className = 'download-btn';
    downloadLink.innerHTML = ` Descargar ${fileName}`;
    
    fileElement.appendChild(downloadLink);

    const statusBadge = fileElement.querySelector('.status-badge');
    statusBadge.innerHTML = '✅';
    statusBadge.style.color = 'var(--primary-color)';

    downloadLink.addEventListener('click', () => {
        setTimeout(() => URL.revokeObjectURL(url), 100);
    });
}

function mostrarError(mensaje, elemento = null) {
    const errorElement = document.createElement('div');
    errorElement.innerHTML = `
        <div class="error-message">
            ❌ ${mensaje}
        </div>
    `;
    
    if (elemento) {
        const progressText = elemento.querySelector('.progress-text');
        if (progressText) {
            progressText.innerHTML = errorElement.innerHTML;
        } else {
            elemento.appendChild(errorElement);
        }
    }
    return errorElement;
}

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

export { 
    createProgressElement, 
    createDownloadLink, 
    mostrarError, 
    handleConversionError 
}; 