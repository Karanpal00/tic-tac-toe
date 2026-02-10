// Cell function factory
function Cell() {
    const EMPTY = null;
    let value = EMPTY;

    const getValue = () => value;

    const setValue = (player)=> {
        value = player;
    }

    return  {
        getValue,
        setValue
    };
}

// GameBoard function factory
function GameBoard(size = 3) {
    const board = [];

    const rows = size;
    const cols = size;
    
    const initializeBoard = () => {
        for (let i = 0; i < rows; ++i) {
            board[i] = [];
            for (let j = 0; j < cols; ++j) {
                board[i].push(Cell());
            }
        }
    }
    
    initializeBoard();

    const getBoard = () => board;

    const markToken = (row, col, player) => {
        if (board[row][col].getValue() !== null) {
            return false;
        }
        board[row][col].setValue(player);
        
        return true;
    }

    return {
        initializeBoard,
        getBoard,
        markToken,
    }
}

// GameController function factory
function GameController(playerOneName="Player1", playerTwoName="player2") {

    const boardSize = 3;

    const players = [{
        name:playerOneName,
        token:'X',
        score: 0
    },
    {
        name:playerTwoName,
        token:'O',
        score: 0
    }];

    const board = GameBoard(boardSize);
    
    let currentPlayer = players[0];


    const getScores = () => players.map((p) => p.score);
    const getCurrentPlayer = () => currentPlayer;

    // switch player
    const switchPlayer = () => {
        currentPlayer = currentPlayer === players[0]? players[1] : players[0];
    }

    // get board values for the ui
    const getBoardValues = () => {
        return board.getBoard().map(row => row.map(cell => cell.getValue())).flat();
    }

    // check valid cells in the board
    const isValidCell = (row, col, boardSize) => {
        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
            return true;
        }
        return false;
    }

    // check if the board is full for draw
    const isBoardFull = () => {
        return board.getBoard().every( row =>
            row.every( cell => cell.getValue() !== null)
        );
    }

    // moves to feed the bot
    const movesAvailable = () => {
        const moves = [];

        board.getBoard().forEach((row, r) => {
            row.forEach((col, c) => {
                if (col.getValue() === null) {
                    moves.push([r, c]);
                }
            })
        });

        return moves;
    }

    // check if someone won
    const checkWin = (row, col) => {
        const token = currentPlayer.token;
        const grid = board.getBoard();
        const boardSize = grid.length;
        const directions = [[0,1], [1,0], [1,1], [1,-1]];

        for (const [dx, dy] of directions) {
            let count = 1;

            //pos direction
            for (let i = 1; i < boardSize; ++i) {
                const r = row+i*dx, c = col+i*dy;

                if (isValidCell(r, c, boardSize) && grid[r][c].getValue() === token) {
                    count++;
                } else break;
            }

            //neg direction
            for (let i = 1; i < boardSize; ++i) {
                const r = row-i*dx, c = col-i*dy;

                if (isValidCell(r, c, boardSize) && grid[r][c].getValue() === token) {
                    count++;
                } else break;
            }

            if (count >= boardSize) return true;
        }
        return false;
    }

    //play the game round 
    const playRound = (row, col) => {
        if (!board.markToken(row, col, currentPlayer.token)) {
            return null;
        }

        if (checkWin(row, col)) {
            currentPlayer.score++;
            return {winner : currentPlayer};
        } else if (isBoardFull()) {
            players[0].score++, players[1].score++;
            return {draw: true};
        }

        switchPlayer();

        return null;
    }

    //reset the game
    const reset = () => {
        board.initializeBoard();
        currentPlayer = players[0];
    }

    return {
        boardSize,
        getCurrentPlayer,
        getScores,
        playRound,
        reset,
        movesAvailable,
        getBoardValues,
    };
}

// Dom controller function factory
function DomController () {
    const gameContainer = document.querySelector('#game-board');
    const domGameBoard = document.querySelectorAll('.cell');
    const winScreen = document.querySelector('#win-screen');
    const restartBtn = document.querySelector('#restart-btn');

    const player1Name = document.querySelector('.player1-info');   
    const player1Score = document.querySelector('.score-1');
    const player2Name = document.querySelector('.player2-info');   
    const player2Score = document.querySelector('.score-2');

    const modal = document.querySelector('#get-player-info');
    const form = document.querySelector('form');
    const p2pRadioBtn = document.querySelector('#p2p');
    const p2bRadioBtn = document.querySelector('#p2b');
    const p2pInput = document.querySelector('.p2p')
    const p2bInput = document.querySelector('.p2b');
    const modalCancelBtn = document.querySelector('#cancel-btn');

    let isGameOver = null, game = null;

    const getPlayerInfo = () => {
        const data = new FormData(form);
        const formData = Object.fromEntries(data.entries());        

        if (formData.game_mode === 'p2b') {
            player1Name.textContent = formData.player1_p2b;
            player2Name.textContent = 'BOT';
        } else {
            player1Name.textContent = formData.player1;
            player2Name.textContent = formData.player2;
        }

        player1Score.textContent = '0';
        player2Score.textContent = '0';
        game = GameController(player1Name.textContent, player2Name.textContent);
        printBoard();
    }

    const handleRoundEnd = () => {
        if (isGameOver === null) {
            return;
        }   

        if ('winner' in isGameOver) {
            winScreen.textContent = `${isGameOver.winner.name}  Won!`;

        } else {
            winScreen.textContent = `It's a Draw Fuck both of you!`;
        }

        gameContainer.style.display = 'none';
        winScreen.style.display = 'block';

        let scores = game.getScores();
        if ((scores[0] >= 3 || scores[1] >= 3 ) && scores[0] !== scores[1]) {
            player1Score.textContent = scores[0];
            player2Score.textContent = scores[1];
            return;
            
        } 
        setTimeout(updateScreenRound, 2500);
    }
    const updateScreenRound = () => {
        gameContainer.style.display = 'grid';
        game.reset();
        printBoard();
        winScreen.style.display = 'none';
        let scores = game.getScores();
        player1Score.textContent = scores[0];
        player2Score.textContent = scores[1];
    }

    const uiReset = () => {
        modal.showModal();
        game.reset();
        gameContainer.style.display = 'grid';
        winScreen.style.display = 'none';
        printBoard();        
    }

    const printBoard = () => {
        const gridValues = game.getBoardValues();
        for(let i = 0; i < domGameBoard.length; ++i) {
            domGameBoard[i].textContent = gridValues[i] ?? '';
        }
    }

    const dropToken = (e) => {
        if (isGameOver) return;
        if (!game) return;
        if(!e.target.matches('.cell')) return;
        const index1D = e.target.dataset.index;
        const row = Math.floor(index1D/game.boardSize);
        const col = index1D%game.boardSize;

        isGameOver = game.playRound(row, col);
        handleRoundEnd();
        printBoard();
    }   
  
    const addEvents = () => {
        gameContainer.addEventListener('click', dropToken);
        restartBtn.addEventListener('click', uiReset);
        modal.addEventListener('close', ()=> {
            if(modal.returnValue === 'save') 
                getPlayerInfo();
            form.reset();
            p2bInput.style.display = 'none';
            p2pInput.style.display = 'none';
        })
        p2pRadioBtn.addEventListener('change', function() {
            if(this.checked) {
                p2pInput.style.display = 'flex';
                 p2bInput.style.display = 'none';
            }
        });
        p2bRadioBtn.addEventListener('change', function() {
            if(this.checked) {
                p2bInput.style.display = 'block';
                p2pInput.style.display = 'none';
            }
        });
        modalCancelBtn.addEventListener('click', () => {
            modal.close();
        })
    }    

    modal.showModal();
    addEvents();
}   

const dom = DomController();

/* 
Todo :-

1.Add win screen.   [Done]
2.Start with the modal taking player names or play against bot. 
3.Add functionality to restart the game.
    a.Once the restart button is clicked then the game should go to the modal.
4.Add tic-tac-toe bot.
5.Add 5 round, whoever wins 3 first wins.
*/
