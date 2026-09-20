/* =====================================================
   NEXUSBR CODE — script.js
   Preloader, rede de partículas, tilt 3D, contadores,
   digitação, navegação por páginas e orçamento -> WhatsApp
   + "banco" local de leads (localStorage) com exportação.
===================================================== */

const WHATSAPP_NUMERO = '5517988104590';

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. PRELOADER ---------- */
  const preloader = document.getElementById('preloader');
  const app = document.getElementById('app');
  setTimeout(() => {
    preloader.classList.add('hide');
    app.classList.add('revealed');
  }, 1600);

  /* ---------- 2. REDE DE PARTÍCULAS (canvas) ---------- */
  const canvas = document.getElementById('network');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };

  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function initParticles() {
    const count = Math.min(90, Math.floor(window.innerWidth / 14));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.6 + 0.8
    }));
  }
  initParticles();
  window.addEventListener('resize', initParticles);

  function drawNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(159, 246, 255, 0.85)';
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      if (mouse.x !== null) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) { p.x += dx / dist * 0.6; p.y += dy / dist * 0.6; }
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(79, 216, 232, ${1 - dist / 130})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawNetwork);
  }
  drawNetwork();

  /* ---------- 3. CURSOR GLOW ---------- */
  const glow = document.getElementById('cursor-glow');
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  /* ---------- 4. TILT 3D NOS CARDS ---------- */
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -10;
      const rotateY = ((x / rect.width) - 0.5) * 10;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  /* ---------- 5. EFEITO DE DIGITAÇÃO ---------- */
  const typedEl = document.getElementById('typedLine');
  const frases = [
    'Sites, softwares e sistemas sob medida.',
    'Do primeiro esboço ao deploy em produção.',
    'Mais de 30 projetos entregues.'
  ];
  let fraseIndex = 0, charIndex = 0, apagando = false;
  function typeLoop() {
    const frase = frases[fraseIndex];
    if (!apagando) {
      typedEl.textContent = frase.slice(0, charIndex + 1); charIndex++;
      if (charIndex === frase.length) { apagando = true; setTimeout(typeLoop, 1800); return; }
    } else {
      typedEl.textContent = frase.slice(0, charIndex - 1); charIndex--;
      if (charIndex === 0) { apagando = false; fraseIndex = (fraseIndex + 1) % frases.length; }
    }
    setTimeout(typeLoop, apagando ? 28 : 48);
  }
  setTimeout(typeLoop, 1900);

  /* ---------- 6. CONTADOR ---------- */
  function animarContador(el) {
    const alvo = parseInt(el.dataset.count, 10);
    let atual = 0;
    const passo = Math.max(1, Math.round(alvo / 40));
    const intervalo = setInterval(() => {
      atual += passo;
      if (atual >= alvo) { atual = alvo; clearInterval(intervalo); }
      el.textContent = atual;
    }, 30);
  }

  /* ---------- 7. REVEAL AO ROLAR (por página ativa) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        if (entry.target.querySelector('[data-count]')) {
          animarContador(entry.target.querySelector('[data-count]'));
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  function observarReveals(container) {
    container.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }
  observarReveals(document);

  /* ---------- 8. NAVEGAÇÃO ENTRE PÁGINAS ---------- */
  function irParaPagina(nome) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const destino = document.getElementById('page-' + nome);
    if (!destino) return;
    destino.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const navAtivo = document.querySelector(`.nav-link[data-nav="${nome}"]`);
    if (navAtivo) navAtivo.classList.add('active');

    document.getElementById('mobileNav').classList.remove('open');
    observarReveals(destino);

    if (nome === 'admin') renderAdmin();
  }

  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      irParaPagina(el.dataset.page);
    });
  });

  // header escondido quando não está na página "início" (evita sobreposição visual)
  irParaPagina('inicio');

  /* ---------- 9. MENU MOBILE ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  menuToggle.addEventListener('click', () => mobileNav.classList.toggle('open'));

  /* ---------- 10. "BANCO" LOCAL DE LEADS (localStorage) ---------- */
  const LEADS_KEY = 'nexusbr_leads';

  function getLeads() {
    try { return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function salvarLead(lead) {
    const leads = getLeads();
    leads.push(lead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  }
  function formatarData(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  function baixarArquivo(nomeArquivo, conteudo, tipo) {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nomeArquivo;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function montarTxtLead(lead) {
    return [
      'NEXUSBR Code — Protocolo de solicitação de orçamento',
      '======================================================',
      `Data: ${formatarData(lead.data)}`,
      `Nome: ${lead.nome}`,
      `E-mail: ${lead.email}`,
      `Telefone: ${lead.telefone}`,
      `Tipo de sistema: ${lead.tipo}`,
      `Negócio: ${lead.negocio || '-'}`,
      `Mensagem: ${lead.mensagem || '-'}`,
      '',
      'Este arquivo é o seu comprovante local da solicitação.'
    ].join('\n');
  }
  function montarMensagemWhatsapp(lead) {
    return [
      'Olá! Vim pelo site da NEXUSBR Code e quero solicitar um orçamento.',
      '',
      `Nome: ${lead.nome}`,
      `E-mail: ${lead.email}`,
      `Telefone: ${lead.telefone}`,
      `Tipo de sistema: ${lead.tipo}`,
      `Negócio: ${lead.negocio || '-'}`,
      `Detalhes: ${lead.mensagem || '-'}`
    ].join('\n');
  }

  /* ---------- 11. FORMULÁRIO DE ORÇAMENTO ---------- */
  const orcamentoForm = document.getElementById('orcamentoForm');
  const orcamentoSucesso = document.getElementById('orcamentoSucesso');
  const linkWhatsFallback = document.getElementById('linkWhatsFallback');

  if (orcamentoForm) {
    orcamentoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const lead = {
        nome: document.getElementById('ocNome').value.trim(),
        email: document.getElementById('ocEmail').value.trim(),
        telefone: document.getElementById('ocTelefone').value.trim(),
        tipo: document.getElementById('ocTipo').value,
        negocio: document.getElementById('ocNegocio').value.trim(),
        mensagem: document.getElementById('ocMensagem').value.trim(),
        data: new Date().toISOString()
      };

      salvarLead(lead);
      baixarArquivo(`orcamento-nexusbr-${Date.now()}.txt`, montarTxtLead(lead), 'text/plain;charset=utf-8');

      const urlWhats = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(montarMensagemWhatsapp(lead))}`;
      linkWhatsFallback.href = urlWhats;
      window.open(urlWhats, '_blank');

      orcamentoForm.reset();
      orcamentoForm.style.display = 'none';
      orcamentoSucesso.style.display = 'block';
      orcamentoSucesso.classList.add('reveal');
      requestAnimationFrame(() => orcamentoSucesso.classList.add('in-view'));
    });
  }

  /* ---------- 12. PAINEL ADMIN (leads locais) ---------- */
  function renderAdmin() {
    const leads = getLeads();
    const tbody = document.getElementById('adminTableBody');
    const empty = document.getElementById('adminEmpty');
    const table = document.getElementById('adminTable');
    tbody.innerHTML = '';

    if (leads.length === 0) {
      table.style.display = 'none';
      empty.style.display = 'block';
      return;
    }
    table.style.display = 'table';
    empty.style.display = 'none';

    leads.slice().reverse().forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatarData(lead.data)}</td>
        <td>${lead.nome}</td>
        <td>${lead.telefone}<br><span style="color:var(--text-dim);font-size:12px;">${lead.email}</span></td>
        <td>${lead.tipo}</td>
        <td>${lead.negocio || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const btnExportTxt = document.getElementById('btnExportTxt');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const btnClearLeads = document.getElementById('btnClearLeads');

  if (btnExportTxt) btnExportTxt.addEventListener('click', () => {
    const leads = getLeads();
    if (leads.length === 0) return;
    const texto = leads.map(montarTxtLead).join('\n\n------------------------------------------------------\n\n');
    baixarArquivo(`leads-nexusbr-${Date.now()}.txt`, texto, 'text/plain;charset=utf-8');
  });

  if (btnExportCsv) btnExportCsv.addEventListener('click', () => {
    const leads = getLeads();
    if (leads.length === 0) return;
    const cabecalho = 'Data;Nome;Email;Telefone;Tipo;Negocio;Mensagem\n';
    const linhas = leads.map(l =>
      [formatarData(l.data), l.nome, l.email, l.telefone, l.tipo, l.negocio, (l.mensagem || '').replace(/\n/g, ' ')]
        .map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(';')
    ).join('\n');
    baixarArquivo(`leads-nexusbr-${Date.now()}.csv`, cabecalho + linhas, 'text/csv;charset=utf-8');
  });

  if (btnClearLeads) btnClearLeads.addEventListener('click', () => {
    if (confirm('Tem certeza que quer apagar todas as solicitações salvas neste navegador?')) {
      localStorage.removeItem(LEADS_KEY);
      renderAdmin();
    }
  });

});