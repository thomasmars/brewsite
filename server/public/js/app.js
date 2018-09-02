document.addEventListener('DOMContentLoaded', function () {
  var initWidth = 800;
  var initHeight = 500;
  const lowTemp = 18;
  const hiTemp = 24;

  var margin = {top: 20, right: 20, bottom: 30, left: 50};
  var width = initWidth - margin.left - margin.right;
  var height = initHeight - margin.top - margin.bottom;

  var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");

  var data = window.data;
  var lastFiveDaysData = window.lastFiveDaysData;

  var lastFiveDays = lastFiveDaysData.map(entry => {
    entry.time = parseTime(entry.time);
    return entry;
  });

  var allData = data.map((entry) => {
    entry.time = parseTime(entry.time);
    return entry;
  });

  function createGraphFromData(tempData, element) {
    const svg = element.append('svg');
    svg.attr('width', initWidth).attr('height', initHeight);

    const g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleTime()
      .rangeRound([0, width]);

    var y = d3.scaleLinear()
      .rangeRound([height, 0]);

    var line = d3.line()
      .x(function(d) { return x(d.time); })
      .y(function(d) { return y(d.temperature); });

    var yExtent = d3.extent(tempData, function(d) { return d.temperature; });
    x.domain(d3.extent(tempData, function(d) { return d.time; }));
    y.domain([
      Math.min((Math.round(yExtent[0]) - 2), lowTemp),
      Math.max((Math.round(yExtent[1]) + 2), hiTemp)
    ]);

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .select(".domain")
      .remove();

    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Temperature (°C)");

    g.append("path")
      .datum(tempData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }

  createGraphFromData(lastFiveDays, d3.selectAll('.last-five-days'));
  createGraphFromData(allData, d3.selectAll('.all-temperatures'));
});


