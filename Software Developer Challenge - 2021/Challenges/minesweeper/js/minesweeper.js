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
		states: {
			UNKNOWN: 'UNKNOWN',
			FLAGGED: 'FLAGGED',
			REVEALED: 'REVEALED',
			EXPLODE: 'EXPLODE',
			QUESTION: 'QUESTION',
		},
		timerPad: 3,
	},
	gameOptions = {
		data: {
			timerInterval: null,
		},
		time: 0,
		difficulty: settings.difficulties.find(d => d.name === 'easy'),
		state: {
			game: false,
			remainingMines: 0,
		},
	}
;

window.addEventListener('DOMContentLoaded', event => {
	document.getElementById('timer').innerHTML = gameOptions.time?.toString()?.padStart(settings.timerPad, '0');
	document.getElementById('flagCount').innerHTML = gameOptions.difficulty.mines?.toString()?.padStart(settings.timerPad, '0');
});

window.addEventListener('mousedown', e => {   
	if(e.button === 0 && document.getElementById('minefield')?.contains(e.target)) { // clicked in minefield
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

	// Build DOM Grid
	let tile;
	for(let y = 0; y < rows; y++) {
		for(let x = 0; x < columns; x++) {
			tile = createTile(x, y);
			grid.appendChild(tile);
		}
	}
	const style = window.getComputedStyle(tile);

	const width = parseInt(style.width.slice(0, -2));
	const height = parseInt(style.height.slice(0, -2));

	grid.style.width = (columns * width) + 'px';
	grid.style.height = (rows * height) + 'px';
};

const createTile = (x, y) => {
	const tile = document.createElement('div');

	tile.classList.add('tile');
	tile.classList.add('hidden');
	
	tile.addEventListener('auxclick', e => { e.preventDefault(); }); // Middle Click
	tile.addEventListener('contextmenu', e => { e.preventDefault(); }); // Right Click
	tile.addEventListener('mouseup', handleTileClick ); // All Clicks

	const mine = document.createAttribute('data-mine');       
	mine.value = 'false';
	tile.setAttributeNode(mine);
	return tile;
};

const startGame = () => {
	buildGrid();
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
	console.log('mouse click:' + event.which);
	const
		tile = event.target
	;
	if(gameOptions.state.game === false) {
		gameOptions.state.game = true;
		startOver();
		console.log(gameOptions.difficulty);
	}
	if(!tile.classList.contains('hidden')) {
		return;
	}
	// Left Click
	if(event.which === 1) { // reveal a tile
		if(tile.classList.contains('flag')) return;
		tile.classList.remove('hidden');
	}
	// Middle Click
	else if(event.which === 2) {
		if(tile.classList.contains('flag')) return;
		//TODO try to reveal adjacent tiles
	}
	// Right Click
	else if(event.which === 3) { // toggle a tile flag
		//TODO toggle a tile flag
		if(tile.classList.contains('flag')) {
			tile.classList.remove('flag');
		} else {
			tile.classList.add('flag');
		}
	}
};

const setDifficulty = () => {
	const
		difficultySelector = document.getElementById('difficulty')
	;
	//console.log(difficultySelector.options);
	gameOptions.difficulty = settings.difficulties[difficultySelector.selectedIndex];
	//TODO implement me
};

const startOver = () => {
	gameOptions.time = 0;
	if(gameOptions.data.timerInterval !== null) {
		window.clearInterval(gameOptions.data.timerInterval);
	}
	gameOptions.data.timerInterval = window.setInterval(onTimerTick, 1000);
	updateTimer();

	gameOptions.state.remainingMines = gameOptions.difficulty.mines;
	document.getElementById('flagCount').innerHTML = gameOptions.state.remainingMines?.toString()?.padStart(settings.timerPad, '0');
};

const onTimerTick = () => {
	gameOptions.time++;
	updateTimer();
};

const updateTimer = () => {
	document.getElementById('timer').innerHTML = gameOptions.time?.toString()?.padStart(settings.timerPad, '0');
};
