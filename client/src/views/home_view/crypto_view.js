const PubSub = require('../../helpers/pub_sub.js');
const CryptoData = require('../../models/crypto.js')

const CryptoView = function (container) {
  this.container = container;
}

CryptoView.prototype.bindEvents = function () {

  PubSub.subscribe('Crypto:publish-pairs', (evt) => {
    this.renderList(evt.detail);
  });

};

CryptoView.prototype.renderList = function (cryptoData) {
  const cryptoTable = document.createElement('table');
  cryptoTable.classList.add('crypto-table');
  this.container.appendChild(cryptoTable);
  const tableHeader = cryptoTable.insertRow(0);
  const nameHeader = tableHeader.insertCell(0);
  const priceHeader = tableHeader.insertCell(1);

  const tradingPrice = [];
  const companyNames = [];


  cryptoData.reverse();
  cryptoData.forEach(function(day, i) {
    if(i > 8){
    companyNames.push(cryptoData[i]['companyName']);
    tradingPrice.push(cryptoData[i]['close']);
    const row = cryptoTable.insertRow(1);
    tableHeader.classList.add('crypto-header');
    row.addEventListener('click', (event) => {
      PubSub.publish('Crypto:request-historicaldata', day.symbol);
    });
    const nameCell = row.insertCell(0);
    nameCell.classList.add("indicator");
    nameCell.id = ('crypto-name');
    const priceCell = row.insertCell(1);
    nameCell.innerHTML = cryptoData[i]['companyName'];
    priceCell.innerHTML = cryptoData[i]['close'].toFixed(2);
  }
  });


  nameHeader.innerHTML = "Crypto Currency";
  priceHeader.innerHTML = "Closing Price";
};
CryptoView.prototype.renderCryptoGraph = function (graphdata) {
  this.container.innerHTML = '';
  const container = document.createElement('div');
  const listOfDates = [];
  const listOfPrices = [];
  const priceData = graphdata["Time Series (Digital Currency Daily)"];
  console.log("priceData", priceData);
  Object.keys(priceData).forEach(function(day) {
    // closingPriceData[day];
    // console.log(priceData[day]["4. close"]);
    //console.log(day);
    listOfDates.push(day);
    listOfPrices.push(parseFloat(priceData[day]["4a. close (USD)"]));
    // listOfPrices.reverse();
  });
};


CryptoView.prototype.createArticleItem = function (article) {
  const articleItemNode = document.createElement('ul');
  articleItemNode.classList.add('article-item');

  const title = document.createElement('a');
  title.textContent=article.title;
  title.href = article.url;
  articleItemNode.appendChild(title);

  return articleItemNode;
};

module.exports = CryptoView;
