const PubSub = require('../../helpers/pub_sub.js');
const AppData = require('../../models/app_data.js');
const Highcharts = require('highcharts');
const Request = require('../../helpers/request.js');


const HoldingsTableView = function (container, pieContainer, totalsContainer) {
  this.container = container;
  this.pieContainer = pieContainer;
  this.totalsContainer = totalsContainer;
  this.isAdding= null;
  this.stockToAdd = "";
};

HoldingsTableView.prototype.bindEvents = function () {
  PubSub.subscribe('HoldingsTableView:data-loaded', (evt) => {
    console.log("HoldingsSubscribedData:",evt.detail);
  });
};

HoldingsTableView.prototype.initializeTable = function (userData) {
  PubSub.subscribe("HoldingsTableView:prices-array-loaded", (evt) => {
    this.renderHoldings(userData[0].holdings, this.container, userData[0], evt.detail);
  });
};



HoldingsTableView.prototype.renderHoldings = function (userData, pageBody, wholeUserObject, arrayOfNamesAndPrices) {

  const holdingsTable = document.createElement('table');
  holdingsTable.classList.add('holdings-table');
  this.container.appendChild(holdingsTable);
  const tableHeader = holdingsTable.insertRow(0);

  const nameHeader = tableHeader.insertCell(0);
  const valueHeader = tableHeader.insertCell(1);
  const currentValueHeader = tableHeader.insertCell(2);
  const sharesHeldHeader = tableHeader.insertCell(3);
  const profitLossHeader = tableHeader.insertCell(4);
  const holdingsPercentHeader = tableHeader.insertCell(5);
  const addHeader = tableHeader.insertCell(6);
  const removeHeader = tableHeader.insertCell(7);
  const deleteHeader = tableHeader.insertCell(8);

  const stockNames = [];
  const stockValues = [];
  const sharesHeld = [];
  const profitLoss = [];
  const holdingsPercent = [];

  //Get total volume of all shares held
  const totalVolume = this.getTotalVolume(userData);
  const namesArray = [];
  const percentArray = [];
  const totalInvestedValue = [];
  const totalProfitLoss = [];

  this.generatePopupForm();






  userData.forEach(function(stock) {
    stockValues.push(stock.investedValue);
    stockNames.push(stock.stock);
    sharesHeld.push(stock.noOfSharesHeld);
    profitLoss.push(stock.profitLoss);
    holdingsPercent.push((stock.noOfSharesHeld/totalVolume)*100)


      const row = holdingsTable.insertRow(1);
      tableHeader.classList.add('holdings-header');

      const stockNamesCell = row.insertCell(0);
      const stockValuesCell = row.insertCell(1);
      const stockCurrentValueCell = row.insertCell(2);
      const sharesHeldCell = row.insertCell(3);
      const profitLossCell = row.insertCell(4);
      const percentageCell = row.insertCell(5);
      const addCell = row.insertCell(6);
      const removeCell = row.insertCell(7);
      const deleteCell = row.insertCell(8);
      stockNamesCell.textContent = stock.stock;
      const investedValue = stock.investedValue;
      totalInvestedValue.push(investedValue);
      stockValuesCell.textContent = investedValue;
      const currentValue = this.passCurrentValue(stock.stock, arrayOfNamesAndPrices);
      stockCurrentValueCell.textContent = currentValue
      const totalSharesHeld = stock.noOfSharesHeld;
      sharesHeldCell.textContent = totalSharesHeld;
      const individualProfitLoss = ((currentValue * totalSharesHeld) - investedValue).toFixed(2)
      profitLossCell.textContent = individualProfitLoss;
      totalProfitLoss.push(individualProfitLoss);


      if (profitLossCell.textContent > 0){
        profitLossCell.classList.add('positive')
      } else { profitLossCell.classList.add('negative')}

      addCell.textContent = "Add";
      addCell.classList.add("indicator");
      removeCell.textContent = "Remove";
      removeCell.classList.add("indicator");
      deleteCell.textContent = "Delete";
      deleteCell.id = "delete-button";
      deleteCell.classList.add("indicator");

      deleteCell.addEventListener('click', (event) => {
      this.deleteStock(userData, stock, wholeUserObject)
      })

      addCell.addEventListener('click', (event) => {
        this.isAdding = "true";
        this.stockToAdd=stock.stock;
        togglePopup();
      });
      removeCell.addEventListener('click', (event) => {
        this.isAdding = "false";
        this.stockToAdd=stock.stock;
        togglePopup();
      });
      function togglePopup(){
        const popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
      };
      const calculatedpercentage = ((stock.noOfSharesHeld/totalVolume)*100).toFixed(2);
      percentageCell.innerHTML = calculatedpercentage;
      namesArray.push(stock.stock);
      percentArray.push(calculatedpercentage);
    }, this);


    const totalInvested = this.getTotalValue(totalInvestedValue);
    const totalPL = this.getTotalValue(totalProfitLoss);




    this.renderPieChart(namesArray, percentArray, this.pieContainer, totalInvested, totalPL);

    nameHeader.textContent = "Stock";
    valueHeader.textContent = "Invested Value";
    currentValueHeader.textContent = "Current Price";
    sharesHeldHeader.textContent = "Volume";
    profitLossHeader.textContent = "Profit/Loss";
    holdingsPercentHeader.textContent = "% of total holdings"
    addHeader.textContent = "Bought";
    removeHeader.textContent = "Sold";
  };

  HoldingsTableView.prototype.deleteStock = function (userData, stock, wholeUserObject) {
    const stockId = userData.indexOf(stock);
    userData.splice(stockId, 1);
    wholeUserObject.holdings = userData;
    request = new Request('http://localhost:3000/api/user');
    request.update(wholeUserObject);
    PubSub.publish('HoldingsTableView:data-loaded', wholeUserObject);
    location.reload();

  };

HoldingsTableView.prototype.passCurrentValue = function (symbol, arrayOfNamesAndPrices) {
    console.log(arrayOfNamesAndPrices[1]);
    var result=0;
    arrayOfNamesAndPrices[1].forEach(function(arraySymbol, index){
      // console.log("symbol,", symbol);
      if(arraySymbol==symbol){
        // console.log("arraysymbol,", arraySymbol, "index:", index);
        // console.log(arrayOfNamesAndPrices[0][index]);
        result = arrayOfNamesAndPrices[0][index];
      };
    });

    return result;
};

  HoldingsTableView.prototype.generatePopupForm = function (isAdding) {

    const container = document.createElement('div');
    container.classList.add("popup");
    const body = document.querySelector("#pageBody");
    body.appendChild(container);

    const span = document.createElement('span');
    span.id = "myPopup";
    span.classList.add("popuptext");
    span.textContent = "Please Register Your Stock Transaction";
    container.appendChild(span);

    const closeButton = document.createElement('button');
    closeButton.id = "close-button";
    closeButton.textContent = "X";
    closeButton.style.backgroundColor = "black";
    span.appendChild(closeButton);

    const form = document.createElement('form');

    const sharesBoughtText = document.createElement('div');
    sharesBoughtText.classList.add("shares-bought-text");
    sharesBoughtText.textContent="Share Bought";
    form.appendChild(sharesBoughtText);

    const sharesBoughtInput = document.createElement('input');
    sharesBoughtInput.setAttribute("type", "text");
    sharesBoughtInput.style.backgroundColor = "navy";
    sharesBoughtInput.placeholder = "No of Shares";
    sharesBoughtText.appendChild(sharesBoughtInput);

    const pricePaid = document.createElement('div');
    pricePaid.classList.add("input-text");
    pricePaid.textContent = "Stock Price";
    form.appendChild(pricePaid);

    const priceInput = document.createElement('input');
    priceInput.setAttribute("type", "text");
    priceInput.style.backgroundColor = "navy";
    priceInput.placeholder = "$ per Share";
    pricePaid.appendChild(priceInput);

    const submitButton = document.createElement('button');
    submitButton.id = "submit-button";
    submitButton.textContent = "Submit";
    submitButton.style.backgroundColor = "navy";
    span.appendChild(submitButton);

    submitButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.submitNewStock(parseInt(priceInput.value), parseInt(sharesBoughtInput.value));
      span.classList.toggle("show")
      priceInput.value = "";
      sharesBoughtInput.value = "";
    });

    closeButton.addEventListener('click', (event) => {
      span.classList.toggle("show")
      priceInput.value = "";
      sharesBoughtInput.value = "";
    });

    span.appendChild(form);

  };

  HoldingsTableView.prototype.submitNewStock = function (priceInput, sharesBoughtInput) {
    if(this.isAdding === "false")
    priceInput = (-1 * priceInput);
    const updatedHolding = {};
    updatedHolding.stock = this.stockToAdd;
    updatedHolding.investedValue = priceInput;
    updatedHolding.noOfSharesHeld = sharesBoughtInput;
    updatedHolding.profitLoss = "100";
    PubSub.publish('StockHoldings:holding-submitted', updatedHolding);
  };

  HoldingsTableView.prototype.getTotalVolume = function (rawData) {
  const individualHoldings = rawData;
  const totalStockVolumeInArray = [];

  individualHoldings.forEach((holding) => {
    totalStockVolumeInArray.push(parseInt(holding.noOfSharesHeld));
  })
  const total = totalStockVolumeInArray.reduce(function(sum, volume) {
    return sum += volume;
  }, 0)
  return total;
};

HoldingsTableView.prototype.renderPieChart = function (names,percentages,pieContainer, invested, profitLoss) {
const finalDataArray = names.map((name, index) => {
  return {name: name, y: (parseInt(percentages[index]))}
})

  var pieChart = new Highcharts.Chart(
    {
      chart: {
        backgroundColor: 'transparent',
        plotShadow: false,
        width: null,
        renderTo: pieContainer,
        type: 'pie'
      },
      title: {
        text: 'Total Shares %',
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
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      series: [{
        name: 'Stock Holdings',
        colorByPoint: true,
        data: finalDataArray
    }]
  });
  const totalsTable = document.createElement('table');
  this.totalsContainer.appendChild(totalsTable);

  const totalsHeader = totalsTable.insertRow(0);
  const valueRow = totalsTable.insertRow(1);

  const totalsCell = totalsHeader.insertCell(0);
  totalsCell.textContent = "Total Invested Value";
  const plTotalsCell = totalsHeader.insertCell(1);
  plTotalsCell.textContent = "Total Profit/Loss";
  const investedCell = valueRow.insertCell(0);
  investedCell.textContent = "£" + invested;
  const profitLossCell = valueRow.insertCell(1);
  profitLossCell.textContent = "£" + profitLoss;
  profitLossCell.classList.add('positive')


};


HoldingsTableView.prototype.getTotalValue = function (arr) {
  let total =  0

  for(var i = 0; i < arr.length; i++) {
    let number = parseInt(arr[i])
    total += number
  }
  return total;
};



module.exports = HoldingsTableView;
