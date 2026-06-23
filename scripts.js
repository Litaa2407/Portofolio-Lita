window.addEventListener('DOMContentLoaded', () => {
  // Load saved theme preference immediately
  const isDarkAmbient = localStorage.getItem('darkAmbient') === 'true';
  if (isDarkAmbient) {
    document.body.classList.add('dark-ambient');
  }

  const loader = document.getElementById('page-loader');
  if (!loader) {
    // Detail page fallback (runs cursor glow and scroll reveal without loader screen)
    document.body.classList.add('hero-animated');
    setupScrollReveal();
    setupCursorGlow();
    return;
  }

  const navigation = performance.getEntriesByType('navigation')[0] || {};
  const navigationType = navigation.type || (performance.navigation && performance.navigation.type === 1 ? 'reload' : 'navigate');
  const loaderShown = sessionStorage.getItem('loaderShown') === 'true';

  const setupScrollReveal = () => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.scroll-reveal').forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));
  };

  const setupCursorGlow = () => {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    });

    const animateGlow = () => {
      // Lerp logic for smooth, organic drag-behind cursor effect
      glowX += (mouseX - glowX) * 0.07;
      glowY += (mouseY - glowY) * 0.07;

      // Center the 650px spotlight on the mouse cursor
      glow.style.transform = `translate3d(${glowX - 325}px, ${glowY - 325}px, 0)`;

      requestAnimationFrame(animateGlow);
    };

    animateGlow();
  };

  const showToast = (message) => {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');

    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    }, 3000);
  };

  const setupEmailToast = () => {
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (!emailLink) return;

    emailLink.addEventListener('click', (e) => {
      const email = 'elizabethyulita316@gmail.com';
      
      // Copy to clipboard
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Email disalin ke clipboard: ${email}`);
      }).catch((err) => {
        console.error('Gagal menyalin email: ', err);
      });
    });
  };

  const playSwitchSound = (isDark) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // First click component (sharp transient)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(isDark ? 900 : 700, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(isDark ? 1300 : 500, ctx.currentTime + 0.04);
      
      gain1.gain.setValueAtTime(0.04, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.05);

      // Second component (case resonance, slightly delayed to sound like a physical switch latch)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(isDark ? 160 : 130, ctx.currentTime + 0.015);
      
      gain2.gain.setValueAtTime(0.06, ctx.currentTime + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.015);
      osc2.stop(ctx.currentTime + 0.07);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  };

  const setupAmbientToggle = () => {
    const toggle = document.getElementById('ambient-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const wasDark = document.body.classList.contains('dark-ambient');
      if (wasDark) {
        document.body.classList.remove('dark-ambient');
        localStorage.setItem('darkAmbient', 'false');
        playSwitchSound(false);
      } else {
        document.body.classList.add('dark-ambient');
        localStorage.setItem('darkAmbient', 'true');
        playSwitchSound(true);
      }
    });
  };

  const setupScrollSpy = () => {
    const sections = document.querySelectorAll('section, footer, header.hero');
    const navLinks = document.querySelectorAll('.nav-links a');
    if (sections.length === 0 || navLinks.length === 0) return;

    const options = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active-nav');
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active-nav');
            }
          });
        }
      });
    }, options);

    sections.forEach(section => {
      if (section.getAttribute('id')) {
        observer.observe(section);
      }
    });
  };

  const setupBackToTop = () => {
    const btt = document.getElementById('back-to-top');
    if (!btt) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btt.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
        btt.classList.add('opacity-100', 'translate-y-0');
      } else {
        btt.classList.remove('opacity-100', 'translate-y-0');
        btt.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
      }
    });

    btt.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  };

  const setup3DTilt = () => {
    const elements = document.querySelectorAll('.log-entry, .hero-photo');
    elements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((centerY - y) / centerY) * 12;
        const rotateY = ((x - centerX) / centerX) * 12;
        
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  };

  const setupTypewriter = () => {
    const textEl = document.getElementById('typewriter-text');
    if (!textEl) return;

    const words = ['Full-Stack Developer', 'Mobile Developer', 'Mahasiswa Informatika'];
    let wordIndex = 0;
    let charIndex = 0;
    let delay = 120;

    const type = () => {
      const currentWord = words[wordIndex];
      charIndex++;
      delay = 120; // typing speed

      textEl.textContent = currentWord.substring(0, charIndex);

      if (charIndex === currentWord.length) {
        delay = 2500; // Pause for 2.5 seconds on the full word
        charIndex = 0; // Reset index to start next word
        wordIndex = (wordIndex + 1) % words.length;
      }

      setTimeout(type, delay);
    };

    type();
  };

  const setupCVButton = () => {
    const btn = document.getElementById('cv-btn');
    if (!btn) return;

    let isLoading = false;
    btn.addEventListener('click', () => {
      if (isLoading) return;
      isLoading = true;

      const spinner = btn.querySelector('.btn-spinner');
      const icon = btn.querySelector('.btn-icon');
      const text = document.getElementById('cv-btn-text');

      if (spinner) spinner.classList.remove('hidden');
      if (icon) icon.classList.add('hidden');
      if (text) text.textContent = 'Menghubungkan Dokumen...';

      setTimeout(() => {
        if (spinner) spinner.classList.add('hidden');
        if (icon) icon.classList.remove('hidden');
        if (text) text.textContent = 'Unduh / Lihat CV';
        isLoading = false;

        // Open local CV PDF file
        window.open('CV LITA (1).pdf', '_blank');

        showToast('Dokumen CV Elizabeth Yulita berhasil dibuka!');
      }, 1500);
    });
  };

  const setupProjectModal = () => {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    const modalTitle = document.getElementById('modal-project-title');
    const modalRole = document.getElementById('modal-project-role');
    const modalDesc = document.getElementById('modal-project-desc');
    const modalImage = document.getElementById('modal-project-image');
    const modalTechContainer = document.getElementById('modal-project-tech');
    const modalViewBtn = document.getElementById('modal-view-btn');

    const projectData = {
      'orkestra': {
        title: 'ORKESTRA',
        role: 'Full-stack (Pemrograman Mobile)',
        desc: 'Aplikasi manajemen keuangan organisasi mahasiswa dengan fitur pencatatan transaksi cepat, laporan bulanan otomatis, pemindaian OCR struk belanja menggunakan integrasi OpenRouter API, serta backend stabil berbasis Spring Boot dan PostgreSQL.',
        image: 'mockup-orkestra.jpg',
        tech: ['Flutter', 'Spring Boot', 'PostgreSQL', 'OpenRouter API'],
        link: 'orkestra.html'
      },
      'room-ukwms': {
        title: 'room.ukwms.ac.id',
        role: 'Full-stack (Web Application)',
        desc: 'Sistem manajemen peminjaman ruang & fasilitas kampus Universitas Katolik Widya Mandala Surabaya. Menampilkan visualisasi jadwal okupansi per jam secara interaktif, concurrency locking di backend Golang (Goroutines & Channels) untuk mencegah bentrok peminjaman, serta server-side rendering Next.js.',
        image: 'mockup-room.jpg',
        tech: ['Next.js', 'Golang', 'PostgreSQL', 'Tailwind CSS'],
        link: 'room-ukwms.html'
      }
    };

    const projectCards = document.querySelectorAll('.project-card-link');
    projectCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const projectId = card.getAttribute('data-project');
        const data = projectData[projectId];
        if (!data) return;

        e.preventDefault();

        if (modalTitle) modalTitle.textContent = data.title;
        if (modalRole) modalRole.textContent = data.role;
        if (modalDesc) modalDesc.textContent = data.desc;
        if (modalImage) {
          modalImage.src = data.image;
          modalImage.alt = `Pratinjau ${data.title}`;
        }
        if (modalViewBtn) modalViewBtn.href = data.link;

        if (modalTechContainer) {
          modalTechContainer.innerHTML = '';
          data.tech.forEach(tech => {
            const badge = document.createElement('span');
            badge.className = 'rounded-full bg-slate-100 dark:bg-stone-800 px-3 py-1 text-xs font-semibold text-slate-800 dark:text-stone-300 shadow-sm';
            badge.textContent = tech;
            modalTechContainer.appendChild(badge);
          });
        }

        modal.classList.add('show-modal');
        document.body.classList.add('modal-open');
      });
    });

    const closeModal = () => {
      modal.classList.remove('show-modal');
      document.body.classList.remove('modal-open');
    };

    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show-modal')) {
        closeModal();
      }
    });
  };

  const initGlobalFeatures = () => {
    setupScrollReveal();
    setupCursorGlow();
    setupEmailToast();
    setupAmbientToggle();
    setupScrollSpy();
    setupBackToTop();
    setup3DTilt();
    setupTypewriter();
    setupCVButton();
    setupProjectModal();
  };

  const hideLoaderImmediately = () => {
    loader.classList.add('hidden');
    loader.remove();
    document.body.classList.add('hero-animated');
    initGlobalFeatures();
  };

  // If already shown in session and not a refresh, skip loader
  if (loaderShown && navigationType !== 'reload') {
    hideLoaderImmediately();
    return;
  }

  // Set up elements
  const progressEl = document.getElementById('loader-progress');
  const percentEl = document.getElementById('loader-percent');
  const titleEl = document.getElementById('loader-title');
  const copyEl = document.getElementById('loader-copy');
  const btnEl = document.getElementById('loader-btn');

  let progress = 0;
  let loadCompleted = false;

  // We simulate progress loading smoothly
  const simulateProgress = () => {
    if (progress >= 100) {
      onLoadFinished();
      return;
    }

    // Determine increment: slow down towards the end if load isn't complete
    let increment = Math.random() * 8 + 2;
    if (progress > 80 && !loadCompleted) {
      // Slow down to wait for the actual window load
      increment = Math.random() * 1.5 + 0.1;
    }

    progress = Math.min(progress + increment, 100);
    
    // Update DOM
    if (progressEl) progressEl.style.width = `${progress}%`;
    if (percentEl) percentEl.textContent = `${Math.floor(progress)}%`;

    if (progress < 100) {
      const delay = Math.random() * 80 + 40;
      setTimeout(simulateProgress, delay);
    } else {
      onLoadFinished();
    }
  };

  // When window finishes loading, let simulated progress know
  window.addEventListener('load', () => {
    loadCompleted = true;
  });

  // Backup timeout in case load event takes too long
  setTimeout(() => {
    loadCompleted = true;
  }, 4000);

  // Start progress simulation
  simulateProgress();

  let isEntering = false;
  const startEntranceAnimation = () => {
    if (isEntering) return;
    isEntering = true;

    // 1. Play switch-on effect (adds is-illuminating class)
    loader.classList.add('is-illuminating');
    sessionStorage.setItem('loaderShown', 'true');

    // 2. Fade out loader after the flash peak
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.add('hero-animated');
      initGlobalFeatures();
      
      // 3. Completely remove from DOM after CSS transition (0.8s) completes
      setTimeout(() => {
        loader.remove();
      }, 800);
    }, 500); // Wait 500ms for flash to take full effect
  };

  function onLoadFinished() {
    if (loader.classList.contains('is-ready')) return;
    
    loader.classList.add('is-ready');
    
    if (progressEl) {
      progressEl.style.width = '100%';
    }
    if (percentEl) percentEl.textContent = '100%';

    // Update titles
    if (titleEl) {
      titleEl.textContent = 'Halaman Siap Diterangi!';
      titleEl.classList.remove('text-amber-500');
      titleEl.classList.add('text-amber-400');
    }
    if (copyEl) {
      copyEl.textContent = 'Energi terkumpul. Klik tombol atau area mana saja untuk menyalakan lampu.';
    }

    // Show button with animation
    if (btnEl) {
      btnEl.classList.remove('hidden');
      // Trigger browser paint before adding opacity/transform classes to animate fade-in
      requestAnimationFrame(() => {
        setTimeout(() => {
          btnEl.classList.remove('opacity-0', 'translate-y-4', 'scale-95');
          btnEl.classList.add('opacity-100', 'translate-y-0', 'scale-100', 'btn-pulse-glow');
        }, 50);
      });
    }

    // Show hint with animation
    const hintEl = document.getElementById('loader-hint');
    if (hintEl) {
      hintEl.classList.remove('hidden');
      requestAnimationFrame(() => {
        setTimeout(() => {
          hintEl.classList.remove('opacity-0');
          hintEl.classList.add('opacity-100');
        }, 150);
      });
    }

    // Add click handler to entire loader screen for easy entrance
    loader.addEventListener('click', startEntranceAnimation);
  }

  // Handle Button Click specifically (stopping propagation to prevent redundant trigger)
  if (btnEl) {
    btnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      startEntranceAnimation();
    });
  }
});
