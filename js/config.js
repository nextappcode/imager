// Configuraciones y constantes
const SUPPORTED_INPUT_FORMATS = {
    // Formatos HEIC/HEIF
    'heic': 'HEIC',
    'heif': 'HEIF',
    
    // Formatos comunes
    'jpg': 'JPEG',
    'jpeg': 'JPEG',
    'png': 'PNG',
    'webp': 'WEBP',
    'avif': 'AVIF',
    
    // Formatos especializados
    'tiff': 'TIFF',
    'tif': 'TIFF',
    'bmp': 'BMP',
    'gif': 'GIF',
    'ico': 'ICO'
};

const FORMAT_INFO = {
    'JPEG': 'Formato ideal para fotografías, excelente balance entre calidad y tamaño. Compatible universalmente.',
    'PNG': 'Formato sin pérdida, ideal para imágenes con texto o gráficos. Soporta transparencia.',
    'WEBP': 'Formato moderno de Google, excelente compresión manteniendo calidad. Soporta transparencia y animación.',
    'AVIF': 'Nuevo formato con excelente compresión, calidad superior a WEBP. Soporte limitado en navegadores antiguos.',
    'TIFF': 'Formato profesional sin pérdida, ideal para edición y archivo. Soporta capas y alta profundidad de color.',
    'ICO': 'Formato para favicon de sitios web. Soporta múltiples tamaños en un archivo.',
    'BMP': 'Formato básico sin compresión, compatible con software antiguo.',
    'GIF': 'Soporta animaciones simples y transparencia. Limitado a 256 colores.'
};

const FORMAT_OPTIONS = {
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
        quantization: 'scalar',
        quality: 92,
        optimizeScans: true
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

export { SUPPORTED_INPUT_FORMATS, FORMAT_INFO, FORMAT_OPTIONS }; 