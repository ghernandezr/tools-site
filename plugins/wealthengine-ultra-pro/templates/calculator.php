<?php
/**
 * Template: WealthEngine Ultra Pro Calculator
 *
 * Rendered by [wealthengine_calculator] shortcode.
 * Available variables (set by WEUP_Shortcodes::render_calculator):
 *   $defaults['principal'] - pre-filled initial capital
 *   $defaults['monthly']   - pre-filled monthly savings
 *   $defaults['rate']      - pre-filled expected ROI %
 *   $defaults['years']     - pre-filled years horizon
 *   $defaults['inflation'] - pre-filled annual inflation %
 *   $defaults['tax']       - pre-filled capital gains tax %
 *   $defaults['stepup']    - pre-filled yearly savings increase %
 *
 * All output is escaped. No raw user data is ever printed without esc_attr().
 */

defined( 'ABSPATH' ) || exit;
?>

<div class="weup-calculator" id="weup-calculator" role="main">

    <div class="max-w-7xl mx-auto">
        <header class="mb-6 flex flex-col md-flex-row justify-between items-start md-items-center gap-4 no-print">
            <div>
                <h1 class="text-3xl font-black tracking-tight text-slate-900">WealthEngine <span class="text-emerald-600">Ultra Pro</span></h1>
                <p class="text-slate-500 text-sm font-medium">Enterprise-grade Financial Projection Terminal</p>
            </div>
            <div class="flex gap-2">
                <button onclick="WEUP_Calculator.printReport()" class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover-bg-slate-50 transition flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Export Report
                </button>
            </div>
        </header>

        <div class="grid grid-cols-1 lg-grid-cols-12 gap-6">
            
            <aside class="lg-col-span-4 space-y-4 no-print">
                <div class="bg-white rounded-2rem p-6 shadow-sm border border-slate-200">
                    <h2 class="text-10px font-black text-slate-400 uppercase tracking-0-2em mb-6">Core Inputs</h2>
                    
                    <div class="space-y-6">
                        <!-- Principal -->
                        <div class="group">
                            <div class="flex justify-between mb-2">
                                <label for="weup-in-p" class="text-xs font-bold text-slate-700 uppercase">Initial Capital</label>
                                <input id="weup-in-p" type="number" class="w-24 text-right font-bold text-emerald-600 bg-transparent border-b border-transparent focus:border-emerald-500 outline-none" value="<?php echo esc_attr( $defaults['principal'] ?: '50000' ); ?>">
                            </div>
                            <input id="weup-sl-p" type="range" min="0" max="500000" step="5000" aria-label="Initial capital amount" class="w-full custom-slider">
                        </div>

                        <!-- Monthly -->
                        <div>
                            <div class="flex justify-between mb-2">
                                <label for="weup-in-m" class="text-xs font-bold text-slate-700 uppercase">Monthly Savings</label>
                                <input id="weup-in-m" type="number" class="w-24 text-right font-bold text-emerald-600 bg-transparent border-b border-transparent focus:border-emerald-500 outline-none" value="<?php echo esc_attr( $defaults['monthly'] ?: '1000' ); ?>">
                            </div>
                            <input id="weup-sl-m" type="range" min="0" max="10000" step="100" aria-label="Monthly savings amount" class="w-full custom-slider">
                        </div>

                        <!-- Rate & Years -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="weup-in-r" class="text-10px font-bold text-slate-400 uppercase block mb-1">Expected ROI %</label>
                                <input id="weup-in-r" type="number" step="0.1" class="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold" value="<?php echo esc_attr( $defaults['rate'] ?: '8' ); ?>">
                            </div>
                            <div>
                                <label for="weup-in-y" class="text-10px font-bold text-slate-400 uppercase block mb-1">Years Horizon</label>
                                <input id="weup-in-y" type="number" class="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold" value="<?php echo esc_attr( $defaults['years'] ?: '25' ); ?>">
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-slate-100">
                        <button onclick="WEUP_Calculator.toggleAdv()" class="flex items-center justify-between w-full text-10px font-black text-slate-400 uppercase tracking-widest group">
                            Advanced Strategies
                            <svg id="weup-adv-icon" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        
                        <div id="weup-adv-panel" class="hidden mt-6 space-y-6 animate-in slide-in-from-top duration-300">
                            <!-- Inflation -->
                            <div>
                                <div class="flex justify-between text-10px mb-1">
                                    <span class="font-bold text-slate-500 uppercase">Avg. Annual Inflation %</span>
                                    <span id="weup-val-inf" class="font-black text-amber-600">2.5%</span>
                                </div>
                                <input id="weup-sl-inf" type="range" min="0" max="10" step="0.1" value="<?php echo esc_attr( $defaults['inflation'] ?: '2.5' ); ?>" aria-label="Average annual inflation percentage" class="w-full custom-slider">
                            </div>

                            <!-- Taxes -->
                            <div>
                                <div class="flex justify-between text-10px mb-1">
                                    <span class="font-bold text-slate-500 uppercase">Capital Gains Tax %</span>
                                    <span id="weup-val-tax" class="font-black text-red-600">15%</span>
                                </div>
                                <input id="weup-sl-tax" type="range" min="0" max="50" step="1" value="<?php echo esc_attr( $defaults['tax'] ?: '15' ); ?>" aria-label="Capital gains tax percentage" class="w-full custom-slider">
                            </div>

                            <!-- Step-up -->
                            <div>
                                <div class="flex justify-between text-10px mb-1">
                                    <span class="font-bold text-slate-500 uppercase">Yearly Savings Increase %</span>
                                    <span id="weup-val-step" class="font-black text-blue-600">3%</span>
                                </div>
                                <input id="weup-sl-step" type="range" min="0" max="20" step="1" value="<?php echo esc_attr( $defaults['stepup'] ?: '3' ); ?>" aria-label="Yearly savings increase percentage" class="w-full custom-slider">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative group">
                    <div class="absolute right-neg-4 top-neg-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover-bg-emerald-500-20 transition-all"></div>
                    <h3 class="text-emerald-400 text-10px font-black uppercase tracking-widest mb-2">Opportunity Cost</h3>
                    <p class="text-xs text-slate-400 leading-relaxed">Starting just <span class="text-white font-bold">1 year later</span> could cost you approximately:</p>
                    <p id="weup-opp-cost" class="text-2xl font-black mt-2 text-white">-$0</p>
                </div>
            </aside>

            <main class="lg-col-span-8 space-y-6">
                
                <!-- Summary Stats -->
                <div class="grid grid-cols-1 md-grid-cols-3 gap-4">
                    <div class="bg-white p-3 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <p class="text-10px font-bold text-slate-400 uppercase mb-1">Nominal Balance</p>
                        <h4 id="weup-stat-nominal" class="text-lg font-black text-slate-900">$0</h4>
                        <div class="absolute bottom-0 left-0 h-1 bg-emerald-500 w-full opacity-20"></div>
                    </div>
                    <div class="bg-white p-3 rounded-3xl border border-slate-200 shadow-sm">
                        <p class="text-10px font-bold text-slate-400 uppercase mb-1">Real Wealth <span class="text-8px opacity-60">(Today's $)</span></p>
                        <h4 id="weup-stat-real" class="text-lg font-black text-amber-600">$0</h4>
                    </div>
                    <div class="bg-white p-3 rounded-3xl border border-slate-200 shadow-sm">
                        <div class="flex items-center gap-1 mb-1">
                            <p class="text-10px font-bold text-slate-400 uppercase">Est. FIRE Age</p>
                            <div class="relative group cursor-help inline-flex items-center" tabindex="0" role="button" aria-label="FIRE calculation information">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                                    <p class="font-bold mb-1 text-emerald-400">FIRE = Financial Independence, Retire Early</p>
                                    <p class="text-slate-300 leading-relaxed">Age when you can retire using the 4% rule (25x annual expenses of $40K). Assumes starting at age 30.</p>
                                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                            </div>
                        </div>
                        <h4 id="weup-stat-fire" class="text-lg font-black text-indigo-600">--</h4>
                    </div>
                </div>

                <div class="bg-white rounded-2-5rem p-6 md-p-8 border border-slate-200 shadow-sm">
                    <div class="flex flex-wrap items-center justify-between gap-4 mb-8 no-print">
                        <div class="flex p-1.5 rounded-2xl">
                            <button onclick="WEUP_Calculator.switchTab('chart')" id="weup-tab-chart" class="px-6 py-2 rounded-xl text-xs font-bold transition-all tab-active">Growth Curve</button>
                            <button onclick="WEUP_Calculator.switchTab('fire')" id="weup-tab-fire" class="px-6 py-2 rounded-xl text-xs font-bold transition-all text-slate-500">FIRE Analysis</button>
                            <button onclick="WEUP_Calculator.switchTab('table')" id="weup-tab-table" class="px-6 py-2 rounded-xl text-xs font-bold transition-all text-slate-500">Yearly Ledger</button>
                        </div>
                        <div class="flex gap-4">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" id="weup-check-vol" class="hidden" onchange="WEUP_Calculator.calculate()">
                                <div id="weup-vol-box" class="w-4 h-4 rounded border-2 border-slate-300 transition-colors flex items-center justify-center">
                                    <div class="w-2 h-2 bg-emerald-500 rounded-sm scale-0 transition-transform"></div>
                                </div>
                                <span class="text-10px font-black text-slate-400 uppercase tracking-tighter group-hover-text-slate-600">Market Volatility Overlay</span>
                            </label>
                        </div>
                    </div>

                    <!-- View: Chart -->
                    <div id="weup-view-chart" class="h-400px w-full relative">
                        <canvas id="weup-mainChart" role="img" aria-label="Investment growth projection chart showing nominal balance and real purchasing power over time"></canvas>
                    </div>

                    <!-- View: FIRE Analysis -->
                    <div id="weup-view-fire" class="hidden space-y-8 py-4">
                        <div class="grid grid-cols-1 md-grid-cols-2 gap-8">
                            <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h5 class="font-black text-xs uppercase text-slate-400 mb-4 tracking-widest">FIRE Roadmap</h5>
                                <p id="weup-fire-text" class="text-sm font-medium leading-relaxed text-slate-600">---</p>
                            </div>
                            <div class="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                                <h5 class="font-black text-xs uppercase text-emerald-600 mb-4 tracking-widest">Passive Income Potential</h5>
                                <p class="text-10px text-emerald-600/60 font-bold uppercase mb-1">Monthly Withdrawal (Safe Rate)</p>
                                <h6 id="weup-fire-income" class="text-xl font-black text-emerald-700">$0</h6>
                            </div>
                        </div>
                    </div>

                    <!-- View: Table -->
                    <div id="weup-view-table" class="hidden h-400px overflow-auto rounded-2xl hide-scrollbar">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead class="bg-slate-50">
                                <tr class="text-10px font-black text-slate-400 uppercase tracking-widest">
                                    <th class="p-4">Year</th>
                                    <th class="p-4">Savings</th>
                                    <th class="p-4">Int. Earned</th>
                                    <th class="p-4">Taxes (Est)</th>
                                    <th class="p-4 text-emerald-600">Nominal Balance</th>
                                    <th class="p-4 text-amber-600">Real Value</th>
                                </tr>
                            </thead>
                            <tbody id="weup-table-body" class="divide-y divide-slate-100 font-medium text-slate-600"></tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    </div>

</div>
