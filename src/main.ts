import { Game } from './entities/Game';
new Game();

let loaded = 0;
window.addEventListener('resource-loaded', () => {
    loaded++;

    if (loaded >= 3) {
        document.getElementById('loader').style.display = 'none';
    }
});
