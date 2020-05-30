// create an object called app
// ------------------------
// with the following properties:
// chartDrawn - app state to know if chart was already drawn
// chartEls - placeholder for globally accessible chart elements
// chartSpecs - specifications for the chart
// data - globally accessible data
// options - for the filter
// svgEl - svgEl element
// ------------------------
// with the following methods:
// initialize - the method that starts the app
// filterChart - triggers chart draw and update
// drawDotPlot - draws the chart
// updateChart - updates the chart according to filter

const app = {
  chartDrawn: false,
  chartEls: null,
  chartSpecs:{
    margin : { top: 10, right: 30, bottom: 30, left: 100 },
    width  : 450,
    height : 600
  },
  data: null,
  filterOptions: [
    {label: "Alphabetical", value: 'State'},
    {label: "Biden", value: 'Mean_Biden'},
    {label: "Trump", value: 'Mean_Trump'}
  ],
  svgEl: null,
  initialize: async ()=>{
    // Populate filterElement
    const filterElement = document.querySelector("#filter");
    filterElement.innerHTML = app.filterOptions.map(o => `<option>${o.label}</option>`);

    // Add Event listener to filterElement
    filterElement.addEventListener("change", app.filterChart);

    // retrieve attributes from chartSpecs
    const {margin, width, height} = app.chartSpecs;

    // set app's svgElement
    app.svgEl = d3.select("#my_dataviz").append("svg").attr("width", width).attr("height", height);

    // fetch data
    const dataSource = "https://raw.githubusercontent.com/julbautista/yapa/master/d3plots/data/state_results.csv";
    app.data = await d3.csv(dataSource);

    //dispatch filter change Event to draw initial chart
    filterElement.dispatchEvent(new Event("change"));
  },
  filterChart: (event)=>{
    // sets global selected Index
    const selectedIndex = event.target.selectedIndex;

    if(!app.chartDrawn){
      app.drawDotPlot();
      app.chartDrawn = true;
    }

    app.updateChart(selectedIndex);
  },
  drawDotPlot: () => {
    // create scoped copy of global data
    const data = app.data;
    const svg = app.svgEl;
    const {margin, width, height} = app.chartSpecs;

    //format percent
    const formatter = d3.format(".0%");

     // X axis
     const x = d3.scaleLinear()
         .domain([0,1])
         .range([margin.left, width + margin.right]);

     const xAxis = d3
       .scaleLinear()
       .domain([0, 1])
       .range([0, width]);

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
             .attr("y1",d => y(d.State))
             .attr("y2",d => y(d.State))
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
     app.chartEls = {y, circle, circle2, line, line2, gy};
   },
   updateChart: (order) =>{
     //retrieve from app
     const data = app.data;
     const svg = app.svgEl;
     const{y,circle,circle2,line,line2,gy} = app.chartEls;

     const accessor = app.filterOptions[order].value;

     y.domain(data.sort((a,b) => d3.ascending(a[accessor],b[accessor])).map(d => d.State));

     const t = svg.transition().duration(350);

     circle.data(data, d => d.State)
         .order()
         .transition(t)
         .delay((d, i) => i*20)
         .attr("cy", d => y(d.State));

     circle2.data(data, d => d.State)
         .order()
         .transition(t)
         .delay((d, i) => i*20)
         .attr("cy", d => y(d.State));

     line.data(data, d => d.State)
         .order()
         .transition(t)
         .delay((d, i) => i*20)
         .attr("y1", d => y(d.State))
         .attr("y2", d => y(d.State));

     line2.data(data, d => d.State)
         .order()
         .transition(t)
         .delay((d, i) => i*20)
         .attr("y1", d => y(d.State))
         .attr("y2", d => y(d.State));

     gy.transition(t)
         .call(yAxis)
         .selectAll(".tick")
         .delay((d, i) => i * 20);
   }
}

document.addEventListener("DOMContentLoaded", app.initialize());
