///<reference path="assets.ts" />>
///<reference path="World.ts"/>
///<reference path="lib/jquery.d.ts" />
///<reference path="lib/gl-matrix.d.ts" />>
///<reference path="RenderItem" />>

class GLWorld {
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
        var middle = (this.currentState.rowLength - 1) * 1.1 / 2;
        this.cam.setPosition(-middle, -3.5, -3.3);

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
        this.arm.setPosition(x * 1.1, 2.3, -y * 1.1);

        if (this.objects.containsKey(this.currentState.holding)) {
            var ri = this.objects.getValue(this.currentState.holding);
            ri.setPosition(x * 1.1, 1.8, -y * 1.1);
        }


        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        //View
        this.cam.Setup();

        //Draw scene
        for (var i = 0; i < this.scene.length; ++i) {
            this.scene[i].draw(this.cam);
        }

    }
}
