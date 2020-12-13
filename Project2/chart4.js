export function chart4() {

const
    margin = {top: 10, right: 30, bottom: 30, left: 100},
    width = window.innerWidth * 0.7,
    height = window.innerHeight * 0.55,
    time = 1000,

// append the svg object to the body of the page

svg = d3.select("#d3-container-6")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");


Promise.all([
    d3.csv("data/1.csv", d => ({
        group: d.group,
        value1: d.value1,
        value2: d.value2
    }))]).then(([data]) => {
        console.log("state: ", data)

// Tooltip
    var tooltip = 
        d3.select("#d3-container-6")
            .style("position", "relative")
            .append("div")
            .attr("class", "tooltip")
            .attr("width", 100)
            .attr("height", 100)
            .style("position", "absolute");
        

// Add X axis
    var x = d3.scaleLinear()
        .domain([0, 50])
        .range([ 0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

// Y axis
    var y = d3.scaleBand()
        .range([ 0, height ])
        .domain(data.map(d =>d.group))
        .padding(1);
    svg.append("g")
        .call(d3.axisLeft(y))

// Lines
    svg.selectAll("myline")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", d => x(d.value1))
        .attr("x2", d => x(d.value2))
        .attr("y1", d => y(d.group))
        .attr("y2", d => y(d.group))
        .attr("stroke", "grey")
        .attr("stroke-width", "1px")

// Circles of variable 1
    svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.value1))
        .attr("cy", d => y(d.group))
        .attr("r", "6")
        .style("fill", "#69b3a2")
        .on("mouseover", function (d) {
            let pos = d3.mouse(this)
            d3.select(this)
                tooltip.transition()
                .duration(time)
                .style("opacity", .8)
                tooltip.html(`<div>${d.value1}% in ${d.group} (2011)</div>`)
                .style("position", "absolute")
                .style("left", `${pos[0] }px`)
                .style("top", `${pos[1] }px`)
          })
        .on("mouseout", function () {
            d3.select(this)
            tooltip.transition()
            .duration(time)
            .style("opacity", 0)
        })
        

// Circles of variable 2
    svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.value2))
        .attr("cy", d => y(d.group))
        .attr("r", "6")
        .style("fill", "#4C4082")
        .on("mouseover", function (d) {
            let pos = d3.mouse(this)
            d3.select(this)
                tooltip.transition()
                .duration(time)
                .style("opacity", .8)
                tooltip.html(`<div>${d.value2}% in ${d.group} (2018)</div>`)
                .style("position", "absolute")
                .style("left", `${pos[0]}px`)
                .style("top", `${pos[1]}px`)
          })
        .on("mouseout", function () {
            d3.select(this)
            tooltip.transition()
            .duration(time)
            .style("opacity", 0)
        })
})


}