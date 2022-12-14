const express = require('express');
const multer = require('multer');

const app = express();

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now () + '-- ' + file.originalname);
    }
})


const upload = multer({storage : fileStorageEngine})


app.post('/multiple', upload.array('images', 4), (req,res) => {

    console.log(req.files);
    res.send('file upload successful')
} )
app.listen(3000);