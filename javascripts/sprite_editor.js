// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var SpriteEditor = function()
{
	var FPS = 30;
	
	var curSpriteSetData = new SpriteSetData(JSON.parse(SPRITE_JSON[0]));
	document.forms["OpenForm"]["SpriteSetNumber"].value = 0;
	
	var spriteCanvas = new SpriteCanvas(document.getElementById("SpriteCanvas"));
	spriteCanvas.setSpriteSetData(curSpriteSetData);
	
	var spriteCanvasNeedsRedraw = true;
	
	updateForms();
	
	function clearSpriteSetData()
	{
		curSpriteSetData.spriteData = new Array(spriteCanvas.getNumSprites());
		
		for (var i = 0; i < curSpriteSetData.spriteData.length; ++i)
		{
			curSpriteSetData.spriteData[i] = new SpriteData();
		}
	}
	
	// Fill in undefined sprite data objects with new ones, retaining the others
	function fillSpriteSetData()
	{
		curSpriteSetData.spriteData.length = spriteCanvas.getNumSprites();
		
		for (var i = 0; i < curSpriteSetData.spriteData.length; ++i)
		{
			if (typeof curSpriteSetData.spriteData[i] === "undefined")
				curSpriteSetData.spriteData[i] = new SpriteData();
		}
	}

	setInterval(function()
	{
		if (spriteCanvasNeedsRedraw && spriteCanvas.imageLoaded())
		{
			fillSpriteSetData();
			spriteCanvas.draw();
			updateForms();
			spriteCanvasNeedsRedraw = false;
		}
		
	}, 1000/FPS);
	
	function updateForms()
	{
		document.forms["SrcForm"]["SpriteWidth"].value = curSpriteSetData.spriteWidth;
		document.forms["SrcForm"]["SpriteHeight"].value = curSpriteSetData.spriteHeight;
		document.forms["SrcForm"]["SpriteImage"].value = curSpriteSetData.src;
		
		var textArea = document.getElementById("SpriteOutput");
		textArea.value = JSON.stringify(curSpriteSetData);
	}

	this.spriteMouseDown = function(event)
	{
		var coords = spriteCanvas.eventToCoords(event);
		var curSpriteData = curSpriteSetData.spriteData[spriteCanvas.getSelectedSprite()];
		
		if (document.forms["SelectForm"]["Tool"].value == "AnchorPoint")
		{
			curSpriteData.anchorPoint.set(coords.x, coords.y);
		}
		else if (document.forms["SelectForm"]["Tool"].value == "TopLeftBoundary")
		{
			curSpriteSetData.boundingRect.left = coords.x;
			curSpriteSetData.boundingRect.top = coords.y;
		}
		else if (document.forms["SelectForm"]["Tool"].value == "BottomRightBoundary")
		{
			curSpriteSetData.boundingRect.right = coords.x;
			curSpriteSetData.boundingRect.bottom = coords.y;
		}
		else if (document.forms["SelectForm"]["Tool"].value == "TopLeftAttack")
		{
			curSpriteData.attackRect.left = coords.x;
			curSpriteData.attackRect.top = coords.y;
		}
		else
		{
			curSpriteData.attackRect.right = coords.x;
			curSpriteData.attackRect.bottom = coords.y;
		}
		
		spriteCanvasNeedsRedraw = true;
	}
	
	this.onGenerate = function()
	{
		if (parseInt(document.forms["OpenForm"]["SpriteSetNumber"].value) >= 0 && parseInt(document.forms["OpenForm"]["SpriteSetNumber"].value) <= 20)
		{
			curSpriteSetData = new SpriteSetData();
			curSpriteSetData.spriteWidth = parseInt(document.forms["SrcForm"]["SpriteWidth"].value);
			curSpriteSetData.spriteHeight = parseInt(document.forms["SrcForm"]["SpriteHeight"].value);
			curSpriteSetData.src = document.forms["SrcForm"]["SpriteImage"].value + GetTimeTag();

			clearSpriteSetData();
			spriteCanvas.setSpriteSetData(curSpriteSetData);
			
			var textArea = document.getElementById("SpriteOutput");
			textArea.value = JSON.stringify(curSpriteSetData);
			
			updateForms();
			spriteCanvasNeedsRedraw = true;
		}
	}
	
	this.onOpen = function()
	{
		if (parseInt(document.forms["OpenForm"]["SpriteSetNumber"].value) >= 0 && parseInt(document.forms["OpenForm"]["SpriteSetNumber"].value) <= 20)
		{
			curSpriteSetData = new SpriteSetData(JSON.parse(SPRITE_JSON[document.forms["OpenForm"]["SpriteSetNumber"].value]));
			
			updateForms();
			
			spriteCanvas.setSpriteSetData(curSpriteSetData);
			spriteCanvasNeedsRedraw = true;
		}
	}
	
	this.onRefresh = function()
	{
		var textArea = document.getElementById("SpriteOutput");
		textArea.value = JSON.stringify(curSpriteSetData);
	}
	
	this.onPrev = function()
	{
		spriteCanvas.selectPrevSprite();
		
		spriteCanvasNeedsRedraw = true;
	}
	
	this.onNext = function()
	{
		spriteCanvas.selectNextSprite();
		
		spriteCanvasNeedsRedraw = true;
	}
}