import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { StockComponent } from './stock/stock.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router'; // ✅ Add this

// ✅ Define your routes
const routes: Routes = [
  { path: '', redirectTo: 'stocks', pathMatch: 'full' },
  { path: 'stocks', component: StockComponent },
];

@NgModule({
  declarations: [AppComponent, StockComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgChartsModule,
    FormsModule,
    RouterModule.forRoot(routes), // ✅ Add this line
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
