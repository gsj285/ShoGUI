import ShoGUI from "./shogui";
import { Square } from "./types";
import { square2ShogiCoordinate, shogiCoordinate2Square } from "./util";

let shogui = new ShoGUI({onMovePiece: onPieceMove});

function onPieceMove(srcSq: Square, destSq: Square) {
    //shogui.addArrow({style: 'black', fromSq: srcSq, toSq: destSq});
    return true;
}