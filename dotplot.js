//order
const dotplot = {
  chartDrawn : false,
  chartEls : null,
  chartSpecs : {
    margin : { top: 10, right: 30, bottom: 30, left: 100 },
    width  : 450,
    height : 600
  },
  dotplot_data : null,
  filterOptions : [
    {label: "Alphabetical", value: (a, b) => d3.ascending(b.State, a.State)},
    {label: "Election Uncertainty", value: (a, b) => d3.ascending(b.uncertainty, a.uncertainty)},
    {label: "Biden Leading", value: (a, b) => d3.ascending(a.Mean_Biden, b.Mean_Biden)},
    {label: "Trump Leading", value: (a, b) => d3.ascending(a.Mean_Trump, b.Mean_Trump)},
    {label: "Electoral Vote Share", value: (a, b) => d3.ascending(a.ev, b.ev)}
  ],
  svgEl : null,
  initialize : async () => {
    // populate form on HTML using filterOptions
    const filterElement = document.querySelector("#filter");
    filterElement.innerHTML = dotplot.filterOptions.map(o => `<option>${o.label}</option>`);

    //use filterChart function whenever form changes
    filterElement.addEventListener("change", dotplot.filterChart);

    // set app's svgElement
    dotplot.svgEl = d3.select("#my_dotplot").append("svg").attr("width", dotplot.chartSpecs.width).attr("height", dotplot.chartSpecs.height);

    // fetch data
    const dataSource = "https://raw.githubusercontent.com/julbautista/yapa/master/d3plots/data/state_results.csv";
    dotplot.dotplot_data = await d3.csv(dataSource, d3.autoType);

    //dispatch filter change Event to draw initial chart
    filterElement.dispatchEvent(new Event("change"));
  },
  filterChart : (event) => {
    //sets global selected Index
    const selectedIndex = event.target.selectedIndex;
    if(!dotplot.chartDrawn){
      dotplot.drawDotPlot();
      dotplot.chartDrawn = true;
    }
    dotplot.updateChart(selectedIndex);
  },
  drawDotPlot : () => {
    // create scoped copy of global data
    const data = dotplot.dotplot_data;
    const svg = dotplot.svgEl;
    const {margin, width, height} = dotplot.chartSpecs;

    //format percent
    const formatter = d3.format(".0%");

     // X axis
     const x = d3.scaleLinear()
         .domain([0,1])
         .range([margin.left, width - margin.right]);

     const xAxis = g => g
        .attr("transform", `translate(0, ${height -margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(formatter))

     // Y axis
     const y = d3.scalePoint()
         .domain(data => data.map(d => d.State))
         .range([height - margin.bottom, margin.top]).padding(1);

     const yAxis = g => g
           .attr("transform", `translate(${margin.left},0)`)
           .call(d3.axisLeft(y).tickSizeOuter(0));

     const line = svg.append("g")
             .selectAll("myline")
             .data(data)
             .join("line")
             .attr("x1", d => x(d.Upper_Biden))
             .attr("x2", d => x(d.Lower_Biden))
             .attr("y1", d => y(d.State))
             .attr("y2", d => y(d.State))
             .attr("stroke", "#0015BC")
             .attr("stroke-width", "1px")
             .style("opacity", 0.6);

     const line2 = svg.append("g")
           .selectAll("myline")
           .data(data)
           .join("line")
           .attr("x1", d => x(d.Upper_Trump))
           .attr("x2", d => x(d.Lower_Trump))
           .attr("y1",d => y(d.State))
           .attr("y2",d => y(d.State))
           .attr("stroke", "#FF0000")
           .attr("stroke-width", "1px")
           .style("opacity", 0.6);

     const circle = svg.append("g")
       .selectAll("mycircle")
       .data(data)
       .join("circle")
             .attr("cx", d => x(d.Mean_Biden))
             .attr("cy", d => y(d.State))
             .attr("r", "2.5")
             .style("fill", "#0015BC")
             .style("opacity", 0.6);

     const circle2 = svg.append("g")
     .selectAll("mycircle")
     .data(data)
     .join("circle")
           .attr("cx", d => x(d.Mean_Trump))
           .attr("cy", d => y(d.State))
           .attr("r", "2.5")
           .style("fill", "#FF0000")
           .style("opacity", 0.6);

     const gx = svg.append("g").call(xAxis);

     const gy = svg.append("g").call(yAxis);

     // make globally accessible
     dotplot.chartEls = {y, yAxis, circle, circle2, line, line2, gy};
  },
  updateChart : (sorting_order) => {
    //retrieve from app
    const data = dotplot.dotplot_data;
    const svg = dotplot.svgEl;
    const {y, yAxis, circle, circle2, line, line2, gy} = dotplot.chartEls;

    const accessor = dotplot.filterOptions[sorting_order].value

    y.domain(data.sort(accessor).map(d => d.State));

    const t = svg.transition().duration(250);

    circle.data(data, d => d.State)
        .order()
        .transition(t)
        .delay((d, i) => i*15)
        .attr("cy", d => y(d.State));

    circle2.data(data, d => d.State)
        .order()
        .transition(t)
        .delay((d, i) => i*15)
        .attr("cy", d => y(d.State));

    line.data(data, d => d.State)
        .order()
        .transition(t)
        .delay((d, i) => i*15)
        .attr("y1", d => y(d.State))
        .attr("y2", d => y(d.State));

    line2.data(data, d => d.State)
        .order()
        .transition(t)
        .delay((d, i) => i*15)
        .attr("y1", d => y(d.State))
        .attr("y2", d => y(d.State));

    gy.transition(t)
        .call(yAxis)
        .selectAll(".tick")
        .delay((d, i) => i * 15);
  }
}

document.addEventListener("DOMContentLoaded", dotplot.initialize());
