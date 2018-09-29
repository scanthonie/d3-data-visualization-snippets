function show() {
  var data1;
  d3.csv(
    'data/data1.csv',
    function(d) {
      d.visits = +d.visits;
      return d;
    },
    function(data) {
      data1 = data;
      exec();
    }
  );
  var t = d3
    .transition()
    .ease(d3.easeQuad)
    .duration(2000);
  var margin = { top: 20, bottom: 20, right: 20, left: 45 },
    width = 580 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;
  var canvas1 = d3
    .select('#canvas1')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  function exec() {
    var xScale = d3
      .scalePoint()
      .range([0, width])
      .domain(
        data1.map(function(d) {
          return d.month;
        })
      );

    var maxVisits = d3.max(data1, function(d) {
      return +d.visits;
    });
    maxVisitsCeil = Math.ceil(maxVisits / 1000) * 1000;
    var yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, maxVisitsCeil]);

    execGradients(yScale);
    execArea(xScale, yScale, data1);
    execLine(xScale, yScale, data1);
    execAxis(xScale, yScale);
    execMouseTracker(xScale, yScale, data1);
  }

  function execGradients(yScale) {
    var rangeMax = yScale.invert(0);
    var rangeMin = yScale.invert(height);

    canvas1
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', yScale(rangeMax))
      .attr('x2', 0)
      .attr('y2', yScale(rangeMin))
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#E5F2D7' },
        { offset: '50%', color: '#EEEEEE88' },
        { offset: '100%', color: '#F3DBE222' }
      ])
      .enter()
      .append('stop')
      .attr('offset', function(d) {
        return d.offset;
      })
      .attr('stop-color', function(d) {
        return d.color;
      });

    canvas1
      .append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', yScale(rangeMax))
      .attr('x2', 0)
      .attr('y2', yScale(rangeMin))
      .selectAll('stop')
      .data([{ offset: '0%', color: '#97D755' }, { offset: '100%', color: '#D8949B' }])
      .enter()
      .append('stop')
      .attr('offset', function(d) {
        return d.offset;
      })
      .attr('stop-color', function(d) {
        return d.color;
      });
  }

  function execArea(xScale, yScale, data1) {
    var area0 = d3
      .area()
      .x0(function(d) {
        return xScale(d.month);
      })
      .x1(function(d) {
        return xScale(d.month);
      })
      .y0(function() {
        return yScale(0);
      })
      .y1(function(d) {
        return yScale(0);
      })
      .curve(d3.curveCatmullRom.alpha(0.5));
    var area = d3
      .area()
      .x0(function(d) {
        return xScale(d.month);
      })
      .x1(function(d) {
        return xScale(d.month);
      })
      .y0(function() {
        return yScale(0);
      })
      .y1(function(d) {
        return yScale(d.visits);
      })
      .curve(d3.curveCatmullRom.alpha(0.5));

    canvas1
      .append('path')
      .attr('d', area0(data1))
      .style('fill', 'url(#area-gradient)')
      .transition(t)
      .attr('d', area(data1));
  }

  function execLine(xScale, yScale, data1) {
    var line0 = d3
      .line()
      .x(function(d) {
        return xScale(d.month);
      })
      .y(function(d) {
        return yScale(0);
      })
      .curve(d3.curveCatmullRom.alpha(0.5));
    var line = d3
      .line()
      .x(function(d) {
        return xScale(d.month);
      })
      .y(function(d) {
        return yScale(d.visits);
      })
      .curve(d3.curveCatmullRom.alpha(0.5));

    canvas1
      .append('path')
      .attr('d', line0(data1))
      .style('fill', 'none')
      .style('stroke', 'url(#line-gradient)')
      .style('stroke-width', '3')
      .transition(t)
      .attr('d', line(data1));
  }

  function execAxis(xScale, yScale) {
    var bottomAxis = d3
      .axisBottom()
      .scale(xScale)
      .tickSizeOuter(0)
      .tickSize(0);
    var bottomAxisChart = canvas1
      .append('g')
      .attr('transform', 'translate( 0 ' + yScale(0) + ')')
      .call(bottomAxis);

    bottomAxisChart.selectAll('text').attr('font-size', '1.5em');
  }

  function execMouseTracker(xScale, yScale, data1) {
    var focus = canvas1
      .append('g')
      .attr('class', 'focus')
      .style('display', 'none');
    focus
      .append('circle')
      .attr('id', 'visitsCircle')
      .attr('r', 4.5);
    focus
      .append('text')
      .attr('id', 'visitsText')
      .attr('x', 9)
      .attr('dy', '.35em');

    var verticalPath = d3.line()([[0, -10], [0, height + 10]]);
    focus
      .append('path')
      .attr('d', verticalPath)
      .attr('class', 'verPath')
      .attr('stroke', 'grey')
      .attr('stroke-width', '1');

    canvas1
      .append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'rgba(0,0,0,0)')
      .on('mouseover', function() {
        focus.style('display', null);
      })
      .on('mouseout', function() {
        focus.style('display', 'none');
      })
      .on('mousemove', mousemove);

    function mousemove() {
      var invertXScale = function(x) {
        var domain = xScale.domain();
        var range = xScale.range();
        var scale = d3
          .scaleQuantize()
          .domain(range)
          .range(domain);
        return scale(x);
      };
      var xMonth = invertXScale(d3.mouse(this)[0]);
      var xPos = xScale(xMonth);

      var d = monthToNum(xMonth);
      d = data1[d - 1].visits;
      var yPos = yScale(d);

      focus.select('#visitsCircle').attr('transform', 'translate(' + xPos + ',' + yPos + ')');
      focus.select('.verPath').attr('transform', 'translate(' + xPos + ',' + 0 + ')');

      var textOffset = 5;
      if (xMonth == 'Dec.') {
        focus
          .select('#visitsText')
          .attr('transform', 'translate(' + (xPos - 5 * textOffset) + ',' + yPos + ')')
          .attr('text-anchor', 'end')
          .text(d);
      } else {
        focus
          .select('#visitsText')
          .attr('transform', 'translate(' + (xPos + textOffset) + ',' + yPos + ')')
          .attr('text-anchor', 'start')
          .text(d);
      }
    }
  }
  function monthToNum(xMonth) {
    var d = 0;
    switch (xMonth) {
      case 'Jan.':
        d = 1;
        break;
      case 'Feb.':
        d = 2;
        break;
      case 'Mar.':
        d = 3;
        break;
      case 'Apr.':
        d = 4;
        break;
      case 'May':
        d = 5;
        break;
      case 'June':
        d = 6;
        break;
      case 'Jul.':
        d = 7;
        break;
      case 'Aug.':
        d = 8;
        break;
      case 'Sept.':
        d = 9;
        break;
      case 'Oct.':
        d = 10;
        break;
      case 'Nov.':
        d = 11;
        break;
      case 'Dec.':
        d = 12;
        break;
    }
    return d;
  }
}
