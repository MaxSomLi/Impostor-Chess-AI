const MC_M = 500, MAX_TURNS = 3, MIN = -300, VALS = [1, 5, 3, 3, 4, 10000, 9, -1, -5, -3, -3, -4, -10000, -9, 0];



function apply(m, board) {
    const [i1, j1, i2, j2] = m;
    board[i2][j2] = board[i1][j1];
    board[i1][j1] = NONE;
}

function evalBoard(board, p, moveIdx) {
    const moves = getLegalMoves(p, board);
    if (moves.length == 0) {
        return MIN;
    }
    if (moveIdx >= MAX_TURNS) {
        return 0;
    }
    let best = MIN;
    for (const move of moves) {
        let clone = structuredClone(board);
        apply(move, clone);
        const score = -evalBoard(clone, !p, moveIdx + INC);
        if (score > best) {
            best = score;
        }
    }
    return best;
}

function bestMove(board, p, moveIdx) {
    let lm = getLegalMoves(p, board), best = lm[0], bs = MIN;
    for (let m of lm) {
        let clone = structuredClone(board);
        apply(m, clone);
        let k = -evalBoard(clone, !p, moveIdx + INC);
        if (k > bs) {
            bs = k;
            best = m;
        }
    }
    return best;
}