# Guia de Integração da API de Validação com Agentes do ChatGPT

Este guia fornece instruções detalhadas sobre como integrar a API de Validação de Acesso por Data com agentes inteligentes do ChatGPT.

## Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração do Agente no ChatGPT](#configuração-do-agente-no-chatgpt)
4. [Métodos de Integração](#métodos-de-integração)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Solução de Problemas](#solução-de-problemas)

## Visão Geral

A integração da API de Validação com agentes do ChatGPT permite verificar se um cliente tem acesso válido antes de fornecer serviços através do agente. Isso é feito através de uma chamada à API que verifica se a data atual é anterior à data limite configurada para o cliente.

## Pré-requisitos

1. API de Validação implantada e acessível via internet
2. Acesso à plataforma ChatGPT para criar ou modificar agentes
3. Chaves de API configuradas para seus clientes

## Configuração do Agente no ChatGPT

### 1. Criar um Novo Agente

1. Acesse a plataforma ChatGPT
2. Navegue até a seção de Agentes ou GPTs
3. Clique em "Criar novo agente"
4. Defina um nome e descrição para seu agente

### 2. Configurar Instruções do Agente

Adicione as seguintes instruções ao seu agente para implementar a validação de acesso:

```
Antes de responder a qualquer solicitação do usuário, você deve:

1. Solicitar a chave de API do usuário se ainda não foi fornecida
2. Validar o acesso do usuário através da API de Validação
3. Somente fornecer o serviço se o acesso for válido
4. Informar ao usuário caso o acesso tenha expirado

Fluxo de validação:
- Quando um usuário inicia a conversa, pergunte educadamente pela chave de API
- Use a chave para verificar o acesso na API de Validação
- Se o acesso for válido, forneça o serviço normalmente
- Se o acesso estiver expirado, informe ao usuário e forneça instruções para renovação

Mensagens para o usuário:
- Solicitação de chave: "Olá! Para acessar este serviço, por favor forneça sua chave de API."
- Acesso válido: "Obrigado! Seu acesso é válido até [data_limite]. Como posso ajudar hoje?"
- Acesso expirado: "Desculpe, seu acesso expirou em [data_limite]. Por favor, entre em contato com [seu_contato] para renovar sua assinatura."
```

### 3. Configurar Ações do Agente

Para que o agente possa se comunicar com a API de Validação, você precisa configurar uma ação (Action) no ChatGPT:

1. Na configuração do agente, vá para a seção "Actions" ou "Ações"
2. Adicione uma nova ação com os seguintes detalhes:
   - Nome: ValidateAccess
   - Descrição: Valida o acesso do cliente na API externa
   - URL da API: `https://sua-api.exemplo.com/validate`
   - Método: POST
   - Headers: `X-API-Key: {api_key}`
   - Body: `{"request_data": "ChatGPT Agent Access"}`

## Métodos de Integração

Existem três métodos principais para integrar a API de Validação com agentes do ChatGPT:

### 1. Integração Direta via Ações do ChatGPT

Este é o método mais simples, usando as Ações (Actions) nativas do ChatGPT conforme descrito acima.

**Vantagens:**
- Fácil de configurar
- Não requer desenvolvimento adicional
- Gerenciado pela plataforma ChatGPT

**Desvantagens:**
- Funcionalidades limitadas às capacidades das Ações do ChatGPT
- Menos flexibilidade para lógica complexa

### 2. Integração via API Intermediária

Neste método, você cria uma API intermediária que o agente do ChatGPT chama, e esta API intermediária se comunica com a API de Validação.

**Vantagens:**
- Maior flexibilidade e controle
- Possibilidade de lógica mais complexa
- Melhor gerenciamento de erros

**Desvantagens:**
- Requer desenvolvimento e manutenção de uma API adicional
- Mais complexo de implementar

### 3. Integração via Webhook

Neste método, o ChatGPT chama um webhook que você configura para validar o acesso.

**Vantagens:**
- Boa flexibilidade
- Possibilidade de processamento assíncrono
- Bom para integrações complexas

**Desvantagens:**
- Requer configuração de webhook
- Pode ter latência maior

## Exemplos Práticos

### Exemplo 1: Integração Direta via Ações do ChatGPT

1. Configure a ação conforme descrito na seção "Configurar Ações do Agente"
2. Adicione o seguinte código nas instruções do agente:

```
Quando um usuário fornecer uma chave de API, você deve:
1. Chamar a ação ValidateAccess com a chave fornecida
2. Interpretar a resposta:
   - Se "valid" for true, continuar com o serviço
   - Se "valid" for false, informar que o acesso expirou
```

### Exemplo 2: Integração via API Intermediária (Node.js)

1. Crie uma API intermediária com Express:

```javascript
// api_intermediaria.js
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VALIDATION_API_URL = 'https://sua-api.exemplo.com/validate';

app.post('/validate-and-process', async (req, res) => {
  const { api_key, user_query } = req.body;
  
  if (!api_key) {
    return res.status(400).json({ error: 'API key is required' });
  }
  
  try {
    // Validar acesso
    const validationResponse = await axios.post(
      VALIDATION_API_URL,
      { request_data: 'ChatGPT Agent Access' },
      { headers: { 'X-API-Key': api_key } }
    );
    
    const validationData = validationResponse.data;
    
    if (!validationData.valid) {
      return res.json({
        status: 'expired',
        message: `Acesso expirado em ${validationData.limit_date}`,
        limit_date: validationData.limit_date
      });
    }
    
    // Processar a consulta do usuário
    // ... lógica adicional aqui ...
    
    return res.json({
      status: 'valid',
      message: `Acesso válido até ${validationData.limit_date}`,
      limit_date: validationData.limit_date,
      response: 'Resposta processada para a consulta do usuário'
    });
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Erro ao processar a solicitação' });
  }
});

app.listen(3000, () => {
  console.log('API intermediária rodando na porta 3000');
});
```

2. Configure uma ação no ChatGPT para chamar esta API intermediária

### Exemplo 3: Integração via Webhook (Python)

1. Crie um webhook com Flask:

```python
# webhook.py
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

VALIDATION_API_URL = 'https://sua-api.exemplo.com/validate'

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    api_key = data.get('api_key')
    
    if not api_key:
        return jsonify({
            'status': 'error',
            'message': 'API key is required'
        }), 400
    
    try:
        # Validar acesso
        validation_response = requests.post(
            VALIDATION_API_URL,
            json={'request_data': 'ChatGPT Agent Access'},
            headers={'X-API-Key': api_key}
        )
        
        validation_data = validation_response.json()
        
        if not validation_data.get('valid'):
            return jsonify({
                'status': 'expired',
                'message': f'Acesso expirado em {validation_data["limit_date"]}',
                'limit_date': validation_data['limit_date']
            })
        
        # Processar a consulta do usuário
        # ... lógica adicional aqui ...
        
        return jsonify({
            'status': 'valid',
            'message': f'Acesso válido até {validation_data["limit_date"]}',
            'limit_date': validation_data['limit_date'],
            'response': 'Resposta processada para a consulta do usuário'
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao processar a solicitação: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

2. Configure uma ação no ChatGPT para chamar este webhook

## Solução de Problemas

### Problema: O agente não consegue se conectar à API

**Solução:**
1. Verifique se a URL da API está correta e acessível
2. Confirme que a API está rodando e respondendo a requisições
3. Verifique se há firewalls ou restrições de rede bloqueando as conexões

### Problema: A validação sempre retorna "acesso inválido"

**Solução:**
1. Verifique se a chave de API está correta
2. Confirme que o cliente tem uma data limite válida configurada
3. Verifique o formato da requisição à API

### Problema: Erros de CORS ao chamar a API

**Solução:**
1. Certifique-se de que a API está configurada para permitir requisições do domínio do ChatGPT
2. Adicione os headers CORS apropriados na resposta da API

### Problema: Latência alta nas respostas do agente

**Solução:**
1. Otimize a API para responder mais rapidamente
2. Considere implementar cache para respostas frequentes
3. Verifique se o servidor da API tem recursos suficientes

## Conclusão

A integração da API de Validação com agentes do ChatGPT permite controlar o acesso dos seus clientes aos serviços oferecidos pelos agentes inteligentes. Escolha o método de integração que melhor se adapta às suas necessidades e siga as instruções detalhadas neste guia para implementar a solução.

Para suporte adicional ou dúvidas, entre em contato com nossa equipe de suporte.
