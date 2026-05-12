const TIMES = 100;

let wins = 0, kass = false, rom = !kass, f, board;

function evalA() {
    for (let ii = 0; ii < TIMES; ii++) {
        f = true;
        let mc = 0, curr = true;
        board = [
            [BLACK_ROOK, BLACK_KNIGHT_L, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING, BLACK_BISHOP, BLACK_KNIGHT_R, BLACK_ROOK],
            [BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN],
            [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
            [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
            [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
            [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
            [WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN],
            [WHITE_ROOK, WHITE_KNIGHT_L, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING, WHITE_BISHOP, WHITE_KNIGHT_R, WHITE_ROOK]
        ];
        while (f && mc < MC_M) {
            if (curr == kass) {
                let pm = getLegalMoves(kass, board);
                if (pm.length > 0) {
                    let b = chooseMove(board, pm, kass);
                    apply(b, board);
                } else {
                    f = false;
                }
            } else {
                let pm = getLegalMoves(rom, board);
                if (pm.length > 0) {
                    let b = pm[Math.floor(Math.random() * pm.length)];
                    apply(b, board);
                } else {
                    wins++;
                    f = false;
                }
            }
            curr = !curr;
            mc++;
        }
        console.log(ii, wins, mc);
    }
}