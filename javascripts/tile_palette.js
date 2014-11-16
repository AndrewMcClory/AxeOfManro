// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var TilePalette = function(canvas, tileWidth, tileHeight)
{
   var physicalCanvas = new PhysicalCanvas(canvas);  
   var tileCanvas = new TileCanvas();
	
   var selectedTile = 0;
	
	this.setTileImage = function(src)
	{
		tileCanvas = new TileCanvas(tileWidth, tileHeight);
		tileCanvas.setImage(src);
		selectedTile = 0;
	};
	
	this.imageLoaded = function()
	{
		return tileCanvas.imageLoaded();
	};
   
   this.mouseDown = function(event)
   {
		var coords = physicalCanvas.canvas.relMouseCoords(event);
		
		var row = Math.floor(coords.y / tileHeight);
		var column = Math.floor(coords.x / tileWidth);
      
		var tilesPerRow = Math.floor(physicalCanvas.canvas.width / tileWidth);

		var clickedTile = tilesPerRow * row + column;

		if (clickedTile < tileCanvas.getNumTiles())
		{
			selectedTile = clickedTile;
			this.draw();
		}
   };
   
   this.draw = function()
   {
	physicalCanvas.context.clearRect(0, 0, physicalCanvas.canvas.width, physicalCanvas.canvas.height);
			
      var x = 0;
      var y = 0;
    
      for (i = 0; i < tileCanvas.getNumTiles(); ++i)
      {
         if (x+tileWidth > physicalCanvas.canvas.width)
         {
            x = 0;
            y+=tileHeight;
         }
			
         tileCanvas.drawTile(physicalCanvas.context, i, x, y);
			
         if (i === selectedTile)
         {
            physicalCanvas.context.strokeStyle="#000000";
            physicalCanvas.context.strokeRect(x, y, tileWidth-1, tileHeight-1);
            physicalCanvas.context.strokeRect(x + 4, y + 4, tileWidth - 8, tileHeight - 8);
            physicalCanvas.context.strokeRect(x + 8, y + 8, tileWidth - 16, tileHeight - 16);
         }

         x+=tileWidth;	
      }
   };
	
	this.getSelectedTile = function()
	{
		return selectedTile;
	};
	
	this.getNumTiles = function()
	{
		return tileCanvas.getNumTiles();
	};
};