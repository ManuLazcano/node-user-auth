import crypto from 'node:crypto'

import DBLocal from 'db-local'
import bcrypt from 'bcrypt'

import { SALT_ROUNDS } from './config.js'

const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserRepository {
  static async create ({ username, password }) {
    Validate.username(username)
    Validate.password(password)
    Validate.account({ username, mustExist: false })

    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    User.create({
      _id: id,
      username,
      password: hashedPassword
    }).save()

    return id
  }

  static async login ({ username, password }) {
    Validate.username(username)
    Validate.password(password)
    Validate.account({ username, mustExist: true })

    const user = User.findOne({ username })
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) throw new Error('Passowrd is invalid')

    /** Omitir propiedades como el password
     * Opción 1: const { password: _, ...publicUser } = user
     * Opción 2: crear un objeto desde cero, esta es la opción que se esta implementando
     *
     * Ventajas:
     *  - Opción 1: Es explícito con los campos que no se deben exponer.
     *  - Opción 2: Es explícito con los campos que se deben exponer. Se asegura que si en el futuro se agrega un
     *              nuevo campo en la BD, este no se pase por alto y se exponga, como si sucedería en la opción 1.
     */

    return {
      id: user._id,
      username: user.username
    }
  }
}

class Validate {
  static username (username) {
    if (typeof username !== 'string') throw new Error('Username must be a string')
    if (username.length < 3) throw new Error('Username must be at least 3 characteres long')
  }

  static password (password) {
    if (typeof password !== 'string') throw new Error('Password must be a string')
    if (password.length < 6) throw new Error('Password must be at least 6 characteres long')
  }

  static account ({ username, mustExist }) {
    const hasAccount = User.findOne({ username })

    if (mustExist && !hasAccount) throw new Error('Username does not exist')
    if (!mustExist && hasAccount) throw new Error('Username already exists')
  }
}
