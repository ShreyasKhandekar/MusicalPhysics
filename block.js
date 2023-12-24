/*
File: Block.js
Author: Shreyas Khandekar
Description: This file contains the Block class which is used to represent a simple platform
*/
class Block {
	constructor(pos, width, velocity = p5.Vector.random2D()) {
		this.position = pos
		this.velocity = velocity
		this.width = width
        this.height = 20
		this.col = [255, 255, 255]
        this.topSurface = this.position.y - this.height/2
		this.bottomSurface = this.position.y + this.height/2
		this.leftEnd = this.position.x - this.width/2
		this.rightEnd = this.position.x + this.width/2
	}
	
	update() {
		this.position.add(this.velocity)
		this.topSurface = this.position.y - this.height/2
		this.bottomSurface = this.position.y + this.height/2
		this.leftEnd = this.position.x - this.width/2
		this.rightEnd = this.position.x + this.width/2
	}

	display() {
        noStroke()
		fill(this.col[0], this.col[1], this.col[2])
        rectMode(CENTER)
        rect(this.position.x, this.position.y, this.width, this.height)
	}
}
