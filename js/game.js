// ============================================
// GAME MODULE - Game Logic & Calculations
// ============================================

const Game = (() => {
    let gameState = {
        title: '',
        startingPoints: 501,
        currentRound: 0,
        players: [],
        currentPlayerIndex: 0,
        finishedOrder: [],
        history: []
    };

    const DART_BOARD = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    const MAX_CHECKOUT_OPTIONS = 20; // Show max 20 possible checkouts

    return {
        initGame(title, startingPoints, playerNames) {
            gameState = {
                title,
                startingPoints,
                currentRound: 0,
                players: playerNames.map(name => ({
                    name,
                    startingPoints: startingPoints,
                    currentPoints: startingPoints,
                    throws: [], // Array statt Counter
                    finished: false,
                    finishedRank: null
                })),
                currentPlayerIndex: 0,
                finishedOrder: [],
                history: []
            };
        },

        getCurrentPlayer() {
            return gameState.players[gameState.currentPlayerIndex];
        },

        getCurrentPlayerIndex() {
            return gameState.currentPlayerIndex;
        },

        getGameState() {
            return gameState;
        },

        getPlayersForDisplay() {
            return gameState.players.map(p => ({
                name: p.name,
                currentPoints: p.currentPoints,
                status: p.finished ? 'finished' : 'active',
                throws: p.throws.length // Länge des Arrays
            }));
        },

        submitThrow(totalPoints, throwsDetails = []) {
            const player = this.getCurrentPlayer();

            // Check for bust
            if (player.currentPoints - totalPoints < 0) {
                return { success: false, message: '❌ BUST! Punkte nicht abgezogen.' };
            }

            // Deduct points
            player.currentPoints -= totalPoints;

            // Store throw data with details
            throwsDetails.forEach(t => {
                player.throws.push({
                    baseValue: t.baseValue,
                    multiplier: t.multiplier,
                    totalPoints: t.totalPoints,
                    timestamp: new Date()
                });
            });

            // Check if finished
            if (player.currentPoints === 0) {
                player.finished = true;
                player.finishedRank = gameState.finishedOrder.length + 1;
                gameState.finishedOrder.push(player.name);

                // Check if game is over
                const activePlayers = gameState.players.filter(p => !p.finished).length;
                if (activePlayers === 0) {
                    return { success: true, message: `🏆 ${player.name} gewinnt!`, gameOver: true };
                }
                return { success: true, message: `🏆 ${player.name} fertig! Platz ${player.finishedRank}`, playerFinished: true };
            }

            return { success: true, message: `✓ ${totalPoints} Punkte abgezogen. ${player.currentPoints} übrig.` };
        },

        nextPlayer() {
            let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
            let attempts = 0;

            while (gameState.players[nextIndex].finished && attempts < gameState.players.length) {
                nextIndex = (nextIndex + 1) % gameState.players.length;
                attempts++;
            }

            gameState.currentPlayerIndex = nextIndex;
        },

        getCurrentPlayerName() {
            return this.getCurrentPlayer().name;
        },

        calculateCheckouts(remainingPoints) {
            if (remainingPoints <= 0 || remainingPoints > 170) {
                return [];
            }

            const possibleCheckouts = [];
            const BULLET_BOARD = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

            // Try all possible combinations of 3 darts
            for (let i = 0; i < BULLET_BOARD.length; i++) {
                // First dart - try all multipliers (1, 2, 3)
                for (let mult1 = 1; mult1 <= 3; mult1++) {
                    const first = BULLET_BOARD[i] * mult1;
                    if (first >= remainingPoints) continue;

                    for (let j = 0; j < BULLET_BOARD.length; j++) {
                        // Second dart
                        for (let mult2 = 1; mult2 <= 3; mult2++) {
                            const second = BULLET_BOARD[j] * mult2;
                            if (first + second >= remainingPoints) continue;

                            for (let k = 0; k < BULLET_BOARD.length; k++) {
                                // Third dart - must be a double
                                const third = BULLET_BOARD[k] * 2;
                                if (first + second + third === remainingPoints) {
                                    const checkoutStr = `${this.formatDart(BULLET_BOARD[i], mult1)}-${this.formatDart(BULLET_BOARD[j], mult2)}-D${BULLET_BOARD[k]}`;
                                    if (!possibleCheckouts.includes(checkoutStr)) {
                                        possibleCheckouts.push(checkoutStr);
                                    }
                                }
                            }
                        }
                    }
                }

                // Also try bullseye finishes
                if (remainingPoints - first === 50) {
                    const checkoutStr = `D${BULLET_BOARD[i]}-50`;
                    if (!possibleCheckouts.includes(checkoutStr)) {
                        possibleCheckouts.push(checkoutStr);
                    }
                }
            }

            return possibleCheckouts.slice(0, MAX_CHECKOUT_OPTIONS);
        },

        formatDart(num, mult) {
            if (mult === 1) return `${num}`;
            if (mult === 2) return `D${num}`;
            if (mult === 3) return `T${num}`;
            return `${num}`;
        },

        getFinishedOrder() {
            return gameState.finishedOrder;
        },

        getAllPlayers() {
            return gameState.players;
        },

        endGame() {
            // Add remaining players to finished order
            gameState.players.forEach(player => {
                if (!player.finished) {
                    player.finished = true;
                    player.finishedRank = gameState.finishedOrder.length + 1;
                    gameState.finishedOrder.push(player.name);
                }
            });

            const finalGame = {
                title: gameState.title,
                startingPoints: gameState.startingPoints,
                players: gameState.players.map(p => ({
                    name: p.name,
                    finalPoints: p.currentPoints,
                    throws: p.throws,
                    rank: p.finishedRank
                })),
                finishedOrder: gameState.finishedOrder,
                date: new Date().toISOString()
            };

            Storage.saveGame(finalGame);
            return finalGame;
        }
    };
})();