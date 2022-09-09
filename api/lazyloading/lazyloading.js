
const sharp = require('sharp');
const fs = require('fs');
const path = require('path')
// const data = fs.readFileSync('1.jpg')



// console.log(data);



  const express = require('express');
  const app = express();
  const port = 3000;
  app.post('/', (req, res) => {
      sharp('./2.jpg')
      .resize(200,200)
      .toFile('rs_img2.jpg')
      .then( data => { 
        console.log("succ",data)
      })
      .catch( err => { 

      console.log(err)

      });
      res.send('Hello World, from express');
  });
  app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))


