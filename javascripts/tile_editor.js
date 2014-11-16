// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var TileEditor = function()
{
	var curTileSetData = new TileSetData(JSON.parse(TILE_JSON[0]));
	document.forms["OpenForm"]["TileSetNumber"].value = 0;
	
	var tileCanvas = document.getElementById("TileCanvas");
	
	try
	{
		var tp = new TilePalette(tileCanvas, TILE_WIDTH, TILE_HEIGHT);
		tp.setTileImage(curTileSetData.src);
	}
	catch(err)
	{
		alert(err);
	}
	
	var tpNeedsRedraw = true;
	
	function clearTileSetData()
	{
		curTileSetData.tileData = new Array(tp.getNumTiles());
		
		for (var i = 0; i < curTileSetData.tileData.length; ++i)
		{
			curTileSetData.tileData[i] = new TileData();
		}
	}
	
	// Fill in undefined tile data objects with new ones, retaining the others
	function fillTileSetData()
	{
		curTileSetData.tileData.length = tp.getNumTiles();
		
		for (var i = 0; i < curTileSetData.tileData.length; ++i)
		{
			if (typeof curTileSetData.tileData[i] === "undefined")
				curTileSetData.tileData[i] = new TileData();
		}
	}

	setInterval(function()
	{
		if (tpNeedsRedraw && tp.imageLoaded())
		{
			tp.draw();
			fillTileSetData();
			updateForms();
			tpNeedsRedraw = false;
		}
		
	}, 1000/FPS);
	
	function updateForms()
	{
		var tileData = curTileSetData.tileData[tp.getSelectedTile()];
		
		if (typeof tileData === "undefined")
		{
			document.getElementById("solid").checked = false;
			document.getElementById("slippery").checked = false;
		}
		else
		{
			document.getElementById("solid").checked = tileData.solid;
			document.getElementById("slippery").checked = tileData.slippery;
		}
		
		document.forms["SrcForm"]["TileImage"].value = curTileSetData.src;
		
		var textArea = document.getElementById("TileOutput");
		textArea.value = JSON.stringify(curTileSetData);
	}
	
	function updateTileData() 
	{
		var tileData = curTileSetData.tileData[tp.getSelectedTile()];
		if (typeof tileData === "undefined")
		{
		}
		else
		{
			tileData.solid = document.getElementById("solid").checked;
			tileData.slippery = document.getElementById("slippery").checked;
		}
	}

	this.tileMouseDown = function(event)
	{
		updateTileData();
		
		tp.mouseDown(event);
		
		updateForms();
	}
	
	this.onGenerate = function()
	{
		if (parseInt(document.forms["OpenForm"]["TileSetNumber"].value) >= 0 && parseInt(document.forms["OpenForm"]["TileSetNumber"].value) <= 10)
		{
			curTileSetData = new TileSetData();
			curTileSetData.src = document.forms["SrcForm"]["TileImage"].value + GetTimeTag();
			clearTileSetData();
			tp.setTileImage(curTileSetData.src);
			
			var textArea = document.getElementById("TileOutput");
			textArea.value = JSON.stringify(curTileSetData);
			
			updateForms();
			tpNeedsRedraw = true;
		}
	}
	
	this.onOpen = function()
	{
		if (parseInt(document.forms["OpenForm"]["TileSetNumber"].value) >= 0 && parseInt(document.forms["OpenForm"]["TileSetNumber"].value) <= 10)
		{
			curTileSetData = new TileSetData(JSON.parse(TILE_JSON[document.forms["OpenForm"]["TileSetNumber"].value]));
			
			updateForms();
			tp.setTileImage(curTileSetData.src);
			
			tpNeedsRedraw = true;
		}
	}
	
	this.onRefresh = function()
	{
		updateTileData();
		var textArea = document.getElementById("TileOutput");
		textArea.value = JSON.stringify(curTileSetData);
	}
}