///<reference path="World.ts"/>
///<reference path="lib/jquery.d.ts" />
///<reference path="lib/gl-matrix.d.ts" />>


class GLGWorld implements World {
    protected gl: WebGLRenderingContext;

    protected shaderProgram: WebGLProgram;

    protected pMatrixUniform: WebGLUniformLocation;
    protected mvMatrixUniform: WebGLUniformLocation;

    protected floorVertexBuffer: WebGLBuffer;

    protected pMatrix: Float32Array;
    protected mvMatrix: Float32Array;
    protected vertexPositionAttribute: number;

    constructor(
        public currentState: WorldState,
        public canvas: HTMLCanvasElement
        ) {
        try {
            //this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

            
            this.gl.clearColor(0.0, 0.0, 0.2, 1.0);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.depthFunc(this.gl.LEQUAL);
            

            //Matrices
            this.mvMatrix = mat4.create();
            this.pMatrix = mat4.create();
            //mvpMatrix

            //Shader set-up
            this.shaderProgram = this.gl.createProgram();

            var vertexShaderSrc: string =
                "attribute vec3 aVertexPosition;" +
                "uniform mat4 uMVMatrix;" +
                "uniform mat4 uPMatrix;" +
                "void main(void) {" +
                "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
                "}";


            var vertexShader: WebGLShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.gl.shaderSource(vertexShader, vertexShaderSrc);
            this.gl.compileShader(vertexShader);
            this.gl.attachShader(this.shaderProgram, vertexShader);

            var fragmentShaderSrc: string =
                "precision mediump float;" +
                "void main(void) {" +
                "gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);" +
                "}";

            var fragmentShader: WebGLShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(fragmentShader, fragmentShaderSrc);
            this.gl.compileShader(fragmentShader);
            this.gl.attachShader(this.shaderProgram, fragmentShader);


            this.gl.linkProgram(this.shaderProgram);

            if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
                return;
            }

            this.gl.useProgram(this.shaderProgram);

            //Uniforms
            this.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            this.gl.enableVertexAttribArray(this.vertexPositionAttribute);

            this.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
            this.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");

            //Set up some buffers
            this.floorVertexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.floorVertexBuffer);
            var vertices = [
                -5.0, -2.0, -1.0,
                5.0, -2.0, -1.0,
                -5.0, -2.0, -11.0,
                5.0, -2.0, -11.0
            ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);


            //Now draw!

            this.drawLoop();
        }
        catch (e) {
            alert(e);
            this.gl = undefined;
        }
    }

    drawLoop(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        mat4.perspective(this.pMatrix, 1.04 /*60 grader i radianer*/, this.canvas.width / this.canvas.height, 0.1, 100.0);
        //mat4.lookAt(...)

        mat4.identity(this.mvMatrix);

        var translation = vec3.create();
        vec3.set(translation, 0.0, 0.0, -1.0);
        mat4.translate(this.mvMatrix, this.mvMatrix, translation);

        this.gl.uniformMatrix4fv(this.pMatrixUniform, false, this.pMatrix);
        this.gl.uniformMatrix4fv(this.mvMatrixUniform, false, this.mvMatrix);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.floorVertexBuffer);
        this.gl.vertexAttribPointer(this.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0); //CHeck this up

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    }

    printWorld(callback?: () => void): void {
        //Guard flags
        if (!this.gl)
            return;


        

        //Draw floor



    }
    performPlan(plan: string[], callback?: () => void): void {
    }
    readUserInput(prompt: string, callback: (string) => void): void {
    }
		printPickList(elements : string[]) : void {
		}
    printSystemOutput(output: string, participant?: string): void {
    }
    printDebugInfo(info: string): void {
    }
    printError(error: string, message?: string): void {
    }
}
