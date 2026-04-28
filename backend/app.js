const express = require('express')
const app = express()
const port = 3000

// Define a route for GET requests to the root URL ('/')
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
