"Crea un proyecto híbrido usando TypeScript y Python para un MCP que interactúe con Google Drive. El proyecto debe incluir:

1.  **Configuración inicial:**
    *   **Para TypeScript:**
        * Un archivo `package.json` con dependencias mínimas para TypeScript y Node.js
        * Configuración `tsconfig.json` estándar para un proyecto Node.js
    *   **Para Python:**
        * Un archivo `requirements.txt` con las dependencias necesarias incluyendo la API de Google Drive
        * Un entorno virtual de Python para aislar las dependencias
    *   Un archivo `.env` o similar para gestionar credenciales y variables de entorno de forma segura (ej. ID de cliente, secreto de cliente, URL de redirección)

2.  **Autenticación (implementada en Python):**
    *   Implementación del flujo de autenticación OAuth2 de Google usando la biblioteca `google-auth`. Esto implica:
        *   Obtener las credenciales de Google Cloud (ID de cliente, secreto de cliente)
        *   Crear una URL de autorización para que el usuario dé permiso
        *   Manejar el callback de autorización para intercambiar el código por tokens de acceso y refresco
        *   Almacenar los tokens de forma persistente (ej. en un archivo local o una base de datos simple) para futuras sesiones

3.  **Funcionalidad básica de Google Drive (implementada en Python):**
    *   **Subir un archivo:** Una función que permita subir un archivo desde una ruta local a Google Drive
    *   **Listar archivos:** Una función para listar los archivos (o al menos un subconjunto) en la carpeta raíz del usuario
    *   **Descargar un archivo:** Una función que permita descargar un archivo específico de Google Drive a una ruta local
    *   **API REST:** Exponer estas funcionalidades a través de una API REST que el servidor TypeScript pueda consumir

4.  **Estructura del código:**
    *   **Componente TypeScript (MCP Server):**
        * Módulos para el servidor MCP (`server.ts`, `types.ts`, `config.ts`)
        * Interfaz para comunicación con el componente Python
    *   **Componente Python (Google Drive Operations):**
        * Módulos para operaciones de Google Drive (`auth.py`, `drive.py`, `utils.py`)
        * Interfaz para comunicación con el servidor TypeScript
    *   Uso de `async/await` en ambos lenguajes para operaciones asíncronas
    *   Manejo robusto de errores en ambas partes

5.  **Instrucciones de uso:**
    *   Un archivo `README.md` que explique:
        * Configuración de credenciales de Google Cloud
        * Instalación de dependencias de TypeScript y Python
        * Configuración del entorno virtual de Python
        * Pasos para ejecutar tanto el servidor MCP como el componente Python"