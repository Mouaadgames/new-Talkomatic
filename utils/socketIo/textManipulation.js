function applyInstructionsToTheText(instruction, originalText) {
  let text = originalText
  let deletedLetters = 0
  instruction.forEach(c => {
    if (c[1] === "a") {
      text = text.slice(0, c[0] - deletedLetters) + c[2] + text.slice(c[0] - deletedLetters)
    }
    if (c[1] === "d") {
      
      text = text.slice(0, c[0] - deletedLetters) + text.slice(c[0] + c[2] - deletedLetters)
      deletedLetters += c[2]
    }
  })
  return text
}
module.exports = applyInstructionsToTheText