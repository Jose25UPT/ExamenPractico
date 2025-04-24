from openai import OpenAI
from flask import Flask, send_from_directory, request, jsonify
import re
import time

app = Flask(__name__, static_folder='dist')

# Configuración mejorada de Ollama con manejo de errores
try:
    client = OpenAI(
        base_url='http://localhost:11434/v1',
        api_key='ollama',  # Requerido pero no usado realmente
        timeout=60  # Aumentamos el timeout
    )
    # Verificación inicial de conexión
    client.models.list()
    print("✅ Conexión con Ollama establecida correctamente")
except Exception as e:
    print(f"❌ Error conectando a Ollama: {str(e)}")
    print("🔍 Asegúrate que Ollama esté corriendo: ejecuta 'ollama serve' en otra terminal")
    client = None

# Datos de ejemplo (puedes reemplazar con tu Anexo 1 completo)
ACTIVOS = [
    {"id": 1, "nombre": "Servidor de base de datos", "tipo": "Base de Datos"},
    {"id": 2, "nombre": "API Transacciones", "tipo": "Servicio Web"},
    # ... Agrega aquí los 50 activos de tu lista
    {"id": 50, "nombre": "Redundancia de Servidores", "tipo": "Infraestructura"}
]

# Rutas principales
@app.route('/')
def serve_index():
    return send_from_directory('dist', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('dist', filename)

# API Routes
@app.route('/api/activos', methods=['GET'])
def get_activos():
    return jsonify({"activos": ACTIVOS})

@app.route('/api/analizar', methods=['POST'])
def analizar_riesgos():
    if client is None:
        return jsonify({"error": "Ollama no está disponible"}), 503
        
    data = request.get_json()
    activo_id = data.get('activo_id')
    
    if not activo_id:
        return jsonify({"error": "Se requiere activo_id"}), 400
        
    activo = next((a for a in ACTIVOS if a["id"] == activo_id), None)
    if not activo:
        return jsonify({"error": "Activo no encontrado"}), 404

    try:
        riesgos, impactos = obtener_riesgos(activo["nombre"])
        return jsonify({
            "success": True,
            "activo": activo,
            "riesgos": riesgos,
            "impactos": impactos
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error al analizar riesgos"
        }), 500

# Funciones auxiliares
def obtener_riesgos(nombre_activo, intentos=3):
    for i in range(intentos):
        try:
            response = client.chat.completions.create(
                model="llama3.2",  # Asegúrate que coincida con tu modelo instalado
                messages=[
                    {
                        "role": "system",
                        "content": "Eres un experto en seguridad informática. Genera 3 riesgos para un activo tecnológico en formato: **Riesgo**: Descripción."
                    },
                    {
                        "role": "user",
                        "content": f"Analiza este activo: {nombre_activo}"
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            answer = response.choices[0].message.content
            riesgos_impactos = re.findall(r'\*\*(.+?)\*\*:\s*(.+?)(?=\n|$)', answer)
            
            if not riesgos_impactos:
                raise Exception("Formato de respuesta no reconocido")
                
            riesgos, impactos = zip(*riesgos_impactos)
            return list(riesgos)[:3], list(impactos)[:3]  # Limita a 3 riesgos
            
        except Exception as e:
            if i == intentos - 1:
                raise
            time.sleep(2)  # Espera antes de reintentar

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5500, debug=True)