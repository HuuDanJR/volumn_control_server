var express = require('express')
var body_parser = require('body-parser')
var morgan = require('morgan');
var app = express();
var cors = require('cors');
var router = express.Router();
var crypto =require('crypto')
app.use(express.json());
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));
const logStream = fs.createWriteStream('log.txt', { flags: 'a' });
app.use(morgan('tiny'));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', { stream: logStream }));
app.use(cors({
    origin: '*'
}));
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
            "driver":req.body.driver,
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












