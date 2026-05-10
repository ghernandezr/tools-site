/**
 * WEUP_Calculator
 *
 * WealthEngine Ultra Pro - Advanced Compound Interest Calculator
 * Namespace: WEUP_Calculator
 */

window.WEUP_Calculator = (function () {

    let chart;
    const elements = {
        p: { i: document.getElementById('weup-in-p'), s: document.getElementById('weup-sl-p') },
        m: { i: document.getElementById('weup-in-m'), s: document.getElementById('weup-sl-m') },
        r: { i: document.getElementById('weup-in-r'), s: document.getElementById('weup-sl-r') },
        y: { i: document.getElementById('weup-in-y'), s: document.getElementById('weup-sl-y') },
        inf: document.getElementById('weup-sl-inf'),
        tax: document.getElementById('weup-sl-tax'),
        step: document.getElementById('weup-sl-step'),
        vol: document.getElementById('weup-check-vol')
    };

    const format = (v) => {
        // Handle NaN, undefined, or invalid values
        if (typeof v !== 'number' || isNaN(v) || !isFinite(v)) {
            return '$0';
        }

        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        let suffixNum = 0;

        // Only use suffix if value actually reaches the threshold
        for (let i = 1; i < suffixes.length; i++) {
            if (v >= Math.pow(1000, i)) {
                suffixNum = i;
            } else {
                break;
            }
        }

        // If value exceeds the largest named suffix, clamp to last suffix
        const maxSuffix = suffixes.length - 1;
        if (suffixNum >= maxSuffix && v >= Math.pow(1000, maxSuffix)) {
            const divisor = Math.pow(1000, maxSuffix);
            const shortValue = (v / divisor).toLocaleString('en-US', { maximumFractionDigits: 2 });
            return '$' + shortValue + suffixes[maxSuffix];
        }

        // If value is small (no suffix needed)
        if (suffixNum === 0) {
            return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
        }

        const raw = v / Math.pow(1000, suffixNum);
        const shortValue = parseFloat(raw.toPrecision(3));
        return '$' + shortValue.toLocaleString('en-US', { maximumFractionDigits: 2 }) + suffixes[suffixNum];
    };

    function calculate() {
        const P = parseFloat(elements.p.i.value) || 0;
        const M_start = parseFloat(elements.m.i.value) || 0;
        const rawROI = parseFloat(elements.r.i.value) || 0;
        const clampedROI = Math.min(Math.max(rawROI, 0), 200);
        if (rawROI !== clampedROI) {
            elements.r.i.value = clampedROI;
        }
        const ROI = clampedROI / 100;
        const years = parseInt(elements.y.i.value) || 0;
        const inf = (parseFloat(elements.inf.value) || 0) / 100;
        const taxRate = (parseFloat(elements.tax.value) || 0) / 100;
        const stepUp = (parseFloat(elements.step.value) || 0) / 100;
        const useVol = elements.vol.checked;

        // Sync visual UI for sliders
        document.getElementById('weup-val-inf').innerText = elements.inf.value + '%';
        document.getElementById('weup-val-tax').innerText = elements.tax.value + '%';
        document.getElementById('weup-val-step').innerText = elements.step.value + '%';
        document.getElementById('weup-vol-box').querySelector('div').style.transform = useVol ? 'scale(1)' : 'scale(0)';

        let currentNominal = P;
        let currentReal = P;
        let totalInvested = P;
        let totalTaxPaid = 0;
        let monthlyContribution = M_start;

        const labels = [];
        const dataNominal = [];
        const dataReal = [];
        const dataBull = [];
        const dataBear = [];
        let tableRows = '';

        labels.push('Now');
        dataNominal.push(P);
        dataReal.push(P);
        dataBull.push(P);
        dataBear.push(P);

        for (let y = 1; y <= years; y++) {
            let yearlyInterest = 0;
            let yearlyTax = 0;

            // Monthly resolution — interest compounds monthly, tax applied annually at year-end
            for (let m = 1; m <= 12; m++) {
                const int = currentNominal * (ROI / 12);
                yearlyInterest += int;

                currentNominal += int + monthlyContribution;
                totalInvested += monthlyContribution;
            }

            // Apply capital gains tax once per year on total interest earned that year
            yearlyTax = yearlyInterest * taxRate;
            currentNominal -= yearlyTax;
            totalTaxPaid += yearlyTax;

            // Inflation adjustment for real wealth
            currentReal = currentNominal / Math.pow(1 + inf, y);

            // Bull/Bear cases: scaled deviation from nominal using annual ratio difference
            const bullCase = Math.max(0, currentNominal * Math.pow((1 + ROI + 0.05) / (1 + ROI), y));
            const bearCase = Math.max(0, currentNominal * Math.pow((1 + ROI - 0.05) / (1 + ROI), y));

            labels.push('Y' + y);
            dataNominal.push(Math.round(currentNominal));
            dataReal.push(Math.round(currentReal));
            dataBull.push(Math.round(bullCase));
            dataBear.push(Math.round(bearCase));

            tableRows += `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-4 font-bold text-slate-900">${y}</td>
                    <td class="p-4">${format(monthlyContribution * 12)}</td>
                    <td class="p-4 text-emerald-600">+${format(yearlyInterest)}</td>
                    <td class="p-4 text-red-500">-${format(yearlyTax)}</td>
                    <td class="p-4 font-black text-slate-900">${format(currentNominal)}</td>
                    <td class="p-4 font-bold text-amber-600">${format(currentReal)}</td>
                </tr>
            `;

            // Step-up monthly contribution for next year
            monthlyContribution *= (1 + stepUp);
        }

        // Update DOM
        document.getElementById('weup-stat-nominal').innerText = format(currentNominal);
        document.getElementById('weup-stat-real').innerText = format(currentReal);
        document.getElementById('weup-table-body').innerHTML = tableRows;

        // Opportunity Cost (1 year delay) — first-order approximation: currentNominal * ROI / (1+ROI)
        // Note: this is a simplified proxy, not a full recalculation of the deferred scenario
        const delayLoss = currentNominal - (currentNominal / (1 + ROI));
        document.getElementById('weup-opp-cost').innerText = `-${format(delayLoss)}`;

        // FIRE Logic (4% Rule - 25x estimated annual expenses based on monthly contributions)
        // fireTarget uses monthly savings * 12 * 25 as a lifestyle proxy; minimum $500K
        const fireTarget = Math.max(500000, (M_start * 12) * 25);
        const currentAge = 30; // Default assumption — future UI input
        // Start FIRE simulation from already-accumulated balance (not fresh from P)
        let fireBalance = currentNominal;
        let fireMonthly = monthlyContribution; // already step-up adjusted after main loop
        let fireAgeReached = null;

        // Iterate to find when FIRE is reached (up to 100 more years from current point)
        for (let y = 1; y <= 100; y++) {
            for (let m = 1; m <= 12; m++) {
                const int = fireBalance * (ROI / 12);
                const tax = int * taxRate;
                fireBalance += (int - tax) + fireMonthly;
            }
            fireMonthly *= (1 + stepUp);

            if (fireBalance >= fireTarget && fireAgeReached === null) {
                fireAgeReached = currentAge + years + y;
                break;
            }
        }

        const annualSafeWithdrawal = currentNominal * 0.04;
        document.getElementById('weup-fire-income').innerText = format(annualSafeWithdrawal / 12);
        const fireYearsToGo = fireAgeReached ? (fireAgeReached - currentAge - years) : null;
        document.getElementById('weup-fire-text').innerHTML = `With a target of ${format(fireTarget)} (25× your annual savings of ${format(M_start * 12)}), you will reach full financial independence in <b>${fireYearsToGo !== null ? fireYearsToGo : '100+'} more years</b> at age <b>${fireAgeReached || (currentAge + years + 100) + '+'}</b>.`;
        document.getElementById('weup-stat-fire').innerText = fireAgeReached ? fireAgeReached + ' yrs' : (currentAge + years + 100) + '+ yrs';

        updateChart(labels, dataNominal, dataReal, useVol ? { bull: dataBull, bear: dataBear } : null);

        updateURL();
    }

    function initChart() {
        const ctx = document.getElementById('weup-mainChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'Nominal Balance', borderColor: '#059669', borderWidth: 3, data: [], fill: false, tension: 0.4, pointRadius: 0 },
                    { label: 'Real Purchasing Power', borderColor: '#d97706', borderWidth: 2, borderDash: [5, 5], data: [], fill: false, tension: 0.4, pointRadius: 0 },
                    { label: 'Upper Band', borderColor: 'transparent', backgroundColor: 'rgba(16, 185, 129, 0.05)', data: [], fill: '+1', tension: 0.4, pointRadius: 0 },
                    { label: 'Lower Band', borderColor: 'transparent', backgroundColor: 'rgba(16, 185, 129, 0.05)', data: [], fill: false, tension: 0.4, pointRadius: 0 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { callback: v => format(v), font: { weight: 'bold' } }, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function updateChart(labels, nominal, real, volData) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = nominal;
        chart.data.datasets[1].data = real;
        if (volData) {
            chart.data.datasets[2].data = volData.bull;
            chart.data.datasets[3].data = volData.bear;
        } else {
            chart.data.datasets[2].data = [];
            chart.data.datasets[3].data = [];
        }
        chart.update();
    }

    // UI Handlers
    function switchTab(t) {
        ['chart', 'fire', 'table'].forEach(v => {
            document.getElementById('weup-view-' + v).classList.add('hidden');
            document.getElementById('weup-tab-' + v).classList.remove('tab-active');
            document.getElementById('weup-tab-' + v).classList.add('text-slate-500');
        });
        document.getElementById('weup-view-' + t).classList.remove('hidden');
        document.getElementById('weup-tab-' + t).classList.add('tab-active');
        document.getElementById('weup-tab-' + t).classList.remove('text-slate-500');
    }

    function toggleAdv() {
        const p = document.getElementById('weup-adv-panel');
        const i = document.getElementById('weup-adv-icon');
        p.classList.toggle('hidden');
        i.style.transform = p.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }

    // Deep Linking Logic — debounced to avoid replaceState rate-limiting on rapid slider input
    let _urlDebounceTimer;
    function updateURL() {
        clearTimeout(_urlDebounceTimer);
        _urlDebounceTimer = setTimeout(function () {
            try {
                const params = new URLSearchParams();
                params.set('weup_p', elements.p.i.value);
                params.set('weup_m', elements.m.i.value);
                params.set('weup_r', elements.r.i.value);
                params.set('weup_y', elements.y.i.value);
                window.history.replaceState({}, '', '?' + params.toString());
            } catch (e) {
                console.warn('URL state update blocked by environment security settings.');
            }
        }, 300);
    }

    function printReport() {
        const btn = document.querySelector('button[onclick="WEUP_Calculator.printReport()"]');

        function setLoading(loading) {
            if (!btn) return;
            if (loading) {
                btn.setAttribute('data-original-html', btn.innerHTML);
                btn.innerHTML = '<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Generating PDF\u2026';
                btn.disabled = true;
            } else {
                const orig = btn.getAttribute('data-original-html');
                if (orig) btn.innerHTML = orig;
                btn.disabled = false;
            }
        }

        function buildPDF() {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

                const PAGE_W = 210;
                const PAGE_H = 297;
                const MARGIN = 14;
                const COL_W = PAGE_W - MARGIN * 2;

                const EMERALD = [5, 150, 105];
                const SLATE = [51, 65, 85];
                const AMBER = [217, 119, 6];
                const WHITE = [255, 255, 255];
                const SLATE_LT = [241, 245, 249];
                const SLATE_BD = [203, 213, 225];

                let y = 0;

                function checkPageBreak(needed) {
                    if (y + needed > PAGE_H - 16) {
                        doc.addPage();
                        y = MARGIN;
                    }
                }

                // ── HEADER ──────────────────────────────────────────────────────────
                doc.setFillColor(...EMERALD);
                doc.rect(0, 0, PAGE_W, 28, 'F');

                doc.setTextColor(...WHITE);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.text('WealthEngine Ultra Pro \u2014 Financial Projection Report', MARGIN, 11);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                doc.text('Generated: ' + dateStr + ' at ' + timeStr, MARGIN, 18);
                doc.text('Source: ' + window.location.href, MARGIN, 23);

                y = 34;

                // ── INPUTS SUMMARY ──────────────────────────────────────────────────
                doc.setFillColor(...SLATE_LT);
                doc.roundedRect(MARGIN, y, COL_W, 38, 3, 3, 'F');
                doc.setDrawColor(...SLATE_BD);
                doc.setLineWidth(0.3);
                doc.roundedRect(MARGIN, y, COL_W, 38, 3, 3, 'S');

                doc.setTextColor(...EMERALD);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7.5);
                doc.text('INPUTS SUMMARY', MARGIN + 4, y + 6);

                const inputs = [
                    ['Initial Capital', '$' + (parseFloat(elements.p.i.value) || 0).toLocaleString('en-US')],
                    ['Monthly Savings', '$' + (parseFloat(elements.m.i.value) || 0).toLocaleString('en-US')],
                    ['Expected ROI', (elements.r.i.value || '0') + '%'],
                    ['Years Horizon', (elements.y.i.value || '0') + ' yrs'],
                    ['Avg. Annual Inflation', (elements.inf.value || '0') + '%'],
                    ['Capital Gains Tax', (elements.tax.value || '0') + '%'],
                    ['Yearly Savings Step-Up', (elements.step.value || '0') + '%'],
                ];

                const halfW = COL_W / 2;
                const colLeft = MARGIN + 4;
                const colRight = MARGIN + halfW + 4;
                doc.setFontSize(7);

                inputs.forEach(function (item, idx) {
                    const col = idx % 2 === 0 ? colLeft : colRight;
                    const row = Math.floor(idx / 2);
                    const rowY = y + 11 + row * 7;
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(...SLATE);
                    doc.text(item[0] + ':', col, rowY);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(...EMERALD);
                    doc.text(item[1], col + 42, rowY);
                });

                y += 44;

                // ── KEY METRICS CARDS ────────────────────────────────────────────────
                const nominalTxt = document.getElementById('weup-stat-nominal').innerText;
                const realTxt = document.getElementById('weup-stat-real').innerText;
                const fireTxt = document.getElementById('weup-stat-fire').innerText;
                const oppTxt = document.getElementById('weup-opp-cost').innerText;

                const cards = [
                    { label: 'Nominal Balance', value: nominalTxt, color: EMERALD },
                    { label: 'Real Wealth (Today\u2019s $)', value: realTxt, color: AMBER },
                    { label: 'Est. FIRE Age', value: fireTxt, color: [99, 102, 241] },
                    { label: 'Opportunity Cost', value: oppTxt, color: [239, 68, 68] },
                ];

                const cardW = (COL_W - 6) / 4;
                cards.forEach(function (card, i) {
                    const cx = MARGIN + i * (cardW + 2);
                    doc.setFillColor(...WHITE);
                    doc.setDrawColor(...SLATE_BD);
                    doc.setLineWidth(0.3);
                    doc.roundedRect(cx, y, cardW, 22, 2, 2, 'FD');

                    doc.setFillColor(...card.color);
                    doc.rect(cx, y + 20, cardW, 2, 'F');

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6.5);
                    doc.setTextColor(...SLATE);
                    doc.text(card.label, cx + cardW / 2, y + 7, { align: 'center' });

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(...card.color);
                    doc.text(card.value, cx + cardW / 2, y + 15, { align: 'center' });
                });

                y += 28;

                // ── CHART IMAGE ──────────────────────────────────────────────────────
                const chartCanvas = document.getElementById('weup-mainChart');
                if (chartCanvas) {
                    try {
                        const imgData = chartCanvas.toDataURL('image/png');
                        const chartH = 58;
                        checkPageBreak(chartH + 10);

                        doc.setFillColor(...EMERALD);
                        doc.setFontSize(7.5);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(...EMERALD);
                        doc.text('GROWTH CHART', MARGIN, y + 5);
                        y += 8;

                        doc.setDrawColor(...SLATE_BD);
                        doc.setLineWidth(0.3);
                        doc.roundedRect(MARGIN, y, COL_W, chartH, 2, 2, 'S');
                        doc.addImage(imgData, 'PNG', MARGIN + 1, y + 1, COL_W - 2, chartH - 2);
                        y += chartH + 6;
                    } catch (chartErr) {
                        console.warn('WEUP: chart export skipped', chartErr);
                    }
                }

                // ── FIRE ANALYSIS ────────────────────────────────────────────────────
                checkPageBreak(36);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7.5);
                doc.setTextColor(...EMERALD);
                doc.text('FIRE ANALYSIS', MARGIN, y + 5);
                y += 8;

                const fireTextEl = document.getElementById('weup-fire-text');
                const fireIncomeEl = document.getElementById('weup-fire-income');
                const fireBodyText = fireTextEl ? fireTextEl.innerText : '';
                const fireIncome = fireIncomeEl ? fireIncomeEl.innerText : '';

                const halfFire = (COL_W - 3) / 2;

                doc.setFillColor(...SLATE_LT);
                doc.setDrawColor(...SLATE_BD);
                doc.setLineWidth(0.3);
                doc.roundedRect(MARGIN, y, halfFire, 28, 2, 2, 'FD');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.5);
                doc.setTextColor(...SLATE);
                doc.text('FIRE ROADMAP', MARGIN + 3, y + 6);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.5);
                const wrapped = doc.splitTextToSize(fireBodyText, halfFire - 6);
                doc.text(wrapped.slice(0, 3), MARGIN + 3, y + 12);

                const rightFX = MARGIN + halfFire + 3;
                doc.setFillColor(236, 253, 245);
                doc.setDrawColor(167, 243, 208);
                doc.roundedRect(rightFX, y, halfFire, 28, 2, 2, 'FD');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.5);
                doc.setTextColor(...EMERALD);
                doc.text('MONTHLY PASSIVE INCOME (SAFE RATE)', rightFX + 3, y + 6);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.setTextColor(...EMERALD);
                doc.text(fireIncome, rightFX + halfFire / 2, y + 20, { align: 'center' });

                y += 34;

                // ── YEAR-BY-YEAR LEDGER ──────────────────────────────────────────────
                checkPageBreak(20);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7.5);
                doc.setTextColor(...EMERALD);
                doc.text('YEAR-BY-YEAR LEDGER', MARGIN, y + 5);
                y += 8;

                const tableRows = document.querySelectorAll('#weup-table-body tr');
                const tableData = [];
                tableRows.forEach(function (row) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 6) {
                        tableData.push([
                            cells[0].innerText,
                            cells[1].innerText,
                            cells[2].innerText,
                            cells[3].innerText,
                            cells[4].innerText,
                            cells[5].innerText,
                        ]);
                    }
                });

                doc.autoTable({
                    startY: y,
                    head: [['Year', 'Annual Savings', 'Interest Earned', 'Taxes', 'Nominal Balance', 'Real Value']],
                    body: tableData,
                    margin: { left: MARGIN, right: MARGIN },
                    styles: {
                        fontSize: 6.5,
                        cellPadding: 2,
                        font: 'helvetica',
                        textColor: SLATE,
                        lineColor: SLATE_BD,
                        lineWidth: 0.2,
                    },
                    headStyles: {
                        fillColor: EMERALD,
                        textColor: WHITE,
                        fontStyle: 'bold',
                        fontSize: 6.5,
                    },
                    alternateRowStyles: { fillColor: SLATE_LT },
                    columnStyles: {
                        0: { fontStyle: 'bold', halign: 'center' },
                        4: { fontStyle: 'bold', textColor: SLATE },
                        5: { fontStyle: 'bold', textColor: AMBER },
                    },
                });

                y = doc.lastAutoTable.finalY + 8;

                // ── FOOTER ───────────────────────────────────────────────────────────
                const totalPages = doc.internal.getNumberOfPages();
                for (let pg = 1; pg <= totalPages; pg++) {
                    doc.setPage(pg);
                    const footerY = PAGE_H - 8;
                    doc.setDrawColor(...SLATE_BD);
                    doc.setLineWidth(0.3);
                    doc.line(MARGIN, footerY - 3, PAGE_W - MARGIN, footerY - 3);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        'This report is for educational purposes only. Not financial advice. Generated by WealthEngine Ultra Pro.',
                        PAGE_W / 2, footerY, { align: 'center' }
                    );
                    doc.text('Page ' + pg + ' of ' + totalPages, PAGE_W - MARGIN, footerY, { align: 'right' });
                }

                // ── SAVE ─────────────────────────────────────────────────────────────
                const fileName = 'WealthEngine-Report-' + now.toISOString().slice(0, 10) + '.pdf';
                doc.save(fileName);

            } catch (err) {
                console.error('WEUP PDF generation failed:', err);
                window.print();
            } finally {
                setLoading(false);
            }
        }

        function loadScript(src, onLoad) {
            const s = document.createElement('script');
            s.src = src;
            s.onload = onLoad;
            s.onerror = function () {
                console.error('WEUP: failed to load', src);
                setLoading(false);
                window.print();
            };
            document.head.appendChild(s);
        }

        setLoading(true);

        setTimeout(function () {
            if (window.jspdf && window.jspdf.jsPDF) {
                buildPDF();
                return;
            }

            loadScript(
                'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
                function () {
                    if (window.jspdf && window.jspdf.jsPDF && typeof window.jspdf.jsPDF.prototype.autoTable === 'function') {
                        buildPDF();
                        return;
                    }
                    loadScript(
                        'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
                        buildPDF
                    );
                }
            );
        }, 120);
    }

    // Slider fill — updates the track gradient so the left portion appears amber
    function updateSliderFill(el) {
        const min = parseFloat(el.min) || 0;
        const max = parseFloat(el.max) || 100;
        const val = parseFloat(el.value) || 0;
        const pct = ((val - min) / (max - min)) * 100;
        el.style.background =
            'linear-gradient(to right, #f59e0b 0%, #d97706 ' + pct + '%, #e2e8f0 ' + pct + '%, #cbd5e1 100%)';
    }

    function updateAllSliderFills() {
        [elements.p.s, elements.m.s, elements.r.s, elements.y.s, elements.inf, elements.tax, elements.step].forEach(updateSliderFill);
    }

    // Initialization
    function init() {
        const urlParams = new URLSearchParams(window.location.search);

        // Check for both weup_ and legacy p, m, r, y parameters
        elements.p.i.value = urlParams.get('weup_p') || urlParams.get('p') || elements.p.i.value || 50000;
        elements.m.i.value = urlParams.get('weup_m') || urlParams.get('m') || elements.m.i.value || 1000;
        elements.r.i.value = urlParams.get('weup_r') || urlParams.get('r') || elements.r.i.value || 8;
        elements.y.i.value = urlParams.get('weup_y') || urlParams.get('y') || elements.y.i.value || 25;

        // Sync sliders
        elements.p.s.value = elements.p.i.value;
        elements.m.s.value = elements.m.i.value;
        elements.r.s.value = elements.r.i.value;
        elements.y.s.value = elements.y.i.value;

        initChart();
        calculate();
        updateAllSliderFills();

        // Listeners
        [elements.p.i, elements.p.s, elements.m.i, elements.m.s, elements.r.i, elements.r.s, elements.y.i, elements.y.s, elements.inf, elements.tax, elements.step].forEach(el => {
            el.addEventListener('input', (e) => {
                if (e.target.id === 'weup-in-p') elements.p.s.value = e.target.value;
                if (e.target.id === 'weup-sl-p') elements.p.i.value = e.target.value;
                if (e.target.id === 'weup-in-m') elements.m.s.value = e.target.value;
                if (e.target.id === 'weup-sl-m') elements.m.i.value = e.target.value;
                if (e.target.id === 'weup-in-r') elements.r.s.value = e.target.value;
                if (e.target.id === 'weup-sl-r') elements.r.i.value = e.target.value;
                if (e.target.id === 'weup-in-y') elements.y.s.value = e.target.value;
                if (e.target.id === 'weup-sl-y') elements.y.i.value = e.target.value;
                calculate();
                updateAllSliderFills();
            });
        });
    }

    // Public API
    return {
        calculate: calculate,
        initChart: initChart,
        switchTab: switchTab,
        toggleAdv: toggleAdv,
        updateURL: updateURL,
        printReport: printReport,
        init: init
    };

})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', WEUP_Calculator.init);
} else {
    WEUP_Calculator.init();
}
