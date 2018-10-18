'use strict';
(function () {

  class SensorExplorerComponent {
    constructor($http, Auth, $state) {
      this.Auth = Auth;
      this.$http = $http;
      this.$state = $state;
      this.sensors = [];
    }

    $onInit() {
      this.$http.get('/api/sensors').then(response => {
        this.sensors = response.data;
      });
    }
  }

  class ManageSensorComponent {
    /*var errors: [];
    var submitted: false;*/

    constructor($http, Auth, $state, $filter) {
      this.Auth = Auth;
      this.$http = $http;
      this.$state = $state;
      this.$filter = $filter;

      if (this.$state.params.id) {
        this.$http.get('/api/sensors/' + this.$state.params.id)
          .then(response => {
            this.sensor = response.data;
          })
          .catch(err => {
            console.log(err);
          });
      }

      this.dates = {
        date_start: new Date(),
        date_end: new Date()
      };

      this.open = {
        date_start: false,
        date_end: false,
      };

      this.chartOptions = {
        title: {
          text: 'Temperature data'
        },
        xAxis: {
          id: 'dates-data',
          title: {
            text: 'Datas de medição'
          },
          categories: []
        },
        yAxis: {
          id: 'values-data',
          title: {
            text: 'Valores'
          }
        }
      };
    }

    $onInit() {

    }

    openCalendar(e, date) {
      this.open[date] = true;
    }

    loadData() {
      this.$http({
          url: '/api/sensor_data/get_sensor_data/' + this.$state.params.id,
          method: 'GET',
          params: {
            id: this.$state.params.id,
            date_start: this.dates.date_start,
            date_end: this.dates.date_end
          }
        })
        .then(response => {
          this.sensor_data = response.data;
          this.series = [this.sensor.name];
          this.data = [];
          this.labels = [];
          let _data = [];

          for (let i = (this.sensor_data.length - 1); i >= 0; i--) {
            _data.push(this.sensor_data[i].value);
            this.labels.push(this.$filter('date')(this.sensor_data[i].date, 'dd/MM/yyyy HH:mm'));
          }

          // Adding data to the Chart
          this.hChart.xAxis[0].setCategories(this.labels);

          this.hChart.addSeries({
            name: this.sensor.name,
            type: 'line',
            color: '#08F',
            yAxis: 'values-data',
            data: _data.map((value) => {
              return Number(value)
            })
          });

          this.data.push(_data);

          this.dataLoaded = true;
        })
        .catch(err => {
          console.log(err);
        });
    }

    downloadCSV() {
      let objData = [];
      let ShowLabel = true;

      for (let i = 0; i < this.labels.length; i++) {
        let newObj = {
          Data: this.labels[i],
          Leitura: this.sensor_data[i].value
        }
        objData.push(newObj);
      }
      //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
      var arrData = typeof objData != 'object' ? JSON.parse(objData) : objData;

      var CSV = 'sep=,' + '\r\n\n';

      //This condition will generate the Label/Header
      if (ShowLabel) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {

          //Now convert each value to string and comma-seprated
          row += index + ',';
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
      }

      //1st loop is to extract each row
      for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
          row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\r\n';
      }

      if (CSV == '') {
        alert("Invalid data");
        return;
      }

      //Generate a file name
      var fileName = "Estacao_";
      //this will remove the blank-spaces from the title and replace it with an underscore
      fileName += this.sensor.name.replace(/ /g, "_");

      //Initialize file format you want csv or xls
      var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

      // Now the little tricky part.
      // you can use either>> window.open(uri);
      // but this will not work in some browsers
      // or you will not get the correct file extension    

      //this trick will generate a temp <a /> tag
      var link = document.createElement("a");
      link.href = uri;

      //set the visibility hidden so it will not effect on your web-layout
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";

      //this part will append the anchor tag and remove it after automatic click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

  }

  angular.module('siteCurApp')
    .component('sensorExplorer', {
      templateUrl: 'app/sensor_explorer/sensor_explorer.html',
      controller: SensorExplorerComponent
    })
    .component('sensorExplorerRead', {
      templateUrl: 'app/sensor_explorer/sensor_explorer_read.html',
      controller: ManageSensorComponent
    });
})();
