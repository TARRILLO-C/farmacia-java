"use client";

import React, { useState } from "react";
import { 
  Search, 
  UserCheck, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  CheckCircle2,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductItem {
  id: number;
  nombre: string;
  stock: number;
  precio: number;
  cantidad: number;
  descuento: number;
}

export default function NuevaVentaPage() {
  // Form fields
  const [dniRuc, setDniRuc] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [vendedor, setVendedor] = useState("Administrador");
  const [tipoComprobante, setTipoComprobante] = useState("Ticket");
  const [nroDocumento, setNroDocumento] = useState("Autogenerado");
  const [formaPago, setFormaPago] = useState("Contado");
  const [isCredito, setIsCredito] = useState(false);

  // Cart items
  const [cartItems, setCartItems] = useState<ProductItem[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleVentaSinCliente = () => {
    setDniRuc("00000000");
    setNombreCliente("PÚBLICO GENERAL");
  };

  const handleBuscarCliente = () => {
    if (dniRuc === "74218934" || dniRuc === "70000000") {
      setNombreCliente("Carlos Mendoza Paredes");
    } else if (dniRuc) {
      setNombreCliente("Cliente Registrado");
    } else {
      setNombreCliente("PÚBLICO GENERAL");
    }
  };

  // Sample catalog for modal search
  const catalog = [
    { id: 1, nombre: "Paracetamol 500mg Forte", stock: 145, precio: 14.50 },
    { id: 2, nombre: "Amoxicilina 500mg", stock: 64, precio: 32.00 },
    { id: 3, nombre: "Ibuprofeno 400mg", stock: 35, precio: 16.50 },
    { id: 4, nombre: "Loratadina 10mg", stock: 8, precio: 11.00 },
    { id: 5, nombre: "Omeprazol 20mg", stock: 28, precio: 15.00 },
  ];

  const handleAddProduct = (prod: typeof catalog[0]) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === prod.id);
      if (existing) {
        return prev.map(item => item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...prod, cantidad: 1, descuento: 0 }];
    });
    setIsSearchModalOpen(false);
  };

  const handleRemoveProduct = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateCantidad = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + ((item.precio * item.cantidad) - item.descuento), 0);
  };

  return (
    <div className="p-6 space-y-4 max-w-[1600px] mx-auto text-slate-800">
      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        
        {/* Magenta Header Strip */}
        <div className="bg-[#c026d3] text-white px-6 py-3 font-semibold text-base">
          Registrar Venta
        </div>

        <CardContent className="p-6 space-y-6">
          
          {/* PRIMERA FILA DE CAMPOS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* DNI/RUC del Cliente */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                DNI/RUC del Cliente
              </label>
              <div className="flex items-center">
                <Input 
                  placeholder="Ingrese DNI/RUC"
                  value={dniRuc}
                  onChange={(e) => setDniRuc(e.target.value)}
                  className="bg-white border-slate-200 text-xs rounded-l-lg rounded-r-none focus-visible:ring-0 focus-visible:border-cyan-500 placeholder:text-slate-300 h-9"
                />
                <Button 
                  type="button"
                  onClick={handleBuscarCliente}
                  className="bg-[#00b4d8] hover:bg-[#0096c7] text-white rounded-l-none rounded-r-lg px-3 h-9 shrink-0 shadow-sm"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Nombre Cliente */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nombre Cliente
              </label>
              <Input 
                placeholder="Nombre del cliente"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                className="bg-slate-100/80 border-slate-200 text-xs rounded-lg text-slate-600 placeholder:text-slate-400 h-9"
              />
            </div>

            {/* Vendedor */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Vendedor
              </label>
              <Input 
                value={vendedor}
                onChange={(e) => setVendedor(e.target.value)}
                className="bg-slate-100/80 border-slate-200 text-xs rounded-lg text-slate-600 h-9"
              />
            </div>

            {/* Venta Sin Cliente Button */}
            <div className="md:col-span-2 flex justify-end">
              <Button 
                type="button"
                onClick={handleVentaSinCliente}
                className="w-full bg-[#c026d3] hover:bg-[#a21caf] text-white font-bold uppercase tracking-wider text-[11px] h-9 rounded-lg shadow-sm flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                VENTA SIN CLIENTE
              </Button>
            </div>

          </div>

          {/* SEGUNDA FILA DE CAMPOS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Tipo Comprobante */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tipo Comprobante
              </label>
              <select 
                value={tipoComprobante}
                onChange={(e) => setTipoComprobante(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg text-xs px-3 h-9 text-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="Ticket">Ticket</option>
                <option value="Boleta">Boleta</option>
                <option value="Factura">Factura</option>
              </select>
            </div>

            {/* N° Documento */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                N° Documento
              </label>
              <Input 
                value={nroDocumento}
                readOnly
                className="bg-slate-100/80 border-slate-200 text-xs rounded-lg text-slate-500 h-9"
              />
            </div>

            {/* Forma de Pago */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Forma de Pago
              </label>
              <select 
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg text-xs px-3 h-9 text-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="Contado">Contado</option>
                <option value="Yape/Plin">Yape / Plin</option>
                <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
              </select>
            </div>

            {/* ¿Crédito? Toggle Checkbox */}
            <div className="md:col-span-2 flex items-center gap-2 pt-4">
              <input 
                type="checkbox" 
                id="credito"
                checked={isCredito}
                onChange={(e) => setIsCredito(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="credito" className="text-xs font-semibold text-slate-700 cursor-pointer">
                ¿Crédito?
              </label>
            </div>

          </div>

          {/* BOTÓN BUSCAR Y AGREGAR PRODUCTOS & TOTAL */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <Button 
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="bg-[#c026d3] hover:bg-[#a21caf] text-white font-bold uppercase tracking-wider text-xs px-5 h-9 rounded-lg shadow-sm flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              BUSCAR Y AGREGAR PRODUCTOS
            </Button>

            <div className="text-2xl font-black text-[#1e293b]">
              Total: S/ {calculateTotal().toFixed(2)}
            </div>
          </div>

          {/* TABLA DE PRODUCTOS AGREGADOS */}
          <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-4 w-12">ID</th>
                  <th className="py-2.5 px-4">PRODUCTO</th>
                  <th className="py-2.5 px-4 w-24">STOCK</th>
                  <th className="py-2.5 px-4 w-32 text-center">CANT</th>
                  <th className="py-2.5 px-4 w-28">PRECIO</th>
                  <th className="py-2.5 px-4 w-28">DESC.</th>
                  <th className="py-2.5 px-4 w-28">SUBTOTAL</th>
                  <th className="py-2.5 px-4 w-16 text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {cartItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No se han agregado productos a la venta. Haga clic en <span className="font-semibold text-slate-600">BUSCAR Y AGREGAR PRODUCTOS</span>.
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item) => {
                    const subtotal = (item.precio * item.cantidad) - item.descuento;
                    return (
                      <tr key={item.id} className="bg-white hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">{item.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{item.nombre}</td>
                        <td className="py-3 px-4 text-slate-500">{item.stock} u.</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5 bg-slate-100 rounded-lg p-1 w-24 mx-auto">
                            <button 
                              onClick={() => handleUpdateCantidad(item.id, -1)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-slate-800 text-xs w-6 text-center">{item.cantidad}</span>
                            <button 
                              onClick={() => handleUpdateCantidad(item.id, 1)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">S/ {item.precio.toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-500">S/ {item.descuento.toFixed(2)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">S/ {subtotal.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <button 
                            onClick={() => handleRemoveProduct(item.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* BOTONES GUARDAR VENTA Y CANCELAR */}
          <div className="flex justify-end gap-3 pt-4">
            <Button className="bg-[#a3e635] hover:bg-[#84cc16] text-slate-900 font-bold uppercase tracking-wider text-xs px-6 h-10 rounded-lg shadow-sm transition-all">
              GUARDAR VENTA
            </Button>
            <Button variant="outline" className="bg-[#64748b] hover:bg-[#475569] text-white font-bold uppercase tracking-wider text-xs px-6 h-10 rounded-lg shadow-sm transition-all border-none">
              CANCELAR
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* MODAL DE BÚSQUEDA DE PRODUCTOS */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">Catálogo de Productos</h3>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-xs text-slate-500">Seleccione los fármacos a añadir a la venta:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {catalog.map(prod => (
                  <div key={prod.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{prod.nombre}</h4>
                      <p className="text-[11px] text-slate-400">Stock: {prod.stock} u. • Precio: S/ {prod.precio.toFixed(2)}</p>
                    </div>
                    <Button 
                      onClick={() => handleAddProduct(prod)}
                      className="bg-[#c026d3] hover:bg-[#a21caf] text-white text-xs font-bold px-3 h-8 rounded-lg"
                    >
                      + Añadir
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
