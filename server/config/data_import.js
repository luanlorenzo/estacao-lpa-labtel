/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import _ from 'lodash';
import moment from 'moment';
import Sensor from '../api/sensor/sensor.model';
import SensorData from '../api/sensor_data/sensor_data.model';
import request from 'request';

import later from 'later';

export default function(app) {

  var socketio = app.get('socketio');

  function task() {
    
    SensorData.find()
    .sort({
      'date': -1
    })
    .limit(1)
    .exec()
    .then(function (results) {
      
      var baseUrl = 'http://150.162.124.194/estacao.php';

      if(results.length == 1) {
        var lastRead      = results[0],
            lastReadDate  = lastRead.date;

        var dateStr = moment(lastReadDate).format('YYYY-MM-DD HH:mm:ss');

        baseUrl += '?data=' + dateStr;
        console.log(baseUrl);
      }

      request(baseUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var result = JSON.parse(body);
          if(result) {
            var count = result.data.length;
            for (var i = 0; i < count; i++) {
              var leitura = result.data[i];
              
              //Obtem os dados
              var leitData = leitura['date'];
              leitura = _.omit(leitura, ['date']);
              
              Sensor.find({
                  alias: { $in: _.keys(leitura) }
                })
                .exec()
                .then(function (sensores) {
                  for(var sIndex in sensores) {
                    addSensorData(sensores[sIndex], leitura[sensores[sIndex].alias], moment(leitData));
                  }
                });
            }
          }
        }
        else {
          console.log('Houve uma falha na obtençao dos dados...');
          console.log(error);
        }
      });

      function addSensorData(sensor, value, date) {

        // Valores
        value = value.replace('Rising Rapidly', 'Subindo rapidamente');
        value = value.replace('°C', '');
        value = value.replace('%', '');
        value = value.replace('km/hr', '');
        value = value.replace(' in', '');
        value = value.replace(' mm/hr', '');
        value = value.replace(' mm', '');


        var sensorData = new SensorData();
            sensorData.date = date;
            sensorData.value = value;
            sensorData.sensor = sensor._id;

            sensorData.save()
              .then(s => {
                console.log('Sensor data saved: ' + sensor.name);
                socketio.sockets.emit('data_arrived:' + sensor._id, sensorData);
                return s;
              });
      }

    });

    

  }

  var textSched = later.parse.text('every 10 sec');
  var timer = later.setInterval(task, textSched);
}

