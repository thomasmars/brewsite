const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const Sequelize = require('sequelize');
require('dotenv').config();

const SECRET = process.env.SECRET;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const APP_PORT = process.env.APP_PORT;

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.json());

let Temperature = null;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 50000,
    idle: 10000
  },
});

function initDB() {
  sequelize
    .authenticate()
    .then(() => {
      console.log("Successfully connected to DB");
      Temperature = sequelize.define('temperature', {
        time: Sequelize.DATE,
        temperature: Sequelize.FLOAT
      });
    })
    .catch((e) => {
      console.log("Failed connection to DB with error:", e);
      setTimeout(function () {
        initDB();
      }, 10000)
    });
}

initDB();

app.get('/', async (req, res) => {
  const allData = await Temperature.findAll({
    order: [
      ['time', 'ASC']
    ]
  })
    .catch(() => {
      return [];
    });
  const lastFiveDaysData = await Temperature.findAll({
    where: {
      time: {
        [Sequelize.Op.gt]: new Date(new Date() - 24*60*60*1000*5)
      }
    },
    order: [
      ['time', 'ASC']
    ]
  }).catch(() => {
    return [];
  });

  res.render('index', {
    temperatureData: allData,
    lastFiveDays: lastFiveDaysData
  });
});

app.post('/temperature', function (req, res) {
  if (req.body && req.body.secret && req.body.data) {

    const isValidPassPhrase = req.body.secret === SECRET;
    if (!isValidPassPhrase) {
      console.error('Invalid passphrase provided:', req.body.secret);
      res.send({
        'success': false,
        'message': 'Invalid passphrase provided',
      });
      return;
    }

    var temperatures = req.body.data.map((temp) => {
      return {
        temperature: temp.temperature,
        time: temp.time,
      }
    });

    temperatures.forEach((temp) => {
      sequelize.sync()
        .then(() => Temperature.create({
          time: temp.time,
          temperature: temp.temperature
        }));
    });
  }
  res.send({
    'success': true
  });
});

const httpServer = http.createServer(app);

httpServer.listen(APP_PORT, () => {
  console.log("htttp server running at port " + APP_PORT);
});

// TODO: Fix httpsServer together with letsencrypt
