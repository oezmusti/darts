// ============================================
// STORAGE MODULE - LocalStorage Management
// ============================================

const Storage = (() => {
    const GAMES_KEY = 'dartGames';
    const SETTINGS_KEY = 'dartSettings';

    return {
        saveGame(gameData) {
            try {
                const games = JSON.parse(localStorage.getItem(GAMES_KEY) || '[]');
                games.push({
                    ...gameData,
                    savedAt: new Date().toISOString()
                });
                localStorage.setItem(GAMES_KEY, JSON.stringify(games));
                return true;
            } catch (e) {
                console.error('Error saving game:', e);
                return false;
            }
        },

        getAllGames() {
            try {
                return JSON.parse(localStorage.getItem(GAMES_KEY) || '[]');
            } catch (e) {
                console.error('Error loading games:', e);
                return [];
            }
        },

        deleteGame(index) {
            try {
                const games = JSON.parse(localStorage.getItem(GAMES_KEY) || '[]');
                games.splice(index, 1);
                localStorage.setItem(GAMES_KEY, JSON.stringify(games));
                return true;
            } catch (e) {
                console.error('Error deleting game:', e);
                return false;
            }
        },

        clearAllGames() {
            try {
                localStorage.removeItem(GAMES_KEY);
                return true;
            } catch (e) {
                console.error('Error clearing games:', e);
                return false;
            }
        }
    };
})();