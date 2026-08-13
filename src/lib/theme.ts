export type ThemeChoice = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'mesa.theme'

export function getStoredTheme(): ThemeChoice {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(choice: ThemeChoice): 'light' | 'dark' {
  return choice === 'system' ? (prefersDark() ? 'dark' : 'light') : choice
}

export function setTheme(choice: ThemeChoice) {
  if (choice === 'system') localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, choice)
  document.documentElement.classList.toggle('dark', resolveTheme(choice) === 'dark')
}

/** Se llama antes de montar React para que no haya destello de tema claro. */
export function applyStoredTheme() {
  document.documentElement.classList.toggle(
    'dark',
    resolveTheme(getStoredTheme()) === 'dark',
  )
}
