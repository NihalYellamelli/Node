const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

app.get('/movies/', async (request, response) => {
  const getMovies = `SELECT * FROM movie ORDER BY movie_id`
  const moviesArr = await db.all(getMovies)
  response.send(moviesArr)
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const createMovie = `INSERT INTO
     movie(director_id, movie_name, lead_actor)
     VALUES (
       ${directorId},
      '${movieName}',
      '${leadActor}'
     );`
  const dbResponse = await db.run(createMovie)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovie = `SELECT * FROM movie WHERE movie_id = ${movieId};`
  const movieArr = await db.get(getMovie)
  response.send(movieArr)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovie = `UPDATE
      movie
     SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
     WHERE
      movie_id = ${movieId};`
  await db.run(updateMovie)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director ORDER BY director_id;`
  const directorArr = await db.all(getDirectorQuery)
  response.send(directorArr)
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovies = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`
  const dbResponse = await db.all(getMovies)
  response.send(dbResponse)
})

module.exports = app
