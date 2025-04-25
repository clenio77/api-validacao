#!/bin/bash
# Script de inicialização para a API de Validação de Acesso

# Verificar se o ambiente virtual existe
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
echo "Instalando dependências..."
pip install -r requirements.txt

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "Criando arquivo .env padrão..."
    echo "ADMIN_PASSWORD=senha_admin_segura" > .env
    echo "JWT_SECRET_KEY=chave_secreta_muito_segura_para_jwt" >> .env
    echo "RATE_LIMIT=100" >> .env
    echo "ATENÇÃO: Edite o arquivo .env com suas configurações seguras!"
fi

# Iniciar a API com Gunicorn
echo "Iniciando a API..."
gunicorn -w 4 -b 0.0.0.0:5000 app:app
