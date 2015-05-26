///<reference path="lib/gl-matrix.d.ts" />>

class Camera {
    public vMatrix;
    public vertexPositionAttribute;
    public textureCoordAttribute;
    public shaderProgram;
    public pMatrix;
    public pos;

    public constructor(private gl, private canvas: HTMLCanvasElement) {
        this.pMatrix = mat4.create();
        mat4.identity(this.pMatrix);

        this.pos = vec3.create();
    }

    public setPosition(x, y, z) {
        vec3.set(this.pos, x, y, z);
    }

    public Setup() {
        mat4.identity(this.pMatrix);

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        mat4.perspective(this.pMatrix, 0.87, this.canvas.width / this.canvas.height, 0.1, 100.0);
        mat4.rotateX(this.pMatrix, this.pMatrix, 0.3);
        mat4.translate(this.pMatrix, this.pMatrix, this.pos);
        
    }
}