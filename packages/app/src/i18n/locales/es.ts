export default {
  "app": {
    "title": "Juego de la Vida de Conway"
  },
  "nav": {
    "home": "Inicio",
    "about": "Acerca de",
    "toggleDarkMode": "Cambiar modo oscuro",
    "viewSource": "Ver código fuente en GitHub"
  },
  "controls": {
    "title": "Controles del Juego",
    "start": "Iniciar",
    "pause": "Pausar",
    "next": "Siguiente",
    "reset": "Reiniciar",
    "copyUrl": "Copiar URL",
    "variables": "Variables del Juego",
    "generationSpeed": "Velocidad de Generación",
    "editMode": "Modo de Edición",
    "editModeOn": "Modo de edición ACTIVADO - Haz clic en las celdas para cambiar",
    "editModeOff": "Modo de edición DESACTIVADO"
  },
  "patterns": {
    "title": "Patrones Iniciales",
    "custom": "Patrón Personalizado",
    "loadCustom": "Cargar Patrón Personalizado",
    "placeholder": "Pegar coordenadas aquí...",
    "showExamples": "Mostrar ejemplos",
    "hideExamples": "Ocultar ejemplos",
    "supportedFormats": "Formatos soportados:"
  },
  "colors": {
    "title": "Paleta de Colores"
  },
  "rules": {
    "title": "Reglas del Juego",
    "description": "Activa o desactiva reglas para personalizar el comportamiento de la simulación"
  },
  "diagnostics": {
    "title": "Diagnósticos",
    "statistics": "Estadísticas",
    "generations": "Generaciones",
    "liveCells": "Células Vivas",
    "totalBirths": "Nacimientos Totales",
    "totalDeaths": "Muertes Totales",
    "cellData": "Datos de Células"
  },
  "about": {
    "title": "Acerca del Juego de la Vida de Conway",
    "whatIsIt": "¿Qué es el Juego de la Vida de Conway?",
    "description1": "El Juego de la Vida de Conway es un autómata celular ideado por el matemático John Horton Conway en 1970. Es un juego de cero jugadores, lo que significa que su evolución está determinada por su estado inicial, sin requerir más entradas.",
    "description2": "El juego consiste en una cuadrícula de células que pueden estar vivas o muertas. Cada célula interactúa con sus ocho vecinos según cuatro reglas simples:",
    "rule1": "Cualquier célula viva con 2-3 vecinos vivos sobrevive",
    "rule2": "Cualquier célula muerta con exactamente 3 vecinos vivos se vuelve viva",
    "rule3": "Todas las demás células vivas mueren en la siguiente generación",
    "rule4": "Todas las demás células muertas permanecen muertas",
    "description3": "A pesar de estas reglas simples, el Juego de la Vida puede producir patrones y comportamientos increíblemente complejos, convirtiéndolo en un ejemplo fascinante de complejidad emergente.",
    "projectTitle": "Acerca de Este Proyecto",
    "projectDescription": "Esta es una implementación en TypeScript del Juego de la Vida de Conway que incluye:",
    "feature1": "Lógica central funcional pura con pruebas unitarias exhaustivas",
    "feature2": "Interfaz interactiva basada en React con componentes Material-UI",
    "feature3": "Estructura de datos basada en diccionario optimizada para cuadrículas dispersas",
    "feature4": "Patrones precargados que incluyen vidas inmóviles, osciladores, naves espaciales y matusalenes",
    "feature5": "Compartir patrones basado en URL",
    "linksTitle": "Enlaces",
    "viewSource": "Ver Código Fuente en GitHub",
    "wikiLink": "Juego de la Vida de Conway en Wikipedia"
  },
  "messages": {
    "urlUpdated": "URL actualizada con el patrón actual",
    "urlCopied": "URL copiada al portapapeles",
    "urlCopyFailed": "Error al copiar URL"
  },
  "dialogs": {
    "confirmReset": "Confirmar Reinicio",
    "resetMessage": "¿Estás seguro de que quieres reiniciar el juego? Esto borrará el estado actual y comenzará de nuevo.",
    "cancel": "Cancelar",
    "yesReset": "Sí, Reiniciar"
  }
};
