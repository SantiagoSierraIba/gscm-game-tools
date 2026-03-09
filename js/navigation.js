/* ── navigation.js ─ Scroll-spy, sidebar toggle, overlay ── */
(function() {
  var btn = document.getElementById('scrollBtn');
  var toc = document.getElementById('toc');
  var toggle = document.getElementById('tocToggle');
  var overlay = document.getElementById('tocOverlay');
  var tocLinks = toc.querySelectorAll('a[data-target]');

  // Scroll-to-top
  window.addEventListener('scroll', function() {
    btn.style.display = window.scrollY > 600 ? 'flex' : 'none';
  });

  // Mobile sidebar toggle
  function openSidebar() {
    toc.classList.add('open');
    overlay.classList.add('show');
    toggle.innerHTML = '&times;';
  }
  function closeSidebar() {
    toc.classList.remove('open');
    overlay.classList.remove('show');
    toggle.innerHTML = '&#9776;';
  }
  toggle.addEventListener('click', function() {
    toc.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  overlay.addEventListener('click', closeSidebar);

  // Close sidebar on link click (mobile)
  tocLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 900) closeSidebar();
    });
  });

  // Scroll-spy: highlight active TOC link
  var targets = [];
  tocLinks.forEach(function(link) {
    var id = link.getAttribute('data-target');
    var el = document.getElementById(id);
    if (el) targets.push({ id: id, el: el, link: link });
  });

  function updateActive() {
    var scrollY = window.scrollY + 120;
    var current = null;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].el.offsetTop <= scrollY) {
        current = targets[i];
      }
    }
    tocLinks.forEach(function(l) { l.classList.remove('active'); });
    if (current) {
      current.link.classList.add('active');
      // Keep active link visible in sidebar scroll
      var linkTop = current.link.offsetTop;
      var tocScroll = toc.scrollTop;
      var tocHeight = toc.clientHeight;
      if (linkTop < tocScroll + 80 || linkTop > tocScroll + tocHeight - 80) {
        toc.scrollTo({ top: linkTop - tocHeight / 3, behavior: 'smooth' });
      }
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() { updateActive(); ticking = false; });
      ticking = true;
    }
  });
  updateActive();
})();
