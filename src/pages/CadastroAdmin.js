import React, {useState} from "react";
import { API_URL } from "../api";
import './styles/CadastroAdmin.css';

function CadastroAdmin({onVoltar}) {
    const [form, setForm] = useState({
        nome: '',
        id: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        senhaMestre: ''
    });

    const handleRegister = async (e) => {
        e.preventDefault();

        if (form.senha !== form.confirmarSenha) {
            alert('A confirmação da senha está incorreta!');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/admin/register}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identificacao: form.id,
                    nome: form.nome,
                    email: form.email,
                    senha: form.senha,
                    masterPassword: form.senhaMestre
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Administrador ${form.nome} cadastrado com sucesso!`);
                onVoltar();
            } else {
                alert(data.error || 'Erro ao cadastrar.');
            }
        } catch (error) {
            alert('Erro de conexão com o servidor.');
            console.error(error);
        }
    };

    return (
        <div className="login-screen">
            <form className="login-container" onSubmit={handleRegister}>
                <h2>Novo Administrador</h2>
                <input type="text" placeholder="Nome Completo" onChange={(e) => setForm({...form, nome: e.target.value})} required />
                <input type="email" placeholder="Seu E-mail" onChange={(e) => setForm({...form, email: e.target.value})} required />
                <input type="text" placeholder="Identificação" onChange={(e) => setForm({...form, id: e.target.value})} required />
                <input type="password" placeholder="Crie sua senha" onChange={(e) => setForm({...form, senha: e.target.value})} required />
                <input type="password" placeholder="Confirme sua senha" onChange={(e) => setForm({...form, confirmarSenha: e.target.value})} required />
                <input type="password" placeholder="Digite a senha mestre" onChange={(e) => setForm({...form, senhaMestre: e.target.value})} required />
                <button type="submit" className="login-button">CADASTRAR</button>
                <button type="button" className="btn-clear" onClick={onVoltar}>VOLTAR</button>
            </form>
        </div>
    );
}

export default CadastroAdmin;
