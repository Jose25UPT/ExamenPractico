# Gestión de Riesgos para Activos Digitales

## Descripción del Proyecto
Identificación y gestión automatizada de riesgos en activos digitales, que utiliza modelos de lenguaje avanzados ejecutados localmente. La herramienta proporciona:

- Generación automática de perfiles de riesgo
- Análisis de impactos potenciales
- Recomendaciones de mitigación alineadas con ISO 27001
- Interfaz intuitiva para gestión de casos

## Tecnologías Implementadas

### Frontend
- **React 18** con **Vite** (entorno de desarrollo rápido)
- **Ant Design** (biblioteca de componentes UI profesional)
- **Axios** (para comunicación con el backend)

### Backend
- **Flask** (servidor web ligero en Python)
- **Ollama** (infraestructura local para modelos LLM)
- **LangChain** (orquestación de prompts avanzados)
- **LLAMA3** (modelo de lenguaje para recomendaciones)

## Requisitos del Sistema

### Dependencias principales
- Visual Studio Code
- Node.js v18+ (para el frontend)
- Python 3.9+ (para el backend)
- Ollama instalado localmente
- Git (para clonar el repositorio)

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/OscarJimenezFlores/CursoAuditoria/tree/c1470d3bd4dbc65dd70a6231a5ba64f456126336/AuditoriaRiesgos
cd repositorio
```

### 2. Configuración del Frontend
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en: http://localhost:5173

### 3. Configuración del Backend

#### Para usuarios macOS
```bash
brew install ollama
ollama pull llama3
ollama run --port 11434
```

#### Para usuarios Windows

1. Descargar el instalador desde ollama.com (https://ollama.com)  
2. Ejecutar en PowerShell:

```bash
ollama run --port 11434
```
   Opcionalmente, puede verificar estado del servicio:
```bash
tasklist | findstr ollama
```

### 4. Iniciar el servidor Flask

```bash
python app.py
```
Nota: Si encuentras problemas con la versión de Python, prueba con:
```bash
python3.9 app.py
```

## Solución de Problemas Comunes

#### Ollama no responde

Verifica que el servicio esté ejecutándose en el puerto correcto (11434) y reinicia el servicio.

#### Errores de dependencias

Ejecuta:
```bash
npm ci --force  # Para frontend
pip install --upgrade -r requirements.txt  # Para backend
```

#### Problemas de compatibilidad

Asegúrate de tener instalado
- Node.js v18+
- Python 3.9+
- Ollama versión estable más reciente

#### Terminar Procesos en MAC terminal
```bash
# Para frontend (React)
pkill -f "npm run dev"

# Para backend (Flask)
pkill -f "python app.py"

# Para Ollama
pkill -f "ollama"
```

#### Terminar Procesos en Windows (VSCode/PowerShell)
```bash
# Para frontend
taskkill /F /IM node.exe

# Para backend
taskkill /F /IM python.exe

# Para Ollama
taskkill /F /IM ollama.exe
```


