// ============================================================
// SEAM — app.js
// ============================================================

// --- Data ---------------------------------------------------

let projects = [];
let currentProjectId = null;

// --- API helpers --------------------------------------------

async function loadProjects() {
  const res = await fetch('/api/projects');
  projects = await res.json();
}

// --- Helpers ------------------------------------------------

const statusLabel = { sampling: 'Sampling', production: 'Production', review: 'Review', briefing: 'Briefing', shipping: 'Shipping', completed: 'Completed' };

function iconSVG(type) {
  const icons = {
    arrow:  `<svg class="icon icon--arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    flag:   `<svg class="icon icon--xs" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v10l-8 4-8-4V4z"/></svg>`,
    pause:  `<svg class="icon icon--pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
    x:      `<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    file:   `<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  };
  return icons[type] || '';
}

function makeCard(project) {
  const isCompleted = project.status === 'completed';
  const isDimmed = project.paused || isCompleted;

  const card = document.createElement('article');
  card.className = 'card' + (project.paused ? ' card--paused' : '') + (isCompleted ? ' card--completed' : '');
  card.dataset.id = project._id;

  const actionBadge = project.actionOwner === 'yours'
    ? `<span class="badge badge--action">Your Action</span>`
    : `<span class="badge badge--waiting">Waiting on Supplier</span>`;

  const priorityBadge = project.priority
    ? `<span class="badge badge--priority">${iconSVG('flag')} Priority</span>`
    : (project.paused ? iconSVG('pause') : '');

  card.innerHTML = `
    <div class="card__header">
      <h2 class="card__title${isDimmed ? ' card__title--muted' : ''}">${project.title}</h2>
      ${priorityBadge}
    </div>
    <span class="badge badge--status badge--${project.status}">${statusLabel[project.status]}</span>
    <p class="card__desc${isDimmed ? ' card__desc--muted' : ''}">${project.desc}</p>
    <div class="card__footer">
      ${actionBadge}
      ${iconSVG('arrow')}
    </div>`;

  card.addEventListener('click', () => openDetail(project._id));
  return card;
}

function renderHome() {
  const active = projects.filter(p => !p.paused);
  const paused = projects.filter(p => p.paused);

  document.getElementById('project-count').textContent =
    `${active.length} active · ${paused.length} paused`;

  const activeGrid = document.getElementById('active-grid');
  activeGrid.innerHTML = '';
  active.forEach(p => activeGrid.appendChild(makeCard(p)));

  const pausedGrid = document.getElementById('paused-grid');
  pausedGrid.innerHTML = '';
  paused.forEach(p => pausedGrid.appendChild(makeCard(p)));

  const pausedSection = document.getElementById('paused-section');
  pausedSection.hidden = paused.length === 0;
}

// --- Navigation (SPA) ---------------------------------------

function showView(name) {
  document.getElementById('view-home').hidden   = (name !== 'home');
  document.getElementById('view-detail').hidden = (name !== 'detail');
}

function openDetail(id) {
  currentProjectId = id;
  const p = projects.find(x => x._id === id);
  if (!p) return;

  // Populate fields
  document.getElementById('detail-name').value     = p.title;
  document.getElementById('detail-supplier').value = p.supplier;
  document.getElementById('detail-notes').value    = p.notes || '';

  // Status select
  const statusSel = document.getElementById('detail-status');
  statusSel.value = p.status;
  statusSel.dataset.status = p.status;

  // Toggle buttons
  setToggle('detail-priority-btn', p.priority, 'priority');
  setToggle('detail-paused-btn',   p.paused,   'paused');

  // Action owner
  setSegmented(document.getElementById('action-owner'), p.actionOwner);

  // Todos & files
  renderTodos();
  renderFiles();

  showView('detail');
  window.scrollTo({ top: 0 });
}

// --- Auto-save detail fields --------------------------------

function saveCurrentProject() {
  if (!currentProjectId) return;
  const p = projects.find(x => x._id === currentProjectId);
  if (!p) return;
  p.title    = document.getElementById('detail-name').value;
  p.supplier = document.getElementById('detail-supplier').value;
  p.notes    = document.getElementById('detail-notes').value;
}

document.getElementById('detail-name').addEventListener('input', saveCurrentProject);
document.getElementById('detail-supplier').addEventListener('input', saveCurrentProject);
document.getElementById('detail-notes').addEventListener('input', saveCurrentProject);

// --- Status select ------------------------------------------

const detailStatus = document.getElementById('detail-status');
detailStatus.addEventListener('change', () => {
  const p = projects.find(x => x._id === currentProjectId);
  if (p) p.status = detailStatus.value;
  detailStatus.dataset.status = detailStatus.value;
});

// Colour modal status select too
const modalStatus = document.getElementById('modal-status');
modalStatus.addEventListener('change', () => {
  modalStatus.dataset.status = modalStatus.value;
});

// --- Toggle buttons -----------------------------------------

function setToggle(btnId, active, type) {
  const btn = document.getElementById(btnId);
  btn.classList.remove('toggle-btn--active-priority', 'toggle-btn--active-paused');
  if (active) btn.classList.add(`toggle-btn--active-${type}`);
}

document.getElementById('detail-priority-btn').addEventListener('click', () => {
  const p = projects.find(x => x._id === currentProjectId);
  if (!p) return;
  p.priority = !p.priority;
  setToggle('detail-priority-btn', p.priority, 'priority');
});

document.getElementById('detail-paused-btn').addEventListener('click', () => {
  const p = projects.find(x => x._id === currentProjectId);
  if (!p) return;
  p.paused = !p.paused;
  setToggle('detail-paused-btn', p.paused, 'paused');
});

// --- Segmented control (Action Owner) -----------------------

function setSegmented(container, value) {
  container.querySelectorAll('.segmented__btn').forEach(btn => {
    btn.classList.toggle('segmented__btn--active', btn.dataset.value === value);
  });
}

document.getElementById('action-owner').addEventListener('click', (e) => {
  const btn = e.target.closest('.segmented__btn');
  if (!btn) return;
  const p = projects.find(x => x._id === currentProjectId);
  if (p) p.actionOwner = btn.dataset.value;
  setSegmented(document.getElementById('action-owner'), btn.dataset.value);
});

// --- To-do list ---------------------------------------------

function renderTodos() {
  const p = projects.find(x => x._id === currentProjectId);
  const list = document.getElementById('todo-list');
  const empty = document.getElementById('todo-empty');
  list.innerHTML = '';

  if (!p || p.todos.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  p.todos.forEach((todo, i) => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.innerHTML = `
      <input type="checkbox" class="todo-item__check" ${todo.done ? 'checked' : ''} data-i="${i}" />
      <span class="todo-item__text${todo.done ? ' todo-item__text--done' : ''}">${todo.text}</span>
      <button class="todo-item__delete" data-i="${i}" aria-label="Delete">${iconSVG('x')}</button>`;

    li.querySelector('.todo-item__check').addEventListener('change', (e) => {
      p.todos[i].done = e.target.checked;
      renderTodos();
    });
    li.querySelector('.todo-item__delete').addEventListener('click', () => {
      p.todos.splice(i, 1);
      renderTodos();
    });

    list.appendChild(li);
  });
}

document.getElementById('todo-add-btn').addEventListener('click', () => {
  document.getElementById('todo-add-btn').hidden  = true;
  document.getElementById('todo-input-row').hidden = false;
  document.getElementById('todo-input').focus();
});

function confirmTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (text) {
    const p = projects.find(x => x._id === currentProjectId);
    if (p) { p.todos.push({ text, done: false }); renderTodos(); }
  }
  input.value = '';
  document.getElementById('todo-input-row').hidden = true;
  document.getElementById('todo-add-btn').hidden  = false;
}

document.getElementById('todo-confirm-btn').addEventListener('click', confirmTodo);
document.getElementById('todo-cancel-btn').addEventListener('click', () => {
  document.getElementById('todo-input').value = '';
  document.getElementById('todo-input-row').hidden = true;
  document.getElementById('todo-add-btn').hidden  = false;
});
document.getElementById('todo-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') confirmTodo();
  if (e.key === 'Escape') document.getElementById('todo-cancel-btn').click();
});

// --- File attachments ---------------------------------------

function renderFiles() {
  const p = projects.find(x => x._id === currentProjectId);
  const list = document.getElementById('file-list');
  list.innerHTML = '';
  if (!p) return;

  p.files.forEach((file, i) => {
    const li = document.createElement('li');
    li.className = 'file-item';
    li.innerHTML = `
      ${iconSVG('file')}
      <span class="file-item__name">${file.name}</span>
      <button class="file-item__remove" data-i="${i}" aria-label="Remove">${iconSVG('x')}</button>`;
    li.querySelector('.file-item__remove').addEventListener('click', () => {
      p.files.splice(i, 1);
      renderFiles();
    });
    list.appendChild(li);
  });
}

document.getElementById('file-input').addEventListener('change', (e) => {
  const p = projects.find(x => x._id === currentProjectId);
  if (!p) return;
  Array.from(e.target.files).forEach(f => p.files.push({ name: f.name }));
  renderFiles();
  e.target.value = '';
});

// --- Back button --------------------------------------------

document.getElementById('back-btn').addEventListener('click', async () => {
  saveCurrentProject();
  currentProjectId = null;
  await loadProjects();
  renderHome();
  showView('home');
});

document.getElementById('nav-logo').addEventListener('click', async () => {
  if (currentProjectId) saveCurrentProject();
  currentProjectId = null;
  await loadProjects();
  renderHome();
  showView('home');
});

// --- New Project modal --------------------------------------

function openModal() {
  document.getElementById('modal-name').value     = '';
  document.getElementById('modal-supplier').value = '';
  modalStatus.value = 'briefing';
  modalStatus.dataset.status = 'briefing';
  document.getElementById('modal-overlay').hidden = false;
  document.getElementById('modal-name').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').hidden = true;
}

document.getElementById('new-project-btn').addEventListener('click', openModal);
document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

document.getElementById('modal-create-btn').addEventListener('click', async () => {
  const name = document.getElementById('modal-name').value.trim();
  if (!name) { document.getElementById('modal-name').focus(); return; }

  const newProject = {
    title: name,
    supplier: document.getElementById('modal-supplier').value.trim() || '—',
    status: modalStatus.value,
    priority: false,
    paused: false,
    actionOwner: 'yours',
    desc: '',
    todos: [],
    files: [],
  };

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);

    await loadProjects();
    closeModal();
    renderHome();
    openDetail(data._id);
  } catch (err) {
    alert('Failed to create project: ' + err.message);
  }
});

// Close modal with Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !document.getElementById('modal-overlay').hidden) closeModal();
});

// --- User dropdown ------------------------------------------

const userBtn      = document.getElementById('nav-user-btn');
const userDropdown = document.getElementById('user-dropdown');

userBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = !userDropdown.hidden;
  userDropdown.hidden = isOpen;
  userBtn.setAttribute('aria-expanded', String(!isOpen));
});

document.addEventListener('click', () => {
  userDropdown.hidden = true;
  userBtn.setAttribute('aria-expanded', 'false');
});

userDropdown.addEventListener('click', (e) => e.stopPropagation());

// --- Save project -------------------------------------------

document.getElementById('save-btn').addEventListener('click', async () => {
  saveCurrentProject();
  const p = projects.find(x => x._id === currentProjectId);
  if (!p) return;

  const btn = document.getElementById('save-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    const res = await fetch(`/api/projects/${currentProjectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);

    await loadProjects();
    openDetail(currentProjectId);
    btn.textContent = 'Saved!';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }, 1500);
  } catch (err) {
    alert('Failed to save: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
});

// --- Init ---------------------------------------------------

loadProjects().then(() => {
  renderHome();
  showView('home');
});
