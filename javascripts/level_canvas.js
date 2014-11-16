// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var TimingData = function()
{
	var date = new Date();
	this.lastTime = date.getTime();
	this.numFrames = 0;
	this.frameRate = 0;
	this.showFrameRate = false;
};

var LevelCanvas = function(canvas, tileWidth, tileHeight)
{
	var timingData = new TimingData();
	
	var displayCanvas = new PhysicalCanvas(canvas);
   
	var levelData;
	var cameraLeft = 0, cameraTop = 0;
	
	var srcRect = new Rectangle();
	var destRect = new Rectangle();
	
	// Create the offscreen output canvas
	var outputCanvas = new VirtualCanvas(displayCanvas.canvas.width, displayCanvas.canvas.height);
	
	// Create the two foreground canvases
	var foregroundCanvas = new Array(2);
	var activeForegroundIndex = 0;
	var foregroundLeft = 0, foregroundTop = 0;
	
	for (var i = 0; i < 2; ++i)
	{
		// The foreground canvas will have a border padding one tile thick
		foregroundCanvas[i] = new VirtualCanvas(displayCanvas.canvas.width + (2 * tileWidth), (displayCanvas.canvas.height + (2 * tileHeight)) - CONSOLE_HEIGHT);
	}
	
	var tileCanvas = new TileCanvas();
	
	var spriteCanvases = [];
	
	var backgroundCanvas = new ImageCanvas(displayCanvas.canvas.width, displayCanvas.canvas.height - CONSOLE_HEIGHT);
	
	var setTileCanvas = function(src)
	{
		tileCanvas = new TileCanvas(tileWidth, tileHeight);
		tileCanvas.setImage(src);
	};
	
	this.setLevelData = function(ld)
	{
		levelData = ld;
		backgroundCanvas.setImage(ld.background);
		
		var tileSetData = new TileSetData(JSON.parse(TILE_JSON[ld.tileSet]));
		setTileCanvas(tileSetData.src);
		
		spriteCanvases = [];
		for (var i = 0; i < ld.spriteSets.length; ++i)
		{
			spriteCanvases[i] = new TileCanvas(ld.spriteSets[i].spriteWidth, ld.spriteSets[i].spriteHeight);
			spriteCanvases[i].setImage(ld.spriteSets[i].src);
		}
		
		cameraLeft = 0;
		cameraTop = 0;
		foregroundLeft = 0;
		foregroundTop = 0;
	};
	
	this.imagesLoaded = function()
	{
		for (var i = 0; i < spriteCanvases.length; ++i)
		{
			if (!spriteCanvases[i].imageLoaded())
				return false;
		}
		return backgroundCanvas.imageLoaded() && tileCanvas.imageLoaded();
	};
	
	var keepCameraInBounds = function()
	{
		if (cameraLeft < 0)
		{
			cameraLeft = 0;
		}
		if (cameraLeft + outputCanvas.canvas.width > levelData.width * tileWidth)
		{
			cameraLeft = (levelData.width * tileWidth) - outputCanvas.canvas.width;
		}
		if (cameraTop < 0)
		{
			cameraTop = 0;
		}
		if (cameraTop + (outputCanvas.canvas.height - CONSOLE_HEIGHT) > levelData.height * tileHeight)
		{
			cameraTop = (levelData.height * tileHeight) - (outputCanvas.canvas.height - CONSOLE_HEIGHT);
		}
	};
	
	this.scroll = function(deltaX, deltaY)
	{
		cameraLeft+=deltaX;
		cameraTop+=deltaY;
		
		keepCameraInBounds();
		
		scrollForeground();
	};
	
	this.setCamera = function(left, top)
	{
		cameraLeft = left;
		cameraTop = top;
		
		keepCameraInBounds();
		
		scrollForeground();
	};
	
	this.drawAllForeground = function()
	{
		foregroundCanvas[activeForegroundIndex].context.clearRect(0, 0, foregroundCanvas[activeForegroundIndex].canvas.width, foregroundCanvas[activeForegroundIndex].canvas.height);
		drawDeltaForeground(foregroundCanvas[activeForegroundIndex].canvas.width, foregroundCanvas[activeForegroundIndex].canvas.height);
	};
	
	var drawDeltaForeground = function(deltaX, deltaY)
	{
		if (!tileCanvas.imageLoaded())
			return;
			
		var widthTiles = Math.floor(foregroundCanvas[activeForegroundIndex].canvas.width/tileWidth);
		var heightTiles = Math.floor(foregroundCanvas[activeForegroundIndex].canvas.height/tileHeight);

		var curPixelX = 0, curPixelY = 0; // Current pixel location where a tile will be drawn
		var curTileX = 0, curTileY = 0; // Tile indices in map of tile to be drawn
		var curDeltaX = 0, curDeltaY = 0; // As edge rows and columns are draw, our delta positions will approach 0
		var tilesToCheckX = 0, tilesToCheckY = 0; // Number of tiles to scan over in each direction
		
		curDeltaX = deltaX;
		tilesToCheckX = widthTiles;
		
		if (deltaX < 0) {
			// Scan tiles from left to right
			curPixelX = 0;
			curTileX = Math.floor(foregroundLeft/tileWidth);
		}
		else {
			// Scan tiles from right to left
			curPixelX = foregroundCanvas[activeForegroundIndex].canvas.width - tileWidth;
			curTileX = Math.floor(foregroundLeft/tileWidth) + (widthTiles - 1);
		}

		while (tilesToCheckX > 0)
		{
			curDeltaY = deltaY;
			tilesToCheckY = heightTiles;

			if (deltaY < 0)
			{
				// Scan tiles from top to bottom
				curPixelY = 0;
				curTileY = Math.floor(foregroundTop/tileHeight);
			}
			else
			{
				// Scan tiles from bottom to top
				curPixelY = foregroundCanvas[activeForegroundIndex].canvas.height - tileHeight;
				curTileY = Math.floor(foregroundTop/tileHeight) + (heightTiles - 1);
			}

			while (tilesToCheckY > 0)
			{	
				if ((curDeltaX !== 0 || curDeltaY !== 0) && curTileX < levelData.width && curTileY < levelData.height)
				{
					if (levelData.tiles[curTileX][curTileY] >= 0 && levelData.tiles[curTileX][curTileY] < tileCanvas.getNumTiles())
					tileCanvas.drawTile(foregroundCanvas[activeForegroundIndex].context, levelData.tiles[curTileX][curTileY], curPixelX, curPixelY);
				}

				if (deltaY < 0)
				{
					// Increment y axis variables (move down one tile column)
					curPixelY+=tileHeight;
					curTileY++;
					curDeltaY+=tileHeight;
					if (curDeltaY > 0)
					{
						curDeltaY = 0;
					}
				}
				else
				{
					// Decrement y axis variables (move up one tile column)
					curPixelY-=tileHeight;
					curTileY--;
					curDeltaY-=tileHeight;
					if (curDeltaY < 0)
					{
						curDeltaY = 0;
					}
				}
			
				tilesToCheckY--;
			}
		
			if (deltaX < 0)
			{
				// Increment x axis variables (move right one tile column)
				curPixelX+=tileWidth;
				curTileX++;
				curDeltaX+=tileWidth;
				if (curDeltaX > 0)
				{
					curDeltaX = 0;
				}
			}
			else
			{
				// Decrement x axis variables (move left one tile column)
				curPixelX-=tileWidth;
				curTileX--;
				curDeltaX-=tileWidth;
				if (curDeltaX < 0)
				{
					curDeltaX = 0;
				}
			}
		
			tilesToCheckX--;
		}
	};
	
	var scrollForeground = function()
	{
		// Check if foreground canvas no longer encloses output canvas, scrolling the foreground canvas if necessary	
		var oldLeft = foregroundLeft;
		var oldTop = foregroundTop;
	
		var outputRight = cameraLeft + outputCanvas.canvas.width - 1;
		var foregroundRight = foregroundLeft + foregroundCanvas[activeForegroundIndex].canvas.width - 1;
	
		var outputBottom = cameraTop + (outputCanvas.canvas.height - CONSOLE_HEIGHT) - 1;
		var foregroundBottom = foregroundTop + foregroundCanvas[activeForegroundIndex].canvas.height - 1;
	
		var gameMapRight = (levelData.width * tileWidth) - 1;
		var gameMapBottom = (levelData.height * tileHeight) - 1;
	
		// Shift left border if it is to the right of the output's left position
		if (foregroundLeft > cameraLeft) {
			while (foregroundLeft >= cameraLeft)
			{
				foregroundLeft-=tileWidth;
			}
		
			if (foregroundLeft < 0)
			{
				foregroundLeft = 0;
			}
		}
		else if (foregroundRight < outputRight)
		{
			// Shift the right border right if it is to the left of the output's right position
			while (foregroundRight <= outputRight)
			{
				foregroundRight+=tileWidth;
				foregroundLeft+=tileWidth;
			}
		
			if (foregroundRight > gameMapRight)
			{
			foregroundLeft = (gameMapRight - foregroundCanvas[activeForegroundIndex].canvas.width) + 1;
			}
		}
	
		// Shift top border if it is below the output's top position
		if (foregroundTop > cameraTop)
		{
			while (foregroundTop >= cameraTop)
			{
				foregroundTop-=tileHeight;
			}
		
			if (foregroundTop < 0)
			{
				foregroundTop = 0;
			}
		}
		else if (foregroundBottom < outputBottom)
		{
			// Shift the bottom border down if it is above the output's bottom position
			while (foregroundBottom <= outputBottom)
			{
				foregroundBottom+=tileHeight;
				foregroundTop+=tileHeight;
			}
		
			if (foregroundBottom > gameMapBottom)
			{
				foregroundTop = (gameMapBottom - foregroundCanvas[activeForegroundIndex].canvas.height) + 1;
			}
		}
	
		// If the foreground canvas has moved in either direction, it will be necessary to scroll
		if (foregroundLeft !== oldLeft || foregroundTop !== oldTop)
		{
			// Scroll the portion of the foreground that will still reside in the new foreground
			// This is done so that it will not be necessary to redraw ALL the tiles individually
			var deltaX = foregroundLeft - oldLeft;
			var deltaY = foregroundTop - oldTop;
		
			srcRect.set(0, 0, foregroundCanvas[activeForegroundIndex].canvas.width, foregroundCanvas[activeForegroundIndex].canvas.height);
			destRect.set(0, 0, foregroundCanvas[activeForegroundIndex].canvas.width, foregroundCanvas[activeForegroundIndex].canvas.height);
		
			if (deltaX < 0)
			{
				srcRect.right+=deltaX;
				destRect.left-=deltaX;
			}
			else if (deltaX > 0)
			{
				srcRect.left+=deltaX;
				destRect.right-=deltaX;
			}
		
			if (deltaY < 0)
			{
				srcRect.bottom+=deltaY;
				destRect.top-=deltaY;
			}
			else if (deltaY > 0)
			{
				srcRect.top+=deltaY;
				destRect.bottom-=deltaY;
			}
		
			
			// Copy a portion of the active foreground canvas to the inactive foreground canvas and activate the inactive foreground canvas
			// This is done to avoid copying a region of a canvas onto itself
			var inactiveForegroundIndex = 1 - activeForegroundIndex;
			
			foregroundCanvas[inactiveForegroundIndex].context.clearRect(0, 0, foregroundCanvas[inactiveForegroundIndex].canvas.width, foregroundCanvas[inactiveForegroundIndex].canvas.height);

			if (srcRect.width() > 0 && srcRect.height() > 0 && destRect.width() > 0 && destRect.height() > 0)
				foregroundCanvas[inactiveForegroundIndex].context.drawImage(foregroundCanvas[activeForegroundIndex].canvas, srcRect.left, srcRect.top, srcRect.width(), srcRect.height(),
																						destRect.left, destRect.top, destRect.width(), destRect.height());
																						
			activeForegroundIndex = inactiveForegroundIndex;
		
			// Draw the newly visible tiles based on the deltaX and deltaY values just computed
			drawDeltaForeground(deltaX, deltaY);
		}
	};
	
	var drawSprites = function()
	{
		var gameObjectIter = levelData.gameObjects.newIterator();
		var spriteRectangle = new Rectangle(0, 0, 0, 0);
		var canvasRectangle = new Rectangle(cameraLeft, cameraTop, outputCanvas.canvas.width, (outputCanvas.canvas.height - CONSOLE_HEIGHT));
		var curDrawOrder = 0;
		var gameObect = null;
		
		// Cycle through the linked list of sprites once for each level of drawing
		for (curDrawOrder = 0; curDrawOrder <= MAX_DRAW_ORDER; ++curDrawOrder)
		{
			gameObjectIter.reset();
			
			while (gameObjectIter.valid())
			{
				gameObject = gameObjectIter.getData();
			
				if (gameObject.visible && gameObject.drawOrder === curDrawOrder)
				{
					spriteRectangle.left = gameObject.location.x;
					spriteRectangle.top = gameObject.location.y;
					spriteRectangle.right = spriteRectangle.left + spriteCanvases[gameObject.spriteSet].getTileWidth() - 1;
					spriteRectangle.bottom = spriteRectangle.top + spriteCanvases[gameObject.spriteSet].getTileHeight() - 1;
				
					// Draw sprite only if it falls within the camera's limits
					if (RectanglesOverlap(spriteRectangle, canvasRectangle) && spriteCanvases[gameObject.spriteSet].imageLoaded())
					{
						spriteCanvases[gameObject.spriteSet].drawTile(outputCanvas.context, gameObject.spriteNum, gameObject.location.x - cameraLeft, gameObject.location.y - cameraTop);
					}
				}
				
				gameObjectIter.increment();
			}
		}
	};
	
	var drawConsole = function()
	{
		// Draw the background of the console
		outputCanvas.context.strokeStyle = '#FFFFFF';
		outputCanvas.context.fillStyle = '#303030';
		outputCanvas.context.fillRect(0, outputCanvas.canvas.height - CONSOLE_HEIGHT, outputCanvas.canvas.width, CONSOLE_HEIGHT);
		outputCanvas.context.strokeRect(0, outputCanvas.canvas.height - CONSOLE_HEIGHT, outputCanvas.canvas.width, CONSOLE_HEIGHT);
		
		// Draw the score on the output canvas
		outputCanvas.context.font=("20px Arial");
		outputCanvas.context.fillStyle = 'black';
		outputCanvas.context.fillText("SCORE: " + levelData.score, 12, outputCanvas.canvas.height - 8);
		outputCanvas.context.fillStyle = 'yellow';
		outputCanvas.context.fillText("SCORE: " + levelData.score, 10, outputCanvas.canvas.height - 10);
		
		// Draw the health bar on the output canvas
		if (levelData.heroObject !== null && (levelData.heroObject.attributeBits & BIT_MASK_VULNERABLE) === 0)
		{
			outputCanvas.context.fillStyle = 'black';
			outputCanvas.context.fillText("NICOLE MODE!", 202, outputCanvas.canvas.height - 8);
			outputCanvas.context.fillStyle = 'yellow';
			outputCanvas.context.fillText("NICOLE MODE!", 200, outputCanvas.canvas.height - 10);
		}
		else
		{
			outputCanvas.context.fillStyle = 'black';
			outputCanvas.context.fillText("HEALTH:", 202, outputCanvas.canvas.height - 8);
			outputCanvas.context.fillStyle = 'yellow';
			outputCanvas.context.fillText("HEALTH:", 200, outputCanvas.canvas.height - 10);
		
			outputCanvas.context.strokeStyle = '#000000';
			outputCanvas.context.fillStyle = '#000000';
			outputCanvas.context.fillRect(300, outputCanvas.canvas.height - CONSOLE_HEIGHT + 8, 100, CONSOLE_HEIGHT - 17);
			outputCanvas.context.strokeRect(300, outputCanvas.canvas.height - CONSOLE_HEIGHT + 8, 100, CONSOLE_HEIGHT - 17);

			if (levelData.heroObject !== null)
			{
				var healthFraction = (levelData.heroObject.health / HERO_MAX_HEALTH);
				
				if (healthFraction > 0.66)
					outputCanvas.context.fillStyle = '#00FF00';
				else if (healthFraction > 0.33)
					outputCanvas.context.fillStyle = 'yellow';
				else
					outputCanvas.context.fillStyle = '#FF0000';
					
				outputCanvas.context.fillRect(300, outputCanvas.canvas.height - CONSOLE_HEIGHT + 8, 100 * (levelData.heroObject.health / HERO_MAX_HEALTH), CONSOLE_HEIGHT - 17);
				outputCanvas.context.strokeRect(300, outputCanvas.canvas.height - CONSOLE_HEIGHT + 8, 100 * (levelData.heroObject.health / HERO_MAX_HEALTH), CONSOLE_HEIGHT - 17);	
			}
		}
		
		// Draw the inventory items on the output canvas
		if (levelData.heroObject !== null)
		{
			var inventoryIter = levelData.heroObject.inventory.newIterator();
			var count = 1;
			
			while (inventoryIter.valid())
			{
				var gameObject = inventoryIter.getData();
				spriteCanvases[gameObject.spriteSet].drawTile(outputCanvas.context, gameObject.spriteNum, outputCanvas.canvas.width - (TILE_WIDTH * count), outputCanvas.canvas.height - CONSOLE_HEIGHT);
				outputCanvas.context.strokeStyle = '#FFD700';
				outputCanvas.context.strokeRect(outputCanvas.canvas.width - (TILE_WIDTH * count), outputCanvas.canvas.height - CONSOLE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);	
				inventoryIter.increment();
				++count;
			}
		}
	};
	
	this.toggleShowFrameRate = function()
	{
		timingData.showFrameRate = !timingData.showFrameRate;
	};
	
	var drawFrameRate = function()
	{
		++timingData.numFrames;
		var currentDate = new Date();
		var currentTime = currentDate.getTime();
		
		var elapsedTime = currentTime - timingData.lastTime;
		if (elapsedTime >= 1000)
		{
			timingData.frameRate = timingData.numFrames / (elapsedTime / 1000);
			timingData.frameRate = Math.round(timingData.frameRate * 100) / 100;
			timingData.lastTime = currentTime;
			timingData.numFrames = 0;
		}
		
		// Draw the frame rate on the output canvas
		outputCanvas.context.font=("20px Arial");
		outputCanvas.context.fillStyle = 'black';
		outputCanvas.context.fillText("FPS: " + timingData.frameRate, 12, 30);
		outputCanvas.context.fillStyle = 'red';
		outputCanvas.context.fillText("FPS: " + timingData.frameRate, 10, 28);
	};
	
	this.draw = function()
	{
		if (!backgroundCanvas.imageLoaded())
			return;
		
		// First copy the background canvas onto the output canvas
		outputCanvas.context.clearRect(0, 0, outputCanvas.canvas.width, outputCanvas.canvas.height);
		outputCanvas.context.drawImage(backgroundCanvas.canvas, 0, 0);
		
		// Next copy the active foreground canvas onto the output canvas
		outputCanvas.context.drawImage(foregroundCanvas[activeForegroundIndex].canvas, cameraLeft - foregroundLeft,
										cameraTop - foregroundTop, outputCanvas.canvas.width, (outputCanvas.canvas.height - CONSOLE_HEIGHT),
										0, 0, outputCanvas.canvas.width, (outputCanvas.canvas.height - CONSOLE_HEIGHT));
		
		// Draw all sprites onto the output canvas
		drawSprites();
		
		// Draw the game console at the bottom of the output window
		drawConsole();
		
		// Print the frames per second in the top right
		if (timingData.showFrameRate)
			drawFrameRate();
		
		// Finally copy output canvas onto the display canvas
		displayCanvas.context.clearRect(0, 0, displayCanvas.canvas.width, displayCanvas.canvas.height);
		
		// Shake camera when hero is hurt
		if (levelData.heroObject !== null && levelData.heroObject.recoveryDelay > 0)
			displayCanvas.context.drawImage(outputCanvas.canvas, Math.floor(Math.random()*7) - 3, Math.floor(Math.random()*7) - 3);
		else
			displayCanvas.context.drawImage(outputCanvas.canvas, 0, 0);
	};
	
	this.eventToTileCoords = function(event)
	{
		var coords = displayCanvas.canvas.relMouseCoords(event);
		
		return {x:xCoordToTile(coords.x), y:yCoordToTile(coords.y) };
	};
	
	this.eventToLocationCoords = function(event)
	{
		var coords = displayCanvas.canvas.relMouseCoords(event);
		
		return {x:cameraLeft + coords.x, y:cameraTop + coords.y};
	};
	
	var xCoordToTile = function xCoordToTile(x)
	{
		return Math.floor((cameraLeft + x)/tileWidth);
	};
	
	var yCoordToTile = function(y)
	{
		return Math.floor((cameraTop + y)/tileHeight);
	};
	
	this.getCameraRectangle = function()
	{
		return new Rectangle(cameraLeft, cameraTop, outputCanvas.canvas.width, outputCanvas.canvas.height - CONSOLE_HEIGHT);
	};
};