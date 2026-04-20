import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../api";
import './styles/MostrarCurso.css';
import './styles/MostrarAluno.css';
import { calculateAcademicStatus } from '../utils/academicStatus';

function MostrarAluno({ role, userDados }) {
    const [cursos, setCursos] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [cursoSel, setCursoSel] = useState('');
    const [disciplinaSel, setDisciplinaSel] = useState('');
    const [alunoSel, setAlunoSel] = useState(null);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [formEdit, setFormEdit] = useState({
        nome: '',
        senha: '',
        dataNasc: '',
        endereco: '',
        cursoId: ''
    });

    const preencherFormulario = useCallback((aluno) => {
        setFormEdit({
            nome: aluno?.nome || '',
            senha: aluno?.senha || '',
            dataNasc: aluno?.dataNasc ? new Date(aluno.dataNasc).toISOString().slice(0, 10) : '',
            endereco: aluno?.endereco || '',
            cursoId: aluno?.cursoId || ''
        });
    }, []);

    const carregarCursos = async () => {
        const response = await fetch(`${API_URL}/cursos`);
        const data = await response.json();
        setCursos(data);
    };

    const carregarDisciplinas = async (cursoId) => {
        if (!cursoId) {
            setDisciplinas([]);
            return;
        }

        const response = await fetch(`${API_URL}/disciplinas?cursoId=${cursoId}`);
        const data = await response.json();
        setDisciplinas(data);
    };

    const carregarAlunos = async (cursoId, disciplinaId) => {
        const params = new URLSearchParams();
        if (cursoId) params.set('cursoId', cursoId);
        if (disciplinaId) params.set('disciplinaId', disciplinaId);

        const response = await fetch(`${API_URL}/alunos?${params.toString()}`);
        const data = await response.json();
        setAlunos(data);
    };

    const buscarAluno = useCallback(async (matricula) => {
        if (!matricula) {
            setAlunoSel(null);
            setModoEdicao(false);
            return;
        }

        const response = await fetch(`${API_URL}/alunos/${matricula}`);
        const data = await response.json();
        setAlunoSel(data);
        preencherFormulario(data);
    }, [preencherFormulario]);

    useEffect(() => {
        if (role === 'aluno' && userDados?.matricula) {
            buscarAluno(userDados.matricula);
            return;
        }

        if (role === 'professor' && userDados?.cursoId) {
            setCursoSel(String(userDados.cursoId));
            setDisciplinaSel(userDados.disciplinaId ? String(userDados.disciplinaId) : '');
            carregarAlunos(userDados.cursoId, userDados.disciplinaId);
            return;
        }

        if (role === 'admin') {
            carregarCursos();
        }
    }, [role, userDados, buscarAluno]);

    useEffect(() => {
        if (role === 'admin' && cursoSel) {
            carregarDisciplinas(cursoSel);
        }
    }, [role, cursoSel]);

    useEffect(() => {
        if (role === 'admin' && cursoSel && disciplinaSel) {
            carregarAlunos(cursoSel, disciplinaSel);
        }
    }, [role, cursoSel, disciplinaSel]);

    const handleExcluir = async () => {
        if (!window.confirm(`Confirma exclusão do aluno ${alunoSel.nome}?`)) return;

        try {
            const response = await fetch(`${API_URL}/alunos/${alunoSel.matricula}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Aluno removido do sistema.');
                setAlunoSel(null);
                setModoEdicao(false);
                carregarAlunos(cursoSel, disciplinaSel);
            } else {
                const data = await response.json();
                alert(data.error || 'Falha ao excluir aluno.');
            }
        } catch (error) {
            console.error('Erro ao excluir aluno:', error);
            alert('Falha ao excluir aluno.');
        }
    };

    const handleSalvar = async () => {
        try {
            const response = await fetch(`${API_URL}/alunos/${alunoSel.matricula}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: formEdit.nome,
                    senha: formEdit.senha,
                    dataNasc: formEdit.dataNasc,
                    endereco: formEdit.endereco,
                    cursoId: parseInt(formEdit.cursoId, 10)
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Aluno atualizado com sucesso!');
                setModoEdicao(false);
                await buscarAluno(alunoSel.matricula);
                if (role === 'admin') {
                    carregarAlunos(cursoSel, disciplinaSel);
                }
            } else {
                alert(data.error || 'Falha ao atualizar aluno.');
            }
        } catch (error) {
            console.error('Erro ao atualizar aluno:', error);
            alert('Falha ao atualizar aluno.');
        }
    };

    const handleCancelar = () => {
        setModoEdicao(false);
        preencherFormulario(alunoSel);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormEdit((prev) => ({ ...prev, [name]: value }));
    };

    const statusProfessor = role === 'professor'
        ? calculateAcademicStatus(alunoSel?.notasFaltas?.find((item) => String(item.disciplinaId) === String(disciplinaSel)))
        : null;

    return (
        <div className="mostrar-container wide">
            <div className="header-mostrar">
                <h2>{role === 'aluno' ? 'Informações do Aluno' : 'Consulta de Alunos'}</h2>
                <span className="role-indicator">Acesso: {role.toUpperCase()}</span>
            </div>

            {role === 'admin' && (
                <div className="seletor-admin filtro-triplo">
                    <div className="campo-selecao">
                        <label>Selecione um curso:</label>
                        <select
                            value={cursoSel}
                            onChange={(e) => {
                                setCursoSel(e.target.value);
                                setDisciplinaSel('');
                                setAlunoSel(null);
                                setModoEdicao(false);
                            }}
                        >
                            <option value="">-- Selecione um curso --</option>
                            {cursos.map((curso) => (
                                <option key={curso.id} value={curso.id}>
                                    {curso.id} - {curso.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo-selecao">
                        <label>Selecione uma disciplina:</label>
                        <select
                            disabled={!cursoSel}
                            onChange={(e) => {
                                setDisciplinaSel(e.target.value);
                                setAlunoSel(null);
                                setModoEdicao(false);
                            }}
                            value={disciplinaSel}
                        >
                            <option value="">-- Selecione uma disciplina --</option>
                            {disciplinas.map((disciplina) => (
                                <option key={disciplina.id} value={disciplina.id}>
                                    {disciplina.id} - {disciplina.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo-selecao">
                        <label>Selecione um aluno:</label>
                        <select
                            disabled={!disciplinaSel}
                            value={alunoSel?.matricula || ''}
                            onChange={(e) => buscarAluno(e.target.value)}
                        >
                            <option value="">-- Selecione um aluno --</option>
                            {alunos.map((aluno) => (
                                <option key={aluno.matricula} value={aluno.matricula}>
                                    {aluno.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {role === 'professor' && (
                <div className="seletor-admin">
                    <label>Alunos da sua disciplina:</label>
                    <select value={alunoSel?.matricula || ''} onChange={(e) => buscarAluno(e.target.value)}>
                        <option value="">Escolha um aluno para ver detalhes</option>
                        {alunos.map((aluno) => (
                            <option key={aluno.matricula} value={aluno.matricula}>
                                {aluno.nome}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {alunoSel && (
                <div className={`curso-card animate-in ${modoEdicao ? 'editando' : ''}`}>
                    <div className="card-header">
                        {modoEdicao ? (
                            <input
                                type="text"
                                name="nome"
                                className="input-edit-titulo"
                                value={formEdit.nome}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <p className="destaque">{alunoSel.nome}</p>
                        )}

                        {role === 'admin' && (
                            <div className="acoes-admin">
                                {modoEdicao ? (
                                    <>
                                        <button className="btn-save" onClick={handleSalvar}>Salvar</button>
                                        <button className="btn-cancel" onClick={handleCancelar}>Cancelar</button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-edit" onClick={() => setModoEdicao(true)}>Alterar</button>
                                        <button className="btn-delete" onClick={handleExcluir}>Excluir</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="info-row">
                        <div className="info-box">
                            <label>Matrícula</label>
                            <p>{alunoSel.matricula}</p>
                        </div>
                        <div className="info-box">
                            <label>Data de Nascimento</label>
                            {modoEdicao ? (
                                <input type="date" name="dataNasc" value={formEdit.dataNasc} onChange={handleInputChange} />
                            ) : (
                                <p>{new Date(alunoSel.dataNasc).toLocaleDateString('pt-BR')}</p>
                            )}
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="info-box full">
                            <label>Endereço</label>
                            {modoEdicao ? (
                                <input type="text" name="endereco" value={formEdit.endereco} onChange={handleInputChange} />
                            ) : (
                                <p>{alunoSel.endereco}</p>
                            )}
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="info-box">
                            <label>Curso</label>
                            {modoEdicao ? (
                                <select name="cursoId" value={formEdit.cursoId} onChange={handleInputChange}>
                                    {cursos.map((curso) => (
                                        <option key={curso.id} value={curso.id}>
                                            {curso.id} - {curso.nome}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p>{alunoSel.curso?.nome || alunoSel.cursoId}</p>
                            )}
                        </div>
                        <div className="info-box">
                            <label>Código do Curso</label>
                            <p>{alunoSel.cursoId}</p>
                        </div>
                    </div>

                    {role === 'aluno' && (
                        <div className="secao-disciplinas">
                            <h4>Disciplinas vinculadas</h4>
                            <table className="tabela-vinculo">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Nome da Disciplina</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alunoSel.notasFaltas.map((registro) => (
                                        <tr key={registro.id}>
                                            <td>{registro.disciplinaId}</td>
                                            <td>{registro.disciplina?.nome || 'N/A'}</td>
                                            <td>{calculateAcademicStatus(registro)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {role === 'professor' && (
                        <div className="secao-disciplinas">
                            <h4>Status do aluno na disciplina</h4>
                            <p className="status-resumo">{statusProfessor}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MostrarAluno;
