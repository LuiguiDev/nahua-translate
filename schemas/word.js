const z = require('zod')

const wordSchema = z.object({
  translationES: z.string({
    invalid_type_error: 'Translation must be a string',
    required_error: 'Translation is required'
  }),
  graphy: z.string({required_error: 'Graphy is required'})
})

function validateWord(obj) {
  return wordSchema.safeParse(obj)
}

function validatePatch(obj) {
  return wordSchema.partial().safeParse(obj)
}

module.exports = {
  validateWord,
  validatePatch
}