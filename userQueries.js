const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'db.mdmjzfqohzoffypmbugq.supabase.co',
  database: 'postgres',
  password: 'Ch3wbaca01475369',
  port: 5432,
})
const createTable = (request, response) => {
  const text = `
    CREATE TABLE IF NOT EXISTS "users" (
	    "id" SERIAL,
	    "fname" VARCHAR(100) NOT NULL,
      "uname" VARCHAR(100) NOT NULL,
      "password" VARCHAR(100) NOT NULL,
	    "email" VARCHAR(100),
	    PRIMARY KEY ("id")
    );`;
  pool.query(text, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}
  const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
  const getUserById = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
  const createUser = (request, response) => {
    const { fname, uname, email, password } = request.body
  
    pool.query('INSERT INTO users (fname, uname, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [fname, uname, email, password], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(JSON.stringify(`${results.rows[0].id}`))
    })
  }
  const updateUser = (request, response) => {
    const id = parseInt(request.params.id)
    const { fname, uname, email, password } = request.body
  
    pool.query(
      'UPDATE users SET fname = $1, uname= $2 email = $3, password = $4 WHERE id = $5',
      [fname, uname, email, password, id],
      (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).send(`User modified with ID: ${id}`)
      }
    )
  }
  const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User deleted with ID: ${id}`)
    })
  }
  module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    createTable,
  }