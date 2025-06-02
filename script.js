const board = Chessboard('board', {
  draggable: true,
  position: 'start',
  onDrop: onDrop
});

const game = new Chess();
const stockfish = new Worker('https://cdn.jsdelivr.net/npm/stockfish/stockfish.js');

stockfish.onmessage = function (event) {
  if (typeof event.data === 'string' && event.data.startsWith('bestmove')) {
    const bestMove = event.data.split(' ')[1];
    game.move(bestMove, { sloppy: true });
    board.position(game.fen());
    updateStatus();
  }
};

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  updateStatus();
  stockfish.postMessage('position fen ' + game.fen());
  stockfish.postMessage('go depth 12');
}

function updateStatus() {
  const statusEl = document.getElementById('status');
  let status = '';

  if (game.in_checkmate()) {
    status = 'Checkmate! Game over.';
  } else if (game.in_draw()) {
    status = 'Draw!';
  } else {
    status = (game.turn() === 'w' ? 'White' : 'Black') + ' to move';
    if (game.in_check()) status += ' (Check)';
  }

  statusEl.textContent = status;
}
