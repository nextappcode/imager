// Lógica de conversión de imágenes
import { FORMAT_OPTIONS } from './config.js';
import { getMimeType, getExtension } from './utils.js';
import { createProgressElement, createDownloadLink, handleConversionError } from './ui.js';

// Función para procesar formatos RAW
async function processRawFormat(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const rawProcessor = new LibRaw();
                await rawProcessor.load(new Uint8Array(e.target.result));
                const processed = await rawProcessor.toRGB();
                const canvas = document.createElement('canvas');
                canvas.width = processed.width;
                canvas.height = processed.height;
                const ctx = canvas.getContext('2d');
                ctx.putImageData(new ImageData(processed.data, processed.width, processed.height), 0, 0);
                
                canvas.toBlob(resolve, 'image/jpeg', 0.95);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Función para procesar TIFF
async function processTiffFormat(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const buffer = e.target.result;
                const ifds = UTIF.decode(buffer);
                UTIF.decodeImage(buffer, ifds[0]);
                const rgba = UTIF.toRGBA8(ifds[0]);
                
                const canvas = document.createElement('canvas');
                canvas.width = ifds[0].width;
                canvas.height = ifds[0].height;
                const ctx = canvas.getContext('2d');
                const imgData = new ImageData(new Uint8ClampedArray(rgba), canvas.width, canvas.height);
                ctx.putImageData(imgData, 0, 0);
                
                canvas.toBlob(resolve, 'image/png', 1.0);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function convertFile(file, format, fileList) {
    const fileElement = createProgressElement(file);
    fileList.insertBefore(fileElement, fileList.firstChild);

    const progressBar = fileElement.querySelector('.progress-bar-fill');
    const progressText = fileElement.querySelector('.progress-text');

    try {
        // Procesar según el formato de entrada
        let processedFile = file;
        const extension = file.name.split('.').pop().toLowerCase();

        // Convertir HEIC/HEIF
        if (['heic', 'heif'].includes(extension)) {
            const blob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.92
            });
            processedFile = new File([blob], file.name.replace(extension, 'jpg'), { type: 'image/jpeg' });
        }
        // Procesar formatos RAW
        else if (['cr2', 'nef', 'arw', 'orf', 'raf', 'rw2', 'dng', 'pef'].includes(extension)) {
            const blob = await processRawFormat(file);
            processedFile = new File([blob], file.name.replace(extension, 'jpg'), { type: 'image/jpeg' });
        }
        // Procesar TIFF
        else if (['tiff', 'tif'].includes(extension)) {
            const blob = await processTiffFormat(file);
            processedFile = new File([blob], file.name.replace(extension, 'png'), { type: 'image/png' });
        }

        // Configurar opciones de compresión
        const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 8192,
            useWebWorker: true,
            fileType: getMimeType(format).split('/')[1],
            initialQuality: 0.92,
            alwaysKeepResolution: true,
            onProgress: (progress) => {
                progressBar.style.width = `${progress * 100}%`;
                progressText.textContent = `Progreso: ${Math.round(progress * 100)}%`;
            }
        };

        // Comprimir y convertir la imagen
        const compressedFile = await imageCompression(processedFile, options);

        // Crear el nuevo nombre de archivo y mostrar resultado
        const outputExtension = getExtension(format);
        const newFileName = file.name.replace(/\.[^/.]+$/, `.${outputExtension}`);
        
        const url = URL.createObjectURL(compressedFile);
        createDownloadLink(fileElement, url, newFileName);

        // Mostrar estadísticas
        const originalSize = (file.size / (1024 * 1024)).toFixed(2);
        const newSize = (compressedFile.size / (1024 * 1024)).toFixed(2);
        progressText.innerHTML = `
            ✅ Conversión completada<br>
            📊 Tamaño original: ${originalSize}MB<br>
            📊 Nuevo tamaño: ${newSize}MB<br>
            🎯 Reducción: ${Math.round((1 - compressedFile.size/file.size) * 100)}%
        `;

    } catch (error) {
        handleConversionError(error, fileElement);
    }
}

async function convertOtherFormat(file, format, fileList) {
    const fileElement = createProgressElement(file);
    fileList.insertBefore(fileElement, fileList.firstChild);

    try {
        // Configurar opciones de compresión
        const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 8192,
            useWebWorker: true,
            fileType: getMimeType(format).split('/')[1],
            initialQuality: 0.92,
            alwaysKeepResolution: true,
            onProgress: (progress) => {
                fileElement.querySelector('.progress-bar-fill').style.width = `${progress * 100}%`;
                fileElement.querySelector('.progress-text').textContent = 
                    `Progreso: ${Math.round(progress * 100)}%`;
            }
        };

        // Comprimir y convertir la imagen
        const compressedFile = await imageCompression(file, options);

        // Crear el nuevo nombre de archivo
        const extension = getExtension(format);
        const newFileName = file.name.replace(/\.[^/.]+$/, `.${extension}`);

        // Crear el enlace de descarga
        const url = URL.createObjectURL(compressedFile);
        createDownloadLink(fileElement, url, newFileName);

        // Mostrar información del resultado
        const originalSize = (file.size / (1024 * 1024)).toFixed(2);
        const newSize = (compressedFile.size / (1024 * 1024)).toFixed(2);
        fileElement.querySelector('.progress-text').innerHTML = `
            ✅ Conversión completada<br>
            📊 Tamaño original: ${originalSize}MB<br>
            📊 Nuevo tamaño: ${newSize}MB<br>
            🎯 Reducción: ${Math.round((1 - compressedFile.size/file.size) * 100)}%
        `;

    } catch (error) {
        handleConversionError(error, fileElement);
    }
}

export { convertFile, convertOtherFormat }; 