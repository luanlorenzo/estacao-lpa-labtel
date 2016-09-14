/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import moment from 'moment';
import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Sensor from '../api/sensor/sensor.model'
import SensorData from '../api/sensor_data/sensor_data.model'

Sensor.find({}).remove()
  .then(() => {
    Sensor.create({
      name: 'Temperatura Ambiente',
      alias: 'outsideTemp',
      unit: 'ºC'
    },
    {
      name: 'Umidade Relativa',
      alias: 'outsideHumidity',
      unit: '%'
    },
    {
      name: 'Irradiância Solar',
      alias: 'solarRad',
      unit: 'W/m²'
    },
    {
      name: 'Previsão do tempo',
      alias: 'ForecastStr',
      unit: ''
    },
    {
      name: 'Fase da lua',
      alias: 'MoonPhaseStr',
      unit: ''
    },
    {
      name: 'Temperatura de orvalho',
      alias: 'outsideDewPt',
      unit: 'ºC'
    },
    {
      name: 'Direção do vento',
      alias: 'windDirection',
      unit: ''
    },
    {
      name: 'Velocidade do vento',
      alias: 'windSpeed',
      unit: 'm/s'
    },
    {
      name: 'Pressão Atmosférica',
      alias: 'barometer',
      unit: 'in'
    },
    {
      name: 'BarTrend',
      alias: 'BarTrend',
      unit: ''
    },
    {
      name: 'Sensação Térmica',
      alias: 'windChill',
      unit: 'ºC'
    },
    {
      name: 'Índice THSW',
      alias: 'thw',
      unit: 'ºC'
    },
    {
      name: 'Índice de calor',
      alias: 'outsideHeatIndex',
      unit: 'ºC'
    },
    {
      name: 'Precipitação (dia)',
      alias: 'dailyRain',
      unit: 'mm'
    },
    {
      name: 'Precipitação (tempestade)',
      alias: 'stormRain',
      unit: 'mm'
    },
    {
      name: 'Precipitação (tempestade)',
      alias: 'stormRain',
      unit: 'mm'
    },
    {
      name: 'Precipitação (mês)',
      alias: 'monthlyRain',
      unit: 'mm'
    },
    {
      name: 'Precipitação (taxa)',
      alias: 'rainRate',
      unit: 'mm/hr'
    },
    {
      name: 'Nascer do sol',
      alias: 'sunriseTime',
      unit: ''
    },
    {
      name: 'Por do sol',
      alias: 'sunsetTime',
      unit: ''
    }).then(() => {
      Sensor.findOne().exec()
        .then(sensor => {

          SensorData.find({}).remove()
            .then(() => {
              var date = moment();

              for (var i = 0; i < 0; i++) {
                var _date = date.add(10, 'minutes');
                var sensorData = new SensorData();
                sensorData.date = _date;
                sensorData.value = Math.random() * 30;
                sensorData.sensor = sensor._id;

                sensorData.save();
              }
            })
        });
    })
  });


User.find({}).remove()
  .then(() => {
    User.create({
      provider: 'local',
      name: 'Test User',
      email: 'test@example.com',
      password: 'test'
    }, {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin',
      password: 'admin'
    })
    .then(() => {
      console.log('finished populating users');
    });
  });
