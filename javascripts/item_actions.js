// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

function GetDoorSpriteNum(type, frame)
{
	switch(type)
	{
		case TYPE_YELLOW_DOOR:
			return 0 + frame;
		case TYPE_RED_DOOR:
			return 4 + frame;
		case TYPE_GREEN_DOOR:
			return 8 + frame;
		case TYPE_BLUE_DOOR:
			return 12 + frame;
		default:
			return 0 + frame;
	}
}

function GetCoinSpriteNum(type, frame)
{
	switch(type)
	{
		case TYPE_GOLD_COIN:
			return frame;
		case TYPE_SILVER_COIN:
			return 20 + frame;
		case TYPE_PURPLE_COIN:
			return 32 + frame;
	}
}

function GetBreakableSpriteNum(type, health)
{
	switch(type)
	{
		case TYPE_BREAKABLE_WALL:
			return 8 - health;
		case TYPE_ICE_WALL:
			return 32 - health;
	}
}

function CoinInitial(levelData)
{
	this.spriteSet = SPRITESET_ITEMS;
	this.frame = Math.floor(Math.random()*4);
	this.spriteNum = GetCoinSpriteNum(this.type, this.frame);
	
	this.drawOrder = 0;
			
	this.action = CoinFlip;
}

function CoinFlip(levelData)
{
	if (levelData.heroObject !== null && ObjectsOverlap(this, levelData.heroObject, levelData))
	{
		switch(this.type)
		{
			// Replace the coin with a score
			case TYPE_GOLD_COIN:
				levelData.score+=50;
				CreateScoreObject(50, this.location, levelData);
				break;
			case TYPE_SILVER_COIN:
				levelData.score+=25;
				CreateScoreObject(25, this.location, levelData);
				break;
			case TYPE_PURPLE_COIN:
				levelData.score+=100;
				CreateScoreObject(100, this.location, levelData);
				break;
		}
		this.action = null;
	}
		
	if (this.delay > 0)
		--this.delay;
	else
	{
		++this.frame;
		if (this.frame >= 4)
			this.frame = 0;
		
		this.spriteNum = GetCoinSpriteNum(this.type, this.frame);
		
		this.delay = 5;
	}
}

function BreakableWallInitial(levelData)
{
	this.spriteSet = SPRITESET_ITEMS;
	
	this.spriteNum = 4;
	this.drawOrder = 1;
	
	this.health = 4;
	this.spriteNum = GetBreakableSpriteNum(this.type, this.health);
	
	this.action = BreakableWallIdle;
}

function BreakableWallIdle(levelData)
{
	if (this.attacked > 0)
	{
		this.health-=this.attacked;
		
		if (this.health <= 0) {
			this.action = BreakableWallFall;
			this.visible = true;
		}
		else
		{
			this.recoveryDelay = BREAKABLE_WALL_RECOVERY_DELAY;
			this.flashDelay = FLASH_DELAY;
			this.action = BreakableWallJiggle;
		}
	}
	
	if (this.health > 0)
		this.spriteNum = GetBreakableSpriteNum(this.type, this.health);
}

function BreakableWallJiggle(levelData)
{
	if (this.recoveryDelay > 0)
	{
		--this.recoveryDelay;
		
		if (this.flashDelay > 0)
		{
			--this.flashDelay;
			this.flashDelay = FLASH_DELAY;
			this.visible = !this.visible;
		}
	}
	else
	{
		this.attacked = 0;
		this.action = BreakableWallIdle;
		this.visible = true;
	}
}

function BreakableWallFall(levelData)
{
	this.location.y+=BREAKABLE_SPEED;	
	
	if (this.location.y > levelData.height * TILE_HEIGHT)
	{
		this.action = null;
	}
}

function KeyInitial(levelData)
{
	this.spriteSet = SPRITESET_ITEMS;
	
	switch(this.type)
	{
		case TYPE_YELLOW_KEY:
			this.spriteNum = 8;
			break;
		case TYPE_RED_KEY:
			this.spriteNum = 9;
			break;
		case TYPE_GREEN_KEY:
			this.spriteNum = 10;
			break;
		case TYPE_BLUE_KEY:
			this.spriteNum = 11;
			break;
		default:
			this.spriteNum = 8;
			break;
	}
	
	this.drawOrder = 0;
	
	this.action = KeyIdle;
}

function KeyIdle(levelData)
{
	if (levelData.heroObject !== null && ObjectsOverlap(this, levelData.heroObject, levelData))
	{
		levelData.score+=50;
		this.action = null;
		
		levelData.heroObject.inventory.addNode(this);
		
		// Replace the key with a score
		CreateScoreObject(50, this.location, levelData);
	}
}

function DoorInitial(levelData)
{
	this.spriteSet = SPRITESET_DOORS;
	this.frame = 0;
	this.spriteNum = GetDoorSpriteNum(this.type, this.frame);
	this.drawOrder = 1;
	
	this.action = DoorIdle;
}

function DoorIdle(levelData)
{
	if (levelData.heroObject === null)
		return;
		
	var doorBoundingRect = UpdateBoundingRect(this, levelData);
	var heroBoundingRect = UpdateBoundingRect(levelData.heroObject, levelData);
	
	// Check if door is on the same horizontal plane as the hero
	if (RectanglesOverlapVertically(doorBoundingRect, heroBoundingRect))
	{
		// If hero is standing on either side of door check if hero possesses key
		if (doorBoundingRect.left === heroBoundingRect.right + 1 || doorBoundingRect.right === heroBoundingRect.left - 1)
		{
			// Cycle through all hero inventory items
			var inventoryIter = levelData.heroObject.inventory.newIterator();
			var gameObject = null;
			
			while (inventoryIter.valid())
			{
				gameObject = inventoryIter.getData();
				
				if (this.type === TYPE_YELLOW_DOOR && gameObject.type === TYPE_YELLOW_KEY ||
					this.type === TYPE_RED_DOOR && gameObject.type === TYPE_RED_KEY ||
					this.type === TYPE_GREEN_DOOR && gameObject.type === TYPE_GREEN_KEY ||
					this.type === TYPE_BLUE_DOOR && gameObject.type === TYPE_BLUE_KEY)
					this.action = DoorInitialOpen;
				
				inventoryIter.increment();
			}
		}
	}
}

function DoorInitialOpen(levelData)
{
	this.delay = DOOR_DELAY;
	this.frame = 1;
	
	this.action = DoorOpen;
}

function DoorOpen(levelData)
{
	if (this.delay > 0)
		--this.delay;
	else
	{
		this.frame++;
		this.delay = DOOR_DELAY;
		
		// If this is the last frame the door is now passable, i.e. no longer solid
		if (this.frame === 3)
		{
			this.attributeBits &= ~BIT_MASK_SOLID;
			this.action = DoorOpened;
		}
	}
		
	this.spriteNum = GetDoorSpriteNum(this.type, this.frame);
}

function DoorOpened(levelData)
{
}

function ClimbableInitial(levelData)
{
	switch(this.type)
	{
		case TYPE_BROWN_LADDER:
			this.spriteSet = SPRITESET_LADDERS;
			this.spriteNum = 0;
			break;
		case TYPE_BROWN_TOP_LADDER:
			this.spriteSet = SPRITESET_LADDERS;
			this.spriteNum = 1;
			break;
		case TYPE_YELLOW_ROPE:
			this.spriteSet = SPRITESET_ROPES;
			this.spriteNum = 0;
			break;
		case TYPE_GRAY_LADDER:
			this.spriteSet = SPRITESET_LADDERS;
			this.spriteNum = 2;
			break;
		default:
			this.spriteSet = SPRITESET_LADDERS;
			this.spriteNum = 0;
			break;
	}
	
	this.drawOrder = 0;
}

function MovableInitial(levelData)
{
	this.spriteSet = SPRITESET_MOVABLES;
	
	switch(this.type)
	{
		case TYPE_BARREL_MOVABLE:
			this.spriteNum = 0;
			break;
		case TYPE_CRATE_MOVABLE:
			this.spriteNum = 1;
			break;
	}
	
	this.drawOrder = 1;
	this.action = MovableIdle;
}

function MovableIdle(levelData)
{
	var boundingRect = UpdateBoundingRect(this, levelData);
	var distanceMoved = 0;
	
	if (this.xSpeed !== 0)
	{
		if (this.xSpeed < 0)
			distanceMoved = ShiftConveyable(this, levelData, DIRECTION_LEFT, Math.abs(this.xSpeed));
		else
			distanceMoved = ShiftConveyable(this, levelData, DIRECTION_RIGHT, this.xSpeed);
			
		// If the object is not on a slippery surface, it always comes to an immediate stop
		if (distanceMoved === 0 || !IsOnSlippery(boundingRect, levelData))
			this.xSpeed = 0;
	}
	
	boundingRect = UpdateBoundingRect(this, levelData);
	
	++this.ySpeed;
	if (this.ySpeed > MOVABLE_TERMINAL_VELOCITY)
		this.ySpeed = MOVABLE_TERMINAL_VELOCITY;
	
	this.ySpeed = CanMoveDown(boundingRect, levelData, Math.abs(this.ySpeed));
	
	this.location.y+=this.ySpeed;
}

function JumpBoostInitial(levelData)
{
	this.spriteSet = SPRITESET_ITEMS;
	this.spriteNum = 16;
	
	this.drawOrder = 0;
	
	this.action = JumpBoostIdle;
}

function JumpBoostIdle(levelData)
{
	if (levelData.heroObject !== null && ObjectsOverlap(this, levelData.heroObject, levelData))
	{
		levelData.score+=100;
		this.action = null;
		
		levelData.heroObject.inventory.addNode(this);
		
		// Replace the jump boost with a score
		CreateScoreObject(100, this.location, levelData);
	}
	
	if (this.delay > 0)
		--this.delay;
	else
	{
		++this.spriteNum;
		
		if (this.spriteNum > 17)
			this.spriteNum = 16;
	}
}

function HealthInitial(levelData)
{
	this.spriteSet = SPRITESET_ITEMS;
	
	switch(this.type)
	{
		case TYPE_SMALL_HEALTH:
			this.spriteNum = 24;
			break;
		case TYPE_LARGE_HEALTH:
			this.spriteNum = 26;
			break;
	}
	
	this.drawOrder = 0;
	
	this.action = HealthIdle;
}

function HealthIdle(levelData)
{
	if (levelData.heroObject !== null && ObjectsOverlap(this, levelData.heroObject, levelData))
	{
		switch(this.type)
		{
			// Replace the health potion with a score
			case TYPE_SMALL_HEALTH:
				levelData.heroObject.health+=1;
				levelData.score+=25;
				CreateScoreObject(25, this.location, levelData);
				break;
			case TYPE_LARGE_HEALTH:
				levelData.heroObject.health+=2;
				levelData.score+=50;
				CreateScoreObject(50, this.location, levelData);
				break;
		}
		
		if (levelData.heroObject.health > HERO_MAX_HEALTH)
			levelData.heroObject.health = HERO_MAX_HEALTH;
			
		this.action = null;
	}
		
	if (this.delay > 0)
		--this.delay;
	else
	{
		++this.spriteNum;
		
		switch(this.type)
		{
			case TYPE_SMALL_HEALTH:
				if (this.spriteNum > 25)
					this.spriteNum = 24;
					break;
			case TYPE_LARGE_HEALTH:
				if (this.spriteNum > 27)
					this.spriteNum = 26;
					break;
		}
		
		this.delay = 5;
	}
}

function ExitInitial(levelData)
{
	this.spriteSet = SPRITESET_EXITS;
	this.spriteNum = 0;
	this.drawOrder = 0;
	this.delay = EXIT_DELAY;
	
	this.action = ExitIdle;
}

function ExitIdle(levelData)
{
	if (this.delay > 0)
		--this.delay;
	else {
		this.delay = EXIT_DELAY;
		
		if (this.spriteNum < 3)
			++this.spriteNum;
		else
			this.spriteNum = 0;
	}
}