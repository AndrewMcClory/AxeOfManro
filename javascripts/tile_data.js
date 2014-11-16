// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

function TileData(data)
{
	if (typeof data === "undefined")
	{
		this.solid = false;
		this.slippery = false;
	}
	else
	{
		this.solid = data.solid;
		this.slippery = data.slippery;
	}
}

function TileSetData(data)
{
	this.tileData = new Array();
	
	if (typeof data === "undefined")
	{
		this.src = "";
	}
	else
	{
		this.src = data.src;
		
		for (var i = 0; i < data.tileData.length; ++i)
		{
			this.tileData[i] = new TileData(data.tileData[i]);
		}
	}
}

