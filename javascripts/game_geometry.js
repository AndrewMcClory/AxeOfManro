// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

function Point(x, y)
{
	this.x = x;
	this.y = y;
	
	this.set = function(x, y)
	{
		this.x = x;
		this.y = y;
	};
}

function Rectangle(left, top, width, height)
{
	this.set = function(left, top, width, height)
	{
		this.left = left;
		this.top = top;
		this.right = left + width - 1;
		this.bottom = top + height - 1;
	};
	
	this.width = function()
	{
		return (this.right - this.left) + 1;
	};
	
	this.height = function()
	{
		return (this.bottom - this.top) + 1;
	};
	
	this.set(left, top, width, height);
}

function RectanglesOverlapVertically(r1, r2)
{
	if (r1.top > r2.bottom || r1.bottom < r2.top)
		return false;
	else
		return true;
}

function RectanglesOverlapHorizontally(r1, r2)
{
	if (r1.left > r2.right || r1.right < r2.left)
		return false;
	else
		return true;
}

function RectanglesOverlap(r1, r2)
{
	return RectanglesOverlapHorizontally(r1, r2) && RectanglesOverlapVertically(r1, r2);
}

function RectanglesAdjacent(r1, r2)
{
	if ((r1.top === r2.bottom + 1 || r1.bottom === r2.top - 1) && RectanglesOverlapHorizontally(r1, r2))
		return true;
	else if ((r1.left === r2.right + 1 || r1.right === r2.left - 1) && RectanglesOverlapVertically(r1, r2))
		return true;
	else
		return false;
}