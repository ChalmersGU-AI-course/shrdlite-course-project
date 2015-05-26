///<reference path="assets.ts" />>
///<reference path="World.ts"/>
///<reference path="lib/jquery.d.ts" />
///<reference path="lib/gl-matrix.d.ts" />>
///<reference path="RenderItem" />>

class GLGWorld implements World {
    protected gl: WebGLRenderingContext;
    protected cam: Camera;

    private scene: Array<RenderItem>;
    private arm: RenderItem;
    private objects: collections.Dictionary<string, RenderItem>;

    constructor(
        public currentState: WorldState,
        canvas: HTMLCanvasElement
        ) {
        this.objects = new collections.Dictionary<string, RenderItem>();

        try {
            this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        } catch (e) {
            alert(e);
            this.gl = undefined;
        }
        this.gl.hint(this.gl.GENERATE_MIPMAP_HINT, this.gl.NICEST);

        this.scene = new Array<RenderItem>();
        this.cam = new Camera(this.gl, canvas);
        var middle = (this.currentState.rowLength - 0.5) * 1.1 / 2;
        this.cam.setPosition(-middle, -4, -5);


        var floor = new RenderItem(this.gl, Assets.Floor, Assets.floorTexture);
        floor.setPosition(0, -0.1, 0);
        this.scene.push(floor);

        this.arm = new RenderItem(this.gl, Assets.Arm, Assets.woodTexture);
        this.scene.push(this.arm);

        for (var i = 0; i < currentState.stacks.length; ++i) {
            for (var j = 0; j < currentState.stacks[i].length; ++j) {
                var obj = currentState.objects[currentState.stacks[i][j]];
                var tex = undefined;
                var asset = undefined;

                switch (obj.color) {
                    case "yellow":
                        tex = Assets.yellowWood;
                        break;
                    case "red":
                        tex = Assets.redWood;
                        break;
                    case "blue":
                        tex = Assets.blueWood;
                        break;
                    case "white":
                        tex = Assets.whiteWood;
                        break;
                    case "black":
                        tex = Assets.blackWood;
                        break;
                    case "green":
                        tex = Assets.greenWood;
                        break;
                    default:
                        break;
                }

                switch (obj.form) {
                    case "box":
                        asset = obj.size == "large" ? Assets.BoxLarge : Assets.BoxSmall;
                        break;
                    case "ball":
                        asset = obj.size == "large" ? Assets.Balllarge : Assets.BallSmall;
                        break;
                    case "table":
                        asset = obj.size == "large" ? Assets.TableLarge : Assets.TableSmall;
                        break;
                    case "brick":
                        asset = obj.size == "large" ? Assets.BrickLarge : Assets.BrickSmall;
                        break;
                    case "plank":
                        asset = obj.size == "large" ? Assets.PlankLarge : Assets.PlankSmall;
                        break;
                    case "pyramid":
                        asset = obj.size == "large" ? Assets.PyramidLarge : Assets.PyramidSmall;
                        break;
                    default:
                        break;
                }

                if (asset != undefined && tex != undefined) {
                    var box = new RenderItem(this.gl, asset, tex);
                    box.setPosition(i, j, 0);
                    this.scene.push(box);
                    this.objects.setValue(currentState.stacks[i][j], box);
                }
            }
        }

        this.gl.clearColor(0.8, 0.8, 1.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        this.initShader();



        //this.test();
        //this.test2();

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
        //Update logic

        for (var i = 0; i < this.currentState.stacks.length; ++i) {
            var h = Assets.Floor.stackHeight;
            for (var j = 0; j < this.currentState.stacks[i].length; ++j) {
                var name: string = this.currentState.stacks[i][j];
                if (this.objects.containsKey(name)) {
                    var ri: RenderItem = this.objects.getValue(name);
                    var x = i % this.currentState.rowLength;
                    var y = Math.floor(i / this.currentState.rowLength);
                    ri.setPosition(x * 1.1, h, -y * 1.1);
                    h += ri.height;
                }
            }
        }
        //Holding
        var x = this.currentState.arm % this.currentState.rowLength;
        var y = Math.floor(this.currentState.arm / this.currentState.rowLength);
        this.arm.setPosition(x * 1.1, 3, -y * 1.1);

        if (this.objects.containsKey(this.currentState.holding)) {
            var ri = this.objects.getValue(this.currentState.holding);
            ri.setPosition(x * 1.1, 2.5, -y * 1.1);
        }


        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        //View
        this.cam.Setup();
        

        //var translation = vec3.create();
        //vec3.set(translation, 0.0, 0.0, -6.0);
        //mat4.translate(this.mvMatrix, this.mvMatrix, translation);


        for (var i = 0; i < this.scene.length; ++i) {
            this.scene[i].draw(this.cam);
        }

    }


















    private test2() {
        var vertices = [

            // Front face
            -0.1, 0, 0.1,
            0.1, 0, 0.1,
            0.1, 0.35, 0.1,
            -0.1, 0.35, 0.1,

            -0.1, 0, -0.1,
            -0.1, 0.35, -0.1,
            0.1, 0.35, -0.1,
            0.1, 0, -0.1,

            // Top face
            -0.1, 0.35, -0.1,
            -0.1, 0.35, 0.1,
            0.1, 0.35, 0.1,
            0.1, 0.35, -0.1,

            // Bottom face
            -0.1, 0, -0.1,
            0.1, 0, -0.1,
            0.1, 0, 0.1,
            -0.1, 0, 0.1,

        // Right face
            0.1, 0, -0.1,
            0.1, 0.35, -0.1,
            0.1, 0.35, 0.1,
            0.1, 0, 0.1,

            // Left face
            -0.1, 0, -0.1,
            -0.1, 0, 0.1,
            -0.1, 0.35, 0.1,
            -0.1, 0.35, -0.1
        ];

        var vertexIndices = [
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // back
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23    // left
        ];
        
        for (var i = 0; i < vertices.length; i += 3) {
            vertices[i] -= 0.3;
        }
        for (var i = 1; i < vertices.length; i += 3) {

        }
        for (var i = 2; i < vertices.length; i += 3) {
            vertices[i] += 0.3;
        }

        for (var i = 0; i < vertexIndices.length; ++i) {
            vertexIndices[i] += 24 * 0;
        }

        var k = "";
        var l = "";
        for (var i = 0; i < vertices.length; ++i) {
            k += ',' + vertices[i].toFixed(2);
        }

        for (var i = 0; i < vertexIndices.length; ++i) {
            l += ',' + vertexIndices[i];
        }
    }

    private test() {
        var radius = 0.15;
        var latitudeBands = 12;
        var longitudeBands = 12;
        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];
        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta + radius;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);
                vertexPositionData.push(radius * x);
                vertexPositionData.push(radius * y);
                vertexPositionData.push(radius * z);
            }
        }

        var indexData = [];
        for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);

                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }

        var k: string = "";
        for (var i = 0; i < textureCoordData.length; ++i) {
            k += ',' + textureCoordData[i].toFixed(5);
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
