class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game states
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameWon = false;
        
        // Paddle properties
        this.paddleWidth = 100;
        this.paddleHeight = 15;
        this.paddle = {
            x: this.canvas.width / 2 - this.paddleWidth / 2,
            y: this.canvas.height - 30,
            dx: 8
        };
        
        // Ball properties
        this.ballRadius = 8;
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            dx: 5,
            dy: -5
        };
        
        // Blocks properties
        this.blockRows = 5;
        this.blockCols = 8;
        this.blockWidth = 80;
        this.blockHeight = 25;
        this.blockPadding = 10;
        this.blockOffsetTop = 50;
        this.blockOffsetLeft = 65;
        this.blocks = [];
        
        // Colors for different block rows
        this.blockColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
        
        // Initialize blocks
        this.initializeBlocks();
        
        // Input handling
        this.rightPressed = false;
        this.leftPressed = false;
        
        // Bind event listeners
        document.addEventListener('keydown', this.keyDownHandler.bind(this));
        document.addEventListener('keyup', this.keyUpHandler.bind(this));
        
        // Start the game loop
        this.gameLoop();
    }
    
    initializeBlocks() {
        for(let row = 0; row < this.blockRows; row++) {
            this.blocks[row] = [];
            for(let col = 0; col < this.blockCols; col++) {
                this.blocks[row][col] = {
                    x: col * (this.blockWidth + this.blockPadding) + this.blockOffsetLeft,
                    y: row * (this.blockHeight + this.blockPadding) + this.blockOffsetTop,
                    status: 1
                };
            }
        }
    }
    
    keyDownHandler(e) {
        if(e.key === 'Right' || e.key === 'ArrowRight') {
            this.rightPressed = true;
        } else if(e.key === 'Left' || e.key === 'ArrowLeft') {
            this.leftPressed = true;
        }
    }
    
    keyUpHandler(e) {
        if(e.key === 'Right' || e.key === 'ArrowRight') {
            this.rightPressed = false;
        } else if(e.key === 'Left' || e.key === 'ArrowLeft') {
            this.leftPressed = false;
        }
    }
    
    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.roundRect(
            this.paddle.x,
            this.paddle.y,
            this.paddleWidth,
            this.paddleHeight,
            [7, 7, 7, 7]
        );
        this.ctx.fillStyle = '#FFD93D';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    drawBlocks() {
        for(let row = 0; row < this.blockRows; row++) {
            for(let col = 0; col < this.blockCols; col++) {
                if(this.blocks[row][col].status === 1) {
                    const blockX = this.blocks[row][col].x;
                    const blockY = this.blocks[row][col].y;
                    
                    this.ctx.beginPath();
                    this.ctx.roundRect(
                        blockX,
                        blockY,
                        this.blockWidth,
                        this.blockHeight,
                        [5, 5, 5, 5]
                    );
                    this.ctx.fillStyle = this.blockColors[row];
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            }
        }
    }
    
    collisionDetection() {
        for(let row = 0; row < this.blockRows; row++) {
            for(let col = 0; col < this.blockCols; col++) {
                const block = this.blocks[row][col];
                if(block.status === 1) {
                    if(this.ball.x > block.x && 
                       this.ball.x < block.x + this.blockWidth &&
                       this.ball.y > block.y && 
                       this.ball.y < block.y + this.blockHeight) {
                        this.ball.dy = -this.ball.dy;
                        block.status = 0;
                        this.score += 10;
                        document.getElementById('score').textContent = this.score;
                        
                        if(this.score === this.blockRows * this.blockCols * 10) {
                            this.gameWon = true;
                        }
                    }
                }
            }
        }
    }
    
    movePaddle() {
        if(this.rightPressed && this.paddle.x < this.canvas.width - this.paddleWidth) {
            this.paddle.x += this.paddle.dx;
        } else if(this.leftPressed && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.dx;
        }
    }
    
    moveBall() {
        // Ball collision with walls
        if(this.ball.x + this.ball.dx > this.canvas.width - this.ballRadius || 
           this.ball.x + this.ball.dx < this.ballRadius) {
            this.ball.dx = -this.ball.dx;
        }
        
        if(this.ball.y + this.ball.dy < this.ballRadius) {
            this.ball.dy = -this.ball.dy;
        } else if(this.ball.y + this.ball.dy > this.canvas.height - this.ballRadius) {
            // Ball collision with paddle
            if(this.ball.x > this.paddle.x && 
               this.ball.x < this.paddle.x + this.paddleWidth) {
                // Calculate angle of reflection based on where ball hits paddle
                const hitPoint = (this.ball.x - (this.paddle.x + this.paddleWidth/2)) / (this.paddleWidth/2);
                const angle = hitPoint * Math.PI/3; // Max 60 degree angle
                const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
                
                this.ball.dx = speed * Math.sin(angle);
                this.ball.dy = -speed * Math.cos(angle);
            } else {
                this.lives--;
                document.getElementById('lives').textContent = this.lives;
                
                if(this.lives === 0) {
                    this.gameOver = true;
                } else {
                    // Reset ball and paddle
                    this.ball.x = this.canvas.width/2;
                    this.ball.y = this.canvas.height - 50;
                    this.ball.dx = 5;
                    this.ball.dy = -5;
                    this.paddle.x = (this.canvas.width - this.paddleWidth)/2;
                }
            }
        }
        
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
    }
    
    drawGameOver() {
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press R to Restart', this.canvas.width/2, this.canvas.height/2 + 50);
    }
    
    drawGameWon() {
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('YOU WIN!', this.canvas.width/2, this.canvas.height/2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press R to Play Again', this.canvas.width/2, this.canvas.height/2 + 50);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if(this.gameOver) {
            this.drawGameOver();
            return;
        }
        
        if(this.gameWon) {
            this.drawGameWon();
            return;
        }
        
        this.drawBlocks();
        this.drawBall();
        this.drawPaddle();
        
        this.collisionDetection();
        this.movePaddle();
        this.moveBall();
    }
    
    gameLoop() {
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Start the game
const game = new Game();

// Restart game handler
document.addEventListener('keydown', (e) => {
    if(e.key === 'r' || e.key === 'R') {
        location.reload();
    }
});
