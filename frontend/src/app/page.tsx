'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Clock,
  Award,
  Sparkles,
  Phone,
  Heart,
  Check,
  User,
  ArrowRight,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { Producto, Categoria } from '@/types';
import { getProductos } from '@/services/productoService';
import { getCategorias } from '@/services/categoriaService';

interface SliderItem {
  id: number;
  imageUrl: string;
  titulo: string;
  descripcion: string;
  enlace: string;
  textoBoton: string;
}

const DEFAULT_SLIDERS: SliderItem[] = [
  {
    id: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
    titulo: 'Protección solar que va contigo',
    descripcion:
      'Hasta 30% de descuento en bloqueadores solares dermatológicos de amplio espectro.',
    enlace: '#catalogo',
    textoBoton: 'Ver ofertas',
  },
  {
    id: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop',
    titulo: 'Previene problemas bucales antes que aparezcan',
    descripcion:
      'Cuidado dental especializado con enjuagues y pastas recomendadas por odontólogos.',
    enlace: '#catalogo',
    textoBoton: 'Comprar ahora',
  },
  {
    id: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
    titulo: 'VICHY Dermocosmética Avanzada',
    descripcion:
      'Fórmulas hipoalergénicas con agua volcánica mineralizante recomendadas por expertos.',
    enlace: '#catalogo',
    textoBoton: 'Explorar línea',
  },
];

const INITIAL_FALLBACK_PRODUCTS: Producto[] = [
  {
    id: 1,
    codigo: '001',
    nombre: 'Desodorante Roll On Nivea Serum Tono Natural 50ml',
    precio: 21.0,
    precioVenta: 21.0,
    precioCompra: 13.0,
    stock: 24,
    stockMinimo: 5,
    categoriaNombre: 'Cuidado Personal',
    laboratorioNombre: 'Beiersdorf / Nivea',
    activo: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 2,
    codigo: '002',
    nombre: 'Protector Solar Facial ISDIN Fusion Water SPF 50 50ml',
    precio: 89.9,
    precioVenta: 89.9,
    precioCompra: 65.0,
    stock: 18,
    stockMinimo: 5,
    categoriaNombre: 'Dermatología',
    laboratorioNombre: 'ISDIN',
    activo: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 3,
    codigo: '003',
    nombre: 'Paracetamol 500mg - Caja x 100 Tabletas Recubiertas',
    precio: 15.5,
    precioVenta: 15.5,
    precioCompra: 8.0,
    stock: 45,
    stockMinimo: 10,
    categoriaNombre: 'Medicamentos',
    laboratorioNombre: 'Portugal Laboratorios',
    activo: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 4,
    codigo: '004',
    nombre: 'VICHY Mineral 89 Sérum Concentrado Fortificante 50ml',
    precio: 115.0,
    precioVenta: 115.0,
    precioCompra: 85.0,
    stock: 12,
    stockMinimo: 3,
    categoriaNombre: 'Dermatología',
    laboratorioNombre: 'Vichy Laboratories',
    activo: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 5,
    codigo: '005',
    nombre: 'Amoxicilina 500mg - Caja x 20 Cápsulas',
    precio: 18.0,
    precioVenta: 18.0,
    precioCompra: 10.0,
    stock: 30,
    stockMinimo: 10,
    categoriaNombre: 'Medicamentos',
    laboratorioNombre: 'Genfar',
    requiereReceta: true,
    activo: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 6,
    codigo: '006',
    nombre: 'Redoxon Vitamina C + Zinc Efervescente Naranja x 30 Tab',
    precio: 38.5,
    precioVenta: 38.5,
    precioCompra: 26.0,
    stock: 22,
    stockMinimo: 8,
    categoriaNombre: 'Vitaminas y Suplementos',
    laboratorioNombre: 'Bayer',
    activo: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1577401239170-897942555fb3?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 7,
    codigo: '007',
    nombre: 'Crema Dental Colgate Total 12 Limpieza Profunda 150g',
    precio: 9.8,
    precioVenta: 9.8,
    precioCompra: 6.0,
    stock: 40,
    stockMinimo: 15,
    categoriaNombre: 'Cuidado Bucal',
    laboratorioNombre: 'Colgate-Palmolive',
    activo: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1559656914-a30970c1affd?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 8,
    codigo: '008',
    nombre: 'Ibuprofeno 400mg Antiinflamatorio - Caja x 30 Tabletas',
    precio: 12.0,
    precioVenta: 12.0,
    precioCompra: 6.5,
    stock: 35,
    stockMinimo: 10,
    categoriaNombre: 'Medicamentos',
    laboratorioNombre: 'Medifarma',
    activo: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=600&auto=format&fit=crop',
  },
];

export default function HomePage() {
  // Configuración de Logo y Sliders
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sliders, setSliders] = useState<SliderItem[]>(DEFAULT_SLIDERS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Catálogo de Productos y Categorías
  const [productos, setProductos] = useState<Producto[]>(INITIAL_FALLBACK_PRODUCTS);
  const [categorias, setCategorias] = useState<string[]>([
    'Todos',
    'Medicamentos',
    'Dermatología',
    'Cuidado Personal',
    'Vitaminas y Suplementos',
    'Cuidado Bucal',
  ]);
  const [selectedCategoria, setSelectedCategoria] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [addedItem, setAddedItem] = useState<number | null>(null);

  // Comprobar si el usuario tiene sesión activa
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cargar Logo y Sliders desde LocalStorage y backend
  useEffect(() => {
    try {
      const savedLogo = localStorage.getItem('sgf_site_logo');
      if (savedLogo) setLogoUrl(savedLogo);

      const savedSliders = localStorage.getItem('sgf_site_sliders');
      if (savedSliders) {
        const parsed = JSON.parse(savedSliders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSliders(parsed);
        }
      }

      const token = localStorage.getItem('sgf_auth_token') || localStorage.getItem('token');
      if (token) setIsLoggedIn(true);
    } catch {
      // Ignorar errores de acceso
    }

    // Cargar productos del backend si están disponibles
    const fetchData = async () => {
      try {
        const prodData = await getProductos();
        if (Array.isArray(prodData) && prodData.length > 0) {
          setProductos(prodData);
        }
      } catch {
        // Mantiene los productos iniciales
      }

      try {
        const catData = await getCategorias();
        if (Array.isArray(catData) && catData.length > 0) {
          const names = catData.map((c) => c.nombre);
          setCategorias(['Todos', ...Array.from(new Set(names))]);
        }
      } catch {
        // Mantiene categorías por defecto
      }
    };

    fetchData();
  }, []);

  // Transición automática del slider cada 5 segundos
  useEffect(() => {
    if (isPaused || sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, sliders.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const handleAddToCart = (id: number) => {
    setCartCount((c) => c + 1);
    setAddedItem(id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  // Filtrado de productos en tiempo real
  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      const matchesCategory =
        selectedCategoria === 'Todos' ||
        (p.categoriaNombre || '').toLowerCase() === selectedCategoria.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.codigo || '').toLowerCase().includes(q) ||
        (p.laboratorioNombre || '').toLowerCase().includes(q) ||
        (p.categoriaNombre || '').toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [productos, selectedCategoria, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ─── 1. BARRA SUPERIOR DE ANUNCIOS ─── */}
      <div className="bg-gradient-to-r from-[#d946ef] via-[#c026d3] to-[#9333ea] text-white py-2 px-4 text-xs font-medium text-center flex items-center justify-center gap-2">
        <Sparkles className="size-3.5 shrink-0 animate-pulse" />
        <span>
          ¡Envíos gratis en compras mayores a S/ 50! Atención y delivery farmacéutico disponible
        </span>
      </div>

      {/* ─── 2. ENCABEZADO / NAVBAR ─── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo del Sitio */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo Farmacia"
                className="w-12 h-12 object-contain rounded-xl p-1 bg-white border border-slate-100 shadow-xs group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#d946ef] to-[#c026d3] flex items-center justify-center text-white font-black text-xl shadow-md shadow-fuchsia-500/20 group-hover:scale-105 transition-transform">
                <span>AG</span>
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-lg font-black tracking-tight text-slate-800 block leading-tight">
                Sistema AG
              </span>
              <span className="text-[11px] font-bold text-fuchsia-600 uppercase tracking-widest block">
                Farmacia & Salud
              </span>
            </div>
          </Link>

          {/* Barra de Búsqueda Central */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative">
              <Search className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar medicamentos, bloqueadores, vitaminas..."
                className="w-full h-11 pl-11 pr-4 text-xs sm:text-sm text-slate-800 bg-slate-100/80 hover:bg-slate-100 focus:bg-white rounded-full border border-slate-200/60 focus:border-[#d946ef] focus:ring-4 focus:ring-fuchsia-100 outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-3">
            {/* Acceso al Dashboard o Login */}
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-fuchsia-500/25 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <User className="size-3.5" />
                <span className="hidden sm:inline">Panel Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                <User className="size-3.5" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Link>
            )}

            {/* Carrito de Compras */}
            <div className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 hover:text-fuchsia-600 transition-colors cursor-pointer">
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#d946ef] text-white font-black text-[10px] size-5 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Búsqueda en móvil */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full h-10 pl-10 pr-4 text-xs text-slate-800 bg-slate-100 rounded-full border border-slate-200 focus:outline-none focus:border-fuchsia-500"
            />
          </div>
        </div>
      </header>

      {/* ─── 3. SECCIÓN HERO SLIDER ─── */}
      <section
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative h-[320px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-100">
          {sliders.map((slider, idx) => (
            <div
              key={slider.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Imagen de Fondo */}
              <img
                src={slider.imageUrl}
                alt={slider.titulo}
                className="w-full h-full object-cover object-center"
              />

              {/* Degradado para Legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/50 to-transparent flex items-center">
                <div className="max-w-xl p-6 sm:p-12 md:p-16 text-white space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-fuchsia-200 border border-white/20">
                    <Tag className="size-3" />
                    <span>Promoción Destacada</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-sm">
                    {slider.titulo}
                  </h2>

                  <p className="text-xs sm:text-base text-slate-200 line-clamp-2 sm:line-clamp-3">
                    {slider.descripcion}
                  </p>

                  <div className="pt-2">
                    <a
                      href={slider.enlace || '#catalogo'}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-fuchsia-600/30 active:scale-95 transition-all"
                    >
                      <span>{slider.textoBoton || 'Ver Catálogo'}</span>
                      <ArrowRight className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Flechas de Navegación del Slider */}
          {sliders.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg backdrop-blur-xs transition-all hover:scale-110 cursor-pointer"
                aria-label="Anterior"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg backdrop-blur-xs transition-all hover:scale-110 cursor-pointer"
                aria-label="Siguiente"
              >
                <ChevronRight className="size-5" />
              </button>

              {/* Indicadores / Puntos */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {sliders.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      i === currentSlide ? 'w-8 bg-[#d946ef]' : 'w-2.5 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Ir al slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ─── 4. BENEFICIOS Y CARACTERÍSTICAS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center shrink-0">
              <Truck className="size-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">Envíos Rápidos</h4>
              <p className="text-[11px] text-slate-400">Directo a tu domicilio</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">100% Originales</h4>
              <p className="text-[11px] text-slate-400">Garantía de laboratorios</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">Atención Continua</h4>
              <p className="text-[11px] text-slate-400">Asesoría farmacéutica</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="size-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">Cliente Amigo</h4>
              <p className="text-[11px] text-slate-400">Descuentos y acumulación</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. CATÁLOGO DE PRODUCTOS ─── */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 mb-20 flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fuchsia-600 mb-1">
              <SlidersHorizontal className="size-3.5" />
              <span>Nuestra Farmacia</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Catálogo de Productos
            </h3>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Mostrando <strong className="text-slate-800">{filteredProducts.length}</strong> productos
            disponibles
          </span>
        </div>

        {/* Filtros por Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoria(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-xs ${
                selectedCategoria === cat
                  ? 'bg-gradient-to-r from-[#d946ef] to-[#c026d3] text-white shadow-md shadow-fuchsia-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
            <p className="text-base font-bold text-slate-700">No se encontraron productos</p>
            <p className="text-xs text-slate-400 mt-1">
              Prueba buscando con otro término o seleccionando otra categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 hover:shadow-xl hover:shadow-fuchsia-500/10 hover:border-fuchsia-200 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Imagen del Producto */}
                <div className="relative h-48 bg-slate-50 overflow-hidden flex items-center justify-center p-4">
                  {producto.imagenUrl ? (
                    <img
                      src={producto.imagenUrl}
                      alt={producto.nombre}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 rounded-2xl"
                    />
                  ) : (
                    <div className="size-16 rounded-2xl bg-fuchsia-100/60 text-fuchsia-600 flex items-center justify-center font-bold text-xl">
                      💊
                    </div>
                  )}

                  {/* Badge de Categoría */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-700 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-slate-200/60 uppercase tracking-wider">
                    {producto.categoriaNombre || 'Farmacia'}
                  </span>

                  {/* Stock Disponible */}
                  <span className="absolute top-3 right-3 bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-200">
                    Stock: {producto.stock}
                  </span>
                </div>

                {/* Información del Producto */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block truncate">
                      {producto.laboratorioNombre || 'Laboratorio Certificado'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-2 mt-1 leading-snug group-hover:text-fuchsia-600 transition-colors">
                      {producto.nombre}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Precio
                      </span>
                      <span className="text-lg font-black text-slate-900 tracking-tight">
                        S/ {(producto.precioVenta || producto.precio).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(producto.id)}
                      className={`size-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                        addedItem === producto.id
                          ? 'bg-emerald-600 text-white scale-105 shadow-emerald-500/25'
                          : 'bg-gradient-to-r from-[#d946ef] to-[#c026d3] hover:from-[#c026d3] hover:to-[#a21caf] text-white shadow-fuchsia-500/25 active:scale-95'
                      }`}
                      title="Añadir al carrito"
                    >
                      {addedItem === producto.id ? (
                        <Check className="size-5" />
                      ) : (
                        <ShoppingCart className="size-4.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── 6. FOOTER ─── */}
      <footer className="bg-slate-900 text-slate-400 pt-12 pb-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Columna 1: Marca */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-black text-lg">
                <div className="size-8 rounded-xl bg-gradient-to-tr from-[#d946ef] to-[#c026d3] flex items-center justify-center text-white text-sm">
                  AG
                </div>
                <span>Sistema AG Farmacia</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprometidos con tu salud y bienestar. Productos certificados y atención
                personalizada en cada receta.
              </p>
            </div>

            {/* Columna 2: Enlaces Rápidos */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">Navegación</h5>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <a href="#catalogo" className="hover:text-fuchsia-400 transition-colors">
                    Catálogo Completo
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-fuchsia-400 transition-colors">
                    Acceso para Colaboradores
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-fuchsia-400 transition-colors">
                    Panel Administrativo
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Atención al Cliente */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">Contacto</h5>
              <div className="space-y-2 text-xs">
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 text-fuchsia-400" />
                  <span>Central: (01) 789-4321 / 999-888-777</span>
                </p>
                <p>Horario: Lunes a Domingo, 24 Horas</p>
                <p>Dirección: Av. Principal 1234, Lima - Perú</p>
              </div>
            </div>

            {/* Columna 4: Seguridad */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                Garantía y Confianza
              </h5>
              <p className="text-xs text-slate-400">
                Todos los productos farmacéuticos cumplen con las normativas de DIGEMID y el
                Ministerio de Salud.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Sistema AG Farmacia. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
