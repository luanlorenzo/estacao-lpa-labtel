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
      
      console.log('Olá');

      var baseUrl = 'http://150.162.232.45/estacao.php';

      if(results.length >= 1) {
        var lastRead      = results[0],
            lastReadDate  = lastRead.date;

        var dateStr = moment(lastReadDate).format('YYYY-MM-DD HH:mm:ss');

        baseUrl += '?data=' + dateStr;
        
      }

      request(baseUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          
          var result = JSON.parse(body);
          if(result) {
            var count = result.data.length;
            
            if(count > 0) {
              handleLeituraRecursive(result.data, 0);
            }

            /*for (var i = 0; i < count; i++) {
              var leitura = result.data[i];
              
              //Obtem os dados
              var leitData = leitura['date'];
              console.log('Data: ' + leitData);
              leitura = _.omit(leitura, ['date']);
              
              Sensor.find({
                  alias: { $in: _.keys(leitura) }
                })
                .exec()
                .then(function (sensores) {
                  for(var sIndex in sensores) {
                    var _data = moment(leitData);
                    _data.add(3, 'hour');
                    addSensorData(sensores[sIndex], leitura[sensores[sIndex].alias], _data);
                  }
                });
            }*/

          }
        }
        else {
          console.log('Houve uma falha na obtençao dos dados...');
          console.log(error);
        }
      });

      function handleLeituraRecursive(leituras, index)
      {
        if(leituras.length == index)
          return;

        var leitura = leituras[index];
        var date = leitura['date'];
        date = moment(date);
        date.add(3, 'hour');

        leitura = _.omit(leitura, ['date']);
        var props = [];
        for(var prop in leitura) {
          props.push(prop);
        }

        Sensor.find({
          'alias': {$in: props}
        })
        .then(function (sensores) {
          
          var insertData = [];
          for(var s in sensores) {
            var sensorData = new SensorData();
            sensorData.date = date;
            var value = leitura[sensores[s].alias];

            value = value.replace('Rising Rapidly', 'Subindo rapidamente');
            value = value.replace('°C', '');
            value = value.replace('%', '');
            value = value.replace('km/hr', '');
            value = value.replace('m/s', '');
            value = value.replace(' in', '');
            value = value.replace(' mm/hr', '');
            value = value.replace(' mm', '');
            value = value.replace(' W/m²', '');

            sensorData.value = value;
            sensorData.sensor = sensores[s]._id;
            insertData.push(sensorData);
          }

          SensorData.create(insertData)
          .then(function (res) {

            for(var i = 0; i < res.length; i++) {
              socketio.sockets.emit('data_arrived:' + res[i].sensor, res[i]);
            }

            handleLeituraRecursive(leituras, index+1);
          });

        });

      }

      function addSensorData(sensor, value, date) {

        // Valores
        value = value.replace('Rising Rapidly', 'Subindo rapidamente');
        value = value.replace('°C', '');
        value = value.replace('%', '');
        value = value.replace('km/hr', '');
        value = value.replace('m/s', '');
        value = value.replace(' in', '');
        value = value.replace(' mm/hr', '');
        value = value.replace(' mm', '');


        var sensorData = new SensorData();
            sensorData.date = date;
            sensorData.value = value;
            sensorData.sensor = sensor._id;

            sensorData.save()
              .then(s => {
                //console.log('Sensor data saved: ' + sensor.name);
                socketio.sockets.emit('data_arrived:' + sensor._id, sensorData);
                return s;
              });
      }

    });

    

  }

  var textSched = later.parse.text('every 10 sec');
  var timer = later.setInterval(task, textSched);
}

