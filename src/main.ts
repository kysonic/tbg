import { Game } from './services/Game';
// import { Application, Assets } from 'pixi.js';
// import { Background } from './services/Background';

// (async () => {
//     // Create a new application
//     const app = new Application();
//     await app.init({ background: '#1099bb', resizeTo: window });
//     document.getElementById('pixi-container')!.appendChild(app.canvas);

//     const texture = await Assets.load('/assets/background.jpg');
//     const background = new Background(texture);
//     background.cover(app.screen.width, app.screen.height);
//     app.stage.addChild(background.sprite);

//     window.addEventListener('resize', () => {
//         app.renderer.resize(window.innerWidth, window.innerHeight);
//         background.cover(app.screen.width, app.screen.height);
//     });
// })();

new Game();
