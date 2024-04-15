class Physics {
    constructor(circles) {
        this.circles = circles;

        this.updateTimer = setInterval(
            () => this.update(this.circles),
            1000 / 10
        );
    }

    /**
     * Updates the positions and velocities of all circles in the game.
     * @param {Array<Circle>} circles - An array of all circles in the game.
     */
    update(circles) {
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                if (this.distance(circles[j], circles[i]) < circles[i].size) {
                    let angle = this.getAngleOfCollision(
                        circles[j],
                        circles[i]
                    );
                    circles[i].speedX = this.getNewXSpeed(
                        circles[i],
                        circles[j],
                        angle
                    );
                    circles[i].speedY = this.getNewYSpeed(
                        circles[i],
                        circles[j],
                        angle
                    );
                    circles[j].speedX = -this.getNewXSpeed(
                        circles[j],
                        circles[i],
                        angle
                    );
                    circles[j].speedY = -this.getNewYSpeed(
                        circles[j],
                        circles[i],
                        angle
                    );
                }
            }
        }
    }
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

        this.updateTimer = setInterval(() => this.update(), 1000 / 60);
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

    update() {
        let left = this.getX();
        let top = this.getY();
        let containerWidth = window.innerWidth;
        let containerHeight = this.container.offsetHeight;

        this.element.style.left = left + this.speedX + "px";
        this.element.style.top = top + this.speedY + "px";

        if (left + this.size > containerWidth) {
            this.element.style.left = containerWidth - this.size + "px";
            this.speedX = -this.speedX;
        }
        if (left < 0) {
            this.element.style.left = 0;
            this.speedX = -this.speedX;
        }
        if (top + this.size > containerHeight) {
            this.element.style.top = containerHeight - this.size + "px";
            this.speedY = -this.speedY;
        }
        if (top < 0) {
            this.element.style.top = 0;
            this.speedY = -this.speedY;
        }
    }
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
            50
        )
    );
}
const physics = new Physics(particles);

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
