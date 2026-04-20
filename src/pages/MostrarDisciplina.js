import React, { useEffect, useState } from "react";
import { API_URL } from "../api";
import './styles/MostrarCurso.css';
import './styles/MostrarDisciplina.css';
import { calculateAcademicStatus } from '../utils/academicStatus';

function getStatusClass(status) {
    if (status === 'APROVADO') return 'status-aprovado';
    if (status === 'APROVADO NA RECUPERACAO') return 'status-aprovado-rec';
    if (status === 'EM RECUPERACAO') return 'status-recuperacao';
    if (status === 'REPROVADO') return 'status-reprovado';
    return '';
}

function MostrarDisciplina({ role, userDados }) {
    const [cursos, setCursos] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
    const [cursoSelecionado, setCursoSelecionado] = useState('');
    const [alunosMatriculados, setAlunosMatriculados] = useState([]);
    const [registroAluno, setRegistroAluno] = useState(null);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [formEdit, setFormEdit] = useState({
        nome: '',
        cargaHoraria: '',
        aulasSemana: ''
    });

    const preencherFormulario = (disciplina) => {
        setFormEdit({
            nome: disciplina?.nome || '',
            cargaHoraria: disciplina?.cargaHoraria || '',
            aulasSemana: disciplina?.aulasSemana || ''
        });
    };

    const carregarCursos = async () => {
        try {
            const response = await fetch(`${API_URL}/cursos`);
            const data = await response.json();
            setCursos(data);
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
        }
    };

    const carregarDisciplinas = async (cursoId) => {
        if (!cursoId) {
            setDisciplinas([]);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/disciplinas?cursoId=${cursoId}`);
            const data = await response.json();
            setDisciplinas(data);
        } catch (error) {
            console.error('Erro ao carregar disciplinas:', error);
        }
    };

    const buscarDetalhesDisciplina = async (disciplinaId) => {
        if (!disciplinaId) {
            setDisciplinaSelecionada(null);
            setModoEdicao(false);
            return;
        }

        const disciplina = disciplinas.find((item) => String(item.id) === String(disciplinaId))
            || (userDados?.disciplina && String(userDados.disciplina.id) === String(disciplinaId) ? userDados.disciplina : null);

        if (disciplina) {
            setDisciplinaSelecionada(disciplina);
            preencherFormulario(disciplina);
        }
    };

    useEffect(() => {
        if (role === 'admin') {
            carregarCursos();
            return;
        }

        if (role === 'professor' && userDados?.disciplina) {
            setDisciplinaSelecionada(userDados.disciplina);
            setCursoSelecionado(String(userDados.cursoId || userDados.curso?.id || ''));
            preencherFormulario(userDados.disciplina);
            return;
        }

        if (role === 'aluno' && userDados?.cursoId) {
            setCursoSelecionado(String(userDados.cursoId));
            carregarDisciplinas(userDados.cursoId);
        }
    }, [role, userDados]);

    useEffect(() => {
        if (role === 'admin' && cursoSelecionado) {
            carregarDisciplinas(cursoSelecionado);
        }
    }, [role, cursoSelecionado]);

    useEffect(() => {
        if (!disciplinaSelecionada?.id) {
            setAlunosMatriculados([]);
            return;
        }

        if (role === 'professor') {
            fetch(`${API_URL}/alunos?disciplinaId=${disciplinaSelecionada.id}`)
                .then((res) => res.json())
                .then((data) => setAlunosMatriculados(data))
                .catch((error) => console.error('Erro ao carregar alunos da disciplina:', error));
        }
    }, [role, disciplinaSelecionada]);

    useEffect(() => {
        if (role !== 'aluno' || !disciplinaSelecionada?.id || !userDados?.matricula) {
            setRegistroAluno(null);
            return;
        }

        fetch(`${API_URL}/registros?disciplinaId=${disciplinaSelecionada.id}&matricula=${userDados.matricula}`)
        fetch(`${API_URL}/notas?disciplinaId=${disciplinaSelecionada.id}&alunoId=${userDados.matricula}`)
            .then((res) => res.json())
            .then((data) => setRegistroAluno(data.registro || null))
            .catch((error) => console.error('Erro ao carregar notas do aluno:', error));
    }, [role, disciplinaSelecionada, userDados]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancelarEdicao = () => {
        setModoEdicao(false);
        preencherFormulario(disciplinaSelecionada);
    };

    const handleSalvarAlteracao = async () => {
        try {
            const response = await fetch(`${API_URL}/disciplinas/${disciplinaSelecionada.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: formEdit.nome,
                    cargaHoraria: parseInt(formEdit.cargaHoraria, 10),
                    aulasSemana: parseInt(formEdit.aulasSemana, 10)
                })
            });

            const data = await response.json();

            if (response.ok) {
                const atualizado = {
                    ...disciplinaSelecionada,
                    nome: data.nome,
                    cargaHoraria: data.cargaHoraria,
                    aulasSemana: data.aulasSemana
                };

                alert('Disciplina atualizada com sucesso!');
                setDisciplinaSelecionada(atualizado);
                preencherFormulario(atualizado);
                setModoEdicao(false);
                await carregarDisciplinas(cursoSelecionado || disciplinaSelecionada.cursoId);
            } else {
                alert(data.error || 'Falha ao atualizar a disciplina.');
            }
        } catch (error) {
            console.error('Erro ao atualizar disciplina:', error);
            alert('Falha ao atualizar a disciplina.');
        }
    };

    const handleExcluir = async () => {
        if (!window.confirm(`Tem certeza que deseja excluir a disciplina ${disciplinaSelecionada.nome}?`)) return;

        try {
            const response = await fetch(`${API_URL}/disciplinas/${disciplinaSelecionada.id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                alert('Disciplina excluída com sucesso!');
                setDisciplinaSelecionada(null);
                setModoEdicao(false);
                carregarDisciplinas(cursoSelecionado);
            } else {
                alert(data.error || 'Falha ao excluir a disciplina.');
            }
        } catch (error) {
            console.error('Erro ao excluir disciplina:', error);
            alert('Falha ao excluir a disciplina.');
        }
    };

    const statusAluno = calculateAcademicStatus(registroAluno);

    return (
        <div className="mostrar-container wide">
            <div className="header-mostrar">
                <h2>Informações da Disciplina</h2>
                <span className="role-indicator">Acesso: {role.toUpperCase()}</span>
            </div>

            {role === 'admin' && (
                <div className="seletor-admin filtro-duplo">
                    <div className="campo-selecao">
                        <label>Selecione um curso:</label>
                        <select
                            value={cursoSelecionado}
                            onChange={(e) => {
                                setCursoSelecionado(e.target.value);
                                setDisciplinaSelecionada(null);
                                setModoEdicao(false);
                            }}
                        >
                            <option value="">-- Selecione o curso --</option>
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
                            value={disciplinaSelecionada?.id || ''}
                            onChange={(e) => buscarDetalhesDisciplina(e.target.value)}
                            disabled={!cursoSelecionado}
                        >
                            <option value="">-- Selecione a disciplina --</option>
                            {disciplinas.map((disciplina) => (
                                <option key={disciplina.id} value={disciplina.id}>
                                    {disciplina.id} - {disciplina.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {role === 'aluno' && (
                <div className="seletor-admin">
                    <label>Suas disciplinas:</label>
                    <select
                        value={disciplinaSelecionada?.id || ''}
                        onChange={(e) => buscarDetalhesDisciplina(e.target.value)}
                    >
                        <option value="">Escolha para ver notas e faltas...</option>
                        {disciplinas.map((disciplina) => (
                            <option key={disciplina.id} value={disciplina.id}>
                                {disciplina.nome}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {disciplinaSelecionada && (
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
                            <p className="destaque">{disciplinaSelecionada.nome}</p>
                        )}

                        {role === 'admin' && (
                            <div className="acoes-admin">
                                {modoEdicao ? (
                                    <>
                                        <button className="btn-save" onClick={handleSalvarAlteracao}>Salvar</button>
                                        <button className="btn-cancel" onClick={handleCancelarEdicao}>Cancelar</button>
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
                            <label>ID da Disciplina</label>
                            <p>{disciplinaSelecionada.id}</p>
                        </div>
                        <div className="info-box">
                            <label>ID do Curso</label>
                            <p>{disciplinaSelecionada.cursoId}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="info-box">
                            <label>Carga Horária</label>
                            {modoEdicao ? (
                                <input type="number" name="cargaHoraria" value={formEdit.cargaHoraria} onChange={handleInputChange} />
                            ) : (
                                <p>{disciplinaSelecionada.cargaHoraria}h</p>
                            )}
                        </div>
                        <div className="info-box">
                            <label>Aulas por Semana</label>
                            {modoEdicao ? (
                                <input type="number" name="aulasSemana" value={formEdit.aulasSemana} onChange={handleInputChange} />
                            ) : (
                                <p>{disciplinaSelecionada.aulasSemana}</p>
                            )}
                        </div>
                    </div>

                    {role === 'aluno' && (
                        <>
                            <div className="info-row">
                                <div className="info-box">
                                    <label>Nota 1</label>
                                    <p>{registroAluno?.nota01 ?? '-'}</p>
                                </div>
                                <div className="info-box">
                                    <label>Nota 2</label>
                                    <p>{registroAluno?.nota02 ?? '-'}</p>
                                </div>
                            </div>

                            <div className="info-row">
                                <div className="info-box">
                                    <label>Nota 3</label>
                                    <p>{registroAluno?.nota03 ?? '-'}</p>
                                </div>
                                <div className="info-box">
                                    <label>Faltas</label>
                                    <p>{registroAluno?.faltas ?? '-'}</p>
                                </div>
                            </div>

                            <div className="info-row">
                                <div className="info-box full status-box">
                                    <label>Status</label>
                                    <p className={getStatusClass(statusAluno)}>{statusAluno}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'professor' && (
                        <div className="lista-chamada">
                            <h4>Lista de chamada</h4>
                            {alunosMatriculados.length === 0 ? (
                                <p>Nenhum aluno matriculado nesta disciplina.</p>
                            ) : (
                                <ul>
                                    {alunosMatriculados.map((aluno) => (
                                        <li key={aluno.matricula}>{aluno.matricula} - {aluno.nome}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MostrarDisciplina;
