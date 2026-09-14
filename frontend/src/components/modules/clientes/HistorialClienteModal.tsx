'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  ShoppingBag,
  Calendar,
  CreditCard,
  Sparkles,
  Loader2,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import { Cliente, Venta, EstadoVenta, MetodoPago, TipoComprobante } from '@/types';
import { getHistorialComprasCliente } from '@/services/clienteService';
import { AppDrawer } from '@/components/common/AppDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface HistorialClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

export const HistorialClienteModal: React.FC<HistorialClienteModalProps> = ({
  isOpen,
  onClose,
  cliente,
}) => {
  const [compras, setCompras] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && cliente) {
      setLoading(true);
      setError(null);
      getHistorialComprasCliente(cliente.id)
        .then((data) => {
          setCompras(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setCompras([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, cliente]);

  if (!isOpen || !cliente) return null;

  const totalGastado = compras.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalDescuentos = compras.reduce(
    (acc, curr) => acc + (curr.descuentoTotal || 0),
    0
  );

  return (
    <AppDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de Compras y Transacciones"
      description="Detalle cronológico de consumos y beneficios aplicados"
      icon={History}
      cancelText="Cerrar Historial"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Ficha Resumen del Cliente */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1a365d] to-[#2a4365] text-white flex items-center justify-center font-bold text-base shadow-xs">
                {cliente.nombre.charAt(0)}
                {cliente.apellido ? cliente.apellido.charAt(0) : ''}
              </div>
              <div>
                <h4 className="text-base font-bold text-[#1a365d]">
                  {cliente.nombre} {cliente.apellido}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span className="font-mono font-semibold">
                    {cliente.tipoDocumento || 'DNI'}: {cliente.documentoIdentidad}
                  </span>
                  <span>•</span>
                  <Badge variant="secondary" className="uppercase font-bold">
                    {cliente.tipoCliente}
                  </Badge>
                </div>
              </div>
            </div>

            {cliente.esClienteAmigo && (
              <Badge variant="teal" className="py-1.5 px-3 gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#319795]" />
                <span>ClienteAmigo: <strong>{cliente.codigoClienteAmigo || 'CA-SOCIO'}</strong></span>
              </Badge>
            )}
          </div>

          {/* Estadísticas de Consumo con Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200/70">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Compras
              </span>
              <span className="text-sm font-black text-[#1a365d]">
                {compras.length} comprobantes
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Inversión Total
              </span>
              <span className="text-sm font-black text-emerald-600">
                S/. {totalGastado.toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ahorro Total
              </span>
              <span className="text-sm font-black text-[#319795]">
                S/. {totalDescuentos.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Transacciones */}
        <div>
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Receipt className="w-3.5 h-3.5 text-[#319795]" />
            <span>Últimos Comprobantes de Pago Registrados</span>
          </h5>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#319795]" />
              <p className="text-xs text-slate-400">Cargando transacciones...</p>
            </div>
          ) : compras.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Sin datos</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Este cliente no registra transacciones ni compras en el sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {compras.map((compra) => (
                <Card
                  key={compra.id}
                  className="p-4 border-slate-200/80 hover:border-[#319795]/50 transition-colors shadow-none rounded-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1a365d]">
                        {compra.numeroVenta}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {compra.estado}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(compra.fecha || compra.fechaVenta || Date.now()).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Detalle de Productos */}
                  <div className="space-y-1.5 mb-3">
                    {compra.detalles?.map((det, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/70"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#319795]">{det.cantidad}x</span>
                          <span className="text-slate-700">
                            {det.producto?.nombre || `Producto #${det.productoId}`}
                          </span>
                        </div>
                        <span className="font-mono text-slate-600 font-semibold">
                          S/. {Number(det.subtotal ?? (det.precioUnitario * det.cantidad || 0)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Resumen */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pago: <strong>{compra.metodoPago}</strong></span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 mr-2">Total:</span>
                      <span className="text-sm font-black text-[#1a365d]">
                        S/. {compra.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppDrawer>
  );
};
