import React, { useEffect, useState } from 'react';
import { API_URL } from "../api";
import './styles/MostrarCurso.css';
import './styles/MostrarProfessor.css';

function MostrarProfessor({ role, userDados }) {
  const [cursos, setCursos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [cursoSel, setCursoSel] = useState('');
  const [disciplinaSel, setDisciplinaSel] = useState('');
  const [profSel, setProfSel] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formEdit, setFormEdit] = useState({
    nome: '',
    titulo: '',
    especialidade: '',
    telefone: '',
    email: '',
    endereco: '',
    cursoId: '',
    disciplinaId: ''
  });

  const carregarCursos = async () => {
    const response = await fetch(`${API_URL}/cursos}`);
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

  const carregarProfessores = async (cursoId) => {
    if (!cursoId) {
      setProfessores([]);
      return;
    }

    const response = await fetch(`${API_URL}/professores?cursoId=${cursoId}`);
    const data = await response.json();
    setProfessores(data);
  };

  const preencherFormulario = (professor) => {
    setFormEdit({
      nome: professor?.nome || '',
      titulo: professor?.titulo || '',
      especialidade: professor?.especialidade || '',
      telefone: professor?.telefone || '',
      email: professor?.email || '',
      endereco: professor?.endereco || '',
      cursoId: professor?.cursoId || '',
      disciplinaId: professor?.disciplinaId ?? ''
    });
  };

  useEffect(() => {
    if (role === 'professor' && userDados) {
      setProfSel(userDados);
      setCursoSel(String(userDados.cursoId || ''));
      setDisciplinaSel(userDados.disciplinaId ? String(userDados.disciplinaId) : '');
      preencherFormulario(userDados);
      return;
    }

    if (role === 'aluno' && userDados?.cursoId) {
      setCursoSel(String(userDados.cursoId));
      carregarDisciplinas(userDados.cursoId);
      carregarProfessores(userDados.cursoId);
      return;
    }

    if (role === 'admin') {
      carregarCursos();
    }
  }, [role, userDados]);

  useEffect(() => {
    if (role === 'admin' && cursoSel) {
      carregarDisciplinas(cursoSel);
      carregarProfessores(cursoSel);
    }
  }, [role, cursoSel]);

  const professoresAluno = professores.filter((professor) => String(professor.disciplinaId) === String(disciplinaSel));
  const professoresAdmin = professores.filter((professor) => {
    if (!disciplinaSel) return false;
    return String(professor.disciplinaId) === String(disciplinaSel) || professor.disciplinaId === null;
  });

  const selecionarProfessor = (matricula) => {
    const professor = professores.find((item) => item.matricula === matricula) || null;
    setProfSel(professor);
    setModoEdicao(false);
    preencherFormulario(professor);
  };

  const handleExcluir = async () => {
    if (!window.confirm("Deseja remover este professor do sistema?")) return;

    try {
      const response = await fetch(`${API_URL}/professores/${profSel.matricula}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Professor excluído com sucesso.');
        setProfSel(null);
        setModoEdicao(false);
        carregarProfessores(cursoSel);
      } else {
        const data = await response.json();
        alert(data.error || 'Falha ao excluir professor.');
      }
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      alert('Falha ao excluir professor.');
    }
  };

  const handleSalvar = async () => {
    try {
      const response = await fetch(`${API_URL}/professores/${profSel.matricula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formEdit.nome,
          titulo: formEdit.titulo,
          especialidade: formEdit.especialidade,
          telefone: formEdit.telefone,
          email: formEdit.email,
          endereco: formEdit.endereco,
          cursoId: parseInt(formEdit.cursoId, 10),
          disciplinaId: formEdit.disciplinaId === '' ? null : parseInt(formEdit.disciplinaId, 10)
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Professor atualizado com sucesso!');
        setProfSel(data);
        setModoEdicao(false);
        setCursoSel(String(data.cursoId));
        setDisciplinaSel(data.disciplinaId ? String(data.disciplinaId) : '');
        preencherFormulario(data);
        await carregarDisciplinas(data.cursoId);
        carregarProfessores(data.cursoId);
      } else {
        alert(data.error || 'Falha ao atualizar professor.');
      }
    } catch (error) {
      console.error('Erro ao atualizar professor:', error);
      alert('Falha ao atualizar professor.');
    }
  };

  const handleCancelar = () => {
    setModoEdicao(false);
    preencherFormulario(profSel);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormEdit((prev) => ({ ...prev, [name]: value }));

    if (name === 'cursoId') {
      carregarDisciplinas(value);
      setFormEdit((prev) => ({ ...prev, cursoId: value, disciplinaId: '' }));
    }
  };

  return (
    <div className="mostrar-container wide">
      <div className="header-mostrar">
        <h2>{role === 'professor' ? 'Informações do Professor' : 'Consulta de Professores'}</h2>
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
                setProfSel(null);
                setModoEdicao(false);
              }}
            >
              <option value="">-- Selecione um curso --</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>{curso.id} - {curso.nome}</option>
              ))}
            </select>
          </div>

          <div className="campo-selecao">
            <label>Selecione uma disciplina:</label>
            <select
              value={disciplinaSel}
              disabled={!cursoSel}
              onChange={(e) => {
                setDisciplinaSel(e.target.value);
                setProfSel(null);
                setModoEdicao(false);
              }}
            >
              <option value="">-- Selecione uma disciplina --</option>
              {disciplinas.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>{disciplina.id} - {disciplina.nome}</option>
              ))}
            </select>
          </div>

          <div className="campo-selecao">
            <label>Selecione um professor:</label>
            <select value={profSel?.matricula || ''} disabled={!disciplinaSel} onChange={(e) => selecionarProfessor(e.target.value)}>
              <option value="">-- Selecione um professor --</option>
              {professoresAdmin.map((professor) => (
                <option key={professor.matricula} value={professor.matricula}>
                  {professor.nome}{professor.disciplinaId === null ? ' (sem disciplina)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {role === 'aluno' && (
        <div className="seletor-admin filtro-duplo">
          <div className="campo-selecao">
            <label>Selecione a disciplina:</label>
            <select value={disciplinaSel} onChange={(e) => { setDisciplinaSel(e.target.value); setProfSel(null); }}>
              <option value="">-- Selecione a disciplina --</option>
              {disciplinas.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
              ))}
            </select>
          </div>

          <div className="campo-selecao">
            <label>Selecione o professor:</label>
            <select value={profSel?.matricula || ''} disabled={!disciplinaSel} onChange={(e) => selecionarProfessor(e.target.value)}>
              <option value="">-- Selecione o professor --</option>
              {professoresAluno.map((professor) => (
                <option key={professor.matricula} value={professor.matricula}>{professor.nome}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {profSel && (
        <div className={`curso-card animate-in ${modoEdicao ? 'editando' : ''}`}>
          <div className="card-header">
            {modoEdicao ? (
              <input
                type="text"
                name="nome"
                className="input-edit-titulo"
                value={formEdit.nome}
                onChange={handleEditChange}
              />
            ) : (
              <p className="destaque">{profSel.nome}</p>
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
                    <button onClick={() => setModoEdicao(true)} className="btn-edit">Alterar</button>
                    <button onClick={handleExcluir} className="btn-delete">Excluir</button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="info-row">
            <div className="info-box">
              <label>Título</label>
              {modoEdicao ? (
                <input type="text" name="titulo" value={formEdit.titulo} onChange={handleEditChange} />
              ) : (
                <p className="badge-titulo">{profSel.titulo}</p>
              )}
            </div>
            <div className="info-box">
              <label>Especialidade</label>
              {modoEdicao ? (
                <input type="text" name="especialidade" value={formEdit.especialidade} onChange={handleEditChange} />
              ) : (
                <p>{profSel.especialidade}</p>
              )}
            </div>
          </div>

          <div className="info-row">
            <div className="info-box">
              <label>Telefone</label>
              {modoEdicao ? (
                <input type="text" name="telefone" value={formEdit.telefone} onChange={handleEditChange} />
              ) : (
                <p>{profSel.telefone}</p>
              )}
            </div>
            <div className="info-box">
              <label>E-mail</label>
              {modoEdicao ? (
                <input type="email" name="email" value={formEdit.email} onChange={handleEditChange} />
              ) : (
                <p>{profSel.email}</p>
              )}
            </div>
          </div>

          <div className="info-row">
            <div className="info-box full">
              <label>Endereço</label>
              {modoEdicao ? (
                <input type="text" name="endereco" value={formEdit.endereco} onChange={handleEditChange} />
              ) : (
                <p>{profSel.endereco}</p>
              )}
            </div>
          </div>

          <div className="info-row">
            <div className="info-box">
              <label>Curso atuante</label>
              {modoEdicao ? (
                <select name="cursoId" value={formEdit.cursoId} onChange={handleEditChange}>
                  <option value="">Selecione um curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>{curso.id} - {curso.nome}</option>
                  ))}
                </select>
              ) : (
                <p>{profSel.curso?.nome || profSel.cursoId}</p>
              )}
            </div>
            <div className="info-box">
              <label>Disciplina ministrada</label>
              {modoEdicao ? (
                <select name="disciplinaId" value={formEdit.disciplinaId} onChange={handleEditChange}>
                  <option value="">Sem disciplina</option>
                  {disciplinas.map((disciplina) => (
                    <option key={disciplina.id} value={disciplina.id}>{disciplina.id} - {disciplina.nome}</option>
                  ))}
                </select>
              ) : (
                <p>{profSel.disciplina?.nome || 'Sem disciplina atribuída'}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MostrarProfessor;
