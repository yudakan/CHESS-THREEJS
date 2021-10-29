class GameLogic {

  /* ATTRIBUTES */
  players;

  /* CONSTRUCTOR */
  constructor(player0, player1) {
    if (player0.color == player1.color)
      throw new Error('Both players have same color o_O');

    this.players = [player0, player1];
  }

  /* METHODS */
  getPlayer0Pieces() {
    return this.players[0].pieces;
  }

  getPlayer1Pieces() {
    return this.players[1].pieces;
  }

  getAllPieces() {
    return [...this.players[0].pieces, ...this.players[1].pieces];
  }

  getAllPiecesAlive() {
    return [...this.players[0].pieces.filter(p => !p.dead), ...this.players[1].pieces.filter(p => !p.dead)];
  }

  getAllPiecesDead() {
    return [...this.players[0].pieces.filter(p => p.dead), ...this.players[1].pieces.filter(p => p.dead)];
  }

  allowedMovements(playerId, pieceId) {
    const player = this.players.find(p => p.id == playerId);
    if (!player) throw new Error('This player doesn\'t exist :/');
    const piece = player.pieces.find(p => p.id == pieceId);
    if (!piece) throw new Error('This piece doesn\'t exist :/');

    const allPieces = this.getAllPiecesAlive();
    let movements = piece.baseMovements();
    let newMovements = [];
    let operations;

    switch (piece.type) {
      case PieceType.KNIGHT:
      case PieceType.KING:
        return movements
          .map(move => {
            const pieceInter = allPieces.find(p => p.position.id == move.id);
            if (pieceInter)
              if (player.color == pieceInter.color) return null;
              else return { position: move, attack: true };
            else return { position: move, attack: false };
          })
          .filter(move => move);

      case PieceType.PAWN:
        if (movements[0]) {
          let pieceInter = allPieces.find(p => p.position.id == movements[0].id);
          if (pieceInter && pieceInter.color != player.color)
            newMovements.push({ position: movements[0], attack: true });
        }

        if (movements[2]) {
          let pieceInter = allPieces.find(p => p.position.id == movements[2].id);
          if (pieceInter && pieceInter.color != player.color)
            newMovements.push({ position: movements[2], attack: true });
        }

        if (movements[1]) {
          let pieceInter = allPieces.find(p => p.position.id == movements[1].id);
          if (!pieceInter) newMovements.push({ position: movements[1], attack: false });
        }

        return newMovements;

      case PieceType.QUEEN:
      case PieceType.ROOK:
        operations = [
          ({ x, y }) => ({ x: x, y: ++y }),
          ({ x, y }) => ({ x: x, y: --y }),
          ({ x, y }) => ({ x: ++x, y: y }),
          ({ x, y }) => ({ x: --x, y: y }),
        ];
        
        for (let i=0; i < operations.length; i++) {
          let posObj = { x: piece.position.getX(), y: piece.position.getY() };

          while (true) {
            posObj = operations[i](posObj);

            if (Position.inRange(posObj.y) && Position.inRange(posObj.x)) {
              const pos = new Position(posObj.x, posObj.y);
              const pieceInter = allPieces.find(p => p.position.id == pos.id);
              if (pieceInter) {
                if (player.color != pieceInter.color) newMovements.push({ position: pos, attack: true })
                break;
              }
              newMovements.push({ position: pos, attack: false });
            } else break;
          }
        }

        if (piece.type != PieceType.QUEEN) return newMovements;
        
      case PieceType.BISHOP:
        operations = [
          ({ x, y }) => ({ x: ++x, y: ++y }),
          ({ x, y }) => ({ x: ++x, y: --y }),
          ({ x, y }) => ({ x: --x, y: ++y }),
          ({ x, y }) => ({ x: --x, y: --y }),
        ];
        
        for (let i=0; i < operations.length; i++) {
          let posObj = { x: piece.position.getX(), y: piece.position.getY() };

          while (true) {
            posObj = operations[i](posObj);

            if (Position.inRange(posObj.y) && Position.inRange(posObj.x)) {
              const pos = new Position(posObj.x, posObj.y);
              const pieceInter = allPieces.find(p => p.position.id == pos.id);
              if (pieceInter) {
                if (player.color != pieceInter.color) newMovements.push({ position: pos, attack: true })
                break;
              }
              newMovements.push({ position: pos, attack: false });
            } else break;
          }
        }

        return newMovements;
    }

  }

  move(playerId, pieceId, position) {
    const player = this.players.find(p => p.id == playerId);
    if (!player) throw new Error('This player doesn\'t exist :/');
    const piece = player.pieces.find(p => p.id == pieceId);
    if (!piece) throw new Error('This piece doesn\'t exist :/');

    const movement = this.allowedMovements(playerId, pieceId).find(move => move.position.id == position.id);
    if (!movement)
      throw new Error('Movement not allowed ò.ó');

    if (movement.attack) {
      this.players.find(p => p.id != playerId)
        .pieces.find(p => p.position.id == movement.position.id)
        .dead = true;
    }

    piece.position = new Position(movement.position.getX(), movement.position.getY());
  }
}
