// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

// Push any movable objects immediately adjacent to hero


function PushMovables(levelData, direction)
{
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	
	var gameObjectIter = levelData.movableObjects.newIterator();
	var gameObject = null;
	var movableBoundingRect = null;
	var movableSpeed = MOVABLE_SPEED;
	
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();	
		
		movableBoundingRect = UpdateBoundingRect(gameObject, levelData);
		if (IsOnSlippery(movableBoundingRect, levelData))
			movableSpeed = MOVABLE_SLIDE_SPEED;
		
		// Any potentially movable object would have to be on the same horizontal plane as the hero
		if (RectanglesOverlapVertically(heroBoundingRect, movableBoundingRect))
		{
			if (direction === DIRECTION_LEFT && heroBoundingRect.left === movableBoundingRect.right + 1)
				gameObject.xSpeed = 0 - movableSpeed;
			else if (direction === DIRECTION_RIGHT && heroBoundingRect.right === movableBoundingRect.left - 1)
				gameObject.xSpeed = movableSpeed;
			
			gameObject.action(levelData);
		}
		gameObjectIter.increment();	
	}
}

function CheckHeroAttacked()
{
	if (this.attacked > 0 && this.recoveryDelay <= 0)
	{
		this.health-=this.attacked;
		if (this.health < 0)
			this.health = 0;
		
		if (this.health <= 0)
		{
			this.delay = HERO_DEATH_DELAY;
			this.visible = true;
			this.ySpeed = 0;
			this.action = HeroDead;
		}
		else
			this.recoveryDelay = HERO_RECOVERY_DELAY;
	}
	else if (this.recoveryDelay > 0)
	{
		--this.recoveryDelay;
		--this.flashDelay;
		
		if (this.recoveryDelay <= 0)
		{
			this.attacked = 0;
			this.visible = true;
		}
		else if (this.flashDelay <= 0)
		{
			this.visible = !this.visible;
			this.flashDelay = FLASH_DELAY;
		}
	}
}

function UpdateHeroXlocation(levelData, isWalking, canTurn)
{
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	var slippery = IsOnSlippery(heroBoundingRect, levelData);
	var maxSpeed = HERO_MAX_SPEED;
	if (slippery)
		maxSpeed=HERO_SLIDE_MAX_SPEED;
	
	if (canTurn)
	{
		if (this.keys[KEY_LEFT])
		{
			this.direction = DIRECTION_LEFT;
		
			if (this.xSpeed > 0 && !slippery)
				this.xSpeed = 0;
			else
				this.xSpeed = Math.max(this.xSpeed - 1, 0 - maxSpeed);
		}
		else if (this.keys[KEY_RIGHT])
		{
			this.direction = DIRECTION_RIGHT;
		
			if (this.xSpeed < 0 && !slippery)
				this.xSpeed = 0;
			else
				this.xSpeed = Math.min(this.xSpeed + 1, maxSpeed);
		}
		else if (!slippery)
			this.xSpeed = 0;
	}
	else
	{
		if (this.direction === DIRECTION_LEFT && this.keys[KEY_LEFT])
			this.xSpeed = Math.max(this.xSpeed - 1, 0 - maxSpeed);
		else if (this.direction === DIRECTION_RIGHT && this.keys[KEY_RIGHT])
			this.xSpeed = Math.min(this.xSpeed + 1, maxSpeed);
	}
	
	var heroBoundingRect;
	
	if (this.xSpeed < 0)
	{
		this.xSpeed = (0 - CanMoveLeft(heroBoundingRect, levelData, 0-this.xSpeed));
		
		// Allow the player to make smaller steps when approaching a ledge for maximum jumping distance
		if (isWalking && this.xSpeed < 0)
		{
			heroBoundingRect.left+=this.xSpeed;
			heroBoundingRect.right+=this.xSpeed;
			if (CanMoveDown(heroBoundingRect, levelData, 1) > 0)
				this.xSpeed = -1;
		}
	}
	else if (this.xSpeed > 0)
	{
		this.xSpeed = CanMoveRight(heroBoundingRect, levelData, this.xSpeed);
		
		// Allow the player to make smaller steps when approaching a ledge for maximum jumping distance
		if (isWalking && this.xSpeed > 0)
		{
			heroBoundingRect.left+=this.xSpeed;
			heroBoundingRect.right+=this.xSpeed;
			if (CanMoveDown(heroBoundingRect, levelData, 1) > 0)
				this.xSpeed = 1;
		}
	}
	
	this.location.x+=this.xSpeed;
	
	if (isWalking && this.keys[KEY_LEFT])
		PushMovables.call(this, levelData, DIRECTION_LEFT);
	else if (isWalking && this.keys[KEY_RIGHT])
		PushMovables.call(this, levelData, DIRECTION_RIGHT);
}

function UpdateHeroYlocation(levelData, isSliding, canTurn)
{
	// Stop the hero from moving up if no key is pressed
	if (this.ySpeed < 0 && this.keys[KEY_JUMP] === false)
		this.ySpeed = 0;
	
	this.ySpeed+=1;
	
	if (isSliding && this.ySpeed > HERO_WALL_SLIDE_VELOCITY)
		this.ySpeed = HERO_WALL_SLIDE_VELOCITY;
	else if (this.ySpeed > HERO_TERMINAL_VELOCITY)
		this.ySpeed = HERO_TERMINAL_VELOCITY;
	
	var moveDistance = this.ySpeed;
	
	if (moveDistance > 0)
	{
		for (this.ySpeed = 0; this.ySpeed < moveDistance && CanMoveDown(UpdateBoundingRect(this, levelData), levelData, 1) > 0; ++this.ySpeed)
		{
			++this.location.y;
			
			if (this.xSpeed === 0)
				UpdateHeroXlocation.call(this, levelData, false, canTurn);
		}
	}
	else if (moveDistance < 0)
	{
		for (this.ySpeed = 0; this.ySpeed > moveDistance && CanMoveUp(UpdateBoundingRect(this, levelData), levelData, 1) > 0; --this.ySpeed)
		{
			--this.location.y;
			
			if (this.xSpeed === 0)
				UpdateHeroXlocation.call(this, levelData, false, canTurn);
		}
	}
}

function GetHeroSpriteNum(frame, direction, armed)
{
	var spriteNum = frame;
	
	if (direction === DIRECTION_LEFT)
		spriteNum+=HERO_LEFT_FIRST_SPRITE;
	else
		spriteNum+=HERO_RIGHT_FIRST_SPRITE;
	
	if (armed === true)
		spriteNum+=HERO_ARMED_FIRST_SPRITE;
	else
		spriteNum+=HERO_DISARMED_FIRST_SPRITE;
		
	return spriteNum;
}

function GetHeroInitialJumpSpeed()
{
	// Cycle through all hero inventory items
	var inventoryIter = this.inventory.newIterator();
	var gameObject = null;
			
	while (inventoryIter.valid())
	{
		gameObject = inventoryIter.getData();
				
		if (gameObject.type === TYPE_JUMP_BOOST)
			return HERO_INITIAL_JUMP_SPEED_WITH_BOOST;
				
		inventoryIter.increment();
	}
	
	return HERO_INITIAL_JUMP_SPEED;
}

function HeroInitial(levelData)
{
	this.spriteSet = SPRITESET_HERO;
	this.spriteNum = HERO_DISARMED_FIRST_SPRITE;
	this.spriteNum = 0;
	this.drawOrder = 2;
	this.direction = DIRECTION_RIGHT;
	
	this.action = HeroWalk;
}

function HeroWalk(levelData)
{	
	UpdateHeroXlocation.call(this, levelData, true, true);
	
	if (this.xSpeed === 0 || (this.direction === DIRECTION_LEFT && !this.keys[KEY_LEFT]) || (this.direction === DIRECTION_RIGHT && !this.keys[KEY_RIGHT]))
	{
		this.spriteNum = GetHeroSpriteNum(6, this.direction, this.weapon !== null);
	}
	else
	{
		--this.delay;
		
		if (this.delay <= 0)
		{
			++this.frame;
			this.delay = HERO_WALK_DELAY;
		}
		
		if (this.frame >= HERO_WALKING_FRAMES)
		{
			this.frame = 0;
		}
		
		this.spriteNum = GetHeroSpriteNum(this.frame, this.direction, this.weapon !== null);
	}
	
	if (this.keys[KEY_JUMP] === true)
	{
		this.action = HeroJump;
		this.ySpeed = 0 - GetHeroInitialJumpSpeed.call(this);
		
		// Let player jump with maximum horizontal speed
		if (this.keys[KEY_LEFT])
			this.xSpeed = 0-HERO_MAX_SPEED;
		else if (this.keys[KEY_RIGHT])
			this.xSpeed = HERO_MAX_SPEED;
	}
	else if ((this.keys[KEY_UP] === true || this.keys[KEY_DOWN] === true) && OverlapsExit(UpdateBoundingRect(this, levelData), levelData))
	{
		levelData.state = LEVEL_STATE_WIN;
	}
	else if ((this.keys[KEY_UP] === true || this.keys[KEY_DOWN] === true) && OverlapsClimbable(UpdateBoundingRect(this, levelData), levelData))
	{
		this.action = HeroInitialClimb;
	}
	else if (CanMoveDown(UpdateBoundingRect(this, levelData), levelData, 1) > 0)
	{
		// If the hero is able to move down, he is falling not walking!
		this.action = HeroFall;
		this.ySpeed = 0;
	}
	else if (this.keys[KEY_ATTACK] === true && this.weapon !== null)
	{
		this.action = HeroInitialAttack;
	}
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	CheckHeroAttacked.call(this);
}

function HeroFall(levelData)
{	
	var initialXspeed = this.xSpeed;
	
	UpdateHeroXlocation.call(this, levelData, false, true);
	UpdateHeroYlocation.call(this, levelData, false, true);
	
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	
	if (this.ySpeed === 0 && CanMoveDown(heroBoundingRect, levelData, 1) < 1)
		this.action = HeroWalk;
	else if (((initialXspeed < 0 || this.keys[KEY_LEFT]) && CanMoveLeft(heroBoundingRect, levelData, 1) < 1) ||
	((initialXspeed > 0 || this.keys[KEY_RIGHT]) && CanMoveRight(heroBoundingRect, levelData, 1) < 1))
		this.action = HeroInitialWallSlide; // Hero is pushing against an obstacle
	else if ((this.keys[KEY_UP] === true || this.keys[KEY_DOWN] === true) && OverlapsClimbable(UpdateBoundingRect(this, levelData), levelData))
		this.action = HeroInitialClimb;
	else if (this.keys[KEY_ATTACK] && this.weapon !== null)
		this.action = HeroInitialAirAttack;
	
	this.spriteNum = GetHeroSpriteNum(5, this.direction, this.weapon !== null);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	
	CheckHeroAttacked.call(this);
}

function HeroJump(levelData)
{
	var initialXspeed = this.xSpeed;
	
	UpdateHeroXlocation.call(this, levelData, false, true);
	UpdateHeroYlocation.call(this, levelData, false, true);
	
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	
	if (this.ySpeed >= 0)
		this.action = HeroFall;
	else if (((initialXspeed < 0 || this.keys[KEY_LEFT]) && CanMoveLeft(heroBoundingRect, levelData, 1) < 1) ||
	((initialXspeed > 0 || this.keys[KEY_RIGHT]) && CanMoveRight(heroBoundingRect, levelData, 1) < 1))
		this.action = HeroInitialWallSlide; // Hero is pushing against an obstacle
	else if ((this.keys[KEY_UP] === true || this.keys[KEY_DOWN] === true) && OverlapsClimbable(UpdateBoundingRect(this, levelData), levelData))
		this.action = HeroInitialClimb;
	else if (this.keys[KEY_ATTACK] && this.weapon !== null)
		this.action = HeroInitialAirAttack;
		
	this.spriteNum = GetHeroSpriteNum(4, this.direction, this.weapon !== null);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	CheckHeroAttacked.call(this);
}

function HeroInitialWallSlide(levelData)
{
	this.action = HeroWallSlide;
	
	this.spriteNum = GetHeroSpriteNum(13, this.direction, this.weapon !== null);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_4_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	CheckHeroAttacked.call(this);
}

function HeroWallSlide(levelData)
{
	UpdateHeroXlocation.call(this, levelData, false, false);
	UpdateHeroYlocation.call(this, levelData, true, false);
	
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	
	if ((this.direction === DIRECTION_LEFT && CanMoveLeft(heroBoundingRect, levelData, 1) > 0) ||
		(this.direction === DIRECTION_RIGHT && CanMoveRight(heroBoundingRect, levelData, 1) > 0))
		this.action = HeroFall;
	else if ((this.keys[KEY_UP] === true || this.keys[KEY_DOWN] === true) && OverlapsClimbable(UpdateBoundingRect(this, levelData), levelData))
	{
		this.action = HeroInitialClimb;
	}
	else if (!this.keys[KEY_JUMP])
	{
		this.delay = HERO_WALL_SLIDE_DURATION;
		this.action = HeroPrepareWallJump;
	}
	else if (this.ySpeed === 0 && CanMoveDown(heroBoundingRect, levelData, 1) < 1)
		this.action = HeroWalk;
	
	this.spriteNum = GetHeroSpriteNum(13, this.direction, this.weapon !== null);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_4_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	CheckHeroAttacked.call(this);
}

function HeroPrepareWallJump(levelData)
{
	UpdateHeroXlocation.call(this, levelData, false, false);
	UpdateHeroYlocation.call(this, levelData, true, false);
	
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	
	if ((this.direction === DIRECTION_LEFT && CanMoveLeft(heroBoundingRect, levelData, 1) > 0) ||
		(this.direction === DIRECTION_RIGHT && CanMoveRight(heroBoundingRect, levelData, 1) > 0))
		this.action = HeroFall;
	else if ((this.keys[KEY_UP] === true || this.keys[KEY_DOWN] === true) && OverlapsClimbable(UpdateBoundingRect(this, levelData), levelData))
	{
		this.action = HeroInitialClimb;
	}
	else if (this.keys[KEY_JUMP])
	{
		this.action = HeroWallJump;
		this.ySpeed = 0 - GetHeroInitialJumpSpeed.call(this);
		
		if (this.direction === DIRECTION_LEFT)
		{
			this.xSpeed = HERO_MAX_SPEED;
			this.direction = DIRECTION_RIGHT;
		}
		else
		{
			this.xSpeed = 0-HERO_MAX_SPEED;
			this.direction = DIRECTION_LEFT;
		}
	}
	else if (this.ySpeed === 0 && CanMoveDown(heroBoundingRect, levelData, 1) < 1)
		this.action = HeroWalk;
	else if (this.delay > 0)
		--this.delay;
	else if ((this.direction === DIRECTION_LEFT && this.keys[KEY_LEFT]) || (this.direction === DIRECTION_RIGHT && this.keys[KEY_RIGHT]))
		this.action = HeroInitialWallSlide;
	else
		this.action = HeroFall;
	
	this.spriteNum = GetHeroSpriteNum(13, this.direction, this.weapon !== null);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_4_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	CheckHeroAttacked.call(this);
}

function HeroWallJump(levelData)
{
	var initialXspeed = this.xSpeed;
	
	// Wall jump is just like a normal jump, except the hero is prohibited from changing direction in air
	UpdateHeroXlocation.call(this, levelData, false, false);
	UpdateHeroYlocation.call(this, levelData, false, false);
	
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	
	if (this.ySpeed >= 0)
		this.action = HeroFall;
	else if (((initialXspeed < 0 || this.keys[KEY_LEFT]) && CanMoveLeft(heroBoundingRect, levelData, 1) < 1) ||
	((initialXspeed > 0 || this.keys[KEY_RIGHT]) && CanMoveRight(heroBoundingRect, levelData, 1) < 1))
		this.action = HeroInitialWallSlide; // Hero is pushing against an obstacle
	else if ((this.keys[KEY_UP] === true || this.keys[KEY_DOWN] === true) && OverlapsClimbable(UpdateBoundingRect(this, levelData), levelData))
		this.action = HeroInitialClimb;
	else if (this.keys[KEY_ATTACK] && this.weapon !== null)
		this.action = HeroInitialAirAttack;
		
	this.spriteNum = GetHeroSpriteNum(4, this.direction, this.weapon !== null);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	CheckHeroAttacked.call(this);
}

function HeroInitialAttack(levelData)
{
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	
	if (IsOnSlippery(heroBoundingRect, levelData))
		UpdateHeroXlocation.call(this, levelData, true, false);
	
	this.delay = HERO_ATTACK_DELAY;
	
	this.action = HeroBeginAttack;
	
	this.spriteNum = GetHeroSpriteNum(7, this.direction, true);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_10_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	CheckHeroAttacked.call(this);
}

function HeroBeginAttack(levelData)
{	
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	if (IsOnSlippery(heroBoundingRect, levelData))
		UpdateHeroXlocation.call(this, levelData, true, false);
	
	this.spriteNum = GetHeroSpriteNum(7, this.direction, true);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_10_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	--this.delay;
	if (this.delay <= 0)
	{
		this.delay = HERO_ATTACK_DELAY;
		this.action = HeroMidAttack;
	}
	
	CheckHeroAttacked.call(this);
}

function HeroMidAttack(levelData)
{	
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	if (IsOnSlippery(heroBoundingRect, levelData))
		UpdateHeroXlocation.call(this, levelData, true, false);
	
	this.spriteNum = GetHeroSpriteNum(8, this.direction, true);
	
	if (this.delay > HERO_ATTACK_DELAY/2)
		UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_4_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	else
		UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_3_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);

	UpdateWeaponAttack(this, levelData);
	
	--this.delay;
	if (this.delay <= 0)
	{
		this.delay = HERO_ATTACK_DELAY;
		this.action = HeroFinishAttack;
	}
	
	CheckHeroAttacked.call(this);
}

function HeroFinishAttack(levelData)
{	
	var heroBoundingRect = UpdateBoundingRect(this, levelData);
	if (IsOnSlippery(heroBoundingRect, levelData))
		UpdateHeroXlocation.call(this, levelData, true, false);
	
	this.spriteNum = GetHeroSpriteNum(9, this.direction, true);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_2_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	-- this.delay;
	if (this.delay <= 0)
	{
		this.delay = 0;
		this.action = HeroWalk;
	}
	
	CheckHeroAttacked.call(this);
}

function HeroInitialAirAttack(levelData)
{
	UpdateHeroXlocation.call(this, levelData, false, true);
	UpdateHeroYlocation.call(this, levelData, false, true);
	
	// If the hero can not move down anymore return to walking
	if (this.ySpeed >= 0 && CanMoveDown(UpdateBoundingRect(this, levelData), levelData, 1) <= 0)
		this.action = HeroWalk;
	
	this.delay = HERO_AIR_ATTACK_DELAY;
	
	this.action = HeroBeginAirAttack;
	
	this.spriteNum = GetHeroSpriteNum(10, this.direction, true);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_12_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	CheckHeroAttacked.call(this);
}

function HeroBeginAirAttack(levelData)
{
	UpdateHeroXlocation.call(this, levelData, false, true);
	UpdateHeroYlocation.call(this, levelData, false, true);
	
	// If the hero can not move down anymore return to walking
	if (this.ySpeed >= 0 && CanMoveDown(UpdateBoundingRect(this, levelData), levelData, 1) <= 0)
		this.action = HeroWalk;
		
	this.spriteNum = GetHeroSpriteNum(10, this.direction, true);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_12_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	--this.delay;
	if (this.delay <= 0)
	{
		this.delay = HERO_AIR_ATTACK_DELAY;
		this.action = HeroMidAirAttack;
	}
	
	CheckHeroAttacked.call(this);
}

function HeroMidAirAttack(levelData)
{
	UpdateHeroXlocation.call(this, levelData, false, true);
	UpdateHeroYlocation.call(this, levelData, false, true);
	
	// If the hero can not move down anymore return to walking
	if (this.ySpeed >= 0 && CanMoveDown(UpdateBoundingRect(this, levelData), levelData, 1) <= 0)
		this.action = HeroWalk;
	
	this.spriteNum = GetHeroSpriteNum(11, this.direction, true);
	
	if (this.delay > HERO_AIR_ATTACK_DELAY / 2)
		UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_2_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	else
		UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_3_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
		
	UpdateWeaponAttack(this, levelData);
	
	--this.delay;
	if (this.delay <= 0)
	{
		this.delay = HERO_AIR_ATTACK_DELAY;
		this.action = HeroFinishAirAttack;
	}
	
	CheckHeroAttacked.call(this);
}

function HeroFinishAirAttack(levelData)
{
	UpdateHeroXlocation.call(this, levelData, false, true);
	UpdateHeroYlocation.call(this, levelData, false, true);
	
	// If the hero can not move down anymore return to walking
	if (this.ySpeed >= 0 && CanMoveDown(UpdateBoundingRect(this, levelData), levelData, 1) <= 0)
	{
		this.delay = HERO_SMASH_DELAY;
		this.action = HeroSmash;
		
		UpdateWeaponShoot(this, levelData);
	}
		
	this.spriteNum = GetHeroSpriteNum(12, this.direction, true);
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_4_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	CheckHeroAttacked.call(this);
}

function HeroSmash(levelData)
{
	--this.delay;
	
	if (this.delay <= 0)
	{
		this.action = HeroWalk;
	}
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_4_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	CheckHeroAttacked.call(this);
}

function HeroInitialClimb(levelData)
{
	this.frame = 0;
	this.delay = HERO_CLIMB_DELAY;
	this.action = HeroClimb;
	this.spriteNum = 35;
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_8_O_CLOCK, false), levelData);
	
	CheckHeroAttacked.call(this);
}

function HeroClimb(levelData)
{
	if (this.keys[KEY_JUMP] === true)
	{
		this.action = HeroJump;
		this.ySpeed = 0 - GetHeroInitialJumpSpeed.call(this);
	}
	else if (!OverlapsClimbable(UpdateBoundingRect(this, levelData), levelData))
		this.action = HeroFall;
	else
	{
		this.xSpeed = 0;
		if (this.keys[KEY_LEFT])
			this.xSpeed = 0 - CanMoveLeft(UpdateBoundingRect(this, levelData), levelData, HERO_CLIMB_SPEED);
		else if (this.keys[KEY_RIGHT])
			this.xSpeed = CanMoveRight(UpdateBoundingRect(this, levelData), levelData, HERO_CLIMB_SPEED);
		
		this.ySpeed = 0;
		if (this.keys[KEY_UP])
			this.ySpeed = 0 - CanMoveUp(UpdateBoundingRect(this, levelData), levelData, HERO_CLIMB_SPEED);
		else if (this.keys[KEY_DOWN])
			this.ySpeed = CanMoveDown(UpdateBoundingRect(this, levelData), levelData, HERO_CLIMB_SPEED);
			
		this.location.x+=this.xSpeed;
		this.location.y+=this.ySpeed;
		
		if (this.xSpeed !== 0 || this.ySpeed !== 0)
		{
			--this.delay;
	
			if (this.delay <= 0)
			{
				this.delay = HERO_CLIMB_DELAY;
				++this.frame;
				if (this.frame >= HERO_CLIMBING_FRAMES)
					this.frame = 0;
			}
		}
	}
	
	this.spriteNum = 35 + this.frame;
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_8_O_CLOCK, false), levelData);
	
	CheckHeroAttacked.call(this);
}

function HeroDead(levelData)
{
	if (CanMoveDown(UpdateBoundingRect(this, levelData), levelData, 1) > 0)
	{
		this.ySpeed++;

		if (this.ySpeed > HERO_TERMINAL_VELOCITY)
			this.ySpeed = HERO_TERMINAL_VELOCITY;
		
		this.location.y += CanMoveDown(UpdateBoundingRect(this, levelData), levelData, this.ySpeed);
	}
	
	if (this.direction === DIRECTION_RIGHT)
		this.spriteNum = 39;
	else
		this.spriteNum = 40;
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, false), levelData);
	
	if (this.delay > 0)
		--this.delay;
	else
		levelData.state = LEVEL_STATE_LOSE;
}
