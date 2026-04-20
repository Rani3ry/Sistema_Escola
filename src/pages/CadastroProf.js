import React, {useEffect, useState} from "react";
import { API_URL } from "../api";
import './styles/CadastroProf.css';

function CadastroProf() {
    const [formData, setFormData] = useState({
        matricula: '',
        nome: '',
        email: '',
        senha: '',
        endereco: '',
        dtNasc: '',
        telefone: '',
        especialidade: '',
        cursoId: '',
        disciplinaId: '',
        titulo: ''
    });

    const [verSenha, setVerSenha] = useState(false);
    const [cursos, setCursos] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);

    useEffect(() => {
        const carregarCursos = async () => {
            try {
                const response = await fetch(`${API_URL}/cursos`);
                const data = await response.json();

                if (response.ok) {
                    setCursos(data);
                }
            } catch (error) {
                console.error("Erro ao carregar cursos:", error);
            }
        };

        carregarCursos();
    }, []);

    useEffect(() => {
        const carregarDisciplinas = async () => {
            if (!formData.cursoId) {
                setDisciplinas([]);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/disciplinas?cursoId=${formData.cursoId}`);
                const data = await response.json();

                if (response.ok) {
                    setDisciplinas(data);
                } else {
                    setDisciplinas([]);
                }
            } catch (error) {
                console.error("Erro ao carregar disciplinas:", error);
                setDisciplinas([]);
            }
        };

        carregarDisciplinas();
    }, [formData.cursoId]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'cursoId' ? { disciplinaId: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${API_URL}/professores}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matricula: formData.matricula,
                    nome: formData.nome,
                    senha: formData.senha,
                    email: formData.email,
                    endereco: formData.endereco,
                    dtNasc: new Date (formData.dtNasc).toISOString(),
                    telefone: formData.telefone,
                    especialidade: formData.especialidade,
                    cursoId: parseInt(formData.cursoId),
                    disciplinaId: parseInt(formData.disciplinaId),
                    titulo: formData.titulo
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Professor ${formData.nome} cadastrado com sucesso!`);
            } else {
                alert(data.error || 'Erro ao cadastrar professor.');
            }
        } catch (error) {
            alert('Erro de conexão com o servidor.');
            console.error("Erro de conexão:", error);
        }
    };

    const handleClear = () => {
        setFormData({
            matricula: '',
            nome: '',
            email: '',
            senha: '',
            endereco: '',
            dtNasc: '',
            telefone: '',
            especialidade: '',
            cursoId: '',
            disciplinaId: '',
            titulo: ''
        });
    };

    return (
        <div className="cadastro-container wide">
            <h2>Cadastro de Professores</h2>
            <form onSubmit={handleSubmit} className="professor-form">
                
                <div className="form-row">
                    <div className="form-group flex-1">
                        <label>Matrícula do Professor:</label>
                        <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} placeholder="Ex: 835052-N" required />
                    </div>
                    <div className="form-group flex-2">
                        <label>Nome do Professor:</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome Completo" required />
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
                            <button type="button" className="toggle-password" onClick={() => setVerSenha(!verSenha)}>
                                {verSenha ? "🔒" : "👁️"}
                            </button>
                        </div>
                    </div>
                    <div className="form-group flex-1">
                        <label>Email:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@faculdade.com" required/>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group flex-3">
                        <label>Endereço:</label>
                        <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Logradouro, número, bairro" required/>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group flex-1">
                        <label>Data de Nascimento:</label>
                        <input type="date" name="dtNasc" value={formData.dtNasc} onChange={handleChange} required/>
                    </div>
                    <div className="form-group flex-1">
                        <label>Telefone:</label>
                        <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(11) 98765-4321" required/>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group flex-1">
                        <label>Especialidade:</label>
                        <input type="text" name="especialidade" value={formData.especialidade} onChange={handleChange} placeholder="Ex: Engenharia de Dados" required/>
                    </div>
                    <div className="form-group flex-1">
                        <label>Código do Curso:</label>
                        <select name="cursoId" value={formData.cursoId} onChange={handleChange} required>
                            <option value="">Selecione um curso</option>
                            {cursos.map((curso) => (
                                <option key={curso.id} value={curso.id}>
                                    {curso.id} - {curso.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group flex-1">
                        <label>Código da Disciplina:</label>
                        <select
                            name="disciplinaId"
                            value={formData.disciplinaId}
                            onChange={handleChange}
                            required
                            disabled={!formData.cursoId}
                        >
                            <option value="">Selecione uma disciplina</option>
                            {disciplinas.map((disciplina) => (
                                <option key={disciplina.id} value={disciplina.id}>
                                    {disciplina.id} - {disciplina.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Título do Professor:</label>
                    <div className="radio-group-horizontal">
                        {['Técnico', 'Graduado', 'Doutor', 'Mestre'].map((t) => (
                            <label key={t} className="radio-item">
                                <input type="radio" name="titulo" value={t} checked={formData.titulo === t} onChange={handleChange} required />
                                {t}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="button-row">
                    <button type="submit" className="btn-save">SALVAR PROFESSOR</button>
                    <button type="button" className="btn-clear" onClick={handleClear}>LIMPAR</button>
                </div>
            </form>
        </div>
    );
}

export default CadastroProf;
