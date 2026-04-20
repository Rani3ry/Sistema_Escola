import React, {useState} from "react";
import SelecaoAcesso from "./pages/SelecaoAcesso";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CadastroAdmin from "./pages/CadastroAdmin";

function App() {
  const [tela, setTela] = useState('selecao');
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);

  const handleEscolha = (escolha) => {
    if (escolha === 'registrar-admin') {
      setTela('cadastro-admin');
    } else {
      setTela('login');
      setUserRole(escolha);
    }
  };

  const realizarLogin = (dadosDoBanco) => {
    setUserData(dadosDoBanco);
    setTela('home');
  }

  const realizarLogout = () => {
    setTela('selecao');
    setUserRole(null);
    setUserData(null);
  };

  return (
    <div className="App">
      {tela === 'selecao' && <SelecaoAcesso onEscolha={handleEscolha} />}
      
      {tela === 'login' && (
        <Login 
          role={userRole} 
          onLogin={realizarLogin} 
          onVoltar={() => setTela('selecao')}
        />
      )}

      {tela === 'cadastro-admin' && (
        <CadastroAdmin onVoltar={() => setTela('selecao')} />
      )}

      {tela === 'home' && (
        <Home 
          role={userRole} 
          user={userData}
          onLogout={realizarLogout} 
        />
      )}
    </div>
  );
}

export default App;
