class Piece {

  /* ATTRIBUTES */
  id;
  type;
  color;
  dead;
  position;

  /* CONSTRUCTOR */
  constructor(type, position, color) {
    this.id = parseInt(Math.random() * 10000000000);
    this.type = type;
    this.color = color;
    this.position = position;
    this.dead = false;
  }

  /* METHODS */
  getAN(pawn = false, ASCIIarr = ['K', 'Q', 'R', 'B', 'N', 'P']) {
    return (pawn || this.type != PieceType.PAWN ? ASCIIarr[this.type] : '')
      + this.position.getAN();
  }

  baseMovements() {
    let movements = [];
    const x = this.position.getX();
    const y = this.position.getY();

    switch (this.type) {
      case PieceType.KNIGHT:
        if (Position.inRange(x + 1) && Position.inRange(y + 2)) movements.push(new Position(x + 1, y + 2));
        if (Position.inRange(x + 2) && Position.inRange(y + 1)) movements.push(new Position(x + 2, y + 1));
        if (Position.inRange(x + 2) && Position.inRange(y - 1)) movements.push(new Position(x + 2, y - 1));
        if (Position.inRange(x + 1) && Position.inRange(y - 2)) movements.push(new Position(x + 1, y - 2));
        if (Position.inRange(x - 1) && Position.inRange(y - 2)) movements.push(new Position(x - 1, y - 2));
        if (Position.inRange(x - 2) && Position.inRange(y - 1)) movements.push(new Position(x - 2, y - 1));
        if (Position.inRange(x - 2) && Position.inRange(y + 1)) movements.push(new Position(x - 2, y + 1));
        if (Position.inRange(x - 1) && Position.inRange(y + 2)) movements.push(new Position(x - 1, y + 2));

        return movements;

      case PieceType.KING:
        if (Position.inRange(x + 1)) movements.push(new Position(x + 1, y));
        if (Position.inRange(x - 1)) movements.push(new Position(x - 1, y));
        if (Position.inRange(y + 1)) movements.push(new Position(x, y + 1));
        if (Position.inRange(y - 1)) movements.push(new Position(x, y - 1));
        if (Position.inRange(x + 1) && Position.inRange(y + 1)) movements.push(new Position(x + 1, y + 1));
        if (Position.inRange(x + 1) && Position.inRange(y - 1)) movements.push(new Position(x + 1, y - 1));
        if (Position.inRange(x - 1) && Position.inRange(y + 1)) movements.push(new Position(x - 1, y + 1));
        if (Position.inRange(x - 1) && Position.inRange(y - 1)) movements.push(new Position(x - 1, y - 1));

        return movements;

      case PieceType.PAWN:
        let yy = this.color == Color.WHITE ? y + 1 : y - 1;
        if (Position.inRange(yy))
          for (let xx = x - 1; xx <= x + 1; xx++)
            if (Position.inRange(xx)) movements.push(new Position(xx, yy));

        return movements;

      case PieceType.QUEEN:
      case PieceType.ROOK:
        for (let i = 0; i < 8; i++) {
          if (i != y) movements.push(new Position(x, i));
          if (i != x) movements.push(new Position(i, y));
        }

        if (this.type != PieceType.QUEEN) return movements;

      case PieceType.BISHOP:
        const operations = [
          ({ x, y }) => ({ x: ++x, y: ++y }),
          ({ x, y }) => ({ x: ++x, y: --y }),
          ({ x, y }) => ({ x: --x, y: ++y }),
          ({ x, y }) => ({ x: --x, y: --y }),
        ];
        for (let i = 0; i < operations.length; i++) {
          let pos = { x: x, y: y };

          while (true) {
            pos = operations[i](pos);
            if (Position.inRange(pos.x) && Position.inRange(pos.y))
              movements.push(new Position(pos.x, pos.y));
            else break;
          }
        }

        return movements;
    }
  }
}
