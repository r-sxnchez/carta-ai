export function greetingReply(): string {
  return [
    "Hola. Soy Carta.",
    "",
    "Puedes enviarme:",
    "• propuestas políticas",
    "• cadenas virales",
    "• afirmaciones públicas",
    "• mensajes de WhatsApp",
    "",
    "y analizaré qué tan plausibles son constitucionalmente.",
  ].join("\n");
}

export function metaReply(): string {
  return [
    "Soy Carta, una herramienta de verificación constitucional.",
    "",
    "Tomo afirmaciones políticas y las contrasto con la Constitución de 1991, citando artículos y competencias institucionales.",
    "",
    "Envíame la afirmación que quieres verificar — texto o captura — y te respondo con un análisis breve y un enlace al detalle.",
  ].join("\n");
}

export function guideReply(reason: "empty" | "short" | "image"): string {
  switch (reason) {
    case "empty":
      return "Recibí tu mensaje, pero no vi texto. Envíame la afirmación que quieres verificar.";
    case "short":
      return "Si quieres verificar algo, envíame la afirmación completa. Por ejemplo: «¿El presidente puede cerrar el Congreso?»";
    case "image":
      return "No identifiqué una afirmación política verificable en esa imagen. Envíame el texto o una captura más clara.";
  }
}

export function unsupportedMediaReply(kind: "audio" | "other"): string {
  if (kind === "audio") {
    return "Por ahora proceso texto e imágenes. Envíame la afirmación por escrito o en captura.";
  }
  return "Por ahora proceso texto e imágenes. Envíame la afirmación que quieres verificar.";
}

export function analysisErrorReply(): string {
  return "No pude completar el análisis en este momento. Intenta de nuevo en unos segundos.";
}
