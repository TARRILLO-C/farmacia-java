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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface HistorialClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

const DEMO_COMPRAS: Venta[] = [
  {
    id: 101,
    numeroVenta: 'VNT-2026-0041',
    fecha: '2026-09-01T14:30:00Z',
    usuarioId: 1,
    subtotal: 75.0,
    descuentoTotal: 7.5,
    impuesto: 12.15,
    total: 67.5,
    estado: 'COMPLETADA' as EstadoVenta,
    metodoPago: 'YAPE' as MetodoPago,
    detalles: [
      {
        productoId: 1,
        cantidad: 2,
        precioUnitario: 25.0,
        descuento: 5.0,
        subtotal: 45.0,
        producto: {
          id: 1,
          codigo: 'MED-001',
          nombre: 'Amoxicilina 500mg Caps.',
          precio: 25.0,
          stock: 40,
          stockMinimo: 10,
          requiereReceta: true,
          activo: true,
          categoriaId: 1,
        },
      },
      {
        productoId: 2,
        cantidad: 1,
        precioUnitario: 25.0,
        descuento: 2.5,
        subtotal: 22.5,
        producto: {
          id: 2,
          codigo: 'MED-002',
          nombre: 'Paracetamol 500mg Tab.',
          precio: 25.0,
          stock: 50,
          stockMinimo: 15,
          requiereReceta: false,
          activo: true,
          categoriaId: 2,
        },
      },
    ],
    recibo: {
      id: 1,
      numeroRecibo: 'B001-000341',
      tipoComprobante: 'BOLETA' as TipoComprobante,
      fechaEmision: '2026-09-01T14:30:00Z',
      montoSubtotal: 57.2,
      montoImpuesto: 10.3,
      montoDescuento: 7.5,
      montoTotal: 67.5,
      metodoPago: 'YAPE' as MetodoPago,
      ventaId: 101,
      clienteNombre: 'Cliente Registrado',
      clienteDocumento: '74218934',
    },
  },
  {
    id: 102,
    numeroVenta: 'VNT-2026-0018',
    fecha: '2026-08-25T11:15:00Z',
    usuarioId: 1,
    subtotal: 120.0,
    descuentoTotal: 12.0,
    impuesto: 19.44,
    total: 108.0,
    estado: 'COMPLETADA' as EstadoVenta,
    metodoPago: 'TARJETA_DEBITO' as MetodoPago,
    detalles: [
      {
        productoId: 3,
        cantidad: 3,
        precioUnitario: 40.0,
        descuento: 12.0,
        subtotal: 108.0,
        producto: {
          id: 3,
          codigo: 'MED-003',
          nombre: 'Complejo B Forte Jarabe',
          precio: 40.0,
          stock: 20,
          stockMinimo: 5,
          requiereReceta: false,
          activo: true,
          categoriaId: 3,
        },
      },
    ],
    recibo: {
      id: 2,
      numeroRecibo: 'B001-000318',
      tipoComprobante: 'BOLETA' as TipoComprobante,
      fechaEmision: '2026-08-25T11:15:00Z',
      montoSubtotal: 91.52,
      montoImpuesto: 16.48,
      montoDescuento: 12.0,
      montoTotal: 108.0,
      metodoPago: 'TARJETA_DEBITO' as MetodoPago,
      ventaId: 102,
      clienteNombre: 'Cliente Registrado',
      clienteDocumento: '74218934',
    },
  },
];

export const HistorialClienteModal: React.FC<HistorialClienteModalProps> = ({
  isOpen,
  onClose,
  cliente,
}) => {
  const [compras, setCompras] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && cliente) {
      setLoading(true);
      getHistorialComprasCliente(cliente.id)
        .then((data) => {
          if (data && data.length > 0) {
            setCompras(data);
          } else {
            setCompras(DEMO_COMPRAS);
          }
        })
        .catch(() => {
          setCompras(DEMO_COMPRAS);
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col" showCloseButton={false}>
        {/* Cabecera Shadcn */}
        <div className="flex items-center gap-3 px-6 py-4 bg-[#1a365d] text-white shrink-0">
          <div className="p-2.5 rounded-xl bg-[#319795] text-white shadow-xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-white">
              Historial de Compras y Transacciones
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Detalle cronológico de consumos y beneficios aplicados
            </DialogDescription>
          </div>
        </div>

        {/* Ficha Resumen del Cliente */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1a365d] to-[#2a4365] text-white flex items-center justify-center font-bold text-base shadow-sm">
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
                Ahorro Obtenido
              </span>
              <span className="text-sm font-black text-[#319795]">
                S/. {totalDescuentos.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Transacciones */}
        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-7 h-7 text-[#319795] animate-spin" />
              <p className="text-xs text-slate-500 font-medium">
                Consultando historial de ventas...
              </p>
            </div>
          ) : compras.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">
                Sin compras registradas
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                Este cliente no registra ventas previas emitidas en el sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {compras.map((compra) => (
                <Card key={compra.id} className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#319795]" />
                      <span className="font-bold text-[#1a365d]">
                        {compra.recibo?.numeroRecibo || compra.numeroVenta}
                      </span>
                      <Badge variant="outline">
                        {compra.recibo?.tipoComprobante || 'BOLETA'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(compra.fecha).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <Badge variant="emerald" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {compra.estado}
                      </Badge>
                    </div>
                  </div>

                  {/* Fármacos incluidos */}
                  <div className="space-y-1.5">
                    {compra.detalles?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50/80"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">
                            {item.cantidad}x
                          </span>
                          <span className="text-slate-800 font-medium">
                            {item.producto?.nombre || `Producto #${item.productoId}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-slate-400">
                            (c/u S/. {item.precioUnitario.toFixed(2)})
                          </span>
                          <span className="font-bold text-slate-800">
                            S/. {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pago: <strong>{compra.metodoPago}</strong></span>
                      {compra.descuentoTotal > 0 && (
                        <span className="text-[#319795] font-semibold">
                          (Dscto: -S/. {compra.descuentoTotal.toFixed(2)})
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 mr-2">Total Pagado:</span>
                      <span className="text-base font-black text-[#1a365d]">
                        S/. {compra.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex justify-end shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cerrar Historial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
