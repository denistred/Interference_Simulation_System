class Grid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        let cells = [];
        this.cells = cells;
        // Инициализация сетки
        console.log(this.width, this.cellSize);
        for (var i = 0; i < parseInt(this.width / this.cellSize) + 2; i++) {
            this.cells[i] = [];
            for (
                var j = 0;
                j < parseInt(this.height / this.cellSize) + 2;
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
        particles.forEach((particle) => {
            this.grid.addObject(particle, particle.getX(), particle.getY());
        });
    }

    clearGrid() {
        this.grid.clear();
    }
    /**
     * Updates the positions and velocities of all circles in the game.
     * @param {Array<Circle>} circles - An array of all circles in the game.
     */
    update = (circles) => {
        this.grid.clear();
        // Добавляем все круги в сетку
        circles.forEach((circle) => {
            const x = circle.getX();
            const y = circle.getY();
            this.grid.addObject(circle, x, y);
        });

        // Проходимся по каждому кругу и проверяем столкновения только с объектами в той же или соседних ячейках
        for (const circle of circles) {
            // Получаем список объектов в той же или соседних ячейках
            const neighbors = this.grid.getObjectsInArea(
                circle.getX(),
                circle.getY(),
                circle.size
            );

            // Проверяем столкновения только с объектами в сетке
            for (const neighbor of neighbors) {
                if (
                    neighbor !== circle &&
                    this.distance(neighbor, circle) < circle.size
                ) {
                    let angle = this.getAngleOfCollision(circle, neighbor);
                    if (this.distance(circle, neighbor) < circle.size) {
                        circle.speedX = -this.getNewXSpeed(
                            circle,
                            neighbor,
                            angle
                        );
                        circle.speedY = -this.getNewYSpeed(
                            circle,
                            neighbor,
                            angle
                        );
                        neighbor.speedX = this.getNewXSpeed(
                            neighbor,
                            circle,
                            angle
                        );
                        neighbor.speedY = this.getNewYSpeed(
                            neighbor,
                            circle,
                            angle
                        );
                        console.log("collision");
                    }
                }
            }
        }
    };

    /**
     * Calculates the distance between two objects.
     * @param {Object} obj1 - The first object.
     * @param {Object} obj2 - The second object.
     * @returns {number} The distance between the two objects.
     */
    distance(obj1, obj2) {
        return Math.sqrt(
            Math.pow(obj1.getX() - obj2.getX(), 2) +
                Math.pow(obj1.getY() - obj2.getY(), 2)
        );
    }
    /**
     * Calculates the angle of collision between two objects.
     * @param {Object} obj1 - The first object.
     * @param {Object} obj2 - The second object.
     * @returns {number} The angle of collision in degrees.
     */
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
    /**
     * Calculates the new x-speed after a collision.
     * @param {Object} obj1 - The first object.
     * @param {Object} obj2 - The second object.
     * @param {number} angle - The angle of collision in degrees.
     * @returns {number} The new x-speed after the collision.
     */
    getNewXSpeed(obj1, obj2, angle) {
        let xSpeed =
            (Math.cos((angle * Math.PI) / 180) *
                (obj1.coefficientX + obj2.coefficientX)) /
            2;
        return xSpeed;
    }
    /**
     * Calculates the new x-speed after a collision.
     * @param {Object} obj1 - The first object.
     * @param {Object} obj2 - The second object.
     * @param {number} angle - The angle of collision in degrees.
     * @returns {number} The new x-speed after the collision.
     */
    getNewYSpeed(obj1, obj2, angle) {
        let ySpeed =
            (Math.sin((angle * Math.PI) / 180) *
                (obj1.coefficientY + obj2.coefficientY)) /
            2;
        return ySpeed;
    }
}

class Particle {
    constructor(container, x, y, speedX, speedY, size) {
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
            console.log("wall");
        }
        if (left < 0) {
            this.element.style.left = 0;
            this.speedX = -this.speedX;
            console.log("wall");
        }
        if (top + this.size > this.containerHeight) {
            this.element.style.top = this.containerHeight - this.size + "px";
            this.speedY = -this.speedY;
            console.log("wall");
        }
        if (top < 0) {
            this.element.style.top = 0;
            this.speedY = -this.speedY;
            console.log("wall");
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
            50
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
