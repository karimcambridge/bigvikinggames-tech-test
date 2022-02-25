const
	settings = {
		difficulties: [
			{
				id: 0,
				name: 'easy',
				cols: 9,
				rows: 9,
				mines: 10,
			},
			{
				id: 1,
				name: 'medium',
				cols: 16,
				rows: 16,
				mines: 40,
			},
			{
				id: 2,
				name: 'hard',
				cols: 30,
				rows: 16,
				mines: 99,
			},
		],
		timerPad: 3,
	},
	gameOptions = {
		grid: null,
		data: {
			timerInterval: null,
		},
		time: 0,
		difficulty: settings.difficulties.find(d => d.name === 'easy'),
		state: {
			game: 'ended',
			remainingMines: 0,
			flags: 0,
			tiles: [],
			board: [],
			first: true,
		},
	}
;

window.addEventListener('DOMContentLoaded', event => {
	gameOptions.grid = document.getElementById('minefield');
	document.getElementById('timer').textContent = gameOptions.time?.toString()?.padStart(settings.timerPad, '0');
	document.getElementById('flagCount').textContent = gameOptions.difficulty.mines?.toString()?.padStart(settings.timerPad, '0');
});

window.addEventListener('mousedown', e => {   
	if(e.button === 0 && gameOptions.state.game !== 'ended' && document.getElementById('minefield')?.contains(e.target)) { // clicked in minefield
		const smiley = document.getElementById('smiley');
		smiley.classList.add('face_limbo');
	}
});

window.addEventListener('mouseup', e => {   
	// mouse dragged anywhere
	if(e.button === 0) {
		const smiley = document.getElementById('smiley');
		if(smiley.classList.contains('face_limbo')) {
			smiley.classList.remove('face_limbo');
		}
	}
});

const buildGrid = () => {
	// Fetch grid and clear out old elements.
	const
		columns = gameOptions.difficulty.cols,
		rows = gameOptions.difficulty.rows
	;
	gameOptions.grid.innerHTML = '';
	gameOptions.state.tiles = [];
	gameOptions.state.board = [];

	// Build DOM Grid
	let
		tile
	;
	for(let y = 0; y < rows; y++) {
		const
			row = []
		;
		for(let x = 0; x < columns; x++) {
			tile = createTile(x, y);
			gameOptions.state.tiles.push(tile);
			row.push(tile);
		}
		gameOptions.state.board.push(row);
	}
	placeRandomisedMines();
	for(tile of gameOptions.state.tiles) {
		gameOptions.grid.appendChild(tile.element);
	}
	const style = window.getComputedStyle(tile.element);

	const width = parseInt(style.width.slice(0, -2));
	const height = parseInt(style.height.slice(0, -2));

	gameOptions.grid.style.width = (columns * width) + 'px';
	gameOptions.grid.style.height = (rows * height) + 'px';
};

const placeRandomisedMines = () => {
	console.log('placeRandomisedMines', gameOptions.state.remainingMines);
	let
		shuffledBoard = new Array(gameOptions.state.tiles.length).fill('false')
	;
	shuffledBoard.fill('true', 0, gameOptions.difficulty.mines);
	// shuffle to place mines
	shuffledBoard = shuffle(shuffledBoard);

	// prevent positions being shuffled
	for(let i = 0; i < shuffledBoard.length; i++) {
		if(shuffledBoard[i] === 'true') {
			console.log(i, shuffledBoard[i]);
		}
		gameOptions.state.tiles[i].element.setAttribute('data-mine', shuffledBoard[i]);
	}
};

const createTile = (x, y) => {
	const
		tile = {}
	;
	tile.element = document.createElement('div');
	tile.element.classList.add('tile');
	tile.element.classList.add('hidden');

	tile.element.addEventListener('auxclick', e => e.preventDefault()); // Middle Click
	tile.element.addEventListener('contextmenu', e => e.preventDefault()); // Right Click
	tile.element.addEventListener('mouseup', event => handleTileClick(event, tile)); // All Clicks
	tile.position = { x, y };
	return tile;
};

const getNearbyTiles = (x, y) => {
	const
		tiles = []
	;
	for(let i = -1; i <= 1; i++) {
		for(let j = -1; j <= 1; j++) {
			if(i === 0 && j === 0) {
				continue;
			}
			const
				tile = gameOptions.state.board[y + i]?.[x + j]
			;
			//console.log(tile);
			if(tile) {
				tiles.push(tile);
			}
		}
	}
	return tiles;
};

const startGame = () => {
	gameOptions.time = 0;
	gameOptions.state.remainingMines = gameOptions.difficulty.mines;
	gameOptions.state.flags = 0;
	gameOptions.state.first = true;
	document.getElementById('flagCount').textContent = gameOptions.state.remainingMines?.toString()?.padStart(settings.timerPad, '0');
    killTimer();
	buildGrid();
	if(gameOptions.state.game === 'ended') {
		const smiley = document.getElementById('smiley');
		if(smiley.classList.contains('face_win')) {
			smiley.classList.remove('face_win');
		}
		if(smiley.classList.contains('face_lose')) {
			smiley.classList.remove('face_lose');
		}
	}
	gameOptions.state.game = 'ready';
};

const smileyDown = () => {
	const smiley = document.getElementById('smiley');
	smiley.classList.add('face_down');
};

const smileyUp = () => {
	const smiley = document.getElementById('smiley');
	smiley.classList.remove('face_down');
};

const revealTile = (tile, event) => {
	if(tile.element.classList.contains('flag')) return;
	if(tile.element.classList.contains('hidden')) {
		tile.element.classList.remove('hidden');
		if(tile.element.getAttributeNode('data-mine')?.value === 'true') {
			console.log('You hit a mine', gameOptions.state.first);
			if(gameOptions.state.first) {
				const
					index = gameOptions.state.tiles.indexOf(tile)
				;
				buildGrid();
				handleTileClick(event, gameOptions.state.tiles[index]);
				return;
			}
			tile.element.classList.add('mine_hit');
			gameEnd('lose');
			return;
		}
		if(gameOptions.state.first) {
			gameOptions.state.first = false;
		}
		const
			nearbyTiles = getNearbyTiles(tile.position.x, tile.position.y),
			nearbyMines = nearbyTiles.filter(tile => tile.element.getAttribute('data-mine') === 'true').length
		;
		if(nearbyMines === 0) {
			nearbyTiles.forEach(tile => revealTile(tile));
		} else {
			tile.element.textContent = nearbyMines;
		}
	}
};

const handleTileClick = (event, tile) => {
	if(gameOptions.state.game === 'ended') return;
	//console.log('mouse click: ' + event.which);
	if(gameOptions.state.game === 'ready') {
		gameOptions.state.game = 'started';
		startTimer();
		console.log(gameOptions.difficulty);
	}
	if(!tile.element.classList.contains('hidden')) {
		return;
	}
	// Left Click
	if(event.which === 1) { // reveal a tile
		revealTile(tile, event);
		if(gameOptions.state.remainingMines === 0) {
			gameEnd('win');
		}
	}
	// Middle Click
	else if(event.which === 2) {
		if(tile.element.classList.contains('flag')) return;
		//TODO try to reveal adjacent tiles
	}
	// Right Click
	else if(event.which === 3) { // toggle a tile flag
		// && (gameOptions.state.flags < gameOptions.state.remainingMines) // ?
		if(tile.element.classList.contains('flag')) {
			tile.element.classList.remove('flag');
			gameOptions.state.flags--;
		} else {
			tile.element.classList.add('flag');
			gameOptions.state.flags++;
		}
		const
			minesLeft = (gameOptions.state.remainingMines - gameOptions.state.flags)
		;
		document.getElementById('flagCount').innerHTML = minesLeft?.toString()?.padStart(settings.timerPad, '0');
	}
};

const setDifficulty = () => {
	const
		difficultySelector = document.getElementById('difficulty')
	;
	//console.log(difficultySelector.options);
	gameOptions.difficulty = settings.difficulties[difficultySelector.selectedIndex];
};

const gameEnd = result => {
	const
		smiley = document.getElementById('smiley')
	;
	if(gameOptions.state.game) {
		gameOptions.state.game = 'ended';
		clearInterval(gameOptions.data.timerInterval);
		gameOptions.data.timerInterval = null;
		gameOptions.time = 0;
		//gameOptions.grid.addEventListener('click', stopProp, { capture: true });
		//gameOptions.grid.addEventListener('contextmenu', stopProp, { capture: true });
	}
	if(result === 'win') {
		if(smiley) {
			smiley.classList.add('face_win');
		}
	} else {
		for(const tile of gameOptions.state.tiles) {
			//console.log(tile.element.getAttributeNode('data-mine').value);
			if(tile.element.classList.contains('flag')) {
				tile.element.classList.add('mine_marked');
			}
			else if(tile.element.getAttributeNode('data-mine')?.value === 'true' && !tile.element.classList.contains('mine_hit')) {
				tile.element.classList.add('mine');
			}
		}
		updateTimer();
		if(smiley) {
			smiley.classList.add('face_lose');
		}
	}
};

const startTimer = () => {
	killTimer();
	gameOptions.data.timerInterval = window.setInterval(onTimerTick, 1000);
	updateTimer();
};

const onTimerTick = () => {
	gameOptions.time++;
	updateTimer();
	//if(gameOptions.time === 2) {
	//	gameEnd();
	//}
};

const updateTimer = () => {
	document.getElementById('timer').innerHTML = gameOptions.time?.toString()?.padStart(settings.timerPad, '0');
};

const killTimer = () => {
	if(gameOptions.data.timerInterval !== null) {
		window.clearInterval(gameOptions.data.timerInterval);
	}
};

const getNeighbours = (x, y) => {
	const list = [];
	const minX = Math.max(0, x - 1);
	const maxX = Math.min(this.getX - 1, x + 1);
	const minY = Math.max(0, y - 1);
	const maxY = Math.min(this.getY - 1, y + 1);
	for(let x0 = minX; x0 <= maxX; x0++) {
		for(let y0 = minY; y0 <= maxY; y0++) {
			if(x0 !== x || y0 !== y) {
				//list.push(this.map[y0][x0]);
			}
		}
	}
	return list;
};

/*
	Fisher-Yates shuffle
*/

const shuffle = array => {
	var m = array.length, t, i;

	// While there remain elements to shuffle…
	while(m) {
		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);

		// And swap it with the current element.
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
};

const stopProp = event => {
	event.stopImmediatePropagation();
};
