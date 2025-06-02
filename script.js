const board = Chessboard('board', {
  draggable: true,
  position: 'start',
  onDrop: onDrop,
});

const game = new Chess();

const stockfish = new Worker('stockfish.js');

stockfish.onmessage = function(event) {
  const line = event.data;
  if (line.startsWith('bestmove')) {
    const move = line.split(' ')[1];
    game.move(move, { sloppy: true });
    board.position(game.fen());
    updateStatus();
  }
};

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q',
  });

  if (move === null) return 'snapback';

  updateStatus();

  stockfish.postMessage('position fen ' + game.fen());
  stockfish.postMessage('go depth 15');
}

function updateStatus() {
  const statusEl = document.getElementById('status');
  const fenEl = document.getElementById('fen');
  const pgnEl = document.getElementById('pgn');

  let status = '';

  if (game.in_checkmate()) {
    status = 'Game over, ' + (game.turn() === 'w' ? 'Black' : 'White') + ' wins by checkmate.';
  } else if (game.in_draw()) {
    status = 'Game over, drawn position.';
  } else {
    status = (game.turn() === 'w' ? 'White' : 'Black') + ' to move.';
    if (game.in_check()) {
      status += ' Check!';
    }
  }

  statusEl.textContent = status;
  fenEl.textContent = game.fen();
  pgnEl.textContent = game.pgn();
}
