/** Fallback copy for transport/media edge cases — not used by conversation strategies. */

export function guideReply(reason: "empty" | "short" | "image"): string {
  switch (reason) {
    case "empty":
      return "Recibí tu mensaje, pero no vi texto. Envíame la afirmación que quieres verificar.";
    case "short":
      return "Envíame la afirmación completa. Ejemplo: «¿El presidente puede cerrar el Congreso?»";
    case "image":
      return "No vi una afirmación política clara en esa imagen. Prueba con otra captura o pega el texto.";
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
