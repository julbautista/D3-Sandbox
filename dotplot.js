//order
const options = [
  {label: "Alphabetical", value: (a, b) => d3.ascending(b.State, a.State)},
  {label: "Biden", value: (a, b) => d3.ascending(a.Mean_Biden, b.Mean_Biden)},
  {label: "Trump", value: (a, b) => d3.ascending(a.Mean_Trump, b.Mean_Trump)}
]

const selectEl = document.querySelector("#filter");
selectEl.innerHTML = options.map(
  o => `<option>${o.label}</option>`
);
selectEl.addEventListener("change",
event =>{
  {
    selectedIndex = event.target.selectedIndex;
  }
  update();
});

const timeout = setTimeout(() => {
  selectEl.selectedIndex = 0;
  selectEl.onchange();
}, 2000);
selectEl.onchange = () => {
  clearTimeout(timeout);
  selectEl.value = options[selectEl.selectedIndex].value;
  selectEl.dispatchEvent(new CustomEvent("input"));
};



const order = ()=>{
  return selectEl;
}

// dimensions
const margin = { top: 10, right: 30, bottom: 30, left: 100 };
const width = 450 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

//format percent
const formatter = d3.format(".0%");

const all_data = d3.csv("https://raw.githubusercontent.com/julbautista/yapa/master/d3plots/data/state_results.csv",
  d3.autoType)

//const data = all_data

// X axis
const x = d3.scaleLinear()
    .domain([0,1])
    .range([margin.left, width + margin.right])

const xAxis = d3
  .scaleLinear()
  .domain([0, 1])
  .range([0, width]);

// Y axis
const y = d3.scalePoint()
    .domain(all_data.then(data => data.map(d => d.State)))
    .range([height - margin.bottom, margin.top]).padding(1)

const  yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0))


  const svg = d3.create("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

  const line = svg.append("g")
          .selectAll("myline")
          .data(all_data)
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
          .data(all_data)
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
    .data(all_data)
    .join("circle")
          .attr("cx", d => x(d.Mean_Biden))
          .attr("cy", d => y(d.State))
          .attr("r", "2.5")
          .style("fill", "#0015BC")
          .style("opacity", 0.6);

    const circle2 = svg.append("g")
    .selectAll("mycircle")
    .data(all_data)
    .join("circle")
          .attr("cx", d => x(d.Mean_Trump))
          .attr("cy", d => y(d.State))
          .attr("r", "2.5")
          .style("fill", "#FF0000")
          .style("opacity", 0.6);

  const gx = svg.append("g")
      .call(xAxis);

  const gy = svg.append("g")
      .call(yAxis);



  const potato = Object.assign(svg.node(), {
    update(order)  {
      y.domain(data.sort(order).map(d => d.State));

      const t = svg.transition()
          .duration(350);

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
  });


document.addEventListener("DOMContentLoaded", order());
//chart.update(order)
