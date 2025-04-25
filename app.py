import os
import json
import time
import datetime
import uuid
import jwt
from functools import wraps
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'senha_admin_segura')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'chave_secreta_muito_segura_para_jwt')
RATE_LIMIT = int(os.getenv('RATE_LIMIT', 100))
CLIENTS_FILE = os.getenv('CLIENTS_FILE', 'clients.json')

# Inicializar aplicação Flask
app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# Garantir que o arquivo de clientes existe
if not os.path.exists(CLIENTS_FILE):
    with open(CLIENTS_FILE, 'w') as f:
        json.dump({}, f)

# Funções auxiliares
def load_clients():
    try:
        with open(CLIENTS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}

def save_clients(clients):
    with open(CLIENTS_FILE, 'w') as f:
        json.dump(clients, f, indent=4)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def get_client_ip():
    if request.environ.get('HTTP_X_FORWARDED_FOR') is not None:
        return request.environ['HTTP_X_FORWARDED_FOR']
    else:
        return request.environ['REMOTE_ADDR']

# Rotas da API
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/docs')
def docs():
    with open('README.md', 'r') as f:
        content = f.read()
    return render_template('markdown.html', content=content)

@app.route('/integration')
def integration():
    with open('INTEGRACAO_CHATGPT.md', 'r') as f:
        content = f.read()
    return render_template('markdown.html', content=content)

@app.route('/api/status')
def status():
    return jsonify({
        'status': 'online',
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/validate', methods=['POST'])
def validate():
    # Verificar cabeçalho de API
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({
            'valid': False,
            'message': 'API key is required'
        }), 400
    
    # Carregar clientes
    clients = load_clients()
    
    # Verificar se o cliente existe
    if api_key not in clients:
        return jsonify({
            'valid': False,
            'message': 'Invalid API key'
        }), 401
    
    # Obter dados do cliente
    client = clients[api_key]
    current_date = datetime.datetime.now().strftime('%Y-%m-%d')
    
    # Verificar se o acesso é válido
    is_valid = client['limit_date'] >= current_date
    
    # Registrar uso
    if 'usage' not in client:
        client['usage'] = []
    
    client['usage'].append({
        'date': current_date,
        'timestamp': datetime.datetime.now().isoformat(),
        'ip': get_client_ip()
    })
    
    # Limitar o histórico de uso para os últimos 100 registros
    if len(client['usage']) > 100:
        client['usage'] = client['usage'][-100:]
    
    # Salvar alterações
    save_clients(clients)
    
    # Retornar resultado
    return jsonify({
        'valid': is_valid,
        'message': 'Access is valid' if is_valid else 'Access has expired',
        'client_id': client['client_id'],
        'limit_date': client['limit_date'],
        'current_date': current_date
    })

# Rotas de administração
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    password = request.headers.get('X-Admin-Password')
    
    if password != ADMIN_PASSWORD:
        return jsonify({'message': 'Invalid password'}), 401
    
    # Gerar token JWT
    expiration = datetime.datetime.now() + datetime.timedelta(days=1)
    token = jwt.encode({
        'exp': expiration
    }, JWT_SECRET_KEY, algorithm='HS256')
    
    return jsonify({
        'token': token,
        'expires': expiration.isoformat()
    })

@app.route('/api/admin/clients', methods=['GET'])
@token_required
def get_clients():
    clients = load_clients()
    return jsonify({'clients': clients})

@app.route('/api/admin/client/<api_key>', methods=['GET'])
@token_required
def get_client(api_key):
    clients = load_clients()
    
    if api_key not in clients:
        return jsonify({'message': 'Client not found'}), 404
    
    return jsonify({'client': clients[api_key]})

@app.route('/api/admin/client', methods=['POST'])
@token_required
def create_client():
    data = request.json
    clients = load_clients()
    
    api_key = data.get('api_key')
    client_id = data.get('client_id')
    limit_date = data.get('limit_date')
    notes = data.get('notes', '')
    
    if not api_key or not client_id or not limit_date:
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Criar ou atualizar cliente
    now = datetime.datetime.now().isoformat()
    
    if api_key in clients:
        clients[api_key].update({
            'client_id': client_id,
            'limit_date': limit_date,
            'notes': notes,
            'updated_at': now
        })
    else:
        clients[api_key] = {
            'client_id': client_id,
            'limit_date': limit_date,
            'notes': notes,
            'created_at': now,
            'updated_at': now,
            'usage': []
        }
    
    save_clients(clients)
    
    return jsonify({
        'message': 'Client saved successfully',
        'api_key': api_key
    })

@app.route('/api/admin/client/<api_key>', methods=['DELETE'])
@token_required
def delete_client(api_key):
    clients = load_clients()
    
    if api_key not in clients:
        return jsonify({'message': 'Client not found'}), 404
    
    del clients[api_key]
    save_clients(clients)
    
    return jsonify({'message': 'Client deleted successfully'})

@app.route('/api/admin/stats', methods=['GET'])
@token_required
def get_stats():
    clients = load_clients()
    current_date = datetime.datetime.now().strftime('%Y-%m-%d')
    
    total_clients = len(clients)
    active_clients = sum(1 for client in clients.values() if client['limit_date'] >= current_date)
    expired_clients = total_clients - active_clients
    
    total_usage = sum(len(client.get('usage', [])) for client in clients.values())
    
    return jsonify({
        'total_clients': total_clients,
        'active_clients': active_clients,
        'expired_clients': expired_clients,
        'total_usage': total_usage
    })

# Iniciar aplicação
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
