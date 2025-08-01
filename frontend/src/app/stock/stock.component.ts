import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { StockService } from '../service/stock.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css'],
})
export class StockComponent implements OnInit {
  chartData: ChartData<'line'> = {
    labels: [],
    datasets: [],
  };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
  };

  allSymbols: string[] = [];
  selectedSymbol: string = '';
  history: { [symbol: string]: { time: string; price: number }[] } = {};

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.stockService.connect().subscribe((data) => {
      // Defensive checks
      if (!data || !data.symbol || data.price === undefined || !data.time) {
        console.warn('⚠️ Malformed WebSocket data:', data);
        return;
      }

      const { symbol, price, time } = data;

      if (!this.history[symbol]) {
        this.history[symbol] = [];
        this.allSymbols.push(symbol);
        if (!this.selectedSymbol) this.selectedSymbol = symbol;
      }

      this.history[symbol].push({ time, price });
      if (this.history[symbol].length > 30) {
        this.history[symbol].shift();
      }

      this.updateChart();
    });
  }

  onSymbolChange(): void {
    this.updateChart();
  }

  updateChart(): void {
    const data = this.history[this.selectedSymbol] || [];

    this.chartData = {
      labels: data.map((pt) => new Date(pt.time).toLocaleTimeString()),
      datasets: [
        {
          label: this.selectedSymbol,
          data: data.map((pt) => pt.price),
          borderColor: '#36a2eb',
          fill: false,
        },
      ],
    };
  }
}
