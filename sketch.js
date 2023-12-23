pos1 = new p5.Vector(200, 100)
pos2 = new p5.Vector(100, 100)
vel1 = new p5.Vector(0, 6)
vel2 = new p5.Vector(0, 0)
let balls = [new Ball(pos1, 20, vel1, 0.89), /*new Ball(pos2, 20, vel2, 0.9)*/]
let platforms = []
console.log(balls)

function setup() 
{
    let screenRatio = 16/9
    let screenW = 400
    createCanvas(screenW, screenW*screenRatio)
    balls.forEach(ball => {
        ball.display()
    })

    generatePlatforms()
}

function generatePlatforms(){
    // Create a base platform
    // platforms.push(new Block(new p5.Vector(width/2, height-10), 300, new p5.Vector(0, 0)))

    // Generate 10 platforms in a loop, each with height slightly less than the previous
    // Such that they look like steps
    let platformWidth = 90
    let platformHeight = 20
    let platformX = width/2
    let platformY = height/4
    let playformVel = new p5.Vector(-1, -0.2) // Moving to the left
    for(let i = 0; i < 20; i++){
        platforms.push(new Block(new p5.Vector(platformX, platformY), platformWidth, playformVel))
        platformY += platformHeight*2
        platformX += platformWidth
    }
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
            }
        })
        ball.update()
        ball.display()

    })


}
