// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var SpriteCanvas = function(canvas)
{
	var displayCanvas = new PhysicalCanvas(canvas);
	var tileCanvas = new TileCanvas(0, 0);
   
	var spriteSetData = new SpriteSetData();
	var selectedSprite = 0;
	
	this.setSpriteSetData = function(data)
	{
		spriteSetData = data;
		tileCanvas = new TileCanvas(spriteSetData.spriteWidth, spriteSetData.spriteHeight);
		tileCanvas.setImage(spriteSetData.src);
		selectedSprite = 0;
	};
	
	this.imageLoaded = function()
	{
		return tileCanvas.imageLoaded();
	};
	
	this.draw = function()
	{
		if (!tileCanvas.imageLoaded())
		{
			return;
		}
		
		var spriteData = spriteSetData.spriteData[selectedSprite];
		
		displayCanvas.context.clearRect(0, 0, displayCanvas.canvas.width, displayCanvas.canvas.height);
		tileCanvas.drawTile(displayCanvas.context, selectedSprite, 0, 0);
		
		displayCanvas.context.strokeRect(spriteSetData.boundingRect.left, spriteSetData.boundingRect.top, spriteSetData.boundingRect.width(), spriteSetData.boundingRect.height());
		
		displayCanvas.context.strokeStyle="#FF0000";
		displayCanvas.context.beginPath();
		displayCanvas.context.arc(spriteData.anchorPoint.x, spriteData.anchorPoint.y,3,0,2*Math.PI);
		displayCanvas.context.stroke();
		
		displayCanvas.context.strokeStyle="#000000";
		displayCanvas.context.beginPath();
		displayCanvas.context.arc(spriteData.anchorPoint.x, spriteData.anchorPoint.y,4,0,2*Math.PI);
		displayCanvas.context.stroke();
		
		displayCanvas.context.strokeStyle="#FF0000";
		displayCanvas.context.strokeRect(spriteData.attackRect.left, spriteData.attackRect.top, spriteData.attackRect.width(), spriteData.attackRect.height());
		
		displayCanvas.context.strokeStyle="#000000";
        displayCanvas.context.strokeRect(spriteSetData.boundingRect.left, spriteSetData.boundingRect.top, spriteSetData.boundingRect.width(), spriteSetData.boundingRect.height());
		
		displayCanvas.context.font=("15px Arial");
		displayCanvas.context.fillText("Viewing sprite: " + (selectedSprite + 1) + " of " + tileCanvas.getNumTiles(), 10, displayCanvas.canvas.height - 110);
		
		displayCanvas.context.fillText("Anchor point: (" + spriteData.anchorPoint.x + ", " + spriteData.anchorPoint.y + ")", 10, displayCanvas.canvas.height - 90);
		displayCanvas.context.fillText("Bounding rectangle (top left): (" + spriteSetData.boundingRect.left + ", " + spriteSetData.boundingRect.top + ")", 10, displayCanvas.canvas.height - 70);
		displayCanvas.context.fillText("Bounding rectangle (bottom right): (" + spriteSetData.boundingRect.right + ", " + spriteSetData.boundingRect.bottom + ")", 10, displayCanvas.canvas.height - 50);
		displayCanvas.context.fillText("Attack rectangle (top left): (" + spriteData.attackRect.left + ", " + spriteData.attackRect.top + ")", 10, displayCanvas.canvas.height - 30);
		displayCanvas.context.fillText("Attack rectangle (bottom right): (" + spriteData.attackRect.right + ", " + spriteData.attackRect.bottom + ")", 10, displayCanvas.canvas.height - 10);
	};
	
	this.getNumSprites = function()
	{
		if (!tileCanvas.imageLoaded())
			return 0;
		else
			return tileCanvas.getNumTiles();
	};
	
	this.selectPrevSprite = function()
	{
		--selectedSprite;
		
		if (selectedSprite < 0)
			selectedSprite = 0;	
	};
	
	this.selectNextSprite = function()
	{
		++selectedSprite;
		
		if (selectedSprite >= tileCanvas.getNumTiles())
		{
			selectedSprite = tileCanvas.getNumTiles() - 1;
			if (selectedSprite < 0)
				selectedSprite = 0;
		}
	};
	
	this.getSelectedSprite = function()
	{
		return selectedSprite;
	};
	
	this.eventToCoords = function(event)
	{
		return displayCanvas.canvas.relMouseCoords(event);
	};
};