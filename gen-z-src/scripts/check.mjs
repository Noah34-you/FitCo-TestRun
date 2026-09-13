import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sourceRoot = resolve(import.meta.dirname, '..')
const outputRoot = resolve(sourceRoot, '..', 'gen-z')
const imageNames = ['cargo', 'carpenter', 'denim', 'hero', 'trouser']

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const quizSource = readFileSync(resolve(sourceRoot, 'src/sections/FitQuiz.tsx'), 'utf8')
const questionBlock = quizSource.split('const QUESTIONS: Question[] = [')[1]?.split('const RESULTS = [')[0] ?? ''
assert((questionBlock.match(/title:/g) ?? []).length === 6, 'Expected exactly six quiz questions')

const sourceText = [
  'src/sections/Hero.tsx',
  'src/sections/Problem.tsx',
  'src/sections/HowItWorks.tsx',
  'src/sections/Lineup.tsx',
  'src/sections/FitQuiz.tsx',
  'src/sections/Ticker.tsx',
].map((path) => readFileSync(resolve(sourceRoot, path), 'utf8')).join('\n')

assert(!/['"]\/img\//.test(sourceText), 'Found an image URL that escapes the /gen-z route')
assert(!/one perfect cut|free returns, always|\$(?:84|88|90|95)/i.test(sourceText), 'Found an unverified launch claim')

const outputIndex = readFileSync(resolve(outputRoot, 'index.html'), 'utf8')
assert(outputIndex.includes('/gen-z/assets/'), 'Built index is not scoped to /gen-z')

const outputJs = readFileSync(resolve(outputRoot, 'assets', outputIndex.match(/index-[^"']+\.js/)?.[0] ?? ''), 'utf8')
for (const name of imageNames) {
  const sourceImage = resolve(sourceRoot, `public/img/${name}.webp`)
  const outputImage = resolve(outputRoot, `img/${name}.webp`)
  assert(existsSync(sourceImage), `Missing source image: ${name}`)
  assert(existsSync(outputImage), `Missing built image: ${name}`)
  assert(outputJs.includes(`/gen-z/img/${name}.webp`), `Bundle does not reference ${name}`)
  assert(readFileSync(sourceImage).equals(readFileSync(outputImage)), `Built image differs: ${name}`)
}

console.log('PASS: Gen Z route, six-question flow, scoped assets, and claim guardrails verified.')
