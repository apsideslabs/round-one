import QuizRound from './QuizRound'
import { verbal } from '@/data/verbal'

export default function Verbal() {
  return <QuizRound trackId="verbal" items={verbal} perQuestion={45} />
}
