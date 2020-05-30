//import "./style.css";

//var var1 = "function(a, b){return d3.ascending(a.State, b.State)}";
//var var2 = `function(a, b){return d3.ascending(a.Mean_Biden, b.Mean_Biden)}`;
//var var3 = `function(a, b){return d3.ascending(a.Mean_Trump, b.Mean_Trump)}`;
//var var4 = d3.csv("data/state_results.csv").sort(function(a, b){return d3.ascending(a.State, b.State);});

const app = {
  dataSource:
    "https://raw.githubusercontent.com/julbautista/yapa/master/d3plots/data/state_results.csv",
  options: [
    {
      label: "Alphabetical",
      value: (a, b) => d3.ascending(a.State, b.State)
    },
    {
      label: "Biden",
      value: (a, b) => d3.ascending(a.Mean_Biden, b.Mean_Biden)
    },
    {
      label: "Trump",
      value: (a, b) => d3.ascending(a.Mean_Trump, b.Mean_Trump)
    }
  ],
  selectEl: null,
  selectedIndex: null,
  specs: {},
  svg: null,
  init: () => {
    // Populate filter and add event listener for changes
    app.selectEl = document.querySelector("#filter");

    app.selectEl.innerHTML = app.options.map(
      o => `<option>${o.label}</option>`
    );

    app.selectEl.addEventListener("change", app.filterRange);

    const margin = { top: 10, right: 30, bottom: 30, left: 100 };
    const width = 450 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const dataLoaded = false;

    // append the svg object to the body of the page
    app.svg = d3
      .select("#my_dataviz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set globally accessible dimensions
    app.specs = { margin, width, height, dataLoaded };
    app.selectedIndex = 0;
    app.update();
  },
  filterRange: event => {
    if (event && event.target) {
      app.selectedIndex = event.target.selectedIndex;
    }
    app.update();
  },
  update: () => {
    d3.csv(app.dataSource, data => {
      const { width, height, dataLoaded } = app.specs;

      if (!dataLoaded) {
        // Add X axis
        const formatter = d3.format(".0%");

        const x = d3
          .scaleLinear()
          .domain([0, 1])
          .range([0, width]);

        app.svg
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).tickFormat(formatter));

        // Y axis
        const y = d3
          .scalePoint()
          .range([0, height])
          .domain(
            data.map(function(d) {
              return d.State;
            })
          )
          .padding(1);

        // app.svg.attr("width", width + margin.left + margin.right
        // .attr("height", height + margin.top + margin.bottom))

        // Lines
        app.svg.append("g")
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



        // app.svg
        //   .selectAll("myline2")
        //   .data(data)
        //   .enter()
        //   .append("line")
        //   .transition()
        //   .duration(1000)
        //   .attr("x1", function(d) {
        //     return x(d.Upper_Trump);
        //   })
        //   .attr("x2", function(d) {
        //     return x(d.Lower_Trump);
        //   })
        //   .attr("y1", function(d) {
        //     return y(d.State);
        //   })
        //   .attr("y2", function(d) {
        //     return y(d.State);
        //   })
        //   .attr("stroke", "#FF0000")
        //   .attr("stroke-width", "1px")
        //   .style("opacity", 0.6);
        //
        // //  Circles of variable 1
        // app.svg
        //   .selectAll("mycircle")
        //   .data(data)
        //   .enter()
        //   .append("circle")
        //   .transition()
        //   .duration(1000)
        //   .attr("cx", function(d) {
        //     return x(d.Mean_Biden);
        //   })
        //   .attr("cy", function(d) {
        //     return y(d.State);
        //   })
        //   .attr("r", "2.5")
        //   .style("fill", "#0015BC")
        //   .style("opacity", 0.6);
        //
        // // //  Circles of variable 2
        // app.svg
        //   .selectAll("mycircle2")
        //   .data(data)
        //   .enter()
        //   .append("circle")
        //   .transition()
        //   .duration(1000)
        //   .attr("cx", function(d) {
        //     return x(d.Mean_Trump);
        //   })
        //   .attr("cy", function(d) {
        //     return y(d.State);
        //   })
        //   .attr("r", "2.5")
        //   .style("fill", "#FF0000")
        //   .style("opacity", 0.6);

        app.specs.dataLoaded = true;
      } else {
        data.sort((a, b) => app.options[app.selectedIndex].value(a, b));
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", app.init());
