import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

/* tslint: disable */

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {



  //////////// FORM GROUP PRE - PRESET ///////////////////

  options;
  userChoice;
  constructor(private fb: FormBuilder) {

    this.options = fb.group({
      method: ['Dijkstra', Validators.required],
      size: [18, Validators.required],
      speed: [40, Validators.required],

    });
  }

  // for correct graph size and looks
  nav: HTMLDivElement;
  canvas;
  ctx: CanvasRenderingContext2D;

  speed = 40;


  
  colorArray = [
    '#000000',
    '#444444',
    '#660066',
    '#FF5505',
    '#8030FA',

  ];


  mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  mouseMode;


    // for calculating nodes
  size = [103, 50]; // size od board, changable in options
  wiel = 5;

  // FOR ALGORITHM: node array, coordinates
  graph;
  startNode;
  endNode;
  start; end;


  roadNodes;
  // mozliwe ruchy skoczka
  wektory = [
    [-1, 0], [0, -1], [0, 1], [1, 0]

  ];





  ////////////////////////////////////// PRESET ///////////////////////////////////////////////////



  ngOnInit() {

    // the preset
    this.userChoice = this.options.value;
    this.essentials();

    // doing algorithm
    this.makeNodes();
    this.makeRandomWalls();
    this.calcPath();
    console.log(this.graph);

    // animating
    this.animate();
  }


  essentials() {
    // get needed elements
    this.canvas = document.getElementById('canvas');
    this.nav = document.querySelector('.options');

    // adjust the size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight - this.nav.offsetHeight;
    this.ctx = this.canvas.getContext('2d');

    this.size[0] = Math.round(this.canvas.width / this.userChoice.size);
    this.size[1] = Math.round(this.canvas.height / this.userChoice.size);


    // make start and end node somewhere on existing node
    this.startNode = [Math.floor(Math.random() * this.size[0]), Math.floor(Math.random() * this.size[1])];
    this.endNode = [Math.floor(Math.random() * this.size[0]), Math.floor(Math.random() * this.size[1])];


    // event listeners
    this.canvas.addEventListener('mousemove', (event) => {
      this.mouse.x = event.x;
      this.mouse.y = event.y - 120;


      if (this.mouseMode == 1) {
        const nodey = this.searchFor(Math.floor(this.mouse.x / this.userChoice.size) , Math.floor(this.mouse.y / this.userChoice.size));

        if (nodey.isActive != 0) {
          nodey.animate = 0;
          nodey.isActive = 0;   


          if(nodey.isRoad == 1){
            nodey.isRoad == 3;
            nodey.value == 0;

            this.calcPath()
            this.reverseRoad()
            console.log('bruh')

          }

          console.log(nodey)
        }

      }
    });

    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight - 130;

      const height = (window.innerHeight - 130) / this.size[1];
      this.graph.forEach(node => {
        node.height = height;
      });
    });

   





  }





  ///////////////////////////////// USER MODS ///////////////////////////////////

  clear() {
    this.graph.forEach(node => {
      node.isActive = 1;
      node.isRoad = 0;
      node.value = undefined;

      this.startNode = [Math.floor(this.size[0] / 5), Math.floor(this.size[1] / 2)];
      this.endNode = [Math.floor(this.size[0] / 1.3), Math.floor(this.size[1] / 2)];

      this.start = this.searchFor(this.startNode[0], this.startNode[1]);
      this.end = this.searchFor(this.endNode[0], this.endNode[1]);
    });
  }

  accept() {

    this.calcPath();
  }

  apply() {
    this.userChoice = this.options.value;
    console.log(this.userChoice);

    this.size[0] = Math.round(this.canvas.width / this.userChoice.size);
    this.size[1] = Math.round(this.canvas.height / this.userChoice.size);

    this.speed = this.userChoice.speed;

    

    this.startNode = [Math.floor(this.size[0] / 5), Math.floor(this.size[1] / 2)];
    this.endNode = [Math.floor(this.size[0] / 1.3), Math.floor(this.size[1] / 2)];
    console.log(this.startNode,this.endNode)
    
    this.makeNodes();
  }

  setWall = (event) => {
    if (this.mouseMode != 1) {
      this.mouseMode = 1;
    } else {
      this.mouseMode = 0;
    }


  }

  setEnd = (event) => {
    const nodey = this.searchFor(Math.floor(this.mouse.x / this.userChoice.size) , Math.floor(this.mouse.y / this.userChoice.size));
    console.log(nodey);
    this.end = nodey;
    this.endNode = [nodey.x, nodey.y];
  }

  setStart = (event) => {
    const nodey = this.searchFor(Math.floor(this.mouse.x / this.userChoice.size) , Math.floor(this.mouse.y / this.userChoice.size));
    this.start = nodey;
    this.startNode = [nodey.x, nodey.y];


  }
  setMode(mode) {

    if (mode == 0) {

      // dodaj swoje,
      this.canvas.addEventListener('mousedown', this.setWall, {passive: true});
      this.canvas.addEventListener('mouseup', this.setWall, {passive: true});
      // usun pozostałe

      this.canvas.removeEventListener('click', this.setStart, {passive: true});
      this.canvas.removeEventListener('click', this.setEnd, {passive: true});


    } else if (mode == 1) {
      this.canvas.addEventListener('click', this.setStart, {passive: true});


      this.canvas.removeEventListener('mousedown', this.setWall, {passive: true});
      this.canvas.removeEventListener('mouseup', this.setWall, {passive: true});
      this.canvas.removeEventListener('click', this.setEnd, {passive: true});



    } else if (mode == 2) {
      this.canvas.addEventListener('click', this.setEnd, {passive: true});

      this.canvas.removeEventListener('mousedown', this.setWall, {passive: true});
      this.canvas.removeEventListener('mouseup', this.setWall, {passive: true});
      this.canvas.removeEventListener('click', this.setStart, {passive: true});



    }

  }



  /////////////////////////////////////////////////// MAIN CODE; NODES, PATHFINDING, ROADFINDING ///////////////////////////////////////////////////////



  makeNodes() {
    this.graph = [];
    for (let x = 0; x < this.size[0]; x++) {

        for (let y = 0; y < this.size[1]; y++) {
          // oblicz dystans tego node od centrum
          // const dist = Math.sqrt(Math.pow(this.srodek - x, 2) + Math.pow(this.srodek - y, 2));

          // wyznacz połączone nody
          const nodeConnections = [];

          this.wektory.forEach(wektor => {  // dla każdego wektora, spróbuj skoczyć o ten wektor // uzyj wektorów by sprawdzic ktore skoki rycerza są mozliwe

            const connection = []; // koordynaty połączenia, x w [0], y w [1]
            connection.push(x + wektor[0]);
            connection.push(y + wektor[1]);


            if (connection[0] >= 0 && connection[0] < this.size[0] &&
              connection[1] >= 0 && connection[1] < this.size[1]) {

                nodeConnections.push(connection); // jeżeli połączenie jest z intniejącym elementem planszy, dodaj do listy połączeń (pola oznaczone od 0 do size-1)
            }


          }); // stwórz obiekt node i dodaj go do listy node'ów

          
          this.graph.push(new Node(x, y, nodeConnections, this.userChoice.size, this.ctx, this.mouse));

        }
    }
    // set nodes
    this.end = this.searchFor(this.endNode[0], this.endNode[1]);
    this.start = this.searchFor(this.startNode[0], this.startNode[1]);

  }




  calcPath() {
    // nadaj punktowi starowemu pierwszą wartość
    this.searchFor(this.startNode[0], this.startNode[1]).value = 0;

    let pathLen = 0;
    let found = false;
    let NodesToCheck = this.searchForNodes(pathLen); // obecne miejsce na planszy

    while (found == false) {
      NodesToCheck.forEach(node => {
        const nodesCoords = node.nodeConnections;
        const nodesConnected = [];

        nodesCoords.forEach(coordinates => {
          nodesConnected.push(this.searchFor(coordinates[0], coordinates[1]));
        });

        nodesConnected.forEach(connected => {

          if (connected.value === undefined &&
            connected != this.end &&
            connected.isActive != 0) {

              new Promise((resolve, reject) => {

                setTimeout(() => resolve([
                  connected.isActive = 2,
                  connected.animate = -0
                ]), pathLen * this.speed);
              });
              connected.value = pathLen + 1;

          } else if (connected == this.end ) {

              new Promise((resolve, reject) => {
                setTimeout(() => resolve([
                  connected.isActive = 2,
                  connected.animate = -0
                ]), pathLen * this.speed);
              });

              connected.value = pathLen + 1;
              found = true;

              new Promise((resolve, reject) => {
                setTimeout(() => resolve(
                [ this.reverseRoad()]
                ), pathLen * this.speed);
              });

          }
        });
      });
      pathLen++;
      NodesToCheck = this.searchForNodes(pathLen);
    }
  }





  reverseRoad() {
    let currentNode = this.searchFor(this.endNode[0], this.endNode[1]),
    stop = 0, curCurrentNode;


    while (currentNode != this.start && stop == 0 && currentNode.isActive == 2) {
      let minValue = currentNode.value;

      currentNode.nodeConnections.forEach(node => {
        const realNode = this.searchFor(node[0], node[1]);

        if (realNode.value < minValue) {
          curCurrentNode = realNode;
          minValue = realNode.value;


        }
      });
      currentNode = curCurrentNode;
      currentNode.isRoad = 1;
    }

  }




  //////////////////////////////////////////////////////////// REUSABLE CODE //////////////////////////////////////////////////////////

  searchForNodes(value: number) {

    const nextNodes = [];

    this.graph.forEach(node => {
      if (node.value == value) {
        nextNodes.push(node);
      }
    });
    // console.log(this.graph[index_node-1])
    return nextNodes;
  }

  searchFor(x: number, y: number) {
    let newX, newY;
    let index_node = 0;

    while (newX !== x || newY !== y) { // szukanie node'a, odpowiednik szukania po kluczu w słowniku
      newX = this.graph[index_node].x;
      newY = this.graph[index_node].y;

      index_node += 1; // jezeli za pierwszym podejsciem sie uda, to index_node zostanie 0

    }
    // console.log(this.graph[index_node-1])
    return this.graph[index_node - 1];
  }

  searchForRoad() {

    const nextNodes = [];

    this.graph.forEach(node => {
      if (node.isRoad === 1 && node.isActive === 2) {
        nextNodes.push(node);
      }
    });
    // console.log(this.graph[index_node-1])
    return nextNodes;
  }

  makeRandomWalls() {
    this.graph.forEach(node => {
      const isWall = Math.floor(Math.random() * 4);

      if (isWall == 1 && node != this.start && node != this.end) {
        node.isActive = 0;
      }

    });
  }









  ////////////////////////////////////////////////////// ANIMATIONS BITCHHHHH ////////////////////////////////////////////////////////////

  animate() {
    requestAnimationFrame(() => {this.animate(); });
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.graph.forEach(node => {
      node.update();


    });

    // narysuj początek i koniec
    this.drawRect(this.end.x, this.end.y, 'hsla(332, 100%, 50%, 1)');
    this.drawRect(this.start.x, this.start.y, 'hsla(146, 100%, 35%, 1)');

    // this.ctx.fillText('HTML CANVAS TEMPLATE' , this.mouse.x, this.mouse.y);
  }

  // do narysowanie początku i końca

  drawRect(x, y, color) {
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * this.userChoice.size , y * this.userChoice.size,
      this.userChoice.size - 1, this.userChoice.size  - 1);
  }

}




//////////////////////////////////////////////////////// OBJECTS ///////////////////////////////////////////////////////////////////////////


export function Node(x: number, y: number, nodeConnections: any[], height: number, ctx, mouse) { // mouse
  this.x = x;
  this.y = y;
  this.nodeConnections = nodeConnections;
  this.activeConnections = this.nodeConnections.length;
  this.value = undefined;


  
  

  this.ctx = ctx;
  this.isActive = 1;
  this.isRoad = 0;
  this.drawColor = 0;

  // do rysowania

  this.height = height;
  this.animate = 0;

  this.change = () => {
    this.animate = 0;
  };

  this.colors = {
    wall: 'hsl(195, 100%, 8%)',
    road: 'hsla(203, 100%, 40%, 1)',
    untouched: 'hsl(195, 0%, 91%)',
    xd: 'hsl(195, 0%, 91%)',
    touched: 'hsla(203, 100%, 82%, 1)'
  };
  this.curCol;



  this.drawRect = () => {
    if (this.isActive === 0) { // dla ścian: bardzo ciemny
      this.curCol = this.colors.wall;
    } else if (this.isRoad === 1) { // dla drogi: granat
      this.curCol = this.colors.road;
    } else if (this.value === undefined) { // dla untouched szary
      this.curCol = this.colors.untouched;
    } else if (this.isActive === 1) {
      this.curCol = this.colors.xd;
    } else if (this.isActive === 2) { // dla oglądniętych
      this.curCol = this.colors.touched;
    }
    if (this.animate < 20) {
        this.ctx.fillStyle = this.colors.untouched;
        this.ctx.fillRect(this.x * this.height , this.y * this.height ,
        height  - 1, height  - 1);

        this.ctx.fillStyle = this.curCol;
        this.ctx.fillRect(this.x * this.height + (this.height * 2 ) / this.animate - 1, this.y * this.height + (this.height * 2) / this.animate - 1,
        this.animate * this.height / 20 - 1, this.animate * this.height / 20 - 1);

        this.animate += 1;
    } else {
      this.ctx.fillStyle = this.curCol;
      this.ctx.fillRect(this.x * this.height , this.y * this.height ,
                      height  - 1, height  - 1);
    }


  };

  this.draw = () => {
    this.ctx.fillStyle = 'hsl(295, 100%, 50%)';
    this.ctx.fillRect(this.x * this.height , this.y * this.height ,
      height  - 1, height  - 1);
  };

  this.update = function() {



    if (mouse.x - this.x * this.height - this.height < 0 && mouse.x - this.x * this.height > 0
      && mouse.y - this.y * this.height - this.height < 0 && mouse.y - this.y * this.height > 0 ) {
      this.draw();
    } else {
      this.drawRect();
    }
  };
}
