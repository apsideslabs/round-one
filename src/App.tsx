import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import Home from '@/pages/Home'

const Logic = lazy(() => import('@/pages/Logic'))
const Memory = lazy(() => import('@/pages/Memory'))
const Riddles = lazy(() => import('@/pages/Riddles'))
const Panel = lazy(() => import('@/pages/Panel'))
const Guides = lazy(() => import('@/pages/Guides'))
const GuideDetail = lazy(() => import('@/pages/GuideDetail'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function Loading() {
  return <p className="mono-label p-10 text-center">Dealing the cards…</p>
}

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <Suspense fallback={<Loading />}>
            <AppShell />
          </Suspense>
        }
      >
        <Route index element={<Home />} />
        <Route path="logic" element={<Logic />} />
        <Route path="memory" element={<Memory />} />
        <Route path="riddles" element={<Riddles />} />
        <Route path="panel" element={<Panel />} />
        <Route path="guides" element={<Guides />} />
        <Route path="guides/:slug" element={<GuideDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
