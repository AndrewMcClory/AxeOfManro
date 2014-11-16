// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

function InfoTextData(font, color, content, location)
{
	this.font = font;
	this.color = color;
	this.content = content;
	this.location = location;
}

function InfoSpriteData(tile, location)
{
	this.tile = tile;
	this.location = location;
}

function InfoData(data)
{
	this.textData = new LinkedList();
	this.spriteData = new LinkedList();
	
	if (typeof data === "undefined")
	{
		this.background = "";
		this.sprites = "";
	}
	else
	{
		this.background = data.background;
		this.sprites = data.sprites;

		for (var i = 0; i < data.textDataArray.length; ++i)
			this.textData.addNode(data.textDataArray[i]);
		for (i = 0; i < data.spriteDataArray.length; ++i)
			this.spriteData.addNode(data.spriteDataArray[i]);
	}
	
	this.getData = function()
	{
		var data = {};
		
		data.background = this.background;
		data.sprites = this.sprites;
		
		var textDataIter = this.textData.newIterator();
		
		data.textDataArray = [];
		var textDataCount = 0;
		var textDataObject = null;
		
		while (textDataIter.valid())
		{
			textDataObject = textDataIter.getData();
			data.textDataArray[textDataCount] = {};
			data.textDataArray[textDataCount].font = textDataObject.font;
			data.textDataArray[textDataCount].color = textDataObject.color;
			data.textDataArray[textDataCount].content = textDataObject.content;
			data.textDataArray[textDataCount].location = new Point(textDataObject.location.x, textDataObject.location.y);
			
			textDataIter.increment();
			++textDataCount;
		}
		
		var spriteDataIter = this.spriteData.newIterator();
		
		data.spriteDataArray = [];
		var spriteDataCount = 0;
		var spriteDataObject = null;
		
		while (spriteDataIter.valid())
		{
			spriteDataObject = spriteDataIter.getData();
			data.spriteDataArray[spriteDataCount] = {};
			data.spriteDataArray[spriteDataCount].tile = spriteDataObject.tile;
			data.spriteDataArray[spriteDataCount].location = new Point(spriteDataObject.location.x, spriteDataObject.location.y);
			
			spriteDataIter.increment();
			++spriteDataCount;
		}
		
		return data;
	};
}

