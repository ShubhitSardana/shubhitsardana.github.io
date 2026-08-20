(function () {
      // INSPIRE-HEP Author Configuration
      const AUTHOR_ID = '2825517';
      const AUTHOR_BAI = 'Shubhit.Sardana.1';
      const CACHE_KEY = `inspire_metrics_cache_${AUTHOR_ID}_v4`;
      const API_URL = `https://inspirehep.net/api/literature?q=a%3A${encodeURIComponent(AUTHOR_BAI)}&sort=mostrecent`;

      // Store fetched papers in memory for modal viewing
      let currentPapers = [];

      // Get current date string (YYYY-MM-DD) for midnight rollover detection
      function getTodayDateString() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      // Format author names: Highlight "Sardana, Shubhit" / "Sardana, S."
      function formatAuthors(authors) {
        if (!authors || !authors.length) return 'Shubhit Sardana';
        
        const myVariants = ['sardana, shubhit', 'sardana, s.', 'shubhit sardana', 's. sardana'];
        
        // If long collaboration list (e.g. > 7 authors), shorten
        if (authors.length > 7) {
          const firstThree = authors.slice(0, 3).map(a => {
            const name = a.full_name || '';
            const isMe = myVariants.some(v => name.toLowerCase().includes('sardana'));
            return isMe ? `<strong class="text-neutral-900 dark:text-neutral-100 font-semibold">${name}</strong>` : name;
          });
          
          const hasMeInRest = authors.slice(3).some(a => (a.full_name || '').toLowerCase().includes('sardana'));
          if (hasMeInRest) {
            return `${firstThree.join(', ')}, ... <strong class="text-neutral-900 dark:text-neutral-100 font-semibold">Sardana, S.</strong>, et al.`;
          }
          return `${firstThree.join(', ')}, et al.`;
        }

        return authors.map(a => {
          const name = a.full_name || '';
          const isMe = myVariants.some(v => name.toLowerCase().includes('sardana'));
          return isMe ? `<strong class="text-neutral-900 dark:text-neutral-100 font-semibold">${name}</strong>` : name;
        }).join(', ');
      }

      // Determine author role badge
      function getAuthorRoleBadge(authors) {
        if (!authors || !authors.length) return '';
        const first = (authors[0].full_name || '').toLowerCase();
        const second = authors.length > 1 ? (authors[1].full_name || '').toLowerCase() : '';

        if (first.includes('sardana')) {
          return `<span class="px-2 py-0.5 rounded font-medium bg-stone-100 text-stone-800 dark:bg-stone-800/80 dark:text-stone-200 border border-stone-200 dark:border-stone-700/60">1st Author</span>`;
        }
        if (second.includes('sardana')) {
          return `<span class="px-2 py-0.5 rounded font-medium bg-stone-100 text-stone-800 dark:bg-stone-800/80 dark:text-stone-200 border border-stone-200 dark:border-stone-700/60">2nd Author</span>`;
        }
        if (authors.length > 10) {
          return `<span class="px-2 py-0.5 rounded font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/60">InPTA / Collaboration</span>`;
        }
        return '';
      }

      // Determine journal / publication status badge
      function getStatusBadge(meta) {
        const pubInfo = meta.publication_info || [];
        const dois = meta.dois || [];
        
        let journalName = '';
        if (pubInfo.length > 0) {
          journalName = pubInfo[0].journal_title || pubInfo[0].pubinfo_freetext || '';
        }

        // Clean up common journal names
        if (journalName.includes('Nature Commun')) journalName = 'Nature Communications';
        else if (journalName.includes('Mon.Not.Roy.Astron.Soc') || journalName.includes('MNRAS')) journalName = 'MNRAS';
        else if (journalName.includes('Phys.Rev.A')) journalName = 'Physical Review A';
        else if (journalName.includes('JHEAp') || journalName.includes('JHEAP')) journalName = 'JHEAP';

        const isPublished = (pubInfo.length > 0 && journalName) || dois.length > 0;

        if (isPublished) {
          return `<span class="px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40">
            Published${journalName ? ' &middot; ' + journalName : ''}
          </span>`;
        } else {
          // Pre-print / Submitted
          const title = (meta.titles?.[0]?.title || '').toLowerCase();
          let submitTarget = 'Pre-print';
          if (title.includes('standard siren cosmology')) submitTarget = 'Submitted &middot; Nature Astronomy';
          else if (title.includes('stochastic gravitational wave background')) submitTarget = 'Submitted &middot; Physical Review D';

          return `<span class="px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40">
            ${submitTarget}
          </span>`;
        }
      }

      // Modal Controller Function
      window.openPaperModal = function (paperIndex) {
        const p = currentPapers[paperIndex];
        if (!p) return;

        const modal = document.getElementById('paper-modal');
        const titleEl = document.getElementById('modal-paper-title');
        const authorsEl = document.getElementById('modal-paper-authors');
        const abstractEl = document.getElementById('modal-paper-abstract');
        const badgesEl = document.getElementById('modal-badges');
        const citeCountEl = document.getElementById('modal-cite-count');
        const metaEl = document.getElementById('modal-paper-meta');
        const linksEl = document.getElementById('modal-paper-links');

        if (titleEl) titleEl.textContent = p.title;
        if (authorsEl) authorsEl.innerHTML = `${p.formattedAuthors}${p.year ? ` (${p.year})` : ''}`;
        if (abstractEl) abstractEl.textContent = p.abstract || 'No abstract record found for this publication on INSPIRE-HEP.';
        if (citeCountEl) citeCountEl.innerHTML = `Citations: <strong class="num-serif font-bold text-neutral-900 dark:text-neutral-100">${p.citations}</strong>`;

        if (badgesEl) {
          badgesEl.innerHTML = `${p.statusBadge} ${p.authorRoleBadge}`;
        }

        if (metaEl) {
          metaEl.innerHTML = `<span>INSPIRE RecID: <strong class="text-neutral-700 dark:text-neutral-300 font-mono">${p.inspireId}</strong></span>`;
        }

        if (linksEl) {
          let linksHtml = '';
          if (p.arxiv) {
            linksHtml += `<a href="https://arxiv.org/abs/${p.arxiv}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"><span>arXiv</span> &nearr;</a>`;
          }
          if (p.doi) {
            linksHtml += `<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"><span>DOI</span> &nearr;</a>`;
          }
          linksHtml += `<a href="https://inspirehep.net/literature/${p.inspireId}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"><span>INSPIRE Record</span> &nearr;</a>`;
          linksEl.innerHTML = linksHtml;
        }

        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
          document.body.style.overflow = 'hidden';
        }
      };

      window.closePaperModal = function () {
        const modal = document.getElementById('paper-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
          document.body.style.overflow = '';
        }
      };

      // Close modal button listener
      const closeBtn = document.getElementById('modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', window.closePaperModal);
      }

      // Close modal backdrop click listener
      const modalEl = document.getElementById('paper-modal');
      if (modalEl) {
        modalEl.addEventListener('click', function (e) {
          if (e.target === modalEl) {
            window.closePaperModal();
          }
        });
      }

      // Close on ESC key press
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          window.closePaperModal();
        }
      });

      // Render the entire publication list and metrics to DOM
      function renderData(data, sourceMsg) {
        currentPapers = data.papers || [];

        // 1. Update Metrics Cards in Hero
        const citEl = document.getElementById('metric-citations');
        const pubEl = document.getElementById('metric-published');
        const prepEl = document.getElementById('metric-preprints');

        if (citEl) {
          citEl.classList.remove('animate-pulse-subtle');
          citEl.textContent = data.totalCitations;
        }
        if (pubEl) {
          pubEl.classList.remove('animate-pulse-subtle');
          pubEl.textContent = data.publishedCount;
        }
        if (prepEl) {
          prepEl.classList.remove('animate-pulse-subtle');
          prepEl.textContent = data.preprintCount;
        }

        // 2. Status message & cache indicator
        const cacheStatus = document.getElementById('api-cache-status');
        if (cacheStatus) {
          cacheStatus.innerHTML = `Live synced with INSPIRE-HEP (<a href="https://inspirehep.net/authors/${AUTHOR_ID}" target="_blank" class="underline hover:text-neutral-800 dark:hover:text-neutral-200">ID: ${AUTHOR_ID}</a>) &middot; ${sourceMsg || 'Active'}`;
        }

        const pubStatusMsg = document.getElementById('pub-status-msg');
        if (pubStatusMsg) {
          const scrollNote = currentPapers.length > 4 
            ? ` &middot; <span class="text-amber-700 dark:text-amber-400 font-medium">Scrollable list (${currentPapers.length} papers)</span>` 
            : '';
          pubStatusMsg.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> <span>${currentPapers.length} publications auto-loaded from INSPIRE-HEP${scrollNote}</span>`;
        }

        // 3. Render Publications Cards
        const container = document.getElementById('publications-container');
        if (!container) return;

        // Apply scrollbar container if more than 4 papers
        if (currentPapers.length > 4) {
          container.className = 'space-y-4 max-h-[640px] overflow-y-auto pr-1.5 sm:pr-2.5 custom-scrollbar';
        } else {
          container.className = 'space-y-4';
        }

        if (!currentPapers || currentPapers.length === 0) {
          container.innerHTML = `<div class="p-8 text-center bg-white/60 dark:bg-[#1b1b19]/60 backdrop-blur-md border border-neutral-200/70 dark:border-neutral-800/70 rounded-xl text-neutral-500">No publication records found.</div>`;
          return;
        }

        let html = '';
        currentPapers.forEach((p, index) => {
          const year = p.year ? ` (${p.year})` : '';

          html += `
          <article onclick="window.openPaperModal(${index})"
                   class="pub-card cursor-pointer bg-white/60 dark:bg-[#1b1b19]/60 backdrop-blur-md border border-neutral-200/70 dark:border-neutral-800/70 rounded-xl p-5 sm:p-6 transition-all hover:border-amber-400/80 dark:hover:border-amber-500/70 hover:bg-white/80 dark:hover:bg-[#1b1b19]/80 hover:shadow-md shadow-xs group">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div class="space-y-2 flex-1 min-w-0">
                
                <!-- Badges Row -->
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  ${p.statusBadge}
                  ${p.authorRoleBadge}
                  <span class="px-2 py-0.5 rounded font-medium bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 text-[0.72rem]">
                    Citations: <strong class="num-serif font-bold text-neutral-900 dark:text-neutral-100">${p.citations}</strong>
                  </span>
                </div>

                <!-- Title (Clickable for Modal) -->
                <h3 class="font-medium text-neutral-950 dark:text-neutral-50 text-[1.03rem] leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors break-words">
                  ${p.title}
                </h3>

                <!-- Authors & Citation info -->
                <p class="text-sm text-neutral-600 dark:text-neutral-400 break-words">
                  ${p.formattedAuthors}${year}.${p.arxiv ? ` <span class="italic text-neutral-500 dark:text-neutral-400">arXiv:${p.arxiv}</span>` : ''}
                </p>

              </div>

              <!-- Action Links & Abstract Trigger -->
              <div class="shrink-0 flex items-center gap-2 pt-1 sm:pt-0 flex-wrap" onclick="event.stopPropagation()">
                <!-- Abstract Modal Button -->
                <button type="button" onclick="window.openPaperModal(${index})"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200/90 dark:border-amber-800/70 transition-colors shadow-2xs cursor-pointer" title="Read abstract in popup modal">
                  <svg class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
                  <span>Abstract</span>
                </button>

                ${p.arxiv ? `
                  <a href="https://arxiv.org/abs/${p.arxiv}" target="_blank" rel="noopener"
                     class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" title="View arXiv preprint">
                    <span>arXiv</span>
                    <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                  </a>
                ` : ''}

                ${p.doi ? `
                  <a href="https://doi.org/${p.doi}" target="_blank" rel="noopener"
                     class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" title="View official Publisher DOI">
                    <span>DOI</span>
                    <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                  </a>
                ` : ''}

                <a href="https://inspirehep.net/literature/${p.inspireId}" target="_blank" rel="noopener"
                   class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-50/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors" title="View on INSPIRE-HEP">
                  <i class="ai ai-inspire text-xs"></i>
                </a>
              </div>

            </div>
          </article>
          `;
        });

        container.innerHTML = html;
      }

      // Fetch and parse records from INSPIRE-HEP REST API
      async function fetchInspireData(force = false) {
        const today = getTodayDateString();
        const syncSpinner = document.getElementById('sync-spinner');
        const syncDot = document.getElementById('sync-dot');
        const syncBtnLabel = document.getElementById('sync-btn-label');

        if (syncSpinner) syncSpinner.classList.remove('hidden');
        if (syncDot) syncDot.classList.add('hidden');
        if (syncBtnLabel) syncBtnLabel.textContent = 'Syncing...';

        // 1. Check daily cache unless force is requested
        if (!force) {
          const cachedRaw = localStorage.getItem(CACHE_KEY);
          if (cachedRaw) {
            try {
              const parsed = JSON.parse(cachedRaw);
              if (parsed && parsed.date === today && parsed.data) {
                renderData(parsed.data, `Auto-Loaded`);
                if (syncSpinner) syncSpinner.classList.add('hidden');
                if (syncDot) syncDot.classList.remove('hidden');
                if (syncBtnLabel) syncBtnLabel.textContent = 'INSPIRE-HEP';
                return;
              }
            } catch (e) {
              console.warn('Cache parse error:', e);
            }
          }
        }

        // 2. Fetch fresh JSON from INSPIRE-HEP
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

          const response = await fetch(API_URL, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          });
          clearTimeout(timeoutId);

          if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

          const result = await response.json();
          const hits = result.hits?.hits || [];

          let totalCitations = 0;
          let publishedCount = 0;
          let preprintCount = 0;
          const parsedPapers = [];

          hits.forEach(item => {
            const meta = item.metadata || {};
            const cites = meta.citation_count || 0;
            totalCitations += cites;

            const doi = meta.dois?.[0]?.value || '';
            const arxiv = meta.arxiv_eprints?.[0]?.value || '';
            const pubInfo = meta.publication_info || [];
            const isPublished = (pubInfo.length > 0) || !!doi;

            if (isPublished) publishedCount++;
            else preprintCount++;

            const year = pubInfo?.[0]?.year || (meta.preprint_date ? meta.preprint_date.split('-')[0] : '');

            // Extract complete abstract text
            let abstractText = 'No abstract available for this record on INSPIRE-HEP.';
            if (meta.abstracts && meta.abstracts.length > 0 && meta.abstracts[0].value) {
              abstractText = meta.abstracts[0].value;
            }

            parsedPapers.push({
              inspireId: item.id,
              title: meta.titles?.[0]?.title || 'Untitled',
              abstract: abstractText,
              citations: cites,
              doi: doi,
              arxiv: arxiv,
              year: year,
              formattedAuthors: formatAuthors(meta.authors),
              authorRoleBadge: getAuthorRoleBadge(meta.authors),
              statusBadge: getStatusBadge(meta),
              isPublished: isPublished
            });
          });

          const freshData = {
            totalCitations: totalCitations,
            totalPapers: hits.length,
            publishedCount: publishedCount,
            preprintCount: preprintCount,
            papers: parsedPapers,
            lastSyncedAt: new Date().toLocaleTimeString()
          };

          // Save to localStorage
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            date: today,
            data: freshData
          }));

          renderData(freshData, `Live updated at ${freshData.lastSyncedAt}`);

        } catch (err) {
          console.error('Failed to fetch from INSPIRE-HEP API:', err);
          // Attempt to load stale cache if available
          const cachedRaw = localStorage.getItem(CACHE_KEY);
          if (cachedRaw) {
            try {
              const parsed = JSON.parse(cachedRaw);
              if (parsed.data) {
                renderData(parsed.data, `Offline fallback (previously cached)`);
              }
            } catch (e) {}
          } else {
            const pubStatusMsg = document.getElementById('pub-status-msg');
            if (pubStatusMsg) {
              pubStatusMsg.innerHTML = `<span class="text-amber-600">Failed to connect to INSPIRE-HEP. Please check connection.</span>`;
            }
          }
        } finally {
          if (syncSpinner) syncSpinner.classList.add('hidden');
          if (syncDot) syncDot.classList.remove('hidden');
          if (syncBtnLabel) syncBtnLabel.textContent = 'INSPIRE-HEP';
        }
      }

      // Initial execution
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => fetchInspireData(false));
      } else {
        fetchInspireData(false);
      }

      // Manual Sync Button Click Listener
      const syncBtn = document.getElementById('manual-sync-btn');
      if (syncBtn) {
        syncBtn.addEventListener('click', () => {
          fetchInspireData(true);
        });
      }

    })();

    // Mobile menu toggling
    const mobBtn = document.getElementById('mobile-toggle');
    const mobMenu = document.getElementById('mobile-menu');
    if (mobBtn && mobMenu) {
      mobBtn.addEventListener('click', () => {
        mobMenu.classList.toggle('hidden');
      });
      document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
          mobMenu.classList.add('hidden');
        });
      });
    }

    // Dynamic research container scrollbar (> 4 items)
    const resContainer = document.getElementById('research-container');
    if (resContainer) {
      const items = resContainer.querySelectorAll('.timeline-item');
      if (items.length > 4) {
        resContainer.className = 'space-y-6 max-h-[430px] overflow-y-auto pr-2 sm:pr-3 custom-scrollbar';
      } else {
        resContainer.className = 'space-y-6';
      }
    }

    // Active nav highlighting on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-15% 0px -75% 0px' });

    sections.forEach(section => navObserver.observe(section));
