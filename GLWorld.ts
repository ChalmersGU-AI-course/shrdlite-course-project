///<reference path="assets.ts" />>
///<reference path="World.ts"/>
///<reference path="lib/jquery.d.ts" />
///<reference path="lib/gl-matrix.d.ts" />>
///<reference path="RenderItem" />>

class GLGWorld implements World {
    protected gl: WebGLRenderingContext;

    //protected pMatrix: Float32Array;
    //protected mvMatrix: Float32Array;

    protected cam: Camera;

    private scene: Array<RenderItem>;
    private floor: RenderItem;
    private arm: RenderItem;

    constructor(
        public currentState: WorldState,
        canvas: HTMLCanvasElement
        ) {
        try {
            this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        } catch (e) {
            alert(e);
            this.gl = undefined;
        }
        this.scene = new Array<RenderItem>();
        this.cam = new Camera(this.gl, canvas);
        this.cam.setPosition(0, -3, -10);


        this.floor = new RenderItem(this.gl, Assets.Floor.vertices, Assets.Floor.vertexIndices, Assets.Floor.texture, Assets.Floor.textureCoords);
        this.floor.setPosition(0, 0, -3);
        this.scene.push(this.floor);

        this.arm = new RenderItem(this.gl, Assets.Arm.vertices, Assets.Arm.vertexIndices, Assets.Arm.texture, Assets.Arm.textureCoords);
        this.arm.setPosition(0, 2, 0);
        this.scene.push(this.arm);



        this.gl.clearColor(0.8, 0.8, 1.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.initShader();





        //Now draw!
        setInterval(() => this.drawScene(), 15);

    }

    private initShader() {
        //Shader set-up
        this.cam.shaderProgram = this.gl.createProgram();
        var fragmentShader: WebGLShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        var vertexShader: WebGLShader = this.gl.createShader(this.gl.VERTEX_SHADER);

        //Vertex shader
        var vertexShaderSrc: string =
            "attribute vec3 aVertexPosition;" +
            "attribute vec2 aTextureCoord;" +
            "uniform mat4 uMVMatrix;" +
            "uniform mat4 uPMatrix;" +
            "varying vec2 vTextureCoord;" +
            "void main(void) {" +
            "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
            "vTextureCoord = aTextureCoord;" +
            "}";
        this.gl.shaderSource(vertexShader, vertexShaderSrc);
        this.gl.compileShader(vertexShader);

        //Fragment shader
        var fragmentShaderSrc: string =
            "varying highp vec2 vTextureCoord;" +
            "uniform sampler2D uSampler;" +
            "void main(void) {" +
            "gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));" +
            "}";
        this.gl.shaderSource(fragmentShader, fragmentShaderSrc);
        this.gl.compileShader(fragmentShader);


        //Attach
        this.gl.attachShader(this.cam.shaderProgram, vertexShader);
        this.gl.attachShader(this.cam.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.cam.shaderProgram);

        if (!this.gl.getProgramParameter(this.cam.shaderProgram, this.gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
            return;
        }
        this.gl.useProgram(this.cam.shaderProgram);

        //Attrib

        this.cam.vertexPositionAttribute = this.gl.getAttribLocation(this.cam.shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(this.cam.vertexPositionAttribute);

        this.cam.textureCoordAttribute = this.gl.getAttribLocation(this.cam.shaderProgram, "aTextureCoord");
        this.gl.enableVertexAttribArray(this.cam.textureCoordAttribute);
    }

    private drawScene(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        //View
        this.cam.Setup();
        this.arm.setPosition(this.currentState.arm - 3, 2, 0);

        //var translation = vec3.create();
        //vec3.set(translation, 0.0, 0.0, -6.0);
        //mat4.translate(this.mvMatrix, this.mvMatrix, translation);


        for (var i = 0; i < this.scene.length; ++i) {
            this.scene[i].draw(this.cam);
        }

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
    printPickList(elements: string[]): void {
    }
    printSystemOutput(output: string, participant?: string): void {
    }
    printDebugInfo(info: string): void {
    }
    printError(error: string, message?: string): void {
    }
}
