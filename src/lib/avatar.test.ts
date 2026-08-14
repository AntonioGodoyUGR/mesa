/**
 * El avatar viaja como texto en una columna que ya existía, así que lo que hay que
 * defender es la traducción: que lo compuesto se recupere igual, que nada de lo que
 * venga guardado pueda romper la pantalla y que quien no tenga ninguno reciba siempre
 * el mismo.
 */
import { describe, expect, it } from 'vitest'
import {
  ACCESSORIES,
  BACKGROUNDS,
  HAIR_COLORS,
  HAIR_STYLES,
  HATS,
  SHIRT_COLORS,
  SKIN_TONES,
  hasAvatar,
  lookFromName,
  parseAvatar,
  randomAvatar,
  serializeAvatar,
  type AvatarLook,
} from './avatar'

const look: AvatarLook = {
  background: 3,
  skin: 2,
  shirt: 5,
  hair: 'melena',
  hairColor: 4,
  hat: 'corona',
  accessory: 'gafas',
}

/** Todo rasgo tiene que caer dentro de su paleta o de su lista de opciones. */
function expectValid(candidate: AvatarLook) {
  expect(candidate.background).toBeLessThan(BACKGROUNDS.length)
  expect(candidate.skin).toBeLessThan(SKIN_TONES.length)
  expect(candidate.shirt).toBeLessThan(SHIRT_COLORS.length)
  expect(candidate.hairColor).toBeLessThan(HAIR_COLORS.length)
  expect(HAIR_STYLES.map((style) => style.id)).toContain(candidate.hair)
  expect(HATS.map((hat) => hat.id)).toContain(candidate.hat)
  expect(ACCESSORIES.map((accessory) => accessory.id)).toContain(candidate.accessory)
}

describe('serializeAvatar / parseAvatar', () => {
  it('lo guardado se recupera tal cual', () => {
    expect(parseAvatar(serializeAvatar(look), 'Ana')).toEqual(look)
  })

  it('usa un esquema propio, para no confundirlo con una foto subida', () => {
    expect(serializeAvatar(look).startsWith('mesa:')).toBe(true)
    expect(hasAvatar(serializeAvatar(look))).toBe(true)
    expect(hasAvatar(null)).toBe(false)
    expect(hasAvatar('https://ejemplo.test/foto.png')).toBe(false)
  })

  it('sin nada guardado, cae en el que toca por el nombre', () => {
    expect(parseAvatar(null, 'Ana')).toEqual(lookFromName('Ana'))
    expect(parseAvatar('', 'Ana')).toEqual(lookFromName('Ana'))
    expect(parseAvatar('https://ejemplo.test/foto.png', 'Ana')).toEqual(lookFromName('Ana'))
  })

  it('un avatar a medias o con basura sigue siendo dibujable', () => {
    const broken = parseAvatar('mesa:1?bg=99&sk=-1&hr=peluca&ht=&ac=laser', 'Beto')
    expectValid(broken)
    // Lo que no se entiende se sustituye por el valor del nombre, rasgo a rasgo.
    expect(broken.background).toBe(lookFromName('Beto').background)
    expect(broken.hair).toBe(lookFromName('Beto').hair)
  })

  it('respeta los rasgos que sí entiende aunque otros vengan rotos', () => {
    const partial = parseAvatar('mesa:1?sk=0&ht=corona', 'Cris')
    expect(partial.skin).toBe(0)
    expect(partial.hat).toBe('corona')
    expect(partial.shirt).toBe(lookFromName('Cris').shirt)
  })
})

describe('lookFromName', () => {
  it('el mismo nombre da siempre el mismo muñeco', () => {
    expect(lookFromName('Ana')).toEqual(lookFromName('Ana'))
  })

  it('sale sin sombrero ni complemento: eso se elige', () => {
    expect(lookFromName('Ana').hat).toBe('ninguno')
    expect(lookFromName('Ana').accessory).toBe('ninguno')
  })

  it('nombres distintos no salen calcados', () => {
    const names = ['Ana', 'Beto', 'Cris', 'Tú', 'Dani', 'Elena']
    const looks = names.map((name) => JSON.stringify(lookFromName(name)))
    expect(new Set(looks).size).toBe(names.length)
  })

  it('vale hasta con un nombre vacío', () => {
    expectValid(lookFromName(''))
  })
})

describe('randomAvatar', () => {
  it('siempre compone algo válido, con el azar en los extremos', () => {
    expectValid(randomAvatar(() => 0))
    expectValid(randomAvatar(() => 0.999))
    expectValid(randomAvatar())
  })
})
