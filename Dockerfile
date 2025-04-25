FROM python:3.10-slim

WORKDIR /app

# Copiar arquivos de requisitos primeiro para aproveitar o cache do Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Criar diretório para armazenar dados dos clientes
RUN mkdir -p /data
VOLUME /data

# Copiar o restante dos arquivos da aplicação
COPY . .

# Definir variáveis de ambiente padrão
ENV ADMIN_PASSWORD=senha
ENV JWT_SECRET_KEY=chave_secreta_muito_segura_para_jwt
ENV RATE_LIMIT=100
ENV CLIENTS_FILE=/data/clients.json

# Expor a porta 5000
EXPOSE 5000

# Comando para iniciar a aplicação com Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
