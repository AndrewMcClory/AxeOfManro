// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var AnimatedCanvas = function(canvas, type, score)
{
	var displayCanvas = new PhysicalCanvas(canvas);
	var frame = 0;
	var message = "";
	var showMessage = false;
	var flashMessage = true;
	var flashDelay = 0;
	
	// Create the offscreen output canvas
	var outputCanvas = new VirtualCanvas(displayCanvas.canvas.width, displayCanvas.canvas.height);
	
	var textCanvas = new TileCanvas(TEXT_WIDTH, TEXT_HEIGHT);
	textCanvas.setImage(TEXT_PNG);
	
	var backgroundCanvas = new ImageCanvas(displayCanvas.canvas.width, displayCanvas.canvas.height - CONSOLE_HEIGHT);
	
	switch(type)
	{
		case ANIMATED_TITLE_CANVAS:
			backgroundCanvas.setImage(TITLE_PNG);
			break;
		case ANIMATED_GAME_OVER_CANVAS:
			backgroundCanvas.setImage(GAME_OVER_PNG);
			break;
		case ANIMATED_WIN_CANVAS:
			backgroundCanvas.setImage(WIN_PNG);
			break;
	}

	this.imagesLoaded = function()
	{
		return textCanvas.imageLoaded() && backgroundCanvas.imageLoaded();
	};
	
	this.reset = function()
	{
		frame = 0;
		message = "";
	};
	
	this.updateFrame = function()
	{
		if (frame < 200)
			++frame;
			
		if (flashDelay > 0)
			--flashDelay;
		else
		{
			flashDelay = 25;
			showMessage = !showMessage;
		}
	};
	
	this.setMessage = function(text, flash)
	{
		message = text;
		flashMessage = flash;
	};
	
	var drawTitle = function()
	{
		
		switch(type)
		{
			case ANIMATED_TITLE_CANVAS:
				textCanvas.drawTile(outputCanvas.context, 0, 140, Math.min(70, Math.max(-100, (frame - 40) * 15)));
				textCanvas.drawTile(outputCanvas.context, 1, 140, Math.min(160, Math.max(-100, (frame - 20) *15)));
				textCanvas.drawTile(outputCanvas.context, 2, 140, Math.min(250, Math.max(-100, (frame) * 15)));
		
				if (frame >= 80)
				{
					// Draw signature
					outputCanvas.context.font=("20px Arial");
					outputCanvas.context.fillStyle = 'black';
					outputCanvas.context.fillText("Copyright 2013 by Andrew McClory", 302, outputCanvas.canvas.height - 40);
					outputCanvas.context.fillStyle = 'white';
					outputCanvas.context.fillText("Copyright 2013 by Andrew McClory", 300, outputCanvas.canvas.height - 42);
				}
			break;
			case ANIMATED_GAME_OVER_CANVAS:
				textCanvas.drawTile(outputCanvas.context, 3, Math.min(20, -360 + (frame * 5)), 200);
				textCanvas.drawTile(outputCanvas.context, 4, Math.max(270, displayCanvas.canvas.width - (frame * 5)), 200);
			break;
			case ANIMATED_WIN_CANVAS:
				textCanvas.drawTile(outputCanvas.context, 6, 20, Math.min(100, -100 + (frame * 5)));
				textCanvas.drawTile(outputCanvas.context, 7, 270, Math.max(100, 300 - (frame * 5)));
				
				outputCanvas.context.font=("20px Arial");
				outputCanvas.context.fillStyle = 'white';
				
				if (frame >= 50)
					outputCanvas.context.fillText("Will Manro recover his golden axe and defeat the evil Scalito?", 30, 330);
				if (frame >= 125)
					outputCanvas.context.fillText("Will Andy find time to create the remaining levels?", 30, 370);
				if (frame >= 200)
				{
					outputCanvas.context.fillText("Thanks for playing and come back soon to play new levels!", 30, 410);
					outputCanvas.context.fillText("Your final score was " + score, 30, 450);
				}
			break;
		}
		
		if (showMessage || !flashMessage)
		{

			outputCanvas.context.font=("20px Arial");
			outputCanvas.context.fillStyle = 'black';
			outputCanvas.context.fillText(message, 20, outputCanvas.canvas.height - 8);
		}
	};
	
	this.draw = function()
	{
		if (!this.imagesLoaded)
			return false;
		
		// First copy the background canvas onto the output canvas
		outputCanvas.context.clearRect(0, 0, outputCanvas.canvas.width, outputCanvas.canvas.height);
		outputCanvas.context.drawImage(backgroundCanvas.canvas, 0, 0);
		
		// Draw title segments onto output canvas
		drawTitle();
		
		// Finally copy output canvas onto the display canvas
		displayCanvas.context.clearRect(0, 0, displayCanvas.canvas.width, displayCanvas.canvas.height);
		
		displayCanvas.context.drawImage(outputCanvas.canvas, 0, 0);
	};
	
	this.redrawImageCanvases = function()
	{
		backgroundCanvas.redraw();
		textCanvas.redraw();
	};
};