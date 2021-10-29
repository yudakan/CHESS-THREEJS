class Position {

  /* ATTRIBUTES */
  id;

  /* CONSTRUCTOR */
  constructor(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);

    if (!Position.inRange(x))
      throw new Error('x not in the range u_u');
    if (!Position.inRange(y))
      throw new Error('y not in the range u_u');

    this.id = x << 16 | y;
  }

  /* METHODS */
  getX() {
    return this.id >>> 16;
  }

  getY() {
    return this.id & 0xFFFF;
  }

  getAN() {
    return String.fromCharCode(this.getX() + 97, this.getY() + 49)
  }

  static inRange(n) {
    return n >= 0 && n <= 7;
  }
}
