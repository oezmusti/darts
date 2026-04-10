// ============================================
// UI MODULE - User Interface Management
// ============================================

const UI = (() => {
    const DART_BOARD = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    const BULLSEYE_OUTER = 25;
    const BULLSEYE_INNER = 50;

    let selectedThrows = [];
    let currentMultiplier = 1;

    return {
        initDartBoard(onNumberClick) {
            const dartBoard = document.getElementById('dartBoard');
            dartBoard.innerHTML = '';

            // Add 0
            const btn0 = document.createElement('button');
            btn0.className = 'btn btn-secondary dart-number';
            btn0.textContent = '0';
            btn0.dataset.value = 0;
            btn0.onclick = () => this.selectThrow(0, onNumberClick);
            dartBoard.appendChild(btn0);

            // Regular numbers
            DART_BOARD.forEach(num => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary dart-number';
                btn.textContent = num;
                btn.dataset.value = num;
                btn.onclick = () => this.selectThrow(num, onNumberClick);
                dartBoard.appendChild(btn);
            });

            // Bullseye Outer
            const bull25 = document.createElement('button');
            bull25.className = 'btn btn-secondary dart-number';
            bull25.textContent = '25';
            bull25.style.background = 'rgba(239, 68, 68, 0.3)';
            bull25.dataset.value = BULLSEYE_OUTER;
            bull25.dataset.singleOnly = 'true';
            bull25.onclick = () => this.selectThrow(BULLSEYE_OUTER, onNumberClick);
            dartBoard.appendChild(bull25);

            // Bullseye Inner
            const bull50 = document.createElement('button');
            bull50.className = 'btn btn-secondary dart-number';
            bull50.textContent = '50';
            bull50.style.background = 'rgba(239, 68, 68, 0.5)';
            bull50.dataset.value = BULLSEYE_INNER;
            bull50.dataset.singleOnly = 'true';
            bull50.onclick = () => this.selectThrow(BULLSEYE_INNER, onNumberClick);
            dartBoard.appendChild(bull50);
        },

        initMultipliers(onMultiplierChange) {
            document.querySelectorAll('.multiplier-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentMultiplier = parseInt(btn.dataset.mult);
                    document.querySelectorAll('.multiplier-btn').forEach(b => b.classList.remove('btn-success'));
                    btn.classList.add('btn-success');
                    onMultiplierChange(currentMultiplier);
                });
            });
            // Set default
            document.querySelector('[data-mult="1"]').classList.add('btn-success');
        },

        selectThrow(value, onThrowSelected) {
            // 25 und 50 nur als Single erlauben
            if ((value === 25 || value === 50) && currentMultiplier !== 1) {
                // Force auf Single
                currentMultiplier = 1;
                document.querySelectorAll('.multiplier-btn').forEach(b => b.classList.remove('btn-success'));
                document.querySelector('[data-mult="1"]').classList.add('btn-success');
            }

            // Immer neuen Wurf hinzufügen (mehrfache gleiche erlauben)
            if (selectedThrows.length < 3) {
                selectedThrows.push({
                    baseValue: value,
                    multiplier: currentMultiplier,
                    totalPoints: value * currentMultiplier
                });
                this.updateThrowsDisplay();
                onThrowSelected(selectedThrows);
            }
        },

        updateThrowsDisplay() {
            const display = document.getElementById('throwsDisplay');
            display.innerHTML = '';

            let totalPoints = 0;
            selectedThrows.forEach((throwData, index) => {
                const span = document.createElement('span');

                // Farbe basierend auf Multiplikator
                let bgColor = 'rgba(16, 185, 129, 0.3)'; // Green für Single
                let borderColor = 'var(--green-success)';

                if (throwData.multiplier === 2) {
                    bgColor = 'rgba(245, 158, 11, 0.3)'; // Orange für Double
                    borderColor = 'var(--yellow-warn)';
                } else if (throwData.multiplier === 3) {
                    bgColor = 'rgba(239, 68, 68, 0.3)'; // Red für Triple
                    borderColor = 'var(--red-error)';
                }

                span.style.cssText = `background: ${bgColor}; padding: 0.5rem 1rem; border-radius: 0.25rem; border: 2px solid ${borderColor}; cursor: pointer; color: var(--white); font-weight: 600;`;
                span.textContent = throwData.totalPoints;
                span.onclick = () => {
                    selectedThrows.splice(index, 1);
                    this.updateThrowsDisplay();
                };
                display.appendChild(span);
                totalPoints += throwData.totalPoints;
            });

            // Update confirm button
            const confirmBtn = document.getElementById('confirmThrowBtn');
            confirmBtn.textContent = `✓`;
            confirmBtn.disabled = selectedThrows.length === 0;
        },

        getTotalPoints() {
            return selectedThrows.reduce((sum, t) => sum + t.totalPoints, 0);
        },

        resetThrows() {
            selectedThrows = [];
            currentMultiplier = 1;
            this.updateThrowsDisplay();
            document.querySelectorAll('.multiplier-btn').forEach(b => b.classList.remove('btn-success'));
            document.querySelector('[data-mult="1"]').classList.add('btn-success');
        },

        renderPlayerCards(players, currentIndex) {
            // Update both mobile and desktop grids
            const grids = [
                document.getElementById('playersGrid'),
                document.getElementById('playersGrid2')
            ].filter(g => g);

            grids.forEach(grid => {
                grid.innerHTML = '';

                players.forEach((player, index) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    if (index === currentIndex) {
                        card.classList.add('active');
                    }
                    card.style.padding = '0.75rem';
                    card.innerHTML = `
                        <div style="text-align: center; font-size: 0.9rem;">
                            <div style="font-size: 0.75rem; color: var(--gray-light); margin-bottom: 0.25rem;">
                                ${player.status === 'finished' ? '✅ FERTIG' : ''}
                            </div>
                            <div style="font-weight: 700; color: var(--bright-blue); margin-bottom: 0.25rem;">
                                ${player.name}
                            </div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: ${player.currentPoints <= 20 ? 'var(--yellow-warn)' : 'var(--white)'};">
                                ${player.currentPoints}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--gray-light); margin-top: 0.25rem;">
                                ${player.throws} Würfe
                            </div>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            });
        },

        showCheckoutInfo(possibleCheckouts) {
            // Update both mobile and desktop checkout info
            const checkoutInfos = [
                { info: document.getElementById('checkoutInfo'), list: document.getElementById('checkoutList') },
                { info: document.getElementById('checkoutInfo2'), list: document.getElementById('checkoutList2') }
            ].filter(item => item.info && item.list);

            checkoutInfos.forEach(({ info, list }) => {
                if (possibleCheckouts.length === 0) {
                    info.style.display = 'none';
                    return;
                }

                info.style.display = 'block';
                list.innerHTML = '';
                possibleCheckouts.forEach(checkout => {
                    const span = document.createElement('span');
                    span.style.cssText = 'background: rgba(16, 185, 129, 0.2); padding: 0.25rem 0.75rem; border-radius: 0.25rem; border: 1px solid var(--green-success); color: var(--green-success); font-size: 0.85rem; font-weight: 600;';
                    span.textContent = checkout;
                    list.appendChild(span);
                });
            });
        },

        updateThrowsHistory(currentThrows) {
            // Update both mobile and desktop throws history
            const histories = [
                document.getElementById('throwsHistory'),
                document.getElementById('throwsHistory2')
            ].filter(h => h);

            histories.forEach(history => {
                history.innerHTML = '';

                if (currentThrows.length === 0) {
                    const p = document.createElement('p');
                    p.style.color = 'var(--gray-light)';
                    p.style.fontSize = '0.85rem';
                    p.textContent = 'Noch keine Würfe';
                    history.appendChild(p);
                    return;
                }

                currentThrows.forEach(throwData => {
                    const div = document.createElement('div');
                    div.style.display = 'flex';
                    div.style.justifyContent = 'space-between';
                    div.style.alignItems = 'center';
                    div.style.padding = '0.5rem';
                    div.style.background = 'rgba(26, 40, 73, 0.6)';
                    div.style.borderRadius = '0.25rem';
                    div.style.fontSize = '0.85rem';

                    let multiplierText = 'Single';
                    let color = 'var(--green-success)';
                    if (throwData.multiplier === 2) {
                        multiplierText = 'Double';
                        color = 'var(--yellow-warn)';
                    } else if (throwData.multiplier === 3) {
                        multiplierText = 'Triple';
                        color = 'var(--red-error)';
                    }

                    div.innerHTML = `
                        <span style="color: var(--gray-light);">${throwData.baseValue} (${multiplierText})</span>
                        <span style="color: ${color}; font-weight: 600;">${throwData.totalPoints}</span>
                    `;
                    history.appendChild(div);
                });
            });
        },

        showMessage(message, type = 'success') {
            const display = document.getElementById('messageDisplay');
            display.textContent = message;
            display.style.display = 'block';

            if (type === 'success') {
                display.style.background = 'rgba(16, 185, 129, 0.2)';
                display.style.color = 'var(--green-success)';
                display.style.borderLeft = '4px solid var(--green-success)';
            } else if (type === 'error') {
                display.style.background = 'rgba(239, 68, 68, 0.2)';
                display.style.color = 'var(--red-error)';
                display.style.borderLeft = '4px solid var(--red-error)';
            } else if (type === 'warning') {
                display.style.background = 'rgba(245, 158, 11, 0.2)';
                display.style.color = 'var(--yellow-warn)';
                display.style.borderLeft = '4px solid var(--yellow-warn)';
            }

            setTimeout(() => {
                display.style.display = 'none';
            }, 3000);
        },

        hideMessage() {
            document.getElementById('messageDisplay').style.display = 'none';
        }
    };
})();