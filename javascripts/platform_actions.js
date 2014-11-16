// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

function PlatformDirectionInitial(levelData)
{
	this.spriteSet = SPRITESET_ITEMS;
	
	switch(this.type)
	{
		case TYPE_UP_PLATFORM:
			this.spriteNum = 12;
			break;
		case TYPE_DOWN_PLATFORM:
			this.spriteNum = 13;
			break;
		case TYPE_LEFT_PLATFORM:
			this.spriteNum = 14;
			break;
		case TYPE_RIGHT_PLATFORM:
			this.spriteNum = 15;
			break;
	}
	
	this.drawOrder = 0;
	this.action = PlatformDirectionIdle;
}

function PlatformDirectionIdle(levelData)
{
	this.visible = false;
}

function PlatformInitial(levelData)
{
	this.spriteSet = SPRITESET_PLATFORMS;
	
	switch(this.type)
	{
		case TYPE_BROWN_PLATFORM:
			this.spriteNum = 0;
			break;
		case TYPE_GRAY_PLATFORM:
			this.spriteNum = 1;
			break;
	}
	
	this.drawOrder = 1;
	this.direction = DIRECTION_NONE;
	this.action = PlatformMove;
}

function CheckPlatformDirectionChange(levelData)
{
	var startingPlatformBoundingRect = UpdateBoundingRect(this, levelData);
	
	var gameObjectIter = levelData.platformDirectionObjects.newIterator();
	var gameObject = null;
	var objectBoundingRect = null;
	
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();	
		
		directionBoundingRect = UpdateBoundingRect(gameObject, levelData);
			
		if (RectanglesOverlap(startingPlatformBoundingRect, directionBoundingRect))
		{
			switch(gameObject.type)
			{
				case TYPE_UP_PLATFORM:
					this.direction = DIRECTION_UP;
					break;
				case TYPE_DOWN_PLATFORM:
					this.direction = DIRECTION_DOWN;
					break;
				case TYPE_LEFT_PLATFORM:
					this.direction = DIRECTION_LEFT;
					break;
				case TYPE_RIGHT_PLATFORM:
					this.direction = DIRECTION_RIGHT;
					break;
			}
		}
		gameObjectIter.increment();	
	}
}

function PlatformMove(levelData)
{
	CheckPlatformDirectionChange.call(this, levelData);
	
	var startLocation = new Point(this.location.x, this.location.y);
	ShiftConveyable(this, levelData, this.direction, PLATFORM_SPEED);
	var endLocation = new Point(this.location.x, this.location.y);
	
	switch (this.direction)
	{
		case DIRECTION_UP:
			if (startLocation.y === endLocation.y)
				this.direction = DIRECTION_DOWN;
			break;
		case DIRECTION_DOWN:
			if (startLocation.y === endLocation.y)
				this.direction = DIRECTION_UP;
			break;
		case DIRECTION_LEFT:
			if (startLocation.x === endLocation.x)
				this.direction = DIRECTION_RIGHT;
			break;
		case DIRECTION_RIGHT:
			if (startLocation.x === endLocation.x)
				this.direction = DIRECTION_LEFT;
			break;
	}
}