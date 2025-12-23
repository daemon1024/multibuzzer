const { ActivePlayers } = require('boardgame.io/core');

function resetBuzzers(G) {
  G.queue = {};
}

function resetBuzzer(G, ctx, id) {
  const newQueue = { ...G.queue };
  delete newQueue[id];
  G.queue = newQueue;
}

function toggleLock(G) {
  G.locked = !G.locked;
}

function buzz(G, ctx, id, timestamp) {
  const newQueue = {
    ...G.queue,
  };
  if (!newQueue[id]) {
    // Use client-provided timestamp for fair ordering
    newQueue[id] = { id, timestamp: timestamp || new Date().getTime() };
  }
  G.queue = newQueue;
}

const Buzzer = {
  name: 'buzzer',
  minPlayers: 2,
  maxPlayers: 200,
  setup: () => ({ queue: {}, locked: false }),
  phases: {
    play: {
      start: true,
      moves: { buzz, resetBuzzer, resetBuzzers, toggleLock },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
    },
  },
};

module.exports = { Buzzer };
