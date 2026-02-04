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
      primario: '#5ec3f5',
      secundario: '#0B4A6E',
      acento: '#C1FF72',
      oscuro: '#252525',
      marino: '#22D9DF',
      texto: '#282828',
      fondoPortada: '#2D5569',
      amarillo: '#E2B808'
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
      primario: '#a811ff',
      secundario: '#d4c625',
      acento: '#984A30',
      oscuro: '#210D41',
      marino: '#210D41',
      texto: '#282828',
      fondoPortada: '#210D41',
      amarillo: '#E2B808'
    },
    fuente: 'helvetica'
  }
};

// ✅ Pegá esto también para que jsPDF siga funcionando igual (convierte HEX -> [r,g,b])
function hexA_RGB(hex) {
  if (Array.isArray(hex)) return hex;
  const h = String(hex).trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map(ch => ch + ch).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function normalizarColores(colores) {
  const out = {};
  Object.keys(colores || {}).forEach(k => {
    out[k] = hexA_RGB(colores[k]);
  });
  return out;
}

// ✅ y en tu obtenerConfigPDF(), cambiá SOLO esta parte:
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
    COLORS: normalizarColores(config.colores), // 👈 acá
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

function dibujarFondoPagina(doc, opciones = {}) {
  const CFG = obtenerConfigPDF();

  // ✅ Opciones sin romper llamadas existentes (por defecto todo ON)
  const {
    mostrarMarcaAgua = true,
    mostrarLineaSuperior = true,
    mostrarOndaSuperior = false,
    mostrarNumeroPagina = true,
    mostrarLineaInferior = true,
    opacidadMarcaAgua = 0.08,
    maxLogoW = 140,
    maxLogoH = 70,
    ajustarLogoY = 0 // si lo querés más arriba: -5 / -10
  } = opciones;

  // Fondo blanco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, CFG.PAGE_W, CFG.PAGE_H, 'F');

  // Marca de agua con logo en el centro (respeta proporción 800x400 = 2:1)
  if (mostrarMarcaAgua && imagenesCargadas.logo && imagenesCargadas.logo.data) {
    try {
      // Proporción real del logo (ancho/alto)
      const logoOriginalW = 800;
      const logoOriginalH = 400;
      const ratio = logoOriginalW / logoOriginalH; // 2

      // Calcular tamaño manteniendo proporción
      let logoW = maxLogoW;
      let logoH = logoW / ratio;

      if (logoH > maxLogoH) {
        logoH = maxLogoH;
        logoW = logoH * ratio;
      }

      // Centrado
      const logoX = (CFG.PAGE_W - logoW) / 2;
      const logoY = (CFG.PAGE_H - logoH) / 2 + ajustarLogoY;

      doc.setGState(new doc.GState({ opacity: opacidadMarcaAgua }));
      doc.addImage(
        imagenesCargadas.logo.data,
        imagenesCargadas.logo.formato,
        logoX,
        logoY,
        logoW,
        logoH
      );
      doc.setGState(new doc.GState({ opacity: 1 }));
    } catch (e) {
      console.warn('Error agregando marca de agua:', e);
      try { doc.setGState(new doc.GState({ opacity: 1 })); } catch (_) {}
    }
  }

  // Línea decorativa superior
  if (mostrarLineaSuperior) {
    doc.setDrawColor(...CFG.COLORS.primario);
    doc.setLineWidth(0.8);
    doc.line(CFG.ML, 22, CFG.MR, 22);
  }

  // Onda decorativa superior
  if (mostrarOndaSuperior) {
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
  }

  // Número de página
  if (mostrarNumeroPagina) {
    doc.setFont(CFG.FONT, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...CFG.COLORS.primario);
    doc.text(`${numPagina}`, CFG.PAGE_W / 2, CFG.MB + 8, { align: 'center' });
  }

  // Línea decorativa inferior
  if (mostrarLineaInferior) {
    doc.setDrawColor(...CFG.COLORS.primario);
    doc.setLineWidth(0.5);
    doc.line(CFG.ML, CFG.MB, CFG.MR, CFG.MB);
  }
}

function verificarEspacioYSaltarPagina(doc, espacioRequerido) {
  const CFG = obtenerConfigPDF();

  if (cursorY + espacioRequerido > CFG.MB) {
    doc.addPage();

    // ✅ CORREGIDO: primero incrementa, después dibuja (si no, se repite el número)
    numPagina++;

    dibujarFondoPagina(doc);
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
  
  let tituloY = 115; // Posición vertical del título

  // ✅ Alineación izquierda → derecha (no centrado)
  const xIzq = CFG.ML = 10;               // margen izquierdo (podés usar 18/20 si lo querés más a la izquierda)
  const maxW = CFG.PAGE_W - xIzq - 18; // margen derecho (ajustá 18/20/25 según tu plantilla)


  // ✅ Para controlar bien el espacio entre TÍTULO y SUBTÍTULO
  let ultimoYImpreso = tituloY;
  
  // Verificar si el título tiene saltos de línea (formato "DERECHO\nPREVISIONAL...")
  const partesTitulo = String(titulo || '').split('\n');
  const colorTituloDestacado = (modeloActual === 'argentina')
    ? CFG.COLORS.primario
    : CFG.COLORS.amarillo;

  
  if (partesTitulo.length > 1) {
    // Primera línea del título (normal, blanco)
    doc.setFont(CFG.FONT, 'normal');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text(partesTitulo[0], xIzq, tituloY, { align: 'left' });
    ultimoYImpreso = tituloY;
    tituloY += 15;
    
    // Segunda línea del título (bold, amarillo dorado)
    doc.setFont(CFG.FONT, 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...colorTituloDestacado);
    
    // Procesar el resto del título (puede tener múltiples líneas)
    const restoTitulo = partesTitulo.slice(1).join(' ');
    const lineasTitulo = doc.splitTextToSize(restoTitulo, maxW);
    
    lineasTitulo.forEach(linea => {
      doc.text(linea, xIzq, tituloY, { align: 'left' });
      ultimoYImpreso = tituloY;
      tituloY += 11
    });
    
  } else {
    // Si no hay saltos de línea, mostrar todo el título en formato destacado
    doc.setFont(CFG.FONT, 'bold');
    doc.setFontSize(26);
        doc.setTextColor(...colorTituloDestacado);
    
    const lineasTitulo = doc.splitTextToSize(String(titulo || ''), maxW);
    lineasTitulo.forEach(linea => {
      doc.text(linea, xIzq, tituloY, { align: 'left' });
      ultimoYImpreso = tituloY;
      tituloY += 12;
    });
  }

// 3. AGREGAR SUBTÍTULO (si existe)
// ✅ CORREGIDO: gap seguro para que NO se tape (antes era muy chico)
if (subtitulo && subtitulo.trim()) {
  const gapTituloSubtitulo = 10; // ✅ probá 8 si lo querés más junto (2/3 tapa)
  tituloY = ultimoYImpreso + gapTituloSubtitulo;

  doc.setFont(CFG.FONT, 'normal');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);

  const lineasSubtitulo = doc.splitTextToSize(subtitulo.trim(), maxW);
  lineasSubtitulo.forEach(linea => {
    doc.text(linea, xIzq, tituloY, { align: 'left' });
    tituloY += 8;
  });
}

}

// ═══════════════════════════════════════════════════════════════════
// GENERACIÓN DE ÍNDICE - CORREGIDO
// ═══════════════════════════════════════════════════════════════════

function generarIndiceConEstilo(doc, indiceRaw) {
  if (!indiceRaw || !indiceRaw.trim()) return;
  
  const CFG = obtenerConfigPDF();
  window.currentDoc = doc;
  
  doc.addPage();
  dibujarFondoPagina(doc);

  cursorY = CFG.MT + 4;
  
  // Título del índice
  doc.setFont(CFG.FONT, 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...CFG.COLORS.primario);
  doc.text('ÍNDICE', CFG.PAGE_W / 2, cursorY, { align: 'center' });
  cursorY += 12;
  
  // Línea decorativa
  doc.setDrawColor(...CFG.COLORS.primario);
  doc.setLineWidth(0.6);
  doc.line(CFG.ML, cursorY, CFG.MR, cursorY);
  cursorY += 10;
  
  // Procesar contenido del índice
  const lineas = indiceRaw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
  
  lineas.forEach(linea => {
    const matchNum = linea.match(/^(\d+(?:\.\d+)*\.?)\s*(.*)/);
    
    if (matchNum) {
      const numero = matchNum[1];
      const texto = matchNum[2];
      const nivel = (numero.match(/\./g) || []).length;
      const indent = CFG.ML + (nivel * 5);
      
      // Calcular ancho máximo para el texto
      const anchoNumero = 15; // Espacio reservado para el número
      const maxWidth = CFG.MR - indent - anchoNumero;
      
      // Dividir texto en líneas si es muy largo
      doc.setFont(CFG.FONT, 'normal');
      doc.setFontSize(11);
      const lineasTexto = doc.splitTextToSize(texto, maxWidth);
      
      // Verificar espacio para todas las líneas del item
      const espacioTotal = lineasTexto.length * 6;
      verificarEspacioYSaltarPagina(doc, espacioTotal + 2);
      
      // Número
      doc.setFont(CFG.FONT, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...CFG.COLORS.primario);
      doc.text(numero, indent, cursorY);
      
      // Texto (puede ocupar múltiples líneas)
      doc.setFont(CFG.FONT, 'normal');
      doc.setTextColor(...CFG.COLORS.texto);
      
      lineasTexto.forEach((lineaTexto, idx) => {
        if (idx > 0) {
          // Para líneas continuadas, verificar espacio
          verificarEspacioYSaltarPagina(doc, 6);
        }
        escribirLineaConNegritas(lineaTexto, indent + anchoNumero, cursorY, 11, CFG.COLORS.texto);
        cursorY += 6;
      });
      
      cursorY += 1; // Pequeño espacio entre items
      
    } else {
      // Línea sin numeración (títulos de sección)
      doc.setFont(CFG.FONT, 'normal');
      doc.setFontSize(12);
      doc.setTextColor(...CFG.COLORS.texto);
      
      if (linea.toUpperCase() === linea && linea.length < 50) {
        doc.setFont(CFG.FONT, 'bold');
        doc.setTextColor(...CFG.COLORS.primario);
      }
      
      // Dividir si es muy largo
      const maxWidth = CFG.MR - CFG.ML;
      const lineasTexto = doc.splitTextToSize(linea, maxWidth);
      
      lineasTexto.forEach(lineaTexto => {
        verificarEspacioYSaltarPagina(doc, 6);
        doc.text(lineaTexto, CFG.ML, cursorY);
        cursorY += 6;
      });
      
      cursorY += 2;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// FUNCIONES PARA PROCESAR TABLAS CSV
// ═══════════════════════════════════════════════════════════════════

function parsearCSV(textoCSV) {
  const lineas = textoCSV.trim().split('\n');
  const datos = [];
  
  lineas.forEach(linea => {
    // Parsear CSV respetando comillas
    const row = [];
    let celda = '';
    let dentroComillas = false;
    
    for (let i = 0; i < linea.length; i++) {
      const char = linea[i];
      
      if (char === '"') {
        dentroComillas = !dentroComillas;
      } else if (char === ',' && !dentroComillas) {
        row.push(celda.trim());
        celda = '';
      } else {
        celda += char;
      }
    }
    
    // Agregar última celda
    row.push(celda.trim());
    datos.push(row);
  });
  
  return datos;
}

function calcularAnchoColumnas(doc, datos, anchoTotal) {
  const CFG = obtenerConfigPDF();
  const numColumnas = datos[0].length;
  
  // Calcular ancho necesario para cada columna basado en el contenido
  const anchosNecesarios = [];
  
  for (let col = 0; col < numColumnas; col++) {
    let maxAncho = 0;
    
    datos.forEach((fila, idx) => {
      const celda = fila[col] || '';
      doc.setFont(CFG.FONT, idx === 0 ? 'bold' : 'normal');
      doc.setFontSize(idx === 0 ? 9 : 8.5);
      const ancho = doc.getTextWidth(celda);
      maxAncho = Math.max(maxAncho, ancho);
    });
    
    anchosNecesarios.push(maxAncho + 4); // Padding
  }
  
  // Calcular proporción para ajustar al ancho total
  const sumaAnchos = anchosNecesarios.reduce((a, b) => a + b, 0);
  const factor = anchoTotal / sumaAnchos;
  
  // Aplicar proporción, pero respetando mínimos
  const anchoMin = 25;
  const anchosFinales = anchosNecesarios.map(ancho => {
    const anchoAjustado = ancho * factor;
    return Math.max(anchoAjustado, anchoMin);
  });
  
  // Si se pasó del ancho total, reajustar proporcionalmente
  const sumaFinal = anchosFinales.reduce((a, b) => a + b, 0);
  if (sumaFinal > anchoTotal) {
    const factorFinal = anchoTotal / sumaFinal;
    return anchosFinales.map(ancho => ancho * factorFinal);
  }
  
  return anchosFinales;
}


function dibujarTabla(doc, datos) {
  const CFG = obtenerConfigPDF();
  const anchoTotal = CFG.MR - CFG.ML;
  const anchoColumnas = calcularAnchoColumnas(doc, datos, anchoTotal);
  
  const alturaFilaEncabezado = 8;
  const alturaFila = 7;
  
  datos.forEach((fila, idxFila) => {
    const esEncabezado = idxFila === 0;
    const altura = esEncabezado ? alturaFilaEncabezado : alturaFila;
    
    // Calcular altura real necesaria (para celdas con texto largo)
    let alturaMaxima = altura;
    
    fila.forEach((celda, idxCol) => {
      const texto = String(celda || '').trim();
      const anchoCol = anchoColumnas[idxCol];
      const anchoDisponible = anchoCol - 3;
      
      doc.setFont(CFG.FONT, esEncabezado ? 'bold' : 'normal');
      doc.setFontSize(esEncabezado ? 9 : 8.5);
      
      const lineasTexto = doc.splitTextToSize(texto, anchoDisponible);
      const alturaTexto = lineasTexto.length * (esEncabezado ? 4.5 : 4.2);
      alturaMaxima = Math.max(alturaMaxima, alturaTexto + 3);
    });
    
    // Verificar si hay espacio para la fila completa
    verificarEspacioYSaltarPagina(doc, alturaMaxima + 2);
    
    let xPos = CFG.ML;
    const yInicio = cursorY;
    
    // Dibujar celdas
    fila.forEach((celda, idxCol) => {
      const anchoCol = anchoColumnas[idxCol];
      const texto = String(celda || '').trim();
      
      // Fondo de encabezado
      if (esEncabezado) {
        doc.setFillColor(...CFG.COLORS.primario);
        doc.rect(xPos, yInicio, anchoCol, alturaMaxima, 'F');
      }
      
      // Borde de celda
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(xPos, yInicio, anchoCol, alturaMaxima);
      
      // Texto
      doc.setFont(CFG.FONT, esEncabezado ? 'bold' : 'normal');
      doc.setFontSize(esEncabezado ? 9 : 8.5);
      
      // Color del texto
      if (esEncabezado) {
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setTextColor(...CFG.COLORS.texto);
      }
      
      const anchoDisponible = anchoCol - 3;
      const lineasTexto = doc.splitTextToSize(texto, anchoDisponible);
      
      let yTexto = yInicio + 4;
      lineasTexto.forEach(linea => {
        doc.text(linea, xPos + 1.5, yTexto);
        yTexto += esEncabezado ? 4.5 : 4.2;
      });
      
      xPos += anchoCol;
    });
    
    cursorY += alturaMaxima;
  });
  
  cursorY += 8;
}


function procesarTabla(doc, bloque) {
  const CFG = obtenerConfigPDF();
  
  // Verificar que tengamos datos válidos
  if (!bloque.datos || bloque.datos.length === 0) {
    console.warn('⚠️ Tabla sin datos');
    return;
  }
  
  console.log('📊 Procesando tabla con', bloque.datos.length, 'filas');
  
  // Espacio antes de la tabla
  cursorY += 4;
  
  dibujarTabla(doc, bloque.datos);
}

// ═══════════════════════════════════════════════════════════════════
// PARSEO DE MARKDOWN
// ═══════════════════════════════════════════════════════════════════

function parsearMarkdown(texto) {
  const lineas = texto.split('\n');
  const bloques = [];
  let bloqueActual = null;
  let dentroTablaCSV = false;
  let lineasTabla = [];
  
  lineas.forEach((linea, idx) => {
    const trimmed = linea.trim();
    
    // Detectar inicio de tabla CSV (línea con comas entre comillas)
const esLineaCSV = /^"[^"]*"(?:,"[^"]*")+$/.test(trimmed);

    
    if (esLineaCSV && !dentroTablaCSV) {
      // Iniciar tabla CSV
      if (bloqueActual) {
        bloques.push(bloqueActual);
        bloqueActual = null;
      }
      dentroTablaCSV = true;
      lineasTabla = [trimmed];
      return;
    }
    
    if (dentroTablaCSV) {
      if (esLineaCSV) {
        // Continuar tabla
        lineasTabla.push(trimmed);
        return;
      } else {
        // Fin de tabla
        const textoCSV = lineasTabla.join('\n');
        const datosTabla = parsearCSV(textoCSV);
        
        bloques.push({
          tipo: 'tabla',
          datos: datosTabla
        });
        
        dentroTablaCSV = false;
        lineasTabla = [];
        
        // Procesar la línea actual normalmente
        if (!trimmed) return;
      }
    }
    
    // Línea vacía
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
  
  // Cerrar tabla si quedó abierta
  if (dentroTablaCSV && lineasTabla.length > 0) {
    const textoCSV = lineasTabla.join('\n');
    const datosTabla = parsearCSV(textoCSV);
    bloques.push({
      tipo: 'tabla',
      datos: datosTabla
    });
  }
  
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
      case 'tabla':  // ⬅️ AGREGAR ESTA LÍNEA
        procesarTabla(doc, bloque);  // ⬅️ Y ESTA
        break;  // ⬅️ Y ESTA
      case 'parrafo':
        procesarParrafo(doc, bloque);
        break;
    }
  });
}

function procesarCapitulo(doc, bloque) {
  const CFG = obtenerConfigPDF();

  const contenido = String(bloque.contenido || '').trim();

  // Parse: "CAPÍTULO 1 - Título" | "CAPITULO 1: Título" | "CAPÍTULO 1"
  let etiqueta = contenido;
  let tituloCap = '';
  let capNro = '';
  const m = contenido.match(/^CAP[ÍI]TULO\s+([0-9IVXLC]+)\s*[:\-–—]?\s*(.*)$/i);
  if (m) {
    capNro = String(m[1] || '').trim();
    etiqueta = `CAPÍTULO ${capNro}`.toUpperCase();
    tituloCap = (m[2] || '').trim();
  }

  // ✅ Calculamos cuánto espacio mínimo necesitamos para NO desperdiciar hojas
  // (si entra en la página actual, no forzamos salto; si no entra, saltamos)
  doc.setFont(CFG.FONT, 'bold');
  doc.setFontSize(22);
  const altoHeader = 22; // bloque del header "CAPÍTULO X" + separaciones

  let lineasTituloCap = [];
  if (tituloCap) {
    doc.setFont(CFG.FONT, 'bold');
    doc.setFontSize(13);
    lineasTituloCap = doc.splitTextToSize(tituloCap, CFG.MR - CFG.ML);
  }

  const altoTituloCap = tituloCap ? (lineasTituloCap.length * 6.2 + 4) : 2;
  const espacioMinimoCapitulo = altoHeader + altoTituloCap + 8;

  // ✅ Evita páginas vacías (umbral realista)
  const paginaEstaVacia = cursorY <= (CFG.MT + 18);

  // ✅ Si no entra en la hoja actual, recién ahí saltamos
  const noEntraEnPaginaActual = (cursorY + espacioMinimoCapitulo) > CFG.MB;

  if (!paginaEstaVacia && noEntraEnPaginaActual) {
    doc.addPage();
    numPagina++;
    // Para capítulos: NO queremos la línea superior ni la onda
    dibujarFondoPagina(doc, { mostrarLineaSuperior: false, mostrarOndaSuperior: false });
    // Arranque visual del capítulo (más cerca del contenido)
    cursorY = CFG.MT + 6;
  } else if (paginaEstaVacia) {
    // Si estamos en una página recién creada, sí podemos redibujar sin riesgo
    dibujarFondoPagina(doc, { mostrarLineaSuperior: false, mostrarOndaSuperior: false });
    cursorY = CFG.MT + 6;
  } else {
    // Si entra en la página actual, no forzamos salto y no redibujamos el fondo
    cursorY += 8;
  }

  // ✅ Diseño consistente: barra vertical + etiqueta (sin cajas, sin líneas largas extra)
  const baseX = CFG.ML;
  const headerY = cursorY;

  // Barra vertical
  doc.setFillColor(...CFG.COLORS.primario);
  doc.rect(baseX, headerY - 2, 3, 16, 'F');

  // Etiqueta
  doc.setFont(CFG.FONT, 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...CFG.COLORS.primario);
  doc.text(etiqueta, baseX + 8, headerY + 10);

  // Subrayado corto sutil (alinea con la etiqueta)  ✅ DESACTIVADO
  const mostrarSubrayadoCapitulo = false;
  if (mostrarSubrayadoCapitulo) {
    doc.setDrawColor(...CFG.COLORS.primario);
    doc.setLineWidth(0.6);
    doc.line(baseX + 8, headerY + 14, baseX + 78, headerY + 14);
  }

  // ✅ Mucho menos separación con el contenido de abajo
  cursorY = headerY + 18;

  // Título del capítulo (si viene después del número)
  if (tituloCap) {
    doc.setFont(CFG.FONT, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...CFG.COLORS.oscuro);

    const lineasTitulo = doc.splitTextToSize(tituloCap, CFG.MR - CFG.ML);
    lineasTitulo.forEach(linea => {
      doc.text(linea, CFG.ML, cursorY);
      cursorY += 6.2;
    });

    cursorY += 2;
  } else {
    cursorY += 2;
  }

  // Mantener tu espaciado, pero sin “abismo” con lo que sigue
  cursorY += Math.max(3, CFG.CHAPTER_SPACING - 10);
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
    
    // ✅ ACTUALIZADO: Formato E-BOOK - Título
    const nombreArchivo = `E-BOOK - ${titulo}.pdf`;
    
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