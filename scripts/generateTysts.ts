import { readFile, writeFile } from 'fs/promises'

type Mode = 'strict' | 'loose'

const startRE = /^\s*(\/\/|\/\*)\s@tysts-start:\s(strict|loose)/
const endRE = /^\s*(\/\/\s)?@tysts-end:\s(strict|loose)/

const tysts = ['core', 'batch', 'groups', 'transaction'] as const

Promise.all(tysts.map((tyst) => generateTyst(tyst)))

async function generateTyst(tyst: typeof tysts[number]) {
  const content = await readFile(`./src/tysts/${tyst}.ts`, 'utf-8')
  const lines = content.split('\n')

  const generatingMode: Mode[] = ['loose']
  let code = ''
  let mode: undefined | Mode = undefined

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!
    if (mode) {
      // Check if mode ends
      const endMatches = line.match(endRE)
      if (endMatches) {
        const endMode = endMatches[2]
        if (endMode !== mode)
          throw new Error(
            `Mismatched @tysts-end: expected ${mode} but got ${endMode}. Line: ${
              index + 1
            }`
          )
        mode = undefined
        continue
      }

      // Add line if it's the generating mode otherwise ignore
      if (generatingMode.includes(mode)) code += line + '\n'

      continue
    }

    const startMatches = line.match(startRE)
    if (startMatches) {
      mode = startMatches[2] as Mode
      continue
    }

    code += line + '\n'
  }

  return writeFile(`./src/tysts/${generatingMode}/${tyst}.ts`, code)
}
