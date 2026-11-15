'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

interface SliderItem {
  id: number;
  imageUrl: string;
  titulo: string;
  descripcion: string;
  enlace: string;
  textoBoton: string;
}

// Sliders iniciales que coinciden con las imágenes de muestra de la captura
const DEFAULT_SLIDERS: SliderItem[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    titulo: 'Protección solar que va contigo',
    descripcion: 'Hasta 30% de descuento en bloqueadores solares de amplio espectro.',
    enlace: '/dashboard/productos?cat=dermatologia',
    textoBoton: 'Ver ofertas',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    titulo: 'Previene problemas bucales antes que aparezcan',
    descripcion: 'Cuidado dental completo con enjuagues y pastas dentales especializadas.',
    enlace: '/dashboard/productos?cat=bucal',
    textoBoton: 'Comprar ahora',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
    titulo: 'VICHY Dermocosmética',
    descripcion: 'Fórmulas hipoalergénicas recomendadas por dermatólogos.',
    enlace: '/dashboard/productos?cat=dermocosmetica',
    textoBoton: 'Explorar línea',
  },
];

export default function ConfiguracionPage() {
  // Estado de Logo
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoFileName, setLogoFileName] = useState('No se eligió ningún archivo');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Estado del Slider
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [sliderImageFile, setSliderImageFile] = useState<File | null>(null);
  const [sliderImagePreview, setSliderImagePreview] = useState<string | null>(null);
  const [sliderFileName, setSliderFileName] = useState('No se eligió ningún archivo');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enlace, setEnlace] = useState('');
  const [textoBoton, setTextoBoton] = useState('');
  const sliderInputRef = useRef<HTMLInputElement>(null);

  // Toasts
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Cargar configuración guardada de localStorage
  useEffect(() => {
    try {
      const savedLogo = localStorage.getItem('sgf_site_logo');
      if (savedLogo) {
        setCurrentLogo(savedLogo);
      }

      const savedSliders = localStorage.getItem('sgf_site_sliders');
      if (savedSliders) {
        setSliders(JSON.parse(savedSliders));
      } else {
        setSliders(DEFAULT_SLIDERS);
      }
    } catch {
      setSliders(DEFAULT_SLIDERS);
    }
  }, []);

  // Manejar selección de Logo
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogoFile(file);
      setLogoFileName(file.name);
    } else {
      setSelectedLogoFile(null);
      setLogoFileName('No se eligió ningún archivo');
    }
  };

  // Subir / Guardar Logo
  const handleUploadLogo = () => {
    if (!selectedLogoFile) {
      showToast('error', 'Por favor selecciona un archivo de imagen para el logo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCurrentLogo(dataUrl);
      localStorage.setItem('sgf_site_logo', dataUrl);
      showToast('success', 'Logo del sitio actualizado con éxito.');
      setSelectedLogoFile(null);
      setLogoFileName('No se eligió ningún archivo');
      if (logoInputRef.current) logoInputRef.current.value = '';
    };
    reader.readAsDataURL(selectedLogoFile);
  };

  // Manejar selección de imagen para el Slider
  const handleSliderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSliderImageFile(file);
      setSliderFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      setSliderImagePreview(previewUrl);
    } else {
      setSliderImageFile(null);
      setSliderImagePreview(null);
      setSliderFileName('No se eligió ningún archivo');
    }
  };

  // Añadir nueva diapositiva al Slider
  const handleAddSlider = (e: React.FormEvent) => {
    e.preventDefault();

    let imageToUse = sliderImagePreview;
    if (!imageToUse) {
      imageToUse = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop';
    }

    const newSlider: SliderItem = {
      id: Date.now(),
      imageUrl: imageToUse,
      titulo: titulo.trim() || 'Promoción Especial',
      descripcion: descripcion.trim() || 'Aprovecha nuestras ofertas exclusivas en farmacia.',
      enlace: enlace.trim() || '/dashboard/productos',
      textoBoton: textoBoton.trim() || 'Ver catálogo',
    };

    const updatedSliders = [...sliders, newSlider];
    setSliders(updatedSliders);
    localStorage.setItem('sgf_site_sliders', JSON.stringify(updatedSliders));

    // Resetear formulario
    setTitulo('');
    setDescripcion('');
    setEnlace('');
    setTextoBoton('');
    setSliderImageFile(null);
    setSliderImagePreview(null);
    setSliderFileName('No se eligió ningún archivo');
    if (sliderInputRef.current) sliderInputRef.current.value = '';

    showToast('success', 'Nueva diapositiva añadida al slider.');
  };

  // Eliminar imagen del Slider
  const handleDeleteSlider = (id: number) => {
    const updated = sliders.filter((s) => s.id !== id);
    setSliders(updated);
    localStorage.setItem('sgf_site_sliders', JSON.stringify(updated));
    showToast('success', 'Diapositiva eliminada del slider.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notificación */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all animate-in slide-in-from-bottom-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ─── GRID DE CONFIGURACIÓN (COLUMNA IZQUIERDA Y DERECHA) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* COLUMNA IZQUIERDA: LOGO DEL SITIO                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60">
          <h2 className="text-base font-bold text-slate-800 tracking-tight pb-4 border-b border-slate-100/60 mb-6">
            Logo del Sitio
          </h2>

          <div className="space-y-6">
            {/* Logo Actual */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Logo Actual
              </label>
              <div className="size-20 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-center p-3">
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt="Logo actual"
                    className="size-full object-contain"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-10 text-[#2dd4bf] fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-6v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h6V3z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Cambiar Logo */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Cambiar Logo
              </label>

              {/* File Input nativo estilizado como en la captura */}
              <div className="flex items-center rounded-xl border border-slate-200/90 bg-white overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2.5 bg-slate-50 border-r border-slate-200 font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  Elegir archivo
                </button>
                <span className="px-3.5 py-2 text-slate-400 truncate flex-1">
                  {logoFileName}
                </span>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleUploadLogo}
                className="px-5 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                SUBIR LOGO
              </button>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#64748b] hover:bg-[#475569] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>VISITAR PÁGINA</span>
              </a>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* COLUMNA DERECHA: SLIDER DE LA PÁGINA PRINCIPAL                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 shadow-sm shadow-slate-200/50 border border-slate-100/60">
          <h2 className="text-base font-bold text-slate-800 tracking-tight pb-4 border-b border-slate-100/60 mb-6">
            Slider de la Página Principal
          </h2>

          <form onSubmit={handleAddSlider} className="space-y-5">
            {/* 1. Archivo de Imagen */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Archivo de Imagen
              </label>
              <div className="flex items-center rounded-xl border border-slate-200/90 bg-white overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => sliderInputRef.current?.click()}
                  className="px-4 py-2.5 bg-slate-50 border-r border-slate-200 font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  Elegir archivo
                </button>
                <span className="px-3.5 py-2 text-slate-400 truncate flex-1">
                  {sliderFileName}
                </span>
                <input
                  ref={sliderInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSliderFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* 2. Título */}
            <div className="space-y-1.5">
              <label
                htmlFor="tituloInput"
                className="block text-xs font-bold text-slate-700"
              >
                Título
              </label>
              <input
                id="tituloInput"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Gran Descuento"
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50/50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
              />
            </div>

            {/* 3. Descripción */}
            <div className="space-y-1.5">
              <label
                htmlFor="descInput"
                className="block text-xs font-bold text-slate-700"
              >
                Descripción
              </label>
              <textarea
                id="descInput"
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: 48 horas de descuento en productos seleccionados."
                className="w-full p-3.5 text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50/50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* 4. Enlace (URL) */}
            <div className="space-y-1.5">
              <label
                htmlFor="urlInput"
                className="block text-xs font-bold text-slate-700"
              >
                Enlace (URL)
              </label>
              <input
                id="urlInput"
                type="text"
                value={enlace}
                onChange={(e) => setEnlace(e.target.value)}
                placeholder="Ej: https://tutienda.com/ofertas"
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50/50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
              />
            </div>

            {/* 5. Texto del Botón */}
            <div className="space-y-1.5">
              <label
                htmlFor="btnTextInput"
                className="block text-xs font-bold text-slate-700"
              >
                Texto del Botón
              </label>
              <input
                id="btnTextInput"
                type="text"
                value={textoBoton}
                onChange={(e) => setTextoBoton(e.target.value)}
                placeholder="Ej: Comprar ahora"
                className="w-full h-11 px-4 text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50/50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Botón Añadir alineado a la derecha */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                AÑADIR IMAGEN AL SLIDER
              </button>
            </div>
          </form>

          {/* ─── SECCIÓN: IMÁGENES ACTUALES DEL SLIDER ─── */}
          <div className="mt-10 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-4">
              Imágenes Actuales del Slider
            </h3>

            {sliders.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No hay diapositivas activas en el slider principal.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sliders.map((item) => (
                  <div
                    key={item.id}
                    className="relative group rounded-2xl border border-slate-200/70 overflow-hidden bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.titulo}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteSlider(item.id)}
                        title="Eliminar diapositiva"
                        className="absolute top-2 right-2 size-7 rounded-lg bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-700 transition-all shadow-sm cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <div className="p-3 text-left">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                        {item.titulo}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {item.descripcion}
                      </p>
                      {item.textoBoton && (
                        <span className="inline-block mt-2 text-[10px] font-bold text-[#c026d3] uppercase tracking-wider">
                          Botón: {item.textoBoton}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

