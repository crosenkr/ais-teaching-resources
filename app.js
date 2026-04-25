        // Security: escape HTML to prevent XSS
        function escapeHtml(str) {
            if (typeof str !== 'string') return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        // Security: validate URLs to prevent javascript: injection
        function safeUrl(url) {
            if (typeof url !== 'string') return '#';
            const trimmed = url.trim().toLowerCase();
            if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return url;
            return '#';
        }

        // State
        let schema = null;
        let allResources = [];
        let currentCategories = []; // empty = all categories
        let currentTags = [];
        let currentSearch = '';
        let currentView = 'grid';
        let exportMode = false;
        const collapsedCategories = new Set();
        const categorySortOrder = {}; // cat label → 'title' | 'source' | 'date'

        // Resource ID helper (used by export mode)
        function getResourceId(r) {
            return r.title + '||' + r.url;
        }

        // Export mode checked items
        const exportChecked = new Set();

        // URL state: read filters from hash
        function readUrlState() {
            const params = new URLSearchParams(window.location.hash.slice(1));
            if (params.has('category')) {
                // Support legacy single-category URLs and new multi-category
                currentCategories = params.get('category').split(',').filter(Boolean);
                if (currentCategories.length === 1 && currentCategories[0] === 'all') currentCategories = [];
            }
            if (params.has('tags')) currentTags = params.get('tags').split(',').filter(Boolean);
            if (params.has('q')) {
                currentSearch = params.get('q');
                document.getElementById('searchInput').value = currentSearch;
            }
            if (params.has('view')) currentView = params.get('view');
            if (params.has('mode') && params.get('mode') === 'export') {
                enterExportMode(false);
            } else {
                exitExportMode(false);
            }
        }

        // URL state: write filters to hash
        function writeUrlState() {
            const params = new URLSearchParams();
            if (currentCategories.length) params.set('category', currentCategories.join(','));
            if (currentTags.length) params.set('tags', currentTags.join(','));
            if (currentSearch) params.set('q', currentSearch);
            if (currentView !== 'grid') params.set('view', currentView);
            if (exportMode) params.set('mode', 'export');
            const hash = params.toString();
            history.replaceState(null, '', hash ? '#' + hash : window.location.pathname);
        }

        // Search highlighting helper
        function highlightText(text, query) {
            if (!query) return escapeHtml(text);
            const escaped = escapeHtml(text);
            const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return escaped.replace(new RegExp(`(${q})`, 'gi'), '<mark class="search-highlight">$1</mark>');
        }

        // Load schema and resources in parallel
        async function init() {
            try {
                const [schemaRes, resourcesRes] = await Promise.all([
                    fetch('schema.json'),
                    fetch('resources.json')
                ]);
                if (!schemaRes.ok || !resourcesRes.ok) throw new Error('Failed to load data files');
                schema = await schemaRes.json();
                allResources = await resourcesRes.json();
                buildFilterButtons();
                readUrlState();
                updateCategoryUI();
                updateActiveTagDisplay();
                setView(currentView);
                render();
            } catch (e) {
                document.getElementById('loading').innerHTML = `
                    <h3>Could not load resources</h3>
                    <p>Make sure <code>resources.json</code> and <code>schema.json</code> are in the same directory.</p>
                `;
            }
        }

        function getCategoryIcon(catLabel) {
            if (!schema) return '\u{1F4C1}';
            const cat = schema.categories.find(c => c.label === catLabel);
            return cat ? cat.icon : '\u{1F4C1}';
        }

        function getCategoryOrder(catLabel) {
            if (!schema) return 999;
            const cat = schema.categories.find(c => c.label === catLabel);
            return cat ? cat.order : 999;
        }

        function buildFilterButtons() {
            const categories = [...new Set(allResources.map(r => r.category))];
            const container = document.getElementById('filterButtons');
            const dropdown = document.getElementById('categorySelect');
            const sorted = categories.sort((a, b) => getCategoryOrder(a) - getCategoryOrder(b));
            sorted.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.category = cat;
                const count = allResources.filter(r => r.category === cat).length;
                btn.textContent = `${cat} (${count})`;
                container.appendChild(btn);

                // Also populate mobile dropdown
                if (dropdown) {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.textContent = `${cat} (${count})`;
                    dropdown.appendChild(opt);
                }
            });
        }

        function setCategory(cat) {
            if (cat === 'all') {
                currentCategories = [];
            } else {
                const idx = currentCategories.indexOf(cat);
                if (idx >= 0) {
                    currentCategories.splice(idx, 1);
                } else {
                    currentCategories.push(cat);
                }
            }
            updateCategoryUI();
            render();
        }

        function updateCategoryUI() {
            document.querySelectorAll('.filter-btn').forEach(b => {
                const cat = b.dataset.category;
                const isActive = cat === 'all'
                    ? currentCategories.length === 0
                    : currentCategories.includes(cat);
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-pressed', isActive);
            });
            // Sync mobile dropdown (show first selected or 'all')
            const sel = document.getElementById('categorySelect');
            if (sel) sel.value = currentCategories.length === 1 ? currentCategories[0] : 'all';
        }

        function setTag(tag) {
            if (!tag) {
                currentTags = [];
            } else {
                const idx = currentTags.findIndex(t => t.toLowerCase() === tag.toLowerCase());
                if (idx >= 0) {
                    currentTags.splice(idx, 1);
                } else {
                    currentTags.push(tag);
                }
            }
            updateActiveTagDisplay();
            updateTagCloudActive();
            render();
        }

        function removeTag(tag) {
            currentTags = currentTags.filter(t => t.toLowerCase() !== tag.toLowerCase());
            updateActiveTagDisplay();
            updateTagCloudActive();
            render();
        }

        function updateActiveTagDisplay() {
            const el = document.getElementById('activeTagFilter');
            if (currentTags.length > 0) {
                const tagPills = currentTags.map(t =>
                    `<span style="background:var(--ais-gold);color:white;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:500;display:inline-flex;align-items:center;gap:0.3rem;">${escapeHtml(t)}<button data-remove-tag="${escapeHtml(t)}" aria-label="Remove tag: ${escapeHtml(t)}" style="background:none;border:none;color:white;cursor:pointer;font-size:0.9rem;padding:0;line-height:1;min-width:28px;min-height:28px;">&times;</button></span>`
                ).join(' ');
                el.innerHTML = `Filtered by tags: ${tagPills} <button data-clear-tags style="margin-left:0.5rem;background:none;border:none;color:var(--ais-blue);cursor:pointer;font-size:0.8rem;font-weight:600;">Clear all</button>`;
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        }

        function isMobile() {
            return window.innerWidth <= 768;
        }

        function setView(view) {
            currentView = view;
            // On mobile, always render as grid (list layout doesn't work well)
            const effectiveView = isMobile() ? 'grid' : view;
            document.getElementById('gridBtn').classList.toggle('active', effectiveView === 'grid');
            document.getElementById('gridBtn').setAttribute('aria-pressed', effectiveView === 'grid');
            document.getElementById('listBtn').classList.toggle('active', effectiveView === 'list');
            document.getElementById('listBtn').setAttribute('aria-pressed', effectiveView === 'list');
            render();
        }

        function updateClearFiltersBtn() {
            const btn = document.getElementById('clearFiltersBtn');
            const hasFilters = currentCategories.length > 0 || currentTags.length > 0 || currentSearch;
            btn.classList.toggle('visible', !!hasFilters);
        }

        function filterResources() {
            let results = allResources;
            if (currentCategories.length > 0) {
                results = results.filter(r => currentCategories.includes(r.category));
            }
            if (currentTags.length > 0) {
                results = results.filter(r =>
                    currentTags.every(ct =>
                        r.tags.some(t => t.toLowerCase() === ct.toLowerCase())
                    )
                );
            }
            if (currentSearch) {
                const q = currentSearch.toLowerCase();
                results = results.filter(r =>
                    r.title.toLowerCase().includes(q) ||
                    r.description.toLowerCase().includes(q) ||
                    r.tags.some(t => t.toLowerCase().includes(q)) ||
                    r.source.toLowerCase().includes(q) ||
                    r.category.toLowerCase().includes(q)
                );
            }
            return results;
        }

        function render() {
            writeUrlState();
            const filtered = filterResources();
            const main = document.getElementById('mainContent');

            document.getElementById('resultsCount').textContent =
                `${filtered.length} resource${filtered.length !== 1 ? 's' : ''}`;
            updateClearFiltersBtn();

            // Update Export nav link active state
            const exportLink = document.getElementById('exportBtn');
            if (exportLink) exportLink.classList.toggle('active', exportMode);

            if (exportMode) {
                renderExportView(filtered, main);
                return;
            }

            // Remove export toolbar if it exists
            const existingToolbar = document.getElementById('exportToolbar');
            if (existingToolbar) existingToolbar.remove();

            if (filtered.length === 0) {
                main.innerHTML = `
                    <div class="no-results">
                        <h3>No resources found</h3>
                        <p>Try adjusting your search, category, or tag filter.</p>
                        <button data-clear-all-filters style="margin-top:1rem; padding:0.5rem 1.2rem; border:1px solid var(--ais-blue); background:var(--bg-light); color:var(--ais-blue); border-radius:6px; cursor:pointer; font-size:0.9rem;">Clear all filters</button>
                    </div>`;
                return;
            }

            // Group by category
            const grouped = {};
            filtered.forEach(r => {
                if (!grouped[r.category]) grouped[r.category] = [];
                grouped[r.category].push(r);
            });

            const sortedCats = Object.keys(grouped).sort((a, b) =>
                getCategoryOrder(a) - getCategoryOrder(b)
            );

            let html = '';
            sortedCats.forEach(cat => {
                const resources = grouped[cat];
                // Sort resources within category
                const sortKey = categorySortOrder[cat] || 'title';
                resources.sort((a, b) => {
                    if (sortKey === 'source') return a.source.localeCompare(b.source) || a.title.localeCompare(b.title);
                    if (sortKey === 'date') {
                        // Parse DD/MM/YYYY and sort newest first
                        const parseDate = d => { if (!d) return 0; const p = d.split('/'); return new Date(p[2], p[1]-1, p[0]).getTime(); };
                        return parseDate(b.lastAccessed) - parseDate(a.lastAccessed) || a.title.localeCompare(b.title);
                    }
                    return a.title.localeCompare(b.title);
                });
                const icon = getCategoryIcon(cat);
                const isCollapsed = collapsedCategories.has(cat);
                const escapedCat = escapeHtml(cat);
                html += `
                    <section class="category-section">
                        <div class="category-header${isCollapsed ? ' collapsed' : ''}" data-collapse-cat="${escapedCat}">
                            <span class="category-icon" aria-hidden="true">${escapeHtml(icon)}</span>
                            <h2>${escapedCat}</h2>
                            <span class="category-count">${resources.length}</span>
                            <select class="category-sort" data-sort-cat="${escapedCat}" aria-label="Sort ${escapedCat}">
                                <option value="title"${sortKey==='title'?' selected':''}>A–Z</option>
                                <option value="source"${sortKey==='source'?' selected':''}>Source</option>
                                <option value="date"${sortKey==='date'?' selected':''}>Newest</option>
                            </select>
                            <button class="category-collapse-btn" aria-expanded="${!isCollapsed}" aria-label="${isCollapsed ? 'Expand' : 'Collapse'} ${escapedCat}" title="${isCollapsed ? 'Expand' : 'Collapse'}"><span class="category-toggle" aria-hidden="true">&#9660;</span></button>
                        </div>
                        <div class="resources-grid ${currentView === 'list' ? 'list-view' : ''}">
                            ${resources.map(r => renderCard(r)).join('')}
                        </div>
                    </section>`;
            });

            main.innerHTML = html;
            updateCollapseAllBtn();
        }

        // Export mode functions
        function enterExportMode(doRender) {
            exportMode = true;
            exportChecked.clear();
            // Set header height for sticky export toolbar offset
            const hdr = document.querySelector('header');
            if (hdr) document.documentElement.style.setProperty('--header-height', hdr.offsetHeight + 'px');
            // Hide non-essential controls
            document.querySelectorAll('#tagCloudBtn, .view-toggle, #clearFiltersBtn, #suggestBtn, #darkModeToggle, #exportBtn').forEach(el => el.style.display = 'none');
            if (doRender !== false) render();
        }

        function exitExportMode(doRender) {
            exportMode = false;
            // Remove export toolbar
            const tb = document.getElementById('exportToolbar');
            if (tb) tb.remove();
            // Restore controls
            document.querySelectorAll('#tagCloudBtn, .view-toggle, #clearFiltersBtn, #suggestBtn, #darkModeToggle, #exportBtn').forEach(el => el.style.display = '');
            if (doRender !== false) render();
        }

        function renderExportView(filtered, main) {
            // Ensure export toolbar exists
            let toolbar = document.getElementById('exportToolbar');
            if (!toolbar) {
                toolbar = document.createElement('div');
                toolbar.id = 'exportToolbar';
                toolbar.className = 'export-toolbar';
                // Insert before main
                main.parentNode.insertBefore(toolbar, main);
            }

            const checkedCount = exportChecked.size;
            toolbar.innerHTML = `<div class="export-toolbar-inner">
                <label class="export-select-all" aria-label="Select all resources">
                    <input type="checkbox" id="exportSelectAll" aria-label="Select all visible resources" ${filtered.length > 0 && filtered.every(r => exportChecked.has(getResourceId(r))) ? 'checked' : ''}>
                    Select All
                </label>
                <span class="export-count" id="exportCount">Selected: ${checkedCount}</span>
                <button class="export-download-btn" id="exportDownloadBtn" aria-label="Download CSV of selected resources" ${checkedCount === 0 ? 'disabled' : ''}>Download CSV</button>
                <button class="export-back-link" id="exportBackBtn" aria-label="Back to resources view">&larr; Back to Resources</button>
            </div>`;

            // Toolbar event listeners
            document.getElementById('exportSelectAll').addEventListener('change', (e) => {
                const checked = e.target.checked;
                filtered.forEach(r => {
                    const rid = getResourceId(r);
                    if (checked) exportChecked.add(rid);
                    else exportChecked.delete(rid);
                });
                // Update all visible checkboxes
                main.querySelectorAll('[data-export-check]').forEach(cb => { cb.checked = checked; });
                updateExportCount();
            });
            document.getElementById('exportDownloadBtn').addEventListener('click', downloadExportCsv);
            document.getElementById('exportBackBtn').addEventListener('click', () => exitExportMode());

            if (filtered.length === 0) {
                main.innerHTML = `<div class="no-results"><h3>No resources found</h3><p>Try adjusting your filters.</p></div>`;
                return;
            }

            // Render compact list grouped by category
            const grouped = {};
            filtered.forEach(r => {
                if (!grouped[r.category]) grouped[r.category] = [];
                grouped[r.category].push(r);
            });
            const sortedCats = Object.keys(grouped).sort((a, b) => getCategoryOrder(a) - getCategoryOrder(b));

            let html = '';
            sortedCats.forEach(cat => {
                const resources = grouped[cat].sort((a, b) => a.title.localeCompare(b.title));
                const icon = getCategoryIcon(cat);
                const escapedCat = escapeHtml(cat);
                const isCollapsed = collapsedCategories.has(cat);
                html += `<section class="category-section">
                    <div class="category-header${isCollapsed ? ' collapsed' : ''}" data-collapse-cat="${escapedCat}">
                        <span class="category-icon" aria-hidden="true">${escapeHtml(icon)}</span>
                        <h2>${escapedCat}</h2>
                        <span class="category-count">${resources.length}</span>
                        <button class="category-collapse-btn" aria-expanded="${!isCollapsed}" aria-label="${isCollapsed ? 'Expand' : 'Collapse'} ${escapedCat}" title="${isCollapsed ? 'Expand' : 'Collapse'}"><span class="category-toggle" aria-hidden="true">&#9660;</span></button>
                    </div>
                    <div class="export-grid" ${isCollapsed ? 'style="display:none"' : ''}>
                        ${resources.map(r => renderExportCard(r)).join('')}
                    </div>
                </section>`;
            });
            main.innerHTML = html;
        }

        function renderExportCard(r) {
            const rid = getResourceId(r);
            const checked = exportChecked.has(rid);
            const safeTitle = escapeHtml(r.title);
            const shareUrl = safeUrl(r.url);
            const titleHtml = highlightText(r.title, currentSearch);
            const descHtml = highlightText(r.description, currentSearch);
            const sourceHtml = highlightText(r.source, currentSearch);
            return `<article class="export-card">
                <input type="checkbox" data-export-check="${escapeHtml(rid)}" ${checked ? 'checked' : ''} aria-label="Select ${safeTitle} for export">
                <div class="export-card-body">
                    <h3><a href="${shareUrl}" target="_blank" rel="noopener noreferrer">${titleHtml}</a></h3>
                    <div class="export-card-meta"><span class="resource-source">${sourceHtml}</span> &middot; <a href="${shareUrl}" style="font-size:0.72rem;color:var(--text-secondary);word-break:break-all;">${escapeHtml(r.url)}</a></div>
                    <p class="export-card-desc">${descHtml}</p>
                </div>
            </article>`;
        }

        function updateExportCount() {
            const countEl = document.getElementById('exportCount');
            if (countEl) countEl.textContent = 'Selected: ' + exportChecked.size;
            const dlBtn = document.getElementById('exportDownloadBtn');
            if (dlBtn) dlBtn.disabled = exportChecked.size === 0;
            // Update select-all state
            const selAll = document.getElementById('exportSelectAll');
            if (selAll) {
                const visibleCbs = document.querySelectorAll('[data-export-check]');
                const allChecked = visibleCbs.length > 0 && [...visibleCbs].every(cb => cb.checked);
                selAll.checked = allChecked;
            }
        }

        function downloadExportCsv() {
            if (exportChecked.size === 0) return;
            const rows = [['Title', 'URL', 'Source', 'Category', 'Description', 'Tags', 'Last Accessed']];
            allResources.forEach(r => {
                const rid = getResourceId(r);
                if (!exportChecked.has(rid)) return;
                const csvEscape = (s) => { let v = (s || '').replace(/"/g, '""').replace(/[\r\n]+/g, ' '); if (/^[=+\-@|\t;]/.test(v)) v = "'" + v; return '"' + v + '"'; };
                rows.push([
                    csvEscape(r.title),
                    csvEscape(r.url),
                    csvEscape(r.source),
                    csvEscape(r.category),
                    csvEscape(r.description),
                    csvEscape((r.tags || []).join('; ')),
                    csvEscape(r.lastAccessed || '')
                ]);
            });
            const csv = rows.map(row => row.join(',')).join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ais-teaching-resources.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function renderCard(r) {
            const renderTag = t => {
                const escaped = escapeHtml(t);
                const isActive = currentTags.some(ct => ct.toLowerCase() === t.toLowerCase());
                return `<button class="resource-tag ${isActive ? 'tag-active' : ''}" data-tag="${escaped}" title="Click to filter by this tag">${escaped}</button>`;
            };
            const visible = r.tags.slice(0, 5).map(renderTag).join('');
            const extra = r.tags.length > 5
                ? `<button class="resource-tag" data-expand-tags style="color:var(--text-secondary);" aria-label="Show ${r.tags.length - 5} more tags">+${r.tags.length - 5} more</button>` + `<span class="extra-tags" style="display:none;">${r.tags.slice(5).map(renderTag).join('')}</span>`
                : '';
            const tagsHtml = visible + extra;

            const accessedHtml = r.lastAccessed
                ? `<span class="resource-accessed">Last accessed: ${escapeHtml(r.lastAccessed)}</span>`
                : '';

            // "New" badge: show if lastAccessed is within the last 30 days (1 month)
            let newBadge = '';
            if (r.lastAccessed) {
                const parts = r.lastAccessed.split('/');
                if (parts.length === 3) {
                    const accessed = new Date(parts[2], parts[1] - 1, parts[0]);
                    const daysSince = (Date.now() - accessed.getTime()) / (1000 * 60 * 60 * 24);
                    if (daysSince <= 30) newBadge = '<span class="new-badge">New</span>';
                }
            }

            const titleHtml = highlightText(r.title, currentSearch);
            const descHtml = highlightText(r.description, currentSearch);
            const sourceHtml = highlightText(r.source, currentSearch);

            const safeTitle = escapeHtml(r.title);
            const shareUrl = safeUrl(r.url);
            const shareText = encodeURIComponent(r.title + ' — found via AIS Teaching Resources');
            const shareUrlEnc = encodeURIComponent(r.url);

            return `
                <article class="resource-card">
                    <h3><a href="${shareUrl}" target="_blank" rel="noopener noreferrer">${titleHtml}</a>${newBadge}</h3>
                    <div class="resource-meta">
                        <span class="resource-source">${sourceHtml}</span>
                        ${accessedHtml}
                    </div>
                    <p class="resource-desc">${descHtml}</p>
                    <div class="resource-tags">${tagsHtml}</div>
                    <div class="share-bar">
                        <span class="share-bar-label">Share:</span>
                        <button class="share-btn" data-share-copy="${escapeHtml(r.url)}" title="Copy link" aria-label="Copy link"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg></button>
                        <button class="share-btn" data-share-x="${shareUrlEnc}" data-share-text="${shareText}" title="Share on X" aria-label="Share on X"><svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
                        <button class="share-btn" data-share-linkedin="${shareUrlEnc}" title="Share on LinkedIn" aria-label="Share on LinkedIn"><svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></button>
                        <button class="share-btn" data-share-email="${shareUrlEnc}" data-share-title="${encodeURIComponent(r.title)}" title="Share via email" aria-label="Share via email"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></button>
                        <button class="share-btn" data-share-whatsapp="${shareText}%20${shareUrlEnc}" title="Share via WhatsApp" aria-label="Share via WhatsApp"><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>
                        <button class="share-btn" data-share-facebook="${shareUrlEnc}" title="Share on Facebook" aria-label="Share on Facebook"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></button>
                        <button class="share-btn" data-share-bluesky="${shareText}%20${shareUrlEnc}" title="Share on Bluesky" aria-label="Share on Bluesky"><svg viewBox="0 0 24 24"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.595 3.496 6.178 3.21-3.597.502-6.761 1.725-2.797 6.022C7.278 23.123 10.299 17.894 12 14.842c1.701 3.052 4.478 8.093 7.995 4.637 3.964-4.297.8-5.52-2.797-6.022 2.583.286 5.393-.583 6.178-3.21.246-.828.624-5.788.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.3-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg></button>
                        <button class="share-btn share-btn-native" data-share-native data-share-native-title="${safeTitle}" data-share-native-url="${escapeHtml(r.url)}" title="More sharing options" aria-label="More sharing options"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg></button>
                        <span class="share-copied" aria-live="polite">Copied!</span>
                        <button class="report-btn" data-report-title="${safeTitle}" data-report-url="${escapeHtml(r.url)}" title="Report issue with this resource" aria-label="Report issue with ${safeTitle}"><svg viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/></svg></button>
                    </div>
                </article>`;
        }

        // Tag cloud
        function toggleTagCloud(forceClose) {
            const panel = document.getElementById('tagCloudPanel');
            const btn = document.getElementById('tagCloudBtn');
            const isOpen = (forceClose === true) ? (panel.classList.remove('open'), false) : panel.classList.toggle('open');
            btn.classList.toggle('active', isOpen);
            btn.setAttribute('aria-expanded', isOpen);
            if (isOpen && !panel.dataset.built) {
                buildTagCloud();
                panel.dataset.built = '1';
            }
        }

        function buildTagCloud() {
            // Count tag usage across all resources
            const tagCounts = {};
            allResources.forEach(r => {
                r.tags.forEach(t => {
                    tagCounts[t] = (tagCounts[t] || 0) + 1;
                });
            });

            // Map tags to their schema facets
            const facetLabels = {
                'topics': 'Topics',
                'resource-type': 'Resource Types',
                'organizations': 'Organizations',
                'audience': 'Audience',
                'regions': 'Regions',
                'languages': 'Languages'
            };

            // Build a lookup: tag → facet
            const tagToFacet = {};
            if (schema && schema.tags) {
                for (const [facet, tags] of Object.entries(schema.tags)) {
                    tags.forEach(t => { tagToFacet[t.toLowerCase()] = facet; });
                }
            }

            // Group tags by facet, put uncategorized at the end
            const facetGroups = {};
            const uncategorized = [];
            for (const [tag, count] of Object.entries(tagCounts)) {
                const facet = tagToFacet[tag.toLowerCase()];
                if (facet) {
                    if (!facetGroups[facet]) facetGroups[facet] = [];
                    facetGroups[facet].push({ tag, count });
                } else {
                    uncategorized.push({ tag, count });
                }
            }

            // Determine size classes (1-5) based on count distribution
            const counts = Object.values(tagCounts);
            const maxCount = Math.max(...counts);
            const minCount = Math.min(...counts);
            function sizeClass(count) {
                if (maxCount === minCount) return 3;
                const ratio = (count - minCount) / (maxCount - minCount);
                return Math.ceil(ratio * 4) + 1;
            }

            function renderTagButtons(items) {
                return items
                    .sort((a, b) => a.tag.localeCompare(b.tag))
                    .map(({ tag, count }) => {
                        const escaped = escapeHtml(tag);
                        const isActive = currentTags.some(ct => ct.toLowerCase() === tag.toLowerCase());
                        return `<button class="tag-cloud-tag size-${sizeClass(count)} ${isActive ? 'tag-active' : ''}" data-cloud-tag="${escaped}">${escaped}<span class="tag-count">(${count})</span></button>`;
                    }).join('');
            }

            const facetOrder = ['topics', 'resource-type', 'organizations', 'audience', 'regions', 'languages'];
            let html = '<p style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:0.75rem;">Click tags to filter resources. Select multiple tags to show only resources matching all of them.</p>';
            facetOrder.forEach(facet => {
                if (facetGroups[facet] && facetGroups[facet].length > 0) {
                    html += `<div class="tag-cloud-facet">
                        <div class="tag-cloud-facet-label">${escapeHtml(facetLabels[facet] || facet)}</div>
                        <div class="tag-cloud-tags">${renderTagButtons(facetGroups[facet])}</div>
                    </div>`;
                }
            });
            if (uncategorized.length > 0) {
                html += `<div class="tag-cloud-facet">
                    <button class="tag-cloud-other-toggle" data-toggle-other data-count="${uncategorized.length}">Show ${uncategorized.length} additional tags ▼</button>
                    <div class="tag-cloud-other-tags" id="otherTags">${renderTagButtons(uncategorized)}</div>
                </div>`;
            }

            document.getElementById('tagCloudContent').innerHTML = html;
        }

        function updateTagCloudActive() {
            document.querySelectorAll('.tag-cloud-tag').forEach(btn => {
                const tag = btn.dataset.cloudTag;
                const isActive = tag && currentTags.some(ct => ct.toLowerCase() === tag.toLowerCase());
                btn.classList.toggle('tag-active', isActive);
            });
        }

        // Delegated click handler for tag cloud
        document.getElementById('tagCloudContent').addEventListener('click', (e) => {
            const tag = e.target.closest('[data-cloud-tag]');
            if (tag) {
                setTag(tag.dataset.cloudTag);
                updateTagCloudActive();
                return;
            }
            const toggle = e.target.closest('[data-toggle-other]');
            if (toggle) {
                const other = document.getElementById('otherTags');
                other.classList.toggle('open');
                const count = toggle.dataset.count;
                toggle.textContent = other.classList.contains('open')
                    ? 'Hide additional tags \u25B2'
                    : `Show ${count} additional tags \u25BC`;
            }
        });

        // Delegated click handler for active tag filter bar
        document.getElementById('activeTagFilter').addEventListener('click', (e) => {
            const removeBtn = e.target.closest('[data-remove-tag]');
            if (removeBtn) { removeTag(removeBtn.dataset.removeTag); return; }
            const clearBtn = e.target.closest('[data-clear-tags]');
            if (clearBtn) { setTag(null); }
        });

        // Delegated click handler for tags, expand, collapse, and clear-all button
        document.getElementById('mainContent').addEventListener('click', (e) => {
            const collapseBtn = e.target.closest('.category-collapse-btn');
            if (collapseBtn) {
                const header = collapseBtn.closest('[data-collapse-cat]');
                const cat = header.dataset.collapseCat;
                if (collapsedCategories.has(cat)) {
                    collapsedCategories.delete(cat);
                    header.classList.remove('collapsed');
                    collapseBtn.setAttribute('aria-expanded', 'true');
                    collapseBtn.setAttribute('aria-label', 'Collapse ' + cat);
                } else {
                    collapsedCategories.add(cat);
                    header.classList.add('collapsed');
                    collapseBtn.setAttribute('aria-expanded', 'false');
                    collapseBtn.setAttribute('aria-label', 'Expand ' + cat);
                }
                const grid = header.nextElementSibling;
                if (grid) grid.style.display = collapsedCategories.has(cat) ? 'none' : '';
                return;
            }
            const expand = e.target.closest('[data-expand-tags]');
            if (expand) {
                const extra = expand.nextElementSibling;
                if (extra) { extra.style.display = 'inline'; expand.remove(); }
                return;
            }
            const tag = e.target.closest('[data-tag]');
            if (tag) { setTag(tag.dataset.tag); return; }
            // Share buttons
            const copyBtn = e.target.closest('[data-share-copy]');
            if (copyBtn) {
                navigator.clipboard.writeText(copyBtn.dataset.shareCopy).then(() => {
                    const msg = copyBtn.closest('.share-bar').querySelector('.share-copied');
                    msg.classList.add('visible');
                    setTimeout(() => msg.classList.remove('visible'), 1500);
                });
                return;
            }
            const xBtn = e.target.closest('[data-share-x]');
            if (xBtn) {
                window.open('https://x.com/intent/tweet?url=' + xBtn.dataset.shareX + '&text=' + xBtn.dataset.shareText, '_blank', 'noopener,width=550,height=420');
                return;
            }
            const liBtn = e.target.closest('[data-share-linkedin]');
            if (liBtn) {
                window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + liBtn.dataset.shareLinkedin, '_blank', 'noopener,width=550,height=420');
                return;
            }
            const emailBtn = e.target.closest('[data-share-email]');
            if (emailBtn) {
                window.location.href = 'mailto:?subject=' + emailBtn.dataset.shareTitle + '%20%E2%80%94%20AIS%20Teaching%20Resources&body=' + emailBtn.dataset.shareTitle + '%0A' + emailBtn.dataset.shareEmail;
                return;
            }
            const waBtn = e.target.closest('[data-share-whatsapp]');
            if (waBtn) {
                window.open('https://wa.me/?text=' + waBtn.dataset.shareWhatsapp, '_blank', 'noopener');
                return;
            }
            const fbBtn = e.target.closest('[data-share-facebook]');
            if (fbBtn) {
                window.open('https://www.facebook.com/sharer/sharer.php?u=' + fbBtn.dataset.shareFacebook, '_blank', 'noopener,width=550,height=420');
                return;
            }
            const bskyBtn = e.target.closest('[data-share-bluesky]');
            if (bskyBtn) {
                window.open('https://bsky.app/intent/compose?text=' + bskyBtn.dataset.shareBluesky, '_blank', 'noopener,width=550,height=420');
                return;
            }
            const nativeBtn = e.target.closest('[data-share-native]');
            if (nativeBtn && navigator.share) {
                navigator.share({ title: nativeBtn.dataset.shareNativeTitle, url: safeUrl(nativeBtn.dataset.shareNativeUrl) }).catch(() => {});
                return;
            }
            const reportBtn = e.target.closest('[data-report-title]');
            if (reportBtn) {
                const title = reportBtn.dataset.reportTitle;
                const url = reportBtn.dataset.reportUrl;
                const issueTitle = encodeURIComponent('Issue: ' + title);
                const issueBody = encodeURIComponent(
                    '### Issue Report\n\n' +
                    '**Resource:** ' + title + '\n' +
                    '**URL:** ' + url + '\n\n' +
                    '**Issue type:** [Dead link / Miscategorized / Incorrect info / Other]\n\n' +
                    '**Description:**\n\n' +
                    '---\n_Submitted via the Report Issue button on AIS Teaching Resources._'
                );
                window.open(GITHUB_ISSUES_URL + '?title=' + issueTitle + '&body=' + issueBody, '_blank', 'noopener');
                return;
            }
            const clearAll = e.target.closest('[data-clear-all-filters]');
            if (clearAll) {
                currentCategories = []; currentTags = []; currentSearch = '';
                document.getElementById('searchInput').value = '';
                updateActiveTagDisplay(); updateTagCloudActive(); updateCategoryUI(); render();
            }
        });

        // Collapse/Expand all categories button
        document.getElementById('collapseAllBtn').addEventListener('click', () => {
            const allCats = [...document.querySelectorAll('[data-collapse-cat]')].map(el => el.dataset.collapseCat);
            const allCollapsed = allCats.length > 0 && allCats.every(c => collapsedCategories.has(c));
            if (allCollapsed) {
                collapsedCategories.clear();
            } else {
                allCats.forEach(c => collapsedCategories.add(c));
            }
            render();
        });

        function updateCollapseAllBtn() {
            const btn = document.getElementById('collapseAllBtn');
            const sections = document.querySelectorAll('[data-collapse-cat]');
            if (sections.length === 0) { btn.style.display = 'none'; return; }
            btn.style.display = '';
            const allCollapsed = [...sections].every(el => collapsedCategories.has(el.dataset.collapseCat));
            btn.textContent = allCollapsed ? 'Expand all' : 'Collapse all';
            btn.setAttribute('aria-label', allCollapsed ? 'Expand all categories' : 'Collapse all categories');
        }

        // Clear all filters button in controls bar
        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            currentCategories = []; currentTags = []; currentSearch = '';
            document.getElementById('searchInput').value = '';
            updateActiveTagDisplay(); updateTagCloudActive(); updateCategoryUI(); render();
        });

        // Search with debounce
        let searchTimer;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                currentSearch = e.target.value.trim();
                render();
            }, 200);
        });

        // Escape closes tag cloud panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('tagCloudPanel').classList.contains('open')) {
                toggleTagCloud(true);
            }
        });

        // Also listen for Escape to clear search
        document.getElementById('searchInput').addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                currentSearch = '';
                e.target.blur();
                render();
            }
        });

        // Keyboard shortcut: / to focus search
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
        });

        // Static element event listeners (replacing inline handlers)
        document.getElementById('tagCloudBtn').addEventListener('click', toggleTagCloud);
        document.getElementById('gridBtn').addEventListener('click', () => setView('grid'));
        document.getElementById('listBtn').addEventListener('click', () => setView('list'));
        document.getElementById('categorySelect').addEventListener('change', (e) => {
            // Mobile dropdown: replace selection (not toggle)
            currentCategories = e.target.value === 'all' ? [] : [e.target.value];
            updateCategoryUI();
            render();
        });
        document.getElementById('aisLogo').addEventListener('error', function() { this.style.display = 'none'; });

        // Welcome banner — dismiss and remember via sessionStorage
        (function() {
            const banner = document.getElementById('welcomeBanner');
            if (sessionStorage.getItem('ais-welcome-dismissed')) {
                banner.style.display = 'none';
            }
            document.getElementById('welcomeClose').addEventListener('click', () => {
                banner.style.display = 'none';
                sessionStorage.setItem('ais-welcome-dismissed', '1');
            });
        })();

        // Category filter buttons — delegated on the container
        document.getElementById('filterButtons').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-category]');
            if (btn) setCategory(btn.dataset.category);
        });

        // Handle browser back/forward with hash state
        window.addEventListener('hashchange', () => {
            readUrlState();
            updateCategoryUI();
            document.getElementById('searchInput').value = currentSearch;
            updateActiveTagDisplay();
            updateTagCloudActive();
            render();
        });

        // Print date (avoid document.write for CSP compatibility)
        document.getElementById('printDate').textContent =
            new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});

        // Detect native share API
        if (navigator.share) document.body.classList.add('has-native-share');

        // Dark mode toggle — respect OS preference, allow manual override
        (function() {
            const toggle = document.getElementById('darkModeToggle');
            const stored = localStorage.getItem('ais-dark-mode');
            const osPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = stored !== null ? stored === '1' : osPrefersDark;
            if (isDark) {
                document.documentElement.classList.add('dark-mode');
                toggle.innerHTML = '&#9788; Light';
                toggle.setAttribute('aria-pressed', 'true');
            }
            toggle.addEventListener('click', () => {
                const nowDark = document.documentElement.classList.toggle('dark-mode');
                toggle.innerHTML = nowDark ? '&#9788; Light' : '&#9790; Dark';
                toggle.setAttribute('aria-pressed', nowDark);
                localStorage.setItem('ais-dark-mode', nowDark ? '1' : '0');
            });
        })();

        // Back-to-top button
        (function() {
            const btn = document.getElementById('backToTop');
            window.addEventListener('scroll', () => {
                btn.classList.toggle('visible', window.scrollY > 400);
            }, { passive: true });
            btn.addEventListener('click', () => {
                const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
                window.scrollTo({ top: 0, behavior });
            });
        })();

        // Sort dropdown and export checkbox change handler (delegated on mainContent)
        document.getElementById('mainContent').addEventListener('change', (e) => {
            const sortSel = e.target.closest('[data-sort-cat]');
            if (sortSel) {
                categorySortOrder[sortSel.dataset.sortCat] = sortSel.value;
                render();
                return;
            }
            const exportCb = e.target.closest('[data-export-check]');
            if (exportCb) {
                const rid = exportCb.dataset.exportCheck;
                if (exportCb.checked) exportChecked.add(rid);
                else exportChecked.delete(rid);
                updateExportCount();
            }
        });

        // Report issue button — handled inside existing mainContent click handler below

        // GitHub repo for issues
        const GITHUB_ISSUES_URL = 'https://github.com/crosenkr/ais-teaching-resources/issues/new';

        // Suggest a Resource modal
        (function() {
            const modal = document.getElementById('suggestModal');
            const openBtn = document.getElementById('suggestBtn');
            const closeBtn = document.getElementById('suggestClose');
            const cancelBtn = document.getElementById('suggestCancelBtn');
            const form = document.getElementById('suggestForm');

            function setPageInert(inert) {
                document.querySelectorAll('header, main, footer, .export-toolbar').forEach(el => {
                    if (inert) el.setAttribute('inert', '');
                    else el.removeAttribute('inert');
                });
                document.body.style.overflow = inert ? 'hidden' : '';
            }

            function openModal() {
                // Populate category dropdown from schema
                const sel = document.getElementById('suggestCategory');
                if (sel.options.length <= 1 && schema) {
                    schema.categories
                        .sort((a, b) => a.order - b.order)
                        .forEach(c => {
                            const opt = document.createElement('option');
                            opt.value = c.label;
                            opt.textContent = c.label;
                            sel.appendChild(opt);
                        });
                }
                modal.classList.add('open');
                setPageInert(true);
                document.getElementById('suggestTitle').focus();
            }

            function closeModal() {
                modal.classList.remove('open');
                setPageInert(false);
                form.reset();
                openBtn.focus(); // Return focus to trigger
            }

            openBtn.addEventListener('click', openModal);
            closeBtn.addEventListener('click', closeModal);
            cancelBtn.addEventListener('click', closeModal);

            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            // Focus trap inside modal
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { closeModal(); e.stopPropagation(); return; }
                if (e.key !== 'Tab') return;
                const focusable = modal.querySelectorAll('input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            });

            // Submit → open pre-filled GitHub Issue
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('suggestTitle').value.trim();
                const url = document.getElementById('suggestUrl').value.trim();
                if (!title || !url) {
                    if (!title) document.getElementById('suggestTitle').focus();
                    else document.getElementById('suggestUrl').focus();
                    return;
                }
                const category = document.getElementById('suggestCategory').value;
                const desc = document.getElementById('suggestDesc').value.trim();
                const name = document.getElementById('suggestName').value.trim();

                const issueTitle = encodeURIComponent('Resource suggestion: ' + title);
                const bodyParts = [
                    '### Resource Suggestion',
                    '',
                    '**Title:** ' + title,
                    '**URL:** ' + url,
                    category ? '**Suggested category:** ' + category : '',
                    desc ? '**Description:** ' + desc : '',
                    name ? '**Submitted by:** ' + name : '',
                    '',
                    '---',
                    '_Submitted via the Suggest a Resource form on AIS Teaching Resources._'
                ].filter(Boolean);
                const issueBody = encodeURIComponent(bodyParts.join('\n'));
                window.open(GITHUB_ISSUES_URL + '?title=' + issueTitle + '&body=' + issueBody, '_blank', 'noopener');
                closeModal();
            });
        })();

        // Export nav link click handler
        document.getElementById('exportBtn').addEventListener('click', (e) => {
            e.preventDefault();
            if (exportMode) exitExportMode();
            else enterExportMode();
        });

        // Keyboard shortcuts modal
        (function() {
            const modal = document.getElementById('kbdModal');
            const closeBtn = document.getElementById('kbdClose');
            let kbdTrigger = null;

            function setKbdPageInert(inert) {
                document.querySelectorAll('header, main, footer, .export-toolbar').forEach(el => {
                    if (inert) el.setAttribute('inert', '');
                    else el.removeAttribute('inert');
                });
                document.body.style.overflow = inert ? 'hidden' : '';
            }

            function openKbdModal() {
                kbdTrigger = document.activeElement;
                modal.classList.add('open');
                setKbdPageInert(true);
                closeBtn.focus();
            }

            function closeKbdModal() {
                modal.classList.remove('open');
                setKbdPageInert(false);
                if (kbdTrigger && kbdTrigger.focus) kbdTrigger.focus();
            }

            closeBtn.addEventListener('click', closeKbdModal);

            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeKbdModal();
            });

            // Focus trap inside modal
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { closeKbdModal(); e.stopPropagation(); return; }
                if (e.key !== 'Tab') return;
                const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            });

            // Global keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Don't trigger when in input/textarea/select
                const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
                // Don't trigger when a modal is open (except for Escape)
                const suggestOpen = document.getElementById('suggestModal').classList.contains('open');
                const kbdOpen = modal.classList.contains('open');

                if (e.key === 'Escape' && kbdOpen) {
                    closeKbdModal();
                    return;
                }

                if (inInput || suggestOpen || kbdOpen) return;

                if (e.key === '?') {
                    e.preventDefault();
                    openKbdModal();
                    return;
                }
                if (e.key === 'd') {
                    e.preventDefault();
                    document.getElementById('darkModeToggle').click();
                    return;
                }
                if (e.key === 'e') {
                    e.preventDefault();
                    if (exportMode) exitExportMode();
                    else enterExportMode();
                    return;
                }
            });
        })();

        // Init
        init();
