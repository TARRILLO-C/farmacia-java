'use client';

import * as React from 'react';
import { X, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

export interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  // Opciones de formulario rápido
  onSubmit?: (e: React.FormEvent) => void;
  submitText?: string;
  submitIcon?: React.ComponentType<{ className?: string }>;
  isSubmitting?: boolean;
  cancelText?: string;
  maxWidth?: string; // ej: "max-w-md", "max-w-lg", "max-w-xl", "max-w-2xl"
  side?: 'left' | 'right' | 'bottom' | 'top';
}

export function AppDrawer({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  badge,
  children,
  footer,
  onSubmit,
  submitText = 'Confirmar',
  submitIcon: SubmitIcon,
  isSubmitting = false,
  cancelText = 'Cancelar',
  maxWidth = 'max-w-xl',
  side = 'right',
}: AppDrawerProps) {
  const isMobile = useIsMobile();
  const effectiveSide = isMobile ? 'bottom' : side;

  const contentWrapper = (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden bg-white rounded-3xl">
      {/* 1. Header con diseño limpio, título, descripción y badges */}
      <DrawerHeader className="border-b border-slate-100/90 px-5 sm:px-6 py-4 flex flex-row items-center justify-between gap-3 shrink-0 bg-white rounded-t-3xl">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-teal-50 text-[#319795] border border-teal-100 shadow-2xs shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <DrawerTitle className="text-base sm:text-lg font-bold text-[#1a365d]">
                {title}
              </DrawerTitle>
              {badge}
            </div>
            {description && (
              <DrawerDescription className="text-xs text-slate-500">
                {description}
              </DrawerDescription>
            )}
          </div>
        </div>

        {/* Botón Cerrar */}
        <DrawerClose render={
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        } />
      </DrawerHeader>

      {/* 2. Cuerpo Scrollable con scroll-fade para transición suave de contenido */}
      <div className="flex-1 scroll-fade overflow-y-auto px-5 sm:px-6 py-4 bg-white">
        {children}
      </div>

      {/* 3. Footer de Acciones */}
      <DrawerFooter className="border-t border-slate-100 bg-slate-50/80 px-5 sm:px-6 py-3.5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 shrink-0 rounded-b-3xl">
        {footer ? (
          footer
        ) : (
          <>
            <DrawerClose render={
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-[36px] px-4 rounded-xl text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {cancelText}
              </Button>
            } />

            {onSubmit && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-[36px] px-4 rounded-xl text-xs font-bold bg-[#319795] hover:bg-[#287e7c] text-white shadow-xs cursor-pointer active:scale-[0.98] transition-transform"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    {SubmitIcon && <SubmitIcon className="w-3.5 h-3.5 mr-1.5" />}
                    <span>{submitText}</span>
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </DrawerFooter>
    </div>
  );

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? 'down' : side === 'left' ? 'left' : 'right'}
    >
      <DrawerContent
        side={effectiveSide}
        showHandle={isMobile}
        className={cn(
          isMobile ? 'max-h-[92vh]' : '',
          maxWidth
        )}
      >
        {onSubmit ? (
          <form onSubmit={onSubmit} className="flex flex-col h-full w-full overflow-hidden">
            {contentWrapper}
          </form>
        ) : (
          contentWrapper
        )}
      </DrawerContent>
    </Drawer>
  );
}
