// ============================================
// APP MODULE - Main Application Controller
// ============================================

const App = (() => {
    const MAX_PLAYERS = 4;

    function navigateTo(page) {
        //Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show requested page
        document.getElementById(page + 'Page').classList.add('active');

        // Update header nav
        updateHeaderNav(page);

        // Initialize page-specific logic
        if (page === 'setup') {
            initSetupPage();
        } else if (page === 'history') {
            initHistoryPage();
        }
    }

    function updateHeaderNav(currentPage) {
        const nav = document.getElementById('headerNav');
        nav.innerHTML = '';

        if (currentPage !== 'home') {
            const homeBtn = document.createElement('button');
            homeBtn.className = 'btn btn-ghost';
            homeBtn.textContent = '🏠 Home';
            homeBtn.onclick = () => navigateTo('home');
            nav.appendChild(homeBtn);
        }
    }

    function initSetupPage() {
        const playersContainer = document.getElementById('playersContainer');
        playersContainer.innerHTML = '';

        // Add 2 default players
        addPlayerField();
        addPlayerField();

        // Handle custom points
        document.getElementById('startingPoints').addEventListener('change', function (e) {
            const customGroup = document.getElementById('customPointsGroup');
            if (e.target.value === 'custom') {
                customGroup.style.display = 'flex';
                document.getElementById('customPoints').focus();
            } else {
                customGroup.style.display = 'none';
            }
        });

        // Add player button
        document.getElementById('addPlayerBtn').addEventListener('click', addPlayerField);

        // Form submission
        document.getElementById('gameSetupForm').addEventListener('submit', function (e) {
            e.preventDefault();
            startGameFromSetup();
        });
    }

    function addPlayerField() {
        const container = document.getElementById('playersContainer');
        const count = container.children.length + 1;

        if (count > MAX_PLAYERS) {
            alert('Maximum 4 Spieler!');
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '0.5rem';
        wrapper.style.alignItems = 'flex-end';
        wrapper.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
                <input type="text" placeholder="Spielername" class="player-input" style="width: 100%;" required>
            </div>
            <button type="button" class="btn btn-danger" style="padding: 0.75rem 1rem; height: fit-content;" onclick="this.parentElement.remove();">✕</button>
        `;
        container.appendChild(wrapper);
    }

    function startGameFromSetup() {
        const title = document.getElementById('gameTitle').value || 'Game';
        let startingPoints = parseInt(document.getElementById('startingPoints').value);

        if (isNaN(startingPoints)) {
            const customPoints = parseInt(document.getElementById('customPoints').value);
            if (isNaN(customPoints) || customPoints < 1) {
                alert('Bitte geben Sie gültige Punkte ein!');
                return;
            }
            startingPoints = customPoints;
        }

        const playerInputs = Array.from(document.querySelectorAll('.player-input'));
        const playerNames = playerInputs
            .map(input => input.value.trim())
            .filter(name => name !== '');

        if (playerNames.length < 2) {
            alert('Mindestens 2 Spieler erforderlich!');
            return;
        }

        // Initialize game
        Game.initGame(title, startingPoints, playerNames);
        initGamePage();
        navigateTo('game');
    }

    function initGamePage() {
        // Initialize dart board
        UI.initDartBoard(onThrowSelected);

        // Initialize multipliers
        UI.initMultipliers(onMultiplierChanged);

        // Render initial state
        updateGameDisplay();

        // Confirm button
        document.getElementById('confirmThrowBtn').addEventListener('click', confirmThrow);
    }

    let selectedThrows = [];

    function onThrowSelected(throws) {
        selectedThrows = throws;
    }

    function onMultiplierChanged(mult) {
        // Update UI if needed
    }

    function updateGameDisplay() {
        const player = Game.getCurrentPlayer();
        
        // Update header for both mobile and desktop
        const mobileHeader = document.getElementById('currentPlayerDisplay');
        const desktopHeader = document.getElementById('currentPlayerDisplay2');
        if (mobileHeader) mobileHeader.textContent = player.name;
        if (desktopHeader) desktopHeader.textContent = player.name;

        // Update player cards
        const players = Game.getPlayersForDisplay();
        UI.renderPlayerCards(players, Game.getCurrentPlayerIndex());

        // Calculate and show checkouts
        if (player.currentPoints > 0 && player.currentPoints <= 170) {
            const checkouts = Game.calculateCheckouts(player.currentPoints);
            UI.showCheckoutInfo(checkouts);
        } else {
            UI.showCheckoutInfo([]);
        }

        // Show throws history for current player
        const playerData = Game.getAllPlayers()[Game.getCurrentPlayerIndex()];
        if (playerData && playerData.throws && playerData.throws.length > 0) {
            UI.updateThrowsHistory(playerData.throws);
        } else {
            UI.updateThrowsHistory([]);
        }

        UI.hideMessage();
    }

    function confirmThrow() {
        if (selectedThrows.length === 0) return;

        const totalPoints = UI.getTotalPoints();
        
        // Convert selectedThrows array to throw data with full details
        const throwsDetails = selectedThrows.map(t => ({
            baseValue: t.baseValue,
            multiplier: t.multiplier,
            totalPoints: t.totalPoints
        }));
        
        // Pass full throw details to submitThrow
        const result = Game.submitThrow(totalPoints, throwsDetails);

        if (!result.success) {
            UI.showMessage(result.message, 'error');
            return;
        }

        UI.showMessage(result.message, 'success');
        
        // Clear throw selection for next round
        UI.resetThrows();

        if (result.gameOver) {
            setTimeout(() => {
                showGameResults();
            }, 2000);
        } else if (result.playerFinished) {
            setTimeout(() => {
                Game.nextPlayer();
                updateGameDisplay();
            }, 1500);
        } else {
            setTimeout(() => {
                Game.nextPlayer();
                updateGameDisplay();
            }, 1000);
        }
    }

    function showGameResults() {
        const finishedOrder = Game.getFinishedOrder();
        const allPlayers = Game.getAllPlayers();
        
        const resultsList = document.getElementById('resultsList');
        resultsList.innerHTML = '';

        finishedOrder.forEach((playerName, index) => {
            const player = allPlayers.find(p => p.name === playerName);
            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
            
            const div = document.createElement('div');
            div.className = 'card';
            const isWinner = index === 0;
            if (isWinner) {
                div.style.background = 'rgba(16, 185, 129, 0.2)';
                div.style.borderColor = 'var(--green-success)';
            }
            div.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${medals[index] || '❌'}</div>
                    <h3 style="margin: 0 0 0.5rem 0; ${isWinner ? 'color: var(--green-success);' : ''}">${playerName}</h3>
                    <p style="color: var(--gray-light); margin-bottom: 0.5rem;">Platz ${index + 1}</p>
                    <p style="color: var(--gray-light); font-size: 0.9rem;">Punkte übrig: ${player.currentPoints}</p>
                    <p style="color: var(--gray-light); font-size: 0.9rem;">Würfe: ${player.throws}</p>
                </div>
            `;
            resultsList.appendChild(div);
        });

        navigateTo('results');
    }

    function endGame() {
        if (confirm('Spiel wirklich beenden?')) {
            Game.endGame();
            showGameResults();
        }
    }

    function initHistoryPage() {
        const games = Storage.getAllGames();
        const container = document.getElementById('historyContainer');
        container.innerHTML = '';

        if (games.length === 0) {
            const noGames = document.createElement('p');
            noGames.style.textAlign = 'center';
            noGames.style.color = 'var(--gray-light)';
            noGames.textContent = 'Noch keine Spiele gespeichert';
            container.appendChild(noGames);
            return;
        }

        games.reverse().forEach((game, index) => {
            const date = new Date(game.savedAt || game.date).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const card = document.createElement('div');
            card.className = 'card';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'flex-start';
            card.style.cursor = 'pointer';
            
            const content = document.createElement('div');
            content.style.flex = '1';
            content.innerHTML = `
                <h3 style="color: var(--bright-blue); margin: 0 0 0.5rem 0; font-size: 1.1rem;">${game.title}</h3>
                <p style="color: var(--gray-light); font-size: 0.9rem; margin: 0 0 1rem 0;">📅 ${date}</p>
                <p style="color: var(--gray-light); font-size: 0.85rem; margin-bottom: 0.75rem;">Spieler: ${game.players.map(p => p.name).join(', ')}</p>
                <div style="border-top: 1px solid rgba(60, 130, 246, 0.2); padding-top: 0.75rem;">
                    ${game.finishedOrder.map((name, idx) => {
                        const isWinner = idx === 0;
                        return `
                            <p style="color: ${isWinner ? 'var(--green-success)' : 'var(--white)'}; font-size: 0.9rem; margin: 0.25rem 0; font-weight: ${isWinner ? '600' : '400'};">
                                <strong>${idx + 1}. ${name}</strong>
                            </p>
                        `;
                    }).join('')}
                </div>
            `;
            
            const menuBtn = document.createElement('button');
            menuBtn.style.background = 'none';
            menuBtn.style.border = 'none';
            menuBtn.style.color = 'var(--gray-light)';
            menuBtn.style.fontSize = '1.5rem';
            menuBtn.style.cursor = 'pointer';
            menuBtn.style.padding = '0.5rem';
            menuBtn.style.marginLeft = '1rem';
            menuBtn.textContent = '⋯';
            menuBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm('Dieses Spiel aus der Historie löschen?')) {
                    Storage.deleteGame(games.length - 1 - index);
                    initHistoryPage();
                }
            };
            
            card.appendChild(content);
            card.appendChild(menuBtn);
            container.appendChild(card);
        });
    }

    return {
        init() {
            // Set up page navigation
            window.navigateTo = navigateTo;
            window.endGame = endGame;

            // Initialize home page as active
            navigateTo('home');
        }
    };
})();

// Initialize app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});