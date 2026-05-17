const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// ⚠️ COLOQUE SUAS CREDENCIAIS DO SUPABASE AQUI
const SUPABASE_URL = 'COLOQUE_SUA_URL_AQUI';
const SUPABASE_KEY = 'COLOQUE_SUA_CHAVE_ANON_AQUI';
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'front')));

// Helper para chamar o Supabase via fetch
async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  console.log('URL chamada:', url);
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  return { data, status: response.status };
}

// ==================== ROTAS DE TUTORES ====================

// Listar todos os tutores
app.get('/api/tutores', async (req, res) => {
  try {
    const { data, status } = await supabaseFetch('tutores?order=nome.asc');
    res.status(status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar tutor por ID
app.get('/api/tutores/:id', async (req, res) => {
  try {
    const { data, status } = await supabaseFetch(`tutores?id=eq.${req.params.id}`);
    res.status(status).json(data[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cadastrar tutor
app.post('/api/tutores', async (req, res) => {
  try {
    const { nome, telefone, email, endereco } = req.body;
    console.log('Tentando salvar tutor:', { nome, telefone, email, endereco });

    const { data, status } = await supabaseFetch('tutores', {
      method: 'POST',
      body: JSON.stringify({ nome, telefone, email, endereco }),
    });

    console.log('Resposta Supabase - status:', status);
    console.log('Resposta Supabase - data:', JSON.stringify(data));

    res.status(status).json(data);
  } catch (err) {
    console.error('Erro:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Editar tutor
app.put('/api/tutores/:id', async (req, res) => {
  try {
    const { nome, telefone, email, endereco } = req.body;
    const { data, status } = await supabaseFetch(`tutores?id=eq.${req.params.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ nome, telefone, email, endereco }),
    });
    res.status(status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir tutor
app.delete('/api/tutores/:id', async (req, res) => {
  try {
    const { data, status } = await supabaseFetch(`tutores?id=eq.${req.params.id}`, {
      method: 'DELETE',
    });
    res.status(status).json({ message: 'Tutor excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROTAS DE PETS ====================

// Listar todos os pets (com nome do tutor)
app.get('/api/pets', async (req, res) => {
  try {
    const { data, status } = await supabaseFetch('pets?select=*,tutores(nome)&order=nome.asc');
    res.status(status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar pet por ID
app.get('/api/pets/:id', async (req, res) => {
  try {
    const { data, status } = await supabaseFetch(`pets?id=eq.${req.params.id}&select=*,tutores(nome)`);
    res.status(status).json(data[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cadastrar pet
app.post('/api/pets', async (req, res) => {
  try {
    const { nome, especie, raca, idade, peso, tutor_id } = req.body;
    const { data, status } = await supabaseFetch('pets', {
      method: 'POST',
      body: JSON.stringify({ nome, especie, raca, idade, peso, tutor_id }),
    });
    res.status(status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar pet
app.put('/api/pets/:id', async (req, res) => {
  try {
    const { nome, especie, raca, idade, peso, tutor_id } = req.body;
    const { data, status } = await supabaseFetch(`pets?id=eq.${req.params.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ nome, especie, raca, idade, peso, tutor_id }),
    });
    res.status(status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir pet
app.delete('/api/pets/:id', async (req, res) => {
  try {
    const { data, status } = await supabaseFetch(`pets?id=eq.${req.params.id}`, {
      method: 'DELETE',
    });
    res.status(status).json({ message: 'Pet excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🐾 Clínica Vet rodando em http://localhost:${PORT}`);
});
