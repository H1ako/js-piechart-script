function generatePieChart(chartData, radius, gap) {
  const totalFillPercent = Math.round(chartData.reduce((sum, data) => sum + parseFloat(data.fillPercent), 0));
  const center = radius + gap;
  let startAngle = gap;

  const svgPaths = chartData.map((data, index) => {
    const endAngle = startAngle + (360 * parseFloat(data.fillPercent)) / totalFillPercent;
    const startRadians = ((startAngle + (index === 0 ? chartData.length * gap : 0)) * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;

    const startX = center + radius * Math.cos(startRadians);
    const startY = center + radius * Math.sin(startRadians);
    const endX = center + radius * Math.cos(endRadians);
    const endY = center + radius * Math.sin(endRadians);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    const centerX = center + (startX + endX) / 2;
    const centerY = center + (startY + endY) / 2;

    const angleDifference = endAngle - startAngle;
    const angleOffset = Math.PI * (angleDifference / 360) * (gap / radius);

    const gapX = Math.cos(angleOffset) * gap;
    const gapY = Math.sin(angleOffset) * gap;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L ${centerX + gapX} ${centerY + gapY} Z`
    );

    if (data.backgroundImage) {
      path.style.fill = `url(${data.backgroundImage})`;
    } else {
      path.style.fill = data.fillColor || 'white';
    }

    startAngle = endAngle + gap;

    return path;
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', `${(radius + gap * 2) * 2}px`);
  svg.setAttribute('height', `${(radius + gap * 2) * 2}px`);

  svgPaths.forEach(path => {
    svg.appendChild(path);
  });

  return svg;
}

// Example usage
const chartData = [
  { name: 'Segment 1', fillPercent: '0.4', fillColor: 'red' },
  { name: 'Segment 2', fillPercent: '0.3', fillColor: 'blue' },
  { name: 'Segment 3', fillPercent: '0.2', fillColor: 'green' },
  { name: 'Segment 4', fillPercent: '0.1', fillColor: 'black' },
];

const radius = 300;
const gap = 1;

const pieChart = generatePieChart(chartData, radius, gap);

// Append the generated SVG pie chart to an HTML element with id "chart-container"
document.getElementById('chart-container').appendChild(pieChart);
