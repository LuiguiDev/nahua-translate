import { object, string } from 'zod'

const wordSchema = object({
  translationES: string({
    invalid_type_error: 'Translation must be a string',
    required_error: 'Translation is required'
  }),
  graphy: string({required_error: 'Graphy is required'})
})

export function validateWord(obj) {
  return wordSchema.safeParse(obj)
}

export function validatePatch(obj) {
  return wordSchema.partial().safeParse(obj)
}
