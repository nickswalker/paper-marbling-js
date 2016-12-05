///<reference path="../marbling_renderer.ts"/>
///<reference path="cursor_overlay.ts"/>
///<reference path="keyboard.ts"/>
///<reference path="vector_field_overlay.ts"/>
///<reference path="../operations/linetine.ts"/>
interface MarblingUIDelegate {
    reset();
    applyOperations(operations: [Operation]);

}

class MarblingUI {

    toolsPane: ToolsPane;
    colorPane: ColorPane;
    _delegate: MarblingUIDelegate;
    private lastMouseCoord: Vec2;
    private mouseDownCoord: Vec2;
    private textPane: TextInputPane;
    private keyboardManager: MarblingKeyboardUI;
    private cursorOverlay: CursorOverlay;
    private vectorFieldOverlay: VectorFieldOverlay;

    constructor(container: HTMLElement, toolsContainer: HTMLElement, colorContainer: HTMLElement, textContainer: HTMLElement) {
        this.toolsPane = new ToolsPane(toolsContainer);
        this.colorPane = new ColorPane(colorContainer);
        this.textPane = new TextInputPane(textContainer);
        this.keyboardManager = new MarblingKeyboardUI();
        this.keyboardManager.keyboardDelegate = this;
        container.onmousedown = this.mouseDown.bind(this);
        container.onmouseup = this.mouseUp.bind(this);
        container.addEventListener("mousemove", this.mouseMove.bind(this));
        container.addEventListener("mousewheel", this.scroll.bind(this));
        this.cursorOverlay = new CursorOverlay(container);
        this.vectorFieldOverlay = new VectorFieldOverlay(container);
    }

    private didEnterInput(input: string) {
        this.keyboardManager.acceptingNewKeys = true;
        const parsed = <[Operation]>OperationsParser.parse(input);
        if (parsed != null && parsed.length > 0) {
            this._delegate.applyOperations(parsed);
        }

    }

    set delegate(delegate: MarblingUIDelegate) {
        this._delegate = delegate;
        this.toolsPane.delegate = delegate;
        this.colorPane.delegate = delegate;
    }

    setSize(width: number, height: number) {
        this.cursorOverlay.setSize(width, height);
        this.vectorFieldOverlay.setSize(width, height);
    }

    didPressShortcut(shortcut: KeyboardShortcut) {
        switch (shortcut) {
            case KeyboardShortcut.S:
                this.keyboardManager.acceptingNewKeys = false;
                this.textPane.getInput(this.didEnterInput.bind(this));
                return;
            case KeyboardShortcut.Plus:
                this.toolsPane.increaseToolParameter(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.Minus:
                this.toolsPane.decreaseToolParameter(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.R:
                if (confirm("Clear the composition?")) {
                    this._delegate.reset();
                }
                return;
            case KeyboardShortcut.B:
                const operation = new ChangeBaseColorOperation(this.colorPane.currentColor);
                this._delegate.applyOperations([operation]);
                return;
            case KeyboardShortcut.F:
                this.vectorFieldOverlay.toggleVisibility()
        }
    }

    private mouseDown(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.mouseDownCoord = new Vec2(x, y);
        switch (this.toolsPane.currentTool) {
            case Tool.Drop:
                break;
            case Tool.TineLine:
        }
    }

    private mouseUp(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        let operation: Operation;
        switch (this.toolsPane.currentTool) {
            case Tool.Drop:
                operation = new InkDropOperation(new Vec2(x, y), this.toolsPane.toolParameters[Tool.Drop].radius, this.colorPane.currentColor);
                this._delegate.applyOperations([operation]);
                break;
            case Tool.TineLine:
                const currentCoord = new Vec2(x, y);
                const direction = currentCoord.sub(this.mouseDownCoord);
                if (direction.length() > 0.03) {
                    operation = new LineTine(this.mouseDownCoord, direction, 1, 0);
                    this._delegate.applyOperations([operation]);
                }

                break;

        }
        this.lastMouseCoord = null;
        this.mouseDownCoord = null;
    }

    private mouseMove(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        const mouseCoords = new Vec2(x, y);
    }

    private scroll(e: MouseWheelEvent) {
        const delta = e.wheelDeltaY;
        if (delta > 0) {
            this.toolsPane.increaseToolParameter(this.toolsPane.currentTool);
        } else {
            this.toolsPane.decreaseToolParameter(this.toolsPane.currentTool);
        }
    }


}