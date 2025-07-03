// Herramienta de depuración para ver cómo se construye el árbol a partir de preorden e inorden
// y detectar problemas con expresiones complejas.

export function debugConstruirArbol(preorden: string[], inorden: string[]): any {
  const pasos: any[] = [];
  function construir(pre: string[], ino: string[]): any {
    pasos.push({ pre, ino });
    if (!pre.length || !ino.length) return undefined;
    const valor = pre[0];
    const indice = ino.indexOf(valor);
    if (indice === -1) {
      pasos.push({ error: `No se encontró '${valor}' en inorden`, pre, ino });
      return undefined;
    }
    return {
      valor,
      izquierda: construir(pre.slice(1, 1 + indice), ino.slice(0, indice)),
      derecha: construir(pre.slice(1 + indice), ino.slice(indice + 1))
    };
  }
  const arbol = construir(preorden, inorden);
  return { arbol, pasos };
}
