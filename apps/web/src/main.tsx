import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import { Layout } from './components/Layout'
import { PaginaSenadores } from './pages/Senadores'
import { PaginaPerfil } from './pages/Perfil'
import { PaginaSobre } from './pages/Sobre'
import { PaginaNaoEncontrada } from './pages/NaoEncontrada'

// Acha a <div id="root"> do index.html e entrega ela ao React
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota "mãe" sem caminho: todas as filhas aparecem dentro do Layout */}
        <Route element={<Layout />}>
          <Route index element={<PaginaSenadores />} />
          <Route path="senador/:codigo" element={<PaginaPerfil />} />
          <Route path="sobre" element={<PaginaSobre />} />
          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
