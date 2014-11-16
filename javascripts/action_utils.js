// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

function UpdateBoundingRect(gameObject, levelData)
{
	var spriteSetData = levelData.spriteSets[gameObject.spriteSet];
	
	gameObject.boundingRect.left = gameObject.location.x + spriteSetData.boundingRect.left;
	gameObject.boundingRect.right = gameObject.location.x + spriteSetData.boundingRect.right;
	gameObject.boundingRect.top = gameObject.location.y + spriteSetData.boundingRect.top;
	gameObject.boundingRect.bottom = gameObject.location.y + spriteSetData.boundingRect.bottom;
	
	return gameObject.boundingRect;
}

function UpdateAttackRect(gameObject, levelData)
{
	var spriteData = levelData.spriteSets[gameObject.spriteSet].spriteData[gameObject.spriteNum];
	
	gameObject.attackRect.left = gameObject.location.x + spriteData.attackRect.left;
	gameObject.attackRect.right = gameObject.location.x + spriteData.attackRect.right;
	gameObject.attackRect.top = gameObject.location.y + spriteData.attackRect.top;
	gameObject.attackRect.bottom = gameObject.location.y + spriteData.attackRect.bottom;
	
	return gameObject.attackRect;
}

function ObjectsOverlap(obj1, obj2, levelData)
{
	return RectanglesOverlap(UpdateBoundingRect(obj1, levelData), UpdateBoundingRect(obj2, levelData));
}

function ObjectsAdjacent(obj1, obj2, levelData)
{
	return RectanglesAdjacent(UpdateBoundingRect(obj1, levelData), UpdateBoundingRect(obj2, levelData));
}

function TileIsSolid(levelData, x, y)
{
	if (x >= 0 && x < levelData.width && y >= 0 && y < levelData.height)
	{
		if (levelData.tiles[x][y] >= 0 && levelData.tiles[x][y] < levelData.tileSetData.tileData.length)
		{
			return levelData.tileSetData.tileData[levelData.tiles[x][y]].solid;
		}
		else
		{
			return false;
		}
	}
	
	// Indices outside the array are considered solid tiles
	return true;
}

function TileIsSlippery(levelData, x, y)
{
	if (x >= 0 && x < levelData.width && y >= 0 && y < levelData.height)
	{
		if (levelData.tiles[x][y] >= 0 && levelData.tiles[x][y] < levelData.tileSetData.tileData.length)
		{
			return levelData.tileSetData.tileData[levelData.tiles[x][y]].slippery;
		}
		else
		{
			return false;
		}
	}
	
	// Indices outside the array are not considered slippery tiles
	return false;
}

function IsOnSlipperyTile(boundingRect, levelData)
{
	var leftTile = Math.floor(boundingRect.left/TILE_WIDTH);
	var rightTile = Math.floor(boundingRect.right/TILE_WIDTH);
	var bottomTile = 0;
	
	var columnDistance = 0;
	
	// Check for solid and off-map tiles
	for (var xTile = leftTile; xTile <= rightTile; ++xTile)
	{
		columnDistance = 0;
		bottomTile = Math.floor(boundingRect.bottom/TILE_HEIGHT);
		
		// Calculate distance from bottom edge of sprite to bottom edge of row
		columnDistance = ((bottomTile * TILE_HEIGHT) + (TILE_HEIGHT - 1)) - boundingRect.bottom;
		++bottomTile;
		
		if (columnDistance === 0 && TileIsSlippery(levelData, xTile, bottomTile))
			return true;
	}
	
	return false;
}

function IsOnSlipperyObject(boundingRect, levelData)
{
	var gameObjectIter = levelData.slipperyObjects.newIterator();
	var gameObject = null;
	var slipperyBoundingRect = null;
	
	var objectsToMove = [];
	
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();	
		
		slipperyBoundingRect = UpdateBoundingRect(gameObject, levelData);
			
		// Check if object is on same vertical plane and one pixel above slippery object
		if (RectanglesOverlapHorizontally(boundingRect, slipperyBoundingRect) && slipperyBoundingRect.top === boundingRect.bottom + 1)
			return true;
		
		gameObjectIter.increment();	
	}
	
	return false;
}

function IsOnSlippery(boundingRect, levelData)
{
	return IsOnSlipperyTile(boundingRect, levelData) || IsOnSlipperyObject(boundingRect, levelData);
}

function CanMoveUpBlocks(boundingRect, levelData, requestedDistance)
{
	var availableDistance = requestedDistance;
	
	var leftTile = Math.floor(boundingRect.left/TILE_WIDTH);
	var rightTile = Math.floor(boundingRect.right/TILE_WIDTH);
	var topTile = 0;
	
	var columnDistance = 0;
	
	// Check for solid and off-map tiles
	for (var xTile = leftTile; xTile <= rightTile; ++xTile)
	{
		columnDistance = 0;
		topTile = Math.floor(boundingRect.top/TILE_HEIGHT);
		
		// If top tile of sprite is solid, object cannot move up at all
		if (!TileIsSolid(levelData, xTile, topTile))
		{
			// Calculate distance from top edge of sprite to top edge of row
			columnDistance = boundingRect.top - (topTile * TILE_HEIGHT);
			--topTile;
		
			// Keep checking rows above until either a solid tile is found or the requested distance is achieved
			while (!TileIsSolid(levelData, xTile, topTile) && columnDistance < requestedDistance)
			{
				columnDistance+=TILE_HEIGHT;
				--topTile;
			}
		}	
		
		// Short circuit as 0 is minimum distance to move
		if (columnDistance === 0)
			return 0;
			
		// Available distance to move is that of the minimum column, e.g., if a tile is blocking the left half of the sprite, the right half is irrelevant
		if (availableDistance > columnDistance)
			availableDistance = columnDistance;
	}
	
	return availableDistance;
}

function CanMoveUpObjects(boundingRect, levelData, requestedDistance)
{
	var availableDistance = requestedDistance;
	
	// Check if any solid game objects block movement
	var gameObjectIter = levelData.solidObjects.newIterator();
	var gameObject = null;
	var otherBoundingRect = null;
	var distanceToBottomEdge = 0;
		
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();	
		
		otherBoundingRect = UpdateBoundingRect(gameObject, levelData);
			
		// Check if other object is on same plane and above moving object
		if (RectanglesOverlapHorizontally(boundingRect, otherBoundingRect) && boundingRect.top > otherBoundingRect.bottom)
		{
			distanceToBottomEdge = boundingRect.top - (otherBoundingRect.bottom+1);
				
			// Short circuit as 0 is the minimum return value for this function
			if (distanceToBottomEdge <= 0)
				return 0;
					
			if (distanceToBottomEdge < availableDistance)
				availableDistance = Math.max(0, distanceToBottomEdge);
		}
		
		
		gameObjectIter.increment();		
	}

	return availableDistance;
}

function CanMoveUp(boundingRect, levelData, requestedDistance)
{
	var availableDistance = CanMoveUpBlocks(boundingRect, levelData, requestedDistance);
	
	if (availableDistance > 0)
		return CanMoveUpObjects(boundingRect, levelData, availableDistance);
	else
		return 0;
}

function CanMoveDownBlocks(boundingRect, levelData, requestedDistance)
{
	var availableDistance = requestedDistance;
	
	var leftTile = Math.floor(boundingRect.left/TILE_WIDTH);
	var rightTile = Math.floor(boundingRect.right/TILE_WIDTH);
	var bottomTile = 0;
	
	var columnDistance = 0;
	
	// Check for solid and off-map tiles
	for (var xTile = leftTile; xTile <= rightTile; ++xTile)
	{
		columnDistance = 0;
		bottomTile = Math.floor(boundingRect.bottom/TILE_HEIGHT);
		
		// If bottom tile of sprite is solid, object cannot move down at all
		if (!TileIsSolid(levelData, xTile, bottomTile))
		{
			// Calculate distance from bottom edge of sprite to bottom edge of row
			columnDistance = ((bottomTile * TILE_HEIGHT) + (TILE_HEIGHT - 1)) - boundingRect.bottom;
			
			++bottomTile;
		
			// Keep checking row below until either a solid tile is found or the requested distance is achieved
			while (!TileIsSolid(levelData, xTile, bottomTile) && columnDistance < requestedDistance)
			{
				columnDistance+=TILE_HEIGHT;
				++bottomTile;
			}
		}
		
		// Short circuit as 0 is minimum distance to move
		if (columnDistance === 0)
			return 0;
			
		// Available distance to move is that of the minimum column, e.g., if a tile is blocking the left half of the sprite, the right half is irrelevant
		if (availableDistance > columnDistance)
			availableDistance = columnDistance;
	}
	
	return availableDistance;
}

function CanMoveDownObjects(boundingRect, levelData, requestedDistance, excludeVulnerable)
{
	if (typeof excludeVulnerable === "undefined")
		excludeVulnerable = false;
		
	var availableDistance = requestedDistance;
	
	// Check if any solid game objects block movement
	var gameObjectIter = levelData.solidObjects.newIterator();
	var gameObject = null;
	var otherBoundingRect = null;
	var distanceToTopEdge = 0;
	
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();
		
		if (!excludeVulnerable || (gameObject.attributeBits & BIT_MASK_VULNERABLE) === 0)
		{
			otherBoundingRect = UpdateBoundingRect(gameObject, levelData);
			
			// Check if other object is on same vertical plane and below moving object
			if (RectanglesOverlapHorizontally(boundingRect, otherBoundingRect) && boundingRect.bottom < otherBoundingRect.top)
			{
				distanceToTopEdge = (otherBoundingRect.top-1) - boundingRect.bottom;
				
				// Short circuit as 0 is the minimum return value for this function
				if (distanceToTopEdge <= 0)
					return 0;
					
				if (distanceToTopEdge < availableDistance)
					availableDistance = Math.max(0, distanceToTopEdge);
			}
		}
		
		gameObjectIter.increment();	
	}
	
	return availableDistance;
}

function CanMoveDown(boundingRect, levelData, requestedDistance)
{
	var availableDistance = CanMoveDownBlocks(boundingRect, levelData, requestedDistance);
	
	if (availableDistance > 0)
		return CanMoveDownObjects(boundingRect, levelData, availableDistance, false);
	else
		return 0;
}

function CanMoveLeftBlocks(boundingRect, levelData, requestedDistance)
{
	var availableDistance = requestedDistance;
	
	var topTile = Math.floor(boundingRect.top/TILE_HEIGHT);
	var bottomTile = Math.floor(boundingRect.bottom/TILE_HEIGHT);
	var leftTile = 0;
	
	// Check for solid and off-map tiles
	var rowDistance = 0;
	
	for (var yTile = topTile; yTile <= bottomTile; ++yTile)
	{
		rowDistance = 0;
		leftTile = Math.floor(boundingRect.left/TILE_WIDTH);
		
		// If left tile of sprite is solid, object cannot move left at all
		if (!TileIsSolid(levelData, leftTile, yTile))
		{
			// Calculate distance from left edge of sprite to left edge of column
			rowDistance = boundingRect.left - (leftTile * TILE_WIDTH);
			--leftTile;
		
			// Keep checking column to left until either a solid tile is found or the requested distance is achieved
			while (!TileIsSolid(levelData, leftTile, yTile) && rowDistance < requestedDistance)
			{
				rowDistance+=TILE_WIDTH;
				--leftTile;
			}
		}	
		
		// Short circuit as 0 is minimum distance to move
		if (rowDistance === 0)
			return 0;
			
		// Available distance to move is that of the minimum row, e.g., if a tile is blocking the top half of the sprite, the bottom half is irrelevant
		if (availableDistance > rowDistance)
			availableDistance = rowDistance;
	}
	
	return availableDistance;
}

function CanMoveLeftObjects(boundingRect, levelData, requestedDistance, excludeVulnerable)
{
	if (typeof excludeVulnerable === "undefined")
		excludeVulnerable = false;
		
	var availableDistance = requestedDistance;
	
	// Check if any solid game objects block movement
	var gameObjectIter = levelData.solidObjects.newIterator();
	var gameObject = null;
	var otherBoundingRect = null;
	var distanceToRightEdge = 0;
		
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();	
		
		if (!excludeVulnerable || (gameObject.attributeBits & BIT_MASK_VULNERABLE) === 0)
		{
			otherBoundingRect = UpdateBoundingRect(gameObject, levelData);
			
			// Check if other object is on same horizontal plane and to the left of moving object
			if (RectanglesOverlapVertically(boundingRect, otherBoundingRect) && boundingRect.left > otherBoundingRect.right)
			{
				distanceToRightEdge = boundingRect.left - (otherBoundingRect.right+1);
				
				// Short circuit as 0 is the minimum return value for this function
				if (distanceToRightEdge <= 0)
					return 0;
					
				if (distanceToRightEdge < availableDistance)
					availableDistance = Math.max(0, distanceToRightEdge);
			}
		}
		gameObjectIter.increment();		
	}

	return availableDistance;
}

function CanMoveLeft(boundingRect, levelData, requestedDistance)
{
	var availableDistance = CanMoveLeftBlocks(boundingRect, levelData, requestedDistance);
	
	if (availableDistance > 0)
		return CanMoveLeftObjects(boundingRect, levelData, availableDistance, false);
	else
		return 0;
}

function CanMoveRightBlocks(boundingRect, levelData, requestedDistance)
{
	var availableDistance = requestedDistance;
	
	var topTile = Math.floor(boundingRect.top/TILE_HEIGHT);
	var bottomTile = Math.floor(boundingRect.bottom/TILE_HEIGHT);
	var rightTile = 0;
	
	var rowDistance = 0;
	
	// Check for solid and off-map tiles
	for (var yTile = topTile; yTile <= bottomTile; ++yTile)
	{
		rowDistance = 0;
		rightTile = Math.floor(boundingRect.right/TILE_WIDTH);
		
		// If right tile of sprite is solid, object cannot move right at all
		if (!TileIsSolid(levelData, rightTile, yTile))
		{
			// Calculate distance from right edge of sprite to right edge of column
			rowDistance = ((rightTile * TILE_WIDTH) + (TILE_WIDTH- 1)) - boundingRect.right;
			
			++rightTile;
		
			// Keep checking column to right until either a solid tile is found or the requested distance is achieved
			while (!TileIsSolid(levelData, rightTile, yTile) && rowDistance < requestedDistance)
			{
				rowDistance+=TILE_WIDTH;
				++rightTile;
			}
		}
		
		// Short circuit as 0 is minimum distance to move
		if (rowDistance === 0)
			return 0;
		
		// Available distance to move is that of the minimum row, e.g., if a tile is blocking the top half of the sprite, the bottom half is irrelevant
		if (availableDistance > rowDistance)
			availableDistance = rowDistance;
	}
	
	return availableDistance;
}

function CanMoveRightObjects(boundingRect, levelData, requestedDistance, excludeVulnerable)
{
	if (typeof excludeVulnerable === "undefined")
		excludeVulnerable = false;
		
	var availableDistance = requestedDistance;
	
	// Check if any solid game objects block movement
	var gameObjectIter = levelData.solidObjects.newIterator();
	var gameObject = null;
	var otherBoundingRect = null;
	var distanceToLeftEdge = 0;
		
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();	
		
		if (!excludeVulnerable || (gameObject.attributeBits & BIT_MASK_VULNERABLE) === 0)
		{
			otherBoundingRect = UpdateBoundingRect(gameObject, levelData);
			
			// Check if other object is on same horizontal plane and to the right of moving object
			if (RectanglesOverlapVertically(boundingRect, otherBoundingRect) && boundingRect.right < otherBoundingRect.left)
			{
				distanceToLeftEdge = (otherBoundingRect.left-1) - boundingRect.right;
				
				// Short circuit as 0 is the minimum return value for this function
				if (distanceToLeftEdge <= 0)
					return 0;
					
				if (distanceToLeftEdge < availableDistance)
					availableDistance = Math.max(0, distanceToLeftEdge);
			}
		}
		gameObjectIter.increment();	
	}

	return availableDistance;
}

function CanMoveRight(boundingRect, levelData, requestedDistance)
{
	var availableDistance = CanMoveRightBlocks(boundingRect, levelData, requestedDistance);
	
	if (availableDistance > 0)
		return CanMoveRightObjects(boundingRect, levelData, availableDistance, false);
	else
		return 0;
}

function OverlapsClimbable(boundingRect, levelData)
{
	var gameObjectIter = levelData.climbableObjects.newIterator();
	var gameObject = null;
	var otherBoundingRect = null;
		
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();	
		
		otherBoundingRect = UpdateBoundingRect(gameObject, levelData);
			
		if (RectanglesOverlap(boundingRect, otherBoundingRect))
			return true;

		gameObjectIter.increment();	
	}
	return false || NICOLE_MODE;
}

function OverlapsExit(boundingRect, levelData)
{
	var gameObjectIter = levelData.exitObjects.newIterator();
	var gameObject = null;
	var otherBoundingRect = null;
		
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();	
		
		otherBoundingRect = UpdateBoundingRect(gameObject, levelData);
			
		if (RectanglesOverlap(boundingRect, otherBoundingRect))
			return true;

		gameObjectIter.increment();	
	}
	return false;
}

function SortLeft(a,b) { return a.location.x - b.location.x; }
function SortRight(a,b) { return b.location.x - a.location.x; }

// Recursive function that attempts to move all objects that are shifted by resting on a platform or movable
// The recursion handles a case of stacked objects
function ShiftConveyable(bottomObject, levelData, direction, distance)
{
	var distanceMoved = 0;
	var bottomBoundingRect = UpdateBoundingRect(bottomObject, levelData);
	
	// If the bottom object is moving down, move it prior to any conveyable objects that may be positioned on it, so that they themselves can move down without colliding with it
	if (direction === DIRECTION_DOWN)
	{
		distanceMoved = CanMoveDown(bottomBoundingRect, levelData, distance);
		bottomObject.location.y+=distanceMoved;;
	}
	
	var gameObjectIter = levelData.conveyableObjects.newIterator();
	var gameObject = null;
	var conveyableBoundingRect = null;
	
	var objectsToMove = [];
	
	while (gameObjectIter.valid())
	{
		gameObject = gameObjectIter.getData();	
		
		conveyableBoundingRect = UpdateBoundingRect(gameObject, levelData);
			
		// Check if object is on same vertical plane and one pixel above bottom object
		if (RectanglesOverlapHorizontally(bottomBoundingRect, conveyableBoundingRect) && bottomBoundingRect.top === conveyableBoundingRect.bottom + 1)
			objectsToMove.push(gameObject);
		
		gameObjectIter.increment();	
	}
	
	// If everything is moving left, then shift the objects from left to right so objects don't block one another
	if (direction === DIRECTION_LEFT)
		objectsToMove.sort(SortLeft);
	else if (direction === DIRECTION_RIGHT)
		objectsToMove.sort(SortRight);
	
	for (var i = 0; i < objectsToMove.length; ++i)
	{
		// Recursively call the this function for any conveyable objects resting on this conveyable object
		ShiftConveyable(objectsToMove[i], levelData, direction, distance);
	}
		
	if (direction === DIRECTION_UP)
	{
		distanceMoved = CanMoveUp(bottomBoundingRect, levelData, distance);
		bottomObject.location.y-=distanceMoved;
	}
	else if (direction === DIRECTION_LEFT)
	{
		distanceMoved = CanMoveLeft(bottomBoundingRect, levelData, distance);
		bottomObject.location.x-=distanceMoved;
	}
	else if (direction === DIRECTION_RIGHT)
	{
		distanceMoved = CanMoveRight(bottomBoundingRect, levelData, distance)
		bottomObject.location.x+=distanceMoved;
	}
	
	return distanceMoved;
}

// Checks if the viewing object has an unobstructed horizontal sight line to the object
function UnobstructedHorizontalView(viewingBoundingRect, objectBoundingRect, levelData, direction, maxDistance)
{
	if (!RectanglesOverlapVertically(viewingBoundingRect, objectBoundingRect))
		return false;
	
	var distanceFromObject = 0;
	
	if (direction === DIRECTION_LEFT && viewingBoundingRect.left > objectBoundingRect.right)
	{
		distanceFromObject = viewingBoundingRect.left - (objectBoundingRect.right + 1);
			
		if (distanceFromObject <= maxDistance && CanMoveLeft(viewingBoundingRect, levelData, distanceFromObject) >= distanceFromObject)
			return true;
		else
			return false;
	}
	else if (direction === DIRECTION_RIGHT && viewingBoundingRect.right < objectBoundingRect.left)
	{
		distanceFromObject = (objectBoundingRect.left - 1) - viewingBoundingRect.right;
		
		if (distanceFromObject <= maxDistance && CanMoveRight(viewingBoundingRect, levelData, distanceFromObject) >= distanceFromObject)
			return true;
		else
			return false;
	}
	else
		return false;
}