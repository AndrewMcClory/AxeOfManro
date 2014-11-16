// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

function GetGuardSpriteNum(frame, direction)
{
	var spriteNum = frame;
	
	if (direction === DIRECTION_LEFT)
		spriteNum+=GUARD_LEFT_FIRST_SPRITE;
	else
		spriteNum+=GUARD_RIGHT_FIRST_SPRITE;
		
	return spriteNum;
}

function GetWizardSpriteNum(frame, direction)
{
	var spriteNum = frame;
	
	if (direction === DIRECTION_LEFT)
		spriteNum+=WIZARD_LEFT_FIRST_SPRITE;
	else
		spriteNum+=WIZARD_RIGHT_FIRST_SPRITE;
		
	return spriteNum;
}

function CheckGuardFall(levelData)
{
	var guardBoundingRect = UpdateBoundingRect(this, levelData);
	
	if (CanMoveDown(guardBoundingRect, levelData, 1) > 1)
	{
		this.ySpeed = 0;
		this.action = GuardFall;
	}
}

function CheckEnemyTouchHero(levelData)
{
	if (levelData.heroObject !== null && levelData.heroObject.attributeBits &&  (levelData.heroObject.attributeBits & BIT_MASK_VULNERABLE) !== 0)
	{
		if (ObjectsAdjacent(levelData.heroObject, this, levelData) && levelData.heroObject.attacked < 1)
		{
			levelData.heroObject.attacked = HAZARD_DAMAGE;
		}
	}
}

function GuardInitial(levelData)
{
	this.spriteSet = SPRITESET_GUARD;
	this.spriteNum = 0;
	this.drawOrder = 1;
	this.delay = 0;
	
	this.direction = DIRECTION_RIGHT;
	this.health = GUARD_INITIAL_HEALTH;
	
	// Give the guard a weapon
	this.action = GuardArm;
}

function GuardArm(levelData)
{
	this.weapon = levelData.addGameObject(TYPE_WAR_HAMMER, this.location);
	this.weapon.action = WeaponWield;
	
	this.action = GuardScan;
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
}

function GuardScan(levelData)
{
	if (levelData.heroObject === null)
	{
		this.action = GuardInitialWander;
	}
	else
	{
		var guardBoundingRect = UpdateBoundingRect(this, levelData);
		var heroBoundingRect = UpdateBoundingRect(levelData.heroObject, levelData);
	
		// Check if guard is on the same horizontal plane as the hero
		if (UnobstructedHorizontalView(guardBoundingRect, heroBoundingRect, levelData, DIRECTION_LEFT, GUARD_SCAN_DISTANCE))
		{
			this.direction = DIRECTION_LEFT;
			this.action = GuardChase;
		}
		else if (UnobstructedHorizontalView(guardBoundingRect, heroBoundingRect, levelData, DIRECTION_RIGHT, GUARD_SCAN_DISTANCE))
		{
			this.direction = DIRECTION_RIGHT;
			this.action = GuardChase;
		}
		else
			this.action = GuardInitialWander;
	}
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	
	if (this.attacked > 0)
		this.action = GuardInitialAttacked;
	
	CheckEnemyTouchHero.call(this, levelData);
	CheckGuardFall.call(this, levelData);
}

function GuardChase(levelData)
{
	var guardBoundingRect = UpdateBoundingRect(this, levelData);
	var heroBoundingRect = null;
	
	if (levelData.heroObject !== null)
	{
		heroBoundingRect = UpdateBoundingRect(levelData.heroObject, levelData);
	
		// Check if guard can still see the hero
		if (!UnobstructedHorizontalView(guardBoundingRect, heroBoundingRect, levelData, this.direction, GUARD_SCAN_DISTANCE))
			this.action = GuardScan;
		else if (this.direction === DIRECTION_LEFT)
		{
			this.xSpeed = 0 - CanMoveLeft(guardBoundingRect, levelData, GUARD_CHASE_SPEED);
			guardBoundingRect.left-=GUARD_LEDGE_CHECK_DISTANCE;
			guardBoundingRect.right-=GUARD_LEDGE_CHECK_DISTANCE;
		}
		else
		{
			this.xSpeed = CanMoveRight(guardBoundingRect, levelData, GUARD_CHASE_SPEED);
			guardBoundingRect.left+=GUARD_LEDGE_CHECK_DISTANCE;
			guardBoundingRect.right+=GUARD_LEDGE_CHECK_DISTANCE;
		}
	}
	else
		this.action = GuardInitialWander;
	
	// If guard too close to edge, stop moving
	if (CanMoveDown(guardBoundingRect, levelData, 1) > 0 || this.xSpeed === 0)
		this.action = GuardScan;
	else
	{
		--this.delay;
		
		if (this.delay <= 0)
		{
			++this.frame;
			this.delay = GUARD_WALK_DELAY;
		}
		
		if (this.frame >= GUARD_WALKING_FRAMES)
			this.frame = 0;
		
		this.location.x += this.xSpeed;
		this.spriteNum = GetGuardSpriteNum(this.frame, this.direction);
	}
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	
	if (heroBoundingRect !== null && Math.abs(heroBoundingRect.left - guardBoundingRect.left) < GUARD_ATTACK_RANGE)
		this.action = GuardInitialAttack;
	
	if (this.attacked > 0)
		this.action = GuardInitialAttacked;
	
	CheckEnemyTouchHero.call(this, levelData);
	CheckGuardFall.call(this, levelData);
}

function GuardInitialWander(levelData)
{
	var choice = Math.floor(Math.random()*3);
	
	// Have the guard choose a random direction to patrol, or wait
	if (choice === 0)
		this.direction = DIRECTION_LEFT;
	else if (choice === 1)
		this.direction = DIRECTION_RIGHT;
	
	if (choice < 2)
	{
		// Wander some random distance in the random direction
		this.wanderDistance = Math.min(Math.floor(Math.random()*GUARD_MAX_WANDER_DISTANCE), GUARD_MIN_WANDER_DISTANCE);
		this.action = GuardWander;
	}
	else
	{
		this.delay = Math.min(Math.floor(Math.random()*GUARD_MAX_WAIT_TIME), GUARD_MIN_WAIT_TIME);
		this.action = GuardWait;
	}
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	
	if (this.attacked > 0)
		this.action = GuardInitialAttacked;
	
	CheckEnemyTouchHero.call(this, levelData);
	CheckGuardFall.call(this, levelData);
}

function GuardWait(levelData)
{
	var guardBoundingRect = UpdateBoundingRect(this, levelData);
	
	if (levelData.heroObject !== null)
	{
		var heroBoundingRect = UpdateBoundingRect(levelData.heroObject, levelData);
	
		if (UnobstructedHorizontalView(guardBoundingRect, heroBoundingRect, levelData, this.direction, GUARD_SCAN_DISTANCE))
			this.action = GuardChase;
	}
	
	this.spriteNum = GetGuardSpriteNum(4, this.direction);
	
	if (this.delay > 0)
		--this.delay;
	else
		this.action = GuardScan;
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	
	if (this.attacked > 0)
		this.action = GuardInitialAttacked;
		
	CheckEnemyTouchHero.call(this, levelData);
	CheckGuardFall.call(this, levelData);
}

function GuardWander(levelData)
{
	var guardBoundingRect = UpdateBoundingRect(this, levelData);
	var heroBoundingRect = null;
	
	if (levelData.heroObject !== null)
		heroBoundingRect = UpdateBoundingRect(levelData.heroObject, levelData);
	
	if (levelData.heroObject !== null && UnobstructedHorizontalView(guardBoundingRect, heroBoundingRect, levelData, this.direction, GUARD_SCAN_DISTANCE))
		this.action = GuardChase;
	else if (this.direction === DIRECTION_LEFT)
	{
		this.xSpeed = 0 - CanMoveLeft(guardBoundingRect, levelData, GUARD_WANDER_SPEED);
		guardBoundingRect.left-=GUARD_LEDGE_CHECK_DISTANCE;
		guardBoundingRect.right-=GUARD_LEDGE_CHECK_DISTANCE;	
	}
	else
	{
		this.xSpeed = CanMoveRight(guardBoundingRect, levelData, GUARD_WANDER_SPEED);
		guardBoundingRect.left+=GUARD_LEDGE_CHECK_DISTANCE;
		guardBoundingRect.right+=GUARD_LEDGE_CHECK_DISTANCE;
	}
	
	// If guard too close to edge, stop moving
	if (CanMoveDown(guardBoundingRect, levelData, 1) > 0)
	{
		this.xSpeed = 0;
	}
	
	if (this.xSpeed !== 0)
	{
		--this.delay;
		
		if (this.delay <= 0)
		{
			++this.frame;
			this.delay = GUARD_WALK_DELAY;
		}
		
		if (this.frame >= GUARD_WALKING_FRAMES)
		{
			this.frame = 0;
		}
		
		this.location.x += this.xSpeed;
		this.spriteNum = GetGuardSpriteNum(this.frame, this.direction);
		
		this.wanderDistance -= Math.abs(this.xSpeed);
		if (this.wanderDistance <= 0)
			this.action = GuardScan;
	}
	else
		this.action = GuardScan;
		
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	
	if (this.attacked > 0)
		this.action = GuardInitialAttacked;
	
	CheckEnemyTouchHero.call(this, levelData);
	CheckGuardFall.call(this, levelData);
}

function GuardInitialAttacked(levelData)
{
	this.health-=this.attacked;
	
	if (this.health <= 0)
	{
		this.ySpeed = 0;
		this.action = GuardDead;
		
		levelData.score+=200;
		// Replace the guard with a score
		CreateScoreObject(200, this.location, levelData);
	}
	else
	{
		this.recoveryDelay = GUARD_RECOVERY_DELAY;
		this.flashDelay = FLASH_DELAY;
	
		this.spriteNum = GetGuardSpriteNum(5, this.direction);
		UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	
		this.action = GuardAttacked;
		
		CheckEnemyTouchHero.call(this, levelData);
		CheckGuardFall.call(this, levelData);
	}
}

function GuardAttacked(levelData)
{
	--this.recoveryDelay;
	
	if (this.recoveryDelay <= 0)
	{
		this.attacked = 0;
		this.visible = true;
		this.action = GuardScan;
	}
	else
	{
		--this.flashDelay;
	
		if (this.flashDelay <= 0)
		{
			this.flashDelay = FLASH_DELAY;
			this.visible = !this.visible;
		}
	}
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	
	CheckEnemyTouchHero.call(this, levelData);
	CheckGuardFall.call(this, levelData);
}

function GuardDead(levelData)
{
	++this.ySpeed;
	
	if (this.ySpeed > GUARD_TERMINAL_VELOCITY)
		this.ySpeed = GUARD_TERMINAL_VELOCITY;
		
	this.location.y+=this.ySpeed;
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	
	if (this.location.y > levelData.height * TILE_HEIGHT)
	{
		this.action = null;
		
		if (this.weapon !== null)
			this.weapon.action = null;
	}
}

function GuardFall(levelData)
{
	var guardBoundingRect = UpdateBoundingRect(this, levelData);
	
	++this.ySpeed;
	
	if (this.ySpeed > GUARD_TERMINAL_VELOCITY)
		this.ySpeed = GUARD_TERMINAL_VELOCITY;
		
	this.ySpeed = CanMoveDown(guardBoundingRect, levelData, this.ySpeed);
	
	if (this.ySpeed === 0)
		this.action = GuardScan;
	else
		this.location.y+=this.ySpeed;
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_11_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	
	CheckEnemyTouchHero.call(this, levelData);
	
	if (this.attacked > 0)
		this.action = GuardInitialAttacked;
}

function GuardInitialAttack(levelData)
{
	this.spriteNum = GetGuardSpriteNum(6, this.direction);
	this.delay = GUARD_ATTACK_DELAY;
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_12_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	this.action = GuardBeginAttack;
	
	if (this.attacked > 0)
		this.action = GuardInitialAttacked;
		
	CheckEnemyTouchHero.call(this, levelData);
}

function GuardBeginAttack(levelData)
{
	this.spriteNum = GetGuardSpriteNum(6, this.direction);
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_12_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	if (this.delay > 0)
		--this.delay;
	else
	{
		this.delay = GUARD_ATTACK_DELAY;
		this.action = GuardMidAttack;
	}
	
	if (this.attacked > 0)
		this.action = GuardInitialAttacked;
	
	CheckEnemyTouchHero.call(this, levelData);
}

function GuardMidAttack(levelData)
{
	this.spriteNum = GetGuardSpriteNum(7, this.direction);
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_3_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	if (this.delay > 0)
		--this.delay;
	else
	{
		this.delay = GUARD_ATTACK_DELAY;
		this.action = GuardFinishAttack;
	}
	
	if (this.attacked > 0)
		this.action = GuardInitialAttacked;
	
	CheckEnemyTouchHero.call(this, levelData);
}

function GuardFinishAttack(levelData)
{
	this.spriteNum = GetGuardSpriteNum(8, this.direction);
	
	UpdateWeaponPosition(this, ModifyWeaponPosition(WEAPON_4_O_CLOCK, this.direction === DIRECTION_LEFT), levelData);
	UpdateWeaponAttack(this, levelData);
	
	if (this.delay > 0)
		--this.delay;
	else
		this.action = GuardScan;
	
	if (this.attacked > 0)
		this.action = GuardInitialAttacked;
	
	CheckEnemyTouchHero.call(this, levelData);
}

function WizardInitial(levelData)
{
	this.spriteSet = SPRITESET_WIZARD;
	this.spriteNum = 0;
	this.drawOrder = 1;
	this.frame = 0;
	
	this.action = WizardScan;
}

function WizardScan(levelData)
{
	this.visible = false;
	
	if (levelData.heroObject !== null)
	{
		var wizardBoundingRect = UpdateBoundingRect(this, levelData);
		var heroBoundingRect = UpdateBoundingRect(levelData.heroObject, levelData);
	
		// Check if wizard is on the same horizontal plane as the hero
		if (UnobstructedHorizontalView(wizardBoundingRect, heroBoundingRect, levelData, DIRECTION_LEFT, WIZARD_SCAN_DISTANCE))
		{
			this.direction = DIRECTION_LEFT;
			this.action = WizardAppear;
		}
		else if (UnobstructedHorizontalView(wizardBoundingRect, heroBoundingRect, levelData, DIRECTION_RIGHT, WIZARD_SCAN_DISTANCE))
		{
			this.direction = DIRECTION_RIGHT;
			this.action = WizardAppear;
		}
		else if (ObjectsAdjacent(levelData.heroObject, this, levelData))
		{
			this.action = WizardAppear;
		}
	}
}

function WizardAppear(levelData)
{
	this.visible = true;
	this.frame = 0;
	
	// Create smoke puff
	levelData.addGameObject(TYPE_SMOKE, this.location);
	
	this.spriteNum = GetWizardSpriteNum(this.frame, this.direction);
	this.action = WizardIdle;
	
	CheckEnemyTouchHero.call(this, levelData);
	
	if (this.attacked > 0)
		this.action = WizardAttacked;
}

function WizardIdle(levelData)
{
	this.frame = 0;
	
	if (levelData.heroObject !== null)
	{
		var wizardBoundingRect = UpdateBoundingRect(this, levelData);
		var heroBoundingRect = UpdateBoundingRect(levelData.heroObject, levelData);
	
		if (levelData.heroObject.location.x < this.location.x)
			this.direction = DIRECTION_LEFT;
		else
			this.direction = DIRECTION_RIGHT;
		
		// Check if wizard is on the same horizontal plane as the hero
		if (UnobstructedHorizontalView(wizardBoundingRect, heroBoundingRect, levelData, DIRECTION_LEFT, WIZARD_SHOOT_DISTANCE))
		{
			this.direction = DIRECTION_LEFT;
			this.action = WizardInitialShoot;
		}
		else if (UnobstructedHorizontalView(wizardBoundingRect, heroBoundingRect, levelData, DIRECTION_RIGHT, WIZARD_SHOOT_DISTANCE))
		{
			this.direction = DIRECTION_RIGHT;
			this.action = WizardInitialShoot;
		}
	}
	
	this.spriteNum = GetWizardSpriteNum(this.frame, this.direction);
	
	CheckEnemyTouchHero.call(this, levelData);
	
	if (this.attacked > 0)
		this.action = WizardAttacked;
}

function WizardInitialShoot(levelData)
{
	this.frame = 1;
	
	this.delay = WIZARD_SHOOT_DELAY;
	
	this.action = WizardBeginShoot;
	
	this.spriteNum = GetWizardSpriteNum(this.frame, this.direction);
	
	CheckEnemyTouchHero.call(this, levelData);
	
	if (this.attacked > 0)
		this.action = WizardAttacked;
}

function WizardBeginShoot(levelData)
{
	var projectile = null;
	
	if (this.delay > 0)
		--this.delay;
	else {
		this.delay = WIZARD_SHOOT_DELAY;
		++this.frame;
		if (this.frame > 2)
		{
			this.frame = 1;
			this.action = WizardEndShoot;
			
			this.spriteNum = GetWizardSpriteNum(this.frame, this.direction);
			
			projectile = CreateProjectileObject(TYPE_ICE_PROJECTILE, this, this.location, this.direction, levelData);
			projectile.location = GetWeaponCarryLocation(this, projectile, levelData);
		}
	}
	
	this.spriteNum = GetWizardSpriteNum(this.frame, this.direction);
	
	CheckEnemyTouchHero.call(this, levelData);
	
	if (this.attacked > 0)
		this.action = WizardAttacked;
}

function WizardEndShoot(levelData)
{
	if (this.delay > 0)
		--this.delay;
	else {
		this.delay = WIZARD_SHOOT_DELAY;
		--this.frame;
		if (this.frame  < 0)
		{
			this.frame = 0;
			this.action = WizardIdle;
		}
	}
	
	this.spriteNum = GetWizardSpriteNum(this.frame, this.direction);
	
	CheckEnemyTouchHero.call(this, levelData);
	
	if (this.attacked > 0)
		this.action = WizardAttacked;
}

function WizardAttacked(levelData)
{
	// Create smoke puff
	levelData.addGameObject(TYPE_SMOKE, this.location);
	
	this.action = null;
}

function HazardInitial(levelData)
{
	this.spriteSet = SPRITESET_HAZARDS;
	
	switch(this.type)
	{
		case TYPE_RED_HAZARD:
			this.spriteNum = Math.floor(Math.random()*4);
		break;
		case TYPE_GREEN_HAZARD:
			this.spriteNum = Math.floor(Math.random()*4) + 4;
		break;
	}
	
	this.drawOrder = 4;
	
	this.delay = Math.floor(Math.random()*HAZARD_DELAY);
	this.action = HazardAnimate;
}

function HazardAnimate(levelData)
{
	// Only update hazard and check for collision with vulnerable objects at delay points
	if (this.delay > 0)
	{
		--this.delay;
		return;
	}
	else
	{
		this.delay = HAZARD_DELAY;
		
		// Cycle through all vulnerable game objects
		var gameObjectIter = levelData.vulnerableObjects.newIterator();
		var gameObject = null;
	
		var boundingRect = null;
	
		while (gameObjectIter.valid())
		{
			gameObject = gameObjectIter.getData();
		
			// Only vulnerable objects that overlap the hazard may be attacked
			if (gameObject.attacked < 1 && ObjectsOverlap(this, gameObject, levelData))
			{
				gameObject.attacked = HAZARD_DAMAGE;
			}
			
			gameObjectIter.increment();
		}
	}
	
	switch(this.type)
	{
		case TYPE_RED_HAZARD:
			this.spriteNum = Math.floor(Math.random()*4);
		break;
		case TYPE_GREEN_HAZARD:
			this.spriteNum = Math.floor(Math.random()*4) + 4;
		break;
	}
}