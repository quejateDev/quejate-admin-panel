/**
 * Paleta de las gráficas de PQRSD.
 *
 * Vivía en `lib/config.ts` junto a `JWT_SECRET` y las credenciales de AWS. Las
 * tres gráficas que la usan son `"use client"`, así que **ese módulo entero
 * entraba en el paquete que descarga el navegador** — con las credenciales
 * dentro, aunque nadie las importara: un módulo se empaqueta completo (H-03).
 *
 * Hoy lo que llegaba al navegador era inofensivo, porque las variables de AWS
 * no llevan el prefijo `NEXT_PUBLIC_` y Next no las incrusta. Pero
 * `lib/config.ts` leía **también** `process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID`
 * como respaldo, y esas sí se incrustan: bastaba con que alguien definiera esa
 * variable —depurando una subida, por ejemplo— para que la clave viajara a
 * todos los navegadores. Una trampa a una variable de entorno de distancia.
 *
 * Este fichero existe para que la paleta —que sí es pública— no vuelva a
 * arrastrar secretos consigo. **No añadas aquí nada que no sea de pintar.**
 */
export const CHART_COLORS = [
  "#2563eb", // Azul brillante
  "#16a34a", // Verde esmeralda
  "#dc2626", // Rojo vibrante
  "#9333ea", // Púrpura real
  "#ea580c", // Naranja intenso
  "#0d9488", // Verde azulado
  "#0891b2", // Cyan vibrante
  "#f59e0b", // Ámbar
  "#6366f1", // Indigo
  "#ec4899", // Rosa intenso
  "#84cc16", // Lima brillante
  "#14b8a6", // Turquesa
];
