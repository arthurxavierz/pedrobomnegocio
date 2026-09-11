/* ------------------------------------------------------------------
   CONFIGURAÇÃO DA CAMPANHA
   Único lugar a editar para colocar o site no ar.
   - whatsappNumber: número que recebe os cadastros, formato internacional
     apenas com dígitos (55 + DDD + número). Ex.: '5534999999999'.
   - whatsappGroupUrl: link do convite do grupo oficial (chat.whatsapp.com/...).
     Deixe vazio enquanto o convite não existir: o botão avisa que está pendente.
------------------------------------------------------------------ */
const SITE_CONFIG = {
  whatsappNumber: '',
  whatsappGroupUrl: ''
};

const body = document.body;
const loader = document.querySelector('.loader');
const header = document.querySelector('[data-header]');
const progress = document.querySelector('.scroll-progress span');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const pointerLight = document.querySelector('.pointer-light');
const modal = document.querySelector('[data-modal]');

const proposalContent = {
  producao: {
    number: '01',
    tag: 'PRODUÇÃO E EMPREGO',
    title: 'MINAS QUE PRODUZ',
    copy: 'Uma agenda para valorizar as vocações regionais e reduzir as barreiras enfrentadas por quem trabalha e empreende.',
    items: [
      'Apoiar programas de qualificação conectados às demandas de cada região.',
      'Defender ambiente mais simples para pequenos negócios e produtores.',
      'Fortalecer cooperativas, associações e cadeias produtivas mineiras.'
    ]
  },
  estradas: {
    number: '02',
    tag: 'INFRAESTRUTURA',
    title: 'ESTRADAS QUE CONECTAM',
    copy: 'Infraestrutura tratada como segurança, competitividade e acesso a serviços para todos os municípios.',
    items: [
      'Mapear trechos críticos com participação das comunidades e do setor produtivo.',
      'Priorizar manutenção preventiva e transparência no acompanhamento de obras.',
      'Articular soluções para estradas vicinais e rotas de escoamento.'
    ]
  },
  gestao: {
    number: '03',
    tag: 'EFICIÊNCIA PÚBLICA',
    title: 'GESTÃO QUE ENTREGA',
    copy: 'O cidadão precisa acompanhar o que foi prometido, o que está em andamento e o que já foi concluído.',
    items: [
      'Defender metas públicas e indicadores simples para programas estaduais.',
      'Estimular serviços digitais que reduzam filas e burocracia.',
      'Criar uma rotina aberta de acompanhamento dos compromissos do mandato.'
    ]
  },
  inclusao: {
    number: '04',
    tag: 'INCLUSÃO',
    title: 'ACOLHER COM ESTRUTURA',
    copy: 'Inclusão de verdade exige serviços coordenados e apoio contínuo para as pessoas e suas famílias.',
    items: [
      'Fortalecer a articulação regional entre saúde, educação e assistência.',
      'Apoiar formação de profissionais para atendimento mais preparado.',
      'Dar visibilidade às necessidades das famílias na construção das políticas públicas.'
    ]
  },
  municipios: {
    number: '05',
    tag: 'DESENVOLVIMENTO REGIONAL',
    title: 'MUNICÍPIOS FORTES',
    copy: 'Somar forças aos prefeitos para conquistar recursos e tirar do papel os projetos prioritários de cada cidade.',
    items: [
      'Trabalhar com os prefeitos acima das diferenças políticas e partidárias.',
      'Ajudar os municípios a conquistar recursos para projetos prioritários.',
      'Estar presente durante todo o mandato, e não apenas em período eleitoral.'
    ]
  },
  jovens: {
    number: '06',
    tag: 'FUTURO E OPORTUNIDADE',
    title: 'JOVENS QUE REALIZAM',
    copy: 'O jovem mineiro precisa encontrar formação, oportunidade e espaço para realizar seus projetos dentro do estado.',
    items: [
      'Aproximar formação técnica das oportunidades de cada região.',
      'Estimular educação empreendedora e preparação para o primeiro emprego.',
      'Apoiar ambientes de inovação ligados aos desafios dos municípios.'
    ]
  }
};

const regionContent = {
  alto: ['ALTO PARANAÍBA', 'Produção rural, infraestrutura, saúde regional e oportunidades para quem quer permanecer e crescer perto de casa.', '01'],
  triangulo: ['TRIÂNGULO', 'Logística, desenvolvimento econômico, inovação e integração entre cidades que movimentam Minas.', '02'],
  norte: ['NORTE DE MINAS', 'Segurança hídrica, acesso a serviços, produção sustentável e caminhos para gerar oportunidade.', '03'],
  centro: ['REGIÃO CENTRAL', 'Mobilidade, serviços públicos eficientes, qualificação e desenvolvimento urbano responsável.', '04'],
  sul: ['SUL DE MINAS', 'Valorização das cadeias produtivas, conectividade, turismo e apoio ao empreendedor local.', '05']
};

const finishLoading = () => {
  window.setTimeout(() => loader?.classList.add('is-finished'), 1750);
};

if (document.readyState === 'complete') finishLoading();
else window.addEventListener('load', finishLoading, { once: true });

const updateScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? window.scrollY / max : 0;
  progress.style.transform = `scaleX(${value})`;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
};

window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

menuToggle?.addEventListener('click', () => {
  const isOpen = body.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal').forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(item);
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('is-active', item === button);
      item.setAttribute('aria-selected', String(item === button));
    });
    document.querySelectorAll('[data-category]').forEach(card => {
      card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

document.querySelectorAll('[data-region]').forEach(button => {
  button.addEventListener('click', () => {
    const content = regionContent[button.dataset.region];
    document.querySelectorAll('[data-region]').forEach(item => item.classList.toggle('is-active', item === button));
    const title = document.querySelector('[data-region-title]');
    const copy = document.querySelector('[data-region-copy]');
    const index = document.querySelector('[data-region-index]');
    [title, copy, index].forEach(item => item.animate([
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' }));
    title.textContent = content[0];
    copy.textContent = content[1];
    index.textContent = content[2];
  });
});

const openProposal = key => {
  const content = proposalContent[key];
  if (!content || !modal) return;
  modal.querySelector('[data-modal-number]').textContent = content.number;
  modal.querySelector('[data-modal-tag]').textContent = content.tag;
  modal.querySelector('[data-modal-title]').textContent = content.title;
  modal.querySelector('[data-modal-copy]').textContent = content.copy;
  modal.querySelector('[data-modal-list]').innerHTML = content.items.map(item => `<li>${item}</li>`).join('');
  modal.showModal();
  body.classList.add('modal-open');
};

document.querySelectorAll('[data-proposal]').forEach(button => {
  button.addEventListener('click', () => openProposal(button.dataset.proposal));
});

const closeModal = () => {
  modal?.close();
  body.classList.remove('modal-open');
};

document.querySelector('[data-modal-close]')?.addEventListener('click', closeModal);
modal?.addEventListener('click', event => {
  if (event.target === modal) closeModal();
});
modal?.addEventListener('close', () => body.classList.remove('modal-open'));

if (window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', event => {
    pointerLight.style.left = `${event.clientX}px`;
    pointerLight.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.querySelectorAll('.magnetic').forEach(item => {
    item.addEventListener('pointermove', event => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .14;
      const y = (event.clientY - rect.top - rect.height / 2) * .14;
      item.style.transform = `translate(${x}px, ${y}px)`;
    });
    item.addEventListener('pointerleave', () => item.style.transform = 'translate(0,0)');
  });

  const parallax = document.querySelector('[data-parallax]');
  document.querySelector('.hero')?.addEventListener('pointermove', event => {
    const x = (event.clientX / window.innerWidth - .5) * 10;
    const y = (event.clientY / window.innerHeight - .5) * 10;
    parallax.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.desktop-nav a,.mobile-menu nav a').forEach(link => {
  const href = link.getAttribute('href')?.replace('./','');
  if (href === currentPage) link.setAttribute('aria-current','page');
});

const proposalDetails = {
  producao: {
    index: '01', tag: 'PRODUÇÃO E EMPREGO', title: 'MINAS QUE PRODUZ',
    copy: 'Uma agenda para valorizar as vocações regionais e reduzir as barreiras enfrentadas por quem trabalha e empreende.',
    why: 'Minas cresce quando cada região consegue transformar sua vocação em renda, trabalho e oportunidade perto de casa.',
    items: ['Qualificação conectada às demandas de cada região.','Ambiente mais simples para pequenos negócios e produtores.','Fortalecimento de cooperativas e cadeias produtivas mineiras.']
  },
  estradas: {
    index: '02', tag: 'INFRAESTRUTURA', title: 'ESTRADAS QUE CONECTAM',
    copy: 'Infraestrutura tratada como segurança, competitividade e acesso para todos os municípios.',
    why: 'Estradas em boas condições aproximam serviços, reduzem perdas e melhoram o escoamento de tudo o que Minas produz.',
    items: ['Mapeamento de trechos críticos com participação regional.','Manutenção preventiva e transparência nas obras.','Atenção a estradas vicinais e rotas de escoamento.']
  },
  gestao: {
    index: '03', tag: 'GESTÃO PÚBLICA', title: 'GESTÃO QUE ENTREGA',
    copy: 'O cidadão precisa acompanhar com clareza o que foi assumido, o que está em andamento e o que foi concluído.',
    why: 'Recursos públicos precisam ser usados com planejamento, metas compreensíveis e prestação de contas acessível.',
    items: ['Metas públicas e indicadores simples para programas.','Serviços digitais que reduzam filas e burocracia.','Acompanhamento aberto dos compromissos do mandato.']
  },
  inclusao: {
    index: '04', tag: 'INCLUSÃO', title: 'ACOLHER COM ESTRUTURA',
    copy: 'Inclusão de verdade exige serviços coordenados e apoio contínuo para pessoas e famílias.',
    why: 'Quando saúde, educação e assistência atuam juntas, o cuidado deixa de depender da capacidade individual de cada família.',
    items: ['Articulação regional entre saúde, educação e assistência.','Formação de profissionais para atendimento preparado.','Escuta das famílias na construção das políticas públicas.']
  },
  municipios: {
    index: '05', tag: 'DESENVOLVIMENTO REGIONAL', title: 'MUNICÍPIOS FORTES',
    copy: 'Somar forças aos prefeitos para conquistar recursos e tirar do papel os projetos prioritários de cada cidade.',
    why: 'Somos passageiros. O prefeito muda, o povo fica: por isso o compromisso com a cidade precisa valer independente de quem estiver na prefeitura.',
    items: ['Trabalho com os prefeitos acima das diferenças partidárias.','Apoio aos municípios para conquistar recursos.','Presença durante todo o mandato, não só na eleição.']
  },
  jovens: {
    index: '06', tag: 'FUTURO E OPORTUNIDADE', title: 'JOVENS QUE REALIZAM',
    copy: 'O jovem mineiro precisa encontrar formação, oportunidade e espaço para realizar seus projetos dentro do estado.',
    why: 'Formação conectada à realidade local ajuda jovens a construir futuro sem precisar abandonar suas cidades.',
    items: ['Formação técnica ligada às oportunidades regionais.','Educação empreendedora e preparação para o primeiro emprego.','Ambientes de inovação voltados aos desafios dos municípios.']
  }
};

document.querySelectorAll('[data-detail-proposal]').forEach(button => button.addEventListener('click',() => {
  const content = proposalDetails[button.dataset.detailProposal];
  if (!content) return;
  document.querySelectorAll('[data-detail-proposal]').forEach(item => {
    const active = item === button;
    item.classList.toggle('is-active',active);
    item.setAttribute('aria-selected',String(active));
  });
  const fields = {
    '[data-detail-index]': content.index,
    '[data-detail-tag]': content.tag,
    '[data-detail-title]': content.title,
    '[data-detail-copy]': content.copy,
    '[data-detail-why]': content.why
  };
  Object.entries(fields).forEach(([selector,value]) => {
    const node = document.querySelector(selector);
    if (!node) return;
    node.textContent = value;
    node.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.16,1,.3,1)'});
  });
  const list = document.querySelector('[data-detail-list]');
  if (list) {
    list.innerHTML = content.items.map(item => `<li>${item}</li>`).join('');
    list.animate([{opacity:0},{opacity:1}],{duration:420});
  }
}));

const toast = document.querySelector('[data-toast]');
let toastTimer;
const showToast = message => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'),4200);
};

document.querySelector('[data-whatsapp-placeholder]')?.addEventListener('click',() => {
  if (!SITE_CONFIG.whatsappGroupUrl) {
    showToast('O convite do grupo oficial ainda será divulgado. Acompanhe o Instagram da campanha.');
    return;
  }
  window.open(SITE_CONFIG.whatsappGroupUrl,'_blank','noopener');
});

const joinForm = document.querySelector('[data-join-form]');
joinForm?.addEventListener('submit',event => {
  event.preventDefault();
  const required = [...joinForm.querySelectorAll('[required]')];
  required.forEach(field => field.classList.toggle('is-invalid',!field.checkValidity()));
  const invalid = required.find(field => !field.checkValidity());
  if (invalid) {
    invalid.focus();
    showToast('Revise os campos obrigatórios antes de continuar.');
    return;
  }
  const data = new FormData(joinForm);
  const valor = campo => (data.get(campo) || '').toString().trim();
  const mensagem = valor('mensagem');

  const linhas = [
    'Olá! Quero fazer parte da campanha do Pedro Bom Negócio.',
    '',
    `Nome: ${valor('nome')}`,
    `Cidade: ${valor('cidade')}`,
    `WhatsApp: ${valor('whatsapp')}`,
    `Como quero participar: ${valor('interesse')}`
  ];
  if (mensagem) linhas.push(`Mensagem: ${mensagem}`);

  const texto = encodeURIComponent(linhas.join(String.fromCharCode(10)));
  const destino = SITE_CONFIG.whatsappNumber
    ? `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${texto}`
    : `https://wa.me/?text=${texto}`;

  const status = joinForm.querySelector('[data-form-status]');
  status.textContent = 'Abrindo o WhatsApp com sua mensagem pronta. É só tocar em enviar.';
  status.classList.add('is-visible');
  joinForm.querySelector('button[type="submit"]').textContent = 'ABRINDO O WHATSAPP...';

  window.open(destino,'_blank','noopener');
});
