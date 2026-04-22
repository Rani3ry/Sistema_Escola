import React, { useMemo, useState } from 'react';
import CadastroCurso from './CadastroCurso';
import CadastroDisciplina from './CadastroDisciplinas';
import CadastroAluno from './CadastroAluno';
import CadastroProf from './CadastroProf';
import LancamentoNotas from './LancamentoNotas';
import MostrarCurso from './MostrarCurso';
import MostrarDisciplina from './MostrarDisciplina';
import MostrarAluno from './MostrarAluno';
import MostrarProfessor from './MostrarProfessor';
import './styles/Home.css';

function Home({ role, user, onLogout }) {
    const [view, setView] = useState('welcome');

    const welcomeConfig = useMemo(() => {
        if (role === 'admin') {
            return {
                title: 'Central Administrativa',
                subtitle: 'Gerencie cursos, disciplinas, alunos e professores em um fluxo único e organizado.',
                highlights: [
                    'Cadastre e atualize a estrutura acadêmica da instituição.',
                    'Acompanhe rapidamente quais áreas do sistema exigem manutenção.',
                    'Exclua ou reatribua registros com mais segurança.'
                ]
            };
        }

        if (role === 'professor') {
            return {
                title: `Painel do Professor${user?.nome ? `: ${user.nome}` : ''}`,
                subtitle: 'Consulte sua turma, acompanhe a disciplina vinculada e registre notas e faltas sem retrabalho.',
                highlights: [
                    'Visualize sua disciplina e a lista de alunos matriculados.',
                    'Lance apenas os campos necessários de nota ou falta.',
                    'Revise o status acadêmico do aluno conforme notas e frequência.'
                ]
            };
        }

        return {
            title: `Portal do Aluno${user?.nome ? `: ${user.nome}` : ''}`,
            subtitle: 'Acompanhe sua vida acadêmica em um único lugar, com acesso rápido a curso, disciplinas, professores e desempenho.',
            highlights: [
                'Veja os dados do seu curso e das disciplinas vinculadas.',
                'Consulte notas, faltas e status de cada disciplina.',
                'Confira quais professores ministram as matérias do seu curso.'
            ]
        };
    }, [role, user]);

    return (
        <div className="home-container" href="home">
            <nav className="navbar">
                <div className="logo" onClick={() => setView('welcome')} style={{ cursor: 'pointer' }}>
                    Sistema Escolar
                </div>

                <div className="menu-items">
                    {role === 'admin' && (
                        <div className="dropdown">
                            <button className="dropbtn">Cadastrar ▼</button>
                            <div className="dropdown-content">
                                <a href="cadastro-curso" onClick={(e) => { e.preventDefault(); setView('cad-curso')}}>Curso</a>
                                <a href="cadastro-disciplina" onClick={(e) => { e.preventDefault(); setView('cad-disciplina')}}>Disciplina</a>
                                <a href="cadastro-aluno" onClick={(e) => { e.preventDefault(); setView('cad-aluno')}}>Aluno</a>
                                <a href="cadastro-professor" onClick={(e) => { e.preventDefault(); setView('cad-prof')}}>Professor</a>
                            </div>
                        </div>
                    )}

                    {role === 'professor' && (
                        <button className="dropbtn" onClick={() => setView('lancar-notas')}>
                            Lançar Notas/Faltas
                        </button>
                    )}

                    <div className="dropdown">
                        <button className="dropbtn">Mostrar ▼</button>
                        <div className="dropdown-content">
                            <a href="cursos" onClick={(e) => { e.preventDefault(); setView('show-curso')}}>{role === 'aluno' ? 'Curso' : 'Cursos'}</a>
                            <a href="disciplinas" onClick={(e) => { e.preventDefault(); setView('show-disciplina')}}>{role === 'aluno' ? 'Disciplina' : 'Disciplinas'}</a>
                            <a href="alunos" onClick={(e) => { e.preventDefault(); setView('show-aluno')}}>{role === 'aluno' ? 'Aluno' : 'Alunos'}</a>
                            <a href="professores" onClick={(e) => { e.preventDefault(); setView('show-prof')}}>{role === 'professor' ? 'Professor' : 'Professores'}</a>
                        </div>
                    </div>

                    <button className="logout-button" onClick={onLogout}>Sair</button>
                </div>
            </nav>

            <main className="content-area">
                {view === 'welcome' && (
                    <div className="welcome-shell">
                        <section className="welcome-card">
                            <div className="welcome-badge">Acesso ativo: {role.toUpperCase()}</div>
                            <h1>{welcomeConfig.title}</h1>
                            <p className="welcome-subtitle">{welcomeConfig.subtitle}</p>

                            <div className="welcome-grid">
                                <article className="welcome-panel">
                                    <h3>O que você consegue fazer aqui</h3>
                                    <ul>
                                        {welcomeConfig.highlights.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </article>

                                <article className="welcome-panel accent">
                                    <h3>Visão do sistema</h3>
                                    <p>
                                        Este ambiente centraliza informações acadêmicas, cadastro de pessoas,
                                        estrutura de cursos, disciplinas e acompanhamento de desempenho.
                                    </p>
                                    <p>
                                        Use o menu superior para navegar entre consultas, cadastros e lançamentos,
                                        sempre respeitando o nível de acesso da conta logada.
                                    </p>
                                </article>
                            </div>
                        </section>
                    </div>
                )}
                {view === 'cad-curso' && <CadastroCurso />}
                {view === 'cad-disciplina' && <CadastroDisciplina />}
                {view === 'cad-aluno' && <CadastroAluno />}
                {view === 'cad-prof' && <CadastroProf />}
                {view === 'lancar-notas' && <LancamentoNotas professorLogado={user} />}
                {view === 'show-curso' && <MostrarCurso role={role} userDados={user} />}
                {view === 'show-disciplina' && <MostrarDisciplina role={role} userDados={user} />}
                {view === 'show-aluno' && <MostrarAluno role={role} userDados={user} />}
                {view === 'show-prof' && <MostrarProfessor role={role} userDados={user} />}
            </main>
        </div>
    );
}

export default Home;
