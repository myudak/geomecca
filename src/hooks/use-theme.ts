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

  const toggleThemeWithAnimation = async (event: MouseEvent, duration = 400) => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      toggleTheme()
      return
    }

    const newTheme = theme.value === 'dark' ? 'light' : 'dark'

    // Start view transition
    const transition = document.startViewTransition(() => {
      theme.value = newTheme
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      applyTheme(newTheme)
    })

    await transition.ready

    // Get click position
    const x = event.clientX
    const y = event.clientY

    // Calculate maximum radius for circular reveal
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // Animate the transition with circular clip-path
    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`]
      },
      {
        duration,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)'
      }
    )
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
    toggleThemeWithAnimation,
    getSystemTheme
  }
}
