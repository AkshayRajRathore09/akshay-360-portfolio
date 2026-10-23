/**
 * Portfolio Scroll-Driven Canvas & Interactive Experience
 */

(function () {
  'use strict';

  // Configuration
  const TOTAL_FRAMES = 300;
  const FRAME_DIR = 'frames/'; // Junction linked to ezgif-1664e5e8707ad736-jpg
  const FALLBACK_DIR = 'ezgif-1664e5e8707ad736-jpg/';
  const EASE_FACTOR = 0.15; // Smooth interpolation speed

  // DOM Elements
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loader = document.getElementById('loader');
  const loaderProgressBar = document.getElementById('loader-progress-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const scrollWrapper = document.getElementById('scroll-wrapper');
  const sections = document.querySelectorAll('.scroll-section');

  // Modal Elements
  const modal = document.getElementById('video-modal');
  const modalClose = document.getElementById('modal-close');
  const modalIframe = document.getElementById('modal-iframe');
  const modalLoader = document.getElementById('modal-loader');
  const modalTitle = document.getElementById('modal-video-title');
  const modalDirectLink = document.getElementById('modal-direct-link');
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const backToTopBtn = document.getElementById('back-to-top');

  // State
  const images = [];
  let loadedCount = 0;
  let currentFrame = 0;
  let targetFrame = 0;
  let isLoaded = false;
  let isCanvasSized = false;
  let animationFrameId = null;

  // Format frame number with leading zeros (e.g., 001, 015, 299)
  function padZero(num, size = 3) {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  // Set canvas dimensions respecting Device Pixel Ratio
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    isCanvasSized = true;

    // Redraw current frame immediately after resize
    const frameIndex = Math.round(currentFrame);
    if (images[frameIndex] && images[frameIndex].complete && images[frameIndex].naturalWidth > 0) {
      renderFrame(images[frameIndex]);
    }
  }

  // Draw image in canvas with CSS "object-fit: cover" behavior
  function renderFrame(img) {
    if (!img || !img.naturalWidth) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const hRatio = canvasWidth / imgWidth;
    const vRatio = canvasHeight / imgHeight;
    const ratio = Math.max(hRatio, vRatio);

    const drawWidth = imgWidth * ratio;
    const drawHeight = imgHeight * ratio;
    const offsetX = (canvasWidth - drawWidth) / 2;
    const offsetY = (canvasHeight - drawHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Calculate target frame and active sections based on scroll position
  function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = (document.documentElement.scrollHeight || scrollWrapper.offsetHeight) - window.innerHeight;
    const scrollProgress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;

    // Target frame between 0 and TOTAL_FRAMES - 1
    targetFrame = scrollProgress * (TOTAL_FRAMES - 1);

    // Update active section visibility
    sections.forEach((section) => {
      const rangeAttr = section.getAttribute('data-range');
      if (!rangeAttr) return;

      const [start, end] = rangeAttr.split(',').map(Number);
      if (scrollProgress >= start && scrollProgress <= end) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });
  }

  // Smooth render loop using requestAnimationFrame and Lerp easing
  function renderLoop() {
    // Lerp towards targetFrame
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.001) {
      currentFrame += diff * EASE_FACTOR;
    } else {
      currentFrame = targetFrame;
    }

    const frameIndex = Math.min(Math.max(Math.round(currentFrame), 0), TOTAL_FRAMES - 1);
    const frameImg = images[frameIndex];

    if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
      renderFrame(frameImg);
    }

    animationFrameId = requestAnimationFrame(renderLoop);
  }

  // Preload all frames sequentially & report progress
  function preloadImages() {
    let completed = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const filename = `ezgif-frame-${padZero(i)}.jpg`;
      img.src = `${FRAME_DIR}${filename}`;

      img.onload = () => {
        completed++;
        onImageLoad(completed);
      };

      img.onerror = () => {
        // Fallback to explicit directory if junction isn't resolved in some environments
        img.src = `${FALLBACK_DIR}${filename}`;
        img.onload = () => {
          completed++;
          onImageLoad(completed);
        };
        img.onerror = () => {
          completed++;
          onImageLoad(completed);
        };
      };

      images.push(img);
    }
  }

  function onImageLoad(count) {
    loadedCount = count;
    const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
    
    if (loaderProgressBar) {
      loaderProgressBar.style.width = `${percent}%`;
    }
    if (loaderPercent) {
      loaderPercent.textContent = `${percent}%`;
    }

    // When the first 25 frames are loaded, render initial frame
    if (count === 25 && !isLoaded) {
      renderFrame(images[0]);
    }

    // All frames ready
    if (count >= TOTAL_FRAMES && !isLoaded) {
      isLoaded = true;
      setTimeout(dismissLoader, 250);
    }
  }

  function dismissLoader() {
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 800);
    }
    resizeCanvas();
    handleScroll();
  }

  // =========================================================================
  // Testimonial Modal & Lazy Loading
  // =========================================================================
  function setupTestimonials() {
    testimonialCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        const videoUrl = card.getAttribute('data-video-url');
        const rawLink = card.getAttribute('data-raw-link');
        const label = card.querySelector('.video-label')?.textContent || 'Client Testimonial';

        openModal(videoUrl, rawLink, label);
      });
    });

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  function openModal(videoUrl, rawLink, label) {
    if (!modal) return;

    modalTitle.textContent = label;
    modalDirectLink.href = rawLink || videoUrl;
    modalLoader.style.display = 'flex';
    modalIframe.src = videoUrl;

    modalIframe.onload = () => {
      modalLoader.style.display = 'none';
    };

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    // Clear iframe source to stop playback immediately
    modalIframe.src = '';
    document.body.style.overflow = '';
  }

  // =========================================================================
  // Consultation Modal & Booking Handlers (Functional)
  // =========================================================================
  const consultationModal = document.getElementById('consultation-modal');
  const consultationClose = document.getElementById('consultation-modal-close');
  const openConsultationBtns = document.querySelectorAll('.open-consultation-btn');
  const submitWhatsappBtn = document.getElementById('submit-whatsapp-btn');
  const submitEmailBtn = document.getElementById('submit-email-btn');

  function openConsultationModal() {
    if (!consultationModal) return;
    consultationModal.classList.add('open');
    consultationModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const nameInput = document.getElementById('client-name');
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
  }

  function closeConsultationModal() {
    if (!consultationModal) return;
    consultationModal.classList.remove('open');
    consultationModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function setupConsultation() {
    openConsultationBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openConsultationModal();
      });
    });

    if (consultationClose) {
      consultationClose.addEventListener('click', closeConsultationModal);
    }

    if (consultationModal) {
      consultationModal.addEventListener('click', (e) => {
        if (e.target === consultationModal) {
          closeConsultationModal();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modal && modal.classList.contains('open')) closeModal();
        if (consultationModal && consultationModal.classList.contains('open')) closeConsultationModal();
      }
    });

    // Submit via WhatsApp
    if (submitWhatsappBtn) {
      submitWhatsappBtn.addEventListener('click', () => {
        const name = document.getElementById('client-name')?.value.trim() || '';
        const phone = document.getElementById('client-phone')?.value.trim() || '';
        const email = document.getElementById('client-email')?.value.trim() || '';
        const projectType = document.getElementById('project-type')?.value || '';
        const prefDate = document.getElementById('preferred-date')?.value || '';
        const notes = document.getElementById('project-notes')?.value.trim() || '';

        if (!name || !phone) {
          alert('Please provide your name and phone number so Akshay can connect with you.');
          return;
        }

        const messageLines = [
          'Hello Akshay,',
          'I would like to book a 360° Virtual Tour consultation.',
          '',
          `*Name:* ${name}`,
          `*Phone/WhatsApp:* ${phone}`,
          email ? `*Email:* ${email}` : '',
          `*Space Type:* ${projectType}`,
          prefDate ? `*Preferred Date:* ${prefDate}` : '',
          notes ? `*Project Details:* ${notes}` : ''
        ].filter(Boolean).join('\n');

        const waUrl = `https://wa.me/918306364937?text=${encodeURIComponent(messageLines)}`;
        window.open(waUrl, '_blank');
        closeConsultationModal();
      });
    }

    // Submit via Email
    if (submitEmailBtn) {
      submitEmailBtn.addEventListener('click', () => {
        const name = document.getElementById('client-name')?.value.trim() || '';
        const phone = document.getElementById('client-phone')?.value.trim() || '';
        const email = document.getElementById('client-email')?.value.trim() || '';
        const projectType = document.getElementById('project-type')?.value || '';
        const prefDate = document.getElementById('preferred-date')?.value || '';
        const notes = document.getElementById('project-notes')?.value.trim() || '';

        if (!name || !phone) {
          alert('Please provide your name and phone number so Akshay can connect with you.');
          return;
        }

        const subject = `Consultation Request: ${name} - 360° Virtual Tour`;
        const bodyLines = [
          'Hi Akshay,',
          '',
          'I would like to book a 360° Virtual Tour consultation.',
          '',
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Email: ${email || 'N/A'}`,
          `Space Type: ${projectType}`,
          `Preferred Date: ${prefDate || 'N/A'}`,
          `Project Notes: ${notes || 'N/A'}`,
          '',
          'Looking forward to connecting with you.'
        ].join('\n');

        const mailtoUrl = `mailto:akshayrajsinghrathore52@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines)}`;
        window.location.href = mailtoUrl;
        closeConsultationModal();
      });
    }
  }

  // Back to Top button
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Smooth navigation links to specific scroll ratios
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl && targetEl.getAttribute('data-range')) {
        e.preventDefault();
        const [start] = targetEl.getAttribute('data-range').split(',').map(Number);
        const maxScroll = (document.documentElement.scrollHeight || scrollWrapper.offsetHeight) - window.innerHeight;
        const targetScroll = (start + 0.03) * maxScroll;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    });
  });

  // =========================================================================
  // Initialize
  // =========================================================================
  function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    setupTestimonials();
    setupConsultation();
    preloadImages();
    animationFrameId = requestAnimationFrame(renderLoop);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
