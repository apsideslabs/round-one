import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import Home from '@/pages/Home'

const Logic = lazy(() => import('@/pages/Logic'))
const Verbal = lazy(() => import('@/pages/Verbal'))
const Memory = lazy(() => import('@/pages/Memory'))
const Riddles = lazy(() => import('@/pages/Riddles'))
const Panel = lazy(() => import('@/pages/Panel'))
const Morality = lazy(() => import('@/pages/Morality'))
const Arcade = lazy(() => import('@/pages/Arcade'))
const Mock = lazy(() => import('@/pages/Mock'))
const Lab = lazy(() => import('@/pages/Lab'))
const MenuPage = lazy(() => import('@/pages/Menu'))
const Mastermind = lazy(() => import('@/games/Mastermind'))
const SequenceGame = lazy(() => import('@/games/Sequence'))
const MathsSprint = lazy(() => import('@/games/MathsSprint'))
const Estimate = lazy(() => import('@/games/Estimate'))
const Triage = lazy(() => import('@/games/Triage'))
const Debug = lazy(() => import('@/games/Debug'))
const OddTile = lazy(() => import('@/games/OddTile'))
const Matrix = lazy(() => import('@/games/Matrix'))
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
        <Route path="verbal" element={<Verbal />} />
        <Route path="memory" element={<Memory />} />
        <Route path="riddles" element={<Riddles />} />
        <Route path="panel" element={<Panel />} />
        <Route path="morality" element={<Morality />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="mock" element={<Mock />} />
        <Route path="lab" element={<Lab />} />
        <Route path="arcade" element={<Arcade />} />
        <Route path="arcade/mastermind" element={<Mastermind />} />
        <Route path="arcade/sequence" element={<SequenceGame />} />
        <Route path="arcade/maths" element={<MathsSprint />} />
        <Route path="arcade/estimate" element={<Estimate />} />
        <Route path="arcade/triage" element={<Triage />} />
        <Route path="arcade/debug" element={<Debug />} />
        <Route path="arcade/oddtile" element={<OddTile />} />
        <Route path="arcade/matrix" element={<Matrix />} />
        <Route path="guides" element={<Guides />} />
        <Route path="guides/:slug" element={<GuideDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
