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
  title = '收發文狀態統計';

  padding = { top: 50 , right: 50, bottom: 50, left: 50 };
  data: any;
  svg: any;
  maxValue: any;

  width = 1180;
  height = 480;

  xScale;
  yScale;
  linePath;
  colors;
  tick;

  gMark: any;

  constructor() { }

  ngOnInit() {
    this.sendReport = report;

    this.tick = 7;
    this.initSVG();
    this.drawPath();
    this.drawAxis();
    this.drawTooltip();
  }

  private initSVG(): void {
    const padding = this.padding;
    this.maxValue = d3Array.max(dataset, function(c) {
      return d3Array.max(c.values, function(d) {
        return d[1];
      });
    });

    this.svg = d3.select('body #lineChart')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.xScale = d3Scale.scaleLinear()
      .domain([ 30 - this.tick, 30])
      .range([ 0 , this.width -  this.padding.left -  this.padding.right ]);

    this.yScale = d3Scale.scaleLinear()
      .domain([0, this.maxValue * 1.1])
      .range([ this.height - padding.top - padding.bottom , 0 ]);

    this.colors = [ '#00f' , '#0f0' ];
  }

  private drawPath(): void {
    const colors = this.colors;
    const xScale = this.xScale;
    const yScale = this.yScale;
    const linePath = d3Shape.line()
    .x(function(d){
      const x = xScale(d[0]);
      return x;
    })
    .y(function(d){
      const y = yScale(d[1]);
      return y;
    });

    this.svg.selectAll('path')
    .data(dataset)
    .enter()
    .append('path')
    .attr('transform', 'translate(' + this.padding.left + ',' +  this.padding.top  + ')')
    .attr('d', function(d) {
      return linePath(d.values);
    })
    .attr('fill', 'none')
    .attr('stroke-width', 3)
    .attr('stroke', function(d, i){
      return colors[i];
    });
  }

  private drawAxis(): void {
    this.svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + this.padding.left + ',' + (this.height - this.padding.bottom) +  ')')
    .call(d3Axis.axisBottom(this.xScale).ticks(this.tick));

    this.svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + this.padding.left + ',' + this.padding.top +  ')')
    .call(d3Axis.axisLeft(this.yScale));
  }

  private drawTooltip(): void {
    const height = this.height;
    const padding = this.padding;
    const xScale = this.xScale;
    const colors = this.colors;

    // 加入垂直於x軸的對齊線
    const vLine = this.svg.append('line')
      .attr('class', 'focusLine')
      .style('display', 'none');

    // 加入一個提示框
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

    // 加入一個透明的監視滑鼠事件用的矩形
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
