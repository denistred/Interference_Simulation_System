class Grid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        let cells = [];
        this.cells = cells;
        // Инициализация сетки
        for (var i = 0; i < parseInt(this.width / this.cellSize) + 1; i++) {
            this.cells[i] = [];
            for (
                var j = 0;
                j < parseInt(this.height / this.cellSize) + 1;
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
                circle.getX() - circle.size / 2,
                circle.getY() - circle.size / 2,
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
            Math.pow(
                Number(obj1.element.style.left.slice(0, -2)) -
                    Number(obj2.element.style.left.slice(0, -2)),
                2
            ) +
                Math.pow(
                    Number(obj1.element.style.top.slice(0, -2)) -
                        Number(obj2.element.style.top.slice(0, -2)),
                    2
                )
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


        this.modal = document.createElement("div");

        this.modal.className = "modal";

        this.content = document.createElement("div");
        this.content.className = "modal-content";

            // this.container.appendChild(this.modal);

        this.containerWidth = window.innerWidth;
        this.containerHeight = this.container.offsetHeight;

        this.element.addEventListener("click", () => {
            this.showModal();
            this.highlightParticle();
        });
        this.modal.addEventListener("click", () => {
            this.hideModal();
            this.backToOriginalColor();
        });

        // this.updateTimer = setInterval(() => this.update(), 1000 / 60);
        this.update();
    }
    setSize(size) {
        this.size = size;
        this.element.style.width = size + "px";
        this.element.style.height = size + "px";
        this.element.style.borderRadius = size / 2 + "px";
    }

    getX() {
        return Number(this.element.style.left.slice(0, -2));
    }
    getY() {
        return Number(this.element.style.top.slice(0, -2));
    }

    showModal() {
        console.log("here");
        this.content.innerHTML = `
        <p> Скорость X: ${this.speedX}</p>
        <p> Скорость Y: ${this.speedY}</p>
        <p> Температура: ${this.coefficientX, this.coefficientY}</p>
        `
        this.modal.appendChild(this.content);
        document.body.appendChild(this.modal);
        this.modal.style.display = "block";
        
    }

    highlightParticle() {
        this.element.style.backgroundColor = "green";
    }

    backToOriginalColor() {
        this.element.style.backgroundColor = "red";
    }

    hideModal() {
        this.modal.style.display = "none";
        document.body.removeChild(this.modal);
    }

    update = () => {
        let left = this.getX();
        let top = this.getY();

        this.element.style.left = left + this.speedX + "px";
        this.element.style.top = top + this.speedY + "px";

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
for (let i = 0; i < 30; i++) {
    particles.push(
        new Particle(
            document.getElementById("particle-container"),
            getXPos(),
            getYPos(),
            getSpeed(),
            getSpeed(),
            52
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
