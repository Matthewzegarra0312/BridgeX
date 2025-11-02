import winston from 'winston';
// Crear el logger de Winston
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
    defaultMeta: { service: 'agent-reportes' },
    transports: [
        // Escribir logs a archivo
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB  
            maxFiles: 5,
        }),
    ],
});
// Si no estamos en producción, también logear a la consola
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    }));
}
// Función helper para logging estructurado
export const logWithContext = (level, message, context) => {
    logger.log(level, message, context);
};
// Funciones específicas para diferentes tipos de logs
export const logError = (message, error, context) => {
    logger.error(message, {
        error: error ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
        } : undefined,
        ...context,
    });
};
export const logInfo = (message, context) => {
    logger.info(message, context);
};
export const logWarn = (message, context) => {
    logger.warn(message, context);
};
export const logDebug = (message, context) => {
    logger.debug(message, context);
};
//# sourceMappingURL=logger.js.map