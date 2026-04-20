import React, { useState } from 'react';
import { API_URL } from "../api";
import './styles/Login.css';

function Login({ role, onLogin, onVoltar }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);

  // Função para definir o texto do rótulo baseado no nível de acesso
  const getLabelUsuario = () => {
    switch (role) {
      case 'aluno': return 'Número de Matrícula:';
      case 'professor': return 'Identificação do Professor:';
      case 'admin': return 'ID do Administrador:';
      default: return 'Usuário:';
    }
  };

  const getPlaceholder = () => {
    switch (role) {
      case 'aluno': return 'Ex: N-8323001';
      case 'professor': return 'Ex: 8323001-N';
      default: return 'Digite seu ID';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identificacao: usuario, 
          senha: senha, 
          role: role 
        })
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        alert(data.message || 'Credenciais inválidas.');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
      console.error(error);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-container" onSubmit={handleSubmit}>
        <div className="login-header">
          <h2>Login</h2>
          <span className="badge-role">{role.toUpperCase()}</span>
        </div>

        <div className="input-group">
          <label>{getLabelUsuario()}</label>
          <input 
            type="text" 
            value={usuario} 
            onChange={(e) => setUsuario(e.target.value)} 
            placeholder={getPlaceholder()}
            required
          />
        </div>

        <div className="input-group">
          <label>Senha:</label>
          <div className="password-wrapper">
            <input 
              type={verSenha ? "text" : "password"} // Altera o tipo dinamicamente
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="********"
              required
              style={{ width: '100%' }}
            />
            <button 
              type="button" 
              onClick={() => setVerSenha(!verSenha)}
              className="btn-show-password"
            >
              {verSenha ? "🔒" : "👁️"} 
            </button>
          </div>
        </div>

        <button type="submit" className="login-button">ENTRAR</button>
        
        <button type="button" className="btn-voltar-selecao" onClick={onVoltar}>
          ← Voltar para Seleção
        </button>
      </form>
    </div>
  );
}

export default Login;