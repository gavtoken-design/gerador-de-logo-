
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Box, Image as ImageIcon, Wand2, Layers, Plus, Trash2, Download, History, Sparkles, Shirt, Move, Maximize, RotateCcw, Zap, Cpu, ArrowRight, Globe, Scan, Camera, Aperture, Repeat, SprayCan, Triangle, Package, Menu, X, Check, MousePointer2, Ruler, Languages } from 'lucide-react';
import { Button } from './components/Button';
import { FileUploader } from './components/FileUploader';
import { generateMockup, generateAsset } from './services/geminiService';
import { Asset, GeneratedMockup, AppView, LoadingState, PlacedLayer, Guide } from './types';
import { useApiKey } from './hooks/useApiKey';
import ApiKeyDialog from './components/ApiKeyDialog';

// --- Translations ---

type Language = 'en' | 'pt';

const translations = {
  en: {
    appTitle: "SKU FOUNDRY",
    dashboard: "Dashboard",
    assets: "Assets",
    studio: "Studio",
    gallery: "Gallery",
    uploadAssets: "Upload Assets",
    designMockup: "Design Mockup",
    downloadResult: "Download Result",
    heroTitle: "Create Realistic",
    heroHighlight: "Merchandise Mockups",
    heroSubtitle: "Upload your logos and products, and let our AI composite them perfectly with realistic lighting, shadows, and warping.",
    startCreating: "Start Creating",
    assetMgmt: "Asset Management",
    assetMgmtDesc: "Organize logos and product bases.",
    aiComp: "AI Compositing",
    aiCompDesc: "Smart blending and surface mapping.",
    highResExport: "High-Res Export",
    highResExportDesc: "Production-ready visuals.",
    products: "Products",
    logos: "Logos & Graphics",
    items: "items",
    noItems: "No {type}s yet",
    upload: "Upload",
    generateAi: "Generate with AI",
    describePrompt: "Describe the {type} you want to create...",
    generateAssetBtn: "Generate {type}",
    continueStudio: "Continue to Studio",
    selectProduct: "1. Select Product",
    addLogos: "2. Add Logos",
    onCanvas: "on canvas",
    addLogosHint: "Click to add. Drag on canvas to move. Scroll to resize.",
    layoutTools: "3. Layout Tools",
    showGuides: "Show Guides",
    hGuide: "+ H-Guide",
    vGuide: "+ V-Guide",
    clearGuides: "Clear all guides",
    instructions: "4. Instructions",
    promptPlaceholder: "E.g. Embed the logos into the fabric texture...",
    generateMockupBtn: "Generate Mockup",
    analyzing: "Analyzing composite geometry...",
    selectProductPrompt: "Select a product to start designing",
    generatedMockups: "Generated Mockups",
    newMockup: "New Mockup",
    view: "View",
    save: "Save",
    noMockups: "No mockups yet",
    createFirst: "Create your first design in the Studio",
    credits: "Credits",
    documentation: "Documentation",
    prohibitedPolicy: "By using this app, you confirm that you have the necessary rights to any content that you upload. Your use is subject to our Prohibited Use Policy.",
    languageToggle: "PT | EN"
  },
  pt: {
    appTitle: "SKU FOUNDRY",
    dashboard: "Início",
    assets: "Arquivos",
    studio: "Estúdio",
    gallery: "Galeria",
    uploadAssets: "Carregar Arquivos",
    designMockup: "Criar Mockup",
    downloadResult: "Baixar Resultado",
    heroTitle: "Crie Mockups de",
    heroHighlight: "Produtos Realistas",
    heroSubtitle: "Envie seus logotipos e produtos, e deixe nossa IA compô-los perfeitamente com iluminação, sombras e distorções realistas.",
    startCreating: "Começar a Criar",
    assetMgmt: "Gestão de Ativos",
    assetMgmtDesc: "Organize logos e bases de produtos.",
    aiComp: "Composição por IA",
    aiCompDesc: "Mistura inteligente e mapeamento de superfície.",
    highResExport: "Exportação HD",
    highResExportDesc: "Visuais prontos para produção.",
    products: "Produtos",
    logos: "Logos e Gráficos",
    items: "itens",
    noItems: "Nenhum {type} ainda",
    upload: "Upload",
    generateAi: "Gerar com IA",
    describePrompt: "Descreva o {type} que deseja criar...",
    generateAssetBtn: "Gerar {type}",
    continueStudio: "Continuar para Estúdio",
    selectProduct: "1. Selecionar Produto",
    addLogos: "2. Adicionar Logos",
    onCanvas: "na tela",
    addLogosHint: "Clique para adicionar. Arraste para mover. Scroll para redimensionar.",
    layoutTools: "3. Ferramentas",
    showGuides: "Mostrar Guias",
    hGuide: "+ Guia-H",
    vGuide: "+ Guia-V",
    clearGuides: "Limpar guias",
    instructions: "4. Instruções",
    promptPlaceholder: "Ex: Incorpore os logos na textura do tecido...",
    generateMockupBtn: "Gerar Mockup",
    analyzing: "Analisando geometria composta...",
    selectProductPrompt: "Selecione um produto para começar",
    generatedMockups: "Mockups Gerados",
    newMockup: "Novo Mockup",
    view: "Ver",
    save: "Salvar",
    noMockups: "Nenhum mockup ainda",
    createFirst: "Crie seu primeiro design no Estúdio",
    credits: "Créditos",
    documentation: "Documentação",
    prohibitedPolicy: "Ao usar este app, você confirma que possui os direitos sobre o conteúdo enviado. Seu uso está sujeito à nossa Política de Uso Proibido.",
    languageToggle: "EN | PT"
  }
};

// --- Intro Animation Component ---

const IntroSequence = ({ onComplete, lang }: { onComplete: () => void, lang: Language }) => {
  const [phase, setPhase] = useState<'enter' | 'wait' | 'spray' | 'admire' | 'exit' | 'prism' | 'explode'>('enter');

  useEffect(() => {
    const schedule = [
      { t: 100, fn: () => setPhase('enter') },
      { t: 1800, fn: () => setPhase('wait') },
      { t: 2400, fn: () => setPhase('spray') },
      { t: 4000, fn: () => setPhase('admire') },
      { t: 5000, fn: () => setPhase('exit') },
      { t: 5600, fn: () => setPhase('prism') },
      { t: 7800, fn: () => setPhase('explode') },
      { t: 8500, fn: () => onComplete() }
    ];

    const timers = schedule.map(s => setTimeout(s.fn, s.t));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden font-sans select-none
      ${phase === 'explode' ? 'animate-[fadeOut_1s_ease-out_forwards] pointer-events-none' : ''}
    `}>
      <div className={`absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-300 ease-out ${phase === 'explode' ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>

      <div className="relative w-full max-w-4xl h-96 flex items-center justify-center scale-[0.6] md:scale-100">
        {(phase !== 'prism' && phase !== 'explode') && (
          <div className={`relative z-10 flex flex-col items-center transition-transform will-change-transform
             ${phase === 'enter' ? 'animate-[hopIn_1.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]' : ''}
             ${phase === 'exit' ? 'animate-[anticipateSprint_0.8s_ease-in_forwards]' : ''}
          `}>
             <div className={`w-32 h-36 bg-zinc-100 rounded-xl relative overflow-hidden shadow-2xl transition-all duration-300 border-4
                ${phase === 'spray' || phase === 'admire' || phase === 'exit' 
                  ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.5)]' 
                  : 'border-zinc-300'}
             `}>
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-zinc-200/50 border-x border-zinc-300/50 transition-opacity duration-200 ${phase === 'spray' || phase === 'admire' || phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}></div>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-10 bg-zinc-800 rounded-md flex items-center justify-center gap-4 overflow-hidden border border-zinc-700 shadow-inner z-20">
                   <div className={`w-2 h-2 bg-cyan-400 rounded-full transition-all duration-300 ${phase === 'spray' ? 'scale-y-10 bg-yellow-400' : 'animate-pulse'}`}></div>
                   <div className={`w-2 h-2 bg-cyan-400 rounded-full transition-all duration-300 ${phase === 'spray' ? 'scale-y-10 bg-yellow-400' : 'animate-pulse'}`}></div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 transition-opacity duration-500 ${phase === 'spray' || phase === 'admire' || phase === 'exit' ? 'opacity-100' : 'opacity-0'}`}></div>
                <div className={`absolute inset-0 bg-white mix-blend-overlay pointer-events-none ${phase === 'spray' ? 'animate-[flash_0.2s_ease-out]' : 'opacity-0'}`}></div>
                <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500 transform z-20
                   ${phase === 'spray' || phase === 'admire' || phase === 'exit' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4'}
                `}>
                   <div className="w-10 h-10 bg-white text-indigo-600 rounded flex items-center justify-center shadow-lg">
                      <Package size={24} strokeWidth={3} />
                   </div>
                </div>
             </div>
             <div className="flex gap-10 -mt-1 z-0">
                <div className={`w-3 h-8 bg-zinc-800 rounded-b-full origin-top ${phase === 'enter' ? 'animate-[legMove_0.2s_infinite_alternate]' : ''} ${phase === 'exit' ? 'animate-[legMove_0.1s_infinite_alternate]' : ''}`}></div>
                <div className={`w-3 h-8 bg-zinc-800 rounded-b-full origin-top ${phase === 'enter' ? 'animate-[legMove_0.2s_infinite_alternate-reverse]' : ''} ${phase === 'exit' ? 'animate-[legMove_0.1s_infinite_alternate-reverse]' : ''}`}></div>
             </div>
          </div>
        )}

        {phase === 'spray' && (
          <div className="absolute z-20 animate-[swoopIn_0.4s_cubic-bezier(0.17,0.67,0.83,0.67)_forwards]" style={{ right: '22%', top: '5%' }}>
             <div className="relative animate-[shake_0.15s_infinite]">
                <SprayCan size={80} className="text-zinc-300 fill-zinc-800 rotate-[-15deg] drop-shadow-2xl" />
                <div className="absolute top-0 -left-4 w-6 h-6 bg-white rounded-full blur-md animate-ping"></div>
                <div className="absolute top-4 -left-8 w-40 h-40 pointer-events-none overflow-visible">
                   {[...Array(20)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-[sprayParticle_0.4s_linear_forwards]"
                        style={{ 
                           top: Math.random() * 20, 
                           left: 0,
                           animationDelay: `${Math.random() * 0.3}s`,
                        }}
                      />
                   ))}
                </div>
             </div>
          </div>
        )}

        {(phase === 'prism' || phase === 'explode') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
             <div className={`relative w-32 h-32 animate-[spinAppear_1.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]`}>
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                   <defs>
                      <linearGradient id="prismStroke" x1="0" y1="0" x2="1" y2="1">
                         <stop offset="0%" stopColor="#6366f1" />
                         <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                   </defs>
                   <path 
                      d="M50 10 L90 85 L10 85 Z" 
                      fill="none" 
                      stroke="url(#prismStroke)" 
                      strokeWidth="4" 
                      strokeLinejoin="round"
                      className="animate-[drawStroke_1s_ease-out_forwards]"
                   />
                   <path 
                      d="M50 10 L50 85 M50 50 L90 85 M50 50 L10 85" 
                      stroke="url(#prismStroke)" 
                      strokeWidth="1.5" 
                      className="opacity-40"
                   />
                </svg>
             </div>
             <div className="text-center animate-[popIn_0.8s_cubic-bezier(0.17,0.67,0.83,0.67)_0.5s_forwards] opacity-0">
                <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{translations[lang].appTitle}</h1>
                <p className="text-sm text-indigo-400 font-mono tracking-[0.3em] uppercase">{lang === 'en' ? 'AI Product Visualization' : 'Visualização de Produtos por IA'}</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- UI Components ---

const NavButton = ({ icon, label, active, onClick, number }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, number?: number }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
      ${active ? 'bg-indigo-500/10 text-white border-l-2 border-indigo-500' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'}`}
  >
    <span className={`${active ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'} transition-colors`}>
      {icon}
    </span>
    <span className="font-medium text-sm tracking-wide flex-1 text-left">{label}</span>
    {number && (
      <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded min-w-[1.5rem] text-center transition-colors ${active ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
        {number}
      </span>
    )}
  </button>
);

const WorkflowStepper = ({ currentView, onViewChange, lang }: { currentView: AppView, onViewChange: (view: AppView) => void, lang: Language }) => {
  const steps = [
    { id: 'assets', label: translations[lang].uploadAssets, number: 1 },
    { id: 'studio', label: translations[lang].designMockup, number: 2 },
    { id: 'gallery', label: translations[lang].downloadResult, number: 3 },
  ];

  const viewOrder = ['assets', 'studio', 'gallery'];
  const currentIndex = viewOrder.indexOf(currentView);
  const progress = Math.max(0, (currentIndex / (steps.length - 1)) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 hidden md:block animate-fade-in px-4">
      <div className="relative">
         <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -translate-y-1/2 rounded-full"></div>
         <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
         ></div>

         <div className="relative flex justify-between w-full">
            {steps.map((step, index) => {
               const isCompleted = currentIndex > index;
               const isCurrent = currentIndex === index;
               return (
                  <button 
                    key={step.id}
                    onClick={() => onViewChange(step.id as AppView)}
                    className={`group flex flex-col items-center focus:outline-none relative z-10 cursor-pointer`}
                  >
                     <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 bg-zinc-950
                        ${isCurrent 
                           ? 'border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110' 
                           : isCompleted 
                              ? 'border-indigo-600 bg-indigo-600 text-white' 
                              : 'border-zinc-800 text-zinc-600 group-hover:border-zinc-600 group-hover:text-zinc-400'}
                     `}>
                        {isCompleted ? (
                           <Check size={18} strokeWidth={3} />
                        ) : (
                           <span className="text-sm font-bold font-mono">{step.number}</span>
                        )}
                     </div>
                     <span className={`
                        absolute top-14 text-xs font-medium tracking-wider transition-all duration-300 whitespace-nowrap
                        ${isCurrent ? 'text-indigo-400 opacity-100 transform translate-y-0' : isCompleted ? 'text-zinc-400 opacity-80' : 'text-zinc-600 opacity-60 group-hover:opacity-100'}
                     `}>
                        {step.label}
                     </span>
                  </button>
               )
            })}
         </div>
      </div>
    </div>
  )
};

const AssetSection = ({ 
  title, 
  icon, 
  type, 
  assets, 
  onAdd, 
  onRemove,
  validateApiKey,
  onApiError,
  lang
}: { 
  title: string, 
  icon: React.ReactNode, 
  type: 'logo' | 'product', 
  assets: Asset[], 
  onAdd: (a: Asset) => void, 
  onRemove: (id: string) => void,
  validateApiKey: () => Promise<boolean>,
  onApiError: (e: any) => void,
  lang: Language
}) => {
  const [mode, setMode] = useState<'upload' | 'generate'>('upload');
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const t = translations[lang];

  const handleGenerate = async () => {
    if (!genPrompt) return;
    if (!(await validateApiKey())) return;
    setIsGenerating(true);
    try {
      const b64 = await generateAsset(genPrompt, type);
      onAdd({
        id: Math.random().toString(36).substring(7),
        type,
        name: `AI Generated ${type}`,
        data: b64,
        mimeType: 'image/png'
      });
      setGenPrompt('');
    } catch (e: any) {
      console.error(e);
      onApiError(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">{icon} {title}</h2>
          <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{assets.length} {t.items}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 overflow-y-auto max-h-[400px] pr-2">
          {assets.map(asset => (
            <div key={asset.id} className="relative group aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700">
                <img src={asset.data} className="w-full h-full object-contain p-2" alt={asset.name} />
                <button onClick={() => onRemove(asset.id)} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={12} />
                </button>
            </div>
          ))}
          {assets.length === 0 && (
            <div className="col-span-2 sm:col-span-3 flex flex-col items-center justify-center h-32 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-sm">{t.noItems.replace('{type}', type === 'product' ? (lang === 'en' ? 'product' : 'produto') : 'logo')}</p>
            </div>
          )}
      </div>
      <div className="mt-auto pt-4 border-t border-zinc-800">
        <div className="flex gap-4 mb-4">
           <button onClick={() => setMode('upload')} className={`text-sm font-medium pb-1 border-b-2 transition-colors ${mode === 'upload' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
             {t.upload}
           </button>
           <button onClick={() => setMode('generate')} className={`text-sm font-medium pb-1 border-b-2 transition-colors ${mode === 'generate' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
             {t.generateAi}
           </button>
        </div>
        {mode === 'upload' ? (
           <FileUploader label={`${t.upload} ${type === 'product' ? (lang === 'en' ? 'Product' : 'Produto') : 'Logo'}`} onFileSelect={(f) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                onAdd({ id: Math.random().toString(36).substring(7), type, name: f.name, data: e.target?.result as string, mimeType: f.type });
              };
              reader.readAsDataURL(f);
           }} />
        ) : (
           <div className="space-y-3">
              <textarea 
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                placeholder={t.describePrompt.replace('{type}', type === 'product' ? (lang === 'en' ? 'product' : 'produto') : 'logo')}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-base text-white focus:ring-2 focus:ring-indigo-500 resize-none h-24 placeholder:text-zinc-600"
              />
              <Button onClick={handleGenerate} isLoading={isGenerating} disabled={!genPrompt} className="w-full" icon={<Sparkles size={16} />}>
                {t.generateAssetBtn.replace('{type}', type === 'product' ? (lang === 'en' ? 'Product' : 'Produto') : 'Logo')}
              </Button>
           </div>
        )}
      </div>
    </div>
  );
};


// --- App Component ---

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [view, setView] = useState<AppView>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [generatedMockups, setGeneratedMockups] = useState<GeneratedMockup[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMockup, setSelectedMockup] = useState<GeneratedMockup | null>(null);

  const [guides, setGuides] = useState<Guide[]>([]);
  const [showGuides, setShowGuides] = useState(true);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [placedLogos, setPlacedLogos] = useState<PlacedLayer[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState<LoadingState>({ isGenerating: false, message: '' });

  const { showApiKeyDialog, setShowApiKeyDialog, validateApiKey, handleApiKeyDialogContinue } = useApiKey();

  const t = translations[language];

  const handleApiError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    let shouldOpenDialog = false;
    if (errorMessage.includes('Requested entity was not found')) {
      shouldOpenDialog = true;
    } else if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key not valid') || errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403')) {
      shouldOpenDialog = true;
    }
    if (shouldOpenDialog) setShowApiKeyDialog(true);
    else alert(`Operation failed: ${errorMessage}`);
  };

  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<{ uid: string, type: 'layer' | 'guide', guideType?: 'horizontal' | 'vertical', startX: number, startY: number, initX: number, initY: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  const addLogoToCanvas = (assetId: string) => {
    const newLayer: PlacedLayer = { uid: Math.random().toString(36).substr(2, 9), assetId, x: 50, y: 50, scale: 1, rotation: 0 };
    setPlacedLogos(prev => [...prev, newLayer]);
  };

  const removeLogoFromCanvas = (uid: string, e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setPlacedLogos(prev => prev.filter(l => l.uid !== uid));
  };

  const handleStart = (clientX: number, clientY: number, item: any, type: 'layer' | 'guide') => {
    if (type === 'layer') setDraggedItem({ uid: item.uid, type: 'layer', startX: clientX, startY: clientY, initX: item.x, initY: item.y });
    else if (type === 'guide') setDraggedItem({ uid: item.id, type: 'guide', guideType: item.type, startX: clientX, startY: clientY, initX: item.position, initY: item.position });
  };

  const handleMouseDown = (e: React.MouseEvent, item: any, type: 'layer' | 'guide') => { e.preventDefault(); e.stopPropagation(); handleStart(e.clientX, e.clientY, item, type); };
  const handleTouchStart = (e: React.TouchEvent, item: any, type: 'layer' | 'guide') => { e.stopPropagation(); const touch = e.touches[0]; handleStart(touch.clientX, touch.clientY, item, type); };

  const handleWheel = (e: React.WheelEvent, layerId: string) => {
     e.stopPropagation();
     const delta = e.deltaY > 0 ? -0.1 : 0.1;
     setPlacedLogos(prev => prev.map(l => (l.uid !== layerId ? l : { ...l, scale: Math.max(0.2, Math.min(3.0, l.scale + delta)) })));
  };

  const addGuide = (type: 'horizontal' | 'vertical') => {
    setGuides(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type, position: 50 }]);
    setShowGuides(true);
  };

  const removeGuide = (id: string, e?: React.MouseEvent | React.TouchEvent) => { e?.stopPropagation(); setGuides(prev => prev.filter(g => g.id !== id)); };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!draggedItem || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaXPercent = ((clientX - draggedItem.startX) / rect.width) * 100;
      const deltaYPercent = ((clientY - draggedItem.startY) / rect.height) * 100;
      if (draggedItem.type === 'layer') {
        setPlacedLogos(prev => prev.map(l => (l.uid !== draggedItem.uid ? l : { ...l, x: Math.max(0, Math.min(100, draggedItem.initX + deltaXPercent)), y: Math.max(0, Math.min(100, draggedItem.initY + deltaYPercent)) })));
      } else if (draggedItem.type === 'guide') {
        setGuides(prev => prev.map(g => (g.id !== draggedItem.uid ? g : { ...g, position: g.type === 'vertical' ? Math.max(0, Math.min(100, draggedItem.initX + deltaXPercent)) : Math.max(0, Math.min(100, draggedItem.initY + deltaYPercent)) })));
      }
    };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => setDraggedItem(null);
    const onTouchMove = (e: TouchEvent) => { if (draggedItem) { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); } };
    const onTouchEnd = () => setDraggedItem(null);
    if (draggedItem) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false }); 
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [draggedItem]);

  const handleGenerate = async () => {
    if (!selectedProductId && placedLogos.length === 0) return;
    const product = assets.find(a => a.id === selectedProductId);
    if (!product) { alert("Product not found."); return; }
    const layers = placedLogos.map(layer => {
        const asset = assets.find(a => a.id === layer.assetId);
        return asset ? { asset, placement: layer } : null;
    }).filter(Boolean) as { asset: Asset, placement: PlacedLayer }[];
    if (layers.length === 0) { alert("Add a logo first."); return; }
    if (!(await validateApiKey())) return;
    setLoading({ isGenerating: true, message: t.analyzing });
    try {
      const resultImage = await generateMockup(product, layers, prompt);
      setGeneratedMockups(prev => [{ id: Math.random().toString(36).substring(7), imageUrl: resultImage, prompt, createdAt: Date.now(), layers: placedLogos, productId: selectedProductId }, ...prev]);
      setView('gallery');
    } catch (e: any) { handleApiError(e); } finally { setLoading({ isGenerating: false, message: '' }); }
  };

  const toggleLanguage = () => setLanguage(l => l === 'en' ? 'pt' : 'en');

  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} lang={language} />;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex overflow-hidden relative">
      {showApiKeyDialog && <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />}
      
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 hidden md:flex flex-col">
        <div className="h-16 border-b border-zinc-800 flex items-center px-6">
          <Package className="text-indigo-500 mr-2" />
          <span className="font-bold text-lg tracking-tight">{t.appTitle}</span>
        </div>
        <div className="p-4 space-y-2 flex-1">
          <NavButton icon={<Layout size={18} />} label={t.dashboard} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavButton icon={<Box size={18} />} label={t.assets} active={view === 'assets'} number={assets.length > 0 ? assets.length : undefined} onClick={() => setView('assets')} />
          <NavButton icon={<Wand2 size={18} />} label={t.studio} active={view === 'studio'} number={placedLogos.length > 0 ? placedLogos.length : undefined} onClick={() => setView('studio')} />
          <NavButton icon={<ImageIcon size={18} />} label={t.gallery} active={view === 'gallery'} number={generatedMockups.length > 0 ? generatedMockups.length : undefined} onClick={() => setView('gallery')} />
        </div>
        <div className="p-4 border-t border-zinc-800">
          <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-center">
             <Button size="sm" variant="outline" className="w-full text-xs">{t.documentation}</Button>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center">
          <Package className="text-indigo-500 mr-2" />
          <span className="font-bold text-lg">{t.appTitle}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400 hover:text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-black/95 backdrop-blur-xl p-4 animate-fade-in flex flex-col">
          <div className="space-y-2">
            <NavButton icon={<Layout size={18} />} label={t.dashboard} active={view === 'dashboard'} onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }} />
            <NavButton icon={<Box size={18} />} label={t.assets} active={view === 'assets'} onClick={() => { setView('assets'); setIsMobileMenuOpen(false); }} />
            <NavButton icon={<Wand2 size={18} />} label={t.studio} active={view === 'studio'} onClick={() => { setView('studio'); setIsMobileMenuOpen(false); }} />
            <NavButton icon={<ImageIcon size={18} />} label={t.gallery} active={view === 'gallery'} onClick={() => { setView('gallery'); setIsMobileMenuOpen(false); }} />
          </div>
        </div>
      )}

      {selectedMockup && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedMockup(null)}>
          <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedMockup(null)} className="absolute top-4 right-4 md:top-0 md:-right-12 p-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors z-50 border border-zinc-700">
              <X size={24} />
            </button>
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-lg">
              <img src={selectedMockup.imageUrl} alt="Full size preview" className="max-w-full max-h-[85vh] object-contain shadow-2xl" />
            </div>
            <div className="mt-4 bg-zinc-900/90 backdrop-blur border border-zinc-700 px-6 py-3 rounded-full flex items-center gap-4">
               <p className="text-sm text-zinc-300 max-w-[200px] md:max-w-md truncate">{selectedMockup.prompt || t.appTitle}</p>
               <div className="h-4 w-px bg-zinc-700"></div>
               <a href={selectedMockup.imageUrl} download={`mockup-${selectedMockup.id}.png`} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-2">
                 <Download size={16} /> {t.save}
               </a>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
        <div className="sticky top-0 z-40 h-16 bg-black/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-8">
           <div className="text-sm text-zinc-400 breadcrumbs">
              <span className="opacity-50">App</span> 
              <span className="mx-2">/</span> 
              <span className="text-white capitalize">{t[view as keyof typeof t] || view}</span>
           </div>
           <div className="flex items-center gap-4">
              <Button size="sm" variant="ghost" onClick={toggleLanguage} icon={<Languages size={16}/>}>
                {t.languageToggle}
              </Button>
              <Button size="sm" variant="ghost" icon={<Sparkles size={16}/>}>{t.credits}: ∞</Button>
           </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 md:p-12">
           {view === 'dashboard' && (
              <div className="animate-fade-in space-y-8">
                 <div className="text-center py-12">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 text-white">
                       {t.heroTitle} <br/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">{t.heroHighlight}</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">{t.heroSubtitle}</p>
                    <Button size="lg" onClick={() => setView('assets')} icon={<ArrowRight size={20} />}>{t.startCreating}</Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                       { icon: <Box className="text-indigo-400" />, title: t.assetMgmt, desc: t.assetMgmtDesc },
                       { icon: <Wand2 className="text-purple-400" />, title: t.aiComp, desc: t.aiCompDesc },
                       { icon: <Download className="text-pink-400" />, title: t.highResExport, desc: t.highResExportDesc }
                    ].map((feat, i) => (
                       <div key={i} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-indigo-500/30 transition-colors">
                          <div className="mb-4 p-3 bg-zinc-900 w-fit rounded-lg">{feat.icon}</div>
                          <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                          <p className="text-zinc-500">{feat.desc}</p>
                       </div>
                    ))}
                 </div>
                 <footer className="mt-20 pt-8 border-t border-zinc-900 text-center">
                    <p className="text-white text-sm max-w-2xl mx-auto leading-relaxed">{t.prohibitedPolicy}</p>
                 </footer>
              </div>
           )}

           {view === 'assets' && (
              <div className="animate-fade-in">
                <WorkflowStepper currentView="assets" onViewChange={setView} lang={language} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <AssetSection title={t.products} icon={<Box size={20} />} type="product" assets={assets.filter(a => a.type === 'product')} onAdd={(a) => setAssets(prev => [...prev, a])} onRemove={(id) => setAssets(prev => prev.filter(a => a.id !== id))} validateApiKey={validateApiKey} onApiError={handleApiError} lang={language} />
                  <AssetSection title={t.logos} icon={<Layers size={20} />} type="logo" assets={assets.filter(a => a.type === 'logo')} onAdd={(a) => setAssets(prev => [...prev, a])} onRemove={(id) => setAssets(prev => prev.filter(a => a.id !== id))} validateApiKey={validateApiKey} onApiError={handleApiError} lang={language} />
                </div>
                <div className="mt-8 flex justify-end">
                   <Button onClick={() => setView('studio')} disabled={assets.length < 2} icon={<ArrowRight size={16} />}>{t.continueStudio}</Button>
                </div>
              </div>
           )}

           {view === 'studio' && (
             <div className="animate-fade-in h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
                <div className="w-full lg:w-80 flex flex-col gap-6 glass-panel p-6 rounded-2xl overflow-y-auto flex-1 lg:flex-none">
                   <div>
                      <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">{t.selectProduct}</h3>
                      <div className="grid grid-cols-3 gap-2">
                         {assets.filter(a => a.type === 'product').map(a => (
                            <div key={a.id} onClick={() => setSelectedProductId(selectedProductId === a.id ? null : a.id)} className={`aspect-square rounded-lg border-2 cursor-pointer p-1 transition-all ${selectedProductId === a.id ? 'border-indigo-500 bg-indigo-500/20' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900'}`}>
                               <img src={a.data} className="w-full h-full object-contain" alt={a.name} />
                            </div>
                         ))}
                      </div>
                   </div>
                   <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">{t.addLogos}</h3>
                        {placedLogos.length > 0 && <span className="text-xs text-indigo-400">{placedLogos.length} {t.onCanvas}</span>}
                      </div>
                      <p className="text-xs text-zinc-400 mb-2">{t.addLogosHint}</p>
                      <div className="grid grid-cols-3 gap-2">
                         {assets.filter(a => a.type === 'logo').map(a => (
                            <div key={a.id} onClick={() => addLogoToCanvas(a.id)} className={`relative aspect-square rounded-lg border-2 cursor-pointer p-1 transition-all border-zinc-700 hover:border-zinc-500 bg-zinc-900`}>
                               <img src={a.data} className="w-full h-full object-contain" alt={a.name} />
                               {placedLogos.filter(l => l.assetId === a.id).length > 0 && (
                                   <div className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold border border-zinc-900">
                                       {placedLogos.filter(l => l.assetId === a.id).length}
                                   </div>
                               )}
                            </div>
                         ))}
                      </div>
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">{t.layoutTools}</h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                          <span className="text-xs text-zinc-400 flex items-center gap-2"><Ruler size={14}/> {t.showGuides}</span>
                          <button onClick={() => setShowGuides(!showGuides)} className={`w-10 h-5 rounded-full relative transition-colors ${showGuides ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showGuides ? 'left-6' : 'left-1'}`}></div>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" onClick={() => addGuide('horizontal')} className="text-xs">{t.hGuide}</Button>
                          <Button variant="outline" size="sm" onClick={() => addGuide('vertical')} className="text-xs">{t.vGuide}</Button>
                        </div>
                        {guides.length > 0 && <div className="flex justify-center"><button onClick={() => setGuides([])} className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors">{t.clearGuides}</button></div>}
                      </div>
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">{t.instructions}</h3>
                      <textarea className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-base text-white focus:ring-2 focus:ring-indigo-500 resize-none h-24" placeholder={t.promptPlaceholder} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                   </div>
                   <Button onClick={handleGenerate} isLoading={loading.isGenerating} disabled={!selectedProductId || placedLogos.length === 0} size="lg" className="mt-auto" icon={<Wand2 size={18} />}>
                      {t.generateMockupBtn}
                   </Button>
                </div>
                <div className="h-[45vh] lg:h-auto lg:flex-1 glass-panel rounded-2xl flex items-center justify-center bg-zinc-900 relative overflow-hidden select-none flex-shrink-0">
                   {loading.isGenerating && (
                      <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                         <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                         <p className="text-indigo-400 font-mono animate-pulse">{loading.message}</p>
                      </div>
                   )}
                   {selectedProductId ? (
                      <div ref={canvasRef} className="relative w-full h-full max-h-[600px] p-4">
                         <img src={assets.find(a => a.id === selectedProductId)?.data} className="w-full h-full object-contain drop-shadow-2xl pointer-events-none" alt="Preview" draggable={false} />
                         {showGuides && guides.map(guide => (
                           <div key={guide.id} className={`absolute group cursor-move z-20 transition-opacity ${draggedItem?.uid === guide.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} style={{ top: guide.type === 'horizontal' ? `${guide.position}%` : 0, left: guide.type === 'vertical' ? `${guide.position}%` : 0, width: guide.type === 'horizontal' ? '100%' : '20px', height: guide.type === 'vertical' ? '100%' : '20px', transform: guide.type === 'horizontal' ? 'translateY(-50%)' : 'translateX(-50%)' }} onMouseDown={(e) => handleMouseDown(e, guide, 'guide')} onTouchStart={(e) => handleTouchStart(e, guide, 'guide')}>
                              <div className={`absolute ${guide.type === 'horizontal' ? 'w-full h-[1px] top-1/2' : 'h-full w-[1px] left-1/2'} bg-cyan-400/50 group-hover:bg-cyan-400 border-dashed border-cyan-400/50`}></div>
                              <div className={`absolute ${guide.type === 'horizontal' ? 'right-0 top-1/2 -translate-y-1/2' : 'bottom-0 left-1/2 -translate-x-1/2'} opacity-0 group-hover:opacity-100`}>
                                 <button onClick={(e) => removeGuide(guide.id, e)} className="bg-zinc-800 text-cyan-400 p-0.5 rounded border border-cyan-400/30 hover:bg-red-500 hover:text-white"><X size={10} /></button>
                              </div>
                           </div>
                         ))}
                         {placedLogos.map((layer) => {
                            const logoAsset = assets.find(a => a.id === layer.assetId);
                            if (!logoAsset) return null;
                            return (
                               <div key={layer.uid} className={`absolute cursor-move group ${draggedItem?.uid === layer.uid ? 'z-50 opacity-80' : 'z-10'}`} style={{ left: `${layer.x}%`, top: `${layer.y}%`, transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`, width: '15%', aspectRatio: '1/1' }} onMouseDown={(e) => handleMouseDown(e, layer, 'layer')} onTouchStart={(e) => handleTouchStart(e, layer, 'layer')} onWheel={(e) => handleWheel(e, layer.uid)}>
                                  <div className="absolute -inset-2 border-2 border-indigo-500/0 group-hover:border-indigo-500/50 rounded-lg pointer-events-none"></div>
                                  <button onClick={(e) => removeLogoFromCanvas(layer.uid, e)} className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
                                  <img src={logoAsset.data} className="w-full h-full object-contain pointer-events-none" draggable={false} alt="layer" />
                               </div>
                            );
                         })}
                      </div>
                   ) : (
                      <div className="text-center text-zinc-600">
                         <Shirt size={64} className="mx-auto mb-4 opacity-20" />
                         <p>{t.selectProductPrompt}</p>
                      </div>
                   )}
                </div>
             </div>
           )}

           {view === 'gallery' && (
              <div className="animate-fade-in">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">{t.generatedMockups}</h2>
                    <Button variant="outline" onClick={() => setView('studio')} icon={<Plus size={16}/>}>{t.newMockup}</Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedMockups.map(mockup => (
                       <div key={mockup.id} className="group glass-panel rounded-xl overflow-hidden">
                          <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                             <img src={mockup.imageUrl} className="w-full h-full object-cover group-hover:scale-105" alt="Mockup" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                                <Button size="sm" variant="secondary" icon={<Maximize size={16}/>} onClick={() => setSelectedMockup(mockup)}>{t.view}</Button>
                                <a href={mockup.imageUrl} download={`mockup-${mockup.id}.png`}><Button size="sm" variant="primary" icon={<Download size={16}/>}>{t.save}</Button></a>
                             </div>
                          </div>
                          <div className="p-4">
                             <p className="text-xs text-zinc-500 mb-1">{new Date(mockup.createdAt).toLocaleDateString()}</p>
                             <p className="text-sm text-zinc-300 line-clamp-2">{mockup.prompt || t.appTitle}</p>
                             {mockup.layers && mockup.layers.length > 0 && <div className="mt-2 flex gap-1"><span className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">{mockup.layers.length} logos</span></div>}
                          </div>
                       </div>
                    ))}
                    {generatedMockups.length === 0 && (
                       <div className="col-span-full py-20 text-center glass-panel rounded-xl">
                          <ImageIcon size={48} className="mx-auto mb-4 text-zinc-700" />
                          <h3 className="text-lg font-medium text-zinc-300">{t.noMockups}</h3>
                          <p className="text-zinc-500 mb-6">{t.createFirst}</p>
                          <Button onClick={() => setView('studio')}>{t.studio}</Button>
                       </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      </main>
    </div>
  );
}
