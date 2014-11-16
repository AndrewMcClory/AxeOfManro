// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var InfoEditor = function()
{
	var curInfoData = new InfoData(JSON.parse(INFO_JSON[0]));
	var lastItemAdded = null;
	
	document.forms["OpenForm"]["InfoNumber"].value = 0;
	
	var tp = new TilePalette(document.getElementById("SpriteCanvas"), INFO_SPRITE_WIDTH, INFO_SPRITE_HEIGHT);
	tp.setTileImage(curInfoData.sprites);
	
	var ic = new InfoCanvas(document.getElementById("InfoCanvas"));
	ic.setInfoData(curInfoData);
		
	var icNeedsRedraw = true;
	var tpNeedsRedraw = true;
	
	var updateForms = function()
	{
		document.forms["TextForm"]["TextFont"].value = "20px Arial";
		document.forms["TextForm"]["TextColor"].value = "black";
		document.forms["TextForm"]["TextContent"].value = "";
		
		document.forms["InfoForm"]["InfoBackground"].value = curInfoData.background;
		document.forms["InfoForm"]["InfoSprites"].value = curInfoData.sprites;
		
		var textArea = document.getElementById("InfoOutput");
		textArea.value = JSON.stringify(curInfoData.getData());
	};
	
	updateForms();
	
	var clearInfoData = function()
	{
		curInfoData.textData = new LinkedList();
		curInfoData.spriteData = new LinkedList();
	};
	
	var checkKeys = function()
	{
		if (lastItemAdded !== null)
		{
			if (keydown.up)
			{
				--lastItemAdded.location.y;
				icNeedsRedraw = true;
			}
			if (keydown.down)
			{
				++lastItemAdded.location.y;
				icNeedsRedraw = true;
			}
			if (keydown.left)
			{
				--lastItemAdded.location.x;
				icNeedsRedraw = true;
			}
			if (keydown.right)
			{
				++lastItemAdded.location.x;
				icNeedsRedraw = true;
			}
		}
	};

	setInterval(function()
	{
	
		checkKeys();
		
		if (icNeedsRedraw && ic.imagesLoaded())
		{
			ic.draw();
			icNeedsRedraw = false;
		}
		
		if (tpNeedsRedraw && tp.imageLoaded())
		{
			tp.draw();
			tpNeedsRedraw = false;
		}
	}, 1000/FPS);

	this.spriteMouseDown = function(event)
	{
		tp.mouseDown(event);
		document.forms["SelectForm"]["Tool"].value = "Sprite";
	};
	
	var deleteInfoObjects = function(x, y)
	{
		var mouseRectangle = new Rectangle(x, y, 1, 1);
		var objectRectangle = new Rectangle(0, 0, 0, 0);
		
		var textDataIter = curInfoData.textData.newIterator();
		
		while (textDataIter.valid())
		{
			var textDataObject = textDataIter.getData();
			
			objectRectangle.left = textDataObject.location.x;
			objectRectangle.bottom = textDataObject.location.y;
			objectRectangle.right = objectRectangle.left + 15;
			objectRectangle.top = objectRectangle.bottom - 15;
			
			if (RectanglesOverlap(mouseRectangle, objectRectangle))
			{
				textDataIter.remove();
			}
			else
			{
				textDataIter.increment();
			}	
		}
		
		var spriteDataIter = curInfoData.spriteData.newIterator();
		
		while (spriteDataIter.valid())
		{
			var spriteDataObject = spriteDataIter.getData();
			
			objectRectangle.left = spriteDataObject.location.x;
			objectRectangle.top = spriteDataObject.location.y;
			objectRectangle.right = objectRectangle.left + INFO_SPRITE_WIDTH;
			objectRectangle.bottom = objectRectangle.top + INFO_SPRITE_HEIGHT;
			
			if (RectanglesOverlap(mouseRectangle, objectRectangle))
			{
				spriteDataIter.remove();
			}
			else
			{
				spriteDataIter.increment();
			}	
		}
	};
	
	var getInfoObject = function(x, y)
	{
		var mouseRectangle = new Rectangle(x, y, 1, 1);
		var objectRectangle = new Rectangle(0, 0, 0, 0);
		
		var infoObject = null;
		
		var textDataIter = curInfoData.textData.newIterator();
		
		while (textDataIter.valid())
		{
			var textDataObject = textDataIter.getData();
			
			objectRectangle.left = textDataObject.location.x;
			objectRectangle.bottom = textDataObject.location.y;
			objectRectangle.right = objectRectangle.left + 15;
			objectRectangle.top = objectRectangle.bottom - 15;
			
			if (RectanglesOverlap(mouseRectangle, objectRectangle))
			{
				infoObject = textDataObject;
			}
			
			textDataIter.increment();	
		}
		
		var spriteDataIter = curInfoData.spriteData.newIterator();
		
		while (spriteDataIter.valid())
		{
			var spriteDataObject = spriteDataIter.getData();
			
			objectRectangle.left = spriteDataObject.location.x;
			objectRectangle.top = spriteDataObject.location.y;
			objectRectangle.right = objectRectangle.left + INFO_SPRITE_WIDTH;
			objectRectangle.bottom = objectRectangle.top + INFO_SPRITE_HEIGHT;
			
			if (RectanglesOverlap(mouseRectangle, objectRectangle))
			{
				infoObject = spriteDataObject;
			}
			
			spriteDataIter.increment();
		}
		
		return infoObject;
	};

	this.textMouseDown = function(event)
	{
		document.forms["SelectForm"]["Tool"].value = "Text";
	};
	
	this.infoMouseDown = function(event)
	{
		var location = ic.eventToLocationCoords(event);
		
		if (document.forms["SelectForm"]["Tool"].value === "Text")
		{
			lastItemAdded = new InfoTextData(document.forms["TextForm"]["TextFont"].value, document.forms["TextForm"]["TextColor"].value, document.forms["TextForm"]["TextContent"].value, location);
			curInfoData.textData.addNode(lastItemAdded);
			document.forms["SelectForm"]["Tool"].value = "Select";
		}
		else if (document.forms["SelectForm"]["Tool"].value === "Sprite")
		{
			lastItemAdded = new InfoSpriteData(tp.getSelectedTile(), location);
			curInfoData.spriteData.addNode(lastItemAdded);
			document.forms["SelectForm"]["Tool"].value = "Select";
		}
		else if (document.forms["SelectForm"]["Tool"].value === "Select")
		{
			lastItemAdded = getInfoObject(location.x, location.y);
		}
		else
		{
			deleteInfoObjects(location.x, location.y);
			lastItemAdded = null;
		}
		
		icNeedsRedraw = true;
	};

	this.onGenerate = function()
	{
		if (parseInt(document.forms["OpenForm"]["InfoNumber"].value) >= 0 && parseInt(document.forms["OpenForm"]["InfoNumber"].value) <= 10)
		{
			curInfoData = new InfoData();
			
			curInfoData.background = document.forms["InfoForm"]["InfoBackground"].value + GetTimeTag();
			curInfoData.sprites = document.forms["InfoForm"]["InfoSprites"].value + GetTimeTag();
			
			tp.setTileImage(curInfoData.sprites);
			ic.setInfoData(curInfoData);
			
			var textArea = document.getElementById("InfoOutput");
			textArea.value = JSON.stringify(curInfoData.getData());
			
			icNeedsRedraw = true;
			tpNeedsRedraw = true;
		}
	};

	this.onOpen = function()
	{
		if (parseInt(document.forms["OpenForm"]["InfoNumber"].value) >= 0 && parseInt(document.forms["OpenForm"]["InfoNumber"].value) <= 10)
		{	
			curInfoData = new InfoData(JSON.parse(INFO_JSON[document.forms["OpenForm"]["InfoNumber"].value]));
			
			updateForms();
			tp.setTileImage(curInfoData.sprites);
			ic.setInfoData(curInfoData);
			
			icNeedsRedraw = true;
			tpNeedsRedraw = true;
		}
	};

	this.onRefresh = function()
	{
		var textArea = document.getElementById("InfoOutput");
		textArea.value = JSON.stringify(curInfoData.getData());
	};
	
	var ar=new Array(33,34,35,36,37,38,39,40);

	$(document).keydown(function(e) {
			var key = e.which;
			
			if($.inArray(key,ar) > -1) {
				e.preventDefault();
				return false;
			}
			return true;
	});
};