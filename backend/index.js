const express = require('express');
const WebSocket = require('ws');
const axios = require('axios');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { configDotenv } = require('dotenv');

const app = express();
const PORT = 3000;
const WSS_PORT = 3001;
configDotenv(); // Load environment variables from .env file
// ====== InfluxDB Configuration ======
const influx = new InfluxDB({
  url: process.env.INFLUX_URL,  // e.g. https://us-east-1-1.aws.cloud2.influxdata.com
  token: process.env.INFLUXDB_TOKEN, // Your InfluxDB token
});
const writeApi = influx.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET);
writeApi.useDefaultTags({ host: 'stock-tracker' });

// ====== WebSocket Server Setup ======
const wss = new WebSocket.Server({ port: WSS_PORT });
let clients = [];

wss.on('connection', (ws) => {
  console.log('✅ Client connected');
  clients.push(ws);

  ws.on('close', () => {
    console.log('❌ Client disconnected');
    clients = clients.filter((client) => client !== ws);
  });
});

// ====== Stock Price Polling ======
const symbols = ['AAPL', 'GOOGL', 'TSLA', 'MSFT'];
const apiKey = process.env.twelve_data_api_key;

async function fetchPrices() {
  try {
    const response = await axios.get(
      `https://api.twelvedata.com/price?symbol=${symbols.join(',')}&apikey=${apiKey}`
    );

    const time = new Date().toISOString();
    const data = response.data;

    for (const symbol of symbols) {
      const symbolData = data[symbol];

      if (!symbolData || !symbolData.price) {
        // console.warn(`⚠️ No price data for ${symbol}:`, symbolData);
        continue;
      }

      const price = parseFloat(symbolData.price);

      // ✅ Save to InfluxDB
      const point = new Point('stock_price')
        .tag('symbol', symbol)
        .floatField('price', price)
        .timestamp(new Date());

      writeApi.writePoint(point);

      // ✅ Broadcast to WebSocket clients
      clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ symbol, price, time }));
        }
      });

      console.log(`📈 ${symbol}: $${price}`);
    }

    await writeApi.flush(); // Make sure data is written to Influx
  } catch (err) {
    console.error('❌ Fetch error:', err.response?.data || err.message);
  }
}

setInterval(fetchPrices, 5000); // fetch every 5 seconds

// ====== Start REST server ======
app.get('/', (req, res) => {
  res.send('Real-Time Stock Backend is running');
});

app.listen(PORT, () => {
  console.log(`🚀 REST server running at http://localhost:${PORT}`);
  console.log(`🌐 WebSocket server running at ws://localhost:${WSS_PORT}`);
});
