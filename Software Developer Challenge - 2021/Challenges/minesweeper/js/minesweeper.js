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
			first: true,
		},
	}
;

window.addEventListener('DOMContentLoaded', event => {
	document.getElementById('timer').innerHTML = gameOptions.time?.toString()?.padStart(settings.timerPad, '0');
	document.getElementById('flagCount').innerHTML = gameOptions.difficulty.mines?.toString()?.padStart(settings.timerPad, '0');
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
		grid = document.getElementById('minefield'),
		columns = gameOptions.difficulty.cols,
		rows = gameOptions.difficulty.rows
	;
	grid.innerHTML = '';
	gameOptions.state.tiles = [];

	// Build DOM Grid
	let
		tile
	;
	for(let y = 0; y < rows; y++) {
		for(let x = 0; x < columns; x++) {
			tile = createTile(x, y);
			gameOptions.state.tiles.push(tile);
		}
	}
	placeRandomisedMines();
	for(tile of gameOptions.state.tiles) {
		grid.appendChild(tile);
	}
	const style = window.getComputedStyle(tile);

	const width = parseInt(style.width.slice(0, -2));
	const height = parseInt(style.height.slice(0, -2));

	grid.style.width = (columns * width) + 'px';
	grid.style.height = (rows * height) + 'px';
};

const placeRandomisedMines = () => {
	let
		count = 0
	;
	//console.log('placeRandomisedMines');
	// shuffle tiles to place mines
	for(tile of gameOptions.state.tiles) {
		const
			mine = document.createAttribute('data-mine')
		;
		mine.value = (count++ < gameOptions.state.remainingMines) ? 'true' : 'false';
		tile.setAttributeNode(mine);
		//console.log(mine.value);
	}
	gameOptions.state.tiles = shuffle(gameOptions.state.tiles);
};

const createTile = (x, y) => {
	const
		tile = document.createElement('div')
	;
	tile.classList.add('tile');
	tile.classList.add('hidden');

	tile.addEventListener('auxclick', e => { e.preventDefault(); }); // Middle Click
	tile.addEventListener('contextmenu', e => { e.preventDefault(); }); // Right Click
	tile.addEventListener('mouseup', handleTileClick ); // All Clicks
	return tile;
};

const startGame = () => {
	gameOptions.time = 0;
	gameOptions.state.remainingMines = gameOptions.difficulty.mines;
	gameOptions.state.flags = 0;
	gameOptions.state.first = true;
	document.getElementById('flagCount').innerHTML = gameOptions.state.remainingMines?.toString()?.padStart(settings.timerPad, '0');
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

const handleTileClick = event => {
	if(gameOptions.state.game === 'ended') return;
	//console.log('mouse click: ' + event.which);
	const
		tile = event.target
	;
	if(gameOptions.state.game === 'ready') {
		gameOptions.state.game = 'started';
		startTimer();
		console.log(gameOptions.difficulty);
	}
	if(!tile.classList.contains('hidden')) {
		return;
	}
	// Left Click
	if(event.which === 1) { // reveal a tile
		if(tile.classList.contains('flag')) return;
		tile.classList.remove('hidden');
		if(tile.getAttributeNode('data-mine')?.value === 'true') {
			console.log('MINE!!!!!!!', gameOptions.state.first);
			if(gameOptions.state.first) {
				buildGrid();
				return;
			}
			tile.classList.add('mine_hit');
			gameOver();
		}
		if(gameOptions.state.first) {
			gameOptions.state.first = false;
		}
	}
	// Middle Click
	else if(event.which === 2) {
		if(tile.classList.contains('flag')) return;
		//TODO try to reveal adjacent tiles
	}
	// Right Click
	else if(event.which === 3 && (gameOptions.state.flags < gameOptions.state.remainingMines)) { // toggle a tile flag
		if(tile.classList.contains('flag')) {
			tile.classList.remove('flag');
			gameOptions.state.flags--;
		} else {
			tile.classList.add('flag');
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

const gameOver = () => {
	if(gameOptions.state.game) {
		gameOptions.state.game = 'ended';
		clearInterval(gameOptions.data.timerInterval);
		gameOptions.data.timerInterval = null;
		gameOptions.time = 0;
		for(const tile of gameOptions.state.tiles) {
			//console.log(tile.getAttributeNode('data-mine').value);
			if(tile.classList.contains('flag')) {
				tile.classList.add('mine_marked');
			}
			else if(tile.getAttributeNode('data-mine')?.value === 'true' && !tile.classList.contains('mine_hit')) {
				tile.classList.add('mine');
			}
		}
		updateTimer();
		const smiley = document.getElementById('smiley');
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
	//	gameOver();
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