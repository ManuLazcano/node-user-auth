import express from 'express'
import jwt from 'jsonwebtoken'

import { PORT, SECRET_JWT_KEY } from './config.js'
import { UserRepository } from './user-repository.js'

const app = express()

app.use(express.json())
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_JWT_KEY,
      {
        expiresIn: '1h'
      }
    )
    res.send({ user, token })
  } catch (error) {
    res.status(401).send(error.message)
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body

  try {
    const id = await UserRepository.create({ username, password })
    res.send({ id })
  } catch (error) {
    res.status(400).send(error.message)
  }
})
app.post('/logout', (req, res) => {})

app.get('/protected', (req, res) => {
  res.render('protected', { username: 'Manudev ' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
