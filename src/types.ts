export interface Config {
    orientation?: Color,
    onMovePiece?: (...args: Square[]) => boolean,
    onSelectPiece?: (piece: Piece, sq: Square) => boolean,
    onDeselectPiece?: () => boolean
}
export type Color = 'black' | 'white';
export type Piecetype = 'king' | '+rook' | 'rook' | '+bishop' | 'bishop' | 'gold' | '+silver' | 'silver' | 
                        '+knight' | 'knight' | '+lance' | 'lance' | '+pawn' | 'pawn';
export type Piecerole = 'king' | 'rook' | 'bishop' | 'gold' | 'silver' | 'knight' | 'lance' | 'pawn';
export type Coordinate = '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' |
                         '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' |
                         '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38' | '39' |
                         '41' | '42' | '43' | '44' | '45' | '46' | '47' | '48' | '49' |
                         '51' | '52' | '53' | '54' | '55' | '56' | '57' | '58' | '59' |
                         '61' | '62' | '63' | '64' | '65' | '66' | '67' | '68' | '69' |
                         '71' | '72' | '73' | '74' | '75' | '76' | '77' | '78' | '79' |
                         '81' | '82' | '83' | '84' | '85' | '86' | '87' | '88' | '89' |
                         '91' | '92' | '93' | '94' | '95' | '96' | '97' | '98' | '99';
/*
export type File = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Rank = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i';
export type SFEN = string;
*/
export interface Square {
    file: number,
    rank: number
};
export interface Piece {
    type: Piecetype,
    color: Color,
    promoted?: boolean
}
export interface Move {
    src: Square,
    dest: Square,
}
export interface Drop {
    piece: Piece,
    dest: Square
}
export interface Rect {
    x: number,
    y: number,
    width: number,
    height: number
}