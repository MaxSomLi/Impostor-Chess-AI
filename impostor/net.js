const radio = document.getElementsByClassName("radio-group")[0];


let weights, biases, hiddenWeights1, hiddenBiases1, hiddenWeights2, hiddenBiases2;


(async () => {
    await fetch("./chess-model.json").then(res => res.json()).then(model => {
        weights = model.weights;
        biases = model.biases;
        hiddenWeights1 = model.hiddenWeights1;
        hiddenBiases1 = model.hiddenBiases1;
        hiddenWeights2 = model.hiddenWeights2;
        hiddenBiases2 = model.hiddenBiases2;
    });
    form.style.display = "flex";
    radio.style.display = "flex";
})();

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