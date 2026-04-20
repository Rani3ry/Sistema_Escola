# Sistema de Gestão Estudantil 🎓

Este é um Sistema de Gestão Estudantil completo, desenvolvido para centralizar informações acadêmicas, permitindo o acompanhamento de cursos, disciplinas, notas, faltas e o status acadêmico dos alunos em tempo real.

O projeto foi construído com uma arquitetura separada entre **Frontend** (Interface do Usuário) e **Backend** (API e Regras de Negócio), garantindo escalabilidade e facilidade de manutenção.


## 🚀 Funcionalidades

O sistema possui três níveis de acesso, cada um com permissões específicas:

### 👤 Administrador
* Gestão de Cursos: Criação, leitura, atualização e exclusão de cursos.
* Gestão de Disciplinas: Controle total sobre as disciplinas vinculadas aos cursos.
* Gestão de Professores e Alunos: Cadastro, alteração e exclusão de professores e alunos.
* Monitoramento geral do sistema.

### 👨‍🏫 Professor
* Consulta de informações sobre o curso, disciplina, alunos e informações próprias.
* Lançamento de notas e controle de faltas dos alunos.

### 🎓 Aluno
* Consulta de histórico: Acesso a todas as notas e faltas das disciplinas cursadas.
* Status Acadêmico: Verificação automática de aprovação ou recuperação (baseado no sistema de cálculo integrado).
* Acesso às informações próprias, do curso, disciplinas e professores. 



## 🛠️ Tecnologias Utilizadas

### 🎨 Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-264de4?style=for-the-badge&logo=css3&logoColor=white)

---

### ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

---

### 🗄️ Banco de Dados
![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)

---

### ☁️ Deploy
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

---

### 🔧 Ferramentas
![Git](https://img.shields.io/badge/Git-F05033?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)



## 📦 Como rodar o projeto localmente

Caso deseje executar o projeto em sua máquina para desenvolvimento ou testes:

1. **1 Clone o repositório:**
   ```bash
   git clone [https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git](https://github.com/Rani3ry/Sistema_Escola.git)
   cd SEU_REPOSITORIO

2. **Configuração do Backend:**
    ```bash
    cd server
    npm install
    # Crie um arquivo .env com suas variáveis de banco de dados
    npm start

3. **Configuração do Frontend:**
    ```bash
    cd ../client
    npm install
    # Configure o arquivo .env (REACT_APP_API_URL) apontando para o localhost:PORTA_DO_SERVER
    npm start


## 🌐 Acesso ao Sistema

O sistema está online e pode ser acessado através do link abaixo:
https://sistema-escola.up.railway.app/


## 🧪 Como Testar

Matrículas de exemplo: 

**Aluno**
    **Matrícula:** 8350502
    **Senha:** 12samara

**Professor**
    **Matrícula:** 535052-N
    **Senha:** 13kaique

**Admin**
    **Matrícula:** 12345
    **Senha:** admin123

Ao acessar, você será direcionado ao Dashboard específico do seu nível de permissão (Aluno, Professor ou Admin).

* Se quiser cadastrar um novo administrador, utilize a senha mestre "ESCOLA123"


## 📝 Licença

Este projeto foi desenvolvido como parte de um estudo prático de desenvolvimento web full-stack.

Desenvolvido com dedicação por **Kaique Raniery**