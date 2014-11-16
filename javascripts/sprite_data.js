// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

function SpriteData(data)
{
	this.attackRect = new Rectangle(0, 0, 0, 0);
	
	if (typeof data === "undefined")
	{
		this.anchorPoint = new Point(0, 0);
		
	}
	else
	{
		this.anchorPoint = new Point(data.anchorPoint.x, data.anchorPoint.y);
		
		if (typeof data.attackRect !== "undefined")
		{
			this.attackRect.left = data.attackRect.left;
			this.attackRect.top = data.attackRect.top;
			this.attackRect.right = data.attackRect.right;
			this.attackRect.bottom = data.attackRect.bottom;
		}
	}
}

function SpriteSetData(data)
{
	this.spriteData = [];
	this.boundingRect = new Rectangle(0, 0, 0, 0);
	
	if (typeof data === "undefined")
	{
		this.src = "";
		this.spriteWidth = 32;
		this.spriteHeight = 32;
		
	}
	else
	{
		this.src = data.src;
		this.spriteWidth = data.spriteWidth;
		this.spriteHeight = data.spriteHeight;
		if (typeof data.boundingRect !== "undefined")
		{
			this.boundingRect.left = data.boundingRect.left;
			this.boundingRect.top = data.boundingRect.top;
			this.boundingRect.right = data.boundingRect.right;
			this.boundingRect.bottom = data.boundingRect.bottom;
		}
		
		for (var i = 0; i < data.spriteData.length; ++i)
		{
			this.spriteData[i] = new SpriteData(data.spriteData[i]);
		}
	}
}