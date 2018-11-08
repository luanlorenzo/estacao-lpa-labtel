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
          text: ''
        },
        chart: {
          width: 10,
          height: 10
        },
        responsive: {
          rules: [{
              condition: {
                  maxWidth: 530
              },
              chartOptions: {
                  legend: {
                      align: 'center',
                      verticalAlign: 'bottom',
                      layout: 'horizontal'
                  },
                  yAxis: {
                      labels: {
                          align: 'left',
                          x: 0,
                          y: -5
                      },
                      title: {
                          text: null
                      }
                  }
              }
          }]
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

          let windowWidth = window.innerWidth;
          
          // Adjusting the chart size
          if(windowWidth <= 325) {
            this.hChart.setSize("290", "550");
          } else if(windowWidth > 325 && windowWidth <= 530 ) {
            this.hChart.setSize("335", "550");
          } else if(windowWidth > 530 && windowWidth <= 1125 ) {
            this.hChart.setSize("750", "900");
          } else {
            this.hChart.setSize("1000", "950");
          }
        

          // Adding data to the Chart
          this.hChart.setTitle({text: this.sensor.name});
          
          if(this.hChart.series.length > 0) 
            this.hChart.series[0].remove(true);

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

      var arrData = typeof objData != 'object' ? JSON.parse(objData) : objData;

      var CSV = 'sep=,' + '\r\n\n';

      if (ShowLabel) {
        var row = "";
        for (var index in arrData[0]) {
          row += index + ',';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';
      }

      for (var i = 0; i < arrData.length; i++) {
        var row = "";
        for (var index in arrData[i]) {
          row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);

        CSV += row + '\r\n';
      }

      if (CSV == '') {
        alert("Invalid data");
        return;
      }

      var fileName = "Estacao_";

      fileName += this.sensor.name.replace(/ /g, "_");

      var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
      var link = document.createElement("a");
      link.href = uri;
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";
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
