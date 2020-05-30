
const histogram = {
  chartDrawn : false,
  chartEls : null,
  chartSpecs : {
    margin : {top: 10, right: 30, bottom: 80, left: 40},
    width  : 600,//530,
    height : 400//310
  },
  histogram_data : null,
  bins1 : null,
  bins2 : null,
  svgEl : null,
  initialize : async () => {
    // set app's svgElement
    histogram.svgEl = d3.select("#my_histogram")
    .append("svg")
    .attr("width", histogram.chartSpecs.width + histogram.chartSpecs.margin.left + histogram.chartSpecs.margin.right)
    .attr("height", histogram.chartSpecs.height + histogram.chartSpecs.margin.top + histogram.chartSpecs.margin.bottom )
    .append("g")
     .attr("transform",
           "translate(" + histogram.chartSpecs.margin.left + "," + histogram.chartSpecs.margin.top + ")");

    // fetch data
    const dataSource = "https://raw.githubusercontent.com/julbautista/yapa/master/d3plots/data/hist_data.csv";
    histogram.histogram_data = await d3.csv(dataSource, d3.autoType);
    histogram.bins1 = histogram.histogram_data.filter( d => {return d.candidate === "Biden"} );
    histogram.bins2 = histogram.histogram_data.filter( d => {return d.candidate === "Trump"} );
    histogram.drawHistogram();
  },
  drawHistogram : () => {

    const data = histogram.histogram_data;
    const {margin, width, height} = histogram.chartSpecs;
    // X axis
    const x = d3.scaleLinear()
        .domain([0,538])
        .range([0, width]);

    const xAxis = g => g
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x));

    histogrammer = d3.histogram()
      .value(function(d) { return +d.electoral_votes; })   // I need to give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(200)); // then the numbers of bins

    // create scoped copy of global data
    const bins1 = histogrammer(histogram.bins1);
    const bins2 = histogrammer(histogram.bins2);
    const svg = histogram.svgEl;

    const gx = svg.append("g").call(xAxis)


     // Y axis
     const y = d3.scaleLinear()
         .domain([0, d3.max(bins1, d => { return d.length; })])
         .range([height, 0]);

     const yAxis = g => g
           .call(d3.axisLeft(y).tickSizeOuter(0));//.tickSizeOuter(0));

     const gy = svg.append("g").call(yAxis)

     const biden_rects = svg.append("g")
          .selectAll("rect")
          .data(bins1)
          .join("rect")
            .attr("x", d => x(d.x0) + 1)
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0)-0.2))
            .attr("y", d => y(d.length))
            .attr("height", d => y(0) - y(d.length))
            .style("fill", "#0015BC")
            .style("opacity", 0.6);


      const trump_rects = svg.append("g")
           .selectAll("rect")
           .data(bins2)
           .join("rect")
              .attr("x", d => x(d.x0) + 1)
              .attr("width", d => Math.max(0, x(d.x1) - x(d.x0)-0.2))
              .attr("y", d => y(d.length))
              .attr("height", d => y(0) - y(d.length))
             .style("fill", "#FF0000")
             .style("opacity", 0.6);

     //make globally accessible
     histogram.chartEls = {y, yAxis, x, xAxis, trump_rects, biden_rects};

     //legends
     svg.append("circle").attr("cx",440).attr("cy",30).attr("r", 6).style("fill", "#0015BC").style("opacity", 0.6)
     svg.append("circle").attr("cx",440).attr("cy",60).attr("r", 6).style("fill", "#FF0000").style("opacity", 0.6)
     svg.append("text").attr("x", 460).attr("y", 30).text("Biden").style("font-size", "15px").attr("alignment-baseline","middle")
     svg.append("text").attr("x", 460).attr("y", 60).text("Trump").style("font-size", "15px").attr("alignment-baseline","middle")

     svg
       .append("line")
         .attr("x1", x(269) )
         .attr("x2", x(269) )
         .attr("y1", y(d3.max(bins1, d => { return d.length; })*-0.065))
         .attr("y2", y(d3.max(bins1, d => { return d.length; })))
         .attr("stroke", "black")
         .attr("stroke-dasharray", "4")
     svg
       .append("text")
       .attr("x", x(269))
       .attr("y", y(d3.max(bins1, d => { return d.length; })*-0.125))
       .text("Winner: 269 Votes")
       .style("font-size", "15px")
       .style("text-anchor", "middle")

  }
}

document.addEventListener("DOMContentLoaded", histogram.initialize());
