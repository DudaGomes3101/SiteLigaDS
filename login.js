let isLogin = true;

// 🔒 Funções de Segurança
function encryptPassword(password) {
    // Criptografia básica - melhora um pouco a segurança
    return btoa(password + 'ligads_salt_2024'); // Base64 + salt
}

function decryptPassword(encrypted) {
    // Apenas para demonstração - na prática não deveríamos descriptografar
    return atob(encrypted).replace('ligads_salt_2024', '');
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
    
    alert(`✅ Backup exportado com sucesso! ${users.length} usuários salvos.`);
}

function importUserData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validação básica do arquivo
            if (!importData.users || !Array.isArray(importData.users)) {
                throw new Error('Formato de arquivo inválido');
            }
            
            // Mescla usuários (evita duplicatas por username)
            const currentUsers = JSON.parse(localStorage.getItem('users')) || [];
            const usernameMap = {};
            
            // Mapeia usuários atuais
            currentUsers.forEach(user => {
                usernameMap[user.username] = user;
            });
            
            // Adiciona usuários do backup que não existem
            importData.users.forEach(user => {
                if (!usernameMap[user.username]) {
                    currentUsers.push(user);
                    usernameMap[user.username] = user;
                }
            });
            
            localStorage.setItem('users', JSON.stringify(currentUsers));
            
            alert(`✅ Backup importado com sucesso! ${importData.users.length} usuários processados. Sistema atualizado com ${currentUsers.length} usuários.`);
            
            // Recarrega a página para refletir mudanças
            setTimeout(() => location.reload(), 1000);
            
        } catch (error) {
            alert(`❌ Erro ao importar backup: ${error.message}`);
        }
    };
    
    reader.readAsText(file);
}

// Verificar e criar gerente padrão se não existir
function initializeDefaultManager() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const managerExists = users.find(u => u.role === 'gerente' && u.isActive);
    
    if (!managerExists) {
        const defaultManager = {
            username: 'gerente',
            password: encryptPassword('gerente123'), // 🔒 Senha criptografada
            email: 'gerente@ligads.com',
            birthdate: '1990-01-01',
            role: 'gerente',
            isActive: true,
            created: new Date().toISOString()
        };
        
        users.push(defaultManager);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('✅ Gerente padrão criado automaticamente');
        
        // Backup automático após criar gerente
        setTimeout(exportUserData, 2000);
    }
}

// Função para alternar entre login e cadastro
function toggleForm() {
    isLogin = !isLogin;
    
    // Atualiza o formulário
    document.getElementById("formTitle").innerText = isLogin ? "Login" : "Cadastro";
    document.getElementById("formSubtitle").innerText = isLogin ? "Use suas credenciais para acessar" : "Preencha seus dados para se cadastrar";
    document.getElementById("authButton").innerText = isLogin ? "Entrar" : "Cadastrar";
    
    // Atualiza o texto de alternância
    document.getElementById("toggleText").innerHTML = isLogin 
        ? 'Não tem uma conta? <a href="#" onclick="toggleForm()">Cadastre-se aqui</a>'
        : 'Já tem uma conta? <a href="#" onclick="toggleForm()">Faça login</a>';

    // Exibir ou ocultar campos extras de cadastro
    const registerFields = document.querySelectorAll(".register-only");
    registerFields.forEach(field => {
        field.style.display = isLogin ? "none" : "block";
    });

    // Atualiza a seção de boas-vindas
    updateWelcomeSection();
    
    // Limpa mensagens de erro
    document.getElementById("accessMessage").innerText = "";
    // Limpa os campos
    document.getElementById("authForm").reset();
}

// Atualiza a seção de boas-vindas
function updateWelcomeSection() {
    const welcomeContent = document.getElementById("welcomeContent");
    
    if (isLogin) {
        welcomeContent.innerHTML = `
            <h1>Ainda não tem conta?</h1>
            <p>Para acessar os nossos cursos, faça o cadastro com suas informações pessoais</p>
            <button class="toggle-btn" onclick="toggleForm()">Criar Conta</button>
            <div style="margin-top: 20px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                <small>💡 Dica: Faça backup regular dos seus dados</small>
            </div>
        `;
    } else {
        welcomeContent.innerHTML = `
            <h1>Já é membro?</h1>
            <p>Faça login para acessar todos os nossos cursos e recursos exclusivos</p>
            <button class="toggle-btn" onclick="toggleForm()">Fazer Login</button>
        `;
    }
}

// Função de Autenticação (Login e Cadastro)
function handleAuth() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const birthdate = document.getElementById("birthdate").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const accessMessage = document.getElementById("accessMessage");

    if (isLogin) {
        // Processo de LOGIN
        if (username === "" || password === "") {
            accessMessage.innerText = "Por favor, preencha todos os campos.";
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const encryptedPassword = encryptPassword(password);
        const user = users.find(u => u.username === username && u.password === encryptedPassword && u.isActive);
        
        if (user) {
            // Armazena informações do usuário logado
            sessionStorage.setItem("currentUser", JSON.stringify({
                username: user.username,
                role: user.role,
                email: user.email
            }));
            
            // Redireciona para o dashboard
            accessMessage.innerText = "Login realizado com sucesso! Redirecionando...";
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
        } else {
            accessMessage.innerText = "Usuário ou senha incorretos.";
        }
    } else {
        // Processo de CADASTRO
        if (username === "" || password === "" || email === "" || birthdate === "" || confirmPassword === "") {
            accessMessage.innerText = "Por favor, preencha todos os campos.";
            return;
        }

        // Verificação de senha no cadastro
        if (password !== confirmPassword) {
            accessMessage.innerText = "As senhas não coincidem. Por favor, verifique.";
            return;
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            accessMessage.innerText = "Por favor, insira um email válido.";
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Verifica se o usuário já existe
        if (users.find(u => u.username === username)) {
            accessMessage.innerText = "Este nome de usuário já está em uso.";
            return;
        }
        
        // ✅ VERIFICAÇÃO DE EMAIL ÚNICO ADICIONADA
        if (users.find(u => u.email === email)) {
            accessMessage.innerText = "Este email já está cadastrado.";
            return;
        }
        
        // Por padrão, novos usuários são externos
        const newUser = {
            username,
            password: encryptPassword(password), // 🔒 Senha criptografada
            email,
            birthdate,
            role: 'externo',
            isActive: true,
            created: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        accessMessage.innerText = "Cadastro realizado com sucesso! Faça login para continuar.";
        
        // Sugere backup após cadastro
        setTimeout(() => {
            if(confirm('Cadastro realizado! Deseja fazer backup dos dados agora?')) {
                exportUserData();
            }
        }, 1000);
        
        // Alterna para a tela de login após cadastro bem-sucedido
        setTimeout(() => {
            toggleForm();
        }, 2000);
    }
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeDefaultManager(); // ✅ Garante que o gerente existe
    updateWelcomeSection(); // Inicializa a seção de boas-vindas
});