// Developer : Andrew McClory
// Date : 4/27/2013
// All code (c)2013 all rights reserved

var LinkedList = function()
{
	var head = null;
	var tail = null;
	
	var Node = function()
	{
		this.data = null;
		this.next = null;
		this.prev = null;
	};
	
	var removeNode = function(node)
	{
		if (node === null)
		{
			return null;
		}
		
		// If the node to be removed has a previous node, update the previous node's next pointer
		if (node.prev !== null)
		{
			node.prev.next = node.next;
		}
		
		// If the node to be removed has a next node, update the next node's prev pointer
		if (node.next !== null)
		{
			node.next.prev = node.prev;
		}
		
		// If this is the head node, move the head forward a node
		if (node === head)
		{
			head = head.next;
		}
		
		// If this is the tail node, move the tail backward a node
		if (node === tail)
		{
			tail = tail.prev;
		}
		
		return node.next;
	};
	
	var Iterator = function(node)
	{
		this.getData = function()
		{
			if (node !== null)
				return node.data;
			else
				return null;
		};
		
		this.increment = function()
		{
			if (node !== null)
			{
				node = node.next;
			}
		};
		
		this.reset = function()
		{
			node = head;
		};
		
		this.remove = function()
		{
			node = removeNode(node);
		};
		
		this.valid = function()
		{
			return node !== null;
		};
	};
	
	this.addNode = function(data)
	{
		var node = new Node();
		node.data = data;
		node.next = null;
		
		// Add this node to an empty list
		if (head === null)
		{
			node.prev = null;
			head = node;
			tail = node;
		}
		else
		{
			// The old tail of the list now points to the new node
			tail.next = node;
			node.prev = tail;
			// The new node is now the tail of the list
			tail = node;
		}
	};
	
	this.getCount = function()
	{
		var count = 0;
		
		var curNode = head;
		
		while (curNode !== null)
		{
			++count;
			curNode = curNode.next;
		}
		
		return count;
	};
	
	this.getListData = function()
	{
		var list = "Data: ";
		
		var curNode = head;
		var firstNode = true;
		
		while (curNode !== null)
		{
			if (firstNode)
			{
				firstNode = false;
			}
			else
			{
				list+=", ";
			}
			list+= curNode.data;
			curNode = curNode.next;
		}
		
		return list;
	};
	
	this.newIterator = function()
	{
		return new Iterator(head);
	};
};