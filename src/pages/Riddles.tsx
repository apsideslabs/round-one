import QuizRound from './QuizRound'
import { riddles } from '@/data/riddles'

export default function Riddles() {
  return <QuizRound trackId="riddles" items={riddles} perQuestion={45} />
}
