const MX = 2, MN = 0.1, EPS = 0.2, CT = 10000, LR = 0.01, GAMMA = 0.95;


let weights, hiddenWeights1, hiddenBiases1, hiddenWeights2, hiddenBiases2;




(async () => {
    await fetch("./chess-model.json").then(res => res.json()).then(model => {
        weights = model.weights;
        hiddenWeights1 = model.hiddenWeights1;
        hiddenBiases1 = model.hiddenBiases1;
        hiddenWeights2 = model.hiddenWeights2;
        hiddenBiases2 = model.hiddenBiases2;
    });
    canStart = true;
    for (let i = 0; i < CT; i++) {
        await new Promise(resolve => setTimeout(resolve, 0));
        await selfPlay();
        console.log(i);
    }
    downloadJSON({
        weights,
        hiddenWeights1,
        hiddenBiases1,
        hiddenWeights2,
        hiddenBiases2
    }, "chess-model.json"
);
})();


function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

function train(history) {
    const len = history.length;
    for (let ii = len - INC; ii >= 0; ii--) {
        const h = history[ii], p = h.player, board = h.board;
        let input = (p) ? board.flat().map(x => VALS[x]) : asBlack(board), h1 = new Array(TOTAL);
        for (let i = 0; i < TOTAL; i++) {
            let sum = hiddenBiases1[i];
            for (let j = 0; j < TOTAL; j++) {
                sum += input[j] * hiddenWeights1[j][i];
            }
            h1[i] = Math.tanh(sum);
        }
        let h2 = new Array(TOTAL);
        for (let i = 0; i < TOTAL; i++) {
            let sum = hiddenBiases2[i];
            for (let j = 0; j < TOTAL; j++) {
                sum += h1[j] * hiddenWeights2[j][i];
            }
            h2[i] = Math.tanh(sum);
        }
        let finalZ = 0;
        for (let i = 0; i < TOTAL; i++) {
            finalZ += h2[i] * weights[i];
        }
        const prediction = Math.tanh(finalZ), expected = ((p == history[len - INC].player) ? INC : -INC) * Math.pow(GAMMA, len - ii), error = prediction - expected, dOut = error * (INC - prediction * prediction);
        let dH2 = new Array(TOTAL);
        for (let i = 0; i < TOTAL; i++) {
            const errH2 = dOut * weights[i];
            dH2[i] = errH2 * (INC - h2[i] * h2[i]);
        }
        let dH1 = new Array(TOTAL);
        for (let i = 0; i < TOTAL; i++) {
            let errH1 = 0;
            for (let j = 0; j < TOTAL; j++) {
                errH1 += dH2[j] * hiddenWeights2[i][j];
            }
            dH1[i] = errH1 * (INC - h1[i] * h1[i]);
        }
        for (let i = 0; i < TOTAL; i++) {
            weights[i] -= LR * dOut * h2[i];
            weights[i] = Math.min(MX, Math.max(MN, weights[i]));
            hiddenBiases2[i] -= LR * dH2[i];
            hiddenBiases2[i] = Math.min(MX, Math.max(MN, hiddenBiases2[i]));
            for (let j = 0; j < TOTAL; j++) {
                hiddenWeights2[j][i] -= LR * dH2[i] * h1[j];
                hiddenWeights2[j][i] = Math.min(MX, Math.max(MN, hiddenWeights2[j][i]));
            }
            hiddenBiases1[i] -= LR * dH1[i];
            hiddenBiases1[i] = Math.min(MX, Math.max(MN, hiddenBiases1[i]));
            for (let j = 0; j < TOTAL; j++) {
                hiddenWeights1[j][i] -= LR * dH1[i] * input[j];
                hiddenWeights1[j][i] = Math.min(MX, Math.max(MN, hiddenWeights1[j][i]));
            }
        }
    }
}

async function selfPlay() {
    let mc = 0, curr = true, board = [
        [BLACK_ROOK, BLACK_KNIGHT_L, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING, BLACK_BISHOP, BLACK_KNIGHT_R, BLACK_ROOK],
        [BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN],
        [WHITE_ROOK, WHITE_KNIGHT_L, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING, WHITE_BISHOP, WHITE_KNIGHT_R, WHITE_ROOK]
    ], history = [];
    while (mc < MC_M) {
        const moves = getLegalMoves(curr, board);
        if (moves.length == 0) {
            train(history);
            return;
        }
        const move = chooseMove(board, moves, curr);
        history.push({
            board: structuredClone(board),
            player: curr
        });
        apply(move, board);
        curr = !curr;
        mc++;
    }
}

function asBlack(board) {
    let out = Array(TOTAL);
    for (let r = 0; r < NUM; r++) {
        for (let c = 0; c < NUM; c++) {
            out[r * NUM + c] = -VALS[board[ALM - r][ALM - c]];
        }
    }
    return out;
}

function forward(board, p) {
    let input = (p) ? board.flat().map(x => VALS[x]) : asBlack(board), h1 = new Array(TOTAL);
    for (let i = 0; i < TOTAL; i++) {
        let sum = hiddenBiases1[i];
        for (let j = 0; j < TOTAL; j++) {
            sum += input[j] * hiddenWeights1[j][i];
        }
        h1[i] = Math.tanh(sum);
    }
    let h2 = new Array(TOTAL);
    for (let i = 0; i < TOTAL; i++) {
        let sum = hiddenBiases2[i];
        for (let j = 0; j < TOTAL; j++) {
            sum += h1[j] * hiddenWeights2[j][i];
        }
        h2[i] = Math.tanh(sum);
    }
    let finalZ = 0;
    for (let i = 0; i < TOTAL; i++) {
        finalZ += h2[i] * weights[i];
    }
    return Math.tanh(finalZ);
}

function chooseMove(board, moves, p) {
    if (Math.random() < EPS) {
        return moves[Math.floor(Math.random() * moves.length)];
    }
    let b = structuredClone(board), best = moves[0];
    apply(best, b);
    let bestScore = forward(b, p);
    for (let m of moves) {
        b = structuredClone(board);
        apply(m, b);
        const score = forward(b, p);
        if (score > bestScore) {
            bestScore = score;
            best = m;
        }
    }
    return best;
}