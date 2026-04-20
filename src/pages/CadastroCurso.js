import React, {useState} from 'react';
import { API_URL } from "../api";
import './styles/CadastroCurso.css';

function CadastroCurso() {
    const [formData, setFormData] = useState({
        codigoCurso: '',
        cargaHoraria: '',
        campus: '',
        nomeCurso:'',
        tipoCurso: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${API_URL}/cursos}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: parseInt(formData.codigoCurso),
                    nome: formData.nomeCurso,
                    cargaHoraria: parseInt(formData.cargaHoraria),
                    campus: formData.campus,
                    tipo: formData.tipoCurso
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Curso "${formData.nomeCurso}" cadastrado com sucesso!`);
            } else {
                alert(data.error || 'Erro ao cadastrar curso.');
            } 
        } catch (error) {
            console.error("Erro ao conectar:", error);
            alert('Erro de conexão com o servidor.');
        }
    };

    const handleClear = () => {
        setFormData({
          codigoCurso: '',
          cargaHoraria: '',
          campus: '',
          nomeCurso: '',
          tipoCurso: ''
        });
    };

    return (
        <div className="cadastro-container">
            <h2>Cadastro de Curso</h2>
            <form onSubmit={handleSubmit} className="curso-form">
                <div className="form-group">
                    <label>Código do Curso:</label>
                    <input type="text" name="codigoCurso" value={formData.codigoCurso} onChange={handleChange} placeholder="Ex: 12345" required/>
                </div>

                <div className="form-group">
                    <label>Nome do Curso:</label>
                    <input type="text" name="nomeCurso" value={formData.nomeCurso} onChange={handleChange} placeholder="Ex: Engenharia de Software" required/>
                </div>

                <div className="form-group">
                    <label>Carga Horária:</label>
                    <input type="number" name="cargaHoraria" value={formData.cargaHoraria} onChange={handleChange} placeholder="Ex: 1000" required/>
                </div>

                <div className="form-group">
                    <label>Campus:</label>
                    <input type="text" name="campus" value={formData.campus} onChange={handleChange} placeholder="Ex: Paulista" required/>
                </div>

                <div className="form-group">
                    <label>Tipo do Curso:</label>
                    <div className="radio-group">
                        {['Bacharel', 'Gestão', 'Tecnólogo', 'Mestrado', 'Doutorado'].map((tipo) => (
                            <label key={tipo} className="radio-label">
                                <input type="radio" name="tipoCurso" value={tipo} onChange={handleChange} checked={formData.tipoCurso === tipo} required/>
                                {tipo}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="button-row">
                    <button type="submit" className="btn-save">SALVAR</button>
                    <button type="button" className="btn-clear" onClick={handleClear}>LIMPAR</button>
                </div>
            </form>
        </div>
    );
}

export default CadastroCurso;