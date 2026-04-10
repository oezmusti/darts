// ============================================
// APP MODULE - Main Application Controller
// ============================================

// Custom Alert/Modal System
function showAlert(message) {
    const modal = document.createElement('div');
    modal.className = 'custom-alert-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #1a2849, rgba(26, 40, 73, 0.9));
        border: 1px solid rgba(60, 130, 246, 0.3);
        border-radius: 1rem;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        text-align: center;
    `;

    const text = document.createElement('p');
    text.style.cssText = `
        color: #e5e7eb;
        margin-bottom: 1.5rem;
        font-size: 1rem;
    `;
    text.textContent = message;

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = 'OK';
    btn.style.width = '100%';
    btn.onclick = () => modal.remove();

    content.appendChild(text);
    content.appendChild(btn);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Custom Confirm Modal System
function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-confirm-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #1a2849, rgba(26, 40, 73, 0.9));
            border: 1px solid rgba(60, 130, 246, 0.3);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            text-align: center;
        `;

        const text = document.createElement('p');
        text.style.cssText = `
            color: #e5e7eb;
            margin-bottom: 1.5rem;
            font-size: 1rem;
        `;
        text.textContent = message;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 1rem;
            justify-content: center;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-ghost';
        cancelBtn.textContent = 'Abbrechen';
        cancelBtn.style.flex = '1';
        cancelBtn.onclick = () => {
            modal.remove();
            resolve(false);
        };

        const okBtn = document.createElement('button');
        okBtn.className = 'btn btn-primary';
        okBtn.textContent = 'OK';
        okBtn.style.flex = '1';
        okBtn.onclick = () => {
            modal.remove();
            resolve(true);
        };

        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(okBtn);
        content.appendChild(text);
        content.appendChild(buttonContainer);
        modal.appendChild(content);
        document.body.appendChild(modal);
    });
}

const App = (() => {
    const MAX_PLAYERS = 4;

    // Initialize menu toggle
    function initMenuToggle() {
        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');

        if (!menuToggle || !mobileMenu) {
            console.warn('Menu elements not found');
            return;
        }

        // Toggle menu on button click
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
        });

        // Close menu when clicking a menu item
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu && !mobileMenu.contains(e.target) && e.target !== menuToggle) {
                if (mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                }
            }
        });
    }

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
            showAlert('Maximum 4 Spieler!');
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '0.5rem';
        wrapper.style.alignItems = 'flex-end';
        wrapper.innerHTML = `
            <div style="width: 100%; display: flex; flex-direction: row;">
                <div style="flex: 1; display: flex; flex-direction: column;">
                    <input type="text" placeholder="Spielername" class="player-input" style="width: 90%;" required>
                </div>
                <button type="button" class="btn btn-danger" style="height: fit-content; width: 10%; text-align: center;" onclick="this.parentElement.parentElement.remove();">✕</button>
            </div>
        `;
        container.appendChild(wrapper);
    }

    function startGameFromSetup() {
        const title = document.getElementById('gameTitle').value || 'Game';
        let startingPoints = parseInt(document.getElementById('startingPoints').value);

        if (isNaN(startingPoints)) {
            const customPoints = parseInt(document.getElementById('customPoints').value);
            if (isNaN(customPoints) || customPoints < 1) {
                showAlert('Bitte geben Sie gültige Punkte ein!');
                return;
            }
            startingPoints = customPoints;
        }

        const playerInputs = Array.from(document.querySelectorAll('.player-input'));
        const playerNames = playerInputs
            .map(input => input.value.trim())
            .filter(name => name !== '');

        if (playerNames.length < 2) {
            showAlert('Mindestens 2 Spieler erforderlich!');
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
            // Check if only one player is left
            const activePlayers = Game.getActivePlayersCount();
            if (activePlayers === 1) {
                setTimeout(() => {
                    showConfirm('Nur noch ein Spieler übrig! Runde beenden?').then((confirmed) => {
                        if (confirmed) {
                            Game.endGame();
                            showGameResults();
                        } else {
                            Game.nextPlayer();
                            updateGameDisplay();
                        }
                    });
                }, 1500);
            } else {
                setTimeout(() => {
                    Game.nextPlayer();
                    updateGameDisplay();
                }, 1500);
            }
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
                </div>
            `;
            resultsList.appendChild(div);
        });

        navigateTo('results');
    }

    function endGame() {
        showConfirm('Spiel wirklich beenden?').then((confirmed) => {
            if (confirmed) {
                Game.endGame();
                showGameResults();
            }
        });
    }

    return {
        init() {
            // Set up page navigation
            window.navigateTo = navigateTo;
            window.endGame = endGame;

            // Initialize menu toggle
            initMenuToggle();

            // Initialize home page as active
            navigateTo('home');
        }
    };
})();

// Initialize app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});