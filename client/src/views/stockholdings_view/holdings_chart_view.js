const PubSub = require('../../helpers/pub_sub.js');
const Highcharts = require('highcharts');

const PieChartView = function (container) {
  this.container = container;
}

PieChartView.prototype.bindEvents = function () {
  PubSub.subscribe('HoldingsController:data-loaded', (evt) => {
    this.initializePieChart(evt.detail);
  });
};

PieChartView.prototype.initializePieChart = function (rawUserData) {

  const userData = rawUserData[0];
  this.getTotalInvestment(userData.holdings);
  this.getPercentagesForEachStock(userData.holdings);


};

PieChartView.prototype.getTotalInvestment = function (userData) {

const totalInvestedValueInArray = [];
userData.forEach((holding) => {
  totalInvestedValueInArray.push(parseInt(holding.investedValue));
});
const total = totalInvestedValueInArray.reduce(function(sum, volume) {
  return sum += volume;
}, 0)
return total;
};

PieChartView.prototype.getPercentagesForEachStock = function (userData) {

  const totalInvestmentForEachShare = this.getTotalInvestment(userData);
  const percentageOfInvestedValueByHolding = [];
  const namesArray = [];

  userData.forEach((holding) => {
    namesArray.push(holding.stock);
  })

  userData.forEach((holding) => {
    percentageOfInvestedValueByHolding.push(parseInt(holding.investedValue));
});

const arrayOfPercentages = percentageOfInvestedValueByHolding.map(value => ((value/totalInvestmentForEachShare)*100).toFixed(2));
parseInt(arrayOfPercentages);

this.renderNewPieChart(namesArray, arrayOfPercentages, this.container);
};

PieChartView.prototype.renderNewPieChart = function (names,percentages,container) {
const finalDataArray = names.map((name, index) => {
  return {name: name, y: (parseInt(percentages[index]))}
})

  var pieChart = new Highcharts.Chart(
    {
      chart: {
        backgroundColor: 'transparent',
        plotShadow: false,
        width: null,
        renderTo: container,
        type: 'pie'

      },
      title: {
        text: 'Total Cash Invested %',
        style: {
         color: '#e8e8ff',
         font: 'bold 32px "Trebuchet MS", Verdana, sans-serif'

      }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
              lineHeight:'18px',
              fontSize:'25px',
              fontFamily: "Arial"
            }
          }
        }
      },
      series: [{
        name: 'Stock Holdings',
        colorByPoint: true,
        data: finalDataArray,
    }]
  });
};


module.exports = PieChartView;
