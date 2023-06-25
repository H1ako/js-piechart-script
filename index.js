class PieChart {
  constructor(chartData, radius, gap, container, withAnimations=true) {
    this.chartData = chartData;
    this.radius = radius;
    this.gap = gap;
    this.container = container;
    this.totalFillPercent = this.chartData.reduce((sum, data) => sum + parseFloat(data.fillPercent), 0).toFixed(2);
    this.startAngle = 270 - gap * (chartData.length - 0.5);
    this.boxSize = 80;
    this.boxHeight = this.boxSize / 2;
    this.withAnimations = withAnimations

    if (this.totalFillPercent < 1) {
      const noFillArea = 1 - this.totalFillPercent;
      this.totalFillPercent = 1;
      this.chartData.push({
        fillPercent: noFillArea,
        name: 'Нужно ещё:',
        fillColor: 'white'
      });
    }

    this.transitionDuration = 800; // Animation duration in milliseconds
  }

  generatePathsGroup() {
    let startAngle = this.startAngle

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.zIndex = '-1'
    group.id = 'paths-group'
    group.setAttribute('transform', `translate(${this.boxSize}, ${this.boxHeight})`);

    this.chartData.forEach((data, index) => {
      const center = this.radius;
      const endAngle = startAngle + (360 * parseFloat(data.fillPercent)) / this.totalFillPercent;
      const startRadians = ((startAngle + (index === 0 ? this.chartData.length * this.gap : 0)) * Math.PI) / 180;
      const endRadians = (endAngle * Math.PI) / 180;
  
      const startX = center + this.radius * Math.cos(startRadians);
      const startY = center + this.radius * Math.sin(startRadians);
      const endX = center + this.radius * Math.cos(endRadians);
      const endY = center + this.radius * Math.sin(endRadians);
  
      const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  
      const angleDifference = (endAngle + startAngle) / 2;
      const xPosIndex = Math.cos(angleDifference * Math.PI / 180);
      const yPosIndex = Math.sin(angleDifference * Math.PI / 180);
  
      const gapX = xPosIndex * this.gap;
      const gapY = yPosIndex * this.gap;
  
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute(
        'd',
        `M ${startX} ${startY} A ${center + gapX} ${center + gapY} 0 ${largeArcFlag} 1 ${endX} ${endY} L ${center + gapX} ${center + gapY} Z`
      );
  
      if (data.backgroundImage) {
        const bgImage = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        bgImage.setAttribute('width', '100%');
        bgImage.setAttribute('height', '100%');
        bgImage.setAttribute('patternUnits', 'userSpaceOnUse');
        bgImage.setAttribute('id', `bg-pattern-${index}`);
  
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('width', this.radius * 2);
        image.setAttribute('height', this.radius * 2);
        image.setAttribute('href', data.backgroundImage)
        image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
  
        bgImage.appendChild(image);
  
        group.appendChild(bgImage);
  
        path.style.fill = `url(#bg-pattern-${index})`;
      } else {
        path.style.fill = data.fillColor || 'white';
      }

      startAngle = endAngle + this.gap;
      group.appendChild(path);
    })

    return group;
  }

  generateTextBoxesGroup() {
    let startAngle = this.startAngle
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.zIndex = '999'
    group.id = 'textboxes-group'
    group.setAttribute('transform', `translate(${this.boxSize}, ${this.boxHeight})`);

    this.chartData.forEach((data, index) => {
      const boxGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const endAngle = startAngle + (360 * parseFloat(data.fillPercent)) / this.totalFillPercent;
      const startRadians = ((startAngle + (index === 0 ? this.chartData.length * this.gap : 0)) * Math.PI) / 180;
      const endRadians = (endAngle * Math.PI) / 180;
      const centerX = this.radius + (this.radius + this.gap) * Math.cos((startRadians + endRadians) / 2);
      const centerY = this.radius + (this.radius + this.gap) * Math.sin((startRadians + endRadians) / 2);
      const boxX = centerX - this.boxSize / 2;
      const boxY = centerY - this.boxHeight / 2;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', boxX);
      rect.setAttribute('y', boxY);
      rect.setAttribute('width', this.boxSize);
      rect.setAttribute('height', this.boxHeight);
      rect.setAttribute('fill', 'black');
      rect.setAttribute('rx', '4');
      rect.setAttribute('ry', '4');

      const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameText.setAttribute('x', boxX + this.boxSize / 2);
      nameText.setAttribute('y', boxY + this.boxHeight / 2 - 5);
      nameText.setAttribute('text-anchor', 'middle');
      nameText.setAttribute('dominant-baseline', 'middle');
      nameText.setAttribute('font-family', 'Halvetica, Arial');
      nameText.setAttribute('font-size', '12px');
      nameText.setAttribute('font-weight', '600');
      nameText.setAttribute('fill', 'white');
      nameText.textContent = data.name;

      const percentText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      percentText.setAttribute('x', boxX + this.boxSize / 2);
      percentText.setAttribute('y', boxY + this.boxHeight / 2 + 10);
      percentText.setAttribute('text-anchor', 'middle');
      percentText.setAttribute('dominant-baseline', 'middle');
      percentText.setAttribute('font-family', 'Halvetica, Arial');
      percentText.setAttribute('font-weight', '600');
      percentText.setAttribute('font-size', '12px');
      percentText.setAttribute('fill', 'white');
      percentText.textContent = `${(parseFloat(data.fillPercent) * 100).toFixed(0)}%`;

      boxGroup.appendChild(rect);
      boxGroup.appendChild(nameText);
      boxGroup.appendChild(percentText);

      startAngle = endAngle + this.gap

      group.appendChild(boxGroup)
    })

    return group
  }

  generateSVG() {
    const center = this.radius;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', `${center * 2 + this.boxSize * 2}px`);
    svg.setAttribute('height', `${center * 2 + this.boxHeight * 2}px`);
    svg.setAttribute('style', 'opacity: 0');
    svg.style.zIndex = '1';

    const textBoxesGroup = this.generateTextBoxesGroup()
    const pathsGroup = this.generatePathsGroup()

    svg.appendChild(pathsGroup)
    svg.appendChild(textBoxesGroup)
    return svg;
  }

  animateTextBoxes() {
    const textBoxes = Array.from(this.container.querySelectorAll('rect, text'));

    textBoxes.forEach((textBox) => {
      textBox.animate([
        { opacity: '0' },
        { opacity: '0.9' },
      ], {
        duration: this.transitionDuration,
        fill: 'forwards',
        easing: 'ease-in-out',
      })
      textBox.style.opacity = '0';
      textBox.style.transition = `opacity ${this.transitionDuration}ms ease-in-out`;
      textBox.style.opacity = '1';

      setTimeout(() => {
      }, 1000);
    });
  }

  animateChart() {
    const svg = this.container.querySelector('svg');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const radius = this.radius;
    const circumference = 2 * Math.PI * radius;
  
    circle.setAttribute('cx', svg.clientWidth / 2);
    circle.setAttribute('cy', svg.clientHeight / 2);
    circle.setAttribute('r', Math.round(radius / 2));
    circle.setAttribute('stroke-width', radius + 5);
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke-dasharray', circumference);
    circle.setAttribute('stroke-dashoffset', 0);
    circle.style.transformOrigin = 'center'
    circle.style.rotate = '90deg'
    circle.style.transform = `rotateY(-180deg)`;
  
    svg.insertBefore(circle, svg.childNodes[svg.childNodes.length - 1]);
  
    circle.animate(
      [
        { strokeDashoffset: 0 },
        { strokeDashoffset: circumference }
      ],
      { duration: this.transitionDuration + 800, easing: 'ease-in-out', fill: 'forwards' }
    );
  }

  render() {
    const svg = this.generateSVG();
    this.container.appendChild(svg);

    if (!this.withAnimations) {
      svg.style.opacity = '1';
      
      return
    }

    setTimeout(() => {
      svg.style.opacity = '1';
      this.animateTextBoxes();
      this.animateChart();
    }, 0);
  }
}




// Example usage
const chartData = [
  { name: 'Segment 1', fillPercent: '0.4', fillColor: 'red', backgroundImage: './test-image.jpg' },
  { name: 'Segment 2', fillPercent: '0.3', fillColor: 'blue', backgroundImage: './test-image-2.webp' },
  { name: 'Segment 3', fillPercent: '0.2', fillColor: 'green', backgroundImage: './test-image-3.jpg' },
  { name: 'Segment 4', fillPercent: '0.1', fillColor: 'black', backgroundImage: './test-image-4.webp' },
];

const radius = 376 / 2;
const gap = 1;
const container = document.querySelector('#chart-container');

const pieChart = new PieChart(chartData, radius, gap, container, false);
pieChart.render();
