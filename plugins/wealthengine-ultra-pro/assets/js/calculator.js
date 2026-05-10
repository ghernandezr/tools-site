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
        r: document.getElementById('weup-in-r'),
        y: document.getElementById('weup-in-y'),
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
        const rawROI = parseFloat(elements.r.value) || 0;
        const clampedROI = Math.min(Math.max(rawROI, 0), 200);
        if (rawROI !== clampedROI) {
            elements.r.value = clampedROI;
        }
        const ROI = clampedROI / 100;
        const years = parseInt(elements.y.value) || 0;
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
                params.set('weup_r', elements.r.value);
                params.set('weup_y', elements.y.value);
                window.history.replaceState({}, '', '?' + params.toString());
            } catch (e) {
                console.warn('URL state update blocked by environment security settings.');
            }
        }, 300);
    }

    function printReport() {
        // CSS @media print already hides .no-print elements and sets background to white.
        // Using window.print() directly avoids destroying host page event listeners.
        window.print();
    }

    // Initialization
    function init() {
        const urlParams = new URLSearchParams(window.location.search);

        // Check for both weup_ and legacy p, m, r, y parameters
        elements.p.i.value = urlParams.get('weup_p') || urlParams.get('p') || elements.p.i.value || 50000;
        elements.m.i.value = urlParams.get('weup_m') || urlParams.get('m') || elements.m.i.value || 1000;
        elements.r.value = urlParams.get('weup_r') || urlParams.get('r') || elements.r.value || 8;
        elements.y.value = urlParams.get('weup_y') || urlParams.get('y') || elements.y.value || 25;

        // Sync sliders
        elements.p.s.value = elements.p.i.value;
        elements.m.s.value = elements.m.i.value;

        initChart();
        calculate();

        // Listeners
        [elements.p.i, elements.p.s, elements.m.i, elements.m.s, elements.r, elements.y, elements.inf, elements.tax, elements.step].forEach(el => {
            el.addEventListener('input', (e) => {
                if (e.target.id === 'weup-in-p') elements.p.s.value = e.target.value;
                if (e.target.id === 'weup-sl-p') elements.p.i.value = e.target.value;
                if (e.target.id === 'weup-in-m') elements.m.s.value = e.target.value;
                if (e.target.id === 'weup-sl-m') elements.m.i.value = e.target.value;
                calculate();
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
