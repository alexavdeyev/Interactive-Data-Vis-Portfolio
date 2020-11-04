//Load data
d3.csv("data/total.csv").then((finalData) => {
    finalData.forEach((d) => {
        d.country = d.country;
        d.female = parseFloat(d.Female);
        d.male = parseFloat(d.Male);
    });
const 
    margin = { top: 10, right: 30, bottom: 20, left: 50 },
    width = 600, height = 400,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;   

// set up stack method
const
    stack = d3.stack().keys(["Female", "Male"]);
// data, stacked
const
    series = stack(finalData);
// set-up scales
const xScale = d3
    .scaleBand()
    .domain(finalData.map(d => d.country))
    .range([0, innerWidth])
    .padding(0.1);

const
    xAxis = d3.axisBottom().scale(xScale);

const
    yScale = d3
        .scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .rangeRound([innerHeight, 0]).nice();

const
    yAxis = d3.axisLeft().scale(yScale).tickFormat(formatBillions);
    formatBillions = (num) => d3.format(".2s")(num).replace(/G/, 'B');

const
    colors = d3
        .scaleOrdinal()
        .domain(series.map(d => d.key))
        //.range(["#f4a582","#92c5de"]);
        .range(["#df4c73","#286fb4"]);

  
//Create SVG element
const
    svg = d3
    .select("#viz1")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

const 
    mainG = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

// Add a group for each row of data
const
    g = mainG
        .selectAll("g")
        .data(series)
        .enter()
        .append("g")
        .style("fill", d => colors(d.key))
        .attr("transform", `translate(0,0)`);

// Add a rect for each data value
    g.selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.data.country))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .on("mouseover", function (d) {
        //Get this bar's x/y values, then argument for the tooltip
        let xPosition =
          parseFloat(d3.select(this).attr("x")) + xScale.bandwidth();
        let yPosition = parseFloat(d3.select(this).attr("y")) + innerHeight / 2;

        // Update the tooltip position and value
        d3.select("#tooltip_chart")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px")
          .select("#country")
          .text(d.data.country);

        d3.select("#tooltip_chart")
          .select("#gender")
          .text(d[0] === 0 ? "Female" : "Male");

        d3.select("#tooltip_chart")
          .select("#cases")
          .text(d[1] - d[0]);

        //Show the tooltip
        d3.select("#tooltip_chart").classed("hidden", false);
      })
      .on("mouseout", function () {
        //Hide the tooltip
        d3.select("#tooltip_chart").classed("hidden", true);
      });

// draw legend
const
    legend = mainG
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${innerWidth-margin.left},${margin.top})`)
        .selectAll("g")
        .data(series)
        .enter()
        .append("g");

// draw legend colored rectangles
    legend
        .append("rect")
        .attr("y", (d, i) => i * 30)
        .attr("height", 10)
        .attr("width", 10)
        .attr("fill", d => colors(d.key));

    // draw legend text
    legend
        .append("text")
        .attr("y", (d, i) => i * 30 + 10)
        .attr("x", 5 * 3)
        .text(d => d.key);

    mainG
        .append("g")
        .call(xAxis)
        .attr("transform", `translate(0,${innerHeight})`);

    mainG.append("g").call(yAxis);

  })
  .catch((error) => {
    console.log(error);
  });











