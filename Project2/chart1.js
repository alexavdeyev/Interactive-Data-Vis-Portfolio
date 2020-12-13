export function chart1() {
    
    const 
        margin = { top: 20, right: 50, bottom: 50, left: 50 },
        width = 660 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;
        
    d3.csv("data/depression.csv", d3.autoType).then(data => {
        console.log(data);
    
    var formatper = d3.format(".0%")
    
    const 
        subgroups = data.columns.slice(1),
        groups = d3.map(data, d => d.Year).keys(),
        padding = 0.1,

    /** SCALES */
    svg = d3
        .select("#d3-container-2")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")"),

    xScale = d3
        .scaleBand()
        .domain(groups)
        .range([0, width - margin.right])
        .padding(padding),

    yScale = d3
        .scaleLinear()
        .domain([0, 0.22])
        .range([height - margin.bottom, margin.top]).nice(),

    xAxis = d3.axisBottom(xScale),
    yAxis = d3.axisLeft(yScale).tickFormat(formatper),

    colorScale = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#218380", "#73D2DE"]),

    stackedData = d3.stack().keys(subgroups)(data)

    svg
        .append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", "rects")
        .attr("fill", d => colorScale(d.key))
        .selectAll("rect")
        // Enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.data.Year))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())

    svg
        .append("g")
        .attr("class", "axis")
        .call(xAxis)
        .attr("transform", `translate(0,${height - margin.bottom})`),
        
    svg
        .append("g")
        .attr("class", "axis")
        .call(yAxis)


    const legend = svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(subgroups.slice())
        .enter().append("g")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", width - 250)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", colorScale);

    legend.append("text")
        .attr("x", width - 68)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d)

})

}

