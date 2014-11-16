// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var BIT_MASK_SOLID = 1 << 0;
var BIT_MASK_VULNERABLE = 1 << 1;
var BIT_MASK_CLIMBABLE = 1 << 2;
var BIT_MASK_CONVEYABLE = 1 << 3;
var BIT_MASK_PLATFORM_DIRECTION = 1 << 4;
var BIT_MASK_MOVABLE = 1 << 5;
var BIT_MASK_EXIT = 1 << 6;
var BIT_MASK_SLIPPERY = 1 << 7;

function GameObject()
{
	this.type = 0;
	this.location = new Point(0, 0);
	this.boundingRect = new Rectangle(0, 0, 0, 0);
	this.attackRect = new Rectangle(0, 0, 0, 0);
	this.spriteSet = 0;
	this.spriteNum = 0;
	this.drawOrder = 0;
	this.visible = true;
	this.delay = 0;
	
	this.attributeBits = 0;
	
	this.action = null;
}

function MovingObject()
{
	GameObject.apply(this, arguments);
	
	this.xSpeed = 0;
	this.ySpeed = 0;
	this.direction = DIRECTION_RIGHT;
	this.frame = 0;
}

function ExitObject()
{
	GameObject.apply(this, arguments);
	
	this.attributeBits |= BIT_MASK_EXIT;
}

function VulnerableObject()
{
	this.attributeBits |= BIT_MASK_VULNERABLE;
	
	this.health = 0;
	this.attacked = false;
	this.recoveryDelay = 0;
	this.flashDelay = 0;
}

function BreakableWallObject()
{
	MovingObject.apply(this, arguments);
	VulnerableObject.apply(this, arguments);
	
	this.attributeBits |= BIT_MASK_SOLID;
}

function SlipperyBreakableWallObject()
{
	BreakableWallObject.apply(this, arguments);
	
	this.attributeBits |= BIT_MASK_SLIPPERY;
}

function ClimbableObject()
{
	GameObject.apply(this, arguments);
	
	this.attributeBits |= BIT_MASK_CLIMBABLE;
}

function DecorationObject()
{
	GameObject.apply(this, arguments);
	
	this.frame = 0;
}

function PlatformDirectionObject()
{
	GameObject.apply(this, arguments);
	
	this.attributeBits |= BIT_MASK_PLATFORM_DIRECTION;
}

function PlatformObject()
{
	MovingObject.apply(this, arguments);
	
	this.attributeBits |= BIT_MASK_SOLID;
}

function DoorObject()
{
	MovingObject.apply(this, arguments);
	
	this.attributeBits |= BIT_MASK_SOLID;
}

function MovableObject()
{
	MovingObject.apply(this, arguments);
	
	this.attributeBits |= BIT_MASK_SOLID;
	this.attributeBits |= BIT_MASK_CONVEYABLE;
	this.attributeBits |= BIT_MASK_MOVABLE;
}

function ProjectileObject()
{
	MovingObject.apply(this, arguments);
	
	this.shooter = null;
	this.duration = 0;
}

function WalkingEnemyObject()
{
	MovingObject.apply(this, arguments);
	
	VulnerableObject.apply(this,arguments);
	
	this.weapon = null;
	
	this.attributeBits |= BIT_MASK_CONVEYABLE;
	this.attributeBits |= BIT_MASK_SOLID;
	
	this.wanderDistance = 0;
}

function HeroObject()
{
	MovingObject.apply(this, arguments);
	VulnerableObject.apply(this, arguments);
	
	this.health = HERO_MAX_HEALTH;
	
	this.weapon = null;
	
	this.attributeBits |= BIT_MASK_CONVEYABLE;
	this.attributeBits |= BIT_MASK_SOLID;
	
	this.keys = [false, false, false, false, false, false];
	
	this.inventory = new LinkedList();
}

function LevelData(data)
{	
	this.tiles = [];

	this.gameObjects = new LinkedList();

	// Lists containing subsets of gameObjects intended for quick iterations for collision checks, platform moves, etc.
	this.vulnerableObjects = new LinkedList();
	this.solidObjects = new LinkedList();
	this.climbableObjects = new LinkedList();
	this.conveyableObjects = new LinkedList();
	this.platformDirectionObjects = new LinkedList();
	this.movableObjects = new LinkedList();
	this.exitObjects = new LinkedList();
	this.slipperyObjects = new LinkedList();
	
	this.score = 0;
	this.state = LEVEL_STATE_PLAY;
	this.heroObject = null;
	
	this.spriteSets = [];
	for (var i = 0; i < SPRITE_JSON.length; ++i)
	{
		this.spriteSets[i] = new SpriteSetData(JSON.parse(SPRITE_JSON[i]));
	}
	
	this.addGameObject = function(type, location)
	{
		var gameObject = null;
		
		switch(type)
		{
			case TYPE_HERO:
				gameObject = new HeroObject();
				gameObject.action = HeroInitial;
				this.heroObject = gameObject;
				break;
			case TYPE_GOLD_COIN:
			case TYPE_SILVER_COIN:
			case TYPE_PURPLE_COIN:
				gameObject = new DecorationObject();
				gameObject.action = CoinInitial;
				break;
			case TYPE_TORCH:
			case TYPE_WATER:
			case TYPE_WATERFALL:
			case TYPE_ROUGH_WATER:
				gameObject = new GameObject();
				gameObject.action = DecorationInitial;
				break;
			case TYPE_BATTLE_AXE:
			case TYPE_WAR_HAMMER:
				gameObject = new GameObject();
				gameObject.action = WeaponInitial;
				break;
			case TYPE_SCORE:
				gameObject = new GameObject();
				gameObject.action = ScoreInitial;
				break;
			case TYPE_GUARD:
				gameObject = new WalkingEnemyObject();
				gameObject.action = GuardInitial;
				break;
			case TYPE_BREAKABLE_WALL:
			gameObject = new BreakableWallObject();
				gameObject.action = BreakableWallInitial;
				break;
			case TYPE_ICE_WALL:
				gameObject = new SlipperyBreakableWallObject();
				gameObject.action = BreakableWallInitial;
				break;
			case TYPE_YELLOW_KEY:
			case TYPE_RED_KEY:
			case TYPE_GREEN_KEY:
			case TYPE_BLUE_KEY:
				gameObject = new GameObject();
				gameObject.action = KeyInitial;
				break;
			case TYPE_YELLOW_DOOR:
			case TYPE_RED_DOOR:
			case TYPE_GREEN_DOOR:
			case TYPE_BLUE_DOOR:
				gameObject = new DoorObject();
				gameObject.action = DoorInitial;
				break;
			case TYPE_BROWN_LADDER:
			case TYPE_BROWN_TOP_LADDER:
			case TYPE_YELLOW_ROPE:
			case TYPE_GRAY_LADDER:
				gameObject = new ClimbableObject();
				gameObject.action = ClimbableInitial;
				break;
			case TYPE_BROWN_PLATFORM:
			case TYPE_GRAY_PLATFORM:
				gameObject = new PlatformObject();
				gameObject.action = PlatformInitial;
				break;
			case TYPE_UP_PLATFORM:
			case TYPE_DOWN_PLATFORM:
			case TYPE_LEFT_PLATFORM:
			case TYPE_RIGHT_PLATFORM:
				gameObject = new PlatformDirectionObject();
				gameObject.action = PlatformDirectionInitial;
				break;
			case TYPE_BARREL_MOVABLE:
			case TYPE_CRATE_MOVABLE:
				gameObject = new MovableObject();
				gameObject.action = MovableInitial;
				break;
			case TYPE_JUMP_BOOST:
				gameObject = new GameObject();
				gameObject.action = JumpBoostInitial;
				break;
			case TYPE_RED_HAZARD:
			case TYPE_GREEN_HAZARD:
				gameObject = new GameObject();
				gameObject.action = HazardInitial;
				break;
			case TYPE_SMALL_HEALTH:
			case TYPE_LARGE_HEALTH:
				gameObject = new GameObject();
				gameObject.action = HealthInitial;
				break;
			case TYPE_FLAME_PROJECTILE:
			case TYPE_ICICLE_PROJECTILE:
				gameObject = new ProjectileObject();
				gameObject.action = GroundProjectileInitial;
				break;
			case TYPE_DUNGEON_EXIT:
				gameObject = new ExitObject();
				gameObject.action = ExitInitial;
				break;
			case TYPE_SMOKE:
				gameObject = new GameObject();
				gameObject.action = SmokeInitial;
				break;
			case TYPE_WIZARD:
				gameObject = new WalkingEnemyObject();
				gameObject.action = WizardInitial;
				break;
			case TYPE_ICE_PROJECTILE:
				gameObject = new ProjectileObject();
				gameObject.action = AirProjectileInitial;
				break;
		}
	
		if (gameObject !== null)
		{
			gameObject.type = type;
			gameObject.location = new Point(location.x, location. y);
			gameObject.action(this);
			
			this.gameObjects.addNode(gameObject);
			if ((gameObject.attributeBits & BIT_MASK_VULNERABLE) !== 0)
				this.vulnerableObjects.addNode(gameObject);
			if ((gameObject.attributeBits & BIT_MASK_SOLID) !== 0)
				this.solidObjects.addNode(gameObject);
			if ((gameObject.attributeBits & BIT_MASK_CLIMBABLE) !== 0)
				this.climbableObjects.addNode(gameObject);
			if ((gameObject.attributeBits & BIT_MASK_CONVEYABLE) !== 0)
				this.conveyableObjects.addNode(gameObject);
			if ((gameObject.attributeBits & BIT_MASK_PLATFORM_DIRECTION) !== 0)
				this.platformDirectionObjects.addNode(gameObject);
			if ((gameObject.attributeBits & BIT_MASK_MOVABLE) !== 0)
				this.movableObjects.addNode(gameObject);
			if ((gameObject.attributeBits & BIT_MASK_EXIT) !== 0)
				this.exitObjects.addNode(gameObject);
			if ((gameObject.attributeBits & BIT_MASK_SLIPPERY) !== 0)
				this.slipperyObjects.addNode(gameObject);
		}
		
		return gameObject;
	};
	
	// Remove expired objects from subset lists 
	var cleanList = function(list, mask)
	{	
		var gameObjectIter = list.newIterator();
		var gameObject = null;
		
		while (gameObjectIter.valid())
		{
			gameObject = gameObjectIter.getData();
				
			if (gameObject.action === null || (gameObject.attributeBits & mask) === 0)
				gameObjectIter.remove();
			else
				gameObjectIter.increment();
		}
	};
	
	this.updateGameObjects = function()
	{
		var gameObjectIter = this.gameObjects.newIterator();
		var gameObject = null;
		
		while (gameObjectIter.valid())
		{
			gameObject = gameObjectIter.getData();
			
			if (gameObject.action !== null)
			{
				gameObject.action(this);
				
				if (gameObject.action === null)
					gameObject.visible = false;
					
				gameObjectIter.increment();
			}
			else
				gameObjectIter.remove();
		}
		
		// Remove expired entries from subset lists
		cleanList(this.vulnerableObjects, BIT_MASK_VULNERABLE);
		cleanList(this.solidObjects, BIT_MASK_SOLID);
		cleanList(this.climbableObjects, BIT_MASK_CLIMBABLE);
		cleanList(this.conveyableObjects, BIT_MASK_CONVEYABLE);
		cleanList(this.platformDirectionObjects, BIT_MASK_PLATFORM_DIRECTION);
		cleanList(this.movableObjects, BIT_MASK_MOVABLE);
		cleanList(this.exitObjects, BIT_MASK_EXIT);
		cleanList(this.slipperyObjects, BIT_MASK_SLIPPERY);
	};
	
	if (typeof data === "undefined")
	{
		this.width = 0;
		this.height = 0;
		this.tileSet = 0;
		this.background = "";
		this.intro = 0;
		
		this.tileSetData = new TileSetData(JSON.parse(TILE_JSON[this.tileSet]));
	}
	else
	{
		this.width = data.width;
		this.height = data.height;
		this.tileSet = data.tileSet;
		this.background = data.background;
		this.intro = data.intro;
		
		this.tileSetData = new TileSetData(JSON.parse(TILE_JSON[this.tileSet]));
		
		for (var x = 0; x < data.tiles.length; ++x)
		{
			this.tiles[x] = [];
			
			for (var y = 0; y < data.tiles[x].length; ++y)
			{
				this.tiles[x][y] = data.tiles[x][y];
			}
		}
		
		if (typeof data.gameObjectArray !== "undefined")
		{
			for (i = 0; i < data.gameObjectArray.length; ++i)
			{
				this.addGameObject(data.gameObjectArray[i].type, new Point(data.gameObjectArray[i].location.x, data.gameObjectArray[i].location.y));
			}
		}
	}
	
	this.getData = function()
	{
		var data = {};
		data.width = this.width;
		data.height = this.height;
		data.background = this.background;
		data.intro = this.intro;
		data.tileSet = this.tileSet;
		
		data.tiles = [];
		
		for (var x = 0; x < this.tiles.length; ++x)
		{
			data.tiles[x] = [];
			
			for (var y = 0; y < this.tiles[x].length; ++y)
			{
				data.tiles[x][y] = this.tiles[x][y];
			}
		}
		
		var gameObjectIter = this.gameObjects.newIterator();
		
		data.gameObjectArray = [];
		var gameObjectCount = 0;
		
		while (gameObjectIter.valid())
		{
			var gameObject = gameObjectIter.getData();
			data.gameObjectArray[gameObjectCount] = {};
			data.gameObjectArray[gameObjectCount].type = gameObject.type;
			data.gameObjectArray[gameObjectCount].location = new Point(gameObject.location.x, gameObject.location.y);
			
			gameObjectIter.increment();
			++gameObjectCount;
		}
		
		return data;
	};
}
