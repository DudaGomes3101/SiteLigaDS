// 🔒 Funções de Segurança
function encryptPassword(password) {
    return btoa(password + 'ligads_salt_2024');
}

// 💾 Funções de Backup
function exportUserData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        totalUsers: users.length,
        users: users
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `backup_ligads_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showBackupResult(`
        <div class="alert alert-success">
            <h3>✅ BACKUP EXPORTADO COM SUCESSO!</h3>
            <p><strong>Arquivo:</strong> ${link.download}</p>
            <p><strong>Usuários:</strong> ${users.length}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString()}</p>
        </div>
    `);
}

function handleBackupImport(file) {
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (!importData.users || !Array.isArray(importData.users)) {
                throw new Error('Formato de arquivo inválido');
            }
            
            const currentUsers = JSON.parse(localStorage.getItem('users')) || [];
            const usernameMap = {};
            
            currentUsers.forEach(user => {
                usernameMap[user.username] = user;
            });
            
            let newUsers = 0;
            importData.users.forEach(user => {
                if (!usernameMap[user.username]) {
                    currentUsers.push(user);
                    usernameMap[user.username] = user;
                    newUsers++;
                }
            });
            
            localStorage.setItem('users', JSON.stringify(currentUsers));
            
            showBackupResult(`
                <div class="alert alert-success">
                    <h3>✅ BACKUP IMPORTADO COM SUCESSO!</h3>
                    <p><strong>Novos usuários adicionados:</strong> ${newUsers}</p>
                    <p><strong>Total de usuários no sistema:</strong> ${currentUsers.length}</p>
                    <p><strong>Data do backup original:</strong> ${importData.exportDate ? new Date(importData.exportDate).toLocaleString() : 'N/A'}</p>
                </div>
            `);
            
            // Recarregar dados
            loadUsersList();
            updateStats();
            
        } catch (error) {
            showBackupResult(`
                <div class="alert alert-error">
                    <h3>❌ ERRO AO IMPORTAR BACKUP</h3>
                    <p><strong>Erro:</strong> ${error.message}</p>
                </div>
            `);
        }
    };
    
    reader.readAsText(file);
}

// 🛠️ Funções de Ferramentas
function forceCreateGerente() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Remove gerente existente se houver
    users = users.filter(u => u.role !== 'gerente');
    
    const defaultManager = {
        username: 'gerente',
        password: encryptPassword('gerente123'),
        email: 'gerente@ligads.com',
        birthdate: '1990-01-01',
        role: 'gerente',
        isActive: true,
        created: new Date().toISOString()
    };
    
    users.push(defaultManager);
    localStorage.setItem('users', JSON.stringify(users));
    
    showToolsResult(`
        <div class="alert alert-success">
            <h3>✅ GERENTE CRIADO/RECRIADO COM SUCESSO!</h3>
            <p><strong>Usuário:</strong> gerente</p>
            <p><strong>Senha:</strong> gerente123</p>
            <p><strong>Email:</strong> gerente@ligads.com</p>
            <p><strong>Role:</strong> gerente</p>
            <p><strong>Senha:</strong> <em>criptografada no sistema</em></p>
        </div>
    `);
    
    loadUsersList();
    updateStats();
}

function checkSystem() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let html = '<div class="alert alert-info"><h3>📊 STATUS DO SISTEMA</h3>';
    
    if (users.length === 0) {
        html += '<p style="color: red;">❌ NENHUM USUÁRIO ENCONTRADO</p>';
    } else {
        html += `<p>✅ ${users.length} usuário(s) encontrado(s)</p>`;
        
        const managers = users.filter(u => u.role === 'gerente');
        html += `<p>👑 ${managers.length} usuário(s) gerente(s)</p>`;
        
        users.forEach(user => {
            const roleIcon = user.role === 'gerente' ? '👑' : '👤';
            const passwordType = user.password && user.password.length > 20 ? '🔒 Criptografada' : '❌ Texto puro';
            html += `<div class="user-item">
                ${roleIcon} <strong>${user.username}</strong> (${user.role})<br>
                <strong>Email:</strong> ${user.email}<br>
                <strong>Senha:</strong> ${passwordType}<br>
                <strong>Criado:</strong> ${new Date(user.created).toLocaleDateString()}
            </div>`;
        });
    }
    
    html += '</div>';
    showToolsResult(html);
}

function checkPasswordSecurity() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let insecureCount = 0;
    
    let html = '<div class="alert alert-warning"><h3>🔒 VERIFICAÇÃO DE SEGURANÇA DAS SENHAS</h3>';
    
    users.forEach(user => {
        const isEncrypted = user.password && user.password.length > 20;
        if (!isEncrypted) {
            insecureCount++;
            html += `<div class="user-item">
                <strong>${user.username}</strong> - Senha em texto puro<br>
                <em>Senha atual:</em> ${user.password}
            </div>`;
        }
    });
    
    if (insecureCount === 0) {
        html += '<p>✅ Todas as senhas estão criptografadas</p>';
    } else {
        html += `<p>❌ ${insecureCount} usuário(s) com senha em texto puro</p>`;
        html += `<button class="btn btn-primary" onclick="encryptAllPasswords()">🔒 CRIPTOGRAFAR TODAS AS SENHAS</button>`;
    }
    
    html += '</div>';
    showToolsResult(html);
}

function encryptAllPasswords() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let updatedCount = 0;
    
    users.forEach(user => {
        if (user.password && user.password.length <= 20) {
            user.password = encryptPassword(user.password);
            updatedCount++;
        }
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    
    showToolsResult(`
        <div class="alert alert-success">
            <h3>✅ SENHAS CRIPTOGRAFADAS!</h3>
            <p><strong>Usuários atualizados:</strong> ${updatedCount}</p>
            <p><strong>Total de usuários:</strong> ${users.length}</p>
            <p><em>Todas as senhas foram criptografadas com sucesso.</em></p>
        </div>
    `);
}

function checkEmailDuplicates() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const emailMap = {};
    const duplicates = [];
    
    users.forEach(user => {
        if (emailMap[user.email]) {
            duplicates.push(user.email);
        } else {
            emailMap[user.email] = true;
        }
    });
    
    let html = '<div class="alert alert-warning"><h3>📧 VERIFICAÇÃO DE EMAILS DUPLICADOS</h3>';
    
    if (duplicates.length === 0) {
        html += '<p>✅ Nenhum email duplicado encontrado</p>';
    } else {
        html += `<p>❌ ${duplicates.length} email(s) duplicado(s) encontrado(s):</p>`;
        duplicates.forEach(email => {
            const usersWithEmail = users.filter(u => u.email === email);
            html += `<div class="user-item">
                <strong>Email:</strong> ${email}<br>
                <strong>Usuários:</strong> ${usersWithEmail.map(u => u.username).join(', ')}
            </div>`;
        });
    }
    
    html += '</div>';
    showToolsResult(html);
}

function clearAndReset() {
    if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados e recriar o sistema. Deseja continuar?')) {
        localStorage.clear();
        sessionStorage.clear();
        forceCreateGerente();
        showToolsResult(`
            <div class="alert alert-success">
                <h3>✅ SISTEMA REINICIADO!</h3>
                <p>Todos os dados foram limpos e o sistema foi recriado com o usuário gerente padrão.</p>
            </div>
        `);
    }
}

// Funções de Navegação
function showSection(sectionName) {
    // Esconder todas as seções
    document.querySelectorAll('.section-content').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar a seção selecionada
    document.getElementById(sectionName + '-section').style.display = 'block';
    
    // Atualizar menu ativo
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

function showToolsResult(html) {
    document.getElementById('toolsResult').innerHTML = html;
    showSection('tools');
}

function showBackupResult(html) {
    document.getElementById('backupResult').innerHTML = html;
    showSection('backup');
}

// Verificar se o usuário está logado e é gerente
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }
    
    if (currentUser.role !== 'gerente') {
        alert('Você não tem permissão para acessar esta página.');
        if (!window.location.href.includes('dashboard.html')) {
            window.location.href = "dashboard.html";
        }
        return;
    }
    
    document.getElementById('currentUserName').textContent = currentUser.username;
    loadUsersList();
    updateStats();
});

// Carregar lista de usuários
function loadUsersList() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const usersTableBody = document.getElementById('usersTableBody');
    
    usersTableBody.innerHTML = '';
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        let roleClass = 'role-externo';
        if (user.role === 'membro') roleClass = 'role-membro';
        if (user.role === 'gerente') roleClass = 'role-gerente';
        
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${roleClass}">${user.role}</span></td>
            <td>${formatDate(user.birthdate)}</td>
            <td>
                ${user.role !== 'gerente' ? 
                    `<button class="action-btn promote-btn" onclick="promoteUser('${user.username}', 'membro')">Tornar Membro</button>` : 
                    ''}
                ${user.role === 'membro' ? 
                    `<button class="action-btn demote-btn" onclick="promoteUser('${user.username}', 'externo')">Rebaixar</button>` : 
                    ''}
                ${user.username !== 'gerente' ? 
                    `<button class="action-btn delete-btn" onclick="deleteUser('${user.username}')">Excluir</button>` : 
                    ''}
            </td>
        `;
        
        usersTableBody.appendChild(tr);
    });
}

// Atualizar estatísticas
function updateStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const totalUsers = users.length;
    const totalManagers = users.filter(u => u.role === 'gerente').length;
    const totalMembers = users.filter(u => u.role === 'membro').length;
    const totalExternal = users.filter(u => u.role === 'externo').length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalManagers').textContent = totalManagers;
    document.getElementById('totalMembers').textContent = totalMembers;
    document.getElementById('totalExternal').textContent = totalExternal;
}

// Promover/Rebaixar usuário
function promoteUser(username, newRole) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
        users[userIndex].role = newRole;
        localStorage.setItem('users', JSON.stringify(users));
        
        showAlert(`Usuário ${username} agora é ${newRole === 'membro' ? 'membro' : 'usuário externo'}`, 'success');
        loadUsersList();
        updateStats();
    } else {
        showAlert('Erro ao alterar papel do usuário', 'error');
    }
}

// Excluir usuário
function deleteUser(username) {
    if (confirm(`Tem certeza que deseja excluir o usuário ${username}?`)) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const filteredUsers = users.filter(u => u.username !== username);
        
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        showAlert(`Usuário ${username} excluído com sucesso`, 'success');
        loadUsersList();
        updateStats();
    }
}

// Filtrar usuários na tabela
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const username = row.cells[0].textContent.toLowerCase();
        const email = row.cells[1].textContent.toLowerCase();
        
        if (username.includes(searchTerm) || email.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Modal functions
let currentEditingUser = null;

function openAddUserModal() {
    currentEditingUser = null;
    document.getElementById('modalTitle').textContent = 'Adicionar Usuário';
    document.getElementById('modalSubmitBtn').textContent = 'Adicionar';
    document.getElementById('userForm').reset();
    document.getElementById('alertMessage').innerHTML = '';
    document.getElementById('userModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

function submitUserForm() {
    const username = document.getElementById('modalUsername').value;
    const email = document.getElementById('modalEmail').value;
    const password = document.getElementById('modalPassword').value;
    const birthdate = document.getElementById('modalBirthdate').value;
    const role = document.getElementById('modalRole').value;
    
    if (!username || !email || !password || !birthdate) {
        showAlert('Por favor, preencha todos os campos', 'error', 'alertMessage');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (!currentEditingUser && users.find(u => u.username === username)) {
        showAlert('Este nome de usuário já está em uso', 'error', 'alertMessage');
        return;
    }
    
    if (currentEditingUser) {
        const userIndex = users.findIndex(u => u.username === currentEditingUser);
        if (userIndex !== -1) {
            users[userIndex].email = email;
            users[userIndex].password = encryptPassword(password);
            users[userIndex].birthdate = birthdate;
            users[userIndex].role = role;
        }
    } else {
        users.push({
            username,
            email,
            password: encryptPassword(password),
            birthdate,
            role,
            isActive: true,
            created: new Date().toISOString()
        });
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    showAlert(
        currentEditingUser ? 
        `Usuário ${username} atualizado com sucesso` : 
        `Usuário ${username} adicionado com sucesso`, 
        'success'
    );
    
    closeModal();
    loadUsersList();
    updateStats();
}

// Funções auxiliares
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function showAlert(message, type, containerId = 'alertMessage') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
    alertDiv.textContent = message;
    
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.appendChild(alertDiv);
    
    if (containerId === 'alertMessage' && type === 'success') {
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = "login.html";
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeModal();
    }
}

// 🍔 Funções para Menu Mobile - ATUALIZADO
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    body.classList.toggle('menu-open');
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    body.classList.remove('menu-open');
}

// Fechar menu ao clicar em um link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    });
});

// Fechar menu ao redimensionar a tela para tamanho maior
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});

// Fechar menu com a tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMobileMenu();
    }
});

// Funções de Navegação - ATUALIZADA
function showSection(sectionName) {
    // Esconder todas as seções
    document.querySelectorAll('.section-content').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar a seção selecionada
    document.getElementById(sectionName + '-section').style.display = 'block';
    
    // Atualizar menu ativo
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Encontrar e ativar o link correto
    const activeLink = document.querySelector(`.nav-link[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Fechar menu mobile após clicar (se estiver em mobile)
    if (window.innerWidth <= 768) {
        closeMobileMenu();
    }
}