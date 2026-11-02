/**
 * MEDAD Institutional Effectiveness Platform (IEP)
 * Frontend Interactions Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Interactive 8-Module Tabs
  const tabBtns = document.querySelectorAll('.module-tab-btn');
  const tabPanels = document.querySelectorAll('.module-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      if (!targetId) return;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // 2. Demo Modal Open & Close
  const modal = document.getElementById('demoModal');
  const openBtns = document.querySelectorAll('[data-open-demo]');
  const closeBtns = document.querySelectorAll('[data-close-demo]');

  const openModal = () => {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      modal.querySelector('input')?.focus();
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  openBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  }));

  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeModal();
    }
  });

  // 3. Demo Form Submission
  const form = document.getElementById('demoForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const isArabic = document.documentElement.lang === 'ar';

    if (submitBtn) {
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = isArabic ? 'جاري الإرسال...' : 'Submitting...';

      setTimeout(() => {
        submitBtn.innerHTML = isArabic ? '✓ تم إرسال طلبكم بنجاح' : '✓ Request Sent Successfully!';
        submitBtn.style.background = '#2E7D32';

        setTimeout(() => {
          closeModal();
          form.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
        }, 1600);
      }, 800);
    }
  });

  // 4. Footer Current Year
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // 5. Dynamic Hero Nav Bar (Smooth Sliding White Pill + Sticky on Scroll)
  const heroHeader = document.querySelector('.hero-header');
  const heroPillNav = document.querySelector('.hero-pill-nav');
  const indicator = document.querySelector('.hero-pill-indicator');
  const heroPillLinks = document.querySelectorAll('.hero-pill-link');

  // Track user click to prevent scroll-spy fighting the click animation
  let isClickScrolling = false;
  let clickScrollTimer = null;

  // Function to move the sliding white pill behind the target link
  const updatePillIndicator = (targetLink) => {
    if (!targetLink || !indicator || !heroPillNav) return;

    // Use offsetLeft & offsetWidth so it stays perfectly aligned regardless of scroll/zoom
    const leftOffset = targetLink.offsetLeft;
    const width = targetLink.offsetWidth;

    indicator.style.opacity = '1';
    indicator.style.width = `${width}px`;
    indicator.style.transform = `translate3d(${leftOffset}px, 0, 0)`;

    heroPillLinks.forEach(l => l.classList.remove('active'));
    targetLink.classList.add('active');
  };

  // Initialize indicator position on active link
  const initialActiveLink = document.querySelector('.hero-pill-link.active') || heroPillLinks[0];
  if (initialActiveLink) {
    // Initial placement after layout paints
    setTimeout(() => updatePillIndicator(initialActiveLink), 80);
    window.addEventListener('load', () => updatePillIndicator(initialActiveLink));
  }

  // Handle clicking tabs: smooth direct transition to clicked link without intermediate glitching
  heroPillLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetSection = document.querySelector(href);
        if (targetSection) {
          e.preventDefault();

          // Immediately update pill to target
          updatePillIndicator(link);

          // Lock scroll-spy from jumping to intermediate sections while scrolling
          isClickScrolling = true;
          clearTimeout(clickScrollTimer);

          const headerOffset = 80;
          const targetTop = targetSection.getBoundingClientRect().top + window.scrollY - headerOffset;

          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          });

          // Release lock after smooth scroll settles
          clickScrollTimer = setTimeout(() => {
            isClickScrolling = false;
            updatePillIndicator(link);
          }, 800);
        }
      } else {
        updatePillIndicator(link);
      }
    });
  });

  // Window resize: re-align sliding indicator to current active link
  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.hero-pill-link.active');
    if (currentActive) updatePillIndicator(currentActive);
  });

  // Sticky navbar & scroll-spy on section change
  const sections = Array.from(heroPillLinks)
    .map(link => {
      const href = link.getAttribute('href');
      return href && href.startsWith('#') ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  // Smooth scroll-spy using requestAnimationFrame and viewport-accurate getBoundingClientRect
  let isScrollTicking = false;
  const updateScrollSpy = () => {
    // 1. Sticky Nav toggle when scrolling past hero header
    if (heroHeader) {
      if (window.scrollY > 90) {
        heroHeader.classList.add('is-sticky');
      } else {
        heroHeader.classList.remove('is-sticky');
      }
    }

    // 2. Scroll-spy update (only when user is manually scrolling, not clicking)
    if (!isClickScrolling && sections.length > 0) {
      const navThreshold = 220;
      let currentSectionId = '';

      // Check bottom of page first so last item stays highlighted at the end
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 70);
      if (isAtBottom) {
        currentSectionId = sections[sections.length - 1].getAttribute('id');
      } else {
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          const rect = section.getBoundingClientRect();
          // If top of section has crossed threshold and bottom is still visible
          if (rect.top <= navThreshold && rect.bottom > 80) {
            currentSectionId = section.getAttribute('id');
            break;
          }
        }

        // If scrolled past all sections (e.g. into footer / cta), highlight last section
        if (!currentSectionId && sections.length > 0) {
          const lastSection = sections[sections.length - 1];
          if (lastSection.getBoundingClientRect().top <= navThreshold) {
            currentSectionId = lastSection.getAttribute('id');
          }
        }

        // Fallback to first section if at the very top of page
        if (!currentSectionId && window.scrollY < 200 && sections[0]) {
          currentSectionId = sections[0].getAttribute('id');
        }
      }

      if (currentSectionId) {
        const matchingLink = Array.from(heroPillLinks).find(
          link => link.getAttribute('href') === `#${currentSectionId}`
        );
        if (matchingLink && !matchingLink.classList.contains('active')) {
          updatePillIndicator(matchingLink);
        }
      }
    }
  };

  window.addEventListener('scroll', () => {
    if (!isScrollTicking) {
      window.requestAnimationFrame(() => {
        updateScrollSpy();
        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  }, { passive: true });

  // Initial update after DOM settling
  setTimeout(updateScrollSpy, 150);

  // 6. Interactive Medad Logo Burst Circle Hub (Platform Features Showcase)
  const burstNodes = document.querySelectorAll('.medad-node');
  const burstRays = document.querySelectorAll('.medad-ray');
  const showcaseStage = document.getElementById('medadShowcaseStage');
  const detailCard = document.getElementById('medadDetailCard');
  const detailIcon = document.getElementById('detailIcon');
  const detailTag = document.getElementById('detailTag');
  const detailCategory = document.getElementById('detailCategory');
  const detailTitle = document.getElementById('detailTitle');
  const detailDesc = document.getElementById('detailDesc');
  const detailCapsList = document.getElementById('detailCapsList');
  const detailMetricsGrid = document.getElementById('detailMetricsGrid');
  const detailExploreBtn = document.getElementById('detailExploreBtn');
  const detailCloseBtn = document.getElementById('detailCloseBtn');
  const detailPrevBtn = document.getElementById('detailPrevBtn');
  const detailNextBtn = document.getElementById('detailNextBtn');
  const detailNavDots = document.getElementById('detailNavDots');

  const isPageRtl = document.documentElement.dir === 'rtl' || document.body.classList.contains('rtl') || document.documentElement.lang === 'ar';

  const featureDetailsAr = [
    {
      index: 0,
      tag: 'النظام 01',
      category: 'التخطيط الاستراتيجي والحوكمة المؤسسية',
      title: 'التخطيط الاستراتيجي وإعداد الميزانيات',
      desc: 'مواءمة رؤية الجامعة وأهدافها متعددة السنوات مع مبادرات الأقسام القابلة للقياس، والمشاريع التشغيلية، والميزانيات، وتتبع آلي لتحقيق المستهدفات.',
      capabilities: [
        'التحليل المؤسسي وصياغة التوجه الاستراتيجي وخارطة الطريق',
        'صياغة الاستراتيجية وخطط العمل وإدارة المشاريع التعاونية',
        'مراجعة مؤشرات الأداء (KPIs) في الوقت الفعلي وتنبيهات انحراف الأداء الآلية',
        'ربط الميزانية التشغيلية متعددة السنوات وتتبع الموارد'
      ],
      metrics: [
        { value: '94%', label: 'مستهدفات محققة' },
        { value: '18/20', label: 'مشاريع وفق الجدول' },
        { value: 'رؤية 2030', label: 'مواءمة برنامج تنمية القدرات' }
      ],
      tabId: 'tab-strategic',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><polyline points="6 12 10 8 14 11 18 7"></polyline></svg>'
    },
    {
      index: 1,
      tag: 'النظام 02',
      category: 'الجودة الأكاديمية والتقويم',
      title: 'التعليم والتقويم المبني على المخرجات',
      desc: 'الربط المباشر بين تقديم المناهج وكفاءات الطلاب. أتمتة جمع تقييمات المقررات وحساب نواتج التعلم ومصفوفات القياس عبر كافة البرامج الأكاديمية.',
      capabilities: [
        'إدارة دورة حياة مخرجات التعلم على مستوى المقرر والبرنامج (CLO / PLO)',
        'مصفوفة مواءمة المناهج التفاعلية مع مستويات تصنيف بلوم',
        'حساب تلقائي لمعدلات تحقق مخرجات التعلم المباشرة وغير المباشرة',
        'توصيات التحسين المستمر المدمجة وسجل التدقيق الأكاديمي'
      ],
      metrics: [
        { value: '88.5%', label: 'تحقق مخرجات التعلم' },
        { value: '1,240+', label: 'شعبة دراسية مقيمة' },
        { value: '100%', label: 'أتمتة سلالم التقييم' }
      ],
      tabId: 'tab-outcomes',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="9" x2="14" y2="9"></line><line x1="8" y1="13" x2="12" y2="13"></line></svg>'
    },
    {
      index: 2,
      tag: 'النظام 03',
      category: 'الاعتماد الأكاديمي والامتثال',
      title: 'إدارة الاعتماد ومراجعة البرامج',
      desc: 'الاستغناء الكامل عن الملفات الورقية. تنظيم معايير الاعتماد، التجميع الآلي للشواهد والأدلة، وتقارير الدراسة الذاتية للهيئات الوطنية والدولية.',
      capabilities: [
        'امتثال مركزي للهيئات الوطنية (NCAAA / هيئة تقويم التعليم) والدولية (ABET, AACSB)',
        'معايير الاعتماد المؤسسي والبرامجي محملة ومحدثة مسبقاً',
        'مستودع رقمي شامل للأدلة والشواهد مع إدارة الإصدارات وتعليقات المراجعين',
        'قوائم تدقيق الجاهزية للزيارات الميدانية ومحاكاة تقارير التدقيق الخارجي'
      ],
      metrics: [
        { value: '100%', label: 'معايير مستوفاة' },
        { value: '1,480+', label: 'وثيقة وشاهد معتمد' },
        { value: '10x', label: 'تسريع جاهزية التدقيق' }
      ],
      tabId: 'tab-accreditation',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"></rect><path d="M12 17v4"></path><circle cx="12" cy="10" r="3"></circle><line x1="6" y1="8" x2="8" y2="8"></line><line x1="6" y1="12" x2="8" y2="12"></line></svg>'
    },
    {
      index: 3,
      tag: 'النظام 04',
      category: 'نجاح الطلاب وشبكة الخريجين',
      title: 'أنظمة الطلاب والخريجين',
      desc: 'تتبع المسارات المهنية للخريجين، والتوظيف، وحلقات التغذية الراجعة من أرباب العمل لتعزيز البرامج الأكاديمية وجاهزية الخريجين لسوق العمل باستمرار.',
      capabilities: [
        'تتبع المسار المهني للخريجين وتحليلات توظيف الكوادر الوطنية',
        'استبانات رضا أرباب العمل ورصد الفجوة في المهارات المطلوبة',
        'السجلات المهارية اللاصفية والتعلم التجريبي وملفات إنجاز الطلاب الرقمية',
        'تقارير طولية لمخرجات الخريجين ومنصة شبكة الخريجين التفاعلية'
      ],
      metrics: [
        { value: '91%', label: 'نسبة تتبع التوظيف' },
        { value: '450+', label: 'شبكة أرباب العمل' },
        { value: 'فوري', label: 'مواءمة سوق العمل' }
      ],
      tabId: 'tab-research',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>'
    },
    {
      index: 4,
      tag: 'النظام 05',
      category: 'المجالس الجامعية والحوكمة',
      title: 'إدارة الاجتماعات والوثائق',
      desc: 'تنظيم الحوكمة المؤسسية لمجالس الجامعة، ومجالس الكليات، واللجان الأكاديمية عبر جداول أعمال منظمة، ومحاضر رقمية، وتتبع دقيق للقرارات.',
      capabilities: [
        'إدارة اجتماعات بلا ورق: إعداد جداول الأعمال، ملفات القراءة المسبقة، واحتساب النصاب',
        'اعتماد المحاضر رقمياً، التصويت الإلكتروني، وتوثيق القرارات الرسمية',
        'متابعة تنفيذ التوصيات مع التعيين الآلي للمهام وتنبيهات الاستحقاق',
        'صلاحيات سرية متقدمة وأرشيف مؤسسي مشفر للاجتماعات والقرارات'
      ],
      metrics: [
        { value: '100%', label: 'إجراءات غير ورقية' },
        { value: '65%', label: 'توفير وقت التحضير' },
        { value: 'صفر', label: 'قرارات مفقودة' }
      ],
      tabId: 'tab-councils',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>'
    },
    {
      index: 5,
      tag: 'النظام 06',
      category: 'آراء المستفيدين والتحليلات',
      title: 'تقييم جودة المقررات وإدارة الاستبانات',
      desc: 'جمع آراء كافة الأطراف المعنية باستمرار. توزيع تقييمات المقررات الطلابية، ورضا أعضاء هيئة التدريس، واستبانات سوق العمل تلقائياً.',
      capabilities: [
        'توزيع مؤتمت لتقييمات المقررات متكامل بعمق مع نظام معلومات الطلاب ونظام إدارة التعلم',
        'منشئ استبانات مخصص لكافة المستفيدين (طلاب، هيئة تدريس، موظفين، خريجين، جهات توظيف)',
        'مراقبة فورية لمعدلات الاستجابة، تذكيرات آلية، ومؤشرات تحليل المشاعر',
        'لوحات قيادية تنفيذية سرية مع خطوط اتجاهات الرضا والتقييم عبر الفصول'
      ],
      metrics: [
        { value: '87%', label: 'متوسط الاستجابة' },
        { value: 'فوري', label: 'رصد مؤشرات الرضا' },
        { value: '100%', label: 'دورة استبانات آلية' }
      ],
      tabId: 'tab-surveys',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><path d="M7 10l3 3 7-7"></path></svg>'
    },
    {
      index: 6,
      tag: 'النظام 07',
      category: 'ملفات هيئة التدريس والبرامج',
      title: 'إدارة أعضاء هيئة التدريس والمناهج',
      desc: 'إدارة ملفات أعضاء هيئة التدريس، المؤهلات الأكاديمية، العبء التدريسي، ومسارات مراجعة وتحديث المناهج التعاونية في منصة مركزية واحدة.',
      capabilities: [
        'ملفات شاملة لمؤهلات هيئة التدريس، الإنتاج البحثي، وحقائب الترقية الأكاديمية',
        'توزيع العبء التدريسي وفحص الامتثال لمعايير مؤهلات جهات الاعتماد',
        'مسار عمل متعدد المستويات لتحديث الخطط والمناهج من القسم إلى مجلس الجامعة',
        'إدارة نسخ توصيفات المقررات مع المزامنة المباشرة لمصفوفات مخرجات التعلم'
      ],
      metrics: [
        { value: '100%', label: 'تحقق من المؤهلات' },
        { value: '4 مراحل', label: 'اعتماد مجالس الجامعات' },
        { value: 'موحد', label: 'المصدر المعتمد للبيانات' }
      ],
      tabId: 'tab-program',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
    }
  ];

  const featureDetailsEn = [
    {
      index: 0,
      tag: 'Module 01',
      category: 'Institutional Strategy & Governance',
      title: 'Strategic Planning & Budgeting',
      desc: 'Align institutional vision and multi-year goals with quantifiable departmental initiatives, operational projects, budgets, and automated milestone tracking.',
      capabilities: [
        'Institutional environmental analysis & directional strategic roadmaps',
        'Strategy formulation, action plans, and collaborative project management',
        'Real-time KPI milestone review and automated performance variance alerts',
        'Multi-year operational budget linkage and resource tracking'
      ],
      metrics: [
        { value: '94%', label: 'Milestones Met' },
        { value: '18/20', label: 'Projects on Schedule' },
        { value: 'Vision 2030', label: 'HCDP Aligned' }
      ],
      tabId: 'tab-strategic',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><polyline points="6 12 10 8 14 11 18 7"></polyline></svg>'
    },
    {
      index: 1,
      tag: 'Module 02',
      category: 'Academic Quality & Assessment',
      title: 'Outcomes-Based Education & Assessment',
      desc: 'Directly bridge curriculum delivery with student competencies. Automate course assessment collection, rubrics scoring, and attainment calculations across all programs.',
      capabilities: [
        'Course and program learning outcomes (CLO / PLO) lifecycle management',
        'Interactive curriculum mapping matrix with Bloom’s taxonomy levels',
        'Automated calculation of direct & indirect student outcome attainment',
        'Integrated continuous improvement recommendations and audit trail'
      ],
      metrics: [
        { value: '88.5%', label: 'CLO Attainment' },
        { value: '1,240+', label: 'Course Sections' },
        { value: '100%', label: 'Rubric Automated' }
      ],
      tabId: 'tab-outcomes',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="9" x2="14" y2="9"></line><line x1="8" y1="13" x2="12" y2="13"></line></svg>'
    },
    {
      index: 2,
      tag: 'Module 03',
      category: 'Accreditation & Compliance',
      title: 'Accreditation Management & Program Review',
      desc: 'Eliminate manual paper binders. Organize standard criteria, automated evidence compilation, and self-study reports for regional (NCAAA/ETEC) and global bodies.',
      capabilities: [
        'Centralized compliance for national (NCAAA) & international bodies (ABET, AACSB)',
        'Preloaded institutional and programmatic accreditation standards',
        'End-to-end evidence digital repository with versioning and reviewer comments',
        'External peer review readiness checklists and mock audit reporting'
      ],
      metrics: [
        { value: '100%', label: 'Standards Cleared' },
        { value: '1,480+', label: 'Verified Evidences' },
        { value: '10x', label: 'Faster Audit Prep' }
      ],
      tabId: 'tab-accreditation',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"></rect><path d="M12 17v4"></path><circle cx="12" cy="10" r="3"></circle><line x1="6" y1="8" x2="8" y2="8"></line><line x1="6" y1="12" x2="8" y2="12"></line></svg>'
    },
    {
      index: 3,
      tag: 'Module 04',
      category: 'Student Success & Lifelong Alumni',
      title: 'Student & Alumni Solutions',
      desc: 'Track graduate destinations, career placement, and employer feedback loops to continuously strengthen academic offerings and career readiness.',
      capabilities: [
        'Alumni career destination tracking and graduate employability analytics',
        'Employer satisfaction surveys and industry skills gap identification',
        'Co-curricular transcripts, experiential learning, and student e-portfolios',
        'Longitudinal graduate outcome reporting and alumni networking hub'
      ],
      metrics: [
        { value: '91%', label: 'Career Tracking Rate' },
        { value: '450+', label: 'Employer Network' },
        { value: 'Real-time', label: 'Market Alignment' }
      ],
      tabId: 'tab-research',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>'
    },
    {
      index: 4,
      tag: 'Module 05',
      category: 'University Councils & Governance',
      title: 'Document & Meeting Management',
      desc: 'Streamline governance across University Councils, College Boards, and Academic Committees with structured agendas, minutes, and decision tracking.',
      capabilities: [
        'Paperless council workflow: agenda assembly, pre-reading packs, and quorum',
        'Digital minutes approval, electronic voting, and formal council resolution logging',
        'Decision execution tracking with automated task assignments and reminders',
        'Role-based confidentiality and encrypted institutional meeting archive'
      ],
      metrics: [
        { value: '100%', label: 'Paperless Workflow' },
        { value: '65%', label: 'Less Prep Time' },
        { value: 'Zero', label: 'Lost Resolutions' }
      ],
      tabId: 'tab-councils',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>'
    },
    {
      index: 5,
      tag: 'Module 06',
      category: 'Stakeholder Feedback & Intelligence',
      title: 'Course Evaluation & Survey Management',
      desc: 'Capture continuous voice-of-stakeholder data. Distribute student course evaluations, faculty satisfaction, and employer surveys automatically.',
      capabilities: [
        'Automated course evaluation distribution deeply synced with SIS & LMS',
        'Multi-stakeholder survey builder (students, faculty, staff, alumni, employers)',
        'Real-time response rate monitoring, automated reminders, and sentiment flags',
        'Confidential executive dashboards with longitudinal satisfaction trend lines'
      ],
      metrics: [
        { value: '87%', label: 'Avg Response Rate' },
        { value: 'Instant', label: 'Sentiment Flags' },
        { value: '100%', label: 'Automated Cycle' }
      ],
      tabId: 'tab-surveys',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><path d="M7 10l3 3 7-7"></path></svg>'
    },
    {
      index: 6,
      tag: 'Module 07',
      category: 'Faculty Dossiers & Programs',
      title: 'Faculty & Curriculum Management',
      desc: 'Manage faculty portfolios, academic qualifications, teaching loads, and collaborative curriculum revision workflows in one centralized hub.',
      capabilities: [
        'Comprehensive faculty credentials, scholarly publication dossiers, and promotion files',
        'Teaching load distribution and accreditation qualification compliance checks',
        'Multi-tier curriculum change workflow from department board to senate approval',
        'Syllabus version control with direct learning outcome mapping synchronization'
      ],
      metrics: [
        { value: '100%', label: 'Credential Verify' },
        { value: '4-Stage', label: 'Senate Workflow' },
        { value: 'Single', label: 'Source of Truth' }
      ],
      tabId: 'tab-program',
      iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
    }
  ];

  const featureDetails = isPageRtl ? featureDetailsAr : featureDetailsEn;

  let currentActiveIndex = -1;

  // 7. Interactive Medad Vector Full-Circle Emblem Manipulation (All 32 Vector Rods)
  const circleDisc = document.getElementById('medadCircleDisc');
  const vecRods = document.querySelectorAll('.medad-vec-rod');

  // Map each of the 7 satellite options to its central peak rod index (Uniform 51.43° spacing)
  const optionPeakRods = [
    24, // Option 0: Strategic Planning (-90deg / 270deg) -> Rod 24 (270deg)
    29, // Option 1: Outcomes-Based Education (-38.57deg / 321deg) -> Rod 29 (326deg)
     1, // Option 2: Accreditation Management (12.86deg) -> Rod 1 (11deg)
     6, // Option 3: Student & Alumni Solutions (64.29deg) -> Rod 6 (67.5deg)
    10, // Option 4: Document & Meeting Management (115.71deg) -> Rod 10 (112.5deg)
    15, // Option 5: Course Evaluation (167.14deg) -> Rod 15 (168.75deg)
    19  // Option 6: Faculty & Curriculum (218.57deg) -> Rod 19 (213.75deg)
  ];

  const rodMap = {};
  vecRods.forEach(r => {
    const i = parseInt(r.getAttribute('data-rod'), 10);
    rodMap[i] = r;
  });

  // Replicate exact stepped burst: center rod pops out most, neighbors stepped
  const triggerSteppedPop = (centerIdx) => {
    vecRods.forEach(r => {
      r.classList.remove('pop-peak', 'pop-mid', 'pop-low');
    });

    if (centerIdx === null || centerIdx === undefined || isNaN(centerIdx)) return;

    const peak = (centerIdx + 32) % 32;
    const mid1 = (centerIdx - 1 + 32) % 32;
    const mid2 = (centerIdx + 1) % 32;
    const low1 = (centerIdx - 2 + 32) % 32;
    const low2 = (centerIdx + 2) % 32;

    if (rodMap[peak]) rodMap[peak].classList.add('pop-peak');
    if (rodMap[mid1]) rodMap[mid1].classList.add('pop-mid');
    if (rodMap[mid2]) rodMap[mid2].classList.add('pop-mid');
    if (rodMap[low1]) rodMap[low1].classList.add('pop-low');
    if (rodMap[low2]) rodMap[low2].classList.add('pop-low');
  };

  const clearPop = () => {
    vecRods.forEach(r => {
      r.classList.remove('pop-peak', 'pop-mid', 'pop-low');
    });
  };

  // Build navigation dots
  if (detailNavDots) {
    detailNavDots.innerHTML = '';
    featureDetails.forEach((feat, idx) => {
      const dot = document.createElement('button');
      dot.className = 'detail-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to ${feat.title}`);
      dot.addEventListener('click', () => {
        openFeature(idx);
      });
      detailNavDots.appendChild(dot);
    });
  }

  const renderDetailCard = (index) => {
    const data = featureDetails[index];
    if (!data) return;

    if (detailIcon) detailIcon.innerHTML = data.iconSvg;
    if (detailTag) detailTag.textContent = data.tag;
    if (detailCategory) detailCategory.textContent = data.category;
    if (detailTitle) detailTitle.textContent = data.title;
    if (detailDesc) detailDesc.textContent = data.desc;

    if (detailCapsList) {
      detailCapsList.innerHTML = data.capabilities.map(cap => `
        <li>
          <svg class="detail-cap-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${cap}</span>
        </li>
      `).join('');
    }

    if (detailMetricsGrid) {
      detailMetricsGrid.innerHTML = data.metrics.map(m => `
        <div class="detail-metric-card">
          <div class="detail-metric-val">${m.value}</div>
          <div class="detail-metric-lbl">${m.label}</div>
        </div>
      `).join('');
    }

    if (detailExploreBtn) {
      detailExploreBtn.setAttribute('data-target-tab', data.tabId);
    }

    // Update active dot
    if (detailNavDots) {
      const dots = detailNavDots.querySelectorAll('.detail-dot');
      dots.forEach((d, i) => {
        if (i === index) d.classList.add('active');
        else d.classList.remove('active');
      });
    }

    // Fade in from the left animation for title, logo (icon), and description
    animateDetailFadeInLeft();
  };

  const animateDetailFadeInLeft = () => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Cancel any active animations on these elements immediately
    [detailIcon, detailTitle, detailDesc, detailCapsList].forEach(el => {
      if (el && el.getAnimations) {
        el.getAnimations().forEach(a => a.cancel());
      }
    });

    const isRtl = document.documentElement.dir === 'rtl' || document.body.classList.contains('rtl');
    const xDist = isRtl ? 35 : -35;
    const smoothEase = 'cubic-bezier(0.16, 1, 0.3, 1)';

    // 1. Logo (Icon): Fade in from the left
    if (detailIcon) {
      detailIcon.animate([
        { opacity: 0, transform: `translate3d(${xDist}px, 0, 0)` },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], {
        duration: 440,
        easing: smoothEase,
        fill: 'both'
      });
    }

    // 2. Title: Fade in from the left (micro-delay for natural fluid feel)
    if (detailTitle) {
      detailTitle.animate([
        { opacity: 0, transform: `translate3d(${xDist}px, 0, 0)` },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], {
        duration: 480,
        delay: 45,
        easing: smoothEase,
        fill: 'both'
      });
    }

    // 3. Description text: Fade in from the left
    if (detailDesc) {
      detailDesc.animate([
        { opacity: 0, transform: `translate3d(${Math.round(xDist * 0.75)}px, 0, 0)` },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], {
        duration: 500,
        delay: 85,
        easing: smoothEase,
        fill: 'both'
      });
    }

    // 4. Key Capabilities: Smooth entrance
    if (detailCapsList) {
      detailCapsList.animate([
        { opacity: 0, transform: `translate3d(${Math.round(xDist * 0.5)}px, 0, 0)` },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], {
        duration: 460,
        delay: 125,
        easing: smoothEase,
        fill: 'both'
      });
    }
  };

  const openFeature = (index) => {
    currentActiveIndex = index;

    // 1. Activate showcase stage layout (slides circle left, reveals right details)
    if (showcaseStage) {
      showcaseStage.classList.add('is-detailed');
    }

    // 2. Highlight active satellite node
    burstNodes.forEach((n, idx) => {
      if (idx === index) {
        n.classList.add('active');
        n.setAttribute('aria-pressed', 'true');
      } else {
        n.classList.remove('active');
        n.setAttribute('aria-pressed', 'false');
      }
    });

    // 3. Render rich details in the right-hand panel & trigger fade in from left animation
    renderDetailCard(index);

    // 4. Trigger stepped pop-out on vector rods centered at this feature's angle
    if (optionPeakRods && optionPeakRods[index] !== undefined) {
      triggerSteppedPop(optionPeakRods[index]);
    }
  };

  const closeFeature = () => {
    currentActiveIndex = -1;

    // Cancel any active animations immediately for instantaneous exit
    [detailIcon, detailTitle, detailDesc, detailCapsList].forEach(el => {
      if (el && el.getAnimations) {
        el.getAnimations().forEach(a => a.cancel());
      }
    });

    // 1. Remove detailed class to return circle to center
    if (showcaseStage) {
      showcaseStage.classList.remove('is-detailed');
    }

    // 2. Remove active state from satellite nodes
    burstNodes.forEach(n => {
      n.classList.remove('active');
      n.setAttribute('aria-pressed', 'false');
    });

    // 3. Clear pop on vector rods
    clearPop();
  };

  // Satellite node click interactions
  burstNodes.forEach((node, index) => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      openFeature(index);
    });

    // Hover over satellite feature options: stepped pop-out centered at that option's angle
    node.addEventListener('mouseenter', () => {
      const centerRod = optionPeakRods[index];
      triggerSteppedPop(centerRod);
    });

    node.addEventListener('mouseleave', () => {
      if (currentActiveIndex >= 0) {
        triggerSteppedPop(optionPeakRods[currentActiveIndex]);
      } else {
        clearPop();
      }
    });
  });

  // Direct hover on each individual vector rod: stepped pop-out centered on hovered rod
  vecRods.forEach((rod) => {
    rod.addEventListener('mouseenter', () => {
      const rodIdx = parseInt(rod.getAttribute('data-rod'), 10);
      triggerSteppedPop(rodIdx);
    });

    rod.addEventListener('mouseleave', () => {
      if (currentActiveIndex >= 0) {
        triggerSteppedPop(optionPeakRods[currentActiveIndex]);
      } else {
        clearPop();
      }
    });

    rod.addEventListener('click', (e) => {
      e.stopPropagation();
      const featureIdx = rod.getAttribute('data-feature');
      if (featureIdx !== null) {
        const idx = parseInt(featureIdx, 10);
        openFeature(idx);
      }
    });
  });

  // Close and navigation button events
  if (detailCloseBtn) {
    detailCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeFeature();
    });
  }

  if (detailPrevBtn) {
    detailPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const prevIdx = (currentActiveIndex - 1 + featureDetails.length) % featureDetails.length;
      openFeature(prevIdx);
    });
  }

  if (detailNextBtn) {
    detailNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIdx = (currentActiveIndex + 1) % featureDetails.length;
      openFeature(nextIdx);
    });
  }

  // Explore Module Specifications CTA: switches to the matching tab in Core Modules section
  if (detailExploreBtn) {
    detailExploreBtn.addEventListener('click', (e) => {
      const targetTab = detailExploreBtn.getAttribute('data-target-tab');
      if (targetTab) {
        const tabBtn = document.querySelector(`.module-tab-btn[data-tab="${targetTab}"]`);
        if (tabBtn) {
          tabBtn.click();
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     IEP In One Platform: Smooth Minimal Mouse Tilt
     -------------------------------------------------------------------------- */
  const iepArtStage = document.getElementById('iepArtStage');
  if (iepArtStage) {
    const artCard = iepArtStage.querySelector('.iep-art-card');
    const section = iepArtStage.closest('.iep-platform-section') || iepArtStage;

    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    let isHovering = false;
    let rafId = null;

    const animateTilt = () => {
      // Silky smooth dampening factor (0.075) for floaty response
      currentTiltX += (targetTiltX - currentTiltX) * 0.075;
      currentTiltY += (targetTiltY - currentTiltY) * 0.075;

      if (artCard) {
        artCard.style.transform = `perspective(900px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
      }

      if (isHovering || Math.abs(targetTiltX - currentTiltX) > 0.01 || Math.abs(targetTiltY - currentTiltY) > 0.01) {
        rafId = requestAnimationFrame(animateTilt);
      } else {
        if (artCard) artCard.style.transform = '';
        rafId = null;
      }
    };

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
      targetTiltX = -y * 6; // subtle max 6 deg tilt
      targetTiltY = x * 6;
      isHovering = true;
      if (!rafId) {
        rafId = requestAnimationFrame(animateTilt);
      }
    }, { passive: true });

    section.addEventListener('mouseleave', () => {
      targetTiltX = 0;
      targetTiltY = 0;
      isHovering = false;
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     IEP In One Platform: Subtle Tech Gradient Scroll Animation
     -------------------------------------------------------------------------- */
  const iepSection = document.getElementById('medad-iep') || document.getElementById('one-platform');
  const iepTechBg = document.getElementById('iepTechBg');
  if (iepSection && iepTechBg) {
    let ticking = false;
    const updateScrollGradient = () => {
      const rect = iepSection.getBoundingClientRect();
      const winH = window.innerHeight;
      if (rect.top < winH && rect.bottom > 0) {
        // Calculate progress from 0 (entering view) to 1 (leaving view)
        const progress = (winH - rect.top) / (winH + rect.height);
        // Small, subtle smooth scroll translation (-28px to +28px)
        const translateY = ((progress - 0.5) * 56).toFixed(1);
        iepTechBg.style.setProperty('--scroll-translate', `${translateY}px`);
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollGradient);
        ticking = true;
      }
    }, { passive: true });

    updateScrollGradient();
  }

  /* --------------------------------------------------------------------------
     Medad Continuous Flowing Wave Ribbon Mesh (Canvas-Powered, Zero Edges)
     Mathematical harmonic ribbons moving seamlessly across the section
     -------------------------------------------------------------------------- */
  const initMedadWavesCanvas = () => {
    const canvas = document.getElementById('medadWavesCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pillarsSection = document.getElementById('features') || document.getElementById('pillars');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;
    let lastTime = performance.now();
    let animFrameId = null;
    let isVisible = false;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 240);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (prefersReducedMotion) {
        render(0);
      }
    };

    const drawRibbon = (numLines, pathFn, spreadFn, alphaMin, alphaMax, curTime) => {
      const xStep = width < 768 ? 6 : 3;
      const startX = -60;
      const endX = width + 60;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < numLines; i++) {
        const u = (i / (numLines - 1)) - 0.5; // -0.5 to 0.5
        const normU = Math.abs(u * 2);        // 0 at center, 1 at edges
        const a = alphaMax - (alphaMax - alphaMin) * Math.pow(normU, 1.4);

        ctx.strokeStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();

        let first = true;
        for (let x = startX; x <= endX; x += xStep) {
          const baseY = pathFn(x, u, curTime, width, height);
          const spread = spreadFn(x, u, curTime, width, height);
          const y = baseY + u * spread;

          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    const render = (curTime) => {
      ctx.clearRect(0, 0, width, height);

      // Ribbon 1: Primary sweeping ribbon undulating through center
      drawRibbon(
        34,
        (x, u, t, W, H) => {
          const p = x / W;
          return (H * 0.48) +
            Math.sin(p * Math.PI * 1.8 - t * 0.42 + u * 0.4) * (H * 0.22) +
            Math.cos(p * Math.PI * 3.2 - t * 0.24 + u * 0.2) * (H * 0.07);
        },
        (x, u, t, W, H) => {
          const p = x / W;
          return (H * 0.25) * (0.55 + 0.45 * Math.sin(p * Math.PI * 2.2 - t * 0.22));
        },
        0.05,
        0.22,
        curTime
      );

      // Ribbon 2: Counter-sweeping ribbon crossing Ribbon 1 (creates moiré diamond mesh)
      drawRibbon(
        32,
        (x, u, t, W, H) => {
          const p = x / W;
          return (H * 0.52) -
            Math.sin(p * Math.PI * 1.6 - t * 0.36 - 0.4 + u * 0.5) * (H * 0.24) -
            Math.cos(p * Math.PI * 2.8 - t * 0.20 + u * 0.2) * (H * 0.08);
        },
        (x, u, t, W, H) => {
          const p = x / W;
          return (H * 0.23) * (0.55 + 0.45 * Math.cos(p * Math.PI * 2.0 - t * 0.18 - 0.3));
        },
        0.04,
        0.18,
        curTime
      );

      // Ribbon 3: Ambient atmospheric wave in lower-mid depth
      drawRibbon(
        22,
        (x, u, t, W, H) => {
          const p = x / W;
          return (H * 0.62) +
            Math.sin(p * Math.PI * 2.2 - t * 0.28 + 1.2 + u * 0.3) * (H * 0.12);
        },
        (x, u, t, W, H) => {
          const p = x / W;
          return (H * 0.15) * (0.6 + 0.4 * Math.sin(p * Math.PI * 1.5 - t * 0.15));
        },
        0.02,
        0.09,
        curTime
      );
    };

    const animateLoop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      time += dt;

      render(time);

      if (isVisible && !prefersReducedMotion) {
        animFrameId = requestAnimationFrame(animateLoop);
      } else {
        animFrameId = null;
      }
    };

    const startAnimation = () => {
      if (!animFrameId && !prefersReducedMotion) {
        lastTime = performance.now();
        animFrameId = requestAnimationFrame(animateLoop);
      }
    };

    const stopAnimation = () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    };

    // IntersectionObserver: Only render when section is visible
    if (pillarsSection && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            resize();
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      }, { rootMargin: '100px 0px' });
      observer.observe(pillarsSection);
    } else {
      isVisible = true;
      startAnimation();
    }

    window.addEventListener('resize', () => {
      resize();
      if (prefersReducedMotion || !isVisible) {
        render(time);
      }
    }, { passive: true });

    resize();
    render(0);
  };

  /* --------------------------------------------------------------------------
     Why MEDAD Section Dynamic Grey Wave Ribbons
     Same flowing ribbon-mesh style as the Pillars section wave, rendered in
     grey for the white background, with extra motion:
     - Ribbons twist in 3D (width breathes between narrow waists and wide fans)
     - Paths drift vertically and change amplitude over time
     - Per-line ripples so strands don't stay perfectly parallel
     -------------------------------------------------------------------------- */
  const initWhyWavesCanvas = () => {
    const canvas = document.getElementById('whyWavesCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const whySection = document.getElementById('why-medad');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;
    let lastTime = performance.now();
    let animFrameId = null;
    let isVisible = false;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 300);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (prefersReducedMotion) {
        render(0);
      }
    };

    // Ribbon definitions: each one sweeps across the section with its own rhythm
    const ribbons = [
      { lines: 34, yBase: 0.30, amp: 0.16, freq: 1.7, speed: 0.55, spread: 0.20, twistFreq: 2.4, twistSpeed: 0.45, phase: 0.0, aMin: 0.06, aMax: 0.34 },
      { lines: 30, yBase: 0.55, amp: 0.20, freq: 1.4, speed: -0.48, spread: 0.22, twistFreq: 2.0, twistSpeed: -0.38, phase: 1.9, aMin: 0.05, aMax: 0.30 },
      { lines: 26, yBase: 0.78, amp: 0.13, freq: 2.1, speed: 0.62, spread: 0.16, twistFreq: 2.8, twistSpeed: 0.52, phase: 3.4, aMin: 0.05, aMax: 0.26 },
      { lines: 20, yBase: 0.45, amp: 0.24, freq: 1.1, speed: -0.34, spread: 0.14, twistFreq: 1.6, twistSpeed: 0.30, phase: 5.1, aMin: 0.03, aMax: 0.18 }
    ];

    const drawRibbon = (r, t) => {
      const xStep = width < 768 ? 6 : 3;
      const startX = -60;
      const endX = width + 60;

      // Slow "breathing" of the whole ribbon (amplitude + vertical drift)
      const ampMod = 0.75 + 0.25 * Math.sin(t * 0.21 + r.phase);
      const drift = Math.sin(t * 0.13 + r.phase * 0.7) * height * 0.05;

      for (let i = 0; i < r.lines; i++) {
        const u = (i / (r.lines - 1)) - 0.5;   // -0.5 .. 0.5 across the ribbon
        const normU = Math.abs(u * 2);         // 0 center, 1 edge
        const a = r.aMax - (r.aMax - r.aMin) * Math.pow(normU, 1.3);

        ctx.strokeStyle = `rgba(255, 255, 255, ${(a * 0.45).toFixed(3)})`;
        ctx.lineWidth = normU < 0.35 ? 1.25 : 0.9;
        ctx.beginPath();

        let first = true;
        for (let x = startX; x <= endX; x += xStep) {
          const p = x / width;

          // Main path: layered sines travelling at different speeds
          const baseY = height * r.yBase + drift +
            Math.sin(p * Math.PI * r.freq - t * r.speed + r.phase) * (height * r.amp * ampMod) +
            Math.cos(p * Math.PI * r.freq * 1.9 + t * r.speed * 0.6 + r.phase * 1.3) * (height * r.amp * 0.32);

          // 3D twist: ribbon narrows into waists and flares into fans as it travels
          const twist = Math.cos(p * Math.PI * r.twistFreq - t * r.twistSpeed + r.phase);
          const spreadFactor = 0.3 + 0.7 * (0.5 + 0.5 * twist);
          const spread = height * r.spread * spreadFactor;

          // Small per-strand ripple so lines interweave instead of staying parallel
          const ripple = Math.sin(p * Math.PI * 6.0 - t * 1.1 + u * 3.2 + r.phase) * (height * 0.008) * (0.4 + normU);

          const y = baseY + u * spread + ripple;

          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    const render = (curTime) => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const list = width < 768 ? ribbons.slice(0, 3) : ribbons;
      for (const r of list) {
        drawRibbon(r, curTime);
      }
    };

    const animateLoop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      time += dt;

      render(time);

      if (isVisible && !prefersReducedMotion) {
        animFrameId = requestAnimationFrame(animateLoop);
      } else {
        animFrameId = null;
      }
    };

    const startAnimation = () => {
      if (!animFrameId && !prefersReducedMotion) {
        lastTime = performance.now();
        animFrameId = requestAnimationFrame(animateLoop);
      }
    };

    const stopAnimation = () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    };

    // IntersectionObserver: Only render when section is visible
    if (whySection && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            resize();
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      }, { rootMargin: '100px 0px' });
      observer.observe(whySection);
    } else {
      isVisible = true;
      startAnimation();
    }

    window.addEventListener('resize', () => {
      resize();
      if (prefersReducedMotion || !isVisible) {
        render(time);
      }
    }, { passive: true });

    resize();
    render(0);
  };

  /* ========================================================================
     MEDAD Consultancy Service Lottie Animation (Direct SVG Vector Rendering)
     ======================================================================== */
  const initConsultancyLottie = () => {
    const container = document.getElementById('consultancy-lottie');
    if (!container || typeof lottie === 'undefined') return;

    try {
      const animData = window.consultancyAnimationData || null;
      const isArabic = document.documentElement.lang === 'ar' || window.location.pathname.includes('/ar/');
      const animConfig = {
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true
      };

      if (animData) {
        animConfig.animationData = animData;
      } else {
        animConfig.path = (isArabic ? '../' : '') + 'assets/images/consultancy-animation.json';
      }

      const anim = lottie.loadAnimation(animConfig);

      // Performance optimization: Pause when out of viewport
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              anim.play();
            } else {
              anim.pause();
            }
          });
        }, { threshold: 0.05 });
        obs.observe(container);
      }
    } catch (err) {
      console.warn('Consultancy Lottie animation failed:', err);
    }
  };

  initMedadWavesCanvas();
  initWhyWavesCanvas();
  initConsultancyLottie();
});



