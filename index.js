const gamesBoardContainer = document.querySelector("#gamesboard-container");

const optionContainer = document.querySelector(".option-container");
const flipButton = document.querySelector("#flip-btn");
const startButton = document.querySelector("#start-btn");
const infoDisplay = document.querySelector("#info");
const turnDisplay = document.querySelector("#turn-display");
const hitSound = new Audio('Sound/counter-strike-c4-sound-edited.mp3')
const misSound = new Audio('Sound/water-splash.mp3')

let angle = 0;
function flip() {
  const optionShips = Array.from(optionContainer.children);
  angle = angle === 0 ? 90 : 0;
  optionShips.forEach((optionShip) => (optionShip.style.transform = `rotate(${angle}deg)`))
}

flipButton.addEventListener('click', flip)
const width = 10;

function createBoard(color, user) {
  const gameBoardContainer = document.createElement("div");
  gameBoardContainer.classList.add("game-board");
  gameBoardContainer.style.backgroundColor = color;
  gameBoardContainer.id = user;

  for (let i = 0; i < width * width; i++) {
    const block = document.createElement("div");
    block.classList.add("block");
    block.id = i;
    gameBoardContainer.append(block);
  }

  gamesBoardContainer.append(gameBoardContainer);
}
createBoard("hsl(200, 100%, 50%)", "player");
createBoard("hsl(200, 100%, 50%)", "computer");

class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

const destroyer = new Ship("destroyer", 2);
const submarine = new Ship("submarine", 3);
const cruiser = new Ship("cruiser", 3);
const battleship = new Ship("battleship", 4);
const carrier = new Ship("carrier", 5);

const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped;

function handleValidity(allBoardBlocks, isHorizontal, startIndex, ship){

    let validStart = isHorizontal ? startIndex <=  width * width - ship.length ? startIndex : width * width - ship.length : 

  startIndex <= width * width - width * ship.length ? startIndex :
    startIndex  - ship.length * width + width



  let shipBlocks = [];


  for (let i = 0; i < ship.length; i++) {
    if (isHorizontal) {
      shipBlocks.push(allBoardBlocks[Number(validStart) + i]);
    } else {
      shipBlocks.push(allBoardBlocks[Number(validStart) + i * width]);
    }
  }

let valid;
if (isHorizontal) {
    shipBlocks.every((_shipBlock, index) =>
        valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1)))
} else {
        shipBlocks.every((_shipBlock, index) =>
           valid = shipBlocks[0].id < 90 + (width * index + 1)
    )
}
    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

    return {shipBlocks, valid, notTaken}

}


function addShipPiece(user, ship, startId) {
  const allBoardBlocks = document.querySelectorAll(`#${user} div`);
  let randomBoolean = Math.random() < 0.5;

  let isHorizontal = user === 'player' ? angle === 0 : randomBoolean;

  let randomStartIndex = Math.floor(Math.random() * width * width);

  let startIndex = startId ? startId : randomStartIndex;

  const { shipBlocks, valid, notTaken } = handleValidity(allBoardBlocks, isHorizontal, startIndex, ship)


    if (valid && notTaken){

    shipBlocks.forEach((shipBlock, index) => {
  shipBlock.classList.add(ship.name);
  shipBlock.classList.add('taken');


  if (isHorizontal) {
    if (index === 0) {
      shipBlock.classList.add('ship-start-horizontal');
    } else if (index === shipBlocks.length - 1) {
      shipBlock.classList.add('ship-end-horizontal');
    }
  } else {
    if (index === 0) {
      shipBlock.classList.add('ship-start-vertical');
    } else if (index === shipBlocks.length - 1) {
      shipBlock.classList.add('ship-end-vertical');
    }
  }
});
}   else{
        if (user === 'computer') addShipPiece(user,ship, startId)
        if (user === 'player') notDropped = true;
}




// console.log(shipBlocks)
}


    // addShipPiece(destroyer)
ships.forEach(ship => addShipPiece('computer',ship))

// draggin ship section

let draggedShip;
const optionShips = Array.from(optionContainer.children)

optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach (playerBlock => {
playerBlock.addEventListener('dragover', dragover)
playerBlock.addEventListener('drop', dropShip)
})

function dragStart(e) {
    notDropped = false;
draggedShip = e.target
}

function dragover(e){
    e.preventDefault()
    const ship = ships[draggedShip.id]
    highlightArea(e.target.id, ship)

}

 function dropShip(e) {
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    addShipPiece('player', ship, startId)
    if(!notDropped){
        draggedShip.remove()
    }
 }

 // highlight area
 function highlightArea( startIndex, ship) {
    const allBoardBlocks = document.querySelectorAll('#player div')
    let isHorizontal = angle === 0;

    const { shipBlocks, valid, notTaken} = handleValidity(allBoardBlocks, isHorizontal, startIndex, ship)
    
    if(valid && notTaken){
        shipBlocks.forEach(shipBlock =>{
            shipBlock.classList.add('hover')
            setTimeout(()=> shipBlock.classList.remove('hover'), 500)
        })
    }
}

let gameOver = false;
let playerTurn;

function startGame(){
    
    if (playerTurn === undefined){

         if (optionContainer.children.length != 0) {          // this checks if ships are on board so it starts then
        infoDisplay.textContent = 'Please place all your pieces first!'
    } else{
        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))

        playerTurn = true;
        turnDisplay.textContent = "Your Turn!"
        infoDisplay.textContent = "The Game has Started!"
    }
    

    }
   
}

startButton.addEventListener('click', startGame)

let playerHits = []
let computerHits = []
const playerSunkShips = []
const computerSunkShips = []

function handleClick(e){
    if (!gameOver){
        if (e.target.classList.contains('taken')){
            e.target.classList.add('boom')
            infoDisplay.textContent = "A Ship got hit!"
            hitSound.currentTime = 0;
            hitSound.play()

            let classes = Array.from(e.target.classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            playerHits.push(...classes)
            checkScore('player', playerHits, playerSunkShips)
        }
        if (!e.target.classList.contains('taken')){
            infoDisplay.textContent = "Nothing Got Hit"
            e.target.classList.add('empty')
            misSound.currentTime = 0;
            misSound.play() 
        }
        playerTurn = false;
        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))  //  removing all event listeners from all items if more than 1
        setTimeout(computerGo, 3000)
    }
}

// making computer move here
function computerGo(){
    if (!gameOver){
        turnDisplay.textContent = "Computer's Go!"
        infoDisplay.textContent = "The Computer is thinking..."

        setTimeout(()=>{
           let randomGo = Math.floor(Math.random() * width * width)
           const allBoardBlocks = document.querySelectorAll('#player div')

           if (allBoardBlocks[randomGo].classList.contains('taken') && 
           allBoardBlocks[randomGo].classList.contains('boom')){
            computerGo()
            return
           } else if (allBoardBlocks[randomGo].classList.contains('taken') &&
        !allBoardBlocks[randomGo].classList.contains('boom') ){
            allBoardBlocks[randomGo].classList.add('boom')
            infoDisplay.textContent = "The computer hit your ship!"
            let classes = Array.from(allBoardBlocks[randomGo].classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            computerHits.push(...classes)
            checkScore('computer', computerHits, computerSunkShips)


        }   else{
            infoDisplay.textContent = "Nothing hit this time"
            allBoardBlocks[randomGo].classList.add('empty')
        }
        },3000)

        setTimeout(()=>{
            playerTurn = true;
            turnDisplay.textContent = "Your Go!"
            infoDisplay.textContent = "Please take your go."
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))


        }, 6000)


    }
}

function checkScore(user, userHits, userSunkShips){

    function checkShip(shipName, shipLength) {
if (
    userHits.filter(storedShipName => storedShipName === shipName).length === shipLength){

    
        if(user === 'player'){
            infoDisplay.textContent = `you sunk the computer's ${shipName}`
            playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
        }

          if(user === 'computer'){
            infoDisplay.textContent = `The computer sunk your ${shipName}`

            computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
        }
        userSunkShips.push(shipName)
    
     }
  }

  checkShip('destroyer', 2)
  checkShip('submarine', 3)
  checkShip('cruiser', 3)
  checkShip('battleship', 4)
  checkShip('carrier', 5)


  if (playerSunkShips.length === 5){
    infoDisplay.textContent = "you sunk all the computers ships. You Won!"
    gameOver = true;
  }
  if (computerSunkShips.length === 5){
    infoDisplay.textContent = "The computer has sunk all your ships. You Lost!"
    gameOver = true;

  }
}
