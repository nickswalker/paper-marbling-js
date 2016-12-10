///<reference path="color_operations.ts"/>
class Vortex implements Operation, VectorField {
    // C in the paper
    readonly center: Vec2;
    readonly radius: number;
    readonly strength: number;
    readonly alpha = 80.0;
    readonly lambda = 32;
    private static regex = RegExp("//^v(?:ortex)? " + vec2Regex + floatRegex + "$/i");

    constructor(origin: Vec2, radius: number, counterclockwise: boolean = False) {
        this.center = origin;
        this.radius = radius;
        this.counterclockwise = counterclockwise;
    }

    static fromString(str: string) {
        const match = Vortex.regex.exec(str);
        if (match != null && match.length > 0) {
            const origin = new Vec2(parseFloat(match[0]), parseFloat(match[1]));
            const strength = parseFloat(match[2]);
            return new Vortex(origin, strength);
        }
    }

    apply(renderer: MarblingRenderer) {
        for (let d = 0; d < renderer.drops.length; d++) {
            let drop = renderer.drops[d];
            for (let p = 0; p < drop.points.length; p++) {
                const oldPoint = drop.points[p];
                const offset = this.atPoint(oldPoint);
                drop.points[p] = oldPoint.add(offset);
            }
            drop.makeDirty();
        }
    }

    atPoint(point: Vec2): Vec2 {
        const pLessC = point.sub(this.center);
        const pLessCLen = pLessC.length();
        const d = Math.abs(100 / this.radius * pLessCLen);
        const l = this.alpha * this.lambda / (d + this.lambda);
        const theta = this.counterclockwise ? -l / pLessCLen : l / pLessCLen;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        const mat = new Mat2x2(cosT, sinT, -sinT, cosT);
        const addend = pLessC.mult(mat);
        const trans = this.center.add(addend);
        return trans.sub(point);
    }

}