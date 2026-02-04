/* ═══════════════════════════════════════════════════════════════════
   GENERADOR DE MANUALES - ARGENTINA & LATAM
   JavaScript Principal - Versión Mejorada con Portadas Corregidas
   ═══════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════
// VARIABLES GLOBALES
// ═══════════════════════════════════════════════════════════════════

let modeloActual = 'argentina';
let pdfGenerado = null;
let imagenesCargadas = {
  logo: null,
  portada: null,
  contraportada: null
};

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE MODELOS
// ═══════════════════════════════════════════════════════════════════

const CONFIG_MODELOS = {
  argentina: {
    nombre: 'Argentina',
    imagenes: {
      logo: './img/logo-escencial.png',
      portada: './img/logo-escencial-portada.png',
      contraportada: './img/logo-escencial-contraportada.png'
    },
    colores: {
      primario: [34, 217, 223],      // Cyan brillante
      secundario: [11, 74, 110],     // Azul petróleo
      acento: [193, 255, 114],       // Lima
      oscuro: [37, 37, 37],          // Gris oscuro
      marino: [45, 85, 105],         // Azul marino
      texto: [40, 40, 40],           // Texto oscuro para fondo blanco
      fondoPortada: [45, 85, 105],   // Fondo portada
      amarillo: [226, 184, 8]        // Amarillo dorado
    },
    fuente: 'helvetica'
  },
  latam: {
    nombre: 'LATAM',
    imagenes: {
      logo: './img/logo-latam.png',
      portada: './img/logo-latam-portada.png',
      contraportada: './img/logo-latam-contraportada.png'
    },
    colores: {
      primario: [226, 184, 8],       // Dorado sol
      secundario: [139, 129, 23],    // Dorado oscuro
      acento: [152, 74, 48],         // Amatista
      oscuro: [33, 13, 65],          // Violeta oscuro
      marino: [33, 13, 65],          // Violeta
      texto: [40, 40, 40],           // Texto oscuro para fondo blanco
      fondoPortada: [33, 13, 65],    // Fondo portada
      amarillo: [226, 184, 8]        // Amarillo dorado
    },
    fuente: 'helvetica'
  }
};

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL PDF
// ═══════════════════════════════════════════════════════════════════

function obtenerConfigPDF() {
  const config = CONFIG_MODELOS[modeloActual];
  return {
    PAGE_W: 210,
    PAGE_H: 297,
    ML: 25,
    MR: 185,
    MT: 30,
    MB: 265,
    FONT: config.fuente,
    COLORS: config.colores,
    IMAGENES: config.imagenes,
    LINE_HEIGHT: 6.5,
    PARAGRAPH_SPACING: 7,
    SECTION_SPACING: 10,
    CHAPTER_SPACING: 14
  };
}

// ═══════════════════════════════════════════════════════════════════
// VARIABLES DE CONTROL
// ═══════════════════════════════════════════════════════════════════

let numPagina = 2;
let cursorY = 30;

// ═══════════════════════════════════════════════════════════════════
// FUNCIONES DE INTERFAZ
// ═══════════════════════════════════════════════════════════════════

function seleccionarModelo(modelo) {
  modeloActual = modelo;
  
  document.querySelectorAll('.model-card').forEach(card => {
    card.classList.remove('active');
  });
  document.querySelector(`.model-card[data-model="${modelo}"]`).classList.add('active');
  
  const themeCSS = document.getElementById('themeCSS');
  themeCSS.href = `./css/${modelo}.css`;
  
  pdfGenerado = null;
  
  console.log(`✅ Modelo cambiado a: ${CONFIG_MODELOS[modelo].nombre}`);
}

function mostrarPrompt() {
  document.getElementById('promptModal').classList.add('active');
}

function cerrarPrompt() {
  document.getElementById('promptModal').classList.remove('active');
}

function copiarPrompt() {
  const texto = document.getElementById('promptText').innerText;
  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.innerText = '✅ ¡Copiado!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerText = '📋 Copiar Prompt';
      btn.classList.remove('copied');
    }, 2000);
  });
}

function cerrarVistaPrevia() {
  const modal = document.getElementById('pdfPreviewModal');
  const pdfFrame = document.getElementById('pdfFrame');
  
  modal.classList.remove('active');
  
  if (pdfFrame.src) {
    URL.revokeObjectURL(pdfFrame.src);
    pdfFrame.src = '';
  }
}

// ═══════════════════════════════════════════════════════════════════
// CARGA DE IMÁGENES
// ═══════════════════════════════════════════════════════════════════

async function cargarImagenBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve({
          data: dataURL,
          formato: 'PNG'
        });
      } catch (e) {
        console.warn(`Error convirtiendo imagen ${url}:`, e);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn(`No se pudo cargar: ${url}`);
      resolve(null);
    };
    img.src = url;
  });
}

async function precargarImagenes() {
  const config = CONFIG_MODELOS[modeloActual];
  
  console.log(`📸 Cargando imágenes para modelo: ${config.nombre}`);
  
  imagenesCargadas.logo = await cargarImagenBase64(config.imagenes.logo);
  imagenesCargadas.portada = await cargarImagenBase64(config.imagenes.portada);
  imagenesCargadas.contraportada = await cargarImagenBase64(config.imagenes.contraportada);
  
  console.log('✅ Imágenes precargadas');
}

// ═══════════════════════════════════════════════════════════════════
// FUNCIONES DE DIBUJO - FONDO Y ELEMENTOS
// ═══════════════════════════════════════════════════════════════════

function dibujarFondoPagina(doc) {
  const CFG = obtenerConfigPDF();
  
  // Fondo blanco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, CFG.PAGE_W, CFG.PAGE_H, 'F');
  
  // Marca de agua con logo en el centro
  if (imagenesCargadas.logo && imagenesCargadas.logo.data) {
    try {
      const logoSize = 80;
      const logoX = (CFG.PAGE_W - logoSize) / 2;
      const logoY = (CFG.PAGE_H - logoSize) / 2;
      
      doc.setGState(new doc.GState({ opacity: 0.08 }));
      doc.addImage(
        imagenesCargadas.logo.data,
        imagenesCargadas.logo.formato,
        logoX,
        logoY,
        logoSize,
        logoSize
      );
      doc.setGState(new doc.GState({ opacity: 1 }));
    } catch (e) {
      console.warn('Error agregando marca de agua:', e);
    }
  }
  
  // Línea decorativa superior
  doc.setDrawColor(...CFG.COLORS.primario);
  doc.setLineWidth(0.8);
  doc.line(CFG.ML, 22, CFG.MR, 22);
  
  // Onda decorativa superior
  doc.setDrawColor(...CFG.COLORS.primario);
  doc.setLineWidth(0.3);
  const waveY = 24;
  for (let x = CFG.ML; x < CFG.MR; x += 2) {
    const y = waveY + Math.sin(x / 5) * 0.5;
    if (x === CFG.ML) {
      doc.moveTo(x, y);
    } else {
      doc.lineTo(x, y);
    }
  }
  doc.stroke();
  
  // Número de página
  doc.setFont(CFG.FONT, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...CFG.COLORS.primario);
  doc.text(`${numPagina}`, CFG.PAGE_W / 2, CFG.MB + 8, { align: 'center' });
  
  // Línea decorativa inferior
  doc.setDrawColor(...CFG.COLORS.primario);
  doc.setLineWidth(0.5);
  doc.line(CFG.ML, CFG.MB, CFG.MR, CFG.MB);
}

function verificarEspacioYSaltarPagina(doc, espacioRequerido) {
  const CFG = obtenerConfigPDF();
  
  if (cursorY + espacioRequerido > CFG.MB) {
    doc.addPage();
    dibujarFondoPagina(doc);
    numPagina++;
    cursorY = CFG.MT;
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// PROCESAMIENTO DE TEXTO CON NEGRITAS
// ═══════════════════════════════════════════════════════════════════

function escribirLineaConNegritas(texto, x, y, fontSize, color) {
  const doc = window.currentDoc;
  const CFG = obtenerConfigPDF();
  
  if (!texto || !texto.trim()) return;
  
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  
  const regex = /(\*\*)(.*?)\1/g;
  const partes = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(texto)) !== null) {
    if (match.index > lastIndex) {
      partes.push({
        texto: texto.substring(lastIndex, match.index),
        negrita: false
      });
    }
    partes.push({
      texto: match[2],
      negrita: true
    });
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < texto.length) {
    partes.push({
      texto: texto.substring(lastIndex),
      negrita: false
    });
  }
  
  if (partes.length === 0) {
    partes.push({ texto: texto, negrita: false });
  }
  
  let posX = x;
  
  partes.forEach(parte => {
    if (!parte.texto) return;
    
    doc.setFont(CFG.FONT, parte.negrita ? 'bold' : 'normal');
    doc.text(parte.texto, posX, y);
    posX += doc.getTextWidth(parte.texto);
  });
}

function dividirTextoEnLineas(doc, texto, maxWidth, fontSize) {
  doc.setFontSize(fontSize);
  const palabras = texto.split(' ');
  const lineas = [];
  let lineaActual = '';
  
  palabras.forEach(palabra => {
    const pruebaLinea = lineaActual ? `${lineaActual} ${palabra}` : palabra;
    const anchoTexto = doc.getTextWidth(pruebaLinea);
    
    if (anchoTexto <= maxWidth) {
      lineaActual = pruebaLinea;
    } else {
      if (lineaActual) {
        lineas.push(lineaActual);
      }
      lineaActual = palabra;
    }
  });
  
  if (lineaActual) {
    lineas.push(lineaActual);
  }
  
  return lineas;
}

// ═══════════════════════════════════════════════════════════════════
// GENERACIÓN DE PORTADA - VERSIÓN CORREGIDA
// Solo usa la imagen de fondo y agrega título/subtítulo encima
// ═══════════════════════════════════════════════════════════════════

function generarPortada(doc, titulo, subtitulo) {
  const CFG = obtenerConfigPDF();
  
  // 1. INSERTAR IMAGEN DE PORTADA COMPLETA COMO FONDO
  if (imagenesCargadas.portada && imagenesCargadas.portada.data) {
    try {
      doc.addImage(
        imagenesCargadas.portada.data,
        imagenesCargadas.portada.formato,
        0, 0, CFG.PAGE_W, CFG.PAGE_H
      );
    } catch (e) {
      console.warn('Error cargando imagen de portada:', e);
      // Fallback: fondo de color
      doc.setFillColor(...CFG.COLORS.fondoPortada);
      doc.rect(0, 0, CFG.PAGE_W, CFG.PAGE_H, 'F');
    }
  } else {
    // Si no hay imagen, usar color de fondo
    doc.setFillColor(...CFG.COLORS.fondoPortada);
    doc.rect(0, 0, CFG.PAGE_W, CFG.PAGE_H, 'F');
  }
  
  // 2. AGREGAR TÍTULO SOBRE LA IMAGEN
  // Posición basada en la imagen de referencia: centrado, parte superior-media
  
  let tituloY = 175; // Posición vertical del título
  
  // Verificar si el título tiene saltos de línea (formato "DERECHO\nPREVISIONAL...")
  const partesTitulo = titulo.split('\n');
  
  if (partesTitulo.length > 1) {
    // Primera línea del título (normal, blanco)
    doc.setFont(CFG.FONT, 'normal');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text(partesTitulo[0], CFG.PAGE_W / 2, tituloY, { align: 'center' });
    tituloY += 15;
    
    // Segunda línea del título (bold, amarillo dorado)
    doc.setFont(CFG.FONT, 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...CFG.COLORS.amarillo);
    
    // Procesar el resto del título (puede tener múltiples líneas)
    const restoTitulo = partesTitulo.slice(1).join(' ');
    const lineasTitulo = doc.splitTextToSize(restoTitulo, 170);
    
    lineasTitulo.forEach(linea => {
      doc.text(linea, CFG.PAGE_W / 2, tituloY, { align: 'center' });
      tituloY += 11;
    });
    
  } else {
    // Si no hay saltos de línea, mostrar todo el título en formato destacado
    doc.setFont(CFG.FONT, 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...CFG.COLORS.amarillo);
    
    const lineasTitulo = doc.splitTextToSize(titulo, 170);
    lineasTitulo.forEach(linea => {
      doc.text(linea, CFG.PAGE_W / 2, tituloY, { align: 'center' });
      tituloY += 12;
    });
  }
  
  // 3. AGREGAR SUBTÍTULO (si existe)
  if (subtitulo && subtitulo.trim()) {
    tituloY += 8;
    doc.setFont(CFG.FONT, 'normal');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    
    const lineasSubtitulo = doc.splitTextToSize(subtitulo, 170);
    lineasSubtitulo.forEach(linea => {
      doc.text(linea, CFG.PAGE_W / 2, tituloY, { align: 'center' });
      tituloY += 8;
    });
  }
  
  // NO agregamos más elementos decorativos - la imagen ya los tiene
}

// ═══════════════════════════════════════════════════════════════════
// GENERACIÓN DE ÍNDICE
// ═══════════════════════════════════════════════════════════════════

function generarIndiceConEstilo(doc, indiceRaw) {
  if (!indiceRaw || !indiceRaw.trim()) return;
  
  const CFG = obtenerConfigPDF();
  window.currentDoc = doc;
  
  doc.addPage();
  dibujarFondoPagina(doc);
  cursorY = CFG.MT + 10;
  
  // Título del índice
  doc.setFont(CFG.FONT, 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...CFG.COLORS.primario);
  doc.text('ÍNDICE', CFG.PAGE_W / 2, cursorY, { align: 'center' });
  cursorY += 15;
  
  // Línea decorativa
  doc.setDrawColor(...CFG.COLORS.primario);
  doc.setLineWidth(1);
  doc.line(CFG.ML, cursorY, CFG.MR, cursorY);
  cursorY += 12;
  
  // Procesar contenido del índice
  const lineas = indiceRaw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
  
  lineas.forEach(linea => {
    const espacioNecesario = 7;
    verificarEspacioYSaltarPagina(doc, espacioNecesario);
    
    const matchNum = linea.match(/^(\d+(?:\.\d+)*\.?)\s*(.*)/);
    
    if (matchNum) {
      const numero = matchNum[1];
      const texto = matchNum[2];
      const nivel = (numero.match(/\./g) || []).length;
      const indent = CFG.ML + (nivel * 8);
      
      // Número
      doc.setFont(CFG.FONT, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...CFG.COLORS.primario);
      doc.text(numero, indent, cursorY);
      
      // Texto
      doc.setFont(CFG.FONT, 'normal');
      doc.setTextColor(...CFG.COLORS.texto);
      escribirLineaConNegritas(texto, indent + 15, cursorY, 10, CFG.COLORS.texto);
    } else {
      doc.setFont(CFG.FONT, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...CFG.COLORS.texto);
      
      if (linea.toUpperCase() === linea && linea.length < 50) {
        doc.setFont(CFG.FONT, 'bold');
        doc.setTextColor(...CFG.COLORS.primario);
      }
      
      doc.text(linea, CFG.ML, cursorY);
    }
    
    cursorY += espacioNecesario;
  });
}

// ═══════════════════════════════════════════════════════════════════
// PARSEO DE MARKDOWN
// ═══════════════════════════════════════════════════════════════════

function parsearMarkdown(texto) {
  const lineas = texto.split('\n');
  const bloques = [];
  let bloqueActual = null;
  
  lineas.forEach((linea, idx) => {
    const trimmed = linea.trim();
    
    // Línea vacía - cerrar bloque actual si existe
    if (!trimmed) {
      if (bloqueActual && bloqueActual.tipo === 'parrafo' && bloqueActual.lineas.length > 0) {
        bloques.push(bloqueActual);
        bloqueActual = null;
      }
      return;
    }
    
    // Capítulo
    if (/^#\s+CAP[ÍI]TULO/i.test(trimmed)) {
      if (bloqueActual) bloques.push(bloqueActual);
      bloqueActual = {
        tipo: 'capitulo',
        contenido: trimmed.replace(/^#+\s*/, ''),
        lineas: []
      };
      bloques.push(bloqueActual);
      bloqueActual = null;
    }
    // Título nivel 1
    else if (/^#\s+/.test(trimmed) && !/^#\s+CAP[ÍI]TULO/i.test(trimmed)) {
      if (bloqueActual) bloques.push(bloqueActual);
      bloqueActual = {
        tipo: 'titulo1',
        contenido: trimmed.replace(/^#+\s*/, ''),
        lineas: []
      };
      bloques.push(bloqueActual);
      bloqueActual = null;
    }
    // Subtítulo nivel 2
    else if (/^##\s+/.test(trimmed)) {
      if (bloqueActual) bloques.push(bloqueActual);
      bloqueActual = {
        tipo: 'titulo2',
        contenido: trimmed.replace(/^#+\s*/, ''),
        lineas: []
      };
      bloques.push(bloqueActual);
      bloqueActual = null;
    }
    // Subtítulo nivel 3
    else if (/^###\s+/.test(trimmed)) {
      if (bloqueActual) bloques.push(bloqueActual);
      bloqueActual = {
        tipo: 'titulo3',
        contenido: trimmed.replace(/^#+\s*/, ''),
        lineas: []
      };
      bloques.push(bloqueActual);
      bloqueActual = null;
    }
    // Lista con viñetas
    else if (/^[•\-\*]\s+/.test(trimmed)) {
      if (!bloqueActual || bloqueActual.tipo !== 'lista') {
        if (bloqueActual) bloques.push(bloqueActual);
        bloqueActual = { tipo: 'lista', items: [] };
      }
      bloqueActual.items.push(trimmed.replace(/^[•\-\*]\s+/, ''));
    }
    // Párrafo normal
    else {
      if (!bloqueActual || bloqueActual.tipo !== 'parrafo') {
        if (bloqueActual) bloques.push(bloqueActual);
        bloqueActual = { tipo: 'parrafo', lineas: [] };
      }
      bloqueActual.lineas.push(trimmed);
    }
  });
  
  if (bloqueActual && bloqueActual.lineas && bloqueActual.lineas.length > 0) {
    bloques.push(bloqueActual);
  }
  
  return bloques;
}

// ═══════════════════════════════════════════════════════════════════
// PROCESAMIENTO DE BLOQUES
// ═══════════════════════════════════════════════════════════════════

function procesarBloques(doc, bloques) {
  const CFG = obtenerConfigPDF();
  window.currentDoc = doc;
  
  bloques.forEach((bloque, idx) => {
    switch (bloque.tipo) {
      case 'capitulo':
        procesarCapitulo(doc, bloque);
        break;
      case 'titulo1':
        procesarTitulo1(doc, bloque);
        break;
      case 'titulo2':
        procesarTitulo2(doc, bloque);
        break;
      case 'titulo3':
        procesarTitulo3(doc, bloque);
        break;
      case 'lista':
        procesarLista(doc, bloque);
        break;
      case 'parrafo':
        procesarParrafo(doc, bloque);
        break;
    }
  });
}

function procesarCapitulo(doc, bloque) {
  const CFG = obtenerConfigPDF();
  
  doc.addPage();
  dibujarFondoPagina(doc);
  numPagina++;
  cursorY = CFG.MT + 20;
  
  doc.setFont(CFG.FONT, 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...CFG.COLORS.primario);
  
  const lineas = doc.splitTextToSize(bloque.contenido, CFG.MR - CFG.ML);
  lineas.forEach(linea => {
    doc.text(linea, CFG.ML, cursorY);
    cursorY += 11;
  });
  
  cursorY += 3;
  doc.setDrawColor(...CFG.COLORS.primario);
  doc.setLineWidth(1.2);
  doc.line(CFG.ML, cursorY, CFG.MR, cursorY);
  cursorY += CFG.CHAPTER_SPACING;
}

function procesarTitulo1(doc, bloque) {
  const CFG = obtenerConfigPDF();
  
  verificarEspacioYSaltarPagina(doc, 22);
  
  cursorY += CFG.SECTION_SPACING;
  
  doc.setFont(CFG.FONT, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...CFG.COLORS.primario);
  
  const lineas = doc.splitTextToSize(bloque.contenido, CFG.MR - CFG.ML);
  lineas.forEach(linea => {
    doc.text(linea, CFG.ML, cursorY);
    cursorY += 7;
  });
  
  cursorY += 3;
  doc.setDrawColor(...CFG.COLORS.primario);
  doc.setLineWidth(0.6);
  doc.line(CFG.ML, cursorY, CFG.ML + 50, cursorY);
  cursorY += 8;
}

function procesarTitulo2(doc, bloque) {
  const CFG = obtenerConfigPDF();
  
  verificarEspacioYSaltarPagina(doc, 18);
  
  cursorY += CFG.SECTION_SPACING - 2;
  
  doc.setFont(CFG.FONT, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...CFG.COLORS.secundario);
  
  const lineas = doc.splitTextToSize(bloque.contenido, CFG.MR - CFG.ML);
  lineas.forEach(linea => {
    doc.text(linea, CFG.ML, cursorY);
    cursorY += 6;
  });
  
  cursorY += 6;
}

function procesarTitulo3(doc, bloque) {
  const CFG = obtenerConfigPDF();
  
  verificarEspacioYSaltarPagina(doc, 14);
  
  cursorY += CFG.PARAGRAPH_SPACING - 1;
  
  doc.setFont(CFG.FONT, 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...CFG.COLORS.primario);
  
  const lineas = doc.splitTextToSize(bloque.contenido, CFG.MR - CFG.ML);
  lineas.forEach(linea => {
    doc.text(linea, CFG.ML, cursorY);
    cursorY += 5.5;
  });
  
  cursorY += 5;
}

function procesarLista(doc, bloque) {
  const CFG = obtenerConfigPDF();
  
  bloque.items.forEach(item => {
    const espacioItem = 12;
    verificarEspacioYSaltarPagina(doc, espacioItem);
    
    // Viñeta
    doc.setFont(CFG.FONT, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...CFG.COLORS.primario);
    doc.text('•', CFG.ML + 2, cursorY);
    
    // Texto del item
    doc.setFont(CFG.FONT, 'normal');
    doc.setTextColor(...CFG.COLORS.texto);
    
    const maxWidth = CFG.MR - CFG.ML - 10;
    const lineas = dividirTextoEnLineas(doc, item, maxWidth, 10);
    
    lineas.forEach((linea, idx) => {
      const xPos = CFG.ML + 8;
      escribirLineaConNegritas(linea, xPos, cursorY, 10, CFG.COLORS.texto);
      cursorY += CFG.LINE_HEIGHT;
    });
    
    cursorY += 1;
  });
  
  cursorY += CFG.PARAGRAPH_SPACING - 3;
}

function procesarParrafo(doc, bloque) {
  const CFG = obtenerConfigPDF();
  
  const textoCompleto = bloque.lineas.join(' ');
  const maxWidth = CFG.MR - CFG.ML;
  const lineas = dividirTextoEnLineas(doc, textoCompleto, maxWidth, 10);
  
  lineas.forEach(linea => {
    verificarEspacioYSaltarPagina(doc, CFG.LINE_HEIGHT + 1);
    
    doc.setFont(CFG.FONT, 'normal');
    doc.setFontSize(10);
    escribirLineaConNegritas(linea, CFG.ML, cursorY, 10, CFG.COLORS.texto);
    cursorY += CFG.LINE_HEIGHT;
  });
  
  cursorY += CFG.PARAGRAPH_SPACING;
}

// ═══════════════════════════════════════════════════════════════════
// CONTRAPORTADA - VERSIÓN CORREGIDA
// Solo usa la imagen completa sin modificarla
// ═══════════════════════════════════════════════════════════════════

function generarContraportada(doc) {
  const CFG = obtenerConfigPDF();
  
  doc.addPage();
  
  // Insertar imagen de contraportada completa
  if (imagenesCargadas.contraportada && imagenesCargadas.contraportada.data) {
    try {
      doc.addImage(
        imagenesCargadas.contraportada.data,
        imagenesCargadas.contraportada.formato,
        0, 0, CFG.PAGE_W, CFG.PAGE_H
      );
    } catch (e) {
      console.warn('Error cargando contraportada:', e);
      // Fallback: color de fondo
      doc.setFillColor(...CFG.COLORS.fondoPortada);
      doc.rect(0, 0, CFG.PAGE_W, CFG.PAGE_H, 'F');
    }
  } else {
    // Si no hay imagen, usar color de fondo
    doc.setFillColor(...CFG.COLORS.fondoPortada);
    doc.rect(0, 0, CFG.PAGE_W, CFG.PAGE_H, 'F');
  }
  
  // NO agregamos nada más - la imagen ya está completa
}

// ═══════════════════════════════════════════════════════════════════
// GENERACIÓN COMPLETA DEL DOCUMENTO
// ═══════════════════════════════════════════════════════════════════

async function generarDocumentoCompleto() {
  const titulo = document.getElementById('titulo').value || 'Manual';
  const subtitulo = document.getElementById('subtitulo').value || '';
  const contenidoRaw = document.getElementById('contenido').value || '';
  const indiceRaw = document.getElementById('indice').value || '';
  
  if (!contenidoRaw.trim()) {
    alert('⚠️ El contenido del manual está vacío.');
    return null;
  }
  
  await precargarImagenes();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return new Promise((resolve, reject) => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ format: 'a4', unit: 'mm' });
      
      numPagina = 2;
      cursorY = 30;
      
      generarPortada(doc, titulo, subtitulo);
      generarIndiceConEstilo(doc, indiceRaw);
      
      doc.addPage();
      dibujarFondoPagina(doc);
      cursorY = 30;
      
      const bloques = parsearMarkdown(contenidoRaw);
      procesarBloques(doc, bloques);
      
      generarContraportada(doc);
      
      console.log('✅ PDF generado exitosamente');
      resolve(doc);
      
    } catch (e) {
      console.error('❌ Error generando PDF:', e);
      reject(e);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// VISTA PREVIA - MEJORADA PARA VISUALIZACIÓN COMPLETA
// ═══════════════════════════════════════════════════════════════════

async function previsualizarPDF() {
  const modal = document.getElementById('pdfPreviewModal');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const pdfContainer = document.getElementById('pdfContainer');
  const pdfFrame = document.getElementById('pdfFrame');
  const previewBtn = document.getElementById('previewBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  
  modal.classList.add('active');
  loadingSpinner.classList.add('active');
  pdfContainer.style.display = 'none';
  
  previewBtn.disabled = true;
  downloadBtn.disabled = true;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const doc = await generarDocumentoCompleto();
    pdfGenerado = doc;
    
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    pdfFrame.src = pdfUrl;
    
    // Esperar a que el iframe cargue
    pdfFrame.onload = () => {
      loadingSpinner.classList.remove('active');
      pdfContainer.style.display = 'block';
    };
    
  } catch (error) {
    alert('❌ Error al generar vista previa: ' + error.message);
    console.error(error);
    modal.classList.remove('active');
  } finally {
    previewBtn.disabled = false;
    downloadBtn.disabled = false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// DESCARGA DE PDF
// ═══════════════════════════════════════════════════════════════════

async function generarPDF() {
  const downloadBtn = document.getElementById('downloadBtn');
  const previewBtn = document.getElementById('previewBtn');
  
  const textoOriginal = '✨ Generar y Descargar PDF';
  
  downloadBtn.disabled = true;
  previewBtn.disabled = true;
  downloadBtn.innerText = '⏳ Procesando...';
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let doc;
    if (pdfGenerado) {
      doc = pdfGenerado;
    } else {
      doc = await generarDocumentoCompleto();
    }
    
    const titulo = document.getElementById('titulo').value || 'Manual';
    const nombreModelo = CONFIG_MODELOS[modeloActual].nombre;
    const nombreArchivo = `${titulo.replace(/\s+/g, '_')}_${nombreModelo}.pdf`;
    
    doc.save(nombreArchivo);
    
    alert('✅ PDF descargado con éxito.');
    
  } catch (error) {
    alert('❌ Error al generar PDF: ' + error.message);
    console.error(error);
  } finally {
    downloadBtn.disabled = false;
    previewBtn.disabled = false;
    downloadBtn.innerText = textoOriginal;
  }
}

// ═══════════════════════════════════════════════════════════════════
// ANIMACIÓN DE ESTRELLAS
// ═══════════════════════════════════════════════════════════════════

const canvas = document.getElementById('stars');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;
  
  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  
  window.addEventListener('resize', resize);
  resize();
  
  const stars = Array.from({ length: 80 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 2
  }));
  
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  
  draw();
}

// ═══════════════════════════════════════════════════════════════════
// SCROLL HEADER
// ═══════════════════════════════════════════════════════════════════

window.addEventListener('scroll', () => {
  const header = document.getElementById('mainHeader');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ═══════════════════════════════════════════════════════════════════
// ATAJOS DE TECLADO
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    cerrarPrompt();
    cerrarVistaPrevia();
  }
});

// ═══════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════

console.log('🚀 Generador de Manuales Argentina & LATAM cargado (Versión Mejorada)');
console.log(`📍 Modelo actual: ${CONFIG_MODELOS[modeloActual].nombre}`);