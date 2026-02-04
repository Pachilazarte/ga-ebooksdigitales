# Generador de Manuales Profesionales - Argentina & LATAM

Sistema avanzado de generación de manuales en PDF con dos modelos visuales distintivos: Argentina y LATAM.

## 🎨 Modelos Disponibles

### 🇦🇷 Argentina - Tech & Profesional
Paleta basada en azules y cianos modernos con toques naturales:
- **Primario:** Cyan (#22D9DF)
- **Secundario:** Azul Petróleo (#0B4A6E)
- **Acento:** Verde Lima (#C1FF72)
- **Identidad:** Moderna, tecnológica y profesional

### 🌎 LATAM - Cultura & Energía
Paleta cálida con violetas y dorados:
- **Primario:** Amarillo Sol (#E2B808)
- **Secundario:** Dorado Antiguo (#8B8117)
- **Acento:** Violeta Amatista (#984A30)
- **Identidad:** Cálida, energética y cultural

## 📁 Estructura de Archivos

```
generador-manuales/
├── index.html           # Página principal
├── css/
│   ├── pagina.css      # Estilos base de la página
│   ├── argentina.css   # Tema Argentina
│   └── latam.css       # Tema LATAM
├── js/
│   └── app.js          # Lógica de generación de PDF
└── img/
    ├── logo-escencial.png
    ├── logo-escencial-portada.png
    ├── logo-escencial-contraportada.png
    ├── logo-latam.png
    ├── logo-latam-portada.png
    └── logo-latam-contraportada.png
```

## 🖼️ Imágenes Requeridas

Debes agregar las siguientes imágenes en la carpeta `img/`:

### Argentina:
- `logo-escencial.png` - Logo principal para el header
- `logo-escencial-portada.png` - Imagen de fondo de portada
- `logo-escencial-contraportada.png` - Imagen de fondo de contraportada

### LATAM:
- `logo-latam.png` - Logo principal para el header
- `logo-latam-portada.png` - Imagen de fondo de portada
- `logo-latam-contraportada.png` - Imagen de fondo de contraportada

## 🚀 Uso

1. **Seleccionar Modelo:** Elegí entre Argentina 🇦🇷 o LATAM 🌎
2. **Completar Campos:**
   - Título del Manual
   - Subtítulo (opcional)
   - Índice (pegá el índice generado por Claude)
   - Contenido (pegá el contenido completo en formato Markdown)

3. **Generar PDF:**
   - 👁️ **Vista Previa:** Ver el PDF antes de descargarlo
   - ✨ **Generar y Descargar:** Descargar directamente el PDF

## 📝 Formato del Contenido

El contenido debe estar en Markdown con la siguiente estructura:

```markdown
# CAPÍTULO 1: Título del Capítulo

## 1.1 Subtítulo de Sección

Contenido del párrafo con **texto en negrita** y texto normal.

### Subsección

Más contenido...

• Lista con viñetas
• Segundo item
• Tercer item
```

## ✨ Características

- **Portada personalizada** con título y subtítulo
- **Índice automático** con numeración y formato profesional
- **Formato de contenido:**
  - Capítulos con diseño destacado
  - Títulos y subtítulos con jerarquía visual
  - Párrafos con soporte de negritas
  - Listas con viñetas
  - Saltos de página automáticos
- **Elementos visuales:**
  - Logo en cada página
  - Numeración de páginas
  - Líneas decorativas
  - Fondos temáticos según el modelo
- **Contraportada** con imagen personalizada

## 🎯 Prompt de Claude

El generador incluye un prompt optimizado para que Claude genere manuales profesionales:

- Estilo bibliográfico formal
- Extensión: 30,000-32,000 palabras
- Sin lenguaje coloquial
- Con índice detallado
- Conclusiones por capítulo
- Glosario de términos

## 🔧 Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos y temas
- **JavaScript** - Lógica de aplicación
- **jsPDF** - Generación de PDFs
- **Google Fonts** - Tipografía Exo 2

## 📱 Responsive

El sistema es completamente responsive y funciona en:
- Desktop
- Tablets
- Móviles

## 🎨 Personalización

Para agregar un nuevo modelo:

1. Crear un nuevo archivo CSS en `css/nuevo-modelo.css`
2. Definir las variables de color
3. Agregar la configuración en `CONFIG_MODELOS` en `app.js`
4. Agregar las imágenes correspondientes en `img/`

## 📄 Licencia

Sistema desarrollado para generación de manuales profesionales.
