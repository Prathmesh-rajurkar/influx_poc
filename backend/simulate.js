// backend/simulate.js
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
require('dotenv').config();

const client = new InfluxDB({ url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN });
const writeApi = client.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET);

const symbols = ['USDINR', 'BTCUSD', 'AAPL'];

function getRandomPrice(base) {
  return base + (Math.random() * 5 - 2.5);
}

setInterval(() => {
  symbols.forEach(symbol => {
    const price = getRandomPrice(100 + Math.random() * 100);
    const point = new Point('stock_prices')
      .tag('symbol', symbol)
      .floatField('price', price);

    writeApi.writePoint(point);
    console.log(`[${symbol}] → ${price.toFixed(2)}`);
  });
}, 5000);
