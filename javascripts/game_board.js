// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var GameBoard = function()
{
	var gameMode = GAME_MODE_TITLE;
	var prevGameMode = GAME_MODE_TITLE;
	
	var keyPressed = false;
	var helpKeyPressed = false;
	var helpScreen = FIRST_HELP_SCREEN;
	var pause = false;
	
	var mouseMode = false;  // Workaround for touch screens
	
	var curLevelData = null;
	var curLevelNum = 0;
	
	var sequenceProgress = 0;
	var lastDate = new Date();
	var modeChangeDate = new Date();
	
	var startScore = 0;
	
	try
	{
		var ac = null;
		
		var lc = new LevelCanvas(document.getElementById("LevelCanvas"), TILE_WIDTH, TILE_HEIGHT);
		
		var ic = new InfoCanvas(document.getElementById("LevelCanvas"));
	}
	catch(err)
	{
		alert(err);
	}
	
	var lcNeedsRedraw = true;
	
	var cameraRectangle = new Rectangle();
	
	var setLevel = function(num)
	{
		curLevelData = new LevelData(JSON.parse(LEVEL_JSON[num]));
		lc.setLevelData(curLevelData);
		cameraRectangle = lc.getCameraRectangle();
		if (curLevelData.heroObject !== null)
		{
			lc.setCamera(curLevelData.heroObject.location.x - Math.floor(cameraRectangle.width()/2), curLevelData.heroObject.location.y - Math.floor(cameraRectangle.height()/2));
			lcNeedsRedraw = true;
		}
		
		// Start with score from previous levels
		curLevelData.score = startScore;
		NICOLE_MODE = false;
	};
	
	var scrollCanvas = function(deltaX, deltaY)
	{
		var cameraRectangle = lc.getCameraRectangle();
		if (deltaX > 0 && curLevelData.heroObject.location.x < cameraRectangle.right - (cameraRectangle.width()/3))
		{
			deltaX = 0;
		}
		else if (deltaX < 0 && curLevelData.heroObject.location.x > cameraRectangle.left + (cameraRectangle.width()/3))
		{
			deltaX = 0;
		}
		if (deltaY > 0 && curLevelData.heroObject.location.y < cameraRectangle.bottom - (cameraRectangle.height()/3))
		{
			deltaY = 0;
		}
		else if (deltaY < 0 && curLevelData.heroObject.location.y > cameraRectangle.top + (cameraRectangle.height()/3))
		{
			deltaY = 0;
		}
		
		
		if (deltaX !== 0 || deltaY !== 0)
		{
			lc.scroll(deltaX, deltaY);
		}
	};
	
	var updateGameObjects = function()
	{
		var oldHeroX = 0;
		var oldHeroY = 0;
		
		if (curLevelData.heroObject !== null)
		{
			// Store location of hero prior to actions
			oldHeroX = curLevelData.heroObject.location.x;
			oldHeroY = curLevelData.heroObject.location.y;
		}
		
		curLevelData.updateGameObjects();
		
		// Scroll the canvas based on change in hero's location
		if (curLevelData.heroObject !== null)
			scrollCanvas(curLevelData.heroObject.location.x - oldHeroX, curLevelData.heroObject.location.y - oldHeroY);
	};
	
	$(document).keydown(function(e) {
	
		mouseMode = false;
		
		var key = e.which;
			
		if($.inArray(key,ar) > -1) {
			e.preventDefault();
			return false;
		}
		return true;
	});
	
	$(document).keyup(function(e) {
		
		var key = e.which;
		
		if (e.keyCode === 27 || key === 72)
			helpKeyPressed = true;
		
		keyPressed = true;
			
		// If user presses f key, toggle the FPS display
		if (key === 70)
			lc.toggleShowFrameRate();
			
		if (sequenceProgress < NICOLE_SEQUENCE.length && key === NICOLE_SEQUENCE[sequenceProgress])
			++sequenceProgress;
		else
			sequenceProgress = 0;
		
		if (sequenceProgress >= NICOLE_SEQUENCE.length && curLevelData.herObject !== null)
		{
			NICOLE_MODE = true;
			curLevelData.heroObject.attributeBits &= ~BIT_MASK_VULNERABLE;
		}
			
		if($.inArray(key,ar) > -1) {
			e.preventDefault();
			return false;
		}
		return true;
	});
	
	var drawPause = function()
	{
		var displayCanvas = new PhysicalCanvas(document.getElementById("LevelCanvas"));
	
		displayCanvas.context.beginPath();
		displayCanvas.context.rect(0, 150, displayCanvas.canvas.width, 150);
		displayCanvas.context.fillStyle = 'gray';
		displayCanvas.context.fill();
				
		displayCanvas.context.beginPath();
		displayCanvas.strokeStyle="black";
		displayCanvas.context.rect(0, 150, displayCanvas.canvas.width, 150);
		displayCanvas.context.stroke();
				
		displayCanvas.context.font=("60px Arial");
		displayCanvas.context.fillStyle = 'black';
		displayCanvas.context.fillText("GAME PAUSED", 112, displayCanvas.canvas.height - 300);
		displayCanvas.context.fillStyle = 'red';
		displayCanvas.context.fillText("GAME PAUSED", 110, displayCanvas.canvas.height - 302);
		displayCanvas.context.font=("30px Arial");
		displayCanvas.context.fillStyle = 'black';
		displayCanvas.context.fillText("Click on or touch game screen to resume.", 42, displayCanvas.canvas.height - 250);
		displayCanvas.context.fillStyle = 'white';
		displayCanvas.context.fillText("Click on or touch game screen to resume.", 40, displayCanvas.canvas.height - 252);
				
		displayCanvas.context.beginPath();
		displayCanvas.context.rect(0, displayCanvas.canvas.height - CONSOLE_HEIGHT, displayCanvas.canvas.width, CONSOLE_HEIGHT);
		displayCanvas.context.fillStyle = 'white';
		displayCanvas.context.fill();
		
		displayCanvas.context.font=("20px Arial");
		displayCanvas.context.fillStyle = 'black';
		displayCanvas.context.fillText("Keyboard focus lost.", 20, displayCanvas.canvas.height - 8);
	};
	
	var setGameMode = function(mode)
	{
		prevGameMode = gameMode;
		gameMode = mode;
		modeChangeDate = new Date();
		
		switch(mode)
		{
			case GAME_MODE_TITLE:
				ac = new AnimatedCanvas(document.getElementById("LevelCanvas"), ANIMATED_TITLE_CANVAS, startScore);
				ac.reset();
				break;
			case GAME_MODE_PLAY:
				break;
			case GAME_MODE_OVER:
				ac = new AnimatedCanvas(document.getElementById("LevelCanvas"), ANIMATED_GAME_OVER_CANVAS, startScore);
				ac.reset();
				break;
			case GAME_MODE_INFO:
				break;
			case GAME_MODE_WIN:
				ac = new AnimatedCanvas(document.getElementById("LevelCanvas"), ANIMATED_WIN_CANVAS, startScore);
				ac.reset();
				break;
		}
	}
	
	var executePlayFrame = function()
	{
		checkKeys();
		
		updateGameObjects();
		
		if (lc.imagesLoaded())
		{
			if (lcNeedsRedraw)
			{
				lc.drawAllForeground();
				lcNeedsRedraw = false;
			}
			lc.draw();
		}
						
		if (curLevelData.state === LEVEL_STATE_LOSE)
		{
			setGameMode(GAME_MODE_OVER);
			setLevel(curLevelNum);
		}
		else if (curLevelData.state === LEVEL_STATE_WIN)
		{
			startScore=curLevelData.score;
			
			++curLevelNum;
			
			if (curLevelNum >= LEVEL_JSON.length)
			{
				curLevelNum = 0;
				setGameMode(GAME_MODE_WIN);
				startScore = 0;
			}
			else
			{
				setGameMode(GAME_MODE_INTRO);
			}
			
			setLevel(curLevelNum);
			ic.setInfoData(new InfoData(JSON.parse(INFO_JSON[curLevelData.intro])));
		}
	};
	
	var executeAnimatedFrame = function()
	{
		if (ac.imagesLoaded())
		{
			ac.updateFrame();
		
			if (!lc.imagesLoaded())
				ac.setMessage("Loading.  Please Wait...", true);
			else
			{
				checkKeys();
				ac.setMessage("Press any key to start level.  Press \"H\" at any time for help.", false);
			}

			ac.draw();
		}
	};
	
	var executeInfoFrame = function()
	{
		if (!lc.imagesLoaded())
		{
			ic.setMessage("Loading.  Please Wait...", true);
		}
		else
		{
			checkKeys();
			
			ic.setMessage("Press any key.", false);
		}

		if (ic.imagesLoaded())
			ic.draw();
	};
	
	setTimeout(function()
	{
		setGameMode(GAME_MODE_TITLE);
		setLevel(curLevelNum);
		helpKeyPressed = false;
		keyPressed = false;
		
		var millisecondsPerFrame = Math.floor(1000/FPS);
		
		setInterval(function()
		{	
			lastDate = new Date();
			
			if (document.hasFocus())
			{
				if (pause === true)
				{
					modeChangeDate = new Date();
					pause = false;
				}
			}
			else if (!pause)
			{
				drawPause();
				pause = true;
			}
				
			if (!pause)
			{
				switch(gameMode)
				{
					case GAME_MODE_PLAY:
						executePlayFrame();
					break;
					case GAME_MODE_TITLE:
					case GAME_MODE_OVER:
					case GAME_MODE_WIN:
						executeAnimatedFrame();
					break;
					case GAME_MODE_INFO:
					case GAME_MODE_INTRO:
						executeInfoFrame();
					break;	
				}
			}
		}, millisecondsPerFrame);
	}, 200);
	
	var checkKeys = function()
	{	
		if (helpKeyPressed && gameMode !== GAME_MODE_INFO)
		{
			helpScreen = FIRST_HELP_SCREEN;
			ic.setInfoData(new InfoData(JSON.parse(INFO_JSON[helpScreen])));
			setGameMode(GAME_MODE_INFO);
		}
		else
		{
			switch(gameMode)
			{
				case GAME_MODE_TITLE:
					if (keyPressed && lastDate.getTime() - modeChangeDate.getTime() >= MODE_CHANGE_DELAY)
					{
						ic.setInfoData(new InfoData(JSON.parse(INFO_JSON[curLevelData.intro])));
						setGameMode(GAME_MODE_INTRO);
					}
				break;
				case GAME_MODE_INTRO:
					if (keyPressed && lastDate.getTime() - modeChangeDate.getTime() >= MODE_CHANGE_DELAY)
						setGameMode(GAME_MODE_PLAY);
				break;
				case GAME_MODE_PLAY:
					if (!mouseMode && curLevelData.heroObject !== null)
					{
						curLevelData.heroObject.keys[KEY_UP] = keydown.up;
						curLevelData.heroObject.keys[KEY_DOWN] = keydown.down;
						curLevelData.heroObject.keys[KEY_LEFT] = keydown.left;
						curLevelData.heroObject.keys[KEY_RIGHT] = keydown.right;
						curLevelData.heroObject.keys[KEY_JUMP] = keydown.z;
						curLevelData.heroObject.keys[KEY_ATTACK] = keydown.x;
					}
				break;
				case GAME_MODE_OVER:
					if (keyPressed && lastDate.getTime() - modeChangeDate.getTime() >= MODE_CHANGE_DELAY)
						setGameMode(GAME_MODE_PLAY);
				break;
				case GAME_MODE_WIN:
					if (keyPressed && lastDate.getTime() - modeChangeDate.getTime() >= MODE_CHANGE_DELAY)
					{
						setGameMode(GAME_MODE_TITLE);
					}
				break;
				case GAME_MODE_INFO:
					if (keyPressed)
					{
						++helpScreen;
			
						if (helpScreen > LAST_HELP_SCREEN)
						{
							helpScreen = FIRST_HELP_SCREEN;
							setGameMode(prevGameMode);
						}
				
						ic.setInfoData(new InfoData(JSON.parse(INFO_JSON[helpScreen])));
					}
				break;
			}
		}
		
		helpKeyPressed = false;
		keyPressed = false;
	};
	
	this.levelMouseDown = function(event)
	{
		//mouseMode = true; // Letting touches to canvas replace keyboard input
		keyPressed = true;
		lc.toggleShowFrameRate();
		
		var locationCoords = lc.eventToLocationCoords(event);
		
		var mouseRectangle = new Rectangle(locationCoords.x, locationCoords.y, 1, 1);
		var heroRectangle = UpdateBoundingRect(curLevelData.heroObject, curLevelData);
		
		if (curLevelData.heroObject !== null)
		{
			curLevelData.heroObject.keys[KEY_LEFT] = mouseRectangle.right < heroRectangle.left;
			curLevelData.heroObject.keys[KEY_RIGHT] = mouseRectangle.left > heroRectangle.right;
			curLevelData.heroObject.keys[KEY_JUMP] = mouseRectangle.bottom < heroRectangle.top;
		}
	};

	var ar=new Array(33,34,35,36,37,38,39,40);
};