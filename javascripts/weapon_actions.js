// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

// If mirrored is true, return the horizontal opposite, e.g. the mirroed of 1-o-clock is 11-o-clock
function ModifyWeaponPosition(position, mirrored)
{
	if (mirrored)
	{
		switch(position)
		{
			case WEAPON_12_O_CLOCK:
				return WEAPON_12_O_CLOCK;
			case WEAPON_1_O_CLOCK:
				return WEAPON_11_O_CLOCK;
			case WEAPON_2_O_CLOCK:
				return WEAPON_10_O_CLOCK;
			case WEAPON_3_O_CLOCK:
				return WEAPON_9_O_CLOCK;
			case WEAPON_4_O_CLOCK:
				return WEAPON_8_O_CLOCK;
			case WEAPON_8_O_CLOCK:
				return WEAPON_4_O_CLOCK;
			case WEAPON_9_O_CLOCK:
				return WEAPON_3_O_CLOCK;
			case WEAPON_10_O_CLOCK:
				return WEAPON_2_O_CLOCK;
			case WEAPON_11_O_CLOCK:
				return WEAPON_1_O_CLOCK;
			default:
				return WEAPON_12_O_CLOCK;
		}
	}
	else
	{
		return position;
	}
}

function GetWeaponCarryLocation(wielderObject, weaponObject, levelData)
{
	var anchorPoint = new Point();
	
	var wielderAnchorPoint = levelData.spriteSets[wielderObject.spriteSet].spriteData[wielderObject.spriteNum].anchorPoint;
	var weaponAnchorPoint = levelData.spriteSets[weaponObject.spriteSet].spriteData[weaponObject.spriteNum].anchorPoint;

	anchorPoint.x = (wielderObject.location.x + wielderAnchorPoint.x) - weaponAnchorPoint.x;
	anchorPoint.y = (wielderObject.location.y + wielderAnchorPoint.y) - weaponAnchorPoint.y;
	
	return anchorPoint;
}

function GetWeaponSpriteNum(weapon, position)
{
	var spriteNum = 0;
	
	switch(weapon.type)
	{
		case TYPE_BATTLE_AXE:
			spriteNum = 0;
		break;
		case TYPE_WAR_HAMMER:
			spriteNum = 9;
		break;
	}
	
	switch(position)
	{
		case WEAPON_12_O_CLOCK:
			return spriteNum + 0;
		case WEAPON_1_O_CLOCK:
			return spriteNum + 2;
		case WEAPON_2_O_CLOCK:
			return spriteNum + 6;
		case WEAPON_3_O_CLOCK:
			return spriteNum + 3;
		case WEAPON_4_O_CLOCK:
			return spriteNum + 7;
		case WEAPON_8_O_CLOCK:
			return spriteNum + 8;
		case WEAPON_9_O_CLOCK:
			return spriteNum + 4;
		case WEAPON_10_O_CLOCK:
			return spriteNum + 5;
		case WEAPON_11_O_CLOCK:
			return spriteNum + 1;
		default:
			return spriteNum + 0;
	}
}

function GetAirProjectileSpriteNum(type, frame, direction)
{
	switch(type)
	{
		case TYPE_ICE_PROJECTILE:
			if (direction === DIRECTION_LEFT)
				return frame + PROJECTILE_ICE_LEFT_FIRST_SPRITE;
			else
				return frame + PROJECTILE_ICE_RIGHT_FIRST_SPRITE;
		break;
	}
}

function GetGroundProjectileSpriteNum(type, frame)
{
	switch(type)
	{
		case TYPE_FLAME_PROJECTILE:
			return frame;
		break;
		case TYPE_ICICLE_PROJECTILE:
			return 12 + frame;
		break;
	}
}

// Called by other objects to update the weapon immediately
function UpdateWeaponPosition(wielderObject, weaponPosition, levelData)
{
	if (wielderObject.weapon !== null)
	{
		wielderObject.weapon.spriteNum = GetWeaponSpriteNum(wielderObject.weapon, weaponPosition);
		wielderObject.weapon.location = GetWeaponCarryLocation(wielderObject, wielderObject.weapon, levelData);
		wielderObject.weapon.action(levelData); // Update weapon right away to ensure it's in synch with wielder
	}
}

function IsWeaponBlocked(wielderBoundingRect, tarUpdateBoundingRect, levelData)
{
	var xDistanceFromTarget = 0;
	var yDistanceFromTarget = 0;
	
	if (wielderBoundingRect.top > tarUpdateBoundingRect.bottom) {
		yDistanceFromTarget = wielderBoundingRect.top - (tarUpdateBoundingRect.bottom+1);
	
		if (CanMoveUp(wielderBoundingRect, levelData, yDistanceFromTarget) < yDistanceFromTarget)
			return true;
	}
	else if (wielderBoundingRect.bottom < tarUpdateBoundingRect.top) {
		yDistanceFromTarget = (tarUpdateBoundingRect.top-1) - wielderBoundingRect.bottom;
		
		if (CanMoveDown(wielderBoundingRect, levelData, yDistanceFromTarget) < yDistanceFromTarget)
			return true;
	}
					
	if (wielderBoundingRect.left > tarUpdateBoundingRect.right)
	{
		xDistanceFromTarget = wielderBoundingRect.left - (tarUpdateBoundingRect.right+1);
		
		if (CanMoveLeft(wielderBoundingRect, levelData, xDistanceFromTarget) < xDistanceFromTarget)
			return true;
	}
	else if (wielderBoundingRect.right < tarUpdateBoundingRect.left) {
		xDistanceFromTarget = (tarUpdateBoundingRect.left-1) - wielderBoundingRect.right;
		
		if (CanMoveRight(wielderBoundingRect, levelData, xDistanceFromTarget) < xDistanceFromTarget)
			return true;
	}
	
	return false;
}

function UpdateWeaponAttack(wielderObject, levelData)
{
	// Cycle through all vulnerable game objects
	var gameObjectIter = levelData.vulnerableObjects.newIterator();
	var gameObject = null;
	var attackRect = UpdateAttackRect(wielderObject.weapon, levelData);
	var wielderRect = UpdateBoundingRect(wielderObject, levelData);
	var hit = false;
	
	var boundingRect = null;
	
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();
		
		// Only vulnerable objects that are not the wielder or the weapon itself may be hit
		if (gameObject !== wielderObject && gameObject.attacked < 1)
		{
			boundingRect = UpdateBoundingRect(gameObject, levelData);
			if (RectanglesOverlap(attackRect, boundingRect) && !IsWeaponBlocked(wielderRect, boundingRect, levelData))
			{
				switch(wielderObject.weapon.type)
				{
					case TYPE_BATTLE_AXE:
						gameObject.attacked = BATTLE_AXE_DAMAGE;
					break;
					case TYPE_WAR_HAMMER:
						gameObject.attacked = WAR_HAMMER_DAMAGE;
					break;
				}
				
				hit = true;
			}
		}
			
		gameObjectIter.increment();
	}
	
	return hit;
}

function UpdateWeaponShoot(wielderObject, levelData)
{
	var wielderBoundingRect = UpdateBoundingRect(wielderObject, levelData);
	
	if (wielderObject.weapon !== null)
	{
		switch(wielderObject.weapon.type)
		{
			case TYPE_BATTLE_AXE:
				leftProjectile = CreateProjectileObject(TYPE_FLAME_PROJECTILE, wielderObject, new Point(wielderBoundingRect.right, wielderObject.location.y), DIRECTION_LEFT, levelData);
				rightProjectile = CreateProjectileObject(TYPE_FLAME_PROJECTILE, wielderObject, new Point(wielderObject.location.x, wielderObject.location.y), DIRECTION_RIGHT, levelData);
			break;
			case TYPE_WAR_HAMMER:
				leftProjectile = CreateProjectileObject(TYPE_ICICLE_PROJECTILE, wielderObject, new Point(wielderBoundingRect.right, wielderObject.location.y), DIRECTION_LEFT, levelData);
				rightProjectile = CreateProjectileObject(TYPE_ICICLE_PROJECTILE, wielderObject, new Point(wielderObject.location.x, wielderObject.location.y), DIRECTION_RIGHT, levelData);
			break;
		}
	}
}

function CreateProjectileObject(type, shooter, location, direction, levelData)
{
	var projectileObject = levelData.addGameObject(type, location);
	
	projectileObject.direction = direction;
	projectileObject.shooter = shooter;
	
	return projectileObject;
}

function UpdateProjectileAttack(levelData)
{
	// Cycle through all vulnerable game objects
	var gameObjectIter = levelData.vulnerableObjects.newIterator();
	var gameObject = null;
	var attackRect = UpdateAttackRect(this, levelData);
	
	var hit = false;

	var boundingRect = null;
	
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();
		
		// Only vulnerable objects that are not the shooter may be hit
		if (gameObject !== this.shooter && gameObject.attacked < 1)
		{
			boundingRect = UpdateBoundingRect(gameObject, levelData);
			if (RectanglesOverlap(attackRect, boundingRect))
			{
				switch (this.type)
				{
					case TYPE_ICE_PROJECTILE:
						gameObject.attacked = PROJECTILE_ICE_DAMAGE;
					break;
					case TYPE_ICICLE_PROJECTILE:
						gameObject.attacked = WAR_HAMMER_DAMAGE;
					break;
					case TYPE_FLAME_PROJECTILE:
						gameObject.attacked = BATTLE_AXE_DAMAGE;
					break;
				}
				
				hit = true;
			}
		}
			
		gameObjectIter.increment();
	}
	
	return hit;
}

function UpdateWeaponYlocation(levelData)
{
	var boundingRect = UpdateBoundingRect(this, levelData);
	
	++this.ySpeed;
	if (this.ySpeed > WEAPON_TERMINAL_VELOCITY)
		this.ySpeed = WEAPON_TERMINAL_VELOCITY;
	
	this.ySpeed = CanMoveDown(boundingRect, levelData, Math.abs(this.ySpeed));
	
	this.location.y+=this.ySpeed;
}

function WeaponInitial(levelData)
{
	this.spriteSet = SPRITESET_WEAPONS;
	this.spriteNum = GetWeaponSpriteNum(this, WEAPON_12_O_CLOCK);
	this.drawOrder = 0;
	
	this.action = WeaponIdle;
}

function WeaponIdle(levelData)
{
	this.spriteNum = GetWeaponSpriteNum(this, WEAPON_12_O_CLOCK);
	this.drawOrder = 1;
	
	if (levelData.heroObject !== null && ObjectsOverlap(this, levelData.heroObject, levelData))
	{
		// If hero already wields a weapon, discard it
		if (levelData.heroObject.weapon !== null)
			levelData.heroObject.weapon.action = WeaponDiscarded;
		
		// Ensure that hero references weapon
		levelData.heroObject.weapon = this;
		
		this.action = WeaponWield;
	}
	
	UpdateWeaponYlocation.call(this, levelData);
}

function WeaponDiscarded(levelData)
{
	this.spriteNum = GetWeaponSpriteNum(this, WEAPON_12_O_CLOCK);
	this.drawOrder = 1;
	
	if (levelData.heroObject === null || !ObjectsOverlap(this, levelData.heroObject, levelData))
		this.action = WeaponIdle;
	
	UpdateWeaponYlocation.call(this, levelData);
}

function WeaponWield(levelData)
{
	this.drawOrder = 3;
}

function GroundProjectileInitial(levelData)
{
	this.spriteSet = SPRITESET_PROJECTILES;
	this.frame = 0;
	this.spriteNum = GetGroundProjectileSpriteNum(this.type, this.frame);
	
	switch(this.type)
	{
		case TYPE_FLAME_PROJECTILE:
			this.duration = PROJECTILE_FLAME_DURATION;
		break;
		case TYPE_ICICLE_PROJECTILE:
			this.duration = PROJECTILE_ICICLE_DURATION;
		break;
	}

	this.drawOrder = 4;
	
	this.action = GroundProjectileMove;
}

function GroundProjectileMove(levelData)
{
	var boundingRect = UpdateBoundingRect(this, levelData);
	
	this.location.y+=Math.min(CanMoveDownBlocks(boundingRect, levelData, PROJECTILE_FALL_RATE), CanMoveDownObjects(boundingRect, levelData, PROJECTILE_FALL_RATE, true));
	
	UpdateProjectileAttack.call(this, levelData);
	
	if (this.direction === DIRECTION_RIGHT)
		this.xSpeed = Math.min(CanMoveRightBlocks(boundingRect, levelData, PROJECTILE_GROUND_SPEED), CanMoveRightObjects(boundingRect, levelData, PROJECTILE_GROUND_SPEED, true));
	else if (this.direction === DIRECTION_LEFT)
		this.xSpeed = 0 - Math.min(CanMoveLeftBlocks(boundingRect, levelData, PROJECTILE_GROUND_SPEED), CanMoveLeftObjects(boundingRect, levelData, PROJECTILE_GROUND_SPEED, true));
	
	--this.duration;
	
	if (this.xSpeed === 0 || this.duration <= 0)
		this.action = FireBurst;
	else
		this.location.x+=this.xSpeed;
	
	++this.frame;

	if (this.frame > 3)
		this.frame = 0;
	
	this.spriteNum = GetGroundProjectileSpriteNum(this.type, this.frame);
}

function AirProjectileInitial(levelData)
{
	this.spriteSet = SPRITESET_PROJECTILES;
	
	this.drawOrder = 4;
	this.spriteNum = GetAirProjectileSpriteNum(this.type, this.frame, this.direction);
	
	this.action = AirProjectileMove;
}

function AirProjectileMove(levelData)
{
	var boundingRect = UpdateBoundingRect(this, levelData);
	
	if (this.direction === DIRECTION_RIGHT)
		this.xSpeed = Math.min(CanMoveRightBlocks(boundingRect, levelData, PROJECTILE_AIR_SPEED), CanMoveRightObjects(boundingRect, levelData, PROJECTILE_AIR_SPEED, true));
	else if (this.direction === DIRECTION_LEFT)
		this.xSpeed = 0 - Math.min(CanMoveLeftBlocks(boundingRect, levelData, PROJECTILE_AIR_SPEED), CanMoveLeftObjects(boundingRect, levelData, PROJECTILE_AIR_SPEED, true));
	
	if (this.xSpeed === 0)
		this.action = FireBurst;
	else
		this.location.x+=this.xSpeed;
	
	this.frame = 1-this.frame;
	
	this.spriteNum = GetAirProjectileSpriteNum(this.type, this.frame, this.direction);
	
	if (UpdateProjectileAttack.call(this, levelData))
		this.action = FireBurst;
}

function FireBurst(levelData)
{
	this.delay = PROJECTILE_BURST_DELAY;
	this.spriteNum = 8;
	
	this.action = FireDie;
}

function FireDie(levelData)
{
	if (this.delay > 0)
		--this.delay;
	else
	{
		this.delay = PROJECTILE_BURST_DELAY;
		
		++this.spriteNum;
		
		if (this.spriteNum > 11)
			this.action = null;
	}
}