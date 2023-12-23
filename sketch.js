pos1 = new p5.Vector(200, 100)
pos2 = new p5.Vector(100, 100)
vel1 = new p5.Vector(0, 6)
vel2 = new p5.Vector(0, 0)
let balls = [new Ball(pos1, 20, vel1, 0.89), /*new Ball(pos2, 20, vel2, 0.9)*/]
let platforms = []
console.log(balls)
let note

let translateSpeed = 0

function setup() 
{
    note = loadSound('piano-g-6200.mp3')
    let screenRatio = 16/9
    let screenW = 400
    createCanvas(screenW, screenW*screenRatio)
    balls.forEach(ball => {
        ball.display()
    })

    generateNextPlatform(balls[0], 30)
    translateSpeed = calculateTranslateSpeed(platforms, 30)

    // Set frame rate
    frameRate(100)
}

function generateNextPlatform(ball, interval){
    // Create a base platform
    // platforms.push(new Block(new p5.Vector(width/2, height-10), 300, new p5.Vector(0, 0)))

    // Create the next platform such that the ball will collide with it 
    // after the given interval (in frames)
    let platformWidth = 90
    let platformHeight = 20
    let platformSpeed = -1
    let playformVel = new p5.Vector(platformSpeed, 0) // Moving to the left
    
    // Ball position after interval frames
    // X position is simple how much the frame is translated to left
    // so this this frams ends up under the ball
    let platformX = ball.position.x + platformSpeed * interval* -1
    // Y position is calculated by s = s0 + ut + 0.5at^2
    let platformY = ball.position.y + ball.velocity.y * interval + 0.5 * ball.g * interval * interval
    platforms.push(new Block(new p5.Vector(platformX, platformY), platformWidth, playformVel))
}

function draw()
{
    background(50)
    
    // Display frame count on top left of screen
    fill(255)
    text(frameCount, 10, 10)
    let t = frameCount
    
    // print ball velocities in the top left corner
    balls.forEach(ball => {
        fill(ball.col)
        text(ball.velocity.y.toFixed(2), 10, 30+20*balls.indexOf(ball))
    })

    // Display playforms
    platforms.forEach(platform => {
        platform.update()
        platform.display()
    })

    // Update balls
    balls.forEach(ball => {
        // Check collision with platforms
        platforms.forEach(platform => {
            if(ball.checkPlatformCollision(platform.position.x, platform.position.y-platform.height/2, platform.width)){
                // ball.stopBallIfNeeded()
                platform.col = [random(0, 255), random(0, 255), random(0, 255)]
                let nextInterval = 150
                generateNextPlatform(ball, nextInterval)
                translateSpeed = calculateTranslateSpeed(platforms, nextInterval)
                // Make sound beep
                note.play()

            }
            // Move each platform up by translateSpeed
            platform.position.y -= translateSpeed
        })
        ball.update()
        ball.display()

        // Move each ball up by translateSpeed
        ball.position.y -= translateSpeed

        // Move each of the ball tails up by translateSpeed
        ball.tail.forEach(tail => {
            tail.y -= translateSpeed
        })
    })

}

function calculateTranslateSpeed(platforms, interval){
    // Calculate the speed of the frame translation
    // so that the next platform will be in the middle of the screen
    // at the time of collision
    // Y axis only since X is constant for the ball
    let ball = balls[0]
    let platform = platforms[platforms.length-1]
    let platformY = platform.position.y
    let middle = height/2
    let dy = platformY - middle
    let t = interval
    let translateSpeed = dy/t
    return translateSpeed
}