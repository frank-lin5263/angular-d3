import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Color from 'd3-color';
import * as d3Format from 'd3-format';

import { dataset } from '../../shared/data';
import { report } from '../../shared/dataset';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {
  sendReport: Object[];
  title = '發文統計';

  padding = { top: 50 , right: 50, bottom: 50, left: 50 };
  data: any;
  svg: any;
  maxValue: any;

  width = 1180;
  height = 480;

  xScale;
  yScale;
  line;
  colors;
  tick = 30;

  gMark: any;

  constructor() { }

  redrawChart(value) {
    console.log(value);
    if (value.id === '1') {
      this.tick = 1;
    } else if (value.id === '2') {
      this.tick = 7;
    } else if (value.id === '3') {
      this.tick = 30;
    }
    // this.bind();
    // this.render();
  }

  ngOnInit() {
    this.sendReport = report;
    this.initSVG();
    this.bind();
    this.render();
  }

  private initSVG(): void {
    this.maxValue = d3Array.max(dataset, function(c) {
      return d3Array.max(c.values, function(d) {
        return d[1];
      });
    });

    this.svg = d3.select('body #lineChart')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

     this.colors = [ '#00f' , '#0f0' ];

    d3.select('svg').append('g').attr('id', 'axisX');
    d3.select('svg').append('g').attr('id', 'axisY');
  }

  private bind(): void {
    const selection = d3.select('svg')
                        .selectAll('path')
                        .data(dataset);
    selection.enter().append('path');
    selection.exit().remove();
  }

  private render(): void {
    console.log('render: ' + this.tick);
    this.xScale = d3Scale.scaleLinear()
    .domain([ 31 - this.tick, 30])
    .range([ 0 , this.width -  this.padding.left -  this.padding.right ]);

    this.yScale = d3Scale.scaleLinear()
    .domain([0, this.maxValue * 1.1])
    .range([ this.height - this.padding.top - this.padding.bottom , 0 ]);

    this.line = d3Shape.line()
    .x( (d: any) => this.xScale(d[0]) )
    .y( (d: any) => this.yScale(d[1]) );

    this.drawPath();
    this.drawTooltip();
    this.drawAxis();
  }

  private drawPath(): void {
    const colors = this.colors;
    const linePath = this.line;

    this.svg.selectAll('path')
    .attr('transform', 'translate(' + this.padding.left + ',' +  this.padding.top  + ')')
    .attr('d', (d) => this.line(d.values) )
    .attr('fill', 'none')
    .attr('stroke-width', 3)
    .attr('stroke', function(d, i){
      return colors[i];
    });
  }

  private drawAxis(): void {
    this.svg.select('g#axisX')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + this.padding.left + ',' + (this.height - this.padding.bottom) +  ')')
    .call(d3Axis.axisBottom(this.xScale).ticks(this.tick)
    .tickFormat(function (d: number) {
      return '10-' + d;
    }));

    this.svg.select('g#axisY')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + this.padding.left + ',' + this.padding.top +  ')')
    .call(d3Axis.axisLeft(this.yScale));
  }

  private drawTooltip(): void {
    const height = this.height;
    const padding = this.padding;
    const xScale = this.xScale;
    const colors = this.colors;

    const vLine = this.svg.append('line')
      .attr('class', 'focusLine')
      .style('display', 'none');

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0.0);

    const title = tooltip.append('div')
      .attr('class', 'title');

    const des = tooltip.selectAll('.des')
      .data(dataset)
      .enter()
      .append('div');

    const desColor = des.append('div')
      .attr('class', 'desColor');

    const desText = des.append('div')
      .attr('class', 'desText');

    this.svg.append('rect')
      .attr('class', 'overlay')
      .attr('x', this.padding.left)
      .attr('y', this.padding.top)
      .attr('width', this.width - this.padding.left - this.padding.right)
      .attr('height', this.height - this.padding.top - this.padding.bottom)
      .on('mouseover', function() {
        tooltip.style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY + 20) + 'px')
          .style('opacity', 1.0);
          vLine.style('display', null);
      })
      .on('mouseout', function() {
          tooltip.style('opacity', 0.0);
          vLine.style('display', 'none');
      })
      .on('mousemove',  function() {
        const data = dataset[0].values;

        const mouseX = d3.mouse(this)[0] - padding.left;
        const mouseY = d3.mouse(this)[1] - padding.top;

        let x0 = xScale.invert( mouseX );

        x0 = Math.round(x0);

        const bisect = d3Array.bisector( function(d) { return d[0]; }).left;
        const index = bisect(data, x0);


        const date = '10-' + x0;
        const gdp = [];
        for ( let k = 0; k < dataset.length; k++ ) {
          gdp[k] = { id: dataset[k].id, value: dataset[k].values[index][1]};
        }

        title.html('<strong>' + date + '</strong>');

        desColor.style('background-color', function(d, i) {
          return colors[i];
        });

        desText.html( function(d, i){
          return gdp[i].id + '\t' + '<strong>' + gdp[i].value + '</strong>';
        });

        tooltip.style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY + 20) + 'px');

        const vlx = xScale(data[index][0]) + padding.left;

        vLine.attr('x1', vlx)
          .attr('y1', padding.top)
          .attr('x2', vlx)
          .attr('y2', height - padding.bottom);
      });


    const markStep = 80;
    this.gMark = this.svg.selectAll('.gMark')
          .data(dataset)
          .enter()
          .append('g')
          .attr('transform', function(d, i){
            return 'translate(' + (padding.left + i * markStep)  + ',' + ( height - padding.bottom + 40)  + ')';
          });


    this.gMark.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', function(d, i){ return colors[i]; });
    this.gMark.append('text')
          .attr('dx', 15)
          .attr('dy', '.5em')
          .attr('fill', 'black')
          .text(function(d){ return d.id; });
  }

}
