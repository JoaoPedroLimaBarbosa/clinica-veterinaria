// === ESTADO GLOBAL ===
const API = 'http://localhost:3000/api';
let tutores = [];
let pets = [];

// === NAVEGAÇÃO ===
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${pageName}`).classList.add('active');
  document.querySelectorAll('.nav-btn')[['dashboard','tutores','pets'].indexOf(pageName)].classList.add('active');

  if (pageName === 'tutores') carregarTutores();
  if (pageName === 'pets') carregarPets();
  if (pageName === 'dashboard') carregarDashboard();
}

// === TOAST ===
function toast(msg, tipo = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${tipo} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}

// === MODAIS ===
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function closeModalOutside(e, id) {
  if (e.target.id === id) closeModal(id);
}

// === DASHBOARD ===
async function carregarDashboard() {
  try {
    const [resTutores, resPets] = await Promise.all([
      fetch(`${API}/tutores`),
      fetch(`${API}/pets`)
    ]);
    const dataTutores = await resTutores.json();
    const dataPets = await resPets.json();
    document.getElementById('total-tutores').textContent = dataTutores.length ?? 0;
    document.getElementById('total-pets').textContent = dataPets.length ?? 0;
  } catch {
    toast('Erro ao carregar dashboard', 'error');
  }
}

// =====================================================
// ==================== TUTORES ========================
// =====================================================

async function carregarTutores() {
  const lista = document.getElementById('lista-tutores');
  lista.innerHTML = '<div class="loading">Carregando tutores...</div>';
  try {
    const res = await fetch(`${API}/tutores`);
    tutores = await res.json();
    renderTutores(tutores);
  } catch {
    lista.innerHTML = '<div class="empty"><span class="empty-icon">⚠️</span>Erro ao carregar tutores.</div>';
    toast('Erro ao carregar tutores', 'error');
  }
}

function renderTutores(lista) {
  const el = document.getElementById('lista-tutores');
  if (!lista.length) {
    el.innerHTML = '<div class="empty"><span class="empty-icon">👤</span>Nenhum tutor cadastrado ainda.</div>';
    return;
  }
  el.innerHTML = lista.map(t => `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:0.8rem;">
          <div class="card-avatar">👤</div>
          <div>
            <div class="card-title">${t.nome}</div>
            <div class="card-subtitle">${t.email || 'Sem email'}</div>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-icon" onclick="editarTutor(${t.id})" title="Editar">✏️</button>
          <button class="btn-icon danger" onclick="confirmarExclusao('tutor', ${t.id}, '${t.nome}')" title="Excluir">🗑️</button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-info">
          <span>📞 <b>${t.telefone || 'Não informado'}</b></span>
          ${t.endereco ? `<span>📍 <b>${t.endereco}</b></span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function filtrarTutores() {
  const termo = document.getElementById('search-tutor').value.toLowerCase();
  const filtrados = tutores.filter(t => t.nome.toLowerCase().includes(termo));
  renderTutores(filtrados);
}

function abrirModalTutor() {
  document.getElementById('modal-tutor-title').textContent = 'Novo Tutor';
  document.getElementById('form-tutor').reset();
  document.getElementById('tutor-id').value = '';
  openModal('modal-tutor');
}

async function editarTutor(id) {
  try {
    const res = await fetch(`${API}/tutores/${id}`);
    const t = await res.json();
    document.getElementById('modal-tutor-title').textContent = 'Editar Tutor';
    document.getElementById('tutor-id').value = t.id;
    document.getElementById('tutor-nome').value = t.nome;
    document.getElementById('tutor-telefone').value = t.telefone || '';
    document.getElementById('tutor-email').value = t.email || '';
    document.getElementById('tutor-endereco').value = t.endereco || '';
    openModal('modal-tutor');
  } catch {
    toast('Erro ao carregar tutor', 'error');
  }
}

async function salvarTutor(e) {
  e.preventDefault();
  const id = document.getElementById('tutor-id').value;
  const body = {
    nome: document.getElementById('tutor-nome').value,
    telefone: document.getElementById('tutor-telefone').value,
    email: document.getElementById('tutor-email').value,
    endereco: document.getElementById('tutor-endereco').value,
  };

  try {
    const url = id ? `${API}/tutores/${id}` : `${API}/tutores`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error();
    closeModal('modal-tutor');
    toast(id ? 'Tutor atualizado!' : 'Tutor cadastrado!');
    carregarTutores();
    carregarDashboard();
  } catch {
    toast('Erro ao salvar tutor', 'error');
  }
}

// =====================================================
// ==================== PETS ===========================
// =====================================================

async function carregarPets() {
  const lista = document.getElementById('lista-pets');
  lista.innerHTML = '<div class="loading">Carregando pets...</div>';
  try {
    const res = await fetch(`${API}/pets`);
    pets = await res.json();
    renderPets(pets);
  } catch {
    lista.innerHTML = '<div class="empty"><span class="empty-icon">⚠️</span>Erro ao carregar pets.</div>';
    toast('Erro ao carregar pets', 'error');
  }
}

const especieEmoji = {
  'Cachorro': '🐶', 'Gato': '🐱', 'Pássaro': '🐦',
  'Coelho': '🐰', 'Hamster': '🐹', 'Réptil': '🦎', 'Outro': '🐾'
};

function renderPets(lista) {
  const el = document.getElementById('lista-pets');
  if (!lista.length) {
    el.innerHTML = '<div class="empty"><span class="empty-icon">🐾</span>Nenhum pet cadastrado ainda.</div>';
    return;
  }
  el.innerHTML = lista.map(p => `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:0.8rem;">
          <div class="card-avatar">${especieEmoji[p.especie] || '🐾'}</div>
          <div>
            <div class="card-title">${p.nome}</div>
            <div class="card-subtitle">${p.especie} ${p.raca ? '· ' + p.raca : ''}</div>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-icon" onclick="editarPet(${p.id})" title="Editar">✏️</button>
          <button class="btn-icon danger" onclick="confirmarExclusao('pet', ${p.id}, '${p.nome}')" title="Excluir">🗑️</button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-info">
          ${p.idade !== null ? `<span>🎂 <b>${p.idade} anos</b></span>` : ''}
          ${p.peso !== null ? `<span>⚖️ <b>${p.peso} kg</b></span>` : ''}
          <span>👤 Tutor: <b>${p.tutores?.nome || 'Não informado'}</b></span>
        </div>
      </div>
    </div>
  `).join('');
}

function filtrarPets() {
  const termo = document.getElementById('search-pet').value.toLowerCase();
  const filtrados = pets.filter(p => p.nome.toLowerCase().includes(termo));
  renderPets(filtrados);
}

async function carregarTutoresSelect(selectedId = '') {
  try {
    const res = await fetch(`${API}/tutores`);
    const data = await res.json();
    const select = document.getElementById('pet-tutor');
    select.innerHTML = '<option value="">Selecione o tutor...</option>' +
      data.map(t => `<option value="${t.id}" ${t.id == selectedId ? 'selected' : ''}>${t.nome}</option>`).join('');
  } catch {
    toast('Erro ao carregar tutores', 'error');
  }
}

async function abrirModalPet() {
  document.getElementById('modal-pet-title').textContent = 'Novo Pet';
  document.getElementById('form-pet').reset();
  document.getElementById('pet-id').value = '';
  await carregarTutoresSelect();
  openModal('modal-pet');
}

async function editarPet(id) {
  try {
    const res = await fetch(`${API}/pets/${id}`);
    const p = await res.json();
    document.getElementById('modal-pet-title').textContent = 'Editar Pet';
    document.getElementById('pet-id').value = p.id;
    document.getElementById('pet-nome').value = p.nome;
    document.getElementById('pet-especie').value = p.especie;
    document.getElementById('pet-raca').value = p.raca || '';
    document.getElementById('pet-idade').value = p.idade ?? '';
    document.getElementById('pet-peso').value = p.peso ?? '';
    await carregarTutoresSelect(p.tutor_id);
    openModal('modal-pet');
  } catch {
    toast('Erro ao carregar pet', 'error');
  }
}

async function salvarPet(e) {
  e.preventDefault();
  const id = document.getElementById('pet-id').value;
  const body = {
    nome: document.getElementById('pet-nome').value,
    especie: document.getElementById('pet-especie').value,
    raca: document.getElementById('pet-raca').value || null,
    idade: document.getElementById('pet-idade').value ? Number(document.getElementById('pet-idade').value) : null,
    peso: document.getElementById('pet-peso').value ? Number(document.getElementById('pet-peso').value) : null,
    tutor_id: Number(document.getElementById('pet-tutor').value),
  };

  try {
    const url = id ? `${API}/pets/${id}` : `${API}/pets`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error();
    closeModal('modal-pet');
    toast(id ? 'Pet atualizado!' : 'Pet cadastrado!');
    carregarPets();
    carregarDashboard();
  } catch {
    toast('Erro ao salvar pet', 'error');
  }
}

// =====================================================
// ==================== EXCLUSÃO =======================
// =====================================================

function confirmarExclusao(tipo, id, nome) {
  document.getElementById('confirm-msg').textContent = `Deseja excluir "${nome}"? Esta ação não pode ser desfeita.`;
  const btn = document.getElementById('btn-confirmar-exclusao');
  btn.onclick = () => excluir(tipo, id);
  openModal('modal-confirmar');
}

async function excluir(tipo, id) {
  try {
    const url = tipo === 'tutor' ? `${API}/tutores/${id}` : `${API}/pets/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    closeModal('modal-confirmar');
    toast(`${tipo === 'tutor' ? 'Tutor' : 'Pet'} excluído com sucesso!`);
    if (tipo === 'tutor') carregarTutores();
    else carregarPets();
    carregarDashboard();
  } catch {
    toast('Erro ao excluir', 'error');
  }
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
  carregarDashboard();
});
