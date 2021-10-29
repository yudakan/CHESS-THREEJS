class Escacs {

  /* ATTRIBUTES */
  ticks;
  game;
  scene;
  cam;
  controls;
  renderer;
  gltfLoader;
  players;
  playerNow;
  state;
  lights;
  raycaster;
  mouseMove;
  mouseClick;
  mouseClicked;
  mouseIn;
  assets;
  meshes;
  pieces;
  chessboard;
  extraMeshes;
  selected;
  movementListeners;
  animations;

  // TODO: guardar només players id

  /* CONSTRUCTOR */
  constructor(parentEl, settings = { bgColor: '#dcd6f7', fov: 75 }) {
    this.ticks = 0;
    this.players = [];
    this.lights = [];
    this.movementListeners = [];
    this.animations = [];
    this.pieces = [];
    this.chessboard = [];
    this.extraMeshes = [];
    this.meshes = { ...PieceType, FLOOR: null };
    this.raycaster = new THREE.Raycaster();
    this.mouseMove = new THREE.Vector2();
    this.mouseClick = new THREE.Vector2();
    this.mouseClicked = false;
    this.mouseIn = false;
    this.playerNow = false;
    this.state = State.STOPPED;
    this.gltfLoader = new THREE.GLTFLoader();
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(settings.fov, parentEl.clientWidth / parentEl.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new THREE.OrbitControls(this.cam, this.renderer.domElement);

    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(settings.bgColor);
    this.renderer.setSize(parentEl.clientWidth, parentEl.clientHeight);
    parentEl.appendChild(this.renderer.domElement);
  }

  /* METHODS */
  newPlayer(playerName, color, time) {
    switch (color) {
      case 'white':
        color = Color.WHITE;
        break;
      case 'black':
        color = Color.BLACK;
        break;
      default:
        throw new Error('Invalid color.');
    }

    const player = new Player(playerName, color, time);
    this.players.push(player);
    return player.id;
  }

  rmPlayer(playerId) {
    this.players = this.players.filter(p => p.id != playerId);
  }

  setNewGame(playerId0, playerId1) {
    const player0 = this.players.find(p => p.id == playerId0);
    const player1 = this.players.find(p => p.id == playerId1);

    if (player0.color == player1.color)
      throw new Error('Same color!');

    this.game = new GameLogic(player0, player1);
  }

  updateCanvasSize() {
    const w = this.renderer.domElement.parentNode.clientWidth;
    const h = this.renderer.domElement.parentNode.clientHeight;
    this.renderer.setSize(w, h);
    this.cam.aspect = w / h;
    this.cam.updateProjectionMatrix();
  }

  async mountScene(glbURI, meshesNames = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn', 'floor']) {

    // Load 3d models
    const loading = () => new Promise(resolve => {
      this.gltfLoader.load(
        glbURI,
        gltf => {
          this.assets = gltf;
          resolve();
        },
        undefined,
        err => { throw new Error('Error loading GLTF models >.< !') }
      );
    });

    await loading();

    // Mount reference data structure for meshes
    this.assets.scene.children.forEach(mesh => {
      mesh.scale.set(0.1, 0.1, 0.1);
      switch (mesh.name) {
        case meshesNames[0]:
          this.meshes.KING = mesh;
          break;
        case meshesNames[1]:
          this.meshes.QUEEN = mesh;
          break;
        case meshesNames[2]:
          this.meshes.ROOK = mesh;
          break;
        case meshesNames[3]:
          this.meshes.BISHOP = mesh;
          break;
        case meshesNames[4]:
          this.meshes.KNIGHT = mesh;
          break;
        case meshesNames[5]:
          this.meshes.PAWN = mesh;
          break;
        case meshesNames[6]:
          mesh.scale.set(0.04, 0.1, 0.04);
          this.meshes.FLOOR = mesh;
          break;
        default:
          throw new Error('Error mounting reference data structure for meshes >_< !');
      }

      // shadows
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    // Create pieces
    this.game.getAllPieces().forEach(piece => {

      let mesh;
      switch (piece.type) {
        case PieceType.KING:
          mesh = this.meshes.KING.clone();
          break;
        case PieceType.QUEEN:
          mesh = this.meshes.QUEEN.clone();
          break;
        case PieceType.ROOK:
          mesh = this.meshes.ROOK.clone();
          break;
        case PieceType.BISHOP:
          mesh = this.meshes.BISHOP.clone();
          break;
        case PieceType.KNIGHT:
          mesh = this.meshes.KNIGHT.clone();
          break;
        case PieceType.PAWN:
          mesh = this.meshes.PAWN.clone();
          break;
      }

      // white/black specs
      mesh.material = new THREE.MeshStandardMaterial({ color: piece.color });
      mesh.rotateY(piece.color == Color.WHITE ? 0 : Math.PI);

      // translate
      mesh.position.x = piece.position.getX() * 5;
      mesh.position.z = piece.position.getY() * 5;
      mesh.position.y += 1;

      // finished
      this.pieces.push(new Piece3D(piece, mesh));
      this.scene.add(mesh);
    });

    // Set lighting
    // ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    // light 0
    const spotLight0 = new THREE.SpotLight(0xc4d2ff, 1);
    spotLight0.position.set(50, 60, 50);
    spotLight0.target.position.set(0, 0, 0);

    spotLight0.castShadow = true;
    spotLight0.shadow.mapSize.width = 4096;
    spotLight0.shadow.mapSize.height = 4096;

    this.scene.add(spotLight0.target);
    this.scene.add(spotLight0);
    this.lights.push(spotLight0);

    // light 1
    const spotLight1 = new THREE.SpotLight(0xffbdbd, 0.5);
    spotLight1.position.set(10, 35, -30);
    spotLight1.target.position.set(20, 0, 20);

    spotLight1.castShadow = true;
    spotLight1.shadow.mapSize.width = 4096;
    spotLight1.shadow.mapSize.height = 4096;

    this.scene.add(spotLight1.target);
    this.scene.add(spotLight1);
    this.lights.push(spotLight1);

    // Set cam
    this.cam.position.set(45, 25, 45);
    this.controls.target = new THREE.Vector3(17.5, 0, 17.5);
    this.controls.update();

    // Set chessboard
    let nowBlack = true;
    for (let y = 0; y < 8; y++) {

      this.chessboard.push([]);

      for (let x = 0; x < 8; x++) {

        // set floor square
        const sol = this.meshes.FLOOR.clone();
        sol.material = new THREE.MeshStandardMaterial({ color: nowBlack ? Color.BLACK : Color.WHITE });
        nowBlack = !nowBlack;

        // translate
        sol.position.x = x * 5;
        sol.position.z = y * 5;

        // add to escene & to whole chessboard
        this.scene.add(sol);
        this.chessboard[y].push(sol);
      }
      nowBlack = !nowBlack;
    }

    // Set the floor
    this.extraMeshes = this.meshes.FLOOR.clone();
    this.extraMeshes.material = new THREE.MeshStandardMaterial({ color: Color.GREY });
    this.extraMeshes.scale.set(0.6, 0.1, 0.6);
    this.extraMeshes.position.set(17.5, -3, 17.5);
    this.scene.add(this.extraMeshes);

    // Set mouse listeners
    const setPositionOn = (e, mouse) => {
      const rectCanvas = this.renderer.domElement.getBoundingClientRect();
      if (e.x >= rectCanvas.left && e.x <= rectCanvas.right
        && e.y >= rectCanvas.top && e.y <= rectCanvas.bottom) {

        mouse.x = ((e.x - rectCanvas.left) / rectCanvas.width) * 2 - 1;
        mouse.y = - ((e.y - rectCanvas.top) / rectCanvas.height) * 2 + 1;
        this.mouseIn = true;
      }
      else this.mouseIn = false;
    };

    document.addEventListener('mousemove', e => setPositionOn(e, this.mouseMove));
    document.addEventListener('click', e => {
      setPositionOn(e, this.mouseClick);
      this.mouseClicked = true;
    });
  }

  addEventListener_movement(toDo) {
    this.movementListeners.push(toDo);
  }

  start() {
    this.state = State.RUNNING;
    this.gameLoop();
  }

  pause() {
    this.state = State.PAUSED;
  }

  stop() {
    this.state = State.STOPPED;
  }

  update() {

    // chessboard natural movs
    // TIME LINE !

    // Raycaster mouse move
    // if (this.mouseIn) {
    //   this.raycaster.setFromCamera(this.mouseMove, this.cam);
    //   const intersects = this.raycaster.intersectObjects(this.scene.children); // group for pieces?
    //   if (intersects.length > 0 && this.animations.length == 0) {
    //     this.animations.push(ticks => {
    //       const wrapper = new THREE.Object3D();
    //       wrapper.add(intersects[0].object);
    //       wrapper.position.x += Math.random()/100-0.5;
    //       wrapper.position.z += Math.random()/100-0.5;
    //       wrapper.position.y += Math.random()/100-0.5;
    //     });
    //   }
    //   else {
    //     this.animations = [];
    //   }
    // }

    // Raycaster mouse click ?
    if (this.mouseClicked) {
      this.raycaster.setFromCamera(this.mouseClick, this.cam);
      const intersects = this.raycaster.intersectObjects(this.scene.children); // group for pieces?
      if (intersects.length > 0) {

        if (this.selected) {
          const piece = this.pieces.find(p => p.mesh.uuid == intersects[0].object.uuid);
          const sol = this.chessboard.flat().find(b => b.uuid == intersects[0].object.uuid);
          let posSol;

          if (piece) posSol = piece.logic.position;
          else if (sol) posSol = new Position(sol.position.x/5, sol.position.z/5);

          if (posSol) {
            const move = this.game.allowedMovements(this.players[this.playerNow?0:1].id, this.selected.logic.id)
              .find(move => move.position.id == posSol.id);
            if (move) {
              this.movementListeners.forEach(l => l(
                this.pieces.find(p => p.logic.id == this.selected.logic.id).logic,
                this.players[this.playerNow?0:1].id
              ));
              this.game.move(this.players[this.playerNow?0:1].id, this.selected.logic.id, posSol);
              this.playerNow = !this.playerNow;
            }
          }
          this.selected.mesh.position.y -= 3;
          this.selected = null;
        }
        else {
          const piece = this.pieces.find(p => p.mesh.uuid == intersects[0].object.uuid);
          if (piece && piece.logic.color == this.players[this.playerNow?0:1].color) {
            this.selected = piece;
            this.selected.mesh.position.y += 3;
          }
        }
        this.mouseClicked = false;
      }
      else if (this.selected) {
        this.selected.mesh.position.y -= 3;
        this.selected = null;
      }
    }

    this.pieces.forEach(piece => {

      // translate
      piece.mesh.position.x = piece.logic.position.getX() * 5;
      piece.mesh.position.z = piece.logic.position.getY() * 5;

      // finished
      this.game.getAllPiecesDead().forEach(p => this.scene.remove(this.pieces.find(pp => pp.logic.id == p.id).mesh));
    });

    // this.animations.forEach(an => an(this.ticks));

    this.ticks++;
  }

  gameLoop() {
    if (this.state == State.RUNNING) requestAnimationFrame(() => this.gameLoop());
    this.update();
    this.renderer.render(this.scene, this.cam);
  }
}
