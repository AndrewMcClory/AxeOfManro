// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

function CreateScoreObject(score, location, levelData)
{
	var scoreObject = levelData.addGameObject(TYPE_SCORE, location);
	
	switch(score)
	{
		case 25:
			scoreObject.spriteNum = 0;
			break;
		case 50:
			scoreObject.spriteNum = 1;
			break;
		case 100:
			scoreObject.spriteNum = 2;
			break;
		case 200:
			scoreObject.spriteNum = 3;
			break;
		default:
			scoreObject.spriteNum = 4;
			break;
	}
	
	return scoreObject;
}

function GetDecorationSpriteNum(type, frame)
{
	switch(type)
	{
		case TYPE_TORCH:
			return frame;
		break;
		case TYPE_WATER:
			return 4 + frame;
		break;
		case TYPE_WATERFALL:
			return 8 + frame;
		break;
		case TYPE_ROUGH_WATER:
			return 12 + frame;
		break;
	}
}

function DecorationInitial(levelData)
{
	this.spriteSet = SPRITESET_DECORATIONS;

	switch(this.type)
	{
		case TYPE_TORCH:
			this.frame = Math.floor(Math.random()*4);
			this.drawOrder = 0;
		break;
		case TYPE_WATER:
			this.frame = Math.floor(Math.random()*4);
			this.drawOrder = 4;
		break;
		case TYPE_WATERFALL:
			this.frame = 0;
			this.drawOrder = 0;
		break;
		case TYPE_ROUGH_WATER:
			this.frame = Math.floor(Math.random()*4);
			this.drawOrder = 4;
		break;
	}
	
	this.spriteNum = GetDecorationSpriteNum(this.type, this.frame);
	this.action = DecorationAnimate;
}

function DecorationAnimate(levelData)
{
	if (this.delay > 0)
		--this.delay;
	else
	{
		switch(this.type)
		{
			case TYPE_TORCH:
				this.delay = TORCH_DELAY;
			break;
			case TYPE_WATER:
				this.delay = WATER_DELAY;
			break;
			case TYPE_WATERFALL:
				this.delay = WATERFALL_DELAY;
			break;
			case TYPE_ROUGH_WATER:
				this.delay = WATER_DELAY;
			break;
		}
		
		++this.frame;
		
		if (this.frame > 3)
			this.frame = 0;
	}
	
	this.spriteNum = GetDecorationSpriteNum(this.type, this.frame);
	
}

function ScoreInitial(levelData)
{
	this.spriteSet = SPRITESET_SCORES;
	this.drawOrder = 4;
	this.action = ScoreRise;
}

function ScoreRise(levelData)
{
	this.location.y-=SCORE_SPEED;
	this.location.x+=Math.floor(Math.random()*5) - 2;
	
	if (this.location.y < 0)
	{
		this.action = null;
	}
}

function SmokeInitial(levelData)
{
	this.spriteSet = SPRITESET_WIZARD;
	this.spriteNum = 3;
	this.drawOrder = 3;
	
	this.delay = SMOKE_DELAY;
	this.action = SmokeAnimate;
}

function SmokeAnimate(levelData)
{
	if (this.delay > 0)
		--this.delay;
	else
	{
		this.delay = SMOKE_DELAY;
		
		++this.spriteNum;
		
		if (this.spriteNum > 5)
			this.action = null;
	}
}