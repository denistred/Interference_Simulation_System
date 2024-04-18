class Grid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        let cells = [];
        this.cells = cells;
        // Инициализация сетки
        for (var i = 0; i < parseInt(this.width / this.cellSize) + 10; i++) {
            this.cells[i] = [];
            for (
                var j = 0;
                j < parseInt(this.height / this.cellSize) + 10;
                j++
            ) {
                this.cells[i][j] = [];
            }
        }
    }

    // Метод для добавления объекта в ячейку сетки
    addObject(object, x, y) {
        const cellX = Math.abs(Math.floor(x / this.cellSize));
        const cellY = Math.abs(Math.floor(y / this.cellSize));
        this.cells[cellX][cellY].push(object);
    }

    // Метод для получения объектов в заданной области
    getObjectsInArea(x, y, radius) {
        const objects = [];
        const startX = Math.max(0, Math.floor((x - radius) / this.cellSize));
        const startY = Math.max(0, Math.floor((y - radius) / this.cellSize));
        const endX = Math.min(
            this.width - 1,
            Math.floor((x + radius) / this.cellSize)
        );
        const endY = Math.min(
            this.height - 1,
            Math.floor((y + radius) / this.cellSize)
        );

        for (let cellX = startX; cellX <= endX; cellX++) {
            for (let cellY = startY; cellY <= endY; cellY++) {
                if (this.cells[cellX][cellY] != null) {
                    objects.push(...this.cells[cellX][cellY]);
                }
            }
        }
        return objects;
    }

    // Метод для очистки сетки
    clear() {
        for (let x = 0; x < this.width / this.cellSize; x++) {
            for (let y = 0; y < parseInt(this.height / this.cellSize); y++) {
                this.cells[x][y] = [];
            }
        }
    }
}

class Physics {
    constructor(container, circles) {
        this.circles = circles;
        this.container = container;
        this.grid = new Grid(
            window.innerWidth,
            this.container.offsetHeight,
            20
        );
        this.updateTimer = setInterval(
            () => this.update(this.circles),
            1000 / 60
        );
    }

    fillGrid() {
        this.circles.forEach((circle) => {
            this.grid.addObject(circle, circle.getX(), circle.getY());
        });
    }

    clearGrid() {
        this.grid.clear();
    }

    update(circles) {
        this.grid.clear();
        circles.forEach((circle) => {
            const x = circle.getX();
            const y = circle.getY();
            this.grid.addObject(circle, x, y);
        });
    
        for (const circle of circles) {
            const neighbors = this.grid.getObjectsInArea(
                circle.getX(),
                circle.getY(),
                circle.size
            );
    
            for (const neighbor of neighbors) {
                if (
                    neighbor !== circle &&
                    this.distance(neighbor, circle) < circle.size
                ) {
                    const angle = this.getAngleOfCollision(circle, neighbor);
                    const { obj1, obj2 } = this.handleCollision(circle, neighbor, angle);
                    circle.speedX = obj1.speedX;
                    circle.speedY = obj1.speedY;
                    neighbor.speedX = obj2.speedX;
                    neighbor.speedY = obj2.speedY;
                }
            }
        }
    }
    
    distance(obj1, obj2) {
        return Math.sqrt(
            Math.pow(obj1.getX() - obj2.getX(), 2) +
            Math.pow(obj1.getY() - obj2.getY(), 2)
        );
    }

    getAngleOfCollision(obj1, obj2) {
        let x1 = Number(obj1.element.style.left.slice(0, -2));
        let y1 = Number(obj1.element.style.top.slice(0, -2));
        let x2 = Number(obj2.element.style.left.slice(0, -2));
        let y2 = Number(obj2.element.style.top.slice(0, -2));
        let angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
        if (angle < 0) {
            angle = 360 + angle;
        }
        return angle;
    }

    handleCollision(obj1, obj2, angle) {
        let x1 = obj1.getX();
        let x2 = obj2.getX();
        let y1 = obj1.getY();
        let y2 = obj2.getY();
        let r1 = obj1.size / 2;
        let r2 = obj2.size / 2;
        let speedX1 = obj1.speedX;
        let speedX2 = obj2.speedX;
        let speed1 = obj1.speedY;
        let speed2 = obj2.speedY;
    
        let dx = x2 - x1;
        let dy = y2 - y1;
        let distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance === 0) {
            distance = 0.01;
        }
    
        if (distance <= r1 + r2) {        
            console.log("hit");
    
            const nx = dx / distance;
            const ny = dy / distance;
    
            const v1n = nx * speedX1 + ny * speed1;
            const v1t = -ny * speedX1 + nx * speed1;
            const v2n = nx * speedX2 + ny * speed2;
            const v2t = -ny * speedX2 + nx * speed2;
    
            const newV1n = -v1n;
            const newV2n = -v2n;
    
            obj1.speedX = nx * newV1n + (-ny) * v1t;
            obj1.speedY = ny * newV1n + nx * v1t;
            obj2.speedX = nx * newV2n + (-ny) * v2t;
            obj2.speedY = ny * newV2n + nx * v2t;
    
            obj1.updatePosition();
            obj2.updatePosition();
    
            while (distance <= r1 + r2);
            
            return { obj1, obj2 };
        }
    
        return { obj1, obj2 };
    }


}

class Circle {
    constructor(element, size, speedX, speedY) {
        this.element = element;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.x = parseInt(element.style.left);
        this.y = parseInt(element.style.top);
        this.state = 'usual'; // Изначальное состояние - обычное
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    updatePosition() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
    }
}





class Particle {
    constructor(container, x, y, speedX, speedY, size, mass) {
        this.size = size;
        this.container = container;
        this.element = document.createElement("div");
        this.container.appendChild(this.element);

        // Element style
        this.element.className = "particle";
        this.element.style.width = size + "px";
        this.element.style.height = size + "px";
        this.element.style.borderRadius = size / 2 + "px";
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";

        // Physic params
        this.coefficientX = speedX;
        this.coefficientY = speedY;
        this.speedX = speedX;
        this.speedY = speedY;
        this.mass = mass;

        // Modal window
        this.modalOpen = false;
        this.modal = document.createElement("div");
        this.modal.className = "modal";
        this.modal.style.height = "235px";
        this.modal.style.width = "225px";
        this.content = document.createElement("div");
        this.content.className = "modal-content";
        this.containerWidth = window.innerWidth;
        this.containerHeight = this.container.offsetHeight;

        // Event listeners
        this.container.addEventListener("click", (event) => {
            if (event.target === this.container && this.modalOpen) {
                this.hideModal();
                this.backToOriginalColor();
            }
        });
        this.element.addEventListener("click", () => {
            if (!this.modalOpen) {
                this.showModal();
                this.highlightParticle();
            } else {
                if (Particle.selectedParticle !== this) {
                    Particle.selectedParticle.hideModal();
                    Particle.selectedParticle.backToOriginalColor();
                    Particle.selectedParticle = this;
                    this.showModal();
                    this.highlightParticle();
                }
            }
        });

        // Update animation
        this.update();
    }

    // Set size of the particle
    setSize(size) {
        this.size = size;
        this.element.style.width = size + "px";
        this.element.style.height = size + "px";
        this.element.style.borderRadius = size / 2 + "px";
    }

    // Get X position of the particle
    getX() {
        return Number(this.element.style.left.slice(0, -2)) + this.size / 2;
    }

    // Get Y position of the particle
    getY() {
        return Number(this.element.style.top.slice(0, -2)) + this.size / 2;
    }

    setX(x) {
        this.element.style.left = x - this.size / 2 + "px";
    }
    setY(y) {
        this.element.style.top = y - this.size / 2 + "px";
    }

    // Show modal with particle information
    showModal() {
        this.content.innerHTML = `
        <p> Скорость X: ${this.speedX}</p>
        <p> Скорость Y: ${this.speedY}</p>
        <p> Температура: ${(this.coefficientX, this.coefficientY)}</p>
        `;
        this.modal.appendChild(this.content);
        document.body.appendChild(this.modal);
        this.modal.style.display = "block";
        this.modalOpen = true;
    }

    highlightParticle() {
        if (Particle.selectedParticle && Particle.selectedParticle !== this) {
            Particle.selectedParticle.backToOriginalColor();
        }
        Particle.selectedParticle = this;
        this.element.style.backgroundColor = "green";
    }

    // Reset color of the particle
    backToOriginalColor() {
        this.element.style.backgroundColor = "rgb(0, 0, 255)";
    }

    // Hide modal window
    hideModal() {
        this.modalOpen = false;
        this.modal.style.display = "none";
        document.body.removeChild(this.modal);
    }

    // Update particle position and color
    update = () => {
        let left = Number(this.element.style.left.slice(0, -2));
        let top = Number(this.element.style.top.slice(0, -2));

        this.element.style.left = left + this.speedX + "px";
        this.element.style.top = top + this.speedY + "px";

        if (this.element.style.backgroundColor !== "green") {
            // Smoothly transition between colors from blue to red based on a variable
            const colorChangeSpeed = 10; // Adjust the speed of color change as needed
            const currentColor =
                this.element.style.backgroundColor || "rgb(0, 0, 255)";
            const redValue = Math.floor(255 * Math.abs(this.speedX));
            const blueValue = Math.floor(255 * Math.abs(1 / this.speedX));
            const targetColor = `rgb(${redValue}, 0, ${blueValue})`; // Dynamic target color
            const currentColorRGB = currentColor.match(/\d+/g).map(Number);
            const targetColorRGB = targetColor.match(/\d+/g).map(Number);
            const newColorRGB = currentColorRGB.map((color, index) => {
                const difference = targetColorRGB[index] - color;
                const change =
                    Math.sign(difference) *
                    Math.min(colorChangeSpeed, Math.abs(difference));
                return color + change;
            });
            this.element.style.backgroundColor = `rgb(${newColorRGB.join(
                ", "
            )})`;
        }

        if (left + this.size > this.containerWidth) {
            this.element.style.left = this.containerWidth - this.size + "px";
            this.speedX = -this.speedX;
        }
        if (left < 0) {
            this.element.style.left = 0;
            this.speedX = -this.speedX;
        }
        if (top + this.size > this.containerHeight) {
            this.element.style.top = this.containerHeight - this.size + "px";
            this.speedY = -this.speedY;
        }
        if (top < 0) {
            this.element.style.top = 0;
            this.speedY = -this.speedY;
        }
        requestAnimationFrame(this.update);
    };
}

// Static property to hold the selected particle
Particle.selectedParticle = null;

let getXPos = () => {
    return Math.random() * (window.innerWidth - 100);
};
let getYPos = () => {
    return Math.random() * (window.innerHeight - 100);
};
let getSpeed = () => {
    return Math.random() * 5;
};
let particles = [];
for (let i = 0; i < 2; i++) {
    particles.push(
        new Particle(
            document.getElementById("particle-container"),
            getXPos(),
            getYPos(),
            getSpeed(),
            getSpeed(),
            200,
            1
        )
    );
}
const physics = new Physics(
    document.getElementById("particle-container"),
    particles
);

document.addEventListener("DOMContentLoaded", function () {
    const particleCountInput = document.getElementById("particle-count");
    const particleSizeInput = document.getElementById("particle-size");

    const temperatureInput = document.getElementById("temperature");
    const continueBtn = document.getElementById("continueBtn");
    const stopBtn = document.getElementById("stopBtn");

    let prevCount = 30;
    particleCountInput.addEventListener("change", function () {
        const newParticleCount = parseInt(this.value);
        let particleDelta = prevCount - newParticleCount;
        if (particleDelta > 0) {
            while (particleDelta) {
                particles[0].element.remove();
                particles.shift();
                particleDelta--;
            }
        } else {
            particleDelta = -particleDelta;
            while (particleDelta) {
                particles.push(
                    new Particle(
                        document.getElementById("particle-container"),
                        getXPos(),
                        getYPos(),
                        getSpeed(),
                        getSpeed(),
                        parseInt(particleSizeInput.value)
                    )
                );
                particleDelta--;
            }
        }
        prevCount = newParticleCount;
        physics.circles = particles;
    });

    particleSizeInput.addEventListener("change", function () {
        const newSize = parseInt(this.value);
        particles.forEach((particle) => {
            particle.setSize(newSize);
        });
    });

    continueBtn.addEventListener("click", function () {
        particles.forEach((particle) => {
            particle.speedX = getSpeed();
            particle.speedY = getSpeed();
        });
    });

    stopBtn.addEventListener("click", function () {
        particles.forEach((particle) => {
            particle.speedX = 0;
            particle.speedY = 0;
        });
    });

    temperatureInput.addEventListener("input", function () {
        const newTemperature = parseFloat(this.value);
        const newSpeed = calculateSpeed(newTemperature);
        particles.forEach((particle) => {
            particle.coefficientX = newSpeed;
            particle.coefficientY = newSpeed;
        });
    });

    function calculateSpeed(temperature) {
        return temperature * 0.5;
    }
});
