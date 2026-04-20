import React, {useState} from "react";
import { API_URL } from "../api";
import './styles/CadastroAluno.css';

function CadastroAluno() {
    const [formData, setFormData] = useState({
        matricula: '',
        nomeAluno: '',
        senha: '',
        DtNascimento: '',
        endereco: '',
        codCurso: ''
    });

    const [verSenha, setVerSenha] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/alunos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matricula: parseInt(formData.matricula),
                    nome: formData.nomeAluno,
                    senha: formData.senha,
                    dataNasc: new Date (formData.DtNascimento).toISOString(),
                    endereco: formData.endereco,
                    cursoId: parseInt(formData.codCurso)
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Aluno ${formData.nomeAluno} cadastrado com sucesso!`);
            } else {
                alert(data.error || 'Erro ao cadastrar aluno.');
            }
        } catch (error) {
            alert('Erro de conexão com o servidor.');
            console.error(error);
        }
    }

    const handleClear = () => {
        setFormData({
            matricula: '',
            nomeAluno: '',
            senha: '',
            DtNascimento: '',
            endereco: '',
            codCurso: ''
        });
    };

    return (
        <div className="cadastro-container wide">
            <h2>Cadastro de Aluno</h2>
            <form onSubmit={handleSubmit} className="aluno-form">

                <div className="form-row">
                    <div className="form-group flex-1">
                        <label>Matrícula:</label>
                        <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} placeholder="Ex: 2024001" required/>
                    </div>
                    <div className="form-group flex-2">
                        <label>Nome Completo:</label>
                        <input type="text" name="nomeAluno" value={formData.nomeAluno} onChange={handleChange} placeholder="Ex: João da Silva" required/>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group flex-1">
                        <label>Senha de Acesso:</label>
                        <div className="password-container">
                            <input 
                                type={verSenha ? "text" : "password"} 
                                name="senha" 
                                value={formData.senha} 
                                onChange={handleChange} 
                                placeholder="Crie uma senha" 
                                required
                            />
                            <button 
                                type="button" 
                                className="toggle-password"
                                onClick={() => setVerSenha(!verSenha)}
                            >
                                {verSenha ? "🔒" : "👁️"}
                            </button>
                        </div>
                    </div>
                    <div className="form-group flex-1">
                        <label>Data de Nascimento:</label>
                        <input type="date" name="DtNascimento" value={formData.DtNascimento} onChange={handleChange} required/>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group flex-3">
                        <label>Endereço:</label>
                        <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua, Nº, Bairro, Cidade" required/>
                    </div>
                    <div className="form-group flex-1">
                        <label>Código do Curso:</label>
                        <input type="text" name="codCurso" value={formData.codCurso} onChange={handleChange} placeholder="Ex: 10" required/>
                    </div>
                </div>

                <div className="button-row">
                    <button type="submit" className="btn-save">CADASTRAR ALUNO</button>
                    <button type="button" className="btn-clear" onClick={handleClear}>LIMPAR</button>
                </div>        
            </form>
        </div>
    );
}

export default CadastroAluno;