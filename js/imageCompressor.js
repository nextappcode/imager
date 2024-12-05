export class ImageCompressor {
    static async compressWithoutQualityLoss(file) {
        // Configuración para compresión sin pérdida
        const options = {
            maxSizeMB: 10,
            useWebWorker: true,
            maxWidthOrHeight: 0, // Mantener dimensiones originales
            initialQuality: 1.0, // Calidad máxima
            alwaysKeepResolution: true,
            // Estrategias de compresión sin pérdida
            fileType: file.type,
            strict: true,
            // Optimizaciones específicas por formato
            preserveExif: true,
            stripExif: false,
            maxIteration: 5, // Intentos máximos de compresión
        };

        try {
            // Compresión inicial
            let compressedFile = await imageCompression(file, options);
            
            // Si el formato es PNG o TIFF, aplicar compresión específica sin pérdida
            if (file.type === 'image/png' || file.type === 'image/tiff') {
                options.lossless = true;
                compressedFile = await this.applyLosslessCompression(compressedFile);
            }

            // Verificar que no hubo pérdida de calidad
            if (await this.verifyImageQuality(file, compressedFile)) {
                // Solo devolver si el archivo comprimido es más pequeño
                return compressedFile.size < file.size ? compressedFile : file;
            }

            return file; // Devolver original si no se puede comprimir sin pérdida
        } catch (error) {
            console.error('Error en la compresión:', error);
            return file; // Devolver original en caso de error
        }
    }

    static async applyLosslessCompression(file) {
        // Implementar compresión sin pérdida específica por formato
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type });
        
        // Aquí podrías implementar algoritmos específicos de compresión sin pérdida
        // como DEFLATE para PNG o LZW para TIFF
        
        return new File([blob], file.name, { type: file.type });
    }

    static async verifyImageQuality(original, compressed) {
        // Verificar dimensiones
        const [origImg, compImg] = await Promise.all([
            createImageBitmap(original),
            createImageBitmap(compressed)
        ]);

        if (origImg.width !== compImg.width || origImg.height !== compImg.height) {
            return false;
        }

        // Verificar que los datos de píxeles sean idénticos
        const canvas = new OffscreenCanvas(origImg.width, origImg.height);
        const ctx = canvas.getContext('2d');

        // Comparar datos de píxeles del original
        ctx.drawImage(origImg, 0, 0);
        const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Comparar datos de píxeles del comprimido
        ctx.drawImage(compImg, 0, 0);
        const compressedData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Verificar que cada píxel sea idéntico
        return originalData.data.every((val, i) => val === compressedData.data[i]);
    }
} 