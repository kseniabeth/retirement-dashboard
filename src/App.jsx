import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Settings, Info, Calendar, DollarSign, TrendingUp, Users, Plus, Trash2, Home, Baby, Coffee, Car, HeartPulse, Smile, Briefcase, Umbrella, Wallet, Shield, Download, Save, Upload, Target, Activity, ChevronRight, ChevronDown, Menu, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatCurrency = (num) => {
  const isNegative = num < 0;
  const formatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  }).format(Math.abs(num));
  return isNegative ? `-${formatted}` : formatted;
};

const InputGroup = ({ label, children, icon: Icon, description }) => (
  <div className="mb-4">
    <div className="flex items-center space-x-1.5 mb-1.5">
      {Icon && <Icon className="w-4 h-4 text-slate-500" />}
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
    </div>
    {children}
    {description && <p className="text-xs text-slate-500 mt-1 leading-snug">{description}</p>}
  </div>
);

// Currency Input Component for Assumptions UI
const CurrencyInput = ({ value, onChange, className, placeholder }) => {
  const formatStr = (val) => {
    if (val === undefined || val === null || val === '' || val === 0) return '';
    const isNeg = val < 0;
    const numStr = Math.abs(val).toLocaleString('en-US');
    return isNeg ? `-$${numStr}` : `$${numStr}`;
  };

  const [localVal, setLocalVal] = useState(() => formatStr(value));
  const ref = useRef(null);

  useEffect(() => {
    if (document.activeElement !== ref.current) {
      setLocalVal(formatStr(value));
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setLocalVal(raw);
    if (raw === '') {
      onChange('');
      return;
    }
    const parsed = raw.replace(/[^0-9.-]+/g, '');
    if (parsed !== '' && parsed !== '-') {
      const num = Number(parsed);
      if (!isNaN(num)) onChange(num);
    }
  };

  const handleBlur = () => {
    if (localVal === '') {
      onChange('');
      return;
    }
    const parsed = localVal.replace(/[^0-9.-]+/g, '');
    let num = '';
    if (parsed !== '' && parsed !== '-') {
      num = Number(parsed);
      if (isNaN(num)) num = '';
    }
    setLocalVal(formatStr(num));
    onChange(num);
  };

  return (
    <input
      ref={ref}
      type="text"
      className={className}
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder || "$0"}
    />
  );
};

// Standard Number Input ensuring blank states pass safely
const NumberInput = ({ value, onChange, className, placeholder, step }) => (
  <input
    type="number"
    className={className}
    placeholder={placeholder || "0"}
    step={step}
    value={value}
    onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
  />
);

// Helper component for the Expanded Math Breakdown Row
const MathRow = ({ label, val, isNeg, isPos }) => {
  if (val === undefined || Math.abs(val) < 0.01) return null; 
  return (
    <div className="flex justify-between text-[11px] py-0.5">
      <span className="text-slate-500">{label}</span>
      <span className={`${isNeg ? 'text-red-600' : isPos ? 'text-green-600' : 'text-slate-800'}`}>
        {isNeg ? '-' : isPos ? '+' : ''}{formatCurrency(val)}
      </span>
    </div>
  );
};

export default function RetirementApp() {
  const fileInputRef = useRef(null);

  // --- STATE ---
  const currentYear = new Date().getFullYear();
  
  // UI Tabs & Interaction
  const [advancedMode, setAdvancedMode] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const [startYear, setStartYear] = useState(currentYear);
  const [startMonth, setStartMonth] = useState(0); 
  const [targetEndAge, setTargetEndAge] = useState(100); 
  
  // Projection Goal Modes
  const [calcMode, setCalcMode] = useState('fixed'); 
  const [swrRate, setSwrRate] = useState(4.0); 

  const [numAdults, setNumAdults] = useState(2);
  
  // Person 1 (Or Combined Household in Basic Mode)
  const [p1BirthYear, setP1BirthYear] = useState(1985); 
  const [p1BirthMonth, setP1BirthMonth] = useState(0); 
  const [p1RetirementAge, setP1RetirementAge] = useState(65); 
  const [p1SsStartAge, setP1SsStartAge] = useState(67);
  const [p1MaxSs, setP1MaxSs] = useState(2500); 

  // Person 2 (Only active in Advanced Mode)
  const [p2BirthYear, setP2BirthYear] = useState(1985); 
  const [p2BirthMonth, setP2BirthMonth] = useState(0); 
  const [p2RetirementAge, setP2RetirementAge] = useState(65); 
  const [p2SsStartAge, setP2SsStartAge] = useState(67);
  const [p2MaxSs, setP2MaxSs] = useState(2500); 
  
  // Split Net Worth and Contributions 
  const [balanceTrad, setBalanceTrad] = useState(150000);
  const [balanceRoth, setBalanceRoth] = useState(50000);
  const [balanceCash, setBalanceCash] = useState(20000);
  
  // Home Equity
  const [homeEquity, setHomeEquity] = useState(100000);
  const [annualMortgagePrincipal, setAnnualMortgagePrincipal] = useState(6000); 
  const [mortgagePayoffYear, setMortgagePayoffYear] = useState(2045);
  
  const [contribTrad, setContribTrad] = useState(12000); 
  const [contribRoth, setContribRoth] = useState(6000); 
  const [contribCash, setContribCash] = useState(0); 
  
  const [annualReturn, setAnnualReturn] = useState(5.0); 
  const [cashReturn, setCashReturn] = useState(1.5); 
  const [targetBufferYears, setTargetBufferYears] = useState(3.0); 
  const [bufferBuildYears, setBufferBuildYears] = useState(5.0); 
  
  // Transition & Tax Settings (Advanced)
  const [transitionDrop, setTransitionDrop] = useState(50);
  const [stateTaxRate, setStateTaxRate] = useState(0.0);

  // Stress Testing
  const [enableCrash, setEnableCrash] = useState(false);
  const [crashAge, setCrashAge] = useState(55); 
  const [crashPercent, setCrashPercent] = useState(30);

  const [viewMode, setViewMode] = useState('yearly'); 

  // Auto-close expanded rows when changing view or data
  useEffect(() => {
    setExpandedRow(null);
  }, [viewMode, calcMode, swrRate, startYear]);

  // --- EXPENSE BUCKETS ---
  const [expenses, setExpenses] = useState({
    housing: 24000,   
    family: 12000,     
    food: 12000,       
    transport: 6000,   
    health: 6000,      
    lifestyle: 12000   
  });

  const handleExpenseChange = (key, value) => {
    setExpenses(prev => ({ ...prev, [key]: value }));
  };

  const totalBaseAnnualExpenses = Object.values(expenses).reduce((a, b) => a + (Number(b) || 0), 0);

  // --- EXPENSE ADJUSTMENTS ---
  const [adjustments, setAdjustments] = useState([
    { id: 1, type: 'year', trigger: 2045, amount: -12000, desc: 'Mortgage Payoff' },
    { id: 2, type: 'age', trigger: 55, amount: -12000, desc: 'Childcare Ends' }
  ]);

  const addAdjustment = () => {
    setAdjustments([...adjustments, { id: Date.now(), type: 'year', trigger: currentYear + 10, amount: 0, desc: 'New Event' }]);
  };

  const updateAdjustment = (id, field, value) => {
    setAdjustments(adjustments.map(adj => adj.id === id ? { ...adj, [field]: value } : adj));
  };

  const removeAdjustment = (id) => {
    setAdjustments(adjustments.filter(adj => adj.id !== id));
  };

  // --- CLEAR DATA LOGIC ---
  const handleClearData = () => {
    setStartYear(''); setTargetEndAge('');
    
    setP1BirthYear(''); setP1RetirementAge(''); setP1SsStartAge(''); setP1MaxSs('');
    setP2BirthYear(''); setP2RetirementAge(''); setP2SsStartAge(''); setP2MaxSs('');
    
    setBalanceTrad(''); setBalanceRoth(''); setBalanceCash(''); setHomeEquity('');
    setAnnualMortgagePrincipal(''); setMortgagePayoffYear('');
    
    setContribTrad(''); setContribRoth(''); setContribCash('');
    setAnnualReturn(''); setCashReturn(''); 
    setTargetBufferYears(''); setBufferBuildYears(''); 
    setTransitionDrop(''); setStateTaxRate('');
    setCrashAge(''); setCrashPercent('');
    
    setExpenses({ housing: '', family: '', food: '', transport: '', health: '', lifestyle: '' });
    setAdjustments([]);

    // Selectors cleanly fallback to defaults instead of blank breaking them
    setStartMonth(0); setNumAdults(2); setSwrRate(4.0); setEnableCrash(false);
    
    setIsClearModalOpen(false);
  };

  // --- SETTINGS IMPORT & EXPORT ---
  const handleExportSettings = () => {
    const settings = {
      advancedMode, calcMode, swrRate, numAdults, targetEndAge,
      startYear, startMonth, 
      p1BirthYear, p1BirthMonth, p1RetirementAge, p1SsStartAge, p1MaxSs,
      p2BirthYear, p2BirthMonth, p2RetirementAge, p2SsStartAge, p2MaxSs,
      balanceTrad, balanceRoth, balanceCash, homeEquity, annualMortgagePrincipal, mortgagePayoffYear,
      contribTrad, contribRoth, contribCash, annualReturn, cashReturn, targetBufferYears, bufferBuildYears, transitionDrop, stateTaxRate,
      enableCrash, crashAge, crashPercent,
      expenses, adjustments
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'retirement_assumptions.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const loadVal = (val) => val === '' || val === null || val === undefined ? '' : Number(val);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        
        if (settings.advancedMode !== undefined) setAdvancedMode(settings.advancedMode);
        if (settings.calcMode !== undefined) setCalcMode(settings.calcMode);
        if (settings.swrRate !== undefined) setSwrRate(Number(settings.swrRate));
        if (settings.targetEndAge !== undefined) setTargetEndAge(loadVal(settings.targetEndAge));
        if (settings.startYear !== undefined) setStartYear(loadVal(settings.startYear));
        if (settings.startMonth !== undefined) setStartMonth(Number(settings.startMonth));
        if (settings.numAdults !== undefined) setNumAdults(Number(settings.numAdults));
        
        // Profiles
        if (settings.p1BirthYear !== undefined) setP1BirthYear(loadVal(settings.p1BirthYear));
        if (settings.p1BirthMonth !== undefined) setP1BirthMonth(Number(settings.p1BirthMonth));
        if (settings.p1RetirementAge !== undefined) setP1RetirementAge(loadVal(settings.p1RetirementAge));
        if (settings.p1SsStartAge !== undefined) setP1SsStartAge(loadVal(settings.p1SsStartAge));
        if (settings.p1MaxSs !== undefined) setP1MaxSs(loadVal(settings.p1MaxSs));

        if (settings.p2BirthYear !== undefined) setP2BirthYear(loadVal(settings.p2BirthYear));
        if (settings.p2BirthMonth !== undefined) setP2BirthMonth(Number(settings.p2BirthMonth));
        if (settings.p2RetirementAge !== undefined) setP2RetirementAge(loadVal(settings.p2RetirementAge));
        if (settings.p2SsStartAge !== undefined) setP2SsStartAge(loadVal(settings.p2SsStartAge));
        if (settings.p2MaxSs !== undefined) setP2MaxSs(loadVal(settings.p2MaxSs));

        // Balances
        if (settings.balanceTrad !== undefined) setBalanceTrad(loadVal(settings.balanceTrad));
        if (settings.balanceRoth !== undefined) setBalanceRoth(loadVal(settings.balanceRoth));
        if (settings.balanceCash !== undefined) setBalanceCash(loadVal(settings.balanceCash));
        if (settings.homeEquity !== undefined) setHomeEquity(loadVal(settings.homeEquity));
        if (settings.annualMortgagePrincipal !== undefined) setAnnualMortgagePrincipal(loadVal(settings.annualMortgagePrincipal));
        if (settings.mortgagePayoffYear !== undefined) setMortgagePayoffYear(loadVal(settings.mortgagePayoffYear));
        
        // Contributions & Rates
        if (settings.contribTrad !== undefined) setContribTrad(loadVal(settings.contribTrad));
        if (settings.contribRoth !== undefined) setContribRoth(loadVal(settings.contribRoth));
        if (settings.contribCash !== undefined) setContribCash(loadVal(settings.contribCash));
        if (settings.annualReturn !== undefined) setAnnualReturn(loadVal(settings.annualReturn));
        if (settings.cashReturn !== undefined) setCashReturn(loadVal(settings.cashReturn));
        if (settings.targetBufferYears !== undefined) setTargetBufferYears(loadVal(settings.targetBufferYears));
        if (settings.bufferBuildYears !== undefined) setBufferBuildYears(loadVal(settings.bufferBuildYears));
        if (settings.transitionDrop !== undefined) setTransitionDrop(loadVal(settings.transitionDrop));
        if (settings.stateTaxRate !== undefined) setStateTaxRate(loadVal(settings.stateTaxRate));
        
        if (settings.enableCrash !== undefined) setEnableCrash(settings.enableCrash);
        if (settings.crashAge !== undefined) setCrashAge(loadVal(settings.crashAge));
        if (settings.crashPercent !== undefined) setCrashPercent(loadVal(settings.crashPercent));

        if (settings.expenses !== undefined) setExpenses(settings.expenses);
        if (settings.adjustments !== undefined) setAdjustments(settings.adjustments);
      } catch (error) {
        console.error("Failed to parse settings file", error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  // --- ENGINE SAFE VARIABLES ---
  const getSafeValues = () => {
    const n_startYear = startYear === '' ? currentYear : Number(startYear);
    const n_startMonth = startMonth === '' ? 0 : Number(startMonth);
    const n_targetEndAge = targetEndAge === '' ? 100 : Number(targetEndAge);
    
    const n_p1BirthYear = p1BirthYear === '' ? n_startYear - 30 : Number(p1BirthYear);
    const n_p1BirthMonth = p1BirthMonth === '' ? 0 : Number(p1BirthMonth);
    const n_p1RetirementAge = p1RetirementAge === '' ? 65 : Number(p1RetirementAge);
    const n_p1SsStartAge = p1SsStartAge === '' ? 67 : Number(p1SsStartAge);
    const n_p1MaxSs = Number(p1MaxSs) || 0;

    const n_p2BirthYear = p2BirthYear === '' ? n_startYear - 30 : Number(p2BirthYear);
    const n_p2BirthMonth = p2BirthMonth === '' ? 0 : Number(p2BirthMonth);
    const n_p2RetirementAge = p2RetirementAge === '' ? 65 : Number(p2RetirementAge);
    const n_p2SsStartAge = p2SsStartAge === '' ? 67 : Number(p2SsStartAge);
    const n_p2MaxSs = Number(p2MaxSs) || 0;

    const n_balanceTrad = Number(balanceTrad) || 0;
    const n_balanceRoth = Number(balanceRoth) || 0;
    const n_balanceCash = Number(balanceCash) || 0;
    const n_homeEquity = Number(homeEquity) || 0;
    const n_annualMortgagePrincipal = Number(annualMortgagePrincipal) || 0;
    const n_mortgagePayoffYear = mortgagePayoffYear === '' ? n_startYear + 30 : Number(mortgagePayoffYear);

    const n_contribTrad = Number(contribTrad) || 0;
    const n_contribRoth = Number(contribRoth) || 0;
    const n_contribCash = Number(contribCash) || 0;

    const n_annualReturn = Number(annualReturn) || 0;
    const n_cashReturn = Number(cashReturn) || 0;
    const n_targetBufferYears = Number(targetBufferYears) || 0;
    const n_bufferBuildYears = Number(bufferBuildYears) || 0;
    const n_transitionDrop = Number(transitionDrop) || 0;
    const n_stateTaxRate = Number(stateTaxRate) || 0;

    const n_crashAge = crashAge === '' ? 55 : Number(crashAge);
    const n_crashPercent = Number(crashPercent) || 0;
    const n_swrRate = swrRate === '' ? 4.0 : Number(swrRate);
    
    return {
       n_startYear, n_startMonth, n_targetEndAge,
       n_p1BirthYear, n_p1BirthMonth, n_p1RetirementAge, n_p1SsStartAge, n_p1MaxSs,
       n_p2BirthYear, n_p2BirthMonth, n_p2RetirementAge, n_p2SsStartAge, n_p2MaxSs,
       n_balanceTrad, n_balanceRoth, n_balanceCash, n_homeEquity,
       n_annualMortgagePrincipal, n_mortgagePayoffYear,
       n_contribTrad, n_contribRoth, n_contribCash,
       n_annualReturn, n_cashReturn, n_targetBufferYears, n_bufferBuildYears,
       n_transitionDrop, n_stateTaxRate,
       n_crashAge, n_crashPercent, n_swrRate
    };
  }

  // --- SWR CALCULATION ENGINE ---
  const calculatedAgeBySWR = useMemo(() => {
    const vals = getSafeValues();
    if (calcMode !== 'swr') return vals.n_p1RetirementAge;

    let curTrad = vals.n_balanceTrad;
    let curRoth = vals.n_balanceRoth;
    let curCash = vals.n_balanceCash;
    let curHome = vals.n_homeEquity;
    
    let currentDate = new Date(vals.n_startYear, vals.n_startMonth); 
    const p1BirthDateObj = new Date(vals.n_p1BirthYear, vals.n_p1BirthMonth);
    const monthlyReturnRate = Math.pow(1 + vals.n_annualReturn / 100, 1 / 12) - 1;
    const monthlyCashReturnRate = Math.pow(1 + vals.n_cashReturn / 100, 1 / 12) - 1;
    const monthlyHomeReturnRate = Math.pow(1 + 1 / 100, 1 / 12) - 1;
    const stateRate = vals.n_stateTaxRate / 100;

    const startAgeInMonthsSWR = (vals.n_startYear - vals.n_p1BirthYear) * 12 + (vals.n_startMonth - vals.n_p1BirthMonth);
    const totalMonthsToRunSWR = Math.max(12, (vals.n_targetEndAge * 12) - startAgeInMonthsSWR);

    for (let i = 0; i < totalMonthsToRunSWR; i++) { 
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const p1AgeMonthsTotal = (year - p1BirthDateObj.getFullYear()) * 12 + (month - p1BirthDateObj.getMonth());
      const p1AgeYears = Math.floor(p1AgeMonthsTotal / 12);

      let currentAnnualExpenses = totalBaseAnnualExpenses;
      adjustments.forEach(adj => {
        const trigger = Number(adj.trigger) || 0;
        const amount = Number(adj.amount) || 0;
        if (adj.type === 'year' && year >= trigger) currentAnnualExpenses += amount;
        else if (adj.type === 'age' && p1AgeYears >= trigger) currentAnnualExpenses += amount;
      });

      // Factor in rough state tax bump to required SWR target
      let grossExpenses = currentAnnualExpenses * (1 + stateRate);
      const targetAssets = grossExpenses / (vals.n_swrRate / 100);
      const investableAssets = curTrad + curRoth + curCash;

      if (investableAssets >= targetAssets && targetAssets > 0) {
        return p1AgeYears; 
      }

      let moMortgagePrincipal = year <= vals.n_mortgagePayoffYear ? (vals.n_annualMortgagePrincipal / 12) : 0;
      
      curTrad += (curTrad > 0 ? curTrad * monthlyReturnRate : 0) + vals.n_contribTrad / 12;
      curRoth += (curRoth > 0 ? curRoth * monthlyReturnRate : 0) + vals.n_contribRoth / 12;
      curCash += (curCash > 0 ? curCash * monthlyCashReturnRate : 0) + vals.n_contribCash / 12;
      curHome += (curHome > 0 ? curHome * monthlyHomeReturnRate : 0) + moMortgagePrincipal;

      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return vals.n_targetEndAge; 
  }, [calcMode, swrRate, startYear, startMonth, p1BirthYear, p1BirthMonth, targetEndAge, p1RetirementAge, balanceTrad, balanceRoth, balanceCash, homeEquity, annualMortgagePrincipal, mortgagePayoffYear, contribTrad, contribRoth, contribCash, annualReturn, cashReturn, stateTaxRate, totalBaseAnnualExpenses, adjustments]);

  const activeP1RetAge = calcMode === 'swr' ? calculatedAgeBySWR : (p1RetirementAge === '' ? 65 : Number(p1RetirementAge));

  // --- CORE PROJECTION SPREADSHEET ENGINE ---
  const calculateProjection = (testP1RetAge) => {
    const vals = getSafeValues();

    let curTrad = vals.n_balanceTrad;
    let curRoth = vals.n_balanceRoth;
    let curCash = vals.n_balanceCash;
    let curHome = vals.n_homeEquity;
    
    const records = [];
    let currentDate = new Date(vals.n_startYear, vals.n_startMonth); 
    
    const p1BirthDateObj = new Date(vals.n_p1BirthYear, vals.n_p1BirthMonth);
    const p2BirthDateObj = advancedMode ? new Date(vals.n_p2BirthYear, vals.n_p2BirthMonth) : new Date(vals.n_p1BirthYear, vals.n_p1BirthMonth);
    const activeP2RetAge = advancedMode ? vals.n_p2RetirementAge : testP1RetAge;
    const activeP2SsStartAge = advancedMode ? vals.n_p2SsStartAge : vals.n_p1SsStartAge;
    const activeP2MaxSs = advancedMode ? vals.n_p2MaxSs : 0;
    const isMFJ = numAdults === 2;
    const stateRate = vals.n_stateTaxRate / 100;
    
    const monthlyReturnRate = Math.pow(1 + vals.n_annualReturn / 100, 1 / 12) - 1;
    const monthlyCashReturnRate = Math.pow(1 + vals.n_cashReturn / 100, 1 / 12) - 1;
    const monthlyHomeReturnRate = Math.pow(1 + 1 / 100, 1 / 12) - 1; 

    const startAgeInMonths = (vals.n_startYear - vals.n_p1BirthYear) * 12 + (vals.n_startMonth - vals.n_p1BirthMonth);
    const totalMonthsToRun = Math.max(12, (vals.n_targetEndAge * 12) - startAgeInMonths);

    let hasCrashed = false;

    // --- TAX OPTIMIZATION HELPER ---
    const drawFromTrad = (netNeeded, currentIncome, maxRateAllowed) => {
        let remainingNet = netNeeded;
        let grossPulled = 0;
        let taxPaid = 0;
        let income = currentIncome;
        let actualNet = 0;

        const taxBrackets = isMFJ
          ? [ {r: 0, top: 2433}, {r: 0.1, top: 4366}, {r: 0.12, top: 10291}, {r: 0.22, top: 19187}, {r: 0.24, top: 34425}, {r: 0.32, top: 43054}, {r: 0.35, top: 63437}, {r: 0.37, top: Infinity} ]
          : [ {r: 0, top: 1216}, {r: 0.1, top: 2183}, {r: 0.12, top: 5145}, {r: 0.22, top: 9593}, {r: 0.24, top: 17212}, {r: 0.32, top: 21527}, {r: 0.35, top: 52008}, {r: 0.37, top: Infinity} ];

        for (let b of taxBrackets) {
            if (remainingNet <= 0.01 || curTrad <= 0.01) break;
            if (b.r > maxRateAllowed) break;
            if (income >= b.top) continue;

            let maxGrossInBracket = b.top - income;
            maxGrossInBracket = Math.min(maxGrossInBracket, curTrad);
            
            let combinedRate = b.r + stateRate;
            if (combinedRate >= 1) combinedRate = 0.99; 
            
            let netInBracket = maxGrossInBracket * (1 - combinedRate);
            let netToTake = Math.min(remainingNet, netInBracket);
            let grossToTake = netToTake / (1 - combinedRate);

            if (grossToTake > curTrad) {
                grossToTake = curTrad;
                netToTake = grossToTake * (1 - combinedRate);
            }

            grossPulled += grossToTake;
            taxPaid += (grossToTake - netToTake);
            remainingNet -= netToTake;
            actualNet += netToTake;
            income += grossToTake;
            curTrad -= grossToTake; 
        }
        return { net: actualNet, gross: grossPulled, tax: taxPaid, newIncome: income };
    };

    for (let i = 0; i < totalMonthsToRun; i++) { 
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthName = months[month];

      let tradStart = curTrad, rothStart = curRoth, cashStart = curCash, homeStart = curHome;
      let tradDrawnExp = 0, rothDrawnExp = 0, cashDrawnExp = 0;
      let tradDrawnBuf = 0, rothDrawnBuf = 0, cashTransferIn = 0;
      let rothSurplus = 0, tradTax = 0;

      const p1AgeMonthsTotal = (year - p1BirthDateObj.getFullYear()) * 12 + (month - p1BirthDateObj.getMonth());
      const p1AgeYears = Math.floor(p1AgeMonthsTotal / 12);
      const p1AgeMonths = p1AgeMonthsTotal % 12;

      const p2AgeMonthsTotal = (year - p2BirthDateObj.getFullYear()) * 12 + (month - p2BirthDateObj.getMonth());
      const p2AgeYears = Math.floor(p2AgeMonthsTotal / 12);
      const p2AgeMonths = p2AgeMonthsTotal % 12;

      const displayAge = (numAdults === 2 && advancedMode) ? `P1: ${p1AgeYears} | P2: ${p2AgeYears}` : `${p1AgeYears}y ${p1AgeMonths}m`;

      const isP1Retired = p1AgeYears > testP1RetAge || (p1AgeYears === testP1RetAge && p1AgeMonths >= 0);
      
      let isP2Retired = true;
      if (numAdults === 2) {
        if (calcMode === 'swr') {
          isP2Retired = isP1Retired;
        } else {
          isP2Retired = p2AgeYears > activeP2RetAge || (p2AgeYears === activeP2RetAge && p2AgeMonths >= 0);
        }
      }

      let workingRatio = 1;
      let contribRatio = 1;
      
      if (numAdults === 2) {
        if (isP1Retired && isP2Retired) { workingRatio = 0; contribRatio = 0; }
        else if (!isP1Retired && !isP2Retired) { workingRatio = 1; contribRatio = 1; }
        else { workingRatio = 0.5; contribRatio = advancedMode ? (1 - (vals.n_transitionDrop / 100)) : 0.5; }
      } else {
        workingRatio = !isP1Retired ? 1 : 0;
        contribRatio = !isP1Retired ? 1 : 0;
      }
      
      const phaseText = workingRatio === 1 ? 'Working' : (workingRatio === 0 ? 'Retired' : 'Transition');

      let currentAnnualExpenses = totalBaseAnnualExpenses;
      adjustments.forEach(adj => {
        const trigger = Number(adj.trigger) || 0;
        const amount = Number(adj.amount) || 0;
        if (adj.type === 'year' && year >= trigger) currentAnnualExpenses += amount;
        else if (adj.type === 'age' && p1AgeYears >= trigger) currentAnnualExpenses += amount;
      });

      let isFlexed = false;
      if (hasCrashed && workingRatio === 0) {
        if (vals.n_swrRate === 5.2) { currentAnnualExpenses *= 0.90; isFlexed = true; } 
        else if (vals.n_swrRate === 4.5) { currentAnnualExpenses *= 0.95; isFlexed = true; }
      }
      const currentMonthlyExpense = currentAnnualExpenses / 12;

      // Social Security Tax Logic
      let ssIncome = 0;
      if (p1AgeYears > vals.n_p1SsStartAge || (p1AgeYears === vals.n_p1SsStartAge && p1AgeMonths >= 0)) ssIncome += vals.n_p1MaxSs;
      if (numAdults === 2 && (p2AgeYears > activeP2SsStartAge || (p2AgeYears === activeP2SsStartAge && p2AgeMonths >= 0))) ssIncome += activeP2MaxSs;

      let taxableSS = ssIncome * 0.85;
      let baseFedTax = 0;
      let tempIncome = 0;
      
      const taxBrackets = isMFJ
          ? [ {r: 0, top: 2433}, {r: 0.1, top: 4366}, {r: 0.12, top: 10291}, {r: 0.22, top: 19187}, {r: 0.24, top: 34425}, {r: 0.32, top: 43054}, {r: 0.35, top: 63437}, {r: 0.37, top: Infinity} ]
          : [ {r: 0, top: 1216}, {r: 0.1, top: 2183}, {r: 0.12, top: 5145}, {r: 0.22, top: 9593}, {r: 0.24, top: 17212}, {r: 0.32, top: 21527}, {r: 0.35, top: 52008}, {r: 0.37, top: Infinity} ];

      let remainingTaxableSS = taxableSS;
      for (let b of taxBrackets) {
          if (remainingTaxableSS <= 0) break;
          let maxInBracket = b.top - tempIncome;
          if (maxInBracket <= 0) continue;
          let amountInBracket = Math.min(remainingTaxableSS, maxInBracket);
          baseFedTax += amountInBracket * b.r;
          remainingTaxableSS -= amountInBracket;
          tempIncome += amountInBracket;
      }
      
      let baseStateTax = taxableSS * stateRate;
      let ssTax = baseFedTax + baseStateTax;

      const startTotal = curTrad + curRoth + curCash + curHome;

      if (enableCrash && p1AgeYears === vals.n_crashAge && p1AgeMonths === 0) {
        curTrad *= (1 - vals.n_crashPercent / 100);
        curRoth *= (1 - vals.n_crashPercent / 100);
        hasCrashed = true;
      }

      let monthsUntilRet = 9999;
      if (numAdults === 2) {
          if (calcMode === 'swr') {
             monthsUntilRet = isP1Retired ? 0 : (testP1RetAge * 12) - p1AgeMonthsTotal;
          } else {
             if (!isP1Retired && !isP2Retired) monthsUntilRet = Math.min((testP1RetAge * 12) - p1AgeMonthsTotal, (activeP2RetAge * 12) - p2AgeMonthsTotal);
             else if (!isP1Retired) monthsUntilRet = (testP1RetAge * 12) - p1AgeMonthsTotal;
             else if (!isP2Retired) monthsUntilRet = (activeP2RetAge * 12) - p2AgeMonthsTotal;
          }
      } else if (!isP1Retired) {
          monthsUntilRet = (testP1RetAge * 12) - p1AgeMonthsTotal;
      }

      let moTrad = (vals.n_contribTrad / 12) * contribRatio;
      let moRoth = (vals.n_contribRoth / 12) * contribRatio;
      let moCash = (vals.n_contribCash / 12) * contribRatio;

      if (vals.n_targetBufferYears > 0 && monthsUntilRet > 0) {
        const buildWindowMonths = advancedMode ? (vals.n_bufferBuildYears * 12) : 9999; 
        const targetCash = currentAnnualExpenses * vals.n_targetBufferYears;
        const cashNeeded = Math.max(0, targetCash - curCash);
        
        if (cashNeeded > 0 && moRoth > 0 && monthsUntilRet <= buildWindowMonths) {
            const divertAmount = Math.min(moRoth, cashNeeded);
            moCash += divertAmount;
            moRoth -= divertAmount;
        }
      }

      const tradGrowth = curTrad > 0 ? curTrad * monthlyReturnRate : 0;
      const rothGrowth = curRoth > 0 ? curRoth * monthlyReturnRate : 0;
      const cashGrowth = curCash > 0 ? curCash * monthlyCashReturnRate : 0;
      const homeGrowth = curHome > 0 ? curHome * monthlyHomeReturnRate : 0;
      const totalGrowth = tradGrowth + rothGrowth + cashGrowth + homeGrowth;
      
      let moMortgagePrincipal = year <= vals.n_mortgagePayoffYear ? (vals.n_annualMortgagePrincipal / 12) : 0;

      curTrad += tradGrowth + moTrad;
      curRoth += rothGrowth + moRoth;
      curCash += cashGrowth + moCash;
      curHome += homeGrowth + moMortgagePrincipal;

      let salaryCoverage = currentMonthlyExpense * workingRatio;
      // Note: ssTax increases the total cash needed to survive the month
      let shortfall = currentMonthlyExpense - ssIncome + ssTax - salaryCoverage;
      let monthlyTaxes = ssTax;
      let taxableIncomeTracker = taxableSS + salaryCoverage; 
      let surplus = 0;

      if (shortfall > 0) {
          let p1 = drawFromTrad(shortfall, taxableIncomeTracker, 0.12);
          shortfall -= p1.net; monthlyTaxes += p1.tax; taxableIncomeTracker = p1.newIncome; tradDrawnExp += p1.net; tradTax += p1.tax;
          if (shortfall > 0) { let pCash = Math.min(shortfall, curCash); curCash -= pCash; shortfall -= pCash; cashDrawnExp += pCash; }
          if (shortfall > 0) { let pRoth = Math.min(shortfall, curRoth); curRoth -= pRoth; shortfall -= pRoth; rothDrawnExp += pRoth; }
          if (shortfall > 0) { let p2 = drawFromTrad(shortfall, taxableIncomeTracker, 1.0); shortfall -= p2.net; monthlyTaxes += p2.tax; taxableIncomeTracker = p2.newIncome; tradDrawnExp += p2.net; tradTax += p2.tax; }
          if (shortfall > 0) { curCash -= shortfall; cashDrawnExp += shortfall; shortfall = 0; }
      } else {
          surplus = Math.abs(shortfall); curRoth += surplus; rothSurplus += surplus;
      }

      if (workingRatio === 0 && vals.n_targetBufferYears > 0) {
          const targetCash = currentAnnualExpenses * vals.n_targetBufferYears;
          let neededCash = targetCash - curCash;
          if (neededCash > 0) {
              let p3 = drawFromTrad(neededCash, taxableIncomeTracker, 0.12);
              neededCash -= p3.net; curCash += p3.net; monthlyTaxes += p3.tax; taxableIncomeTracker = p3.newIncome; tradDrawnBuf += p3.net; tradTax += p3.tax; cashTransferIn += p3.net;
              if (neededCash > 0) { 
                let pRoth2 = Math.min(neededCash, curRoth); 
                curRoth -= pRoth2; 
                curCash += pRoth2; 
                neededCash -= pRoth2; 
                rothDrawnBuf += pRoth2; 
                cashTransferIn += pRoth2; 
              }
          }
      }

      const endTotal = curTrad + curRoth + curCash + curHome;
      const netFlow = endTotal - startTotal - totalGrowth;

      records.push({
        year, monthStr: `${monthName} ${year}`, ageStr: displayAge, phaseText,
        startBal: startTotal, ssIncome, expenses: currentMonthlyExpense, isFlexed,
        taxes: monthlyTaxes, contribution: moTrad + moRoth + moCash, surplus, netFlow, withdrawal: currentMonthlyExpense - ssIncome - salaryCoverage,
        growth: totalGrowth, endBal: endTotal,
        endTrad: curTrad, endRoth: curRoth, endCash: curCash, endHome: curHome, crashTriggered: (enableCrash && p1AgeYears === vals.n_crashAge && p1AgeMonths === 0),
        tradFlow: { start: tradStart, contrib: moTrad, growth: tradGrowth, drawnExp: tradDrawnExp, drawnBuf: tradDrawnBuf, tax: tradTax, end: curTrad },
        rothFlow: { start: rothStart, contrib: moRoth, growth: rothGrowth, drawnExp: rothDrawnExp, drawnBuf: rothDrawnBuf, surplus: rothSurplus, end: curRoth },
        cashFlow: { start: cashStart, contrib: moCash, growth: cashGrowth, drawnExp: cashDrawnExp, transferIn: cashTransferIn, end: curCash },
        homeFlow: { start: homeStart, growth: homeGrowth, paydown: moMortgagePrincipal, end: curHome }
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return { records, endBal: curTrad + curRoth + curCash + curHome };
  };

  const data = useMemo(() => calculateProjection(activeP1RetAge).records, [
    startYear, startMonth, p1BirthYear, p1BirthMonth, p2BirthYear, p2BirthMonth, activeP1RetAge, p2RetirementAge, p1SsStartAge, p2SsStartAge, p1MaxSs, p2MaxSs, numAdults,
    balanceTrad, balanceRoth, balanceCash, homeEquity, annualMortgagePrincipal, mortgagePayoffYear, contribTrad, contribRoth, contribCash, annualReturn, cashReturn, transitionDrop, advancedMode, stateTaxRate,
    targetBufferYears, bufferBuildYears, totalBaseAnnualExpenses, adjustments, targetEndAge, enableCrash, crashAge, crashPercent, swrRate
  ]);

  const optimalRetAge = useMemo(() => {
    if (calcMode !== 'fixed') return null; 
    const vals = getSafeValues();
    const currentAge = Math.floor(((vals.n_startYear - vals.n_p1BirthYear) * 12 + (vals.n_startMonth - vals.n_p1BirthMonth)) / 12);
    for (let age = Math.max(currentAge, 30); age <= vals.n_targetEndAge; age++) {
      if (calculateProjection(age).endBal >= 0) return age;
    }
    return `${vals.n_targetEndAge}+`;
  }, [calcMode, startYear, startMonth, p1BirthYear, p1BirthMonth, p2BirthYear, p2BirthMonth, p2RetirementAge, p1SsStartAge, p2SsStartAge, p1MaxSs, p2MaxSs, numAdults,
    balanceTrad, balanceRoth, balanceCash, homeEquity, annualMortgagePrincipal, mortgagePayoffYear, contribTrad, contribRoth, contribCash, annualReturn, cashReturn, transitionDrop, advancedMode, stateTaxRate,
    targetBufferYears, bufferBuildYears, totalBaseAnnualExpenses, adjustments, targetEndAge, enableCrash, crashAge, crashPercent, swrRate]);

  const yearlyData = useMemo(() => {
    const yearsMap = new Map();
    data.forEach(row => {
      if (!yearsMap.has(row.year)) {
        yearsMap.set(row.year, { year: row.year, ageStr: row.ageStr, phaseText: row.phaseText, startBal: row.startBal, ssIncome: 0, expenses: 0, taxes: 0, netFlow: 0, growth: 0, withdrawal: 0, contribution: 0,
          endBal: row.endBal, endTrad: row.endTrad, endRoth: row.endRoth, endCash: row.endCash, endHome: row.endHome, isFlexed: false,
          tradFlow: { start: row.tradFlow.start, contrib: 0, growth: 0, drawnExp: 0, drawnBuf: 0, tax: 0, end: 0 },
          rothFlow: { start: row.rothFlow.start, contrib: 0, growth: 0, drawnExp: 0, drawnBuf: 0, surplus: 0, end: 0 },
          cashFlow: { start: row.cashFlow.start, contrib: 0, growth: 0, drawnExp: 0, transferIn: 0, end: 0 },
          homeFlow: { start: row.homeFlow.start, growth: 0, paydown: 0, end: 0 }
        });
      }
      const y = yearsMap.get(row.year);
      y.ssIncome += row.ssIncome; y.expenses += row.expenses; y.taxes += row.taxes; y.netFlow += row.netFlow; y.growth += row.growth; y.contribution += row.contribution;
      y.endBal = row.endBal; y.endTrad = row.endTrad; y.endRoth = row.endRoth; y.endCash = row.endCash; y.endHome = row.endHome; y.ageStr = row.ageStr; 
      if (row.isFlexed) y.isFlexed = true;
      if (row.phaseText === 'Working') y.phaseText = 'Working';
      else if (row.phaseText === 'Transition' && y.phaseText !== 'Working') y.phaseText = 'Transition';
      y.tradFlow.contrib += row.tradFlow.contrib; y.tradFlow.growth += row.tradFlow.growth; y.tradFlow.drawnExp += row.tradFlow.drawnExp; y.tradFlow.drawnBuf += row.tradFlow.drawnBuf; y.tradFlow.tax += row.tradFlow.tax; y.tradFlow.end = row.tradFlow.end;
      y.rothFlow.contrib += row.rothFlow.contrib; y.rothFlow.growth += row.rothFlow.growth; y.rothFlow.drawnExp += row.rothFlow.drawnExp; y.rothFlow.drawnBuf += row.rothFlow.drawnBuf; y.rothFlow.surplus += row.rothFlow.surplus; y.rothFlow.end = row.rothFlow.end;
      y.cashFlow.contrib += row.cashFlow.contrib; y.cashFlow.growth += row.cashFlow.growth; y.cashFlow.drawnExp += row.cashFlow.drawnExp; y.cashFlow.transferIn += row.cashFlow.transferIn; y.cashFlow.end = row.cashFlow.end;
      y.homeFlow.growth += row.homeFlow.growth; y.homeFlow.paydown += row.homeFlow.paydown; y.homeFlow.end = row.homeFlow.end;
    });
    return Array.from(yearsMap.values());
  }, [data]);

  const renderData = viewMode === 'monthly' ? data : yearlyData;
  const startingTotalBalance = data[0].startBal;
  const endOfPlanBal = data[data.length - 1].endBal;
  const netWorthAtRetRow = data.find(r => r.phaseText === 'Transition' || r.phaseText === 'Retired');
  const netWorthAtRetirement = netWorthAtRetRow ? netWorthAtRetRow.startBal : endOfPlanBal;
  
  const handleExportCSV = () => {
    const headers = [
      'Date', 'Age', 'Phase', 'Beg. Net Worth', 'Income (SS)', 'Dynamic Expenses', 'Est. Taxes', 'Net Flow', 'Inv. Growth (Real)',
      'End Net Worth', 'End Trad', 'End Roth', 'End Cash', 'End Home'
    ];
    const csvRows = renderData.map(row => [
        viewMode === 'monthly' ? row.monthStr : row.year,
        row.ageStr, row.phaseText,
        row.startBal.toFixed(2), row.ssIncome.toFixed(2), row.expenses.toFixed(2), row.taxes.toFixed(2),
        row.netFlow.toFixed(2), row.growth.toFixed(2), row.endBal.toFixed(2),
        row.endTrad.toFixed(2), row.endRoth.toFixed(2), row.endCash.toFixed(2), row.endHome.toFixed(2)
    ].join(','));
    const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.setAttribute('download', `retirement_projection_${viewMode}.csv`); link.click();
  };

  const inputClass = "block w-full rounded-md border border-slate-300 py-1.5 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white shadow-sm placeholder-slate-300 transition-colors";

  return (
    <div className="flex h-[100dvh] bg-slate-100 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Clear Data Confirmation Modal */}
      {isClearModalOpen && (
        <div 
          className="fixed inset-0 bg-transparent z-[100] flex items-center justify-center p-4"
          onClick={() => setIsClearModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-bold text-slate-900">Clear All Data?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">This will reset all assumptions and clear your profile data so you can start from a blank slate. Empty inputs safely fall back to mathematically zero. This cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => setIsClearModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleClearData} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm">Clear Data</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40 md:hidden transition-opacity backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[85%] sm:w-96 bg-slate-50 border-r border-slate-200 flex flex-col shadow-2xl md:shadow-sm transform transition-transform duration-300 md:relative md:translate-x-0 flex-shrink-0 overflow-y-auto custom-scrollbar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2"><Settings className="w-5 h-5 text-slate-600" /> <h2 className="text-lg font-bold text-slate-800 tracking-tight">Assumptions</h2></div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex space-x-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 shadow-inner">
            <button onClick={() => setAdvancedMode(false)} className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${!advancedMode ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}>Basic Setup</button>
            <button onClick={() => setAdvancedMode(true)} className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${advancedMode ? 'bg-white text-purple-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}>Advanced Setup</button>
          </div>
        </div>
        
        <div className="p-4 space-y-5">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center"><Target className="w-4 h-4 mr-2 text-blue-500" /> Projection Goal</h3>
            <div className="flex space-x-2 mb-4">
              <button onClick={() => setCalcMode('fixed')} className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all border ${calcMode === 'fixed' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Fixed Age</button>
              <button onClick={() => setCalcMode('swr')} className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all border ${calcMode === 'swr' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Target SWR</button>
            </div>
            {calcMode === 'swr' && (
              <InputGroup label="Withdrawal Strategy (SWR)" description="Calculates retirement age based on portfolio target.">
                <select className={inputClass} value={swrRate} onChange={e => setSwrRate(Number(e.target.value))}>
                  <option value={4.0}>Zero Flex (4.0% SWR)</option>
                  <option value={4.5}>Moderate Flex (4.5% SWR)</option>
                  <option value={5.2}>High Flex (5.2% SWR)</option>
                </select>
                <div className="bg-indigo-50/50 border border-indigo-100 p-2 mt-2 rounded-lg">
                  <p className="text-[10px] text-indigo-700 font-medium leading-snug">
                    {swrRate === 4.0 && "The 4% Rule: Adjust for inflation every year, never reduce spending."}
                    {swrRate === 4.5 && "The 'No Raise' Rule: Skip inflation adjustments during negative market years."}
                    {swrRate === 5.2 && "Guardrails Strategy: Cut spending by ~10% during severe market drops."}
                  </p>
                </div>
              </InputGroup>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center"><Calendar className="w-4 h-4 mr-2 text-indigo-500" /> Timeline & Profiles</h3>
            <InputGroup label="Start Date"><div className="flex space-x-2"><select className={inputClass} value={startMonth} onChange={e => setStartMonth(Number(e.target.value))}>{months.map((m, i) => <option value={i} key={m}>{m}</option>)}</select><NumberInput className={inputClass} value={startYear} onChange={setStartYear} placeholder={currentYear.toString()} /></div></InputGroup>
            <InputGroup label="Planning Horizon (Age)"><NumberInput className={inputClass} value={targetEndAge} onChange={setTargetEndAge} placeholder="100" /></InputGroup>
            
            {advancedMode && (
              <InputGroup label="Adults"><select className={inputClass} value={numAdults} onChange={e => setNumAdults(Number(e.target.value))}><option value={1}>1 Adult</option><option value={2}>2 Adults</option></select></InputGroup>
            )}
            
            {!advancedMode ? (
              <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100/60 mt-4 shadow-sm">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center"><Users className="w-3.5 h-3.5 mr-1.5 opacity-70"/> Household Profile</h4>
                <InputGroup label="Birth Year"><NumberInput className={inputClass} value={p1BirthYear} onChange={setP1BirthYear} placeholder="1985" /></InputGroup>
                {calcMode === 'fixed' && <InputGroup label="Retirement Age"><NumberInput className={inputClass} value={p1RetirementAge} onChange={setP1RetirementAge} placeholder="65" /></InputGroup>}
                <div className="grid grid-cols-2 gap-4"><InputGroup label="SS Age"><NumberInput className={inputClass} value={p1SsStartAge} onChange={setP1SsStartAge} placeholder="67" /></InputGroup><InputGroup label="Combined SS /mo"><CurrencyInput className={inputClass} value={p1MaxSs} onChange={setP1MaxSs} placeholder="$0" /></InputGroup></div>
              </div>
            ) : (
              <>
                <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100/60 mt-4 shadow-sm">
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center"><Users className="w-3.5 h-3.5 mr-1.5 opacity-70"/> Person 1</h4>
                  <InputGroup label="Birth Year"><NumberInput className={inputClass} value={p1BirthYear} onChange={setP1BirthYear} placeholder="1985" /></InputGroup>
                  {calcMode === 'fixed' && <InputGroup label="Retirement Age" description="Age at which Person 1 stops working and contributing."><NumberInput className={inputClass} value={p1RetirementAge} onChange={setP1RetirementAge} placeholder="65" /></InputGroup>}
                  <div className="grid grid-cols-2 gap-4"><InputGroup label="SS Age"><NumberInput className={inputClass} value={p1SsStartAge} onChange={setP1SsStartAge} placeholder="67" /></InputGroup><InputGroup label="SS /mo"><CurrencyInput className={inputClass} value={p1MaxSs} onChange={setP1MaxSs} placeholder="$0" /></InputGroup></div>
                </div>
                {numAdults === 2 && (
                  <div className="bg-purple-50/40 p-3 rounded-lg border border-purple-100/60 mt-4 shadow-sm">
                    <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-3 flex items-center"><Users className="w-3.5 h-3.5 mr-1.5 opacity-70"/> Person 2</h4>
                    <InputGroup label="Birth Year"><NumberInput className={inputClass} value={p2BirthYear} onChange={setP2BirthYear} placeholder="1985" /></InputGroup>
                    {calcMode === 'fixed' && <InputGroup label="Retirement Age" description="Age at which Person 2 stops working and contributing."><NumberInput className={inputClass} value={p2RetirementAge} onChange={setP2RetirementAge} placeholder="65" /></InputGroup>}
                    <div className="grid grid-cols-2 gap-4"><InputGroup label="SS Age"><NumberInput className={inputClass} value={p2SsStartAge} onChange={setP2SsStartAge} placeholder="67" /></InputGroup><InputGroup label="SS /mo"><CurrencyInput className={inputClass} value={p2MaxSs} onChange={setP2MaxSs} placeholder="$0" /></InputGroup></div>
                  </div>
                )}
                {numAdults === 2 && calcMode === 'fixed' && (
                  <div className="bg-amber-50/40 p-3 rounded-lg border border-amber-100/60 mt-4 shadow-sm">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1.5 opacity-70"/> Transition Phase</h4>
                    <InputGroup label="Contribution Drop (%)" description="Savings drop when the first person retires. Default: 50%"><NumberInput className={inputClass} value={transitionDrop} onChange={setTransitionDrop} placeholder="50" /></InputGroup>
                  </div>
                )}
                <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 mt-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1.5 opacity-70"/> Tax Assumptions</h4>
                  <InputGroup label="State Income Tax Rate (%)" description="Applied to taxable withdrawals & taxable portion of SS.">
                    <NumberInput step="0.1" className={inputClass} value={stateTaxRate} onChange={setStateTaxRate} placeholder="0.0" />
                  </InputGroup>
                </div>
              </>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center"><Wallet className="w-4 h-4 mr-2 text-emerald-500" /> Combined Net Worth</h3>
             <div className="space-y-2 mb-6">
               <InputGroup label="Traditional 401k/IRA Balance"><CurrencyInput className={inputClass} value={balanceTrad} onChange={setBalanceTrad} placeholder="$0" /></InputGroup>
               <InputGroup label="Roth IRA/401k (Invested)"><CurrencyInput className={inputClass} value={balanceRoth} onChange={setBalanceRoth} placeholder="$0" /></InputGroup>
               <InputGroup label="Roth Cash Reserves / Safe Buffer" description="Held as cash inside tax-advantaged accounts."><CurrencyInput className={inputClass} value={balanceCash} onChange={setBalanceCash} placeholder="$0" /></InputGroup>
               <InputGroup label="Primary Residence Equity"><CurrencyInput className={inputClass} value={homeEquity} onChange={setHomeEquity} placeholder="$0" /></InputGroup>
               <div className="grid grid-cols-2 gap-4">
                 <InputGroup label="Mortgage Paydown /yr" description="Adds directly to equity."><CurrencyInput className={inputClass} value={annualMortgagePrincipal} onChange={setAnnualMortgagePrincipal} placeholder="$0" /></InputGroup>
                 <InputGroup label="Payoff Year" description="Year mortgage hits zero."><NumberInput className={inputClass} value={mortgagePayoffYear} onChange={setMortgagePayoffYear} placeholder="2045" /></InputGroup>
               </div>
             </div>

             <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-t border-slate-100 pt-4 mb-3 flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-400"/> Annual Contributions</h4>
             <InputGroup label="To Traditional 401k/IRA"><CurrencyInput className={inputClass} value={contribTrad} onChange={setContribTrad} placeholder="$0" /></InputGroup>
             <InputGroup label="To Roth Accounts (Invested)"><CurrencyInput className={inputClass} value={contribRoth} onChange={setContribRoth} placeholder="$0" /></InputGroup>
             <InputGroup label="To Roth Accounts (Cash reserves)"><CurrencyInput className={inputClass} value={contribCash} onChange={setContribCash} placeholder="$0" /></InputGroup>
             
             <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-100 pt-4">
               <InputGroup label="Inv. Return (%)" description="Invested accounts."><NumberInput step="0.1" className={inputClass} value={annualReturn} onChange={setAnnualReturn} placeholder="0.0" /></InputGroup>
               <InputGroup label="Buffer Return (%)" description="Cash reserve accounts."><NumberInput step="0.1" className={inputClass} value={cashReturn} onChange={setCashReturn} placeholder="0.0" /></InputGroup>
             </div>
             
             {advancedMode && (
                <div className="mt-2 p-3 bg-indigo-50/40 border border-indigo-100/60 rounded-lg">
                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center"><Shield className="w-3.5 h-3.5 mr-1.5 opacity-70"/> Buffer Build Strategy</h4>
                  <InputGroup label="Build Window (Years before ret.)" description="Period to divert Roth Invested into Roth Cash reserves."><NumberInput className={inputClass} value={bufferBuildYears} onChange={setBufferBuildYears} placeholder="0" /></InputGroup>
                  <InputGroup label="Target Size (Years of Expenses)"><NumberInput step="0.5" className={inputClass} value={targetBufferYears} onChange={setTargetBufferYears} placeholder="0.0" /></InputGroup>
                </div>
             )}
          </div>

          <div className="bg-red-50/60 p-4 rounded-xl border border-red-100 shadow-sm">
            <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center"><Activity className="w-4 h-4 mr-2 text-red-500" /> Stress Tester</h3>
            <div className="flex items-center mb-4"><input type="checkbox" className="w-4 h-4 mr-2 text-red-600 rounded border-red-300 focus:ring-red-500" checked={enableCrash} onChange={e => setEnableCrash(e.target.checked)} /><span className="text-xs font-bold text-red-800 uppercase tracking-wider">Simulate Market Crash</span></div>
            {enableCrash && <div className="grid grid-cols-2 gap-4"><InputGroup label={advancedMode && numAdults === 2 ? "At P1 Age" : "At Age"}><NumberInput className={inputClass} value={crashAge} onChange={setCrashAge} placeholder="55" /></InputGroup><InputGroup label="Drop %"><NumberInput className={inputClass} value={crashPercent} onChange={setCrashPercent} placeholder="0" /></InputGroup></div>}
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-end border-b border-slate-100 pb-2 mb-4">
               <h3 className="text-sm font-bold text-slate-800 flex items-center"><Coffee className="w-4 h-4 mr-2 text-orange-500" /> Annual Budget</h3>
               <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">{formatCurrency(totalBaseAnnualExpenses)}/yr</span>
             </div>
             <div className="space-y-3">{Object.keys(expenses).map(k => <div key={k} className="flex items-center space-x-2"><div className="w-1/2 text-xs font-medium text-slate-600 capitalize">{k}</div><CurrencyInput className={`${inputClass} w-1/2`} value={expenses[k]} onChange={val => handleExpenseChange(k, val)} placeholder="$0" /></div>)}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
             <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
               <h3 className="text-sm font-bold text-slate-800 flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-purple-500" /> Adjustments</h3>
               <button onClick={addAdjustment} className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors">
                 <Plus className="w-3 h-3 mr-1" /> Add
               </button>
             </div>
             
             <div className="space-y-3">
               {adjustments.map((adj) => (
                 <div key={adj.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg relative group">
                   <button 
                     onClick={() => removeAdjustment(adj.id)} 
                     className="absolute top-2 right-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md p-1.5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                     title="Delete Event"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                   
                   <input 
                     type="text" 
                     className="block w-5/6 bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:ring-0 text-sm font-bold text-slate-800 p-0 pb-1 mb-3 transition-colors placeholder-slate-400" 
                     value={adj.desc} 
                     onChange={e => updateAdjustment(adj.id, 'desc', e.target.value)} 
                     placeholder="Event Description"
                   />
                   
                   <div className="grid grid-cols-3 gap-2">
                     <div>
                       <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                       <select className={`${inputClass} !py-1 !px-2 text-xs`} value={adj.type} onChange={e => updateAdjustment(adj.id, 'type', e.target.value)}>
                         <option value="year">Year</option>
                         <option value="age">{advancedMode ? 'P1 Age' : 'Age'}</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">When</label>
                       <NumberInput className={`${inputClass} !py-1 !px-2 text-xs`} value={adj.trigger} onChange={val => updateAdjustment(adj.id, 'trigger', val)} placeholder="0" />
                     </div>
                     <div>
                       <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount /yr</label>
                       <CurrencyInput className={`${inputClass} !py-1 !px-2 text-xs ${adj.amount < 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`} value={adj.amount} onChange={val => updateAdjustment(adj.id, 'amount', val)} placeholder="$0" />
                     </div>
                   </div>
                 </div>
               ))}
               {adjustments.length === 0 && (
                 <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed border-slate-200 rounded-lg">No future budget changes planned.</p>
               )}
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-slate-100 min-w-0 w-full custom-scrollbar">
        <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap items-start sm:items-center justify-between p-3 sm:p-4 bg-white border-b border-slate-200 flex-shrink-0 gap-3 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 mr-3 text-slate-600 bg-white rounded-md border border-slate-300 shadow-sm hover:bg-slate-50">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 whitespace-nowrap tracking-tight">Retirement Dashboard</h1>
              <p className="text-sm text-slate-500 whitespace-nowrap">Plan to Age {targetEndAge}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Main Action Buttons */}
            <div className="flex space-x-2 flex-1 sm:flex-none justify-center">
              <button onClick={() => setIsClearModalOpen(true)} className="flex-1 sm:flex-none justify-center px-3 py-1.5 text-sm font-bold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all flex items-center shadow-sm">
                <RotateCcw className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Reset</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none justify-center px-3 py-1.5 text-sm font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all flex items-center shadow-sm">
                <Upload className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Load</span>
              </button>
              <button onClick={handleExportSettings} className="flex-1 sm:flex-none justify-center px-3 py-1.5 text-sm font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all flex items-center shadow-sm">
                <Save className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Save</span>
              </button>
              <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportSettings} className="hidden" />
            </div>

            {/* View Toggles */}
            <div className="flex bg-slate-200/70 p-1 rounded-lg border border-slate-300 flex-1 sm:flex-none justify-center shadow-inner">
              <button onClick={() => setViewMode('monthly')} className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'monthly' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'}`}>Mo.</button>
              <button onClick={() => setViewMode('yearly')} className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'yearly' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'}`}>Yr.</button>
              <button onClick={() => setViewMode('chart')} className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'chart' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'}`}>Chart</button>
            </div>
            
            <button onClick={handleExportCSV} className="w-full sm:w-auto flex items-center justify-center px-4 py-1.5 text-sm font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-sm"><Download className="w-4 h-4 mr-1.5" /> Export</button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="flex-shrink-0 flex md:grid md:grid-cols-2 xl:grid-cols-4 overflow-x-auto gap-4 p-4 snap-x custom-scrollbar pb-4">
          <div className="min-w-[80vw] sm:min-w-[240px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center">
             <div className="text-sm text-slate-500 font-semibold mb-1 truncate">Starting Net Worth</div>
             <div className="text-2xl font-bold text-slate-800">{formatCurrency(startingTotalBalance || 0)}</div>
          </div>
          
          {calcMode === 'fixed' ? (
            <div className="min-w-[80vw] sm:min-w-[240px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl bg-blue-50 border border-blue-200 shadow-sm flex flex-col justify-center">
               <div className="text-sm text-blue-600 font-semibold mb-1 truncate">{advancedMode && numAdults === 2 ? 'P1 Earliest Safe Retire Age' : 'Earliest Safe Retire Age'}</div>
               <div className="text-2xl font-bold text-blue-900 truncate">{optimalRetAge !== null ? optimalRetAge : '--'} <span className="text-sm font-medium text-blue-700 opacity-80">years old</span></div>
            </div>
          ) : (
            <div className="min-w-[80vw] sm:min-w-[240px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl bg-indigo-50 border border-indigo-200 shadow-sm flex flex-col justify-center">
               <div className="text-sm text-indigo-600 font-semibold mb-1 truncate">{advancedMode && numAdults === 2 ? 'P1 Calculated FI Age' : 'Calculated FI Age'}</div>
               <div className="text-2xl font-bold text-indigo-900 truncate">{calculatedAgeBySWR !== null ? calculatedAgeBySWR : '--'} <span className="text-sm font-medium text-indigo-700 opacity-80">years old</span></div>
            </div>
          )}

          <div className="min-w-[80vw] sm:min-w-[240px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl bg-purple-50 border border-purple-200 shadow-sm flex flex-col justify-center">
             <div className="text-sm text-purple-600 font-semibold mb-1 truncate">Net Worth at Retirement</div>
             <div className="text-2xl font-bold text-purple-900 truncate">{formatCurrency(netWorthAtRetirement || 0)}</div>
          </div>
          
          <div className={`min-w-[80vw] sm:min-w-[240px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl border shadow-sm flex flex-col justify-center overflow-hidden ${(endOfPlanBal || 0) >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
             <div className={`text-sm font-semibold mb-1 truncate ${(endOfPlanBal || 0) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Ending Net Worth (Age {targetEndAge || 0})</div>
             <div className={`text-2xl font-bold truncate ${(endOfPlanBal || 0) >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>{formatCurrency(endOfPlanBal || 0)}</div>
          </div>
        </div>

        {viewMode === 'chart' ? (
          <div className="flex-1 p-4 sm:p-6 min-h-[400px] bg-white mx-4 mb-4 border border-slate-200 rounded-xl shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10}} dy={10} />
                <YAxis tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} axisLine={false} tickLine={false} tick={{fontSize: 10}} dx={-10} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="endHome" stackId="1" stroke="#059669" fill="#34d399" fillOpacity={0.6} name="Home Equity" />
                <Area type="monotone" dataKey="endCash" stackId="1" stroke="#d97706" fill="#fbbf24" fillOpacity={0.6} name="Roth Cash Reserves" />
                <Area type="monotone" dataKey="endTrad" stackId="1" stroke="#4b5563" fill="#9ca3af" fillOpacity={0.6} name="Traditional 401k/IRA" />
                <Area type="monotone" dataKey="endRoth" stackId="1" stroke="#4f46e5" fill="#818cf8" fillOpacity={0.6} name="Roth IRA/401k (Invested)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mx-4 mb-4 bg-white border border-slate-200 rounded-xl shadow-sm custom-scrollbar overflow-x-auto relative flex-1">
            <table className="w-full text-sm text-right border-collapse">
              <thead className="sticky top-0 bg-slate-50 shadow-sm z-10 border-b-2 border-slate-200">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left font-bold border-r border-slate-200 text-slate-700 whitespace-nowrap">Date</th>
                  <th className="px-2 sm:px-4 py-3 text-center font-bold border-r border-slate-200 text-slate-700 whitespace-nowrap">Phase</th>
                  <th className="px-3 sm:px-4 py-3 font-bold border-r border-slate-200 text-slate-700 whitespace-nowrap">Beg. Net Worth</th>
                  <th className="px-3 sm:px-4 py-3 font-bold border-r border-slate-200 bg-blue-50 text-blue-800 whitespace-nowrap">Income (SS)</th>
                  <th className="px-3 sm:px-4 py-3 font-bold border-r border-slate-200 bg-orange-50 text-orange-800 whitespace-nowrap">Expenses</th>
                  <th className="px-3 sm:px-4 py-3 font-bold border-r border-slate-200 bg-red-50 text-red-800 whitespace-nowrap">Est. Taxes</th>
                  <th className="px-3 sm:px-4 py-3 font-bold border-r border-slate-200 bg-indigo-50 text-indigo-800 whitespace-nowrap">Net Flow</th>
                  <th className="px-3 sm:px-4 py-3 font-bold border-r border-slate-200 bg-emerald-50 text-emerald-800 whitespace-nowrap">Inv. Growth</th>
                  <th className="px-3 sm:px-4 py-3 font-bold text-slate-800 whitespace-nowrap">End Net Worth</th>
                </tr>
              </thead>
              <tbody>
                {renderData.map((row, idx) => {
                  const isExpanded = expandedRow === idx;
                  return (
                    <React.Fragment key={idx}>
                      <tr onClick={() => setExpandedRow(isExpanded ? null : idx)} className={`border-b border-slate-200 cursor-pointer transition-colors ${row.crashTriggered ? 'bg-red-50 hover:bg-red-100' : (idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100')} ${isExpanded ? 'bg-blue-50/40 hover:bg-blue-50/60' : ''}`}>
                        <td className="px-3 sm:px-4 py-2.5 text-left border-r border-slate-200 font-medium whitespace-nowrap flex items-center group text-xs sm:text-sm">
                          {isExpanded ? <ChevronDown className="w-4 h-4 mr-0.5 sm:mr-1 text-blue-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 mr-0.5 sm:mr-1 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />}
                          {viewMode === 'monthly' ? row.monthStr : row.year}
                        </td>
                        <td className="px-2 sm:px-4 py-2.5 text-center border-r border-slate-200 whitespace-nowrap">
                          <div className="font-medium text-slate-600 mb-0.5 text-[10px] sm:text-xs">{row.ageStr}</div>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase shadow-sm border ${row.phaseText === 'Retired' ? 'bg-purple-50 text-purple-700 border-purple-200' : row.phaseText === 'Transition' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{row.phaseText}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-right border-r border-slate-200 whitespace-nowrap">{formatCurrency(row.startBal)}</td>
                        <td className="px-3 sm:px-4 py-2.5 text-right border-r border-slate-200 bg-blue-50/30 text-blue-800 whitespace-nowrap font-medium">{formatCurrency(row.ssIncome)}</td>
                        <td className={`px-3 sm:px-4 py-2.5 text-right border-r border-slate-200 bg-orange-50/30 text-orange-900 whitespace-nowrap font-medium ${row.isFlexed ? 'bg-blue-50 text-blue-800' : ''}`}>
                          <div className="flex flex-col items-end">
                            <span>{formatCurrency(row.expenses)}</span>
                            {row.isFlexed && <span className="text-[9px] font-bold uppercase tracking-tight text-blue-700 mt-0.5">Flexed</span>}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-right border-r border-slate-200 bg-red-50/30 text-red-700 font-bold whitespace-nowrap">{row.taxes > 0 ? `-${formatCurrency(row.taxes)}` : '$0'}</td>
                        <td className={`px-3 sm:px-4 py-2.5 text-right border-r border-slate-200 font-bold whitespace-nowrap ${row.netFlow < 0 ? 'bg-red-50/30 text-red-700' : 'bg-indigo-50/30 text-indigo-700'}`}>{row.netFlow > 0 && '+'}{formatCurrency(row.netFlow)}</td>
                        <td className={`px-3 sm:px-4 py-2.5 text-right border-r border-slate-200 whitespace-nowrap ${row.growth >= 0 ? 'bg-emerald-50/30 text-emerald-700' : 'bg-red-50/30 text-red-700 font-bold'}`}>
                          <div className="flex flex-col items-end">
                            <span>{formatCurrency(row.growth)}</span>
                            {row.crashTriggered && <span className="text-[9px] text-red-600 font-black uppercase italic mt-0.5">Crash!</span>}
                          </div>
                        </td>
                        <td className={`px-3 sm:px-4 py-2.5 text-right tracking-tight border-l-2 border-slate-300 whitespace-nowrap ${row.endBal < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                          <div className="font-bold text-sm sm:text-base">{formatCurrency(row.endBal)}</div>
                          <div className="flex text-[9px] sm:text-[10px] text-slate-500 font-mono mt-0.5 justify-end space-x-1">
                            <span title="Trad">{formatCurrency(row.endTrad)}</span>|<span title="Roth (Inv)" className="text-indigo-600">{formatCurrency(row.endRoth)}</span>|<span title="Roth (Cash)" className="text-amber-600">{formatCurrency(row.endCash)}</span>|<span title="Home" className="text-emerald-600">{formatCurrency(row.endHome)}</span>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-100/50 border-b border-slate-300 shadow-inner">
                          <td colSpan="9" className="p-3 sm:p-5 md:px-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
                              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col shadow-sm"><h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3 border-b border-slate-100 pb-2">Traditional 401k/IRA</h5><div className="flex-1 space-y-1.5"><MathRow label="Start Balance" val={row.tradFlow.start} /><MathRow label="Contributions" val={row.tradFlow.contrib} isPos /><MathRow label="Inv. Growth" val={row.tradFlow.growth} isPos={row.tradFlow.growth > 0} isNeg={row.tradFlow.growth < 0} /><MathRow label="Drawn (Expenses)" val={row.tradFlow.drawnExp} isNeg /><MathRow label="Drawn (Buffer Top-Up)" val={row.tradFlow.drawnBuf} isNeg /><MathRow label="Taxes (on Trad Draw)" val={row.tradFlow.tax} isNeg /></div><div className="border-t border-slate-100 pt-3 mt-3 font-bold flex justify-between text-xs text-slate-800"><span>End</span><span>{formatCurrency(row.tradFlow.end)}</span></div></div>
                              <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100 flex flex-col shadow-sm"><h5 className="text-[10px] font-bold text-indigo-600 uppercase mb-3 border-b border-indigo-100/50 pb-2">Roth IRA/401k (Invested)</h5><div className="flex-1 space-y-1.5"><MathRow label="Start Balance" val={row.rothFlow.start} /><MathRow label="Contributions" val={row.rothFlow.contrib} isPos /><MathRow label="Inv. Growth" val={row.rothFlow.growth} isPos={row.rothFlow.growth > 0} isNeg={row.rothFlow.growth < 0} /><MathRow label="Drawn (Expenses)" val={row.rothFlow.drawnExp} isNeg /><MathRow label="Drawn (Buffer Top-Up)" val={row.rothFlow.drawnBuf} isNeg /><MathRow label="Surplus Saved" val={row.rothFlow.surplus} isPos /></div><div className="border-t border-indigo-100/50 pt-3 mt-3 font-bold flex justify-between text-xs text-indigo-900"><span>End</span><span>{formatCurrency(row.rothFlow.end)}</span></div></div>
                              <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100 flex flex-col shadow-sm"><h5 className="text-[10px] font-bold text-amber-600 uppercase mb-3 border-b border-amber-100/50 pb-2">Roth Cash Reserves</h5><div className="flex-1 space-y-1.5"><MathRow label="Start Balance" val={row.cashFlow.start} /><MathRow label="Contributions" val={row.cashFlow.contrib} isPos /><MathRow label="Yield/Interest" val={row.cashFlow.growth} isPos={row.cashFlow.growth > 0} isNeg={row.cashFlow.growth < 0} /><MathRow label="Drawn (Expenses)" val={row.cashFlow.drawnExp} isNeg /><MathRow label="Transfers In" val={row.cashFlow.transferIn} isPos /></div><div className="border-t border-amber-100/50 pt-3 mt-3 font-bold flex justify-between text-xs text-amber-900"><span>End</span><span>{formatCurrency(row.cashFlow.end)}</span></div></div>
                              <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 flex flex-col shadow-sm"><h5 className="text-[10px] font-bold text-emerald-600 uppercase mb-3 border-b border-emerald-100/50 pb-2">Home Equity</h5><div className="flex-1 space-y-1.5"><MathRow label="Start Balance" val={row.homeFlow.start} /><MathRow label="Appreciation" val={row.homeFlow.growth} isPos={row.homeFlow.growth > 0} isNeg={row.homeFlow.growth < 0} /><MathRow label="Principal Paydown" val={row.homeFlow.paydown} isPos /></div><div className="border-t border-emerald-100/50 pt-3 mt-3 font-bold flex justify-between text-xs text-emerald-900"><span>End</span><span>{formatCurrency(row.homeFlow.end)}</span></div></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }`}} />
    </div>
  );
}