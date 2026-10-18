'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  IdCard,
  Loader2,
  MapPin,
  Receipt,
  RefreshCw,
  Star,
  UserPlus,
  X,
} from 'lucide-react';
import { Cliente, DocumentoConsulta, TipoComprobante } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConsultaDocumentoError, consultarDni, consultarRuc } from '@/services/consultaService';
import { buscarClientePorDocumentoOCodigo } from '@/services/clienteService';
import {
  documentoCumpleComprobante,
  esDniValido,
  esRucValido,
  soloDigitos,
} from '@/lib/documentoIdentidad';

interface ComprobanteClientePanelProps {
  tipoComprobante: TipoComprobante;
  onTipoComprobanteChange: (tipo: TipoComprobante) => void;
  cliente: DocumentoConsulta | null;
  onClienteChange: (cliente: DocumentoConsulta | null) => void;
}

type EstadoConsulta =
  | { tipo: 'idle' }
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string; reintentable: boolean };

const OPCIONES: { tipo: TipoComprobante; titulo: string; detalle: string; icon: React.ElementType }[] = [
  { tipo: 'BOLETA', titulo: 'Boleta', detalle: 'DNI · 8 dígitos', icon: IdCard },
  { tipo: 'FACTURA', titulo: 'Factura', detalle: 'RUC · 11 dígitos', icon: Building2 },
  { tipo: 'TICKET', titulo: 'Ticket', detalle: 'Sin documento', icon: Receipt },
];

const ETIQUETA_FUENTE: Record<DocumentoConsulta['fuente'], string> = {
  LOCAL: 'Cliente registrado',
  RENIEC: 'Verificado RENIEC',
  SUNAT: 'Verificado SUNAT',
};

const ESPERA_AUTOBUSQUEDA_MS = 350;

/** Cliente ya registrado (búsqueda por código ClienteAmigo) en el formato de consulta. */
const clienteAConsulta = (c: Cliente): DocumentoConsulta => {
  const numero = (c.documentoIdentidad || c.dniRuc || '').trim();
  return {
    tipoDocumento: numero.length === 11 ? 'RUC' : 'DNI',
    numeroDocumento: numero,
    nombreCompleto: c.nombreCompleto || `${c.nombre} ${c.apellido}`.trim(),
    direccion: c.direccion || undefined,
    fuente: 'LOCAL',
    registrado: true,
    clienteId: c.id,
    esClienteAmigo: Boolean(c.esClienteAmigo),
    codigoClienteAmigo: c.codigoClienteAmigo || c.numeroClienteAmigo,
    porcentajeDescuento: c.porcentajeDescuento,
  };
};

/** Qué consulta disparar automáticamente según el comprobante y lo digitado (null = aún no). */
const consultaAutomatica = (tipo: TipoComprobante, documento: string): 'DNI' | 'RUC' | null => {
  if (tipo === 'BOLETA' && esDniValido(documento)) return 'DNI';
  if (tipo === 'FACTURA' && esRucValido(documento)) return 'RUC';
  return null;
};

export function ComprobanteClientePanel({
  tipoComprobante,
  onTipoComprobanteChange,
  cliente,
  onClienteChange,
}: ComprobanteClientePanelProps) {
  const [documento, setDocumento] = useState('');
  const [estado, setEstado] = useState<EstadoConsulta>({ tipo: 'idle' });
  const inputRef = useRef<HTMLInputElement>(null);
  const consultaActual = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const esTicket = tipoComprobante === 'TICKET';
  const longitudEsperada = tipoComprobante === 'FACTURA' ? 11 : 8;

  const enfocarDocumento = () => requestAnimationFrame(() => inputRef.current?.focus());

  const cancelarPendiente = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    consultaActual.current++;
  };

  const buscar = useCallback(
    async (numero: string, tipoDocumento: 'DNI' | 'RUC') => {
      const id = ++consultaActual.current;
      setEstado({ tipo: 'cargando' });
      try {
        const resultado = tipoDocumento === 'DNI' ? await consultarDni(numero) : await consultarRuc(numero);
        if (id !== consultaActual.current) return;
        onClienteChange(resultado);
        setDocumento('');
        setEstado({ tipo: 'idle' });
      } catch (error) {
        if (id !== consultaActual.current) return;
        const err =
          error instanceof ConsultaDocumentoError
            ? error
            : new ConsultaDocumentoError('No se pudo completar la consulta.', true);
        setEstado({ tipo: 'error', mensaje: err.message, reintentable: err.reintentable });
      }
    },
    [onClienteChange]
  );

  const buscarCodigoAmigo = async (codigo: string) => {
    const id = ++consultaActual.current;
    setEstado({ tipo: 'cargando' });
    const encontrado = await buscarClientePorDocumentoOCodigo(codigo);
    if (id !== consultaActual.current) return;
    if (encontrado) {
      onClienteChange(clienteAConsulta(encontrado));
      setDocumento('');
      setEstado({ tipo: 'idle' });
    } else {
      setEstado({
        tipo: 'error',
        mensaje: `No hay un cliente con el código "${codigo}".`,
        reintentable: false,
      });
    }
  };

  // Autobúsqueda en cuanto el documento tiene la longitud y formato correctos
  useEffect(() => {
    if (cliente) return;
    const tipoDocumento = consultaAutomatica(tipoComprobante, documento);
    if (!tipoDocumento) return;
    temporizador.current = setTimeout(() => buscar(documento, tipoDocumento), ESPERA_AUTOBUSQUEDA_MS);
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [documento, tipoComprobante, cliente, buscar]);

  const buscarAhora = () => {
    const valor = documento.trim();
    if (!valor) return;
    cancelarPendiente();
    if (esDniValido(valor) && tipoComprobante !== 'FACTURA') return buscar(valor, 'DNI');
    if (esRucValido(valor) && tipoComprobante !== 'BOLETA') return buscar(valor, 'RUC');
    if (esTicket) return buscarCodigoAmigo(valor);
  };

  const cambiarTipo = (tipo: TipoComprobante) => {
    if (tipo === tipoComprobante) return;
    cancelarPendiente();
    setEstado({ tipo: 'idle' });
    if (cliente && !documentoCumpleComprobante(tipo, cliente.numeroDocumento)) {
      onClienteChange(null);
    }
    onTipoComprobanteChange(tipo);
    enfocarDocumento();
  };

  const limpiarCliente = () => {
    cancelarPendiente();
    onClienteChange(null);
    setDocumento('');
    setEstado({ tipo: 'idle' });
    enfocarDocumento();
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = esTicket ? e.target.value.toUpperCase().slice(0, 20) : soloDigitos(e.target.value);
    setDocumento(valor);
    if (estado.tipo === 'error') setEstado({ tipo: 'idle' });
  };

  const handleDocumentoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarAhora();
    } else if (e.key === 'Escape') {
      cancelarPendiente();
      setDocumento('');
      setEstado({ tipo: 'idle' });
    }
  };

  // Ayudas contextuales mientras se digita
  const pareceRucEnBoleta = tipoComprobante === 'BOLETA' && documento.length === 11;
  const pareceDniEnFactura = tipoComprobante === 'FACTURA' && documento.length === 8;
  const rucInvalido =
    tipoComprobante === 'FACTURA' && documento.length === 11 && !esRucValido(documento);
  const dniLargo = tipoComprobante === 'BOLETA' && documento.length > 8 && documento.length < 11;
  const completo = !esTicket && documento.length === longitudEsperada && !rucInvalido;

  const rucConAlerta =
    cliente?.tipoDocumento === 'RUC' &&
    ((cliente.estado && cliente.estado !== 'ACTIVO') || (cliente.condicion && cliente.condicion !== 'HABIDO'));

  return (
    <div className="p-3.5 border-b border-slate-100 space-y-3">
      {/* Tipo de comprobante */}
      <div role="radiogroup" aria-label="Tipo de comprobante" className="grid grid-cols-3 gap-1.5">
        {OPCIONES.map(({ tipo, titulo, detalle, icon: Icon }) => {
          const activo = tipoComprobante === tipo;
          return (
            <button
              key={tipo}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => cambiarTipo(tipo)}
              className={`group flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#319795]/40 ${
                activo
                  ? 'bg-[#1a365d] border-[#1a365d] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <Icon className={`w-3.5 h-3.5 ${activo ? 'text-teal-300' : 'text-[#319795]'}`} />
                {titulo}
              </span>
              <span className={`text-[10px] ${activo ? 'text-slate-300' : 'text-slate-400'}`}>{detalle}</span>
            </button>
          );
        })}
      </div>

      {/* Cliente */}
      {cliente ? (
        <div className="rounded-xl border border-teal-200/80 bg-white p-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 shrink-0 rounded-lg grid place-items-center bg-[#319795]/10 text-[#319795]">
              {cliente.tipoDocumento === 'RUC' ? <Building2 className="w-4 h-4" /> : <IdCard className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 leading-snug break-words">{cliente.nombreCompleto}</p>
              <p className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">
                {cliente.tipoDocumento} {cliente.numeroDocumento}
              </p>
              {cliente.direccion && (
                <p className="text-[11px] text-slate-500 mt-1 flex items-start gap-1">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                  <span className="break-words">{cliente.direccion}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant={cliente.fuente === 'LOCAL' ? 'teal' : 'blue'} className="text-[9.5px] font-bold">
                  {ETIQUETA_FUENTE[cliente.fuente]}
                </Badge>
                {cliente.estado && (
                  <Badge variant={cliente.estado === 'ACTIVO' ? 'emerald' : 'destructive'} className="text-[9.5px] font-bold">
                    {cliente.estado}
                  </Badge>
                )}
                {cliente.condicion && (
                  <Badge variant={cliente.condicion === 'HABIDO' ? 'emerald' : 'amber'} className="text-[9.5px] font-bold">
                    {cliente.condicion}
                  </Badge>
                )}
                {cliente.esClienteAmigo && (
                  <Badge variant="amber" className="text-[9.5px] font-bold gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    ClienteAmigo {cliente.porcentajeDescuento || 5}%
                  </Badge>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={limpiarCliente}
              aria-label="Quitar cliente"
              title="Quitar cliente"
              className="p-1 -m-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!cliente.registrado && (
            <p className="mt-2.5 pt-2 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-[#319795] shrink-0" />
              Cliente nuevo: se registrará automáticamente al emitir el comprobante.
            </p>
          )}

          {rucConAlerta && (
            <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                SUNAT reporta este RUC como <b>{[cliente.estado, cliente.condicion].filter(Boolean).join(' / ')}</b>.
                Verifique con el cliente antes de emitir la factura.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <label htmlFor="pos-documento" className="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>
              {tipoComprobante === 'BOLETA' && 'DNI del cliente'}
              {tipoComprobante === 'FACTURA' && 'RUC del cliente'}
              {esTicket && 'Cliente (opcional)'}
            </span>
            {!esTicket && (
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-600">Obligatorio</span>
            )}
          </label>

          <div className="relative">
            <Input
              id="pos-documento"
              ref={inputRef}
              value={documento}
              onChange={handleDocumentoChange}
              onKeyDown={handleDocumentoKeyDown}
              inputMode={esTicket ? 'text' : 'numeric'}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={rucInvalido || estado.tipo === 'error'}
              placeholder={
                tipoComprobante === 'BOLETA'
                  ? 'Ingrese los 8 dígitos del DNI'
                  : tipoComprobante === 'FACTURA'
                  ? 'Ingrese los 11 dígitos del RUC'
                  : 'DNI, RUC o código ClienteAmigo + Enter'
              }
              className={`h-10 pr-16 font-mono text-sm tracking-wider bg-white rounded-xl ${
                rucInvalido || estado.tipo === 'error'
                  ? 'border-rose-300 focus-visible:ring-rose-200'
                  : completo
                  ? 'border-[#319795]'
                  : 'border-slate-200'
              }`}
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-1.5 pointer-events-none">
              {estado.tipo === 'cargando' ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#319795]" aria-label="Consultando" />
              ) : (
                !esTicket && (
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      documento.length > longitudEsperada
                        ? 'text-amber-600'
                        : completo
                        ? 'text-[#319795]'
                        : 'text-slate-400'
                    }`}
                  >
                    {documento.length}/{longitudEsperada}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Mensajes de ayuda / error */}
          <div aria-live="polite" className="min-h-[16px]">
            {estado.tipo === 'cargando' && (
              <p className="text-[11px] text-slate-500">
                Consultando {esRucValido(documento) ? 'SUNAT' : esDniValido(documento) ? 'RENIEC' : 'clientes'}…
              </p>
            )}

            {estado.tipo === 'error' && (
              <div className="flex items-start justify-between gap-2 text-[11px] text-rose-700">
                <span className="flex items-start gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {estado.mensaje}
                </span>
                {estado.reintentable && (
                  <button
                    type="button"
                    onClick={buscarAhora}
                    className="shrink-0 inline-flex items-center gap-1 font-bold text-[#319795] hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reintentar
                  </button>
                )}
              </div>
            )}

            {estado.tipo === 'idle' && rucInvalido && (
              <p className="text-[11px] text-rose-700">
                RUC inválido: debe iniciar en 10, 15, 16, 17 o 20 y su dígito verificador no coincide.
              </p>
            )}

            {estado.tipo === 'idle' && dniLargo && (
              <p className="text-[11px] text-amber-700">El DNI tiene 8 dígitos.</p>
            )}

            {estado.tipo === 'idle' && (pareceRucEnBoleta || pareceDniEnFactura) && (
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
                <span>{pareceRucEnBoleta ? 'Este número parece un RUC.' : 'Este número parece un DNI.'}</span>
                <button
                  type="button"
                  onClick={() => cambiarTipo(pareceRucEnBoleta ? 'FACTURA' : 'BOLETA')}
                  className="shrink-0 inline-flex items-center gap-1 font-bold text-[#319795] hover:underline cursor-pointer"
                >
                  {pareceRucEnBoleta ? 'Emitir factura' : 'Emitir boleta'}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {estado.tipo === 'idle' && esTicket && !documento && (
              <p className="text-[10.5px] text-slate-400">
                Sin documento el ticket se emite a <b>PÚBLICO GENERAL</b>.
              </p>
            )}

            {estado.tipo === 'idle' &&
              !esTicket &&
              !documento && (
                <p className="text-[10.5px] text-slate-400">
                  Los datos se completan solos desde {tipoComprobante === 'FACTURA' ? 'SUNAT' : 'RENIEC'} al terminar de digitar.
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
