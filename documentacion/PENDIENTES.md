# Pendientes de la documentación AV1

Lo que sigue abierto aparece en el Word **resaltado en amarillo** como `[PENDIENTE: …]`.

## Quedan abiertos

| # | Sección | Qué falta | Quién |
|---|---------|-----------|-------|
| 1 | 3.6 Proceso 05 | La anulación de ventas está modelada (RF-10, BPMN), pero no implementada: el frontend llama a `PATCH /api/v1/ventas/{id}/anular` y ese endpoint no existe en el backend. | Equipo de desarrollo |
| 2 | 12. CI | El workflow está en la rama `ci/github-actions`, no en `main`. Abrir y fusionar el PR, y corregir los 71 errores de lint para que ese paso pueda bloquear. | Equipo / dueño del repo |
| 3 | 13. CD | Para implementar Vercel + Render faltan el Dockerfile del backend, permitir el dominio de Vercel en CORS (hoy solo `localhost`) y elegir un proveedor de MySQL (Render solo ofrece PostgreSQL). | Equipo |
| 4 | 14.1 README | La captura muestra el README publicado. Ya corregí Spring Boot 4 y el código de Danna en el archivo local; la captura cambiará cuando se suba. | Commit + push |

## Corregido en esta versión

- Facultad de Ingeniería; gerente del proyecto: Ronal James Llapapasca Montes; «Gonzales».
- Organigrama rehecho: tres niveles, Asistente de Gerencia (staff) y Soporte de TI como asesoría externa.
- Se quitó la sección «Evidencia del trabajo en la empresa».
- RF-02 con actor Administrador; RNF renumerados del 01 al 12.
- Los cinco procesos están en BPMN 2.0 con carriles, incluidos los nuevos 04 (abastecimiento) y 05 (anulación).
- Proceso 02: la salida «No» lleva al ajuste de stock.
- Riesgo técnico del Charter: dependencia de apiperu.dev, con su mitigación.
- WBS con la misma numeración que el Gantt.
- Captura del POS actual (boleta con ClienteAmigo e IGV desglosado).
- Evidencia de WhatsApp agregada.
- Commits: Jamesllm y Ronal James Llm unificados (83); sin la observación sobre Carlos.
- Política de protección de `main` (como acuerdo del equipo).
- Incidencias de tipo error con su resolución (3 bugs reales, con commits y el PR #2).
- Jira: el backlog y los riesgos se rehicieron como tablas propias con fechas de 2026 (sin imitar capturas).
- CI verificado por la API de GitHub; CD documentado con Vercel y Render.
- Tabla de comandos de Git con ejemplos del repositorio.

## Cómo regenerar los diagramas

Las fuentes están en `diagramas/fuentes/`. Los BPMN se generan con `bpmn.py`, y todo se exporta a PNG con `render.py`:

```bash
python documentacion/diagramas/fuentes/bpmn.py
```

```bash
python documentacion/diagramas/fuentes/render.py
```
