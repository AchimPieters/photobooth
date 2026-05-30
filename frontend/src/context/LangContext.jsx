import { createContext, useContext } from 'react'

export const LangContext = createContext('nl')
export const useLang = () => useContext(LangContext)
