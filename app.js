import express, { json } from 'express'
import { randomUUID } from 'node:crypto'
import data from './dictionary.json' with {type: 'json'}

const PORT = process.env.PORT ?? 1000
import { validateWord, validatePatch } from './schemas/word.js'
const ACCEPTED_ORIGINS = ['http://localhost:5500']

const app = express()
app.disable('x-powered-by')

app.use(json()) // middleware to cut req.on('data) -> req.on('end', chunks), etc on POST methods

app.get('/translate', (req, res) => {
  // how to avoid CORS errors
  const origin = req.header('origin')

  if(ACCEPTED_ORIGINS.includes(origin) || !origin){
    res.header('Access-Control-Allow-Origin', origin)
  }

  res.json(data)
})

app.get('/translate/:word', (req, res) => {
  const { word } = req.params
  const finded = Object.keys(data).find(w => w === word)

  if(finded) {
    const result = {[word]: data[finded]}
    return res.json(result)
  }
  else res.status(404).json({message: '404 not found'})
})

app.get('/search', (req, res) => {
  const { query } = req.query
  const result = []

  for(let key in data) {
    if(data[key]?.words.includes(query)){
      result.push({[key]: data[key].meaning})
    }
  }
  res.json({result})
})

app.post('/translate', (req, res) => {
  const result = validateWord(req.body)

  if(result.error){
    return res.status(400).json({error: JSON.parse(result.error.message)})
  }

  const newWord = {
    id: randomUUID(),
    ...result.data
  }

  data.push(newWord)

  res.status(201).json(newWord)
})

app.patch('/translate/:targetWord', (req, res) => {
  const { targetWord } = req.params
  const wordIndex = data.findIndex(word => word.graphy === targetWord)
  const result = validatePatch(req.body)

  if(wordIndex === -1) {
    return res.status(404).json({message: 'Word not found'})
  }

  const updatedWord = {
    ...data[wordIndex],
    ...req.body
  }

  data[wordIndex] = updatedWord

  console.log(result)
  return res.json(updatedWord)
})

app.delete('/translate/target', (req, res) => {
  const origin = req.header('origin')
  const { target } = req.params
  const targetIndex = findIndex(word => word.graphy.toLocaleLowerCase() === target.toLowerCase())

  if(ACCEPTED_ORIGINS.includes(origin) || !origin){
    res.header('Access-Control-Allow-Origin', origin)
  }

  if(targetIndex === -1) return res.status(404).json({message: 'not found'})

  data.splice(targetIndex, 1)
  return res.json({message: 'word deleted'})
})

app.options('/translate', (req, res) => {
  const origin = req.header('origin')

  if(ACCEPTED_ORIGINS.includes(origin) || !origin){
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }
  res.send(200)
})

app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`)
})
