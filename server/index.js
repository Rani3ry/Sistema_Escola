import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const app = express();

const MASTER_ADMIN_PASSWORD = process.env.MASTER_ADMIN_PASSWORD;

function hasLaunchedValue(value) {
    return value !== null && value !== undefined && value !== '';
}

function buildInitialNotaFaltas(alunoId, disciplinaId) {
    return {
        alunoId,
        disciplinaId,
        nota01: null,
        nota02: null,
        nota03: null,
        faltas: 0
    };
}

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));    
app.use(express.json());

// Rota de Autenticação (Login e Admin)

// Login Geral (Aluno, Professor, Admin)
app.post('/login', async (req, res) => {
    const {identificacao, senha, role} = req.body;
    try {
        let usuario = null;
        // Lógica para buscar na tabela correta dependendo do 'role'
        if (role === 'admin') {
            usuario = await prisma.admin.findUnique({ where: { identificacao: parseInt(identificacao) }});
        } else if (role === 'professor') {
            usuario = await prisma.professor.findUnique({
                where: { matricula: identificacao },
                include: { curso: true, disciplina: true }
            }); //Professor usa String
        } else if (role === 'aluno') {
            usuario = await prisma.aluno.findUnique({ 
                where: { matricula: parseInt(identificacao) },
                include: { curso: true }
            });
        }

        if (usuario && usuario.senha === senha) {
            const { senha: _, ...dadosPublicos } = usuario;
            res.json({ success: true, user: dadosPublicos });
        } else {
            res.status(401).json({ success: false, message: "Credenciais inválidas" });
        }
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: error.message });
    }
});

// Cadastro de conta Admin
app.post('/admin/register', async (req, res) => {
    const { identificacao, nome, email, senha, masterPassword } = req.body;
    try {
        if (masterPassword !== MASTER_ADMIN_PASSWORD) {
            return res.status(403).json({ success: false, error: "Senha mestre incorreta." });
        }

        const novoAdmin = await prisma.admin.create({
        data: { identificacao: parseInt(identificacao), nome, email, senha }
        });
        res.status(201).json({ novoAdmin });
    } catch (error) {
        res.status(400).json({ success: false, error: "Erro ao cadastrar administrador. Verifique se o ID já existe." });
    }
});

// Rotas de Cursos
app.post('/cursos', async (req, res) => {
    const { id, nome, cargaHoraria, campus, tipo } = req.body;
    try {
        const novoCurso = await prisma.curso.create({ 
            data: {
                id: id, 
                nome: nome, 
                cargaHoraria: cargaHoraria, 
                campus: campus, 
                tipo: tipo
            } });
        res.status(201).json(novoCurso);
    } catch (error) {
        console.error("Erro ao criar curso:", error);
        res.status(400).json({ 
            success: false, 
            error: "Erro ao criar curso. Verifique se o ID já existe." 
        });
    }
});

app.get('/cursos', async (req, res) => {
    const cursos = await prisma.curso.findMany();
    res.json(cursos);
});

app.get('/cursos/:id', async (req, res) => {
    const curso = await prisma.curso.findUnique({ where: { id: parseInt(req.params.id) }});
    res.json(curso);
});

app.put('/cursos/:id', async (req, res) => {
    try {
        const atualizado = await prisma.curso.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(atualizado);
    } catch (error) {
        res.status(400).json({ success: false, error: "Erro ao atualizar curso." });
    }
});

app.delete('/cursos/:id', async (req, res) => {
    const cursoId = parseInt(req.params.id);

    try {
        await prisma.$transaction(async (tx) => {
            const disciplinas = await tx.disciplina.findMany({
                where: { cursoId },
                select: { id: true }
            });

            const disciplinaIds = disciplinas.map((disciplina) => disciplina.id);

            if (disciplinaIds.length > 0) {
                await tx.notaFalta.deleteMany({
                    where: { disciplinaId: { in: disciplinaIds } }
                });
            }

            await tx.professor.deleteMany({ where: { cursoId } });
            await tx.aluno.deleteMany({ where: { cursoId } });
            await tx.disciplina.deleteMany({ where: { cursoId } });
            await tx.curso.delete({ where: { id: cursoId } });
        });

        res.json({ ok: true });
    } catch (error) {
        console.error("Erro ao excluir curso:", error);
        res.status(400).json({ success: false, error: "Erro ao excluir curso." });
    }
});

// Rotas de Disciplinas
app.post('/disciplinas', async (req, res) => {
    const {cursoId, codDisciplina, id, nome, cargaHoraria, aulasSemana} = req.body;
    try {
        const disciplinaId = parseInt(codDisciplina ?? id);
        const cursoIdNumber = parseInt(cursoId);

        const novaDisciplina = await prisma.$transaction(async (tx) => {
            const disciplinaCriada = await tx.disciplina.create({ 
                data: {
                    id: disciplinaId, 
                    nome: nome, 
                    cargaHoraria: cargaHoraria, 
                    aulasSemana: aulasSemana,
                    curso: { connect: { id: cursoIdNumber } }
                } 
            });

            const alunosDoCurso = await tx.aluno.findMany({
                where: { cursoId: cursoIdNumber },
                select: { matricula: true }
            });

            if (alunosDoCurso.length > 0) {
                await tx.notaFalta.createMany({
                    data: alunosDoCurso.map((aluno) => ({
                        ...buildInitialNotaFaltas(aluno.matricula, disciplinaCriada.id)
                    }))
                });
            }

            return disciplinaCriada;
        });
        res.status(201).json(novaDisciplina);
    } catch (error) {
        console.error("Erro ao criar disciplina:", error);
        res.status(400).json({ 
            success: false, 
            error: "Erro ao criar disciplina. Verifique se o código já existe e se o cursoId é válido." 
        });
    }
});

app.get('/disciplinas', async (req, res) => {
    const {cursoId} = req.query;
    const lista = await prisma.disciplina.findMany({ 
        where: cursoId ? { cursoId: parseInt(cursoId) } : {} 
    });
    res.json(lista);
});

app.put('/disciplinas/:id', async (req, res) => {
    const atualizada = await prisma.disciplina.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
    });
    res.json(atualizada);
});

app.delete('/disciplinas/:id', async (req, res) => {
    const disciplinaId = parseInt(req.params.id);

    try {
        await prisma.$transaction(async (tx) => {
            await tx.notaFalta.deleteMany({ where: { disciplinaId } });
            await tx.professor.updateMany({
                where: { disciplinaId },
                data: { disciplinaId: null }
            });
            await tx.disciplina.delete({ where: { id: disciplinaId } });
        });

        res.json({ ok: true });
    } catch (error) {
        console.error("Erro ao excluir disciplina:", error);
        res.status(400).json({ success: false, error: "Erro ao excluir disciplina." });
    }
});

// Rotas de Alunos, Notas e Faltas
app.post('/alunos', async (req, res) => {
    const {matricula, nome, senha, dataNasc, endereco, cursoId} = req.body;

    try {
        // 1 - Criar aluno
        const cursoIdNumber = parseInt(cursoId);

        const novoAluno = await prisma.$transaction(async (tx) => {
        const alunoCriado = await tx.aluno.create({ 
            data: {
                matricula: matricula, 
                nome: nome, 
                senha: senha, 
                dataNasc: dataNasc, 
                endereco: endereco, 
                curso: { connect: { id: cursoIdNumber } }
            } 
        });

        //2 - Buscar disciplinas do curso para matricular o aluno  automaticamente
        const disciplinasDoCurso = await tx.disciplina.findMany({ 
            where: { cursoId: cursoIdNumber }
        });

        //3 - Criar registros de Notas/Faltas iniciais para vínculo aluno-disciplina
            if (disciplinasDoCurso.length > 0) {
                const matriculasIniciais = disciplinasDoCurso.map(disc => ({
                    ...buildInitialNotaFaltas(alunoCriado.matricula, disc.id)
                }));
                await tx.notaFalta.createMany({ data: matriculasIniciais });
            }

        return alunoCriado;
        });

        res.status(201).json({message: "Aluno criado com sucesso!", aluno: novoAluno});
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: "Erro ao criar aluno." });
    }
});

app.get('/alunos', async (req, res) => {
    const {cursoId, disciplinaId} = req.query;
    const lista = await prisma.aluno.findMany({ 
        where: {
            AND: [
                cursoId ? { cursoId: parseInt(cursoId) } : {},
                disciplinaId ? { notasFaltas: { some: { disciplinaId: parseInt(disciplinaId) } } } : {}
            ]
        },
        include: { curso: true }
    });
    res.json(lista);
});

app.get('/alunos/:matricula', async (req, res) => {
    try {
        const aluno = await prisma.aluno.findUnique({
            where: { matricula: parseInt(req.params.matricula) },
            include: {
                curso: true,
                notasFaltas: {
                    include: { disciplina: true }
                }
            }
        });

        res.json(aluno);
    } catch (error) {
        console.error("Erro ao buscar aluno:", error);
        res.status(400).json({ success: false, error: "Erro ao buscar aluno." });
    }
});

app.put('/alunos/:matricula', async (req, res) => {
    try {
        const { nome, senha, dataNasc, endereco, cursoId } = req.body;
        const matricula = parseInt(req.params.matricula);

        const atualizado = await prisma.$transaction(async (tx) => {
            const alunoAtual = await tx.aluno.findUnique({
                where: { matricula },
                select: { cursoId: true }
            });

            const data = {};

            if (nome !== undefined) data.nome = nome;
            if (senha !== undefined) data.senha = senha;
            if (dataNasc !== undefined) data.dataNasc = new Date(dataNasc);
            if (endereco !== undefined) data.endereco = endereco;
            if (cursoId !== undefined) data.curso = { connect: { id: parseInt(cursoId) } };

            const alunoAtualizado = await tx.aluno.update({
                where: { matricula },
                data,
                include: { curso: true }
            });

            if (cursoId !== undefined && alunoAtual?.cursoId !== parseInt(cursoId)) {
                const disciplinasDoNovoCurso = await tx.disciplina.findMany({
                    where: { cursoId: parseInt(cursoId) },
                    select: { id: true }
                });

                await tx.notaFalta.deleteMany({ where: { alunoId: matricula } });

                if (disciplinasDoNovoCurso.length > 0) {
                    await tx.notaFalta.createMany({
                        data: disciplinasDoNovoCurso.map((disciplina) => (
                            buildInitialNotaFaltas(matricula, disciplina.id)
                        ))
                    });
                }
            }

            return alunoAtualizado;
        });

        res.json(atualizado);
    } catch (error) {
        console.error("Erro ao atualizar aluno:", error);
        res.status(400).json({ success: false, error: "Erro ao atualizar aluno." });
    }
});

app.delete('/alunos/:matricula', async (req, res) => {
    const matricula = parseInt(req.params.matricula);

    try {
        await prisma.$transaction(async (tx) => {
            await tx.notaFalta.deleteMany({ where: { alunoId: matricula } });
            await tx.aluno.delete({ where: { matricula } });
        });

        res.json({ ok: true });
    } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        res.status(400).json({ success: false, error: "Erro ao excluir aluno." });
    }
});

// Lançamento de notas (Professor)
app.get('/notas', async (req, res) => {
    const { alunoId, disciplinaId } = req.query;

    try {
        const registro = await prisma.notaFalta.findFirst({
            where: {
                alunoId: parseInt(alunoId),
                disciplinaId: parseInt(disciplinaId)
            }
        });

        res.json({ success: true, registro });
    } catch (error) {
        console.error("Erro ao buscar notas:", error);
        res.status(400).json({ success: false, error: "Erro ao buscar notas." });
    }
});

app.post('/notas', async (req, res) => {
    const {alunoId, disciplinaId, nota01, nota02, nota03, faltas} = req.body;
    
    try{
        const alunoIdNumber = parseInt(alunoId);
        const disciplinaIdNumber = parseInt(disciplinaId);

        const registroExistente = await prisma.notaFalta.findFirst({
            where: {
                alunoId: alunoIdNumber,
                disciplinaId: disciplinaIdNumber
            }
        });

        const updateData = {};
        const createData = {
            alunoId: alunoIdNumber,
            disciplinaId: disciplinaIdNumber,
            nota01: null,
            nota02: null,
            nota03: null,
            faltas: 0
        };

        if (nota01 !== undefined) {
            updateData.nota01 = hasLaunchedValue(nota01) ? parseFloat(nota01) : null;
            createData.nota01 = hasLaunchedValue(nota01) ? parseFloat(nota01) : null;
        }

        if (nota02 !== undefined) {
            updateData.nota02 = hasLaunchedValue(nota02) ? parseFloat(nota02) : null;
            createData.nota02 = hasLaunchedValue(nota02) ? parseFloat(nota02) : null;
        }

        if (nota03 !== undefined) {
            updateData.nota03 = hasLaunchedValue(nota03) ? parseFloat(nota03) : null;
            createData.nota03 = hasLaunchedValue(nota03) ? parseFloat(nota03) : null;
        }

        if (faltas !== undefined) {
            updateData.faltas = faltas === '' || faltas === null ? 0 : parseInt(faltas);
            createData.faltas = faltas === '' || faltas === null ? 0 : parseInt(faltas);
        }

        const registro = await prisma.notaFalta.upsert({
            where: { id: registroExistente ? registroExistente.id : 0 },
            update: updateData,
            create: createData
        });
        res.json({ success: true, registro });
    } catch (error) {
        console.error("Erro ao lançar notas:", error);
        res.status(400).json({ success: false, error: "Erro ao lançar notas." });
    }
});

// Rotas de professores
app.post('/professores', async (req, res) => {
    const {matricula, nome, email, senha, endereco, dtNasc, telefone, especialidade, titulo, cursoId, disciplinaId} = req.body;
    try {
        const cursoIdNumber = parseInt(cursoId);
        const disciplinaIdNumber = parseInt(disciplinaId);

        if (Number.isNaN(cursoIdNumber) || Number.isNaN(disciplinaIdNumber)) {
            return res.status(400).json({
                success: false,
                error: "Curso e disciplina precisam ser informados com valores validos."
            });
        }

        const [curso, disciplina] = await Promise.all([
            prisma.curso.findUnique({ where: { id: cursoIdNumber } }),
            prisma.disciplina.findUnique({ where: { id: disciplinaIdNumber } })
        ]);

        if (!curso) {
            return res.status(400).json({
                success: false,
                error: `Curso ${cursoIdNumber} nao encontrado.`
            });
        }

        if (!disciplina) {
            return res.status(400).json({
                success: false,
                error: `Disciplina ${disciplinaIdNumber} nao encontrada.`
            });
        }

        if (disciplina.cursoId !== cursoIdNumber) {
            return res.status(400).json({
                success: false,
                error: "A disciplina informada nao pertence ao curso selecionado."
            });
        }

        const novoProfessor = await prisma.professor.create({ 
            data: {
                matricula: matricula, 
                nome: nome,
                senha: senha,  
                email: email, 
                endereco: endereco, 
                dtNasc: new Date (dtNasc), 
                telefone: telefone, 
                especialidade: especialidade, 
                curso: { connect: { id: cursoIdNumber } },
                disciplina: { connect: { id: disciplinaIdNumber } },
                titulo: titulo
            }
        });
        res.status(201).json(novoProfessor);
    } catch (error) {
        console.error("Erro ao cadastrar professor:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                error: "Ja existe um professor com essa matricula ou email."
            });
        }

        res.status(400).json({ success: false, error: error.message || "Erro ao criar professor." });
    }
});

app.get('/professores', async (req, res) => {
    const {cursoId, disciplinaId} = req.query;
    const lista = await prisma.professor.findMany({ 
        where: {
            AND: [
                cursoId ? { cursoId: parseInt(cursoId) } : {},
                disciplinaId ? { disciplinaId: parseInt(disciplinaId) } : {}
            ]
        },
        include: { curso: true, disciplina: true }
    });
    res.json(lista);
});

app.put('/professores/:matricula', async (req, res) => {
    const { nome, email, senha, endereco, dtNasc, telefone, especialidade, titulo, cursoId, disciplinaId } = req.body;

    try {
        const professorAtual = await prisma.professor.findUnique({
            where: { matricula: req.params.matricula },
            select: { cursoId: true }
        });

        const data = {};

        if (nome !== undefined) data.nome = nome;
        if (email !== undefined) data.email = email;
        if (senha !== undefined) data.senha = senha;
        if (endereco !== undefined) data.endereco = endereco;
        if (dtNasc !== undefined) data.dtNasc = new Date(dtNasc);
        if (telefone !== undefined) data.telefone = telefone;
        if (especialidade !== undefined) data.especialidade = especialidade;
        if (titulo !== undefined) data.titulo = titulo;

        let cursoIdNumber = professorAtual?.cursoId;
        if (cursoId !== undefined) {
            cursoIdNumber = parseInt(cursoId);
            const curso = await prisma.curso.findUnique({ where: { id: cursoIdNumber } });

            if (!curso) {
                return res.status(400).json({ success: false, error: "Curso nao encontrado." });
            }

            data.curso = { connect: { id: cursoIdNumber } };
        }

        if (disciplinaId !== undefined) {
            if (disciplinaId === null || disciplinaId === '') {
                data.disciplina = { disconnect: true };
            } else {
                const disciplinaIdNumber = parseInt(disciplinaId);
                const disciplina = await prisma.disciplina.findUnique({ where: { id: disciplinaIdNumber } });

                if (!disciplina) {
                    return res.status(400).json({ success: false, error: "Disciplina nao encontrada." });
                }

                if (cursoIdNumber !== undefined && disciplina.cursoId !== cursoIdNumber) {
                    return res.status(400).json({ success: false, error: "A disciplina informada nao pertence ao curso selecionado." });
                }

                data.disciplina = { connect: { id: disciplinaIdNumber } };
            }
        }

        const atualizado = await prisma.professor.update({
            where: { matricula: req.params.matricula },
            data,
            include: { curso: true, disciplina: true }
        });

        res.json(atualizado);
    } catch (error) {
        console.error("Erro ao atualizar professor:", error);
        res.status(400).json({ success: false, error: "Erro ao atualizar professor." });
    }
});

app.delete('/professores/:matricula', async (req, res) => {
    await prisma.professor.delete({ where: { matricula: req.params.matricula }});
    res.json({ ok: true });
});

// --- INICIALIZAÇÃO ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});