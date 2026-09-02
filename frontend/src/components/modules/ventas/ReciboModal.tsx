'use client';

import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  Receipt,
  Building,
  Calendar,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Ban,
  QrCode,
} from 'lucide-react';
import { Venta } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ReciboModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: Venta | null;
}

export const ReciboModal: React.FC<ReciboModalProps> = ({
  isOpen,
  onClose,
  venta,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!venta) return null;

  const handlePrint = () => {
    window.print();
  };

  // Determinar datos del cliente
  const clienteNombre = venta.cliente
    ? `${venta.cliente.nombre} ${venta.cliente.apellido || ''}`.trim()
    : venta.recibo?.clienteNombre || 'PÚBLICO GENERAL';

  const clienteDocumento =
    venta.cliente?.documentoIdentidad ||
    venta.recibo?.clienteDocumento ||
    '00000000';

  const esClienteAmigo = venta.cliente?.esClienteAmigo === true;

  // Formato de comprobante
  const tipoDoc = venta.recibo?.tipoComprobante || 'BOLETA DE VENTA';
  const numeroComp =
    venta.recibo?.numeroRecibo ||
    venta.numeroVenta ||
    `B001-${venta.id.toString().padStart(8, '0')}`;

  // Formato de fecha
  const fechaFormatted = venta.fecha
    ? new Date(venta.fecha).toLocaleString('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('es-PE');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-[#319795] border border-teal-100">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-[#1a365d]">
                Comprobante de Venta Electrónico
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Detalle tributario y auditoría de la transacción
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ================================================================= */}
        {/* TICKET DE VENTA IMPRIMIBLE (ESTILO TÉRMICO / FARMACIA)           */}
        {/* ================================================================= */}
        <div
          id="printable-receipt"
          ref={receiptRef}
          className="my-3 p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 shadow-2xs space-y-4 print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* 1. Cabecera de la Farmacia */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#1a365d] text-white font-sans font-black text-sm mb-1">
              SGF
            </div>
            <h2 className="font-sans font-black text-sm tracking-tight text-slate-900 uppercase">
              Botica & Farmacia Central
            </h2>
            <p className="text-[11px] text-slate-500">
              R.U.C. N° 20489123891
            </p>
            <p className="text-[10px] text-slate-400">
              Av. Bolognesi 412, Chiclayo • Tel: (074) 28-1920
            </p>
            <p className="text-[9px] text-slate-400">
              Aut. Sanitaria DIRIS/DIGEMID: N° AUT-SAN-74892
            </p>

            <div className="pt-2">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-[#1a365d] uppercase tracking-wider">
                {tipoDoc} ELECTRÓNICA
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1">
                {numeroComp}
              </p>
            </div>
          </div>

          <Separator className="border-dashed border-slate-300 bg-transparent" />

          {/* 2. Información de la Venta y Cliente */}
          <div className="space-y-1 text-[11px] leading-relaxed">
            <div className="flex justify-between">
              <span className="text-slate-500">FECHA Y HORA:</span>
              <span className="font-semibold text-slate-800">{fechaFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">CAJERO / CAJA:</span>
              <span className="font-semibold text-slate-800">Caja 01 • Admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ESTADO:</span>
              <span
                className={`font-bold ${
                  venta.estado === 'COMPLETADA'
                    ? 'text-emerald-600'
                    : venta.estado === 'PENDIENTE'
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {venta.estado}
              </span>
            </div>

            <Separator className="border-dashed border-slate-200 bg-transparent my-1" />

            <div className="flex justify-between">
              <span className="text-slate-500">SEÑOR(A):</span>
              <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">
                {clienteNombre}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DOC. IDENTIDAD:</span>
              <span className="font-semibold text-slate-800">{clienteDocumento}</span>
            </div>
            {esClienteAmigo && (
              <div className="flex items-center justify-between text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-md mt-1 text-[10px]">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  CLIENTE AMIGO ACTIVO
                </span>
                <span>5% DCTO</span>
              </div>
            )}
          </div>

          <Separator className="border-dashed border-slate-300 bg-transparent" />

          {/* 3. Tabla de Productos Dispensados */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-1">
              <span className="w-10">CANT</span>
              <span className="flex-1 text-left px-2">DESCRIPCIÓN</span>
              <span className="w-14 text-right">P.UNIT</span>
              <span className="w-16 text-right">TOTAL</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {venta.detalles && venta.detalles.length > 0 ? (
                venta.detalles.map((item, index) => {
                  const nombreProd =
                    item.producto?.nombre || `Fármaco Código #${item.productoId}`;
                  const itemTotal = item.subtotal ?? item.precioUnitario * item.cantidad;

                  return (
                    <div key={index} className="flex justify-between items-start">
                      <span className="w-10 font-bold text-slate-700">
                        {item.cantidad} x
                      </span>
                      <div className="flex-1 text-left px-2">
                        <p className="text-slate-900 font-medium leading-tight">
                          {nombreProd}
                        </p>
                        {item.descuento > 0 && (
                          <span className="text-[9px] text-amber-600 block">
                            Dcto: -S/. {item.descuento.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="w-14 text-right text-slate-500">
                        S/. {item.precioUnitario.toFixed(2)}
                      </span>
                      <span className="w-16 text-right font-bold text-slate-900">
                        S/. {itemTotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-slate-400 py-2">
                  Sin detalle de productos
                </p>
              )}
            </div>
          </div>

          <Separator className="border-dashed border-slate-300 bg-transparent" />

          {/* 4. Desglose de Totales e Impuestos */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>OP. GRAVADA (SUBTOTAL):</span>
              <span>S/. {venta.subtotal.toFixed(2)}</span>
            </div>

            {venta.descuentoTotal > 0 && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  DESCUENTO CLIENTEAMIGO:
                </span>
                <span>-S/. {venta.descuentoTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>I.G.V. (18% INCLUIDO):</span>
              <span>S/. {venta.impuesto.toFixed(2)}</span>
            </div>

            <Separator className="border-slate-300 my-1.5" />

            <div className="flex justify-between items-baseline text-sm font-black text-slate-900 pt-0.5">
              <span>IMPORTE TOTAL:</span>
              <span className="text-base text-[#1a365d]">
                S/. {venta.total.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>FORMA DE PAGO:</span>
              <span className="font-bold text-slate-700 uppercase">
                {venta.metodoPago.replace('_', ' ')}
              </span>
            </div>
          </div>

          <Separator className="border-dashed border-slate-300 bg-transparent" />

          {/* 5. Pie del Ticket y Código QR */}
          <div className="text-center space-y-2 pt-1 text-[10px] text-slate-500">
            <div className="flex justify-center">
              <div className="p-2 border border-slate-200 rounded-xl bg-white shadow-2xs inline-block">
                <QrCode className="w-14 h-14 text-slate-700" />
              </div>
            </div>

            <p className="font-semibold text-slate-700">
              ¡GRACIAS POR SU PREFERENCIA!
            </p>
            <p className="text-[9px] text-slate-400 leading-tight max-w-xs mx-auto">
              Representación impresa del Comprobante Electrónico emitido conforme a la resolución de SUNAT.
              Conserve su ticket ante cualquier reclamo dentro de las 48 horas.
            </p>
          </div>
        </div>

        {/* Estilo CSS para impresión que oculta la interfaz y enfoca el ticket */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-receipt,
            #printable-receipt * {
              visibility: visible !important;
            }
            #printable-receipt {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 80mm !important;
              margin: 0 auto !important;
              padding: 10px !important;
              border: none !important;
              box-shadow: none !important;
            }
          }
        `}</style>

        <DialogFooter className="gap-2 pt-2 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 text-xs rounded-xl border-slate-200"
          >
            Cerrar
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="h-9 gap-2 text-xs font-bold rounded-xl bg-[#319795] hover:bg-[#287e7c] text-white shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Descargar PDF</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
