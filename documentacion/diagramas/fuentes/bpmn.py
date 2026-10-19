"""Generador de diagramas BPMN 2.0 (pool con carriles verticales) a HTML/SVG con el estilo de FarmaciaLink.

Uso:  python bpmn.py   -> escribe un .html por proceso en esta carpeta; luego `python render.py` los pasa a PNG.

Notación: evento de inicio (círculo fino verde), evento de fin (círculo grueso rojo), tarea de usuario
(rectángulo gris), tarea de servicio del sistema (rectángulo verde azulado con engranaje), compuerta
exclusiva (rombo con X) y flujos de secuencia (flecha continua).
"""
from html import escape
from pathlib import Path

AQUI = Path(__file__).resolve().parent

ANCHO_CARRIL = 210
ALTO_FILA = 92
TAREA_W, TAREA_H = 168, 58
ROMBO = 26          # semidiagonal de la compuerta
EVENTO_R = 17
CAB_POOL = 44       # banda superior con el nombre del pool
CAB_CARRIL = 42     # fila con los nombres de los carriles
MARGEN = 16
FUENTE = "Arial, Helvetica, sans-serif"


def _lineas(texto, max_car):
    palabras, lineas, actual = texto.split(), [], ""
    for p in palabras:
        if len(actual) + len(p) + (1 if actual else 0) > max_car:
            lineas.append(actual)
            actual = p
        else:
            actual = f"{actual} {p}".strip()
    if actual:
        lineas.append(actual)
    return lineas


def _texto(x, y, texto, max_car=24, tam=13, peso="normal", color="#1e293b", ancla="middle", alto_linea=15):
    lineas = _lineas(texto, max_car)
    y0 = y - (len(lineas) - 1) * alto_linea / 2
    tspans = "".join(
        f'<tspan x="{x}" y="{y0 + i * alto_linea:.1f}">{escape(l)}</tspan>' for i, l in enumerate(lineas))
    return (f'<text font-family="{FUENTE}" font-size="{tam}" font-weight="{peso}" fill="{color}" '
            f'text-anchor="{ancla}" dominant-baseline="middle">{tspans}</text>')


class Proceso:
    def __init__(self, titulo, carriles, ancho_carril=None):
        global ANCHO_CARRIL
        if ancho_carril:
            ANCHO_CARRIL = ancho_carril
        self.titulo = titulo
        self.carriles = carriles
        self.nodos = {}
        self.flujos = []

    # tipos: inicio, fin, tarea, servicio, compuerta
    def nodo(self, id_, tipo, carril, fila, texto="", dx=0.0):
        self.nodos[id_] = dict(tipo=tipo, carril=carril, fila=fila, texto=texto, dx=dx)
        return self

    def flujo(self, a, b, texto=None, lado=None):
        """lado: 'izq' o 'der' para retornos hacia filas superiores (bucles)."""
        self.flujos.append(dict(a=a, b=b, texto=texto, lado=lado))
        return self

    # ------------------------------------------------------------ geometría
    def _centro(self, n):
        x = MARGEN + n["carril"] * ANCHO_CARRIL + ANCHO_CARRIL / 2 + n["dx"] * ANCHO_CARRIL
        y = MARGEN + CAB_POOL + CAB_CARRIL + n["fila"] * ALTO_FILA + ALTO_FILA / 2
        return x, y

    def _semi(self, n):
        """Semiancho y semialto de la figura."""
        if n["tipo"] in ("tarea", "servicio"):
            return TAREA_W / 2, TAREA_H / 2
        if n["tipo"] == "compuerta":
            return ROMBO, ROMBO
        return EVENTO_R, EVENTO_R

    def _ruta(self, f):
        a, b = self.nodos[f["a"]], self.nodos[f["b"]]
        (ax, ay), (bx, by) = self._centro(a), self._centro(b)
        (aw, ah), (bw, bh) = self._semi(a), self._semi(b)
        if f["lado"]:  # retorno por un canal pegado al borde del carril (no pisa otras figuras)
            signo = 1 if f["lado"] == "der" else -1
            carriles = (a["carril"], b["carril"])
            if signo > 0:
                canal = MARGEN + (max(carriles) + 1) * ANCHO_CARRIL - 10
            else:
                canal = MARGEN + min(carriles) * ANCHO_CARRIL + 10
            return [(ax + signo * aw, ay), (canal, ay), (canal, by), (bx + signo * bw, by)]
        if abs(ay - by) < 1:  # misma fila
            s = 1 if bx > ax else -1
            return [(ax + s * aw, ay), (bx - s * bw, by)]
        if abs(ax - bx) < 1:  # misma columna, hacia abajo
            return [(ax, ay + ah), (bx, by - bh)]
        if a["tipo"] == "compuerta":  # sale por el costado hacia el carril destino
            s = 1 if bx > ax else -1
            return [(ax + s * aw, ay), (bx, ay), (bx, by - bh)]
        # sale por abajo, cruza entre filas y entra por arriba
        cruce = by - bh - 16
        return [(ax, ay + ah), (ax, cruce), (bx, cruce), (bx, by - bh)]

    # ------------------------------------------------------------ dibujo
    def svg(self):
        filas = max(n["fila"] for n in self.nodos.values()) + 1
        ancho = MARGEN * 2 + len(self.carriles) * ANCHO_CARRIL
        alto = MARGEN * 2 + CAB_POOL + CAB_CARRIL + filas * ALTO_FILA
        x0, y0 = MARGEN, MARGEN
        partes = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{ancho}" height="{alto}" viewBox="0 0 {ancho} {alto}">',
                  '<defs><marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" '
                  'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#334155"/></marker></defs>']
        ancho_pool = len(self.carriles) * ANCHO_CARRIL
        alto_pool = CAB_POOL + CAB_CARRIL + filas * ALTO_FILA
        # pool y carriles
        partes.append(f'<rect x="{x0}" y="{y0}" width="{ancho_pool}" height="{alto_pool}" fill="#ffffff" stroke="#1a365d" stroke-width="2"/>')
        partes.append(f'<rect x="{x0}" y="{y0}" width="{ancho_pool}" height="{CAB_POOL}" fill="#1a365d"/>')
        partes.append(_texto(x0 + ancho_pool / 2, y0 + CAB_POOL / 2, self.titulo, max_car=int(ancho_pool / 8.6), tam=14, peso="bold", color="#ffffff", alto_linea=16))
        for i, nombre in enumerate(self.carriles):
            cx = x0 + i * ANCHO_CARRIL
            fondo = "#f8fafc" if i % 2 == 0 else "#ffffff"
            partes.append(f'<rect x="{cx}" y="{y0 + CAB_POOL}" width="{ANCHO_CARRIL}" height="{alto_pool - CAB_POOL}" fill="{fondo}" stroke="#94a3b8" stroke-width="1.2"/>')
            partes.append(f'<rect x="{cx}" y="{y0 + CAB_POOL}" width="{ANCHO_CARRIL}" height="{CAB_CARRIL}" fill="#e6f4f4" stroke="#94a3b8" stroke-width="1.2"/>')
            partes.append(_texto(cx + ANCHO_CARRIL / 2, y0 + CAB_POOL + CAB_CARRIL / 2, nombre, max_car=28, tam=13, peso="bold", color="#1a365d"))
        # flujos (debajo de las figuras)
        for f in self.flujos:
            pts = self._ruta(f)
            d = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
            partes.append(f'<polyline points="{d}" fill="none" stroke="#334155" stroke-width="1.6" marker-end="url(#flecha)"/>')
            if f["texto"]:
                (x1, y1), (x2, y2) = pts[0], pts[1]
                if abs(y1 - y2) < 1:   # primer tramo horizontal
                    tx, ty, ancla = x1 + (10 if x2 > x1 else -10), y1 - 10, "start" if x2 > x1 else "end"
                else:
                    tx, ty, ancla = x1 + 8, y1 + 14, "start"
                partes.append(f'<text x="{tx:.1f}" y="{ty:.1f}" font-family="{FUENTE}" font-size="12" font-weight="bold" '
                              f'fill="#334155" text-anchor="{ancla}" dominant-baseline="middle" '
                              f'paint-order="stroke" stroke="#ffffff" stroke-width="4">{escape(f["texto"])}</text>')
        # figuras
        for n in self.nodos.values():
            x, y = self._centro(n)
            t = n["tipo"]
            if t in ("tarea", "servicio"):
                fondo, borde = ("#e6f4f4", "#319795") if t == "servicio" else ("#f1f5f9", "#475569")
                partes.append(f'<rect x="{x - TAREA_W / 2}" y="{y - TAREA_H / 2}" width="{TAREA_W}" height="{TAREA_H}" rx="9" fill="{fondo}" stroke="{borde}" stroke-width="1.6"/>')
                if t == "servicio":
                    partes.append(f'<text x="{x - TAREA_W / 2 + 7}" y="{y - TAREA_H / 2 + 11}" font-family="Segoe UI Symbol, {FUENTE}" font-size="12" fill="#319795" dominant-baseline="middle">⚙</text>')
                else:
                    partes.append(f'<text x="{x - TAREA_W / 2 + 7}" y="{y - TAREA_H / 2 + 11}" font-family="Segoe UI Symbol, {FUENTE}" font-size="11" fill="#475569" dominant-baseline="middle">👤</text>')
                partes.append(_texto(x + 4, y + 1, n["texto"], max_car=23, tam=12.5))
            elif t == "compuerta":
                partes.append(f'<polygon points="{x},{y - ROMBO} {x + ROMBO},{y} {x},{y + ROMBO} {x - ROMBO},{y}" fill="#fef3c7" stroke="#d97706" stroke-width="1.8"/>')
                partes.append(f'<path d="M{x - 9},{y - 9} L{x + 9},{y + 9} M{x + 9},{y - 9} L{x - 9},{y + 9}" stroke="#92400e" stroke-width="3"/>')
                ultimo = n["carril"] == len(self.carriles) - 1
                partes.append(_texto(x - ROMBO - 6 if ultimo else x + ROMBO + 6, y - ROMBO - 4, n["texto"], max_car=22, tam=12,
                                     peso="bold", color="#78350f", ancla="end" if ultimo else "start", alto_linea=14))
            else:
                es_fin = t == "fin"
                fondo, borde, grosor = ("#fee2e2", "#dc2626", 4) if es_fin else ("#dcfce7", "#16a34a", 2)
                partes.append(f'<circle cx="{x}" cy="{y}" r="{EVENTO_R}" fill="{fondo}" stroke="{borde}" stroke-width="{grosor}"/>')
                partes.append(_texto(x + EVENTO_R + 8, y, n["texto"], max_car=17, tam=12, peso="bold",
                                     color="#7f1d1d" if es_fin else "#14532d", ancla="start", alto_linea=14))
        partes.append("</svg>")
        return "\n".join(partes)

    def html(self, archivo):
        contenido = f"""<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>{escape(self.titulo)}</title><link rel="stylesheet" href="estilo.css"></head>
<body>
{self.svg()}
<script>window.addEventListener('load', () => document.body.classList.add('listo'));</script>
</body>
</html>
"""
        (AQUI / archivo).write_text(contenido, encoding="utf-8")


# =============================================================================== procesos
def venta_identificacion():
    p = Proceso("Proceso 01 · Venta en el POS — Parte 1: identificación del cliente",
                ["Cliente", "Cajero", "Sistema FarmaciaLink", "RENIEC / SUNAT (apiperu.dev)"])
    p.nodo("i", "inicio", 0, 0, "Solicita medicamentos")
    p.nodo("t1", "tarea", 1, 1, "Selecciona el tipo de comprobante")
    p.nodo("g1", "compuerta", 1, 2, "¿Tipo de comprobante?")
    p.nodo("t2", "tarea", 1, 3, "Ingresa el DNI (boleta) o el RUC (factura)")
    p.nodo("s1", "servicio", 2, 4, "Busca al cliente por número de documento")
    p.nodo("g2", "compuerta", 2, 5, "¿Cliente registrado?")
    p.nodo("s2", "servicio", 2, 6, "Obtiene datos y descuento ClienteAmigo")
    p.nodo("x1", "servicio", 3, 6, "Devuelve nombre o razón social y dirección")
    p.nodo("s3", "servicio", 2, 7, "Muestra los datos del cliente en el POS")
    p.nodo("f", "fin", 1, 8, "Cliente identificado: continúa en la Parte 2")
    p.flujo("i", "t1").flujo("t1", "g1")
    p.flujo("g1", "t2", "Boleta / Factura")
    p.flujo("g1", "f", "Ticket", lado="izq")
    p.flujo("t2", "s1").flujo("s1", "g2")
    p.flujo("g2", "s2", "Sí")
    p.flujo("g2", "x1", "No")
    p.flujo("s2", "s3").flujo("x1", "s3").flujo("s3", "f")
    return p


def venta_dispensacion():
    p = Proceso("Proceso 01 · Venta en el POS — Parte 2: dispensación y cobro",
                ["Cliente", "Cajero", "Sistema FarmaciaLink"])
    p.nodo("i", "inicio", 1, 0, "Cliente identificado (Parte 1)")
    p.nodo("t1", "tarea", 1, 1, "Escanea o busca el producto")
    p.nodo("g1", "compuerta", 2, 2, "¿Hay stock suficiente?")
    p.nodo("t2", "tarea", 1, 3, "Informa y sugiere una alternativa genérica")
    p.nodo("g2", "compuerta", 0, 4, "¿Acepta el sustituto?")
    p.nodo("g3", "compuerta", 2, 5, "¿Requiere receta?")
    p.nodo("g4", "compuerta", 1, 6, "¿Receta válida?")
    p.nodo("s1", "servicio", 2, 7, "Agrega el producto al carrito y recalcula totales")
    p.nodo("t3", "tarea", 1, 7, "Rechaza la venta por normativa sanitaria")
    p.nodo("fc", "fin", 0, 8, "Venta cancelada")
    p.nodo("g5", "compuerta", 2, 8, "¿Más productos?")
    p.nodo("t4", "tarea", 1, 9, "Selecciona el medio de pago y cobra")
    p.nodo("t5", "tarea", 0, 10, "Realiza el pago")
    p.nodo("s2", "servicio", 2, 11, "Registra la venta, descuenta stock (FEFO) y genera el recibo")
    p.nodo("s3", "servicio", 2, 12, "Imprime boleta, factura o ticket")
    p.nodo("t6", "tarea", 1, 13, "Despacha medicamentos y comprobante")
    p.nodo("f", "fin", 0, 14, "Venta completada")
    p.flujo("i", "t1").flujo("t1", "g1")
    p.flujo("g1", "t2", "No")
    p.flujo("g1", "g3", "Sí")
    p.flujo("t2", "g2")
    p.flujo("g2", "t1", "Sí", lado="izq")
    p.flujo("g2", "fc", "No")
    p.flujo("g3", "s1", "No")
    p.flujo("g3", "g4", "Sí")
    p.flujo("g4", "s1", "Sí")
    p.flujo("g4", "t3", "No")
    p.flujo("t3", "fc")
    p.flujo("s1", "g5")
    p.flujo("g5", "t1", "Sí", lado="der")
    p.flujo("g5", "t4", "No")
    p.flujo("t4", "t5").flujo("t5", "s2").flujo("s2", "s3").flujo("s3", "t6").flujo("t6", "f")
    return p


def inventario():
    p = Proceso("Proceso 02 · Control de inventario, alertas de stock mínimo y vencimiento",
                ["Químico Farmacéutico", "Sistema FarmaciaLink"], ancho_carril=280)
    p.nodo("i", "inicio", 0, 0, "Revisión periódica o ingreso de mercadería")
    p.nodo("t1", "tarea", 0, 1, "Ingresa al módulo de inventario")
    p.nodo("s1", "servicio", 1, 2, "Evalúa lote, stock actual y fecha de vencimiento")
    p.nodo("g1", "compuerta", 1, 3, "¿Stock ≤ stock mínimo?")
    p.nodo("s2", "servicio", 1, 4, "Marca alerta de reposición crítica")
    p.nodo("g2", "compuerta", 1, 5, "¿Vence en 30 días o menos?")
    p.nodo("s3", "servicio", 1, 6, "Genera alerta de lote próximo a vencer")
    p.nodo("g3", "compuerta", 0, 6, "¿Stock físico coincide con el sistema?")
    p.nodo("t3", "tarea", 0, 7, "Registra un ajuste de stock con el motivo")
    p.nodo("s4", "servicio", 1, 8, "Actualiza el stock del lote")
    p.nodo("t2", "tarea", 0, 9, "Coordina retiro o liquidación con el proveedor")
    p.nodo("f1", "fin", 0, 10, "Inventario consolidado")
    p.flujo("i", "t1").flujo("t1", "s1").flujo("s1", "g1")
    p.flujo("g1", "s2", "Sí")
    p.flujo("g1", "g2", "No", lado="der")
    p.flujo("s2", "g2")
    p.flujo("g2", "s3", "Sí")
    p.flujo("g2", "g3", "No")
    p.flujo("g3", "t3", "No")
    p.flujo("g3", "f1", "Sí", lado="izq")
    p.flujo("t3", "s4")
    p.flujo("s3", "t2", lado="der")
    p.flujo("s4", "f1")
    p.flujo("t2", "f1")
    return p


def fidelizacion():
    p = Proceso("Proceso 03 · Registro, afiliación y fidelización (ClienteAmigo)",
                ["Cliente", "Cajero", "Sistema FarmaciaLink"])
    p.nodo("i", "inicio", 0, 0, "Solicita afiliarse")
    p.nodo("t1", "tarea", 1, 1, "Solicita el documento DNI o RUC")
    p.nodo("s1", "servicio", 2, 2, "Valida la unicidad del documento")
    p.nodo("g1", "compuerta", 2, 3, "¿El cliente ya existe?")
    p.nodo("s2", "servicio", 2, 4, "Muestra el estado actual: regular o beneficiario")
    p.nodo("t2", "tarea", 1, 4, "Registra datos personales y de contacto")
    p.nodo("t3", "tarea", 1, 5, "Ofrece el programa ClienteAmigo")
    p.nodo("g2", "compuerta", 0, 6, "¿Acepta afiliarse?")
    p.nodo("s3", "servicio", 2, 7, "Asigna código único y tasa de descuento")
    p.nodo("s4", "servicio", 2, 8, "Guarda la afiliación con puntos de bienvenida")
    p.nodo("f1", "fin", 0, 9, "Cliente afiliado")
    p.nodo("f2", "fin", 0, 7, "Se mantiene como cliente regular")
    p.flujo("i", "t1").flujo("t1", "s1").flujo("s1", "g1")
    p.flujo("g1", "s2", "Sí")
    p.flujo("g1", "t2", "No")
    p.flujo("s2", "t3").flujo("t2", "t3").flujo("t3", "g2")
    p.flujo("g2", "f2", "No")
    p.flujo("g2", "s3", "Sí")
    p.flujo("s3", "s4").flujo("s4", "f1")
    return p


def abastecimiento():
    p = Proceso("Proceso 04 · Recepción e ingreso de mercadería y lotes",
                ["Proveedor", "Químico Farmacéutico", "Sistema FarmaciaLink"])
    p.nodo("i", "inicio", 0, 0, "Entrega mercadería con factura")
    p.nodo("t1", "tarea", 1, 1, "Verifica la mercadería contra la factura")
    p.nodo("g1", "compuerta", 1, 2, "¿Mercadería conforme?")
    p.nodo("t2", "tarea", 0, 3, "Recibe la observación y repone o anula")
    p.nodo("f2", "fin", 0, 4, "Recepción observada")
    p.nodo("t3", "tarea", 1, 3, "Registra la compra: proveedor, N.° de factura y productos")
    p.nodo("t4", "tarea", 1, 4, "Ingresa por producto: lote, vencimiento, cantidad y precio")
    p.nodo("s1", "servicio", 2, 5, "Valida proveedor, productos y datos")
    p.nodo("s2", "servicio", 2, 6, "Crea el lote si no existe o suma la cantidad a su stock")
    p.nodo("s4", "servicio", 2, 7, "Calcula el total y guarda la compra COMPLETADA")
    p.nodo("f1", "fin", 1, 8, "Mercadería disponible para la venta")
    p.flujo("i", "t1").flujo("t1", "g1")
    p.flujo("g1", "t2", "No")
    p.flujo("t2", "f2")
    p.flujo("g1", "t3", "Sí")
    p.flujo("t3", "t4").flujo("t4", "s1").flujo("s1", "s2").flujo("s2", "s4").flujo("s4", "f1")
    return p


def anulacion():
    p = Proceso("Proceso 05 · Devolución y anulación de venta con reincorporación de stock",
                ["Cliente", "Administrador", "Sistema FarmaciaLink"])
    p.nodo("i", "inicio", 0, 0, "Solicita devolución con su comprobante")
    p.nodo("t1", "tarea", 1, 1, "Busca la venta por número de comprobante")
    p.nodo("g1", "compuerta", 1, 2, "¿Venta del turno y en estado COMPLETADA?")
    p.nodo("t2", "tarea", 0, 3, "Recibe la negativa con el motivo")
    p.nodo("f2", "fin", 0, 4, "Devolución rechazada")
    p.nodo("t3", "tarea", 1, 3, "Registra el motivo de anulación")
    p.nodo("s1", "servicio", 2, 4, "Reincorpora al lote la cantidad de cada producto vendido")
    p.nodo("s2", "servicio", 2, 5, "Marca la venta como ANULADA")
    p.nodo("t4", "tarea", 1, 6, "Devuelve el importe al cliente")
    p.nodo("f1", "fin", 0, 7, "Venta anulada")
    p.flujo("i", "t1").flujo("t1", "g1")
    p.flujo("g1", "t2", "No")
    p.flujo("t2", "f2")
    p.flujo("g1", "t3", "Sí")
    p.flujo("t3", "s1").flujo("s1", "s2").flujo("s2", "t4").flujo("t4", "f1")
    return p


if __name__ == "__main__":
    ANCHO_POR_DEFECTO = ANCHO_CARRIL
    for archivo, fabrica in [
        ("02a-bpmn-venta-identificacion.html", venta_identificacion),
        ("02b-bpmn-venta-dispensacion.html", venta_dispensacion),
        ("03-bpmn-inventario.html", inventario),
        ("04-bpmn-fidelizacion.html", fidelizacion),
        ("15-bpmn-abastecimiento.html", abastecimiento),
        ("16-bpmn-anulacion.html", anulacion),
    ]:
        ANCHO_CARRIL = ANCHO_POR_DEFECTO
        fabrica().html(archivo)
        print("escrito", archivo)
