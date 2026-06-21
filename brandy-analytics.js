(function () {
  const KEY = 'brandy_analytics';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }
  function now() { return new Date().toISOString(); }
  function today() { return new Date().toISOString().slice(0, 10); }

  function init() {
    const currentPage = location.pathname.split('/').pop() || 'index3.html';

    // Never track the admin analytics page itself
    if (currentPage === 'analytics.html') return;

    const data = load();
    if (!data.pageViews) data.pageViews = [];
    if (!data.sessions)  data.sessions  = [];
    if (!data.visits)    data.visits    = [];
    if (!data.cartAdds)  data.cartAdds  = [];
    if (!data.orders)    data.orders    = [];

    // Unique visitors: one per browser/device forever (localStorage never resets)
    if (!localStorage.getItem('brandy_visitor_id')) {
      const vid = 'v' + Date.now() + Math.random().toString(36).slice(2, 7);
      localStorage.setItem('brandy_visitor_id', vid);
      data.sessions.push({ time: now(), page: currentPage, id: vid });
    }

    // Total visits: one per sitting (sessionStorage resets when browser/tab closes)
    // So coming back tomorrow counts as a new visit, but clicking through pages doesn't
    if (!sessionStorage.getItem('brandy_visit_tracked')) {
      sessionStorage.setItem('brandy_visit_tracked', '1');
      data.visits.push({ time: now(), date: today() });
    }

    // Page views: used only for the "traffic by page" chart breakdown
    data.pageViews.push({ page: currentPage, time: now() });

    save(data);
  }

  function trackAddToCart(productName, price) {
    const data = load();
    data.cartAdds.push({ product: productName || 'Off-White T-Shirt', price: price || 700, time: now(), date: today() });
    save(data);
  }

  function trackPurchase(total, items, paymentMethod, area) {
    const data = load();
    const orderId = 'ORD' + String(data.orders.length + 1).padStart(4, '0');
    data.orders.push({
      id: orderId,
      time: now(),
      date: today(),
      total: total || 0,
      items: items || [],
      payment: paymentMethod || 'unknown',
      area: area || 'unknown'
    });
    save(data);
  }

  window.BrandyAnalytics = { trackAddToCart, trackPurchase };
  init();
})();
