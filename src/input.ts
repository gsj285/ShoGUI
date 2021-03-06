import { ShoGUI } from "./shogui";
import Board from "./board";
import GUI from "./gui";
import { Config, Arrow, Square, Piece, Color } from "./types";
import { isPosInsideRect, arrowEndpointsEqual, getPiececode, oppositeColor } from "./util";

interface DraggingPiece {
    piece: Piece,
    x: number,
    y: number
}

export default class Input {
    private board: Board;
    private gui: GUI;
    
    private currentArrow: Arrow|undefined;
    private arrows: Arrow[];
    private activeSquare: Square|undefined;
    private draggingPiece: DraggingPiece|undefined;

    constructor(private shogui: ShoGUI, private config: Config) {
        let self = this;

        this.board = shogui.getBoard();
        this.gui = shogui.getGui();

        this.arrows = [];

        function mouseMoveHandler(e: MouseEvent) {
            self.onMouseMove(e);
            window.requestAnimationFrame( () => shogui.refreshCanvas() );
        }

        this.gui.getCanvas().addEventListener('mousedown', function(e) {
            self.onMouseDown(e);
            window.addEventListener('mousemove', mouseMoveHandler);
            window.requestAnimationFrame( () => shogui.refreshCanvas() );
        });

        window.addEventListener('mouseup', function(e) {
            window.removeEventListener('mousemove', mouseMoveHandler);
            self.onMouseUp(e);
            window.requestAnimationFrame( () => shogui.refreshCanvas() );
        });

        this.gui.getCanvas().addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        window.addEventListener('load', () => window.requestAnimationFrame( () => shogui.refreshCanvas() ) );
    }

    public getActiveSquare() {
        return this.activeSquare;
    }

    public getDraggingPiece() {
        return this.draggingPiece;
    }

    public getCurrentArrow() {
        return this.currentArrow;
    }

    public getUserArrows() {
        return this.arrows;
    }

    private addArrow(arrow: Arrow) {
        this.arrows.push(arrow);
    }

    private removeArrow(arrow: Arrow): Arrow|undefined {
        let i = 0;
        for (let cmpArrow of this.arrows) {
            if ( arrowEndpointsEqual(cmpArrow, arrow) ) {
                this.arrows.splice(i, 1);
                return cmpArrow;
            }
            i++;
        }
        return undefined;
    }

    private clearArrows() {
        this.arrows = [];
    }

    private onMouseDown(event: MouseEvent) {
        if (this.currentArrow) {
            this.currentArrow = undefined;
        }
        
        if (event.button === 2) {
            this.onRightClick(event);
            return;
        }

        if (event.button !== 0) {
            return;
        }

        this.clearArrows();

        let rect = this.gui.getCanvas().getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        if (isPosInsideRect(this.gui.getBoardBounds(), mouseX, mouseY)) {
            let clickedSq: Square|undefined = this.gui.pos2Square(mouseX, mouseY);
                if (!clickedSq) return;
            let piece = this.board.getPiece(clickedSq);
            
            if (piece && (!this.activeSquare || this.activeSquare === clickedSq)) {
                this.activeSquare = clickedSq;
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            } else {
                if (this.activeSquare) {
                    if (this.activeSquare !== clickedSq) {
                        this.shogui.movePiece(this.activeSquare, clickedSq);
                        this.activeSquare = undefined;
                    }
                }
            }
        } else {
            this.draggingPiece = undefined;
            this.activeSquare = undefined;
        }

        for (let [key, value] of this.gui.getPlayerHandBounds()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let numPieces = this.board.getNumPiecesInHand(this.gui.getOrientation(), key);
                if (!numPieces || numPieces <= 0) {
                    return;
                }
                let piece = {type: key, color: this.gui.getOrientation()};
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            }
        }

        for (let [key, value] of this.gui.getOpponentHandBounds()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor: Color = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                let numPieces = this.board.getNumPiecesInHand(opponentColor, key);
                if (!numPieces || numPieces <= 0) {
                    return;
                }
                let piece = {type: key, color: opponentColor};
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            }
        }
    }

    private onMouseUp(event: MouseEvent) {
        let rect = this.gui.getCanvas().getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        if (isPosInsideRect(this.gui.getBoardBounds(), mouseX, mouseY)) {
            let sqOver = this.gui.pos2Square(mouseX, mouseY);
                if (!sqOver) return;
            if (this.draggingPiece && this.activeSquare) {
                if (this.activeSquare === sqOver) {
                    this.draggingPiece = undefined;
                } else {
                    this.shogui.movePiece(this.activeSquare, sqOver);
                    this.activeSquare = undefined;
                }
            } else if (this.draggingPiece && !this.activeSquare) {
                this.shogui.dropPiece(this.draggingPiece.piece.color, this.draggingPiece.piece.type, sqOver);
            }
        } else {
            this.activeSquare = undefined;
        }
        this.draggingPiece = undefined;

        if (event.button === 2) { // Right mouse button
            if (this.currentArrow) {
                let removedArrow = this.removeArrow(this.currentArrow);
                if (!removedArrow || removedArrow.style !== this.currentArrow.style) {
                    this.currentArrow.size += 0.5;
                    this.addArrow(this.currentArrow);
                }
            }
            this.currentArrow = undefined;
        }
    }

    private onMouseMove(event: MouseEvent) {
        let rect = this.gui.getCanvas().getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let hoverSq = this.gui.pos2Square(mouseX, mouseY);

        if ( this.draggingPiece) {
            this.draggingPiece.x = mouseX;
            this.draggingPiece.y = mouseY;
        }

        if (this.currentArrow) {
            if (hoverSq) {
                this.currentArrow.dest = hoverSq;
            } else {
                this.currentArrow.dest = undefined;
            }
        }
    }

    private onRightClick(event: MouseEvent) {
        let rect = this.gui.getCanvas().getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let clickedSq = this.gui.pos2Square(mouseX, mouseY);
        let arrowStyle = 'blue';
        if (this.config.arrowStyle) {
            arrowStyle = this.config.arrowStyle;
        }
        if (this.config.altArrowStyle && event.altKey) {
            arrowStyle = this.config.altArrowStyle;
        }
        if (this.config.ctrlArrowStyle && event.ctrlKey) {
            arrowStyle = this.config.ctrlArrowStyle;
        }

        if (clickedSq && !this.draggingPiece) {
            this.currentArrow = { style: arrowStyle, size: 3.5, src: clickedSq, dest: clickedSq };
        }

        for (let [key, value] of this.gui.getPlayerHandBounds()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let arrowSrc = getPiececode( {type: key, color: this.gui.getOrientation()});
                this.currentArrow = { style: arrowStyle, size: 3.5, src: arrowSrc };
            }
        }

        for (let [key, value] of this.gui.getOpponentHandBounds()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let arrowSrc = getPiececode( {type: key, color: oppositeColor(this.gui.getOrientation())} );
                this.currentArrow = { style: arrowStyle, size: 3.5, src: arrowSrc };
            }
        }

        this.draggingPiece = undefined;
        this.activeSquare = undefined;
    }
}