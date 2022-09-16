const db = require('./userQueries');
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
var { ImagePool } = require('@squoosh/lib');
var { cpus } = require('os');
const imagePool = new ImagePool(cpus().length);
var cors = require('cors');
const multer  = require('multer')
//const upload = multer({ dest: 'uploads/' })
const multerS3 = require('multer-s3-transform')
const sharp = require('sharp')
const AWS = require('aws-sdk')

const S3 = new AWS.S3({
  accessKeyId: 'AKIARIFXPQ5DZBDSZW3K',
  secretAccessKey: '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'
})


const upload = multer({
storage: multerS3({
  s3: S3,
  bucket: 'wither',
  shouldTransform: true,
  transforms: [
    {
      id: 'original',
      key: (req, file, cb) => cb(null, new Date().getTime() + '_' + file.originalname),
      transform: (req, file, cb) => cb(null, sharp().jpeg())
    },
    {
      id: 'large',
      key: (req, file, cb) => cb(null, new Date().getTime() + '_large_' + file.originalname),
      transform: (req, file, cb) => cb(null, sharp().resize(1200, 900).jpeg())
    },
    {
      id: 'small',
      key: (req, file, cb) => cb(null, new Date().getTime() + '_small_' + file.originalname),
      transform: (req, file, cb) => cb(null, sharp().resize(400, 300).jpeg())
    }
  ]
})
})
//html for websocket backend
//Todo:
//make prety
//set ports to env
//send console logs to update on admin backend  (push to arrays)
app.get('/', (req, res) => {
  res.send('<h1>Hey Micro</h1>');
});
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
//app.use(express.raw({type: '*/*'}));
app.get('/users', db.getUsers)
app.get('/createTable', db.createTable)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.get('/api/images/all', function (req, res) {
  var params = {
    Bucket: "wither", 
    MaxKeys: 30
   };
   signedUrlExpireSeconds = 60 * 5
   S3.listObjectsV2(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     res.send(
     data.Contents.map(function(item) { 
      const url = S3.getSignedUrl('getObject', {
        Bucket: "wither",
        Key: item["Key"],
        Expires: signedUrlExpireSeconds
    })
      return [url,item["Key"]]; 
    })
    );           // successful response
    

    //console.log(url)
     /*
     data = {
      Contents: [
         {
        ETag: "\"70ee1738b6b21e2c8a43f3a5ab0eee71\"", 
        Key: "happyface.jpg", 
        LastModified: <Date Representation>, 
        Size: 11, 
        StorageClass: "STANDARD"
       }, 
         {
        ETag: "\"becf17f89c30367a9a44495d62ed521a-1\"", 
        Key: "test.jpg", 
        LastModified: <Date Representation>, 
        Size: 4192256, 
        StorageClass: "STANDARD"
       }
      ], 
      IsTruncated: true, 
      KeyCount: 2, 
      MaxKeys: 2, 
      Name: "examplebucket", 
      NextContinuationToken: "1w41l63U0xa8q7smH50vCxyTQqdxo69O3EmK28Bi5PcROI4wI/EyIJg==", 
      Prefix: ""
     }
     */
   });

  //res.end();
})
app.get('/api/images/delete/:key', function (req, res) {
  var params = {
    Bucket: "wither", 
    Key: req.params.key
   };
   S3.deleteObject(params, (err, data) => {
    console.error(err);
    console.log(data);
    return data;
    });

  //res.end();
})
app.post('/upload',upload.single('file'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  //console.log(req.file.destination)
  //const image = imagePool.ingestImage(req.file.buffer);
  // const preprocessOptions = {
  //   //When both width and height are specified, the image resized to specified size.
  //   resize: {
  //     width: 100,
  //     height: 50,
  //   },
  //   /*
  //   //When either width or height is specified, the image resized to specified size keeping aspect ratio.
  //   resize: {
  //     width: 100,
  //   }
  //   */
  // };
  // await image.preprocess(preprocessOptions);
  
  // const encodeOptions = {
  //   mozjpeg: {}, //an empty object means 'use default settings'
  //   jxl: {
  //     quality: 90,
  //   },
  // };
  // const result = await image.encode(encodeOptions);
  res.end();
})

app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)
app.post("/login", (req, res) => {
  console.log(req.body)
  db.createUser(req, res);
  const USERNAME = "uma victor";
  const PASSWORD = "8888";
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    const user = {
      id: 1,
      name: "uma victor",
      username: "uma victor",
    };
  } else {
    //res.status(403);
    // res.json({
    //   message: "wrong login information",
    // });
    //res.end();
  }
});
console.log('=================');
console.log('Session Started');
http.listen(process.env.microServicesPort, () => {
  console.log('listening on *:'+process.env.microServicesPort);
});
console.log('=================');
