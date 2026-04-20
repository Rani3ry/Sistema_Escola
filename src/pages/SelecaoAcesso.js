import React from "react";
import './styles/SelecaoAcesso.css';

function SelecaoAcesso({onEscolha}) {
    return (
        <div className="selecao-container">
            <div className="selecao-card">
                <h1>Portal Acadêmico</h1>
                <p>Selecione seu nível de acesso:</p>
                <div className="grid-botoes">
                    <button className="btn-acesso" onClick={() => onEscolha('aluno')}>
                        <span className="icon">🎓</span> Login Aluno
                    </button>
                    <button className="btn-acesso" onClick={() => onEscolha('professor')}>
                        <span className="icon">👩‍🏫</span> Login Professor
                    </button>
                    <button className="btn-acesso" onClick={() => onEscolha('admin')}>
                        <span className="icon">🛠️</span> Login Admin
                    </button>
                    <div className="divisor">ou</div>
                    <button className="btn-cadastro-admin" onClick={() => onEscolha('registrar-admin')}>
                        Criar Conta Administrador
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SelecaoAcesso;