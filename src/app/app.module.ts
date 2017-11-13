import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';


const appRoutes: Routes = [
  { path: '', component: LineChartComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LineChartComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
