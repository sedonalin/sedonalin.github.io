document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════
     1. Scrolled nav shadow
  ══════════════════════════════════════════ */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════════════════════════════════════
     2. Mobile hamburger menu
  ══════════════════════════════════════════ */
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      })
    );
  }

  /* ══════════════════════════════════════════
     3. Fade-in on scroll
  ══════════════════════════════════════════ */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    fadeEls.forEach(el => io.observe(el));
  }

  /* ══════════════════════════════════════════
     4. Portfolio 分類 + 子分類篩選
  ══════════════════════════════════════════ */
  const catBtns    = document.querySelectorAll('.portfolio-cats .cat-btn');
  const subcatRow  = document.getElementById('subcatRow');
  const subcatBtns = subcatRow ? subcatRow.querySelectorAll('.subcat-btn') : [];
  const pfGrid     = document.getElementById('pfGrid');
  const pfItems    = document.querySelectorAll('.pf-item');

  let activeCat    = '全部';
  let activeSubcat = '全部';

  function getVisibleItems() {
    return [...pfItems].filter(el => el.style.display !== 'none');
  }

  function applyFilter() {
    pfItems.forEach(item => {
      const cat    = item.dataset.cat;
      const subcat = item.dataset.subcat;
      let show = true;
      if (activeCat !== '全部' && cat !== activeCat) show = false;
      if (activeCat === '主題寫真' && activeSubcat !== '全部' && subcat !== activeSubcat) show = false;
      item.style.display = show ? '' : 'none';
    });
  }

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat    = btn.dataset.cat;
      activeSubcat = '全部';

      // 子分類列：主題寫真才顯示
      if (subcatRow) {
        subcatRow.style.display = activeCat === '主題寫真' ? 'flex' : 'none';
        subcatBtns.forEach(b => b.classList.remove('active'));
        if (subcatBtns[0]) subcatBtns[0].classList.add('active');
      }

      // 全部 → IG 小方格；其他分類 → 一般大格
      if (pfGrid) pfGrid.classList.toggle('pf-grid--dense', activeCat === '全部');

      applyFilter();
    });
  });

  subcatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subcatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSubcat = btn.dataset.subcat;
      applyFilter();
    });
  });

  // 頁面載入預設：全部 → 小方格模式
  if (pfGrid) pfGrid.classList.add('pf-grid--dense');

  /* ══════════════════════════════════════════
     5. LIGHTBOX
  ══════════════════════════════════════════ */
  const overlay  = document.getElementById('lbOverlay');
  if (overlay) {
    const lbImg    = document.getElementById('lbImg');
    const lbInfo   = document.getElementById('lbInfo');
    const lbClose  = document.getElementById('lbClose');
    const lbPrev   = document.getElementById('lbPrev');
    const lbNext   = document.getElementById('lbNext');
    const lbSpinner= document.getElementById('lbSpinner');
    let currentIdx = 0;

    // 點擊 pf-item 開啟 Lightbox
    pfItems.forEach(item => {
      item.addEventListener('click', () => {
        const visible = getVisibleItems();
        const visIdx  = visible.indexOf(item);
        openLightbox(visible, visIdx >= 0 ? visIdx : 0);
      });
    });

    function openLightbox(items, idx) {
      overlay.dataset.items = JSON.stringify(
        items.map(el => ({
          src:   el.querySelector('img').src,
          label: el.dataset.subcat || el.dataset.cat || ''
        }))
      );
      showImage(idx);
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      lbImg.src = '';
    }

    function showImage(idx) {
      const items = JSON.parse(overlay.dataset.items || '[]');
      if (!items.length) return;
      idx = (idx + items.length) % items.length;
      currentIdx = idx;
      const { src, label } = items[idx];

      if (lbSpinner) lbSpinner.style.display = 'block';
      lbImg.style.opacity = '0';

      const tmpImg = new Image();
      tmpImg.onload = () => {
        lbImg.src = src;
        lbImg.style.opacity = '1';
        if (lbSpinner) lbSpinner.style.display = 'none';
      };
      tmpImg.onerror = () => {
        lbImg.src = src;
        if (lbSpinner) lbSpinner.style.display = 'none';
      };
      tmpImg.src = src;

      if (lbInfo) lbInfo.textContent = `${idx + 1} / ${items.length}`;
      const show = items.length > 1;
      if (lbPrev) lbPrev.style.display = show ? '' : 'none';
      if (lbNext) lbNext.style.display = show ? '' : 'none';
    }

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev)  lbPrev.addEventListener('click',  e => { e.stopPropagation(); showImage(currentIdx - 1); });
    if (lbNext)  lbNext.addEventListener('click',  e => { e.stopPropagation(); showImage(currentIdx + 1); });
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });

    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  showImage(currentIdx - 1);
      if (e.key === 'ArrowRight') showImage(currentIdx + 1);
    });

    let touchStartX = 0;
    overlay.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    overlay.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) dx < 0 ? showImage(currentIdx + 1) : showImage(currentIdx - 1);
    });
  }

  /* ══════════════════════════════════════════
     6. Mark active nav link
  ══════════════════════════════════════════ */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .nav-drawer a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });

});
