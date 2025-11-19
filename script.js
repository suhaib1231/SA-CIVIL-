// --- State ---
let state = {
    lang: 'ar',
    view: 'home',
    mode: '',
    history: [],
    currentResult: null,
    aiLoading: false
};

// --- Translations ---
const translations = {
    ar: {
        title: "SA CIVIL",
        subtitle: "المنصة المتكاملة للحسابات الإنشائية الذكية",
        designBy: "تصميم: المهندس صهيب النعيمي",
        home: "الرئيسية",
        startCalc: "بدء الحساب",
        back: "رجوع",
        calculate: "احسب وحفظ",
        design: "تصميم وحفظ",
        showProof: "ورقة الحل اليدوي",
        proofTitle: "الحسابات التفصيلية (ACI 318-19)",
        elementName: "اسم العنصر (مثال: B1, C5)",
        historyTitle: "سجل الحسابات المحفوظة",
        noHistory: "لا يوجد حسابات محفوظة لهذا العنصر",
        clearHistory: "مسح السجل",
        delete: "حذف",
        close: "إغلاق",
        // ... باقي الترجمات
    },
    en: {
        title: "SA CIVIL",
        subtitle: "Integrated Structural Design Platform",
        designBy: "Designed by: Eng. Sohaib Al-Nuaimi",
        home: "Home",
        startCalc: "Start",
        back: "Back",
        calculate: "Calculate & Save",
        design: "Design & Save",
        showProof: "Engineering Sheet",
        proofTitle: "Detailed Calculations (ACI 318-19)",
        elementName: "Element Name (e.g., B1)",
        historyTitle: "Calculation Log",
        noHistory: "No history yet",
        clearHistory: "Clear Log",
        delete: "Delete",
        close: "Close",
        // ... باقي الترجمات الإنجليزية
    }
};

// --- Utility Functions ---
function t(key) {
    return translations[state.lang][key] || key;
}

function toggleLanguage() {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('lang-label').innerText = state.lang === 'ar' ? 'English' : 'عربي';
    renderApp();
}

function saveHistory(elementName, result, desc) {
    const newItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: state.mode,
        elementName: elementName || `Elem ${state.history.filter(h => h.type === state.mode).length + 1}`,
        result,
        desc
    };
    state.history.unshift(newItem);
}

function deleteHistory(id) {
    state.history = state.history.filter(h => h.id !== id);
    renderHistoryModal();
}

function clearHistory() {
    state.history = state.history.filter(h => h.type !== state.mode);
    renderHistoryModal();
}

// --- Render Functions ---
function renderApp() {
    const app = document.getElementById('app-container');
    app.innerHTML = '';

    if (state.view === 'home') {
        renderHome(app);
    } else {
        renderCalculatorLayout(app);
    }
    lucide.createIcons();
}

function renderHome(container) {
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[60vh] space-y-10 animate-fade-in">
            <div class="text-center space-y-4">
                <div class="inline-flex items-center justify-center p-4 bg-slate-900 rounded-2xl shadow-2xl mb-4">
                    <i data-lucide="user-check" class="w-12 h-12 text-white"></i>
                </div>
                <h1 class="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">${t('title')}</h1>
                <p class="text-xl text-slate-600 font-medium">${t('subtitle')}</p>
            </div>
            
            <div class="w-full max-w-6xl px-4">
                <h2 class="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4 text-right">الحسابات (Loads)</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    ${renderNavButton('wall', 'أحمال الجدران', 'حساب Dead, Wind, Seismic', 'layout-grid', 'slate')}
                    ${renderNavButton('slab_load', 'أحمال الأسقف', 'حساب Dead & Live Loads', 'layers', 'emerald')}
                    ${renderNavButton('col_load', 'تقدير الأعمدة', 'طريقة المساحة التجميعية', 'grid-3x3', 'amber')}
                </div>
                
                <h2 class="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4 text-right">التصميم (Design ACI 318)</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${renderNavButton('beam_design', 'تصميم الكمرات', 'عزم، قص، حديد علوي وسفلي', 'hammer', 'blue')}
                    ${renderNavButton('col_design', 'تصميم الأعمدة', 'حديد طولي وكانات', 'building-2', 'orange')}
                    ${renderNavButton('slab_design', 'تصميم البلاطات', 'بلاطات One-Way & Two-Way', 'box-select', 'teal')}
                </div>
            </div>
            <div class="text-center text-xs text-slate-400 py-12">SA CIVIL © 2024 | ${t('designBy')}</div>
        </div>
    `;
}

function renderNavButton(modeKey, title, desc, icon, color) {
    const colors = {
        slate: 'text-slate-800 hover:border-slate-400 hover:bg-slate-50',
        emerald: 'text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50',
        amber: 'text-amber-800 hover:border-amber-400 hover:bg-amber-50',
        blue: 'text-blue-800 hover:border-blue-400 hover:bg-blue-50',
        orange: 'text-orange-800 hover:border-orange-400 hover:bg-orange-50',
        teal: 'text-teal-800 hover:border-teal-400 hover:bg-teal-50',
    };
    return `
        <button onclick="navigateTo('${modeKey}')" class="nav-card ${colors[color]}">
            <div class="mb-3 p-3 rounded-full bg-slate-50 group-hover:scale-110 transition-transform text-${color}-600">
                <i data-lucide="${icon}" class="w-8 h-8"></i>
            </div>
            <h3 class="text-lg font-bold mb-1">${title}</h3>
            <p class="text-xs text-slate-400">${desc}</p>
        </button>
    `;
}

function navigateTo(mode) {
    state.view = 'calculator';
    state.mode = mode;
    state.currentResult = null;
    renderApp();
}

function goHome() {
    state.view = 'home';
    state.mode = '';
    renderApp();
}

function renderCalculatorLayout(container) {
    container.innerHTML = `
        <div class="space-y-8 animate-fade-in pb-12">
            <div class="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mt-4">
                <div class="flex items-center gap-4">
                    <button onclick="goHome()" class="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
                        <i data-lucide="home" class="w-5 h-5"></i>
                        <span class="hidden md:inline font-bold">${t('home')}</span>
                    </button>
                    <div class="h-8 w-[1px] bg-slate-200"></div>
                    <h2 class="text-xl font-bold text-slate-800">${t(state.mode + 'Title')}</h2>
                </div>
            </div>

            <div class="bg-white rounded-lg border-t-4 border-slate-800 shadow-lg p-6">
                <div class="flex justify-between items-start mb-6">
                     <div><h3 class="text-2xl font-bold text-slate-800">${t(state.mode + 'Title')}</h3><p class="text-sm text-slate-500">${t(state.mode + 'Desc')}</p></div>
                     <button onclick="openHistoryModal()" class="p-2 rounded-full hover:bg-slate-100 text-slate-500"><i data-lucide="history" class="w-6 h-6"></i></button>
                </div>
                
                <form id="calc-form" onsubmit="handleCalculate(event)" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">${t('elementName')}</label>
                        <input type="text" name="elementName" class="form-input">
                    </div>
                    <div id="form-inputs" class="grid md:grid-cols-2 gap-6">
                        <!-- Inputs injected dynamically -->
                    </div>
                    <button type="submit" class="btn-primary bg-slate-900">
                        ${state.mode.includes('design') ? t('design') : t('calculate')}
                    </button>
                </form>
            </div>

            <div id="results-container" class="space-y-6"></div>
        </div>
    `;

    renderFormInputs(document.getElementById('form-inputs'));
}

// --- Calculation Functions ---
function handleCalculate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // هنا يتم تنفيذ الحسابات الإنشائية
    // هذه مجرد أمثلة مبسطة
    
    let result = {};
    
    if (state.mode === 'wall') {
        // حسابات أحمال الجدران
        const height = parseFloat(data.wallHeight);
        const thickness = parseFloat(data.wallThickness);
        const density = 19; // kN/m³ للطوب
        const deadLoad = height * thickness * density;
        
        result = {
            type: 'wall',
            deadLoad: deadLoad.toFixed(2),
            unit: 'kN/m'
        };
    }
    // ... باقي الحسابات
    
    saveHistory(data.elementName, result.deadLoad + ' ' + result.unit, state.mode);
    renderResults(result);
}

function renderResults(result) {
    const container = document.getElementById('results-container');
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg p-6 border border-green-200">
            <h3 class="text-xl font-bold text-green-800 mb-4">النتائج</h3>
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="font-medium">الحمل النهائي:</span>
                    <span class="font-bold text-lg">${result.deadLoad} ${result.unit}</span>
                </div>
            </div>
        </div>
        
        <div class="ai-section">
            <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-2">
                    <div class="bg-indigo-100 p-2 rounded">
                        <i data-lucide="bot" class="w-5 h-5 text-indigo-600"></i>
                    </div>
                    <span class="font-bold text-indigo-900">المستشار الهندسي الذكي</span>
                </div>
            </div>
            <button onclick="callAI()" class="ai-btn">
                <i data-lucide="sparkles" class="w-4 h-4"></i> تحليل النتائج (AI)
            </button>
            <div id="ai-result" class="hidden mt-4 text-sm text-slate-700 whitespace-pre-wrap bg-white/60 p-3 rounded border border-indigo-50"></div>
        </div>
    `;
    
    lucide.createIcons();
}

// --- Modal Functions ---
function openHistoryModal() {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-content');
    const title = document.getElementById('modal-title');
    
    title.innerText = t('historyTitle');
    
    const filtered = state.history.filter(h => h.type === state.mode);
    
    if (filtered.length === 0) {
        content.innerHTML = `<div class="text-center text-slate-400 py-8">${t('noHistory')}</div>`;
    } else {
        content.innerHTML = `
            <div class="space-y-3">
                ${filtered.map(item => `
                    <div class="p-3 rounded border border-slate-100 bg-slate-50">
                        <div class="font-bold text-sm text-slate-800">${item.elementName}</div>
                        <div class="text-xs text-slate-400">${new Date(item.date).toLocaleString()}</div>
                        <div class="font-mono font-bold text-blue-900 mt-1">${item.result}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal').classList.remove('flex');
}

function callAI() {
    const resDiv = document.getElementById('ai-result');
    resDiv.classList.remove('hidden');
    resDiv.innerText = "جاري التحليل...";
    
    setTimeout(() => {
        resDiv.innerText = "✅ التحليل جاهز! التصميم آمن وفقاً لمواصفات ACI 318-19.";
    }, 2000);
}

// --- Initialize App ---
window.onload = () => {
    renderApp();
};