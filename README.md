# Proyecto Final: Sistema de Gestión de Farmacia

## Integrantes

- Arroyo Vega, Carlos Felipe; U23214686
- Bustamante Suclupe Carlos Andres; U23211770
- Llapapasca Montes Ronal James; U22221880
- Miñan Gonzales Danna Jael; U23214477
- Tarrillo Condor Nigson Shrimi; U23224391

# Documentación Técnica: Sistema de Gestión Farmacéutica y Punto de Venta

## 1. Introducción y Alcance
El presente sistema web está diseñado para digitalizar y optimizar las operaciones diarias de la farmacia. El objetivo principal es mitigar problemas operativos críticos, tales como la pérdida de mercadería por vencimiento, las inconsistencias de stock, las demoras en atención al cliente y la falta de trazabilidad de los medicamentos.

### Módulos Principales (Fase Inicial):
- **Módulo de Inventario:** Gestión de categorías, productos, proveedores, lotes y control automático de fechas de caducidad con alertas visuales.
- **Módulo de Ventas (POS):** Interfaz ágil para búsqueda de medicamentos, dispensación y procesamiento de pagos.
- **Módulo de Facturación Electrónica:** Integración de comprobantes (boletas/facturas) y envío a la SUNAT.
- **Módulo de Seguridad:** Autenticación y roles de usuario (Administrador, Químico Farmacéutico, Cajero).

## 2. Arquitectura del Proyecto
El sistema implementa una arquitectura Cliente-Servidor utilizando las siguientes tecnologías:
- **Frontend:** React con TypeScript.
- **Backend:** Node.js (Express).
- **Base de Datos:** Persistencia de datos gestionada según los requerimientos (MySQL).

## 3. Configuración del Entorno de Desarrollo (Unidad 1)
Antes de iniciar, cada desarrollador debe asegurarse de tener instaladas y configuradas las siguientes herramientas en su entorno local:
1. **Node.js:** Versión 18 o superior.
2. **Git:** Herramienta indispensable para el control de versiones.
3. **Editor de Código:** Se recomienda Visual Studio Code.

---

## 4. Guía de Control de Versiones con Git

### 4.1 Instalación y Configuración Básica
Si es la primera vez que utilizas Git en tu equipo, descarga el instalador desde [git-scm.com](https://git-scm.com/). Tras la instalación, configura tus credenciales globales en la terminal:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### 4.2 Manejo de Repositorios
Para empezar a trabajar en el código del sistema, necesitas el repositorio en tu máquina.
- **Inicializar un repositorio local nuevo:**
  ```bash
  git init
  ```
- **Clonar el repositorio existente del proyecto:**
  ```bash
  git clone https://github.com/organizacion/sistema-farmacia.git
  ```
- **Vincular un repositorio remoto (si iniciaste en local):**
  ```bash
  git remote add origin https://github.com/organizacion/sistema-farmacia.git
  ```

### 4.3 Comandos Básicos y Commits
- **Verificar el estado de los archivos (modificados, nuevos, eliminados):**
  ```bash
  git status
  ```
- **Agregar cambios al área de preparación (Stage):**
  ```bash
  git add .
  ```
  *(El punto `.` agrega todos los archivos modificados. Puedes especificar un archivo con `git add nombre_archivo.ts`)*
- **Crear un commit (guardar los cambios localmente):**
  ```bash
  git commit -m "feat: implementar alertas visuales para medicamentos próximos a vencer"
  ```

### 4.4 Ramas (Branching)
En este proyecto, la rama `main` refleja el entorno de producción, mientras que `develop` se utiliza para la integración. Nunca debes hacer commits directamente en estas ramas. 
Para desarrollar una nueva funcionalidad, crea una rama independiente:
- **Crear y cambiar a una nueva rama:**
  ```bash
  git checkout -b feature/modulo-pos
  ```
- **Listar todas las ramas locales:**
  ```bash
  git branch
  ```
- **Cambiar de una rama a otra:**
  ```bash
  git checkout develop
  ```

### 4.5 Subir Cambios y Solicitudes Pull (Pull Requests)
Una vez que hayas finalizado tu trabajo en la rama local, debes subirla al repositorio remoto para iniciar la revisión de código.
- **Subir tu rama al servidor (Push):**
  ```bash
  git push origin feature/modulo-pos
  ```
- **Solicitud Pull (Pull Request):**
  1. Dirígete a la plataforma (por ejemplo, GitHub) donde se aloja el repositorio.
  2. Haz clic en "Compare & pull request" en tu nueva rama.
  3. Asegúrate de que la rama base (destino) sea `develop`.
  4. Agrega una descripción clara de los cambios realizados y solicita la revisión de al menos un miembro del equipo.

### 4.6 Resolución de Conflictos
Los conflictos ocurren cuando Git no puede fusionar automáticamente los cambios porque las mismas líneas de un archivo fueron modificadas en diferentes commits.
**Pasos para resolver un conflicto:**
1. Trae los últimos cambios de la rama principal a tu rama local:
   ```bash
   git pull origin develop
   ```
2. Si hay conflictos, Git detendrá el proceso de fusión (merge) y te indicará qué archivos están en conflicto.
3. Abre los archivos conflictivos en tu editor de código. Verás marcadores de Git como los siguientes:
   ```text
   <<<<<<< HEAD
   código de tu rama local
   =======
   código que viene de la rama develop
   >>>>>>> origin/develop
   ```
4. Edita el archivo, conservando la versión correcta del código y eliminando por completo los marcadores (`<<<<<<<`, `=======`, `>>>>>>>`).
5. Guarda el archivo, añádelo al stage y crea el commit de resolución:
   ```bash
   git add .
   git commit -m "fix: resolver conflicto en la interfaz de inventario"
   ```
