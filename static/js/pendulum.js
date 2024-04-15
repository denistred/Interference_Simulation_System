const g = 9.81;

class App {
    constructor() {
        var flag = 0;
        this.canvas = document.getElementById("canvas");
        if (this.canvas) {
            console.log("found canvas");
        }
        this.context = this.canvas.getContext("2d");
        if (this.context) {
            console.log("context found");
        } else {
            console.log("context not found");
        }

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.lengthE1 = document.getElementById("_length");
        if (this.lengthE1) {
            console.log("found lendthE1");
        } else {
            console.log("length not found");
        }
        this.frequencyE1 = document.getElementById("delta_length");
        if (this.frequencyE1) {
            console.log("found frequencyE1");
        } else {
            console.log("frequency not found");
        }
        this.amplitudeE1 = document.getElementById("amplitude");
        this.countE1 = document.getElementById("count");
        this.sizeE1 = document.getElementById("_size");

        this.range_lengthE1 = document.getElementById("range_length");
        this.range_frequencyE1 = document.getElementById("range_delta_length");
        this.range_amplitudeE1 = document.getElementById("range_amplitude");
        this.range_countE1 = document.getElementById("range_count");
        this.range_sizeE1 = document.getElementById("range_size");

        this.interval = 30;
        this.run = false;
        this.button_go = document.getElementById("go");
        this.button_stop = document.getElementById("stop");
        this.button_reset = document.getElementById("reset");

        this.draw_line();

        this.button_reset.addEventListener("click", () => {
            this.range_lengthE1.value = 1;
            this.range_frequencyE1.value = 0.1;
            this.range_amplitudeE1.value = 100;
            this.range_countE1.value = 7;
            this.range_sizeE1.value = 10;
            this.lengthE1.value = 1;
            this.frequencyE1.value = 0.1;
            this.countE1.value = 7;
            this.sizeE1.value = 10;
            this.amplitudeE1.value = 100;
        });

        [this.button_go, this.button_reset].forEach((element) => {
            clearInterval(this.timer);
            element.addEventListener("click", (event) => {
                clearInterval(this.timer);
                if (!flag && this.validateData()) {
                    const data = this.getData();

                    if (this.Ball) {
                        data.time = this.Ball.time;
                    }

                    this.Ball = new Ball(
                        50,
                        50,
                        data.size,
                        data.length,
                        data.frequecy,
                        data.amplitude
                    );

                    if (isFinite(data.time)) {
                        this.Ball.time = data.time;
                    }

                    this.timer = setInterval(
                        () => this.redraw(),
                        this.interval
                    );
                }

                this.run = 1;
                flag = 0;
            });
        });

        [
            this.countE1,
            this.sizeE1,
            this.lengthE1,
            this.frequencyE1,
            this.amplitudeE1,
            this.range_amplitudeE1,
            this.range_countE1,
            this.range_frequencyE1,
            this.range_lengthE1,
            this.range_sizeE1,
        ].forEach((element) => {
            clearInterval(this.timer);
            element.addEventListener("change", (event) => {
                clearInterval(this.timer);
                if (!flag && this.validateData()) {
                    const data = this.getData();
                    if (this.Ball) {
                        data.time = this.Ball.time;
                    }

                    this.Ball = new Ball(
                        50,
                        50,
                        data.size,
                        data.length,
                        data.frequecy,
                        data.amplitude
                    );

                    if (isFinite(data.time)) {
                        this.Ball.time = data.time;
                    }

                    this.timer = setInterval(
                        () => this.redraw(),
                        this.interval
                    );
                }

                this.run = 1;
                flag = 0;
            });
        });

        this.button_stop.addEventListener("click", () => {
            if (this.run) {
                this.enableInputFields();
                clearInterval(this.timer);
            }
            flag = 0;
            this.run = 0;
        });
    }

    draw_line() {
        this.canvas.width = canvas.offsetWidth;
        this.canvas.height = canvas.offsetHeight;
        this.context.beginPath();
        this.context.setLineDash([5, 3]);
        this.context.moveTo(0, this.canvas.height / 2);
        this.context.lineTo(this.canvas.width, this.canvas.height / 2);
        this.context.strokeStyle = "black";
        this.context.lineWidth = "2";
        this.context.stroke();
        this.context.closePath();
    }

    clear() {
        this.canvas.width = canvas.offsetWidth;
        this.canvas.height = canvas.offsetHeight;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    redraw() {
        this.canvas.width = canvas.offsetWidth;
        this.canvas.height = canvas.offsetHeight;

        this.clear();
        this.draw_line();
        this.Ball.draw(this.context, this.interval);
    }

    getData() {
        const length = parseFloat(this.lengthE1.value);
        const delta_length = parseFloat(this.frequencyE1.value);
        const amplitude = parseFloat(this.amplitudeE1.value);
        const count = parseFloat(this.countE1.value);
        const size = parseFloat(this.sizeE1.value);

        if (
            isFinite(length) &&
            isFinite(delta_length) &&
            isFinite(amplitude) &&
            isFinite(count) &&
            isFinite(size)
        )
            return {
                length: length,
                delta_length: delta_length,
                amplitude: amplitude,
                count: count,
                size: size,
            };
        else return null;
    }

    validateData() {
        const data = this.getData();
        if (data === null) {
            alert(
                "Одно или несколько полей заполнены непраивльно или не заполнены совсем!"
            );
            return false;
        } else {
            if (data.length < 0.1 || data.length > 10) {
                alert("Длина должена быть в пределах от 0.1 до 10!");
                return false;
            }
            if (data.frequecy < 0.1 || data.frequecy > 1) {
                alert("Длина должена быть в пределах от 0.01 до 1!");
                return false;
            }
            if (data.amplitude < 1 || data.amplitude > 200) {
                alert("Амплитуда должна быть в пределах от 1 до 200!");
                return false;
            }
            if (data.count < 1 || data.count > 100) {
                alert("Количество должно быть в пределах от 1 до 100!");
                return false;
            }
            if (data.size < 1 || data.size > 100) {
                alert("Размер должен быть в пределах от 1 до 100!");
                return false;
            }
        }
        return true;
    }

    enableInputFields() {
        this.lengthE1.removeAttribute("disabled");
        this.frequencyE1.removeAttribute("disabled");
        this.amplitudeE1.removeAttribute("disabled");
        this.countE1.removeAttribute("disabled");
        this.sizeE1.removeAttribute("disabled");

        this.range_lengthE1.removeAttribute("disabled");
        this.range_frequencyE1.removeAttribute("disabled");
        this.range_amplitudeE1.removeAttribute("disabled");
        this.range_countE1.removeAttribute("disabled");
        this.range_sizeE1.removeAttribute("disabled");
    }

    disableInputFields() {
        this.lengthE1.setAttribute("disabled", "disabled");
        this.frequencyE1.setAttribute("disabled", "disabled");
        this.amplitudeE1.setAttribute("disabled", "disabled");
        this.countE1.setAttribute("disabled", "disabled");
        this.sizeE1.setAttribute("disabled", "disabled");

        this.range_lengthE1.setAttribute("disabled", "disabled");
        this.range_frequencyE1.setAttribute("disabled", "disabled");
        this.range_amplitudeE1.setAttribute("disabled", "disabled");
        this.range_countE1.setAttribute("disabled", "disabled");
        this.range_sizeE1.setAttribute("disabled", "disabled");
    }
}

class Ball {
    constructor(x0, y0, size, length, delta_length, amplitude) {
        this.x = x0;
        this.y = y0;
        this.size = size;
        this.time = 0;
        this.length = length;
        this.amplitude = amplitude;
        this.delta_length = delta_length;
        this.count = parseFloat(document.getElementById("count").value);
    }

    getTime() {
        return this.time / 1000;
    }

    drawBall(context) {
        const gradient = context.createRadialGradient(
            this.x,
            this.y,
            this.size,
            this.x - 2,
            this.y - 4,
            2
        );

        gradient.addColorStop(0, "#333");
        gradient.addColorStop(1, "#999");

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
        context.fill();
    }

    calcY() {
        return (
            this.amplitude *
            Math.sin(Math.PI / 2 + (this.time * this.length) / (2 * Math.PI))
        );
    }

    draw(context, interval) {
        this.time += interval / 100;
        this.between_distance =
            document.getElementById("canvas").width / (this.count + 1);
        this.x = this.between_distance;

        const HEIGHT = parseFloat(document.getElementById("canvas").height) / 2;
        const LENGTH = parseFloat(document.getElementById("_length").value);
        const DELTA_LENGTH = parseFloat(
            document.getElementById("delta_length").value
        );

        for (let i = 0; i < this.count; i++) {
            this.length = LENGTH + i * DELTA_LENGTH;
            this.y = HEIGHT + this.calcY();

            this.drawBall(context);
            this.x += this.between_distance;
        }
    }
}

window.onload = () => {
    var options = document.getElementById("id_options");
    var options_height = options.offsetHeight;

    document.getElementById("id_graph").style.height = options_height + "px";

    new App();
};
