import { Game } from './entities/Game';
new Game();

// Lock screen oriantation
if (screen.orientation && screen.orientation.lock) {
    screen.orientation
        .lock('landscape')
        .then(() => {
            console.log('Screen locked to landscape.');
        })
        .catch((error) => {
            console.error('Failed to lock screen orientation:', error);
        });
} else {
    console.warn('Screen orientation locking not supported.');
}
