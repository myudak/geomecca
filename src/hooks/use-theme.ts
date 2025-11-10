import { onMounted, ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'theme-preference'

export const useTheme = () => {
  const theme = ref<Theme>((localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'system')

  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const applyTheme = (selectedTheme: Theme) => {
    const effectiveTheme = selectedTheme === 'system' ? getSystemTheme() : selectedTheme

    // Update HTML attributes for DaisyUI
    document.documentElement.setAttribute('data-theme', effectiveTheme === 'dark' ? 'business' : 'light')

    // Update class for Tailwind dark mode
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Watch for system theme changes
  onMounted(() => {
    applyTheme(theme.value)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  })

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    theme,
    setTheme,
    toggleTheme,
    getSystemTheme
  }
}
