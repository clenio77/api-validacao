// Arquivo JavaScript principal para o painel administrativo
document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let authToken = '';
    let clients = {};
    let apiBaseUrl = '/api'; // URL base da API
    
    // Elementos DOM
    const loginSection = document.getElementById('loginSection');
    const mainContent = document.getElementById('mainContent');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginError = document.getElementById('loginError');
    const userInfo = document.getElementById('userInfo');
    const adminPassword = document.getElementById('adminPassword');
    
    // Navegação
    const navClients = document.getElementById('navClients');
    const navApiDocs = document.getElementById('navApiDocs');
    const navChatGPT = document.getElementById('navChatGPT');
    const clientsSection = document.getElementById('clientsSection');
    const apiDocsSection = document.getElementById('apiDocsSection');
    const chatGPTSection = document.getElementById('chatGPTSection');
    
    // Tabela de clientes
    const clientsTableBody = document.getElementById('clientsTableBody');
    const noClientsMessage = document.getElementById('noClientsMessage');
    
    // Modal de cliente
    const modalTitle = document.getElementById('modalTitle');
    const clientForm = document.getElementById('clientForm');
    const editMode = document.getElementById('editMode');
    const originalApiKey = document.getElementById('originalApiKey');
    const clientId = document.getElementById('clientId');
    const apiKey = document.getElementById('apiKey');
    const limitDate = document.getElementById('limitDate');
    const notes = document.getElementById('notes');
    const saveClientBtn = document.getElementById('saveClientBtn');
    
    // Modal de exclusão
    const deleteClientName = document.getElementById('deleteClientName');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Modal de detalhes
    const detailClientId = document.getElementById('detailClientId');
    const detailApiKey = document.getElementById('detailApiKey');
    const detailLimitDate = document.getElementById('detailLimitDate');
    const detailStatus = document.getElementById('detailStatus');
    const detailCreatedAt = document.getElementById('detailCreatedAt');
    const detailUpdatedAt = document.getElementById('detailUpdatedAt');
    const detailNotes = document.getElementById('detailNotes');
    const usageTableBody = document.getElementById('usageTableBody');
    const noUsageMessage = document.getElementById('noUsageMessage');
    const editClientBtn = document.getElementById('editClientBtn');
    
    // Estatísticas do dashboard
    const totalClientsCount = document.getElementById('totalClientsCount');
    const activeClientsCount = document.getElementById('activeClientsCount');
    const expiredClientsCount = document.getElementById('expiredClientsCount');
    const totalUsageCount = document.getElementById('totalUsageCount');
    
    // Inicialização
    init();
    
    function init() {
        // Verificar se há token salvo no localStorage
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
            authToken = savedToken;
            showMainContent();
            loadDashboard();
        }
        
        // Event listeners
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Login e logout
        if (loginBtn) loginBtn.addEventListener('click', handleLogin);
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (adminPassword) {
            adminPassword.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
        
        // Navegação
        if (navClients) {
            navClients.addEventListener('click', function() {
                showSection(clientsSection);
                navClients.classList.add('active');
                navApiDocs.classList.remove('active');
                navChatGPT.classList.remove('active');
                loadClients();
            });
        }
        
        if (navApiDocs) {
            navApiDocs.addEventListener('click', function() {
                showSection(apiDocsSection);
                navClients.classList.remove('active');
                navApiDocs.classList.add('active');
                navChatGPT.classList.remove('active');
            });
        }
        
        if (navChatGPT) {
            navChatGPT.addEventListener('click', function() {
                showSection(chatGPTSection);
                navClients.classList.remove('active');
                navApiDocs.classList.remove('active');
                navChatGPT.classList.add('active');
            });
        }
        
        // Gerenciamento de clientes
        if (saveClientBtn) saveClientBtn.addEventListener('click', saveClient);
        if (editClientBtn) {
            editClientBtn.addEventListener('click', function() {
                const clientKey = detailApiKey.textContent;
                prepareEditClient(clientKey);
                
                // Fechar modal de detalhes e abrir modal de edição
                const detailsModal = bootstrap.Modal.getInstance(document.getElementById('clientDetailsModal'));
                detailsModal.hide();
                
                const editModal = new bootstrap.Modal(document.getElementById('addClientModal'));
                editModal.show();
            });
        }
        
        // Inicializar modal de adicionar cliente
        const addClientBtn = document.querySelector('[data-bs-target="#addClientModal"]');
        if (addClientBtn) {
            addClientBtn.addEventListener('click', prepareAddClient);
        }
    }
    
    // Funções de autenticação
    async function handleLogin() {
        const password = adminPassword.value;
        if (!password) {
            showLoginError('Por favor, digite a senha de administrador.');
            return;
        }
        
        try {
            const response = await fetch(`${apiBaseUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'X-Admin-Password': password
                }
            });
            
            if (!response.ok) {
                throw new Error('Falha na autenticação');
            }
            
            const data = await response.json();
            authToken = data.token;
            
            // Salvar token no localStorage
            localStorage.setItem('authToken', authToken);
            
            // Mostrar conteúdo principal
            showMainContent();
            
            // Carregar dashboard
            loadDashboard();
            
        } catch (error) {
            console.error('Erro de login:', error);
            showLoginError('Senha incorreta ou erro de conexão.');
        }
    }
    
    function handleLogout() {
        authToken = '';
        localStorage.removeItem('authToken');
        showLoginSection();
    }
    
    function showLoginError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }
    
    function showMainContent() {
        loginSection.style.display = 'none';
        mainContent.style.display = 'block';
        userInfo.style.display = 'block';
        logoutBtn.style.display = 'block';
        loginError.style.display = 'none';
        
        // Mostrar seção de clientes por padrão
        showSection(clientsSection);
        navClients.classList.add('active');
    }
    
    function showLoginSection() {
        loginSection.style.display = 'block';
        mainContent.style.display = 'none';
        userInfo.style.display = 'none';
        logoutBtn.style.display = 'none';
        adminPassword.value = '';
    }
    
    function showSection(section) {
        clientsSection.style.display = 'none';
        apiDocsSection.style.display = 'none';
        chatGPTSection.style.display = 'none';
        
        section.style.display = 'block';
    }
    
    // Funções do Dashboard
    async function loadDashboard() {
        try {
            // Carregar estatísticas
            await loadStats();
            
            // Carregar lista de clientes
            await loadClients();
            
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            if (error.message === 'Unauthorized') {
                handleLogout();
            }
        }
    }
    
    async function loadStats() {
        try {
            const response = await fetch(`${apiBaseUrl}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized');
                }
                throw new Error('Falha ao carregar estatísticas');
            }
            
            const stats = await response.json();
            
            // Atualizar contadores
            if (totalClientsCount) totalClientsCount.textContent = stats.total_clients;
            if (activeClientsCount) activeClientsCount.textContent = stats.active_clients;
            if (expiredClientsCount) expiredClientsCount.textContent = stats.expired_clients;
            if (totalUsageCount) totalUsageCount.textContent = stats.total_usage;
            
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            throw error;
        }
    }
    
    // Funções de gerenciamento de clientes
    async function loadClients() {
        try {
            const response = await fetch(`${apiBaseUrl}/admin/clients`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized');
                }
                throw new Error('Falha ao carregar clientes');
            }
            
            const data = await response.json();
            clients = data.clients || {};
            
            renderClientsTable();
            
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            if (error.message === 'Unauthorized') {
                handleLogout();
                return;
            }
            alert('Erro ao carregar a lista de clientes. Por favor, tente novamente.');
        }
    }
    
    function renderClientsTable() {
        if (!clientsTableBody) return;
        
        clientsTableBody.innerHTML = '';
        
        const clientKeys = Object.keys(clients);
        
        if (clientKeys.length === 0) {
            if (noClientsMessage) noClientsMessage.style.display = 'block';
            return;
        }
        
        if (noClientsMessage) noClientsMessage.style.display = 'none';
        
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        clientKeys.forEach(key => {
            const client = clients[key];
            const row = document.createElement('tr');
            row.className = 'client-row';
            
            // Verificar se o acesso está válido
            const isValid = client.limit_date >= currentDate;
            const statusClass = isValid ? 'status-valid' : 'status-expired';
            const statusText = isValid ? 'Válido' : 'Expirado';
            
            row.innerHTML = `
                <td>${client.client_id}</td>
                <td>${key}</td>
                <td>${formatDate(client.limit_date)}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <button class="btn btn-sm btn-info view-btn" data-key="${key}">Ver</button>
                    <button class="btn btn-sm btn-primary edit-btn" data-key="${key}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-key="${key}">Excluir</button>
                </td>
            `;
            
            clientsTableBody.appendChild(row);
        });
        
        // Adicionar event listeners aos botões
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.getAttribute('data-key');
                showClientDetails(key);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.getAttribute('data-key');
                prepareEditClient(key);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.getAttribute('data-key');
                prepareDeleteClient(key);
            });
        });
    }
    
    function prepareAddClient() {
        modalTitle.textContent = 'Adicionar Cliente';
        clientForm.reset();
        editMode.value = 'add';
        originalApiKey.value = '';
        
        // Definir data limite padrão (1 ano a partir de hoje)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        limitDate.value = oneYearFromNow.toISOString().split('T')[0];
    }
    
    function prepareEditClient(key) {
        const client = clients[key];
        if (!client) return;
        
        modalTitle.textContent = 'Editar Cliente';
        editMode.value = 'edit';
        originalApiKey.value = key;
        
        clientId.value = client.client_id;
        apiKey.value = key;
        limitDate.value = client.limit_date;
        notes.value = client.notes || '';
        
        const modal = new bootstrap.Modal(document.getElementById('addClientModal'));
        modal.show();
    }
    
    function prepareDeleteClient(key) {
        const client = clients[key];
        if (!client) return;
        
        deleteClientName.textContent = client.client_id;
        
        // Configurar botão de confirmação
        confirmDeleteBtn.onclick = function() {
            deleteClient(key);
        };
        
        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        modal.show();
    }
    
    async function saveClient() {
        const isEdit = editMode.value === 'edit';
        const clientData = {
            api_key: apiKey.value,
            client_id: clientId.value,
            limit_date: limitDate.value,
            notes: notes.value
        };
        
        try {
            const response = await fetch(`${apiBaseUrl}/admin/client`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clientData)
            });
            
            if (!response.ok) {
                throw new Error('Falha ao salvar cliente');
            }
            
            // Se estamos editando e a chave API mudou, precisamos excluir a antiga
            if (isEdit && originalApiKey.value !== clientData.api_key) {
                await deleteClient(originalApiKey.value, true);
            }
            
            // Recarregar dashboard
            await loadDashboard();
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addClientModal'));
            modal.hide();
            
            alert(isEdit ? 'Cliente atualizado com sucesso!' : 'Cliente adicionado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            alert('Erro ao salvar cliente. Por favor, tente novamente.');
        }
    }
    
    async function deleteClient(key, silent = false) {
        try {
            const response = await fetch(`${apiBaseUrl}/admin/client/${key}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Falha ao excluir cliente');
            }
            
            // Recarregar dashboard
            await loadDashboard();
            
            // Fechar modal de confirmação
            if (!silent) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                modal.hide();
                
                alert('Cliente excluído com sucesso!');
            }
            
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            if (!silent) {
                alert('Erro ao excluir cliente. Por favor, tente novamente.');
            }
        }
    }
    
    async function showClientDetails(key) {
        try {
            const response = await fetch(`${apiBaseUrl}/admin/client/${key}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Falha ao carregar detalhes do cliente');
            }
            
            const data = await response.json();
            const client = data.client;
            
            if (!client) {
                throw new Error('Cliente não encontrado');
            }
            
            // Preencher detalhes do cliente
            detailClientId.textContent = client.client_id;
            detailApiKey.textContent = key;
            detailLimitDate.textContent = formatDate(client.limit_date);
            
            const currentDate = new Date().toISOString().split('T')[0];
            const isValid = client.limit_date >= currentDate;
            detailStatus.textContent = isValid ? 'Válido' : 'Expirado';
            detailStatus.className = isValid ? 'status-valid' : 'status-expired';
            
            detailCreatedAt.textContent = formatDateTime(client.created_at);
            detailUpdatedAt.textContent = formatDateTime(client.updated_at || client.created_at);
            detailNotes.textContent = client.notes || 'Nenhuma observação.';
            
            // Preencher histórico de uso
            usageTableBody.innerHTML = '';
            
            if (client.usage && client.usage.length > 0) {
                noUsageMessage.style.display = 'none';
                
                client.usage.forEach(usage => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${formatDate(usage.date)}</td>
                        <td>${formatTime(usage.timestamp)}</td>
                        <td>${usage.ip}</td>
                    `;
                    usageTableBody.appendChild(row);
                });
            } else {
                noUsageMessage.style.display = 'block';
            }
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('clientDetailsModal'));
            modal.show();
            
        } catch (error) {
            console.error('Erro ao carregar detalhes do cliente:', error);
            alert('Erro ao carregar detalhes do cliente. Por favor, tente novamente.');
        }
    }
    
    // Funções utilitárias
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    function formatDateTime(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return dateTimeString;
        
        return date.toLocaleString('pt-BR');
    }
    
    function formatTime(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleTimeString('pt-BR');
    }
    
    // Copiar para área de transferência
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(
            function() {
                alert('Copiado para a área de transferência!');
            }, 
            function(err) {
                console.error('Erro ao copiar: ', err);
            }
        );
    }
    
    // Expor funções para uso global
    window.adminPanel = {
        copyToClipboard: copyToClipboard
    };
});
