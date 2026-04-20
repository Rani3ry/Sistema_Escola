import React, { useEffect, useState } from "react";
import { API_URL } from "../api";
import './styles/MostrarCurso.css';

function MostrarCurso({ role, userDados }) {
    const [listaCursos, setListaCursos] = useState([]);
    const [cursoSelecionado, setCursoSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [formEdit, setFormEdit] = useState({
        nome: '',
        tipo: '',
        cargaHoraria: '',
        campus: ''
    });

    const carregarCursos = async () => {
        try {
            const response = await fetch(`${API_URL}/cursos}`);
            const data = await response.json();
            setListaCursos(data);
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
        }
    };

    const buscarDetalhesCurso = async (id) => {
        if (!id) {
            setCursoSelecionado(null);
            setModoEdicao(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/cursos/${id}`);
            const data = await response.json();
            setCursoSelecionado(data);
            setFormEdit({
                nome: data?.nome || '',
                tipo: data?.tipo || '',
                cargaHoraria: data?.cargaHoraria || '',
                campus: data?.campus || ''
            });
        } catch (error) {
            console.error('Erro ao buscar detalhes do curso:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role === 'admin') {
            carregarCursos();
            setCursoSelecionado(null);
            setModoEdicao(false);
            return;
        }

        const cursoId = userDados?.cursoId || userDados?.curso?.id;
        if (cursoId) {
            buscarDetalhesCurso(cursoId);
        }
    }, [role, userDados]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleSalvarAlteracao = async () => {
        try {
            const response = await fetch(`${API_URL}/cursos/${cursoSelecionado.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: formEdit.nome,
                    tipo: formEdit.tipo,
                    cargaHoraria: parseInt(formEdit.cargaHoraria),
                    campus: formEdit.campus
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Curso atualizado com sucesso!');
                setModoEdicao(false);
                buscarDetalhesCurso(cursoSelecionado.id);
                carregarCursos();
            } else {
                alert(data.error || 'Falha ao atualizar o curso.');
            }
        } catch (error) {
            console.error('Erro ao salvar alterações:', error);
            alert('Falha ao atualizar o curso.');
        }
    };

    const handleExcluir = async () => {
        if (!window.confirm(`Tem certeza que deseja excluir o curso ${cursoSelecionado.nome}?`)) return;

        try {
            const response = await fetch(`${API_URL}/cursos/${cursoSelecionado.id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                alert('Curso excluído com sucesso!');
                setCursoSelecionado(null);
                setModoEdicao(false);
                carregarCursos();
            } else {
                alert(data.error || 'Falha ao excluir o curso.');
            }
        } catch (error) {
            console.error('Erro ao excluir curso:', error);
            alert('Falha ao excluir o curso.');
        }
    };

    return (
        <div className="mostrar-container">
            <div className="header-mostrar">
                <h2>Informações do Curso</h2>
                <span className="role-indicator">Acesso: {role.toUpperCase()}</span>
            </div>

            {role === 'admin' && (
                <div className="seletor-admin">
                    <label>Selecione um curso:</label>
                    <select
                        onChange={(e) => {
                            buscarDetalhesCurso(e.target.value);
                            setModoEdicao(false);
                        }}
                        value={cursoSelecionado?.id || ""}
                    >
                        <option value="">-- Escolha um curso --</option>
                        {listaCursos.map((curso) => (
                            <option key={curso.id} value={curso.id}>
                                {curso.id} - {curso.nome}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {loading && <p>Carregando curso...</p>}

            {!loading && !cursoSelecionado && role !== 'admin' && (
                <p>Nenhum curso vinculado foi encontrado para este usuário.</p>
            )}

            {cursoSelecionado && (
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
                            <p className="destaque">{cursoSelecionado.nome}</p>
                        )}

                        {role === 'admin' && (
                            <div className="acoes-admin">
                                {modoEdicao ? (
                                    <>
                                        <button className="btn-save" onClick={handleSalvarAlteracao}>Salvar</button>
                                        <button
                                            className="btn-cancel"
                                            onClick={() => {
                                                setModoEdicao(false);
                                                setFormEdit({
                                                    nome: cursoSelecionado.nome,
                                                    tipo: cursoSelecionado.tipo,
                                                    cargaHoraria: cursoSelecionado.cargaHoraria,
                                                    campus: cursoSelecionado.campus
                                                });
                                            }}
                                        >
                                            Cancelar
                                        </button>
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
                            <label>ID do Curso</label>
                            <p>{cursoSelecionado.id}</p>
                        </div>
                        <div className="info-box">
                            <label>Tipo</label>
                            {modoEdicao ? (
                                <select name="tipo" value={formEdit.tipo} onChange={handleInputChange}>
                                    <option value="Tecnólogo">Tecnólogo</option>
                                    <option value="Bacharel">Bacharel</option>
                                    <option value="Gestão">Gestão</option>
                                    <option value="Mestrado">Mestrado</option>
                                    <option value="Doutorado">Doutorado</option>
                                </select>
                            ) : (
                                <p>{cursoSelecionado.tipo}</p>
                            )}
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="info-box">
                            <label>Carga Horária (Hrs)</label>
                            {modoEdicao ? (
                                <input type="number" name="cargaHoraria" value={formEdit.cargaHoraria} onChange={handleInputChange} />
                            ) : (
                                <p>{cursoSelecionado.cargaHoraria}h</p>
                            )}
                        </div>
                        <div className="info-box">
                            <label>Campus</label>
                            {modoEdicao ? (
                                <input type="text" name="campus" value={formEdit.campus} onChange={handleInputChange} />
                            ) : (
                                <p>{cursoSelecionado.campus}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MostrarCurso;
