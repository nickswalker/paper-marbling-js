///<reference path="../../models/vector.ts"/>
///<reference path="../../models/color.ts"/>
class FunctionRenderer {
    private canvas: HTMLCanvasElement;
    private _functionToRender: Function;
    private xAxis: number = null;
    private dirty: boolean = true;
    private _minX: number;
    private _maxX: number;
    private _resolution: number;
    color: Color = new Color(30, 30, 30, 0.1);

    constructor(minX: number, maxX: number, resolution: number = 2) {
        this.canvas = document.createElement("canvas");
        this._minX = minX;
        this._maxX = maxX;
        this._resolution = resolution;
    }

    set resolution(value: number) {
        this._resolution = value;
        this.dirty = true;
    }

    set maxX(value: number) {
        this._maxX = value;
        this.dirty = true;
    }

    set minX(value: number) {
        this._minX = value;
        this.dirty = true;
    }

    set functionToRender(value: Function) {
        this._functionToRender = value;
        this.dirty = true;
    }

    private render() {
        let points = [];
        let min = Infinity;
        let max = -Infinity;
        for (let t = this._minX; t < this._maxX; t += 1 / this._resolution) {
            const nextPoint = this._functionToRender(t);
            min = Math.min(min, nextPoint);
            max = Math.max(max, nextPoint);
            points.push([t, nextPoint]);
        }
        min -= 2;
        max += 2;
        this.xAxis = -min;
        this.canvas.width = this._maxX - this._minX;
        this.canvas.height = max - min;
        const ctx = this.canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(0, points[0]);
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            ctx.lineTo(point[0] - this._minX, point[1] + this.xAxis);
        }
        ctx.closePath();
        ctx.strokeStyle = this.color.toRGBAString();
        ctx.stroke();

    }

    draw(ctx: CanvasRenderingContext2D, position: Vec2) {
        if (this.dirty) {
            this.render()
        }
        ctx.drawImage(this.canvas, position.x + this._minX, position.y - this.xAxis);
    }
}