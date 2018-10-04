function show() {
  function isolate(force, filter) {
    var initialize = force.initialize;
    force.initialize = function() {
      initialize.call(force, nodes.filter(filter));
    };
    return force;
  }

  var n = 600;

  var colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, 1]);

  var w = window.innerWidth || 580;
  console.log(w);

  var margin = { top: 20, bottom: 20, right: 0, left: 0 },
    width = w - margin.left - margin.right,
    height = 6000 - margin.top - margin.bottom;

  var heightWin = window.innerHeight;

  var nodes = d3.range(n).map(function(i) {
    return {
      index: i,
      identifier: i.toString(),
      x: Math.random() * w,
      y: Math.random() * heightWin
    };
  });

  var canvas1 = d3
    .select('#canvas1')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var simulation = d3
    .forceSimulation(nodes)
    .velocityDecay(0.75)
    .alphaDecay(0)
    .force('collision', d3.forceCollide(10).strength(1));

  simulation.on('tick', ticked);

  scrollFunc();
  nodes.forEach(function(node) {
    canvas1
      .append('circle')
      .data([node])
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      })
      .attr('r', 3.5 + Math.random() * 2)
      .attr('fill', colorScale(Math.random()));
  });

  function ticked() {
    canvas1
      .selectAll('circle')
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      });
  }

  window.addEventListener('scroll', scrollFunc);

  function scrollFunc() {
    var scrollY = window.scrollY || 0;
    nodes.forEach(function(node) {
      simulation.force(
        'y' + node.identifier,
        isolate(d3.forceY(Math.random() * (heightWin + 1200) - 600 + scrollY).strength(0.4), function(d) {
          return d.identifier == node.identifier;
        })
      );
      simulation.force(
        'x' + node.identifier,
        isolate(d3.forceX(((Math.random() - 0.5) * width) / 3 + node.x).strength(0.1), function(d) {
          return d.identifier == node.identifier;
        })
      );
    });
    simulation.restart();
  }
}
