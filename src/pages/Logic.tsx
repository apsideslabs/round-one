import QuizRound from './QuizRound'
import { logic } from '@/data/logic'

export default function Logic() {
  return <QuizRound trackId="logic" items={logic} perQuestion={30} />
}
