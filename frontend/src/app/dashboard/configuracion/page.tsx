"use client";

import React, { useState } from "react";
import { 
  Upload, 
  Globe, 
  Trash2, 
  Plus, 
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SliderImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

export default function ConfiguracionPage() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [sliderFile, setSliderFile] = useState<File | null>(null);
  
  // Form fields for new slider image
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enlace, setEnlace] = useState("");
  const [textoBoton, setTextoBoton] = useState("");

  // Demo slider images matching user reference screenshot
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60",
      title: "Protección Solar",
      description: "Eucerin protección solar que va contigo"
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=60",
      title: "Salud Bucal",
      description: "Colgate previene problemas bucales"
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=60",
      title: "Aliados para el Verano",
      description: "Vichy tus aliados para el verano"
    }
  ]);

  const handleEliminarSlider = (id: string) => {
    setSliderImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAddSlider = () => {
    if (!titulo && !sliderFile) return;
    const newImg: SliderImage = {
      id: Date.now().toString(),
      url: sliderFile ? URL.createObjectURL(sliderFile) : "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=60",
      title: titulo || "Nueva Promoción",
      description: descripcion || "Descripción de la oferta"
    };
    setSliderImages([...sliderImages, newImg]);
    setTitulo("");
    setDescripcion("");
    setEnlace("");
    setTextoBoton("");
    setSliderFile(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: Logo del Sitio (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800">
                Logo del Sitio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Logo Actual */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Logo Actual
                </label>
                <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shadow-inner p-2">
                  {/* Plus Icon Logo Preview */}
                  <div className="relative w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                    <span className="text-cyan-200 text-3xl font-black">+</span>
                  </div>
                </div>
              </div>

              {/* Cambiar Logo */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Cambiar Logo
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-cyan-500">
                  <label className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 text-xs font-medium cursor-pointer transition border-r border-slate-200 shrink-0">
                    Elegir archivo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <span className="px-3 text-xs text-slate-400 truncate">
                    {logoFile ? logoFile.name : "No se ha seleccionado ningún archivo"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button className="bg-[#c026d3] hover:bg-[#a21caf] text-white font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                  SUBIR LOGO
                </Button>
                <Button variant="outline" className="bg-[#64748b] hover:bg-[#475569] text-white font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-lg shadow-md transition-all duration-200 border-none">
                  VISITAR PÁGINA
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: Slider de la Página Principal (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800">
                Slider de la Página Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              
              {/* Archivo de Imagen */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Archivo de Imagen
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-cyan-500">
                  <label className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 text-xs font-medium cursor-pointer transition border-r border-slate-200 shrink-0">
                    Elegir archivo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => setSliderFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <span className="px-3 text-xs text-slate-400 truncate">
                    {sliderFile ? sliderFile.name : "No se ha seleccionado ningún archivo"}
                  </span>
                </div>
              </div>

              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Título
                </label>
                <Input 
                  placeholder="Ej: Gran Descuento" 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                  className="bg-white border-slate-200 text-xs rounded-lg placeholder:text-slate-300"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Descripción
                </label>
                <Textarea 
                  placeholder="Ej: 48 horas de descuento en productos seleccionados." 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  className="bg-white border-slate-200 text-xs rounded-lg min-h-[70px] placeholder:text-slate-300 resize-none"
                />
              </div>

              {/* Enlace (URL) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Enlace (URL)
                </label>
                <Input 
                  placeholder="Ej: https://tutienda.com/ofertas" 
                  value={enlace} 
                  onChange={(e) => setEnlace(e.target.value)} 
                  className="bg-white border-slate-200 text-xs rounded-lg placeholder:text-slate-300"
                />
              </div>

              {/* Texto del Botón */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Texto del Botón
                </label>
                <Input 
                  placeholder="Ej: Comprar ahora" 
                  value={textoBoton} 
                  onChange={(e) => setTextoBoton(e.target.value)} 
                  className="bg-white border-slate-200 text-xs rounded-lg placeholder:text-slate-300"
                />
              </div>

              {/* Botón Añadir */}
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleAddSlider}
                  className="bg-[#c026d3] hover:bg-[#a21caf] text-white font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  AÑADIR IMAGEN AL SLIDER
                </Button>
              </div>

              {/* Sección Imágenes Actuales del Slider */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Imágenes Actuales del Slider
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sliderImages.map((img) => (
                    <div key={img.id} className="space-y-2">
                      <div className="relative aspect-[16/7] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group">
                        <img 
                          src={img.url} 
                          alt={img.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <Button 
                        onClick={() => handleEliminarSlider(img.id)}
                        className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold uppercase tracking-wider text-[11px] py-2 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        ELIMINAR
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
