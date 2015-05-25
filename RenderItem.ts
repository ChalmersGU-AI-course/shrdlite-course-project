///<reference path="lib/gl-matrix.d.ts" />>
///<reference path="camera.ts" />>

class RenderItem {
    public pos: Float32Array;
    public rot: Float32Array;

    private vertexBuffer: WebGLBuffer;
    private texture: WebGLTexture;
    private textureCoordBuffer: WebGLBuffer;
    private vertexIndexBuffer: WebGLBuffer;
    private mvMatrix: Float32Array;
    private items;

    public constructor(private gl: WebGLRenderingContext, vertices, vertexIndices, texture: string, textureCoords) {
        this.pos = vec3.create();

        this.mvMatrix = mat4.create();
        mat4.identity(this.mvMatrix);

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);


        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.textureCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords), this.gl.STATIC_DRAW);

        this.vertexIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), this.gl.STATIC_DRAW);

        this.items = vertices.length / 2;

        this.texture = this.gl.createTexture();
        var image: HTMLImageElement = new Image();

        image.src = texture;

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

    }

    public setPosition(x: number, y: number, z: number) {
        vec3.set(this.pos, x, y, z);
    }

    public draw(cam: Camera) {
        var pMatrix = cam.pMatrix;

        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix, this.mvMatrix, this.pos);


        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(cam.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
        this.gl.vertexAttribPointer(cam.textureCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.gl.getUniformLocation(cam.shaderProgram, "uSampler"), 0);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        this.setMatrixUniforms(pMatrix, this.mvMatrix, cam);
        this.gl.drawElements(this.gl.TRIANGLES, this.items, this.gl.UNSIGNED_SHORT, 0);
    }

    private setMatrixUniforms(pMatrix: Float32Array, mvMatrix: Float32Array, cam: Camera) {
        var pUniform = this.gl.getUniformLocation(cam.shaderProgram, "uPMatrix");
        this.gl.uniformMatrix4fv(pUniform, false, new Float32Array(pMatrix));

        var mvUniform = this.gl.getUniformLocation(cam.shaderProgram, "uMVMatrix");
        this.gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix));
    }
}