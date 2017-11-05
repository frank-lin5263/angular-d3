import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {
  people: Object[];

  constructor() { }

  ngOnInit() {
    this.people = [
      { name: 'Anderson', age: 35, city: 'Sao Paulo' },
      { name: 'John', age: 12, city: 'Miami' },
      { name: 'Peter', age: 22, city: 'New York' }
    ];
  }

}
