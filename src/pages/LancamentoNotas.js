import React, { useEffect, useState } from 'react';
import { API_URL } from "../api";
import './styles/LancamentoNotas.css';
import { calculateAcademicStatus, hasLaunchedValue } from '../utils/academicStatus';

function LancamentoNotas({ professorLogado }) {
  const [alunos, setAlunos] = useState([]);
  const [notaData, setNotaData] = useState({
    alunoId: '',
    nota01: '',
    nota02: '',
    nota03: '',
    faltas: ''
  });

  useEffect(() => {
    if (professorLogado?.disciplinaId) {
      fetch(`${API_URL}/alunos?disciplinaId=${professorLogado.disciplinaId}`)
        .then((res) => res.json())
        .then((data) => setAlunos(data))
        .catch((err) => console.error('Erro ao buscar alunos:', err));
    } else {
      setAlunos([]);
    }
  }, [professorLogado]);

  useEffect(() => {
    if (!notaData.alunoId || !professorLogado?.disciplinaId) {
      setNotaData((prev) => ({
        ...prev,
        nota01: '',
        nota02: '',
        nota03: '',
        faltas: ''
      }));
      return;
    }

    fetch(`${API_URL}/notas?alunoId=${notaData.alunoId}&disciplinaId=${professorLogado.disciplinaId}`)
      .then((res) => res.json())
      .then((data) => {
        const registro = data.registro;
        const registroVazio = registro
          && !hasLaunchedValue(registro.nota01)
          && !hasLaunchedValue(registro.nota02)
          && !hasLaunchedValue(registro.nota03)
          && Number(registro.faltas || 0) === 0;

        setNotaData((prev) => ({
          ...prev,
          nota01: registroVazio ? '' : (registro?.nota01 ?? ''),
          nota02: registroVazio ? '' : (registro?.nota02 ?? ''),
          nota03: registroVazio ? '' : (registro?.nota03 ?? ''),
          faltas: registroVazio ? '' : (registro?.faltas ?? '')
        }));
      })
      .catch((err) => console.error('Erro ao buscar notas do aluno:', err));
  }, [notaData.alunoId, professorLogado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotaData((prev) => ({ ...prev, [name]: value }));
  };

  const temNota01 = hasLaunchedValue(notaData.nota01);
  const temNota02 = hasLaunchedValue(notaData.nota02);
  const temNota03 = hasLaunchedValue(notaData.nota03);
  const faltasNumero = notaData.faltas === '' ? 0 : parseInt(notaData.faltas, 10) || 0;
  const mediaParcial = temNota01 && temNota02 ? (parseFloat(notaData.nota01) + parseFloat(notaData.nota02)) / 2 : null;
  const precisaRecuperacao = mediaParcial !== null && mediaParcial < 6;

  const status = calculateAcademicStatus({
    nota01: temNota01 ? parseFloat(notaData.nota01) : null,
    nota02: temNota02 ? parseFloat(notaData.nota02) : null,
    nota03: temNota03 ? parseFloat(notaData.nota03) : null,
    faltas: faltasNumero
  });

  let classeStatus = 'status-recuperacao';
  if (status === 'APROVADO' || status === 'APROVADO NA RECUPERACAO') {
    classeStatus = 'status-aprovado';
  } else if (status === 'REPROVADO') {
    classeStatus = 'status-reprovado';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const body = {
        alunoId: notaData.alunoId,
        disciplinaId: professorLogado.disciplinaId
      };

      if (notaData.nota01 !== '') body.nota01 = notaData.nota01;
      if (notaData.nota02 !== '') body.nota02 = notaData.nota02;
      if (notaData.nota03 !== '') body.nota03 = notaData.nota03;
      if (notaData.faltas !== '') body.faltas = notaData.faltas;

      const response = await fetch(`${API_URL}/notas}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const alunoSelecionado = alunos.find((aluno) => String(aluno.matricula) === String(notaData.alunoId));
        alert(`Notas lançadas com sucesso para ${alunoSelecionado?.nome || notaData.alunoId}!\nStatus: ${status}`);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao lançar notas.');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
      console.error(error);
    }
  };

  return (
    <div className="cadastro-container wide">
      <div className="info-professor-header">
        <h2>Lançamento de Notas e Faltas</h2>
        {professorLogado && (
          <div className="badge-info">
            <span><strong>Professor:</strong> {professorLogado.nome}</span>
            <span><strong>Disciplina:</strong> {professorLogado.disciplina?.nome || '-'}</span>
            <span><strong>Curso:</strong> {professorLogado.curso?.nome || '-'}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="aluno-form">
        <div className="form-row">
          <div className="form-group flex-2">
            <label>Selecionar Aluno:</label>
            <select name="alunoId" value={notaData.alunoId} onChange={handleChange} required>
              <option value="">Selecione um aluno...</option>
              {alunos.map((aluno) => (
                <option key={aluno.matricula} value={aluno.matricula}>
                  {aluno.nome} ({aluno.matricula})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label>Situação do Aluno:</label>
            <div className={`status-badge ${classeStatus}`}>
              {status}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>Nota Prova 01:</label>
            <input type="number" step="0.1" name="nota01" value={notaData.nota01} onChange={handleChange} />
          </div>
          <div className="form-group flex-1">
            <label>Nota Prova 02:</label>
            <input type="number" step="0.1" name="nota02" value={notaData.nota02} onChange={handleChange} />
          </div>

          {precisaRecuperacao && (
            <div className="form-group flex-1 recuperacao-group">
              <label>Nota Recuperação (N3):</label>
              <input type="number" step="0.1" name="nota03" value={notaData.nota03} onChange={handleChange} />
            </div>
          )}

          <div className="form-group flex-1">
            <label>Total de Faltas:</label>
            <input type="number" name="faltas" value={notaData.faltas} onChange={handleChange} />
          </div>
        </div>

        <div className="button-row">
          <button type="submit" className="btn-save">CONFIRMAR LANÇAMENTO</button>
        </div>
      </form>
    </div>
  );
}

export default LancamentoNotas;
