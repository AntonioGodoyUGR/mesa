# ESTADO.md — Puente entre sesiones

Este fichero es el **contexto compartido** entre quien trabaje en el proyecto: Gustavo
(asistente de Toni en OpenClaw/Telegram) y Claude en el terminal. El código y el historial
de git ya se comparten solos; esto guarda lo que _no_ vive en el código: el porqué, lo que
quedó a medias y lo siguiente que toca.

## Cómo se usa

- **Al empezar una tarea:** léelo entero. Mira también `git status` y `git log --oneline -5`.
- **Al terminar (o al dejarlo a medias):** actualiza «Estado actual» y «Pendiente». Deja
  una línea en la bitácora con la fecha.
- Sé breve y concreto. Esto no es un diario, es un relevo. Si algo ya está commiteado y
  cerrado, no hace falta que siga aquí.
- Reglas duraderas de _cómo_ se trabaja → van al `CLAUDE.md`, no aquí.

---

## Estado actual

- Rama `main`, limpia. Todo en verde: `npm run lint && npm test && npm run build` pasa
  (141 tests, build OK). Comprobado 2026-08-15.
- **Avatares con animales (estilo Gartic Phone)**: además del `humano` de siempre hay 8
  bichos (`gato`, `perro`, `zorro`, `oso`, `panda`, `conejo`, `rana`, `pinguino`), cada uno
  con color y una de 5 expresiones. Compatible hacia atrás: lo guardado sin `k=` sigue
  siendo humano. Modelo en `lib/avatar.ts` (`AvatarKind`, `Expression`, `KINDS`,
  `EXPRESSIONS`), dibujo en `components/Avatar.tsx` (`Humano` + `Animal`/`Eyes`), edición en
  `components/AvatarEditor.tsx` (fila «Personaje»; los rasgos humanos solo salen si es
  humano, la «Expresión» solo si es animal).

## Pendiente / ideas (sin prioridad asignada)

- [ ] Bundle JS en un solo chunk de ~759 kB (216 gzip). Se podría code-splitear con
      `import()` dinámico. No urge.
- [ ] 6 warnings de oxlint tipo `react(only-export-components)` (fast-refresh): constantes
      o funciones exportadas junto a componentes en `AuthContext`, `GamesContext`,
      `GroupContext`, `LibraryContext`, `GameCover`, `ShowMore`. Cosmético.

## Bitácora

- **2026-08-15** — Gustavo: primer contacto con el proyecto. Corrida la comprobación
  completa (verde). Creado este `ESTADO.md` como puente entre sesiones.
- **2026-08-15** — Gustavo: avatares con animales estilo Gartic Phone + expresiones,
  compatible hacia atrás. Todo en verde.
