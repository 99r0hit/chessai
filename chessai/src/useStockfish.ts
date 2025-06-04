import { useEffect, useRef } from 'react';

export function useStockfish(onBestMove: (move: string) => void) {
  const stockfishRef = useRef<Worker | null>(null);

  useEffect(() => {
    const stockfish = new Worker('https://cdn.jsdelivr.net/npm/stockfish@16.1.0/src/stockfish-nnue-16.js', {
      type: 'module',
    });

    stockfishRef.current = stockfish;

    stockfish.onmessage = (event: MessageEvent) => {
      const line = event.data;
      console.log('Stockfish says:', line);

      if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        onBestMove(move);
      }
    };

    return () => stockfish.terminate();
  }, [onBestMove]);

  function getBestMove(fen: string) {
    if (stockfishRef.current) {
      stockfishRef.current.postMessage('uci');
      stockfishRef.current.postMessage(`position fen ${fen}`);
      stockfishRef.current.postMessage('go depth 12');
    }
  }

  return { getBestMove };
}
