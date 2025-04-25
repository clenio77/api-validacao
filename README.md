# API de Validação de Acesso por Data

Esta API permite validar o acesso de clientes com base em uma data limite. Ela foi desenvolvida especificamente para integração com agentes inteligentes do ChatGPT, permitindo verificar se um cliente ainda tem acesso válido ao serviço.

## Índice

1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Endpoints da API](#endpoints-da-api)
5. [Autenticação](#autenticação)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Integração com ChatGPT](#integração-com-chatgpt)
8. [Segurança](#segurança)
9. [Implantação](#implantação)

## Visão Geral

A API de Validação de Acesso é uma solução simples e eficaz para validar se um cliente tem acesso válido com base em uma data limite. Ela utiliza chaves de API para identificar os clientes e verifica se a data atual é anterior à data limite configurada para cada cliente.

Principais características:
- Validação de acesso baseada em data
- Autenticação via chaves de API
- Painel administrativo protegido por JWT
- Rate limiting para evitar abusos
- Registro de uso para auditoria
- Armazenamento simples em JSON

## Instalação

### Pré-requisitos
- Python 3.6 ou superior
- pip (gerenciador de pacotes Python)

### Passos para instalação

1. Clone o repositório ou baixe os arquivos da API:
```bash
git clone https://github.com/seu-usuario/api-validador.git
cd api-validador
```

2. Instale as dependências:
```bash
pip install flask flask-cors python-dotenv pyjwt
```

## Configuração

1. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
ADMIN_PASSWORD=sua_senha_admin_segura
JWT_SECRET_KEY=sua_chave_secreta_jwt_muito_segura
RATE_LIMIT=100
```

2. Ajuste as configurações conforme necessário:
   - `ADMIN_PASSWORD`: Senha para acesso administrativo
   - `JWT_SECRET_KEY`: Chave secreta para geração de tokens JWT
   - `RATE_LIMIT`: Limite de requisições por hora por cliente

## Endpoints da API

### Público

#### `GET /status`
Verifica o status da API.

**Resposta:**
```json
{
  "status": "online",
  "timestamp": "2025-04-23T14:11:50.076202"
}
```

#### `POST /validate`
Valida se um cliente tem acesso válido com base na data limite.

**Headers:**
- `X-API-Key`: Chave de API do cliente (obrigatório)

**Body:**
```json
{
  "request_data": "dados opcionais"
}
```

**Resposta (acesso válido):**
```json
{
  "valid": true,
  "message": "Access is valid",
  "client_id": "Cliente Teste",
  "limit_date": "2025-12-31",
  "current_date": "2025-04-23"
}
```

**Resposta (acesso expirado):**
```json
{
  "valid": false,
  "message": "Access has expired",
  "client_id": "Cliente Expirado",
  "limit_date": "2023-12-31",
  "current_date": "2025-04-23"
}
```

### Administrativo

#### `POST /admin/login`
Obtém um token JWT para acesso às funcionalidades administrativas.

**Headers:**
- `X-Admin-Password`: Senha de administrador (obrigatório)

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires": "2025-04-24T18:12:01.226589"
}
```

#### `POST /admin/client`
Adiciona ou atualiza um cliente.

**Headers:**
- `Authorization`: Bearer token JWT (obrigatório)

**Body:**
```json
{
  "api_key": "cliente_teste_123",
  "client_id": "Cliente Teste",
  "limit_date": "2025-12-31",
  "notes": "Cliente para testes"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Client added or updated successfully",
  "client": {
    "client_id": "Cliente Teste",
    "created_at": "2025-04-23T14:12:01.236986",
    "limit_date": "2025-12-31",
    "notes": "Cliente para testes",
    "updated_at": "2025-04-23T14:12:01.236995"
  }
}
```

#### `GET /admin/clients`
Lista todos os clientes cadastrados.

**Headers:**
- `Authorization`: Bearer token JWT (obrigatório)

**Resposta:**
```json
{
  "clients": {
    "cliente_teste_123": {
      "client_id": "Cliente Teste",
      "created_at": "2025-04-23T14:12:01.236986",
      "limit_date": "2025-12-31",
      "notes": "Cliente para testes",
      "updated_at": "2025-04-23T14:12:01.236995"
    },
    "cliente_expirado": {
      "client_id": "Cliente Expirado",
      "created_at": "2025-04-23T14:12:31.123456",
      "limit_date": "2023-12-31",
      "notes": "Cliente com data expirada",
      "updated_at": "2025-04-23T14:12:31.123456"
    }
  }
}
```

#### `GET /admin/client/<api_key>`
Obtém detalhes de um cliente específico.

**Headers:**
- `Authorization`: Bearer token JWT (obrigatório)

**Resposta:**
```json
{
  "client": {
    "client_id": "Cliente Teste",
    "created_at": "2025-04-23T14:12:01.236986",
    "limit_date": "2025-12-31",
    "notes": "Cliente para testes",
    "updated_at": "2025-04-23T14:12:01.236995",
    "usage": [
      {
        "date": "2025-04-23",
        "timestamp": "2025-04-23T14:12:17.123456",
        "ip": "127.0.0.1"
      }
    ]
  }
}
```

#### `DELETE /admin/client/<api_key>`
Remove um cliente.

**Headers:**
- `Authorization`: Bearer token JWT (obrigatório)

**Resposta:**
```json
{
  "success": true,
  "message": "Client removed successfully"
}
```

## Autenticação

### Autenticação de Cliente
A autenticação de cliente é feita através de chaves de API, que devem ser enviadas no header `X-API-Key` em cada requisição ao endpoint `/validate`.

### Autenticação de Administrador
A autenticação de administrador é feita em duas etapas:

1. Obtenção do token JWT através do endpoint `/admin/login` com a senha de administrador no header `X-Admin-Password`.
2. Uso do token JWT no header `Authorization` com o prefixo `Bearer` para acessar os endpoints administrativos.

## Exemplos de Uso

### Validação de Acesso (Python)
```python
import requests

# Configuração
api_url = "https://sua-api.exemplo.com"
api_key = "cliente_teste_123"

# Validar acesso
response = requests.post(
    f"{api_url}/validate",
    headers={"X-API-Key": api_key},
    json={"request_data": "dados opcionais"}
)

# Verificar resultado
if response.status_code == 200:
    result = response.json()
    if result["valid"]:
        print(f"Acesso válido até {result['limit_date']}")
    else:
        print(f"Acesso expirado em {result['limit_date']}")
else:
    print(f"Erro: {response.status_code} - {response.text}")
```

### Gerenciamento de Clientes (Python)
```python
import requests

# Configuração
api_url = "https://sua-api.exemplo.com"
admin_password = "sua_senha_admin_segura"

# Login de administrador
login_response = requests.post(
    f"{api_url}/admin/login",
    headers={"X-Admin-Password": admin_password}
)

if login_response.status_code == 200:
    token = login_response.json()["token"]
    auth_header = {"Authorization": f"Bearer {token}"}
    
    # Adicionar novo cliente
    new_client = {
        "api_key": "novo_cliente_456",
        "client_id": "Novo Cliente",
        "limit_date": "2026-06-30",
        "notes": "Cliente premium"
    }
    
    add_response = requests.post(
        f"{api_url}/admin/client",
        headers=auth_header,
        json=new_client
    )
    
    print(f"Cliente adicionado: {add_response.status_code}")
    print(add_response.json())
    
    # Listar todos os clientes
    list_response = requests.get(
        f"{api_url}/admin/clients",
        headers=auth_header
    )
    
    print("Lista de clientes:")
    print(list_response.json())
else:
    print(f"Erro no login: {login_response.status_code} - {login_response.text}")
```

## Integração com ChatGPT

Para integrar esta API com agentes inteligentes do ChatGPT, você precisa configurar seu agente para fazer uma chamada à API de validação antes de fornecer o serviço ao cliente.

### Exemplo de Integração

1. **Configuração do Agente:**
   - Crie um agente personalizado no ChatGPT
   - Configure as instruções para incluir a verificação de acesso

2. **Exemplo de Código para Integração:**

```javascript
// Exemplo de código para integração com ChatGPT (Node.js)
const axios = require('axios');

async function validateAccess(apiKey) {
  try {
    const response = await axios.post(
      'https://sua-api.exemplo.com/validate',
      { request_data: 'ChatGPT Agent Access' },
      { headers: { 'X-API-Key': apiKey } }
    );
    
    return response.data;
  } catch (error) {
    console.error('Erro na validação:', error.response?.data || error.message);
    return { valid: false, message: 'Erro na validação de acesso' };
  }
}

// Função para uso no agente do ChatGPT
async function handleUserRequest(apiKey, userRequest) {
  // Validar acesso do cliente
  const accessValidation = await validateAccess(apiKey);
  
  if (!accessValidation.valid) {
    return {
      message: `Desculpe, seu acesso expirou em ${accessValidation.limit_date}. Por favor, renove sua assinatura para continuar utilizando o serviço.`
    };
  }
  
  // Se o acesso for válido, continue com o processamento normal
  return {
    message: `Bem-vindo! Seu acesso é válido até ${accessValidation.limit_date}. Como posso ajudar hoje?`,
    // Processar a solicitação do usuário...
  };
}
```

3. **Instruções para o Agente do ChatGPT:**

```
Antes de responder a qualquer solicitação do usuário, você deve:
1. Obter a chave de API do usuário (pode ser fornecida no início da conversa ou armazenada em um sistema externo)
2. Fazer uma chamada à API de validação em https://sua-api.exemplo.com/validate com a chave de API
3. Verificar se o acesso é válido (valid: true)
4. Se o acesso for válido, continue normalmente
5. Se o acesso estiver expirado, informe ao usuário e solicite renovação

Exemplo de resposta para acesso expirado:
"Desculpe, seu acesso expirou em [data_limite]. Por favor, entre em contato com [seu_contato] para renovar sua assinatura."
```

## Segurança

A API implementa várias medidas de segurança:

1. **Autenticação por Chave de API:** Cada cliente possui uma chave de API única.
2. **Autenticação JWT para Administração:** Endpoints administrativos são protegidos por tokens JWT.
3. **Rate Limiting:** Limita o número de requisições por cliente para evitar abusos.
4. **Registro de Uso:** Mantém um histórico das últimas 100 validações para cada cliente.
5. **Variáveis de Ambiente:** Senhas e chaves secretas são armazenadas em variáveis de ambiente.

## Implantação

### Implantação Local (Desenvolvimento)

Para executar a API localmente:

```bash
python app.py
```

A API estará disponível em `http://localhost:5000`.

### Implantação em Produção

Para implantação em produção, recomenda-se:

1. Usar um servidor WSGI como Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

2. Configurar um proxy reverso como Nginx:
```nginx
server {
    listen 80;
    server_name sua-api.exemplo.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. Configurar HTTPS com Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d sua-api.exemplo.com
```

4. Usar um serviço de gerenciamento de processos como Supervisor:
```ini
[program:api_validador]
command=/path/to/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
directory=/path/to/api_validador
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/api_validador/error.log
stdout_logfile=/var/log/api_validador/access.log
```

5. Configurar um firewall:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
