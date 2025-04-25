# Guia de Acesso e Manutenção da API Validador

## Informações de Acesso

### Versão Temporária (Completa)
- **URL**: https://5000-igege0rfo4s14n6abtqsn-38d8bd83.manus.computer/
- **Senha de Administrador**: senha_admin_segura
- **Status**: Totalmente funcional com backend e frontend
- **Limitação**: Disponível apenas enquanto a sessão atual estiver ativa

### Versão Permanente (Apenas Frontend)
- **URL**: https://uhwuogsa.manus.space
- **Status**: Apenas interface de usuário, sem backend
- **Limitação**: Não é possível autenticar ou gerenciar clientes nesta versão

## Opções para Solução Permanente Completa

### Opção 1: Implantar em Servidor Próprio (Recomendado)
Siga estas instruções para implantar a API completa em seu próprio servidor:

1. **Pré-requisitos**:
   - Servidor Linux com Docker e Docker Compose instalados
   - Acesso SSH ao servidor

2. **Passos para Implantação**:
   - Copie todos os arquivos do diretório `/home/ubuntu/api_validador` para seu servidor
   - Execute o script de implantação:
     ```bash
     chmod +x deploy.sh
     ./deploy.sh
     ```
   - A API estará disponível em: `http://seu-servidor:5000`

3. **Configuração de Segurança**:
   - Edite o arquivo `.env` para alterar:
     - `ADMIN_PASSWORD`: Defina uma senha forte
     - `JWT_SECRET_KEY`: Altere para uma chave secreta única
   - Reinicie o contêiner após as alterações:
     ```bash
     docker-compose down
     docker-compose up -d
     ```

### Opção 2: Implantar Backend Separadamente
Se desejar manter o frontend na URL permanente atual:

1. **Implante o Backend**:
   - Siga as instruções da Opção 1 para implantar apenas o backend
   - Configure CORS para permitir solicitações do domínio do frontend

2. **Configure o Frontend**:
   - Atualize o frontend para apontar para a URL do seu backend
   - Reimplante o frontend atualizado

## Manutenção e Backup

### Backup de Dados
Os dados dos clientes são armazenados em `data/clients.json`. Para fazer backup:

```bash
# Backup manual
cp data/clients.json data/clients_backup_$(date +%Y%m%d).json

# Backup automatizado (adicione ao crontab)
0 0 * * * cp /caminho/para/data/clients.json /caminho/para/backups/clients_$(date +\%Y\%m\%d).json
```

### Atualização da Aplicação
Para atualizar a aplicação após modificações:

```bash
# Parar contêineres
docker-compose down

# Reconstruir e iniciar
docker-compose up -d --build
```

### Monitoramento
Verifique o status dos contêineres:

```bash
docker-compose ps
docker-compose logs
```

## Solução de Problemas

### Problemas de Conexão
Se enfrentar problemas de conexão:

1. Verifique se o contêiner está em execução:
   ```bash
   docker-compose ps
   ```

2. Verifique os logs para erros:
   ```bash
   docker-compose logs
   ```

3. Reinicie os contêineres:
   ```bash
   docker-compose restart
   ```

### Problemas de Autenticação
Se não conseguir fazer login:

1. Verifique se a senha no arquivo `.env` corresponde à senha que você está usando
2. Reinicie os contêineres após alterar a senha:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Suporte Adicional

Para suporte adicional ou personalizações, entre em contato com o desenvolvedor.

---

**Nota**: Mantenha este documento em um local seguro, pois contém informações sensíveis sobre a configuração do sistema.
