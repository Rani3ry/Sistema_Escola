import React, {useState} from "react";
import { API_URL } from "../api";
import './styles/CadastroDisciplinas.css';

function CadastroDisciplina() {
    const [formData, setFormData] = useState({
        codCurso: '',
        codDisciplina: '',
        nomeDisciplina: '',
        cargaHoraria: '',
        aulasSemana: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${API_URL}/disciplinas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cursoId: parseInt(formData.codCurso),
                    codDisciplina: parseInt(formData.codDisciplina),
                    nome: formData.nomeDisciplina,
                    cargaHoraria: parseInt(formData.cargaHoraria),
                    aulasSemana: parseInt(formData.aulasSemana)
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Disciplina "${formData.nomeDisciplina}" cadastrada com sucesso!`);
            } else {
                alert(data.error || 'Erro ao cadastrar disciplina.');
            } 
        } catch (error) {
            console.error('Erro ao conectar:', error);
            alert('Erro de conexão com o servidor.');
        }
    }

    const handleClear = () => {
        setFormData({
          codCurso: '',
          codDisciplina: '',
          nomeDisciplina: '',
          cargaHoraria: '',
          aulasSemana: ''
        });
    };

    return (
        <div className="cadastro-container">
            <h2>Cadastro de Disciplina</h2>
            <form onSubmit={handleSubmit} className="disciplina-form">
                <div className="form-group">
                    <label>Código do Curso:</label>
                    <input type="text" name="codCurso" value={formData.codCurso} onChange={handleChange} placeholder="Ex: 12345" required/>
                </div>

                <div className="form-group">
                    <label>Código da Disciplina:</label>
                    <input type="text" name="codDisciplina" value={formData.codDisciplina} onChange={handleChange} placeholder="Ex: 12345" required/>
                </div>

                <div className="form-group">
                    <label>Nome da Disciplina:</label>
                    <input type="text" name="nomeDisciplina" value={formData.nomeDisciplina} onChange={handleChange} placeholder="Ex: Algoritmos e Programação" required/>
                </div>

                <div className="form-group">
                    <label>Carga Horária:</label>
                    <input type="number" name="cargaHoraria" value={formData.cargaHoraria} onChange={handleChange} placeholder="Ex: 60" required/>
                </div>

                <div className="form-group">
                    <label>Aulas por Semana:</label>
                    <div className="radio-group-horizontal">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                        <label key={num} className="radio-item">
                            <input type="radio" name="aulasSemana" value={num} onChange={handleChange} checked={formData.aulasSemana === String(num)} required/>
                            {num}
                        </label>
                        ))}
                    </div>
                </div>

                <div className="button-row">
                    <button type="submit" className="btn-save">SALVAR</button>
                    <button type="button" className= "btn-clear" onClick={handleClear}>LIMPAR</button>
                </div>
            </form>
        </div>
    );
}

export default CadastroDisciplina;
