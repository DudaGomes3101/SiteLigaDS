let isLogin = true;

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
        const user = users.find(u => u.username === username && u.password === password && u.isActive);
        
        if (user) {
            // Armazena informações do usuário logado
            sessionStorage.setItem("currentUser", JSON.stringify({
                username: user.username,
                role: user.role
            }));
            
            // Redireciona para o dashboard
            accessMessage.innerText = "Login realizado com sucesso! Redirecionando...";
            setTimeout(() => {
                window.location.href = "capacitations.html";
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

        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Verifica se o usuário já existe
        if (users.find(u => u.username === username)) {
            accessMessage.innerText = "Este nome de usuário já está em uso.";
            return;
        }
        
        // Por padrão, novos usuários são externos
        const newUser = {
            username,
            password,
            email,
            birthdate,
            role: 'externo',
            isActive: true,
            created: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        accessMessage.innerText = "Cadastro realizado com sucesso! Faça login para continuar.";
        
        // Alterna para a tela de login após cadastro bem-sucedido
        setTimeout(() => {
            toggleForm();
        }, 2000);
    }
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    updateWelcomeSection(); // Inicializa a seção de boas-vindas
});