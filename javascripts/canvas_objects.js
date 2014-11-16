// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

function GetTimeTag()
{
	var date = new Date();
	var tag = "?" + ("0000" + date.getFullYear()).slice(-4) + ("00" + (date.getMonth()+1)).slice(-2) + ("00"+date.getDate()).slice(-2) + ("00" + date.getHours()).slice(-2) + ("00" + date.getMinutes()).slice(-2);
	return tag;
}

function relMouseCoords(event){
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var canvasX = 0;
	var canvasY = 0;
		 
	var currentElement = this;

	do
	{
		totalOffsetX += currentElement.offsetLeft;
		totalOffsetY += currentElement.offsetTop;
	}
	while(currentElement = currentElement.offsetParent);

	canvasX = event.pageX - totalOffsetX;
	canvasY = event.pageY - totalOffsetY;

	return {x:canvasX, y:canvasY};
}
	
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

// Constructor that contains a canvas and 2D context for an offscreen canvas
var VirtualCanvas = function(width, height)
{
	this.canvas = document.createElement('canvas');
	
	if (typeof width !== "undefined");
		this.canvas.width = width;
	if (typeof height !== "undefined");
		this.canvas.height = height;
		
	this.context = this.canvas.getContext("2d");
};

// Constructor that contains a canvas and 2D context for a visible canvas
var PhysicalCanvas = function(canvas)
{
	this.canvas = canvas;
	this.context = this.canvas.getContext("2d");
};

// Constructor for creating a canvas and context for an image on an offscreen canvas
var ImageCanvas = function(width, height)
{
	VirtualCanvas.apply(this, arguments);
  
	this.image = new Image();
	var imageLoadedFlag = false;
	
	this.imageLoaded = function()
   {
      return imageLoadedFlag;
   };
   
   this.setImage = function(src)
   {
		this.image = new Image();
		imageLoadedFlag = false;

		var ref = this;
		
		this.image.onload = function()
		{		
			ref.context.drawImage(this, 0, 0);
			imageLoadedFlag = true;
			
			setTimeout(function()
			{
				// Workaround for IE 9 issue in which images sometimes fail to load in their onload functions
				ref.redraw();
			}, 500);
		};
		
		this.image.onerror = function()
		{
			alert("Unable to load " + this.src);
		};
		this.image.src = src;
   };
   
   this.redraw = function()
   {	
		if (imageLoadedFlag)
		{
			this.context.drawImage(this.image, 0, 0);
		}
   };
};

// Constructor for creating a canvas and context for an image on an offscreen canvas
var TileCanvas = function(tileWidth, tileHeight)
{
	VirtualCanvas.apply(this);
	
	var numTiles = 0;
  
	this.image = new Image();
	var imageLoadedFlag = false;
	
	this.getNumTiles = function()
   {
      return numTiles;
   };
	
	this.imageLoaded = function()
   {
      return imageLoadedFlag;
   };
   
   this.setImage = function(src)
   {
		this.image = new Image();
		imageLoadedFlag = false;

		var ref = this;
		
		this.image.onload = function()
		{
			if (tileWidth > this.width)
				tileWidth = this.width;
			if (tileHeight > this.height)
				tileHeight = this.height;
				
			ref.canvas = document.createElement('canvas');
			ref.canvas.width = tileWidth * (Math.floor(this.width / tileWidth) * Math.floor(this.height / tileHeight));
			ref.canvas.height = tileHeight;
			ref.context=ref.canvas.getContext("2d"); 
			
			numTiles = 0;

			for (var y = 0; y < this.height; y+=tileHeight)
			{
				for (var x = 0; x < this.width; x+=tileWidth)
				{
					ref.context.drawImage(this, x, y, tileWidth, tileHeight, numTiles * tileWidth, 0, tileWidth, tileHeight);
					++numTiles;
				}
			}
			imageLoadedFlag = true;
			
			setTimeout(function()
			{
				// Workaround for IE 9 issue in which images sometimes fail to load in their onload functions
				ref.redraw();
			}, 500);
		};
		
		this.image.onerror = function()
		{
			alert("Unable to load " + this.src);
		};

      this.image.src = src;
   };
   
   this.drawTile = function(ctx, tile, x, y)
   {
		if (!imageLoadedFlag)
		{
			return;
		}
		
      ctx.drawImage(this.canvas, tile * tileWidth, 0, tileWidth, tileHeight, x, y, tileWidth, tileHeight);
   };
   
	this.getTileWidth = function()
	{
		return tileWidth;
	};
	
	this.getTileHeight = function()
	{
		return tileHeight;
	};
	
	this.redraw = function()
	{
		if (imageLoadedFlag)
		{
			var tileCount = 0;
			
			for (var y = 0; y < this.image.height; y+=tileHeight)
			{	
				for (var x = 0; x < this.image.width; x+=tileWidth)
				{
					this.context.drawImage(this.image, x, y, tileWidth, tileHeight, tileCount * tileWidth, 0, tileWidth, tileHeight);
					++tileCount;
				}
			}
		}
	};
};

