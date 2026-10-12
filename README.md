# SI Flows 🌊
**Diagramador de Flujos y Procesos para la suite Store Intelligence**

SI Flows es la herramienta de diagramación y modelado de procesos diseñada para acompañar a **SI Docs**, **SI Sheets** y **SI Slides**. Permite crear flujogramas de alta calidad con la experiencia de Lucidchart, tanto en la **Web (macOS, Linux, navegadores)** como en una **aplicación de escritorio nativa para Windows (.msi)**.

---

## ✨ Características Principales

* 🌐 **Lienzo Infinito Inteligente:**
  * Zoom fluido (20% a 300%) y navegación espacial (Espacio + arrastre).
  * Cuadrícula milimétrica con soporte para imán / ajuste (*Snap to Grid*).
  * Minimapa interactivo en tiempo real para navegación en diagramas extensos.
* 🧲 **Conectores Magnéticos y Enrutamiento:**
  * Puertos de anclaje magnéticos en los 4 vértices de cada figura.
  * Enrutamiento inteligente **ortogonal** (codos en 90°), **curvo** (Bézier suave) y **directo**.
  * Etiquetas sobre conectores y flechas direccionales automáticas.
* 📐 **Paleta Completa de Figuras:**
  * **Flujos:** Inicio / Fin (cápsula), Proceso (rectángulo), Decisión (rombo), Subproceso.
  * **Datos:** Entrada/Salida (paralelogramo), Documento, Base de datos.
  * **Anotaciones:** Notas adhesivas (post-it con pliegue), Nubes (servicios cloud), Actores/Usuarios.
* 🎨 **Editor de Propiedades y Estilos:**
  * Colores de relleno institucionales, bordes personalizables, grosor y trazo punteado.
  * Tipografía, negrita, tamaño de fuente y alineación de texto.
  * Doble clic en cualquier figura para editar el texto directamente en el lienzo.
* ⚡ **Productividad y Atajos:**
  * Historial completo de Deshacer / Rehacer (`Ctrl/Cmd + Z`, `Ctrl/Cmd + Y`).
  * Duplicar (`Ctrl/Cmd + D`), Seleccionar todo (`Ctrl/Cmd + A`), Eliminar (`Supr` / `Backspace`).
  * Selección múltiple con marquesina de arrastre.
* 📦 **Exportación y Guardado:**
  * Exportar a **PNG en alta resolución** (listo para reportes y presentaciones).
  * Exportar a **SVG vectorial** (escalable al 100%).
  * Guardar y abrir proyectos nativos en archivo `.siflow` (JSON ligero).
  * Plantillas integradas con un solo clic.

---

## 🚀 1. Ejecutar la Versión Web Online

Para correrlo localmente o desplegarlo en la nube (Vercel, Netlify, Cloudflare Pages, etc.):

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

El directorio generado `dist/` es estático, ultra-ligero (~250 KB) y se puede servir en cualquier servidor web.

---

## 🖥️ 2. Generar el Instalador para Windows (`.msi`)

### Opción A: Desde GitHub Actions (Recomendado si estás en Mac o Linux)
Este repositorio incluye el flujo de trabajo en `.github/workflows/build-msi.yml`:
1. Sube el código a tu repositorio de GitHub.
2. Ve a la pestaña **Actions** -> **Compilar Instalador MSI (Windows)** -> **Run workflow**.
3. El runner de Windows de GitHub compilará el código y generará automáticamente el archivo `SI-Flows-0.1.0-windows-x64.msi` listo para descargar.
4. Coloca el archivo `.msi` en la carpeta `GeStore/apps/` para que los usuarios de Windows lo descarguen con un clic.

### Opción B: Localmente desde una máquina Windows
Si tienes una máquina con Windows:
```bash
# Requiere Rust instalado (rustup)
npm run tauri build
```
El instalador `.msi` se generará en:
`src-tauri/target/release/bundle/msi/SI-Flows-0.1.0-windows-x64.msi`
