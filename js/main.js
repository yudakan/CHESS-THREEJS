// TODO:
// button is not good
// load game json
let ESCACS_GLOBAL;

// Some extra utilities
if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1];
  };
}

// Global Vars
mouseEvents = false;

// Stop mouse events propagation -> mouseEvents
document.addEventListener('click', e => {
  if (!mouseEvents) {
    e.stopPropagation();
    e.preventDefault();
  }
}, true);
document.addEventListener('mouseover', e => {
  if (!mouseEvents) {
    e.stopPropagation();
    e.preventDefault();
  }
}, true);
document.addEventListener('mouseleave', e => {
  if (!mouseEvents) {
    e.stopPropagation();
    e.preventDefault();
  }
}, true);

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {

  // Menu play button
  document.getElementById('play_button').addEventListener('click', e => {
    mouseEvents = false;

    const p0name = document.getElementById('player0_name').value;
    const p0color = document.getElementById('player0_color').value;
    const p1name = document.getElementById('player1_name').value;
    const p1color = document.getElementById('player1_color').value;
    const time = parseInt(document.getElementById('time_input').value);

    if (p0name != '' && p1name != '' && time != NaN && time > 0 && p0color != p1color) {
      const start = async () => {
        await play(p0name, p0color, p1name, p1color, time);
        await menuToGame_an();
        mouseEvents = true;
      };
      start();
    }
    else {
      mouseEvents = true;
      alert('Something\'s wrong, you can do better "-3-');
    }
  });

  // Surrender buttons
  Array.from(document.getElementsByClassName('surrende-btn')).forEach(el =>
    el.addEventListener('click', e => console.log(`Hola ${e.y}`))
  );

  // Window resize
  window.addEventListener('resize', () =>
    document.getElementById('game-container').style.width = `${window.innerWidth - 400}px`
  );

  mouseEvents = true;
});

// Play Game
const play = async (p0name, p0color, p1name, p1color, time) => {

  const gameEl = document.getElementById('game-container');

  // Create new game
  const ESCACS = new Escacs(gameEl);
  const player0 = ESCACS.newPlayer(p0name, p0color, time);
  const player1 = ESCACS.newPlayer(p1name, p1color, time);
  ESCACS.setNewGame(player0, player1);

  // Resize canvas event
  window.addEventListener('resize', () => ESCACS.updateCanvasSize());

  // Start game
  await ESCACS.mountScene('models/assets.glb', ['rei', 'dama', 'torre', 'alfil', 'cavall', 'peo', 'sol']);
  ESCACS.start();
  console.log(ESCACS);
  ESCACS_GLOBAL = ESCACS;

  // inspector
  document.querySelector('#player0 > h2').innerHTML = p0name;
  document.querySelector('#player0 > h3').innerHTML = `${time}:00`;
  document.querySelector('#player1 > h2').innerHTML = p1name;
  document.querySelector('#player1 > h3').innerHTML = `${time}:00`;
  
  const history = document.getElementById('history');
  ESCACS.addEventListener_movement((piece, playerId) => {
    history.innerHTML += `
      <div class="row">
        <span>${playerId == player0 ? p0name : p1name}</span>
        <span>${piece.getAN()}</span>
      </div>`;
  });
};


/* ANIMATIONS */

const menuToGame_an = () => new Promise(resolve => {
  const menu = document.getElementById('menu');
  const game = document.getElementById('game');

  const duration = 1250;
  const gameTabPos = [{ x: window.innerWidth, y: 0 }, { x: 0, y: 0 }];
  const menuTabPos = [{ x: -window.innerWidth, y: 0 }];

  game.style.transform = `translate(${gameTabPos[0].x}px, ${gameTabPos[0].y}px)`;

  const startAnimation = () => {
    if (game.getBoundingClientRect().x != gameTabPos[0].x)
      window.requestAnimationFrame(startAnimation);
    else {
      game.style.transition = `${duration / 1000}s`;
      menu.style.transition = `${duration / 1000}s`;
      menu.style.transform = `translate(${menuTabPos[0].x}px, ${menuTabPos[0].y}px)`;
      game.style.transform = `translate(${gameTabPos[1].x}px, ${gameTabPos[1].y}px)`;
      setTimeout(() => {
        menu.style.display = 'none';
        resolve();
      }, duration);
    }
  };

  startAnimation();
});
