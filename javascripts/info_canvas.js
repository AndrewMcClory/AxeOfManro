// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var InfoCanvas = function(canvas)
{
	var displayCanvas = new PhysicalCanvas(canvas);
   
	var infoData;
	
	var message = "";
	var showMessage = false;
	var flashMessage = true;
	var flashDelay = 0;
	
	// Create the offscreen output canvas
	var outputCanvas = new VirtualCanvas(displayCanvas.canvas.width, displayCanvas.canvas.height);
	
	var backgroundCanvas = new ImageCanvas(displayCanvas.canvas.width, displayCanvas.canvas.height - CONSOLE_HEIGHT);
	
	var tileCanvas = new TileCanvas(INFO_SPRITE_WIDTH, INFO_SPRITE_HEIGHT);
	
	this.setInfoData = function(data)
	{
		infoData = data;
		backgroundCanvas.setImage(data.background);
		tileCanvas.setImage(data.sprites);
	};
	
	this.imagesLoaded = function()
	{
		return backgroundCanvas.imageLoaded() && tileCanvas.imageLoaded();
	};
	
	this.setMessage = function(text, flash)
	{
		message = text;
		flashMessage = flash;
	};
	
	var drawText = function()
	{
		var textDataIter = infoData.textData.newIterator();
		var textDataObject = null;
			
		while (textDataIter.valid())
		{
			textDataObject = textDataIter.getData();

			outputCanvas.context.font=(textDataObject.font);
			outputCanvas.context.fillStyle = textDataObject.color;
			outputCanvas.context.fillText(textDataObject.content, textDataObject.location.x, textDataObject.location.y);
				
			textDataIter.increment();
		}	
	};
	
	var drawSprites = function()
	{
		if (!tileCanvas.imageLoaded())
			return;
			
		var spriteDataIter = infoData.spriteData.newIterator();
		var spriteDataObject = null;
			
		while (spriteDataIter.valid())
		{
			spriteDataObject = spriteDataIter.getData();

			tileCanvas.drawTile(outputCanvas.context, spriteDataObject.tile, spriteDataObject.location.x, spriteDataObject.location.y);
				
			spriteDataIter.increment();
		}	
	};
	
	this.draw = function()
	{
		if (!backgroundCanvas.imageLoaded())
			return;
		
		// First copy the background canvas onto the output canvas
		outputCanvas.context.clearRect(0, 0, outputCanvas.canvas.width, outputCanvas.canvas.height);
		outputCanvas.context.drawImage(backgroundCanvas.canvas, 0, 0);
		
		// Draw all text objects onto the output canvas
		drawText();
		
		// Draw all sprite data onto the output canvas
		drawSprites();
		
		if (showMessage || !flashMessage)
		{
			outputCanvas.context.font=("20px Arial");
			outputCanvas.context.fillStyle = 'black';
			outputCanvas.context.fillText(message, 20, outputCanvas.canvas.height - 8);
		}
		
		// Finally copy output canvas onto the display canvas
		displayCanvas.context.clearRect(0, 0, displayCanvas.canvas.width, displayCanvas.canvas.height);
		displayCanvas.context.drawImage(outputCanvas.canvas, 0, 0);
	};
	
	this.eventToLocationCoords = function(event)
	{
		var coords = displayCanvas.canvas.relMouseCoords(event);
		
		return {x:coords.x, y:coords.y};
	};
	
	this.redrawImageCanvases = function()
	{
		backgroundCanvas.redraw();
	};
};