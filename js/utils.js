// Funciones utilitarias
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

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export { getMimeType, getExtension, getQualityForFormat, formatFileSize }; 