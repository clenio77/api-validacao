#!/bin/bash
# Script de implantação para a API de Validação de Acesso

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Por favor, instale o Docker antes de continuar."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose não encontrado. Por favor, instale o Docker Compose antes de continuar."
    exit 1
fi

# Criar diretório de dados se não existir
mkdir -p data

# Verificar se o arquivo clients.json existe, se não, criar um vazio
if [ ! -f "data/clients.json" ]; then
    echo "{}" > data/clients.json
    echo "Arquivo clients.json criado com sucesso."
fi

# Parar contêineres existentes
echo "Parando contêineres existentes..."
docker-compose down

# Construir e iniciar os contêineres
echo "Construindo e iniciando os contêineres..."
docker-compose up -d --build

# Verificar se os contêineres estão rodando
echo "Verificando status dos contêineres..."
docker-compose ps

echo "Implantação concluída com sucesso!"
echo "A API está disponível em: http://localhost:5000"
echo ""
echo "Para acessar o painel administrativo, use a senha definida no arquivo docker-compose.yml"
echo "Para parar a aplicação, execute: docker-compose down"
