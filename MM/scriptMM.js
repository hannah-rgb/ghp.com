

let currentOverlay = 5; // start after slide-05

function revealNext() {
  currentOverlay++;
  const nextOverlay = document.getElementById('overlay-' + currentOverlay);
  const button = document.querySelector('.reveal-button');

  if (nextOverlay) {
    nextOverlay.classList.add('visible');
  } else {
    // No more overlays: hide the button
    button.style.display = 'none';
  }
}
window.addEventListener('load', () => {
  const scroller  = document.querySelector('.scroll-container');
  const sections  = [...document.querySelectorAll('.snap-section')];
  const slideEl   = document.getElementById('slide-number');
  const headers   = document.querySelectorAll('.fixed-header [data-label]');

  // slide → header label ranges (adjust as you change slide order)
  const bands = [
    { label:'intro',  from:0,  to:5  },
    { label:'ref',    from:6,  to:11  },
    { label:'sensor', from:12,  to:19 },
    { label:'poster', from:20, to:33 },
    { label:'plans',  from:34, to:35 },
    // { label:'final',  from:34, to:sections.length - 1 },
  ];

  const closestSlideIndex = () => {
    let idx = 0, best = Infinity;
    for (let i = 0; i < sections.length; i++) {
      const d = Math.abs(sections[i].getBoundingClientRect().top);
      if (d < best) { best = d; idx = i; }
    }
    return idx;
  };

  const updateHeaderStyles = (current) => {
    const band = bands.find(b => current >= b.from && current <= b.to);
    headers.forEach(el => {
      const active = band && el.dataset.label === band.label;
      el.classList.toggle('is-active', !!active);
      // if you’re not using the .is-active CSS, you can do inline styles instead:
      // el.style.opacity = active ? '1' : '.15';
      // el.style.fontFamily = active ? 'PPL' : 'PP';
    });
  };

const headerEl = document.querySelector('.fixed-header');

const tick = () => {
  const i = closestSlideIndex();

  // footer number (you already have this)
  if (slideEl) slideEl.textContent = i + 1;

  // hide header on slides 1 & 2 (indexes 0 and 1)
  if (headerEl) headerEl.classList.toggle('is-hidden', i < 2);

  // only update header highlight when visible (optional)
  if (i >= 2) updateHeaderStyles(i);
};
  (scroller || window).addEventListener('scroll', () => requestAnimationFrame(tick), { passive:true });
  tick(); // initial render
});



document.addEventListener('keydown', (e) => {
  const sections = document.querySelectorAll('.snap-section');
  const keyMap = {
    '1': 0,
    '2': 1,
    '3': 2,
    '4': 3,
    '5': 4,
    '6': 5,
    '7': 6,
    '8': 7,
    '9': 8,
    '0': 9,
    'q': 10,
    'w': 11,
    'e': 12,
    'r': 13,
    't': 14,
    'y': 15,
    'u': 16,
    'i': 17,
    'o': 18,
    'p': 19,
  };

  const index = keyMap[e.key.toLowerCase()];
  if (index !== undefined && sections[index]) {
    sections[index].scrollIntoView({ behavior: 'smooth' });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('figure.switcher').forEach(fig => {
    const img     = fig.querySelector('img');
    const capSel  = fig.dataset.caption;
    const capEl   = capSel ? document.querySelector(capSel) : null;
    const src1    = fig.dataset.src1;
    const src2    = fig.dataset.src2;
    const cap1    = fig.dataset.cap1 || '';
    const cap2    = fig.dataset.cap2 || '';

    // Preload the second image to avoid flicker
    if (src2) { const preload = new Image(); preload.src = src2; }

    const swap = () => {
      const onAlt = fig.dataset.toggled === '1';
      img.src = onAlt ? src1 : src2;
      if (capEl) capEl.innerHTML = onAlt ? cap1 : cap2;
      fig.dataset.toggled = onAlt ? '0' : '1';
    };

    fig.addEventListener('click', swap);
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); swap(); }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const stack = document.getElementById('mm-stack');
  if (!stack) return;

  const slides = [...stack.querySelectorAll('.stack-slide')];
  let i = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));

  function setActive(n){
    slides[i].classList.remove('is-active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('is-active');
  }

document.addEventListener('DOMContentLoaded', () => {
  // Mute all native <video> elements
  document.querySelectorAll('video').forEach(v => {
    v.muted = true;           // runtime
    v.defaultMuted = true;    // default
    v.setAttribute('muted','');
    v.setAttribute('playsinline',''); // helps mobile autoplay
  });

  // Ensure YouTube & Vimeo iframes start muted
  document.querySelectorAll('iframe').forEach(f => {
    try {
      const url = new URL(f.src, location.href);

      // YouTube
      if (/youtube\.com|youtube-nocookie\.com/.test(url.hostname)) {
        url.searchParams.set('autoplay', '1');
        url.searchParams.set('mute', '1');
        url.searchParams.set('playsinline', '1');
        f.allow = (f.allow || '') + '; autoplay; picture-in-picture';
        if (f.src !== url.toString()) f.src = url.toString();
      }

      // Vimeo
      if (/vimeo\.com/.test(url.hostname)) {
        url.searchParams.set('autoplay', '1');
        url.searchParams.set('muted', '1'); // works on Vimeo embeds
        f.allow = (f.allow || '') + '; autoplay; fullscreen; picture-in-picture';
        if (f.src !== url.toString()) f.src = url.toString();

        // Fallback: force volume to 0 via postMessage after load
        f.addEventListener('load', () => {
          try { f.contentWindow.postMessage({ method: 'setVolume', value: 0 }, '*'); } catch {}
        });
      }
    } catch {}
  });
});

  // click anywhere in the stack to go next
  stack.addEventListener('click', (e) => {
    if (e.target.closest('.stack-prev')) { e.stopPropagation(); setActive(i-1); return; }
    if (e.target.closest('.stack-next')) { e.stopPropagation(); setActive(i+1); return; }
    setActive(i+1);
  });

  // arrow keys / space
  stack.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') setActive(i+1);
    if (e.key === 'ArrowLeft') setActive(i-1);
  });

  // keep focus so keys work

  // optional: prevent wheel from leaving this slide while stepping
  stack.addEventListener('wheel', (e) => { e.preventDefault(); }, { passive:false });
});
