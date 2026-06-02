import { runCompletion } from './inference.js'

const result = await runCompletion({
  purpose: 'qvac-smoke-test',
  selectedChunks: [],
  prompt:
    'In one sentence, explain why local-first AI matters for private documents.',
})

console.log(result.text)
console.log(JSON.stringify(result.log, null, 2))
