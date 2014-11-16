// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var LevelEditor = function()
{
	var curLevelData = new LevelData(JSON.parse(LEVEL_JSON[0]));
	document.forms["OpenForm"]["LevelNumber"].value = 0;
	
	var tp = new TilePalette(document.getElementById("TileCanvas"), TILE_WIDTH, TILE_HEIGHT);
	tp.setTileImage(curLevelData.tileSetData.src);
		
	var sp = new TilePalette(document.getElementById("SpriteCanvas"), TILE_WIDTH, TILE_HEIGHT);
	sp.setTileImage(SPRITES_PNG);

	var lc = new LevelCanvas(document.getElementById("LevelCanvas"), TILE_WIDTH, TILE_HEIGHT);
	lc.setLevelData(curLevelData);
		
	var tpNeedsRedraw = true;
	var spNeedsRedraw = true;
	var lcNeedsRedraw = true;
	var lcNeedsScroll = false;
	
	var updateForms = function()
	{
		document.forms["LevelForm"]["LevelWidth"].value = curLevelData.width;
		document.forms["LevelForm"]["LevelHeight"].value = curLevelData.height;
		document.forms["LevelForm"]["LevelTileSet"].value = curLevelData.tileSet;
		document.forms["LevelForm"]["LevelBackground"].value = curLevelData.background;
		document.forms["LevelForm"]["LevelIntro"].value = curLevelData.intro;
		
		var textArea = document.getElementById("LevelOutput");
		textArea.value = JSON.stringify(curLevelData.getData());
	};
	
	updateForms();
	
	var clearLevelData = function()
	{
		curLevelData.tiles = new Array(curLevelData.width);
		
		for (var x = 0; x < curLevelData.width; ++x)
		{
			curLevelData.tiles[x] = new Array(curLevelData.height);
			
			for (var y = 0; y < curLevelData.height; ++y)
			{
				curLevelData.tiles[x][y] = -1;
			}
		}
	};

	setInterval(function()
	{
		if (tpNeedsRedraw && tp.imageLoaded())
		{
			tp.draw();
			tpNeedsRedraw = false;
		}
		
		if (spNeedsRedraw && sp.imageLoaded())
		{
			sp.draw();
			spNeedsRedraw = false;
		}
		
		if (lcNeedsRedraw && lc.imagesLoaded())
		{
			lc.drawAllForeground();
			lc.draw();
			lcNeedsRedraw = false;
		}
		
		if (lcNeedsScroll && lc.imagesLoaded())
		{
			lc.draw();
			lcNeedsScroll = false;
		}
		
		checkKeys();
		
	}, 1000/FPS);

	var checkKeys = function()
	{
		try
		{
			if (keydown.up)
			{
				lc.scroll(0, -8);
				lcNeedsScroll = true;
			}
			if (keydown.down)
			{
				lc.scroll(0, 8);
				lcNeedsScroll = true;
			}
			if (keydown.left)
			{
				lc.scroll(-8, 0);
				lcNeedsScroll = true;
			}
			if (keydown.right)
			{
				lc.scroll(8, 0);
				lcNeedsScroll = true;
			}
		}
		catch(err)
		{
			alert(err);
		}
	};

	this.tileMouseDown = function(event)
	{
		tp.mouseDown(event);
		document.forms["SelectForm"]["Tool"].value = "Tile";
	};
	
	this.spriteMouseDown = function(event)
	{
		sp.mouseDown(event);
		document.forms["SelectForm"]["Tool"].value = "Sprite";
	};
	
	var deleteGameObjects = function(x, y)
	{
		var mouseRectangle = new Rectangle(x, y, 1, 1);
		var spriteRectangle = new Rectangle(0, 0, 0, 0);
		
		var gameObjectIter = curLevelData.gameObjects.newIterator();
		
		while (gameObjectIter.valid())
		{
			var gameObject = gameObjectIter.getData();
			
			spriteRectangle.left = gameObject.location.x;
			spriteRectangle.top = gameObject.location.y;
			spriteRectangle.right = spriteRectangle.left + curLevelData.spriteSets[gameObject.spriteSet].spriteWidth - 1;
			spriteRectangle.bottom = spriteRectangle.top + curLevelData.spriteSets[gameObject.spriteSet].spriteHeight - 1;
			
			if (RectanglesOverlap(mouseRectangle, spriteRectangle))
			{
				gameObjectIter.remove();
			}
			else
			{
				gameObjectIter.increment();
			}	
		}
	};

	this.levelMouseDown = function(event)
	{
		var tileCoords = lc.eventToTileCoords(event);
		
		if (document.forms["SelectForm"]["Tool"].value === "Tile")
		{
			curLevelData.tiles[tileCoords.x][tileCoords.y] = tp.getSelectedTile();
		}
		else if (document.forms["SelectForm"]["Tool"].value === "Sprite")
		{
			curLevelData.addGameObject(SPRITE_TILE_TO_TYPE[sp.getSelectedTile()], new Point(tileCoords.x * TILE_WIDTH, tileCoords.y * TILE_HEIGHT));
		}
		else
		{
			curLevelData.tiles[tileCoords.x][tileCoords.y] = -1;
			deleteGameObjects(tileCoords.x * TILE_WIDTH, tileCoords.y * TILE_HEIGHT);
		}
		
		lcNeedsRedraw = true;
	};

	this.onGenerate = function()
	{
		if (parseInt(document.forms["OpenForm"]["LevelNumber"].value) >= 0 && parseInt(document.forms["OpenForm"]["LevelNumber"].value) <= 10)
		{
			curLevelData = new LevelData();
			curLevelData.width = parseInt(document.forms["LevelForm"]["LevelWidth"].value);
			curLevelData.height = parseInt(document.forms["LevelForm"]["LevelHeight"].value);
			curLevelData.tileSet = (document.forms["LevelForm"]["LevelTileSet"].value);
			curLevelData.tileSetData = new TileSetData(JSON.parse(TILE_JSON[curLevelData.tileSet]));
			curLevelData.background = document.forms["LevelForm"]["LevelBackground"].value + GetTimeTag();
			curLevelData.intro = parseInt(document.forms["LevelForm"]["LevelIntro"].value);

			clearLevelData();
			tp.setTileImage(curLevelData.tileSetData.src);
			lc.setLevelData(curLevelData);
			
			var textArea = document.getElementById("LevelOutput");
			textArea.value = JSON.stringify(curLevelData.getData());
			
			tpNeedsRedraw = true;
			lcNeedsRedraw = true;
		}
	};

	this.onOpen = function()
	{
		if (parseInt(document.forms["OpenForm"]["LevelNumber"].value) >= 0 && parseInt(document.forms["OpenForm"]["LevelNumber"].value) <= 10)
		{	
			curLevelData = new LevelData(JSON.parse(LEVEL_JSON[document.forms["OpenForm"]["LevelNumber"].value]));
			updateForms();
			tileSetData = new TileSetData(JSON.parse(TILE_JSON[curLevelData.tileSet]));
			tp.setTileImage(curLevelData.tileSetData.src);
			lc.setLevelData(curLevelData);
			
			tpNeedsRedraw = true;
			lcNeedsRedraw = true;
		}
	};

	this.onRefresh = function()
	{
		curLevelData.intro = parseInt(document.forms["LevelForm"]["LevelIntro"].value);
		
		var textArea = document.getElementById("LevelOutput");
		textArea.value = JSON.stringify(curLevelData.getData());
	};

	var ar=new Array(33,34,35,36,37,38,39,40);

	$(document).keydown(function(e) {
			var key = e.which;
			
			if($.inArray(key,ar) > -1) {
				e.preventDefault();
				return false;
			}
			return true;
	});
};