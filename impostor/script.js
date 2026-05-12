const T = 800, winMsg = "SUCCESS!", loseMsg = "DEFEAT...", COLOR_SPLIT = 7, ALM = 7, HALF = 4, ALL = 16, DIFF_PIECES = 16, CS = 300, SS = 24, SIZE = 30, STARTX = 33, STARTY = 24, SRCS = ["white_pawn.png", "white_rook.png", "white_knight_l.png", "white_knight_r.png", "white_bishop.png", "white_king.png", "white_queen.png", "black_pawn.png", "black_rook.png", "black_knight_l.png", "black_knight_r.png", "black_bishop.png", "black_king.png", "black_queen.png"], NUM = 8, TOTAL = NUM * NUM, INC = 1, SETB = 2, WHITE_PAWN = 0, WHITE_ROOK = 1, WHITE_KNIGHT_L = 2, WHITE_KNIGHT_R = 3, WHITE_BISHOP = 4, WHITE_KING = 5, WHITE_QUEEN = 6, BLACK_PAWN = 7, BLACK_ROOK = 8, BLACK_KNIGHT_L = 9, BLACK_KNIGHT_R = 10, BLACK_BISHOP = 11, BLACK_KING = 12, BLACK_QUEEN = 13, NONE = 14;

let sound = true, bot, player = null, cx, cy, chosen = false, select, modifiable = true, currPlayer = true, actualBoard = [
    [BLACK_ROOK, BLACK_KNIGHT_L, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING, BLACK_BISHOP, BLACK_KNIGHT_R, BLACK_ROOK],
    [BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN, BLACK_PAWN],
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    [WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN, WHITE_PAWN],
    [WHITE_ROOK, WHITE_KNIGHT_L, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING, WHITE_BISHOP, WHITE_KNIGHT_R, WHITE_ROOK]
], visibleBoard = structuredClone(actualBoard), computerBoard = structuredClone(actualBoard), canStart = false, s = document.getElementById("start"), body = document.getElementById("body"), form = document.getElementById("form"), canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d"), pieceImages = [], pieceSizesX = [], pieceSizesY = [];



function drawPieces() {
    ctx.clearRect(0, 0, CS, CS);
    for (let i = 0; i < NUM; i++) {
        for (let j = 0; j < NUM; j++) {
            if (visibleBoard[i][j] < NONE) {
                ctx.drawImage(pieceImages[visibleBoard[i][j]], STARTX + j * SIZE, STARTY + i * SIZE, pieceSizesX[visibleBoard[i][j]], pieceSizesY[visibleBoard[i][j]]);
            }
        }
    }
}

function makeBoard(p, event) {
    event.preventDefault();
    player = p;
    for (let b of document.getElementsByName("bot")) {
        if (b.checked) {
            bot = b.id;
        }
    }
    if (bot == "roman") {
        makeMoveBot = makeMoveRoman;
    } else if (bot == "vira") {
        makeMoveBot = makeMoveVira;
    } else if (bot == "max") {
        makeMoveBot = makeMoveMax;
    } else {
        makeMoveBot = makeMoveKassandra;
    }
    drawPieces();
    form.style.display = "none";
    canvas.style.display = "initial";
    if (!player) {
        for (let i = 0; i < HALF; i++) {
            for (let j = 0; j < NUM; j++) {
                swapPiecesHelper(i, j, ALM - i, ALM - j, true, true);
            }
        }
    }
    for (let i = 0; i < DIFF_PIECES; i++) {
        let t = Math.floor(Math.random() * ALL), ix = i % NUM, iy = (i / NUM) >> 0, tx = t % NUM, ty = (t / NUM) >> 0;
        swapPiecesHelper(iy, ix, ty, tx, false, true);
    }
    drawPieces();
    s.style.display = "initial";
}

function mod() {
    s.style.display = "none";
    modifiable = false;
    canStart = true;
    if (!player) {
        makeMoveBot();
    }
}

function makeMove(i1, j1, i2, j2) {
    if (!isLegalMove(i1, j1, i2, j2, player, actualBoard)) {
        drawPieces();
        return;
    }
    updateBoards([i1, j1, i2, j2]);
    setTimeout(() => {
        makeMoveBot();
    }, T);
}

function updateBoards(m) {
    const [i1, j1, i2, j2] = m;
    visibleBoard[i2][j2] = visibleBoard[i1][j1];
    visibleBoard[i1][j1] = NONE;
    actualBoard[i2][j2] = actualBoard[i1][j1];
    actualBoard[i1][j1] = NONE;
    computerBoard[i2][j2] = computerBoard[i1][j1];
    computerBoard[i1][j1] = NONE;
    currPlayer = !currPlayer;
    drawPieces();
    if (sound) {
        const a = new Audio("sound.wav");
        a.play();
    }
}

function swapPiecesHelper(i1, j1, i2, j2, show, c) {
    if (show) {
        let tmp = visibleBoard[i1][j1];
        visibleBoard[i1][j1] = visibleBoard[i2][j2];
        visibleBoard[i2][j2] = tmp;
    }
    if (c) {
        let tmp = computerBoard[i1][j1];
        computerBoard[i1][j1] = computerBoard[i2][j2];
        computerBoard[i2][j2] = tmp;
    }
    let tmp = actualBoard[i1][j1];
    actualBoard[i1][j1] = actualBoard[i2][j2];
    actualBoard[i2][j2] = tmp;
    drawPieces();
}

function highlightMoves(x, y) {
    for (let i = 0; i < NUM; i++) {
        for (let j = 0; j < NUM; j++) {
            if (isLegalMove(y, x, i, j, player, actualBoard)) {
                ctx.drawImage(select, (INC + j) * SIZE, (INC + i) * SIZE, SIZE, SIZE);
            }
        }
    }
}

function isEnd(p, board) {
    let search = BLACK_KING;
    if (p) {
        search = WHITE_KING;
    }
    for (let i = 0; i < NUM; i++) {
        for (let j = 0; j < NUM; j++) {
            if (board[i][j] == search) {
                return false;
            }
        }
    }
    return true;
}

function isLegalMove(i1, j1, i2, j2, p, board) {
    if (!canStart || isEnd(p, board) || p != currPlayer) {
        return false;
    }
    let start = board[i1][j1], end = board[i2][j2];
    if (start == NONE || (start < COLOR_SPLIT && end < COLOR_SPLIT) || (end != NONE && start >= COLOR_SPLIT && end >= COLOR_SPLIT) || (p && start >= COLOR_SPLIT) || (!p && start < COLOR_SPLIT)) {
        return false;
    }
    if (start == BLACK_PAWN || start == WHITE_PAWN) {
        let dir = (player == currPlayer) ? -INC : INC;
        return j1 == j2 && i2 == i1 + dir || (Math.abs(j1 - j2) == INC && i2 == i1 + dir && end != NONE);
    }
    if (start == WHITE_BISHOP || start == BLACK_BISHOP) {
        return bishopMove(i1, j1, i2, j2, board);
    }
    if (start == BLACK_ROOK || start == WHITE_ROOK) {
        return rookMove(i1, j1, i2, j2, board);
    }
    if (start == BLACK_KING || start == WHITE_KING) {
        return Math.abs(i1 - i2) <= INC && Math.abs(j1 - j2) <= INC;
    }
    if (start == WHITE_KNIGHT_L || start == WHITE_KNIGHT_R || start == BLACK_KNIGHT_L || start == BLACK_KNIGHT_R) {
        let i = Math.abs(i1 - i2), j = Math.abs(j1 - j2);
        return (i == SETB && j == INC) || (j == SETB && i == INC);
    }
    return bishopMove(i1, j1, i2, j2, board) || rookMove(i1, j1, i2, j2, board);
}

function bishopMove(i1, j1, i2, j2, board) {
    if (Math.abs(i1 - i2) != Math.abs(j1 - j2)) {
        return false;
    }
    let stepI = (i2 > i1) ? INC : -INC, stepJ = (j2 > j1) ? INC : -INC;
    for (let i = i1 + stepI, j = j1 + stepJ; i != i2; i += stepI) {
        if (board[i][j] != NONE) {
            return false;
        }
        j += stepJ;
    }
    return true;
}

function rookMove(i1, j1, i2, j2, board) {
    if (i1 != i2 && j1 != j2) {
        return false;
    }
    if (i1 == i2) {
        let js = j1 + INC, je = j2;
        if (j1 > j2) {
            js = j2 + INC;
            je = j1;
        }
        for (let j = js; j < je; j++) {
            if (board[i1][j] != NONE) {
                return false;
            }
        }
    } else {
        let is = i1 + INC, ie = i2;
        if (i1 > i2) {
            is = i2 + INC;
            ie = i1;
        }
        for (let i = is; i < ie; i++) {
            if (board[i][j1] != NONE) {
                return false;
            }
        }
    }
    return true;
}

function getLegalMoves(p, board) {
    let pm = [];
    for (let i1 = 0; i1 < NUM; i1++) {
        for (let j1 = 0; j1 < NUM; j1++) {
            for (let i2 = 0; i2 < NUM; i2++) {
                for (let j2 = 0; j2 < NUM; j2++) {
                    if (isLegalMove(i1, j1, i2, j2, p, board)) {
                        pm.push([i1, j1, i2, j2]);
                    }
                }
            }
        }
    }
    return pm;
}

function checkLoss(pm, msg) {
    if (pm.length == 0) {
        visibleBoard = structuredClone(actualBoard);
        drawPieces();
        if (sound) {
            const a = new Audio("win.wav");
            a.play();
        }
        setTimeout(() => {
            canvas.style.top = "60px";
            document.getElementsByTagName("p")[0].innerHTML = msg;
        }, T);
        return;
    }
}

function makeMoveRoman() {
    let pm = getLegalMoves(!player, actualBoard);
    checkLoss(pm, winMsg);
    if (pm.length > 0) {
        let time = new Date().getMilliseconds(), c = pm[time % pm.length];
        updateBoards(c);
        pm = getLegalMoves(player, actualBoard);
        checkLoss(pm, loseMsg);
    }
}

function makeMoveVira() {
    let pm = getLegalMoves(!player, computerBoard);
    checkLoss(pm, winMsg);
    if (pm.length > 0) {
        let b = chooseMove(computerBoard, pm, !player);
        updateBoards(b);
        pm = getLegalMoves(player, actualBoard);
        checkLoss(pm, loseMsg);
    }
}

function makeMoveMax() {
    let pm = getLegalMoves(!player, computerBoard);
    checkLoss(pm, winMsg);
    if (pm.length > 0) {
        let b = bestMove(computerBoard, !player, 0);
        updateBoards(b);
        pm = getLegalMoves(player, actualBoard);
        checkLoss(pm, loseMsg);
    }
}

function makeMoveKassandra() {
    let pm = getLegalMoves(!player, actualBoard);
    checkLoss(pm, winMsg);
    if (pm.length > 0) {
        let b = chooseMove(actualBoard, pm, !player);
        updateBoards(b);
        pm = getLegalMoves(player, actualBoard);
        checkLoss(pm, loseMsg);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let loaded = 0;
    SRCS.forEach((sr, index) => {
        let img = new Image();
        img.src = sr;
        img.onload = function(e) {
            pieceImages[index] = img;
            loaded++;
            if (loaded == NONE) {
                let r = SS / pieceImages[WHITE_QUEEN].width;
                pieceImages.forEach((img, index) => {
                    pieceSizesX[index] = img.width * r;
                    pieceSizesY[index] = img.height * r;
                });
                select = new Image();
                select.src = "select.png";
                canvas.addEventListener("mousedown", (event) => {
                    let x = (((event.clientX - canvas.getBoundingClientRect().left) / SIZE) >> 0) - INC, y = (((event.clientY - canvas.getBoundingClientRect().top) / SIZE) >> 0) - INC;
                    if (x >= 0 && y >= 0 && x < NUM && y < NUM) {
                        if (modifiable) {
                            if (chosen && !((visibleBoard[y][x] >= NONE || (player == (visibleBoard[y][x] >= COLOR_SPLIT)) || visibleBoard[cy][cx] >= NONE  || (player == (visibleBoard[cy][cx] >= COLOR_SPLIT))))) {
                                swapPiecesHelper(cy, cx, y, x, true, false);
                                if (sound) {
                                    const a = new Audio("sound.wav");
                                    a.play();
                                }
                                drawPieces();
                            } else {
                                cx = x;
                                cy = y;
                                drawPieces();
                            }
                        } else {
                            if (chosen) {
                                makeMove(cy, cx, y, x);
                            } else {
                                cx = x;
                                cy = y;
                                highlightMoves(x, y);
                            }
                        }
                        chosen = !chosen;
                    }
                });
            }
        }
    });
});