const mongoose = require('mongoose')
const { MongoClient, GridFSBucket } = require("mongodb");
const username = "LeHuuDan99";
const password = "3lyIxDXEzwCtzw2i";
const imageBucket = 'photos';
const database = "PromotionVegas";
// const DB_NAME = 'PromotionVegas';
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const host_imge = 'http://192.168.100.57:8088/files/'
const URL = `mongodb+srv://${username}:${password}@clustervegas.ym3zd.mongodb.net/${database}?retryWrites=true&w=majority`;
let bucket;

async function initBucket() {
  let client = new MongoClient(uri, { useNewUrlParser: true });
  let db = client.db('test');
  bucket = new GridFSBucket(db);
}

// Initialize connection to MongoDB
getDb()
initBucket()
const storage = GridFsStorage({
  url: URL,
  file: (req, file) => {
    return {
      bucketName: imageBucket, // Replace 'photos' with the name of your GridFS collection
      filename: file.originalname,
    };
  },
});





let gfs;
const connection = mongoose.createConnection(URL);
connection.once('open', () => {
  // Initialize GridFS stream
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection(imageBucket); // Replace 'photos' with the name of your GridFS collection
});


// Create a multer upload object using the storage engine
const upload = multer({ storage });
const downloadFile = (filename, res) => {
  // Find the file in GridFS by filename
  gfs.files.findOne({ filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        message: 'File not found',
      });
    }

    // Create a read stream to stream the file data
    const readstream = gfs.createReadStream({ filename });

    // Set the content type header so the browser knows how to handle the response
    res.set('Content-Type', file.contentType);

    // Stream the file data to the response
    readstream.pipe(res);
  });
};
// This will allow you to reuse the download functionality in other parts of your application by simply calling the downloadFile function with the appropriate filename and response object.





const connectDB = async () => {
  try {
    const connect = await mongoose.connect(
      URL,
      { useNewUrlParser: true, useUnifiedTopology: true, useUnifiedTopology: true }
    )
    console.log(`Connected to mongoDB promotion `);
    return connect;
  } catch (error) {
    console.log('cannot connect mongoDB promotion')
    process.exit(1)
  }
}


async function getDb() {
  console.log('getDb():Open database');
  const client = await MongoClient.connect(URL, { useUnifiedTopology: true });
  const db = client.db(database);
  bucket = new GridFSBucket(db, {
    bucketName: imageBucket,
  });
  return db;
}


async function getCollectionPhoto() {
  const client = await MongoClient.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = client.db(database);
  const collection = db.collection(imageBucket);
  // console.log('successfull connect photo collection')
  return collection;
}




// Save file to GridFS
async function saveFileToGridFS(file, options) {
  const writeStream = bucket.openUploadStream(file.originalname, options);
  file.stream.pipe(writeStream);
  return new Promise((resolve, reject) => {
    writeStream.on('finish', (result) => {
      resolve(result);
    });
    writeStream.on('error', (error) => {
      reject(error);
    });
  });
}
// Retrieve file from GridFS by filename
async function getFileByName(filename) {
  if (!bucket) {
    throw new Error('Bucket is not initialized');
  }
  try {
   const [file] = await bucket.find({ filename }).toArray();
    if (!file) {
      return undefined;
    }

    const metadata = await bucket.findOne({ _id: file.metadata });
    file.metadata = metadata;
    file.contentType = metadata.contentType; // Add this line to set the contentType property

    return file;
  } catch (err) {
    console.error(`Error while getting file ${filename}: ${err}`);
    return undefined;
  }
}
// Download file from GridFS by file ID
function downloadFileById(id) {
  return bucket.openDownloadStream(id);
}

async function getFile(req, res) {
const filename = req.params.filename;
  try {
    // Find the file in GridFS by filename
    const file = await getFileByName(filename);

    if (!file) {
      return res.status(404).send('File not found');
    }

    // Set the response headers
    res.set('Content-Type', file.metadata.contentType);
    res.set('Content-Length', file.length);
    // Stream the file data to the response
    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
}


module.exports = {
  connectDB: connectDB,
  getDb:getDb,  
  getCollectionPhoto:getCollectionPhoto,
  saveFileToGridFS:saveFileToGridFS,
  getFileByName:getFileByName,
  downloadFileById:downloadFileById,
  URL: URL,
  downloadFile:downloadFile,
  getFile:getFile,
  database: database,
  bucket:bucket,
  storage,storage,
  imgBucket: imageBucket,
  // bucketGlobal:bucketGlobal,
  baseUrl: host_imge,
}