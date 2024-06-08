// tic tac toe


const gameboard = (function() {
    let board = [["", "", ""],
                 ["", "", ""],
                 ["", "", ""]];
    // how many cells are filled
    let filled = 0;

    const getBoard = () => board;
    const getFilled = () => filled;
    const add = (row, col, fighter) => {
        board[row][col] = fighter;
        filled += 1;
    };
    const clearBoard = () => {
        filled = 0;
        board = [["", "", ""],
                 ["", "", ""],
                 ["", "", ""]];
    };

    return {getFilled, add, clearBoard, getBoard};
})();

function createPlayer(name, fighter) {
    return {name, fighter};
}

const gameController = (function() {

    // settings control
    let fighterOne;
    let fighterTwo;
    let playerOne;
    let playerTwo;

    const getPlayers = () => ({playerOne, playerTwo});
    const setPlayers = () => {       
        playerOne = createPlayer(screenController.getPlayerNames().playerOneName.value, fighterOne);
        playerTwo = createPlayer(screenController.getPlayerNames().playerTwoName.value, fighterTwo);
    };
    const getFighters = () => ({fighterOne, fighterTwo});
    const setFighters = (fighter) => {
        if (fighter.dataset.player == "one") fighterOne = fighter.dataset.name;
        else fighterTwo = fighter.dataset.name;
    };

    const checkSettings = () => {
        if (screenController.getPlayerNames().playerOneName.checkValidity() 
        && screenController.getPlayerNames().playerTwoName.checkValidity() 
        && ( fighterOne != undefined && fighterTwo != undefined ) ) {
            setPlayers();
            setActivePlayer(playerOne);
            return true;
        } else {
            return false;
        }
    };

    let activePlayer;
    const setActivePlayer = (player) => activePlayer = player;
    const getActivePlayer = () => activePlayer;

    const switchPlayer = () => {
        activePlayer = activePlayer == playerOne ? playerTwo : playerOne;
    };

    const playRound = (cell) => {
        let row = cell.dataset.row;
        let col = cell.dataset.col;
        let gameover = false;

        // if cell is occupied
        if (gameboard.getBoard()[row][col] != "") return;

        // if cell not occupied, add to gameboard object and update display
        gameboard.add(row, col, getActivePlayer().fighter);
        screenController.updateGameboard(cell, getActivePlayer().fighter);

        // checking if game is over
        gameover = checkGameStatus(row, col);

        // switch player 
        switchPlayer();

        if (gameover == true) {
            // display winner 
            screenController.showGameover();
        }
    };

    const checkGameStatus = (row, col) => {
        // impossible to have 3 in a row until at least 5 choices are made
        if (gameboard.getFilled() < 5) return false;
    
        // retrieving most recent input data
        let fighter = getActivePlayer().fighter;
        let gameover = false;
        let vertical = 0;
        let horizontal = 0;
        let diagonalLeft = 0;
        let diagonalRight = 0;
    
        for(let i = 0; i < 3; i++) {
            if (gameboard.getBoard()[row][i] == fighter) vertical++;
            if (gameboard.getBoard()[i][col] == fighter) horizontal++;
            if (gameboard.getBoard()[i][i] == fighter) diagonalLeft++;
            if (gameboard.getBoard()[i][2 - i] == fighter) diagonalRight++;
        }
    
        if (vertical === 3 || horizontal === 3 || diagonalLeft === 3 || diagonalRight === 3) gameover = true;
        console.log(gameover);
        return gameover;
    };

    return {setFighters, checkSettings, getActivePlayer, playRound};
})();

// directly interacts with ui
const screenController = (function() {

    // settings
    const chooseFighter = (fighter) => {
        if (!fighter.classList.contains("chosen")) {
            fighter.classList.add("chosen"); 
            gameController.setFighters(fighter);
        }
    };

    const removeFighter = (fighter) => {
        if (fighter.classList.contains("chosen")) {
            fighter.classList.remove("chosen");
        }
    };

    const clickHandlerFighter = (e) => {
        const player = e.target.dataset.player;
        const name = e.target.dataset.name;

        fighters.forEach(fighter => {
            if ( (fighter == e.target) || (fighter.dataset.player != player && fighter.dataset.name != name) ) {
                chooseFighter(fighter);
            } else {
                removeFighter(fighter);
            }
        });
    };
    const fighters = document.querySelectorAll(".fighter-container > button");
    fighters.forEach(fighter => fighter.addEventListener("click", clickHandlerFighter));

    const playerOneName = document.querySelector("#player-one-name");
    const playerTwoName = document.querySelector("#player-two-name");
    const getPlayerNames = () => ({playerOneName, playerTwoName});

    const startGameButton = document.querySelector("#start-game-button");
    const gameSettingsWrapper = document.querySelector("#game-settings-wrapper");
    startGameButton.addEventListener("click", () => {
        if (gameController.checkSettings()) gameSettingsWrapper.style.display = "none";
    });


    // gameboard
    const clickHandlerBoard = (e) => {
        let cell = e.target;
        gameController.playRound(cell);
    };
    const cells = document.querySelectorAll("#game-container > div");
    cells.forEach(cell => cell.addEventListener("click", clickHandlerBoard));

    const updateGameboard = (cell, fighter) => {
        cell.textContent = fighter;
        // want to indicate whose turn it is
    };

    const showGameover = () => {
        // display winner
        alert("The winner is yadada");

        // disable board
        cells.forEach(cell => cell.removeEventListener("click", clickHandlerBoard));

        // offer new game
    };

    return {updateGameboard, showGameover, getPlayerNames};
})();