const Pool = require('pg').Pool
require('dotenv').config();
const axios = require('axios');
const pool = new Pool({
  user: process.env.supaUser,
  host: process.env.supaHost,
  database: process.env.supaDatabase,
  password: process.env.supaPassword,
  port: process.env.supaport,
})
const createTable = (req, res) => {
  var url = process.env.VUE_APP_STRAPI_ENDPOINT
    //console.log(url)
  var y = req.query.table;
  axios
  .get(url+'/api/local-tables?populate=*')
  .then((response2) =>  {
    //console.log(response2)
    var a = response2.data.data.map(x =>{return {name: x.attributes.database_name,obj:{ ...x.attributes.local_table_columns.data}}})
    //console.log(a)
    if(y == 'all'){
      console.log('all')
    }else if(a.some(x => y === x.name)){
      var result = a.filter(obj => {
        return obj.name === y
      })
      console.log(y)
      var text = `
   CREATE TABLE IF NOT EXISTS "${y}" (
       "id" SERIAL,`
      Object.entries(result[0].obj).forEach(([key, value]) => {
        //console.log(value.attributes.column_name); // "a 5", "b 7", "c 9"
        text += ` "${value.attributes.column_name}" ${value.attributes.column_text} NOT NULL, `;
      })
      text += `  PRIMARY KEY ("id")
       );`;
       console.log(text)
      pool.query(text, (error, results) => {
      if (error) {
        throw error
      }
      //res.status(200).json(results.rows)
   })
    }else{
      console.log(a.some(m=>m.name===y))
      console.log(y)
      console.log(a)
    }

  })

//   const text = `
//   CREATE TABLE IF NOT EXISTS "cUsers" (
//     "id" SERIAL,
//     "fname" VARCHAR(100) NOT NULL,
//     "uname" VARCHAR(100) NOT NULL,
//     "password" VARCHAR(100) NOT NULL,
//     "email" VARCHAR(100),
//     PRIMARY KEY ("id")
//   );`;
// pool.query(text, (error, results) => {
//   if (error) {
//     throw error
//   }
//res.status(200).json(results.rows)
  res.status(200).json()
// })
  
}
  const getUsers = (request, response) => {
    pool.query('SELECT * FROM cUser ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
  const getUserById = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT * FROM cUser WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
  const createUser = (request, response) => {
    const { fname, uname, email, password } = request.body
  
    pool.query('INSERT INTO cUser (fname, uname, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [fname, uname, email, password], (error, results) => {
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
      'UPDATE cUser SET fname = $1, uname= $2 email = $3, password = $4 WHERE id = $5',
      [fname, uname, email, password, id],
      (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).send(`cUser modified with ID: ${id}`)
      }
    )
  }
  const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('DELETE FROM cUser WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`cUser deleted with ID: ${id}`)
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