function show() {
  var data1;
  d3.csv(
    'data/data1.csv',
    function(d) {
      return {
        subject: d.subject,
        item_no: +d.item_no
      };
    },
    function(data) {
      data1 = data;
      exec();
    }
  );
  function exec() {
    var margin = { top: 20, bottom: 20, right: 20, left: 45 },
      width = 700 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
    var canvas1 = d3
      .select('#canvas1')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    var length_data1 = data1.reduce(function(p, el) {
      if (p) {
        return 1 + parseInt(p);
      } else {
        return 1;
      }
    });
    console.log(length_data1);
    function colors1(i) {
      return d3.interpolatePuBuGn(i / length_data1);
    }
    var arc = d3
      .arc()
      .outerRadius((height / 2) * 0.7)
      .innerRadius((height / 2) * 0.33);
    var t = d3
      .transition()
      .ease(d3.easeQuad)
      .duration(2800);
    var pie = d3
      .pie()
      .sort(null)
      .padAngle(0.04)
      .value(function(d) {
        return d.item_no;
      });

    var arcs1 = pie(data1);
    console.log(arcs1[0]);
    var pieContainer = canvas1
      .append('g')
      .attr('transform', 'translate(' + width / 2 + ' ' + height / 2 + ') scale(-1, 1)');

    function plot_pie() {
      var arcElements = pieContainer.selectAll('.pieChart').data(arcs1, function(d, i) {
        return i;
      });
      arcElements.exit().remove();
      var enterArcElements = arcElements
        .enter()
        .append('path')
        .attr('class', 'pieChart')
        .merge(arcElements)
        .attr('fill', function(d, i) {
          return colors1(i);
        })
        .transition(t)
        .attrTween('d', tweenArcs);
    }
    function tweenArcs(d) {
      var interpolator = getArcInterpolator(this, d);
      return function(t) {
        return arc(interpolator(t));
      };
    }

    function getArcInterpolator(el, d) {
      var oldValue = el._oldValue;
      var interpolator = d3.interpolate(
        {
          startAngle: oldValue ? oldValue.startAngle : 0,
          endAngle: oldValue ? oldValue.endAngle : 0
        },
        d
      );
      el._oldValue = interpolator(0);

      return interpolator;
    }
    plot_pie();
  }
}
