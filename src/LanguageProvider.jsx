import { useEffect, useMemo, useState } from 'react'
import { languageContext, languageOptions, languageStorageKey, readSavedLanguage, translate } from './language.js'

export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(readSavedLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage(nextLanguage) {
      if (!languageOptions.some(option => option.code === nextLanguage)) return
      setLanguage(nextLanguage)
      try {
        localStorage.setItem(languageStorageKey, nextLanguage)
      } catch {
        // Keep the selection active for this page when browser storage is unavailable.
      }
    },
    t(text) {
      return translate(language, text)
    },
  }), [language])

  return <languageContext.Provider value={value}>{children}</languageContext.Provider>
}
