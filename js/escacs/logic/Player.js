class Player {

  /* ATTRIBUTES */
  id;
  name;
  color;
  time;
  pieces;
  history;

  /* CONSTRUCTOR */
  constructor(name, color, iniTime) {
    this.id = parseInt(Math.random() * 10000000000);
    this.name = name;
    this.color = color;
    this.time = iniTime;
    this.history = [];
    this.generateSetOfPeaces();
  }

  /* METHODS */
  generateSetOfPeaces() {
    let yStart = 0, yyStart = 1;
    if (this.color == Color.BLACK) {
      yStart = 7;
      yyStart = 6;
    }

    this.pieces = [
      new Piece(PieceType.ROOK, new Position(0, yStart), this.color),
      new Piece(PieceType.KNIGHT, new Position(1, yStart), this.color),
      new Piece(PieceType.BISHOP, new Position(2, yStart), this.color),
      new Piece(PieceType.QUEEN, new Position(3, yStart), this.color),
      new Piece(PieceType.KING, new Position(4, yStart), this.color),
      new Piece(PieceType.BISHOP, new Position(5, yStart), this.color),
      new Piece(PieceType.KNIGHT, new Position(6, yStart), this.color),
      new Piece(PieceType.ROOK, new Position(7, yStart), this.color)
    ];
    for (let i = 0; i < 8; i++)
      this.pieces.push(new Piece(PieceType.PAWN, new Position(i, yyStart), this.color));
  }

}
