# Lógica de Sorteo con Seed Verificable

## Problema que resuelve

Un sorteo digital puede ser manipulado si quien lo ejecuta elige el resultado en el momento. La lógica con seed resuelve esto haciendo que el resultado sea **determinista y verificable públicamente**: cualquier persona puede reproducir el cálculo con los datos publicados y confirmar que el ganador es correcto.

---

## Conceptos clave

| Término | Descripción |
|---------|-------------|
| **Seed** | Cadena hexadecimal de 64 caracteres (32 bytes aleatorios). Se genera *antes* de ejecutar y no puede cambiarse después. |
| **Timestamp** | `Date.now()` en milisegundos. Se captura en el momento exacto de ejecutar. No puede predecirse con anticipación. |
| **Hash SHA-256** | Función criptográfica unidireccional. Mismos inputs → mismo output. No puede invertirse. |
| **Posición virtual** | Número en el rango `[1, totalElegibles]` que apunta a un ticket del pool activo. |
| **Ticket real** | El número de boleta física que le corresponde a esa posición virtual. |

---

## Flujo en dos pasos

### Paso 1 — Preparar (genera el seed)

```
seed = crypto.randomBytes(32).hex()   // 64 chars hex, ej: "a3f9c1..."
```

- El seed se genera con el CSPRNG del sistema operativo (criptográficamente seguro).
- Se guarda en memoria con un TTL de 5 minutos.
- Se devuelve al cliente junto con `totalTickets` (elegibles).
- **En este momento el resultado es desconocido** — el seed solo es una mitad de la ecuación. La otra mitad (timestamp) se genera al ejecutar.

---

### Paso 2 — Ejecutar (calcula el ganador)

#### 2a. Calcular posición virtual

```
timestamp    = Date.now()                          // milisegundos actuales
winnerBytes  = SHA-256( seed + "|" + timestamp )   // 32 bytes = 256 bits
winnerBigInt = bytes interpretados como entero big-endian
virtualPos   = (winnerBigInt % totalElegibles) + 1  // rango [1, totalElegibles]
```

El `%` (módulo) convierte el hash de 256 bits en un número dentro del rango exacto del pool. La suma `+1` lo hace 1-indexed.

> **¿Por qué BigInt?** SHA-256 produce un número de 256 bits. Los números JavaScript estándar solo tienen 53 bits de precisión, lo que introduciría sesgo estadístico. `BigInt` opera sin pérdida de precisión.

#### 2b. Mapear posición virtual → ticket real

El pool puede tener **huecos** si se excluyen ganadores anteriores (sus rangos de tickets ya no participan). Por eso no se usa el número de ticket directamente — se usa una posición virtual que se mapea a los rangos vigentes:

```
registros elegibles (ordenados por ticket_start):
  R1: tickets #1–#5    → 5 boletas
  R2: tickets #8–#12   → 5 boletas   (R3 ganó antes, sus #6-#7 excluidos)
  R3: tickets #15–#20  → 6 boletas
                         ─────────
  totalElegibles = 16

virtualPos = 7  →  cae en R2
  offset    = virtualPos - prevCumulative - 1 = 7 - 5 - 1 = 1
  ticketReal = ticket_start + offset = 8 + 1 = #9
```

Algoritmo:

```
cumulative = 0
para cada registro r (ordenado por ticket_start):
    prevCumulative = cumulative
    cumulative += (r.ticket_end - r.ticket_start + 1)
    si virtualPos <= cumulative:
        offset     = virtualPos - prevCumulative - 1
        ticketReal = r.ticket_start + offset
        ganador    = r
        break
```

#### 2c. Hash de verificación pública

```
hash = SHA-256( seed + "|" + ticketReal + "|" + timestamp )
```

Este hash se publica junto con el resultado. Cualquiera puede verificarlo:

```bash
echo -n "a3f9c1...|17|1748477662341" | sha256sum
# debe coincidir con el hash publicado
```

---

## Persistencia

Se guarda en la tabla `sorteos`:

| Campo | Valor |
|-------|-------|
| `seed` | el seed generado en Paso 1 |
| `ejecutado_en` | `new Date(timestamp)` — el **mismo** ms usado en el hash |
| `total_tickets` | total de elegibles **en ese momento** |
| `numero_ganador` | ticket real ganador |
| `hash` | SHA-256 de verificación |
| `registro_id` | FK al participante ganador |
| `activo` | solo el último sorteo es `true` |

---

## Exclusión de ganadores anteriores

Antes de cada sorteo se consultan los `registro_id` de sorteos previos y se excluyen del pool:

```sql
SELECT * FROM registros
WHERE id NOT IN (
  SELECT registro_id FROM sorteos WHERE registro_id IS NOT NULL
)
ORDER BY ticket_start ASC
```

El `totalElegibles` decrece con cada ronda. El historial muestra los tickets en juego de cada sorteo para que sea transparente.

---

## ¿Por qué no se puede manipular?

| Vector | Defensa |
|--------|---------|
| Elegir el ganador después de ver quiénes participaron | El seed se genera y publica *antes*. Cambiar el seed cambia el hash → detectable. |
| Esperar al momento exacto con timestamp favorable | El timestamp tiene precisión de ms. Nadie puede controlar cuándo exactamente se ejecuta la instrucción en el servidor. |
| Generar el seed con el timestamp ya conocido | El seed se genera en Paso 1; el timestamp se genera en Paso 2 (separados). Ninguno controla al otro. |
| Ejecutar múltiples veces hasta obtener el resultado deseado | Cada ejecución consume el seed (se borra del mapa). Hay que llamar a Preparar de nuevo, lo cual genera un seed diferente. |
| Verificar externamente que el cálculo es correcto | Cualquiera puede reproducir `SHA-256(seed\|ganador\|timestamp)` y comparar con el hash publicado. |

---

## Implementación de referencia (Node.js / TypeScript)

```typescript
import crypto from "node:crypto";

// ── Paso 1: Preparar ──────────────────────────────────────────────────────────

const pendingSeeds = new Map<string, { expiresAt: number }>();

function prepararSorteo(totalElegibles: number) {
  const seed = crypto.randomBytes(32).toString("hex");
  pendingSeeds.set(seed, { expiresAt: Date.now() + 5 * 60 * 1000 });
  return { seed, totalElegibles };
}

// ── Paso 2: Ejecutar ──────────────────────────────────────────────────────────

interface Participante {
  id: string;
  ticketStart: number;
  ticketEnd: number;
}

function ejecutarSorteo(seed: string, elegibles: Participante[]) {
  // Validar seed
  const pending = pendingSeeds.get(seed);
  if (!pending || pending.expiresAt < Date.now()) {
    pendingSeeds.delete(seed);
    throw new Error("Seed inválido o expirado");
  }

  const totalElegibles = elegibles.reduce(
    (sum, p) => sum + (p.ticketEnd - p.ticketStart + 1), 0
  );
  if (totalElegibles === 0) throw new Error("Sin participantes elegibles");

  // Calcular posición virtual
  const timestamp = Date.now();
  const buf = crypto
    .createHash("sha256")
    .update(`${seed}|${timestamp}`)
    .digest();
  const bigInt = BigInt("0x" + buf.toString("hex"));
  const virtualPos = Number(bigInt % BigInt(totalElegibles)) + 1;

  // Mapear posición virtual → participante y ticket real
  let ganador: Participante | null = null;
  let ticketReal = 0;
  let cumulative = 0;
  for (const p of elegibles) {
    const prev = cumulative;
    cumulative += p.ticketEnd - p.ticketStart + 1;
    if (virtualPos <= cumulative) {
      ganador = p;
      ticketReal = p.ticketStart + (virtualPos - prev - 1);
      break;
    }
  }

  // Hash de verificación pública
  const hash = crypto
    .createHash("sha256")
    .update(`${seed}|${ticketReal}|${timestamp}`)
    .digest("hex");

  pendingSeeds.delete(seed);

  return { ganador, ticketReal, hash, seed, timestamp };
}

// ── Verificación (puede hacerse offline) ─────────────────────────────────────

function verificar(seed: string, ticketReal: number, timestamp: number, hashEsperado: string) {
  const hash = crypto
    .createHash("sha256")
    .update(`${seed}|${ticketReal}|${timestamp}`)
    .digest("hex");
  return hash === hashEsperado;
}
```

---

## Adaptación a otros sistemas

Lo que varía entre proyectos:

1. **Pool de participantes** — aquí son rangos de tickets contiguos. Puede ser una lista de IDs, nombres, o cualquier conjunto enumerable.
2. **Regla de elegibilidad** — aquí se excluyen ganadores anteriores. Puede ser otro criterio (fecha de registro, categoría, etc.).
3. **TTL del seed** — aquí 5 min. Puede ajustarse según el flujo (más tiempo si hay testigos presenciales que necesitan anotar el seed).
4. **UI del seed** — aquí se oculta al usuario final y se consume automáticamente. Para sorteos con mayor escrutinio público conviene mostrarlo y permitir que un testigo lo anote o fotografíe antes de ejecutar.

Lo que **no cambia**:

```
virtualPos   = (SHA-256(seed + "|" + timestamp) como BigInt) % total + 1
hashPublico  = SHA-256(seed + "|" + resultado + "|" + timestamp)
```