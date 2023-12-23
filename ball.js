/*
File: ball.js
Author: Shreyas Khandekar
Description: This file contains the Ball class and collision handling
based on Example https://p5js.org/examples/motion-circle-collision.html
*/
class Ball {
	constructor(pos, r, velocity = p5.Vector.random2D(), elasticity = 1) {
		this.position = pos
		this.velocity = velocity
		this.radius = r
		this.mass = r * 0.1
		this.col = [255, 255, 255]
        this.elasticity = elasticity
        this.g = 0.15
        // Create a tail which tracks the history of the ball's position in the
        // y axis in the last 50 frames
        this.tail = []
        this.tailLength = 50
        for(let i = 0; i < this.tailLength; i++){
            this.tail.push(new p5.Vector(this.position.x-i, this.position.y))
        }
	}
	update() {
        // Add gravity
        this.velocity.y += this.g
		this.position.add(this.velocity)
        this.tail.push(new p5.Vector(this.position.x, this.position.y))
        for (let i = 0; i < this.tail.length; i++){
            this.tail[i].x -= 1
        }
        this.tail.shift()

	}

    checkPlatformCollision(platformX, platformY, platformWidth) {
        let playformLeftEnd = platformX - platformWidth/2
        let playformRightEnd = platformX + platformWidth/2
        if (this.position.y > platformY - this.radius /* ball  below platform*/&&
            this.position.x > playformLeftEnd && this.position.x < playformRightEnd) {
            console.log("Collision with platform")
            // Collision with platform
            this.position.y = platformY - this.radius // Correct position to avoid overlap
            this.velocity.y *= -1 * this.elasticity // Reverse y velocity
            this.col = [random(0, 255), random(0, 255), random(0, 255)]
            return true
        }
        return false
    }

    stopBallIfNeeded() {
        if (this.velocity.mag() <= 0.1) {
            this.velocity = new p5.Vector(0, 0)
            this.g = 0
        }
    }
        

	checkVerticalBoundaryCollision() {
		if (this.position.y > height - this.radius) {
			// Collision with bottom wall
			this.position.y = height - this.radius // Correct position to avoid overlap
			this.velocity.y *= -1 // Reverse y velocity
			return true
		} else if (this.position.y < this.radius) {
			// Collision with top wall
			this.position.y = this.radius // Correct position to avoid overlap
			this.velocity.y *= -1 // Reverse y velocity
			return true
		}
		return false
	}
	lateralCollision() {
		this.col = [random(0, 255), random(0, 255), random(0, 255)]
		this.velocity.mult(acceleration) // Accelerate ball
		if (this.velocity.mag() > 40) {
			this.velocity.normalize()
			return true
		}
		return false
	}

	checkLeftLateralBoundaryCollision() {
		if (this.position.x < this.radius) {
			this.position.x = this.radius
			this.velocity.x *= -1
			return this.lateralCollision()
		}
	}
	checkRightLateralBoundaryCollision() {
		if (this.position.x > width - this.radius) {
			this.position.x = width - this.radius
			this.velocity.x *= -1
			return this.lateralCollision()
		}
	}

	checkWavePointCollision(wavePoint, radius) {
		// Get distances between the balls components
		let distanceVect = p5.Vector.sub(wavePoint, this.position)

		// Calculate magnitude of the vector separating the balls
		let distanceVectMag = distanceVect.mag()

		// Minimum distance before they are touching
		let minDistance = this.radius + radius

		if (distanceVectMag < minDistance) {
			let distanceCorrection = minDistance - distanceVectMag
			// Create a copy of the distance vector and normalize it to create a correction vector
			let d = distanceVect.copy()
			let correctionVector = d.normalize().mult(distanceCorrection)
			// Move the ball away from the wave point by applying the correction vector
			this.position.sub(correctionVector)

			// Formula here: https://3dkingdoms.com/weekly/weekly.php?a=2
			// Formula for vector reflection:
			// Vnew = b * ( -2*(V dot N)*N + V )
			// where:
			// V is the incident vector
			// N is the normal of the plane
			// b is control for the loss of speed. b = 1 is a perfect reflection, b = 0 is no reflection at all
			// for us b will be 1
			
			let b = 1.0
			let normal = p5.Vector.normalize(distanceVect)
			let vNew = this.velocity.copy()
			let projection = vNew.dot(normal)
			vNew = normal.mult(projection)
			vNew = vNew.mult(-2)
			vNew = vNew.add(this.velocity)
			vNew = vNew.mult(b)
			this.velocity = vNew

			return this.lateralCollision()
		}
		return false
	}

	checkCollision(other) {
		// Get distances between the balls components
		let distanceVect = p5.Vector.sub(other.position, this.position)

		// Calculate magnitude of the vector separating the balls
		let distanceVectMag = distanceVect.mag()

		// Minimum distance before they are touching
		let minDistance = this.radius + other.radius

		if (distanceVectMag < minDistance) {
			let distanceCorrection = (minDistance - distanceVectMag) / 2.0
			// Create a copy of the distance vector and normalize it to create a correction vector
			let d = distanceVect.copy()
			let correctionVector = d.normalize().mult(distanceCorrection)
			// Move the balls away from each other by applying the correction vector
			other.position.add(correctionVector)
			this.position.sub(correctionVector)

			// Get the angle of the distance vector
			let theta = distanceVect.heading()
			// Precalculate sine and cosine values of the angle for future calculations
			let sine = sin(theta)
			let cosine = cos(theta)

			// Create temporary vectors to hold the rotated positions and velocities of the balls
			// We just need to worry about bTemp[1] in this position
			let bTemp = [new p5.Vector(), new p5.Vector()]

			//  this ball's this.position is relative to the other
			// so we can use the vector between them (bVect) as the 
			// reference point in the rotation expressions.
			// bTemp[0].this.position.x and bTemp[0].this.position.y will initialize
			// automatically to 0.0, which is what you want
			// since b[1] will rotate around b[0] 
			// Set the first ball's position in the temporary vector to (0, 0)
			// The second ball's position in the temporary vector will be the rotated position
			bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y
			bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x

			// rotate Temporary velocities
			let vTemp = [new p5.Vector(), new p5.Vector()]

			// Rotate the velocities of the balls and store them in temporary vectors
			vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y
			vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x
			vTemp[1].x = cosine * other.velocity.x + sine * other.velocity.y
			vTemp[1].y = cosine * other.velocity.y - sine * other.velocity.x

			// Now that velocities are rotated, you can use 1D
			// conservation of momentum equations to calculate 
			// the final this.velocity along the x-axis. 
			let vFinal = [new p5.Vector(), new p5.Vector()]

			// Calculate the final velocity of the first ball using 1D conservation of momentum equations
			// final rotated this.velocity for b[0]
			vFinal[0].x =
				((this.mass - other.mass) * vTemp[0].x + 2 * other.mass * vTemp[1].x) / (this.mass + other.mass)
			vFinal[0].y = vTemp[0].y

			// Calculate the final velocity of the second ball using 1D conservation of momentum equations
			// final rotated this.velocity for b[0]
			vFinal[1].x =
				((other.mass - this.mass) * vTemp[1].x + 2 * this.mass * vTemp[0].x) / (this.mass + other.mass)
			vFinal[1].y = vTemp[1].y

			// Add the final velocity to the temporary position vector to update the position of the first ball
			// This hack is to avoid clumping
			bTemp[0].x += vFinal[0].x
			bTemp[1].x += vFinal[1].x

			// Rotate ball this.positions and velocities back to their original positions
			// Reverse signs in trig expressions to rotate 
         	// in the opposite direction
			let bFinal = [new p5.Vector(), new p5.Vector()]

			bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y
			bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x
			bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y
			bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x

			// update balls to screen this.position
			other.position.x = this.position.x + bFinal[1].x
			other.position.y = this.position.y + bFinal[1].y

			this.position.add(bFinal[0])

			// update velocities
			this.velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y
			this.velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x
			other.velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y
			other.velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x

			return true
		}
		return false
	}

	display() {
		noStroke()
		fill(this.col[0], this.col[1], this.col[2])
		ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2)
        // Draw the tail
        stroke(this.col[0], this.col[1], this.col[2])
        strokeWeight(2)
        for(let i = 0; i < this.tail.length-1; i++){
            ellipse(this.tail[i].x, this.tail[i].y, this.radius*0.01)
        }
	}
}
