var express = require('express')
var morgan = require('morgan');
var app = express();
var path = require('path')
const mongoose = require('mongoose');
var cors = require('cors');
var router = express.Router();
var crypto = require('crypto')
app.use(express.json());
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));
const logStream = fs.createWriteStream('log.txt', { flags: 'a' });
app.use(morgan('tiny'));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', { stream: logStream }));
app.use(cors({
    origin: '*'
}));
const Excel = require('exceljs');

app.use('/', router);

var port = process.env.PORT || 8080;
app.listen(port);
console.log('app running at port vegas feedback car: ' + port);

//connect mongoDB
var config = require('./config')
config.connectDB()








app.get('/', function (req, res) {
    res.end('index page - vegas promotion');
})

app.use(express.static('web/web'));
app.use(express.static('web/web/assets'));

const driverModel = require('./model/driver');






// Define a route for downloading Excel files
app.get('/download_excel/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const excelFolderPath = 'public/excel'; // Replace with your folder path
  
    // Create the full path to the Excel file
    const excelFilePath = path.join(excelFolderPath, fileName);
  
    // Check if the file exists
    if (fs.existsSync(excelFilePath)) {
      // Set the response headers to specify the file type and attachment
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  
      // Create a read stream to send the file content to the response
      const fileStream = fs.createReadStream(excelFilePath);
  
      // Log when the download starts
      console.log(`Downloading file: ${fileName}`);
  
      // Pipe the file stream to the response
      fileStream.pipe(res);
  
      // Log when the download is complete
      fileStream.on('end', () => {
        console.log(`Downloaded file: ${fileName}`);
      });
    } else {
      // If the file does not exist, send a 404 response
      console.log(`File not found: ${fileName}`);
      res.status(404).send('File not found');
    }
  });
  



// // Endpoint for downloading the Excel file
// app.get('/download_feedback/:filePath', async (req, res) => {
//     const excelFolderPath = 'public/excel'; // Replace with the folder path where the Excel files are saved
//     const filePath = path.join(excelFolderPath, req.params.filePath); // Get the file path from the URL parameter
//     console.log(filePath)
//     // Check if the file exists
//     if (!fs.existsSync(filePath)) {
//         res.send({ "status": false, "message": "File not found" });
//     } else {
//         // Set the appropriate headers for file download
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filePath)}`);

//         // Read the file and stream it to the response
//         const fileStream = fs.createReadStream(filePath);
//         fileStream.pipe(res);

//         // Delete the file after it has been sent
//         fileStream.on('end', () => {
//             fs.unlinkSync(filePath);
//             console.log(`Excel file was deleted: ${filePath}`);
//         });
//     }
// });

//export excel feedback
app.get('/export_feedback', async (req, res) => {
  // Retrieve data from promotionHistoryModel.find() function
  feedbackModel.find(function (err, data) {
      if (err) {
          console.log(err);
          res.send({ "status": false, "message": "Failed to retrieve feedback  data", "totalResult": null, "data": null });
      } else {
          if (data == null || data.length === 0) {
              res.send({ "status": false, "message": "No feedback  found", "totalResult": 0, "data": null });
          } else {
              const workbook = new Excel.Workbook();
              const sheet = workbook.addWorksheet('Sheet1');
              sheet.addRow(["STT", "ID", "DRIVER", "STAR", "CONTENT", "EXPERIENCE", "STATUS","DATETIME"]); // Add header row
              data.forEach((item, index) => {
                  const row = sheet.addRow([index + 1, item.id, item.driver, item.star, item.content, item.experience, item.status,item.createdAt]); // Add data rows
                  if (item.isCorrect === true) {
                      row.getCell('F').fill = {
                          type: 'pattern',
                          pattern: 'solid',
                          fgColor: { argb: 'C6EFCE' } // Set background color to light green
                      };

                  }
                  sheet.addRow([index + 1, item.id, item.driver, item.star, item.content, item.experience, item.status,item.createdAt]); // Add data rows
              });
              const headerRow = sheet.getRow(1);
              const greenAccentColor = { argb: '6EB4F7' };
              ['A', 'B', 'C', 'D', 'E', 'F', 'G','H'].forEach((col) => {
                  headerRow.getCell(col).fill = {
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: greenAccentColor // Set background color to green-accent
                  };
              });
              sheet.getRow(1).height = 25; // Set row height of row 1 to 40
              sheet.getColumn(1).width = 5; // Set column width of column A to 15
              sheet.getColumn(2).width = 15; // Set column width of column B to 10
              sheet.getColumn(3).width = 15; // Set column width of column B to 10
              sheet.getColumn(4).width = 15; // Set column width of column B to 10
              sheet.getColumn(5).width = 35; // Set column width of column B to 10
              sheet.getColumn(6).width = 25; // Set column width of column B to 10
              sheet.getColumn(7).width = 15; // Set column width of column B to 10
              sheet.getColumn(7).width = 25; // Set column width of column B to 10
              sheet.eachRow((row) => {
                  row.eachCell((cell) => {
                      cell.alignment = { vertical: 'middle', horizontal: 'left' }; // Align text to left and vertically centered
                  });
              });

              const formattedTimestamp = getFormattedTimestamp();
              const randomString = generateRandomString(3); // Generate a random string with length 5
              const excelFileName = `feedback_history_${formattedTimestamp}_${randomString}.xlsx`; // Generate a unique file name
              const excelFolderPath = 'public/excel'; // Replace with your desired folder path for saving the Excel file
              if (!fs.existsSync(excelFolderPath)) {
                  fs.mkdirSync(excelFolderPath, { recursive: true });
              }
              const excelFilePath = path.join(excelFolderPath, excelFileName); // Use an absolute path for the file path
              workbook.xlsx.writeFile(excelFilePath)
                  .then(() => {
                      console.log(`Excel file was saved at: ${excelFilePath}`); // Log the file location
                      res.send({ "status": true, "message": "Feedback Excel file generated and saved on server", "filePath": excelFileName });
                  })
                  .catch((err) => {
                      console.error(err);
                      res.send({ "status": false, "message": "Failed to generate feedback excel file", "filePath": null });
                  });
          }
      }
  });
});







//create driver
app.post('/create_driver', async (req, res) => {
    //VARIABLE
    try {
        let driver = new driverModel({
            "id": req.body.id,
            "name": req.body.name,
            "code": req.body.code,
            "image": req.body.image,
            "createdAt": req.body.createdAt,
        });
        driverModel.findOne({ id: driver.id }, async function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                if (data != null) {
                    res.send({ "status": false, "message": "fail create driver", "data": null });
                } else {
                    driver.save(function (err, data) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(err)
                        }
                    });
                    res.send({ "status": true, "message": 'created driver successfully', "data": driver });
                }
            }
        });
    } catch (error) {
        res.status(500).send({ message: `error ${message} ${error}` });
    }
});

//get all driver
app.get('/list_driver', async (req, res) => {
    driverModel.find(function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            if (data == null || data.length == 0) {
                res.send({ "status": false, "message": "find list driver fail", "totalResult": null, "data": data, })
            } else {
                res.send({ "status": true, "message": "find list driver success", "totalResult": data.length, "data": data });
            }
        }
    });
})



const feedbackModel = require('./model/feedback')
// //create feedback
app.post('/create_feedback', async (req, res) => {
    const id_string = generateId(4);
    try {
        let feedback = new feedbackModel({
            "id": id_string,
            "driver": req.body.driver,
            "star": req.body.star,
            "content": req.body.content,
            "experience": req.body.experience,
            "status": req.body.status,
            "createdAt": req.body.createdAt,
        });
        feedbackModel.findOne({ id: feedback.id }, async function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                if (data != null) {
                    res.send({ "status": false, "message": "fail create feedback", "data": null });
                } else {
                    feedback.save(function (err, data) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(err)
                        }
                    });
                    res.send({ "status": true, "message": 'created feedback successfully', "data": feedback });
                }
            }
        });
    } catch (error) {
        res.status(500).send({ message: `error ${message} ${error}` });
    }
});


const tripModel = require('./model/trip')


app.post('/find_feedback_trip_id', async (req, res) => {
    try {
        const feedbackID = req.body.feedback_id; // Assuming you have a field to specify the feedback ID in the request body
        // Find the feedback document by its ID
        tripModel.findOne({ feedback_id: feedbackID }, async function (err, tripdata) {
            if (err) {
                console.log(err);
                res.status(500).send({ message: `Error finding feedback: ${err}` });
            } else {
                // if (!tripdata) {
                //     res.send({ "status": false, "message": "No feedback found with the specified ID", "data": null });
                //     return;
                // }
                console.log('tripid:',tripdata)
                res.status(200).send({  "status": true, "message": " feedback found with the specified ID", "data": tripdata });
                
            }
        });
    } catch (error) {
        res.status(500).send({ message: `Error: ${error}` });
    }
});



  
  
  
  
  




app.put('/update_feedback', async (req, res) => {
    try {
      const feedbackID = req.body.id; // Assuming you have a field to specify the feedback ID in the request body
  
      // Create a new tripData object with the updated values
      const updatedTripData = tripModel({
        "driver": req.body.driver,
        "customer_name": req.body.customer_name,
        "customer_number": req.body.customer_number,
        "from": req.body.from,
        "to": req.body.to,
        "feedback_id":feedbackID,
        "createdAt": req.body.createdAt,
      });
  
      // Find the feedback document by its ID
      feedbackModel.findOne({ id: feedbackID }, async function (err, feedback) {
        if (err) {
          console.log(err);
          res.status(500).send({ message: `Error finding feedback: ${err}` });
        } else {
          if (!feedback) {
            res.send({ "status": false, "message": "No feedback found with the specified ID", "data": null });
            return;
          }
  
          // Update the feedback's trip information
          feedback.trip = updatedTripData;
  
          // Create a new tripModel instance with the updatedTripData
          const updatedTripModel = new tripModel(updatedTripData);
  
          // Save the updated tripModel
          updatedTripModel.save(async (err, savedTripModel) => {
            if (err) {
              console.log(err);
              res.status(500).send({ message: `Error updating trip: ${err}` });
            } else {
              // Save the updated feedback
              feedback.save((err, updatedFeedback) => {
                if (err) {
                  console.log(err);
                  res.status(500).send({ message: `Error updating feedback: ${err}` });
                } else {
                  res.send({ "status": true, "message": 'Updated trip information successfully', "data": updatedFeedback });
                }
              });
            }
          });
        }
      });
    } catch (error) {
      res.status(500).send({ message: `Error: ${error}` });
    }
  });
  
  
  
  
  



app.put('/update_feedback_old', async (req, res) => {
    try {
      const feedbackID = req.body.id; // Assuming you have a field to specify the feedback ID in the request body
  
      // Create a new tripData object with the updated values
      const updatedTripData = tripModel(
        {
            "driver": req.body.driver,
            "customer_name": req.body.customer_name,
            "customer_number": req.body.customer_number,
            "from": req.body.from,
            "to": req.body.to,
            "createdAt": req.body.createdAt,
          }
      );
  
      // Find the feedback document by its ID
      feedbackModel.findOne({ id: feedbackID }, async function (err, feedback) {
        if (err) {
          console.log(err);
          res.status(500).send({ message: `Error finding feedback: ${err}` });
        } else {
          if (!feedback) {
            res.send({ "status": false, "message": "No feedback found with the specified ID", "data": null });
            return;
          }
  
          // Update the feedback's trip information
          feedback.trip = updatedTripData;
  
          // Save the updated feedback
          feedback.save(async (err, updatedFeedback) => {
            if (err) {
              console.log(err);
              res.status(500).send({ message: `Error updating feedback: ${err}` });
            } else {
              // Update the tripModel data separately
              tripModel.findByIdAndUpdate(
                feedback.trip._id,
                updatedTripData,
                { new: true }, // This option returns the updated document
                async (err, updatedTrip) => {
                  if (err) {
                    console.log(err);
                    res.status(500).send({ message: `Error updating trip data: ${err}` });
                  } else {
                    // Send a response with the updated feedback
                    res.send({ "status": true, "message": 'Updated trip information successfully', "data": updatedFeedback });
                  }
                }
              );
            }
          });
        }
      });
    } catch (error) {
      res.status(500).send({ message: `Error: ${error}` });
    }
  });

//get allfeedback
app.get('/list_feedback', async (req, res) => {
    feedbackModel.find(function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            if (data == null || data.length == 0) {
                res.send({ "status": false, "message": "find list feedback fail", "totalResult": null, "data": data, })
            } else {
                res.send({ "status": true, "message": "find list feedback success", "totalResult": data.length, "data": data });
            }
        }
    });
})








function generateId(length) {
    const id = crypto.randomBytes(length).toString('hex');
    return typeof id === 'string' ? id : '';
}





















app.post('/get_trip_by_id', async (req, res) => {
    try {
      const objectIdString = req.body.objectId; // Get the ObjectId string from the request body
  
      // Use mongoose.Types.ObjectId to convert the string into an ObjectId
      const objectId = mongoose.Types.ObjectId(objectIdString);
  
      // Find the tripData by its ObjectId
      tripModel.findById(objectId, (err, tripData) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: `Error finding tripData: ${err}` });
        } else {
          if (!tripData) {
            res.status(404).json({ message: 'No tripData found with the specified ObjectId' });
          } else {
            res.status(200).json({ message: 'Found tripData', data: tripData });
          }
        }
      });
    } catch (error) {
      res.status(500).json({ message: `Error: ${error}` });
    }
  });






  function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


  function getFormattedTimestamp() {
    const timestamp = new Date().getTime(); // Get current timestamp
    // Format the timestamp
    const dateObj = new Date(timestamp);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(4, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    // Create formatted timestamp string
    const formattedTimestamp = `${day}-${month}-${year}_${hours}-${minutes}`;
    return formattedTimestamp;
}


