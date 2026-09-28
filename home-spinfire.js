const workspace = document.querySelector('[data-spinfire-workspace]');

if (workspace) {
  const tablist = workspace.querySelector('[data-spinfire-tabs]');
  const tabs = [...tablist.querySelectorAll('[data-spinfire-tab]')];
  const panels = [...workspace.querySelectorAll('[data-spinfire-panel]')];
  const events = new AbortController();
  const { signal } = events;
  const mobileLayout = matchMedia('(max-width: 800px)');

  // Anchors remain useful image links if JavaScript is unavailable.
  tablist.setAttribute('role', 'tablist');
  const updateOrientation = () => tablist.setAttribute('aria-orientation', mobileLayout.matches ? 'horizontal' : 'vertical');
  updateOrientation();
  mobileLayout.addEventListener('change', updateOrientation, { signal });
  tabs.forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', tab.dataset.spinfireTab);
  });
  panels.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabs.find(tab => tab.dataset.spinfireTab === panel.id).id);
    panel.tabIndex = 0;
  });

  const selectTab = (index, focus = false) => {
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.id !== tabs[index].dataset.spinfireTab; });
    if (focus) tabs[index].focus({ preventScroll: true });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectTab(index);
    }, { signal });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (event.key === ' ') next = index;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(next, true);
    }, { signal });
  });

  selectTab(0);

  // Keep the existing floating controls clear of the mobile product preview.
  const section = workspace.closest('#spinfire');
  const visibility = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('spinfire-section-in-view', entry.isIntersecting);
  });
  visibility.observe(section);

  if (import.meta.hot) import.meta.hot.dispose(() => {
    events.abort();
    visibility.disconnect();
    document.body.classList.remove('spinfire-section-in-view');
  });
}
