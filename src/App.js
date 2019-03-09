import React, {Component} from 'react';

class App extends Component {

    N = 60;
    size = 600;
    canvasRef = null;
    cells = [];
    prevCellsArray = [];
    intervalMs = 50;
    state = {
        playInterval: null,
        count: 0
    };

    componentDidMount() {
        this.draw();
    }

    handleCanvasRef = element => {
        this.canvasRef = element;
        this.canvasRef.width = this.size;
        this.canvasRef.height = this.size;
    };

    onMouseDown = () => {
        this.isAdding = true;
    };

    onMouseUp = () => {
        this.isAdding = false;
    };

    onMouseClick = (event) => {
        this.isAdding = true;
        this.onMouseMove(event);
        this.isAdding = false;
    };

    onMouseMove = (event) => {
        if (!this.isAdding || this.state.playInterval) {
            return;
        }

        const rect = this.canvasRef.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const cellSize = this.size / this.N;

        const xIndex = parseInt(x / cellSize);
        const yIndex = parseInt(y / cellSize);

        this.cell = {
            x: xIndex,
            y: yIndex
        };

        if (this.prevCell && this.isCellsEqual([this.cell], [this.prevCell])) {
            return;
        } else {
            this.prevCell = Object.assign({}, this.cell);
        }

        const idx = this.cells.findIndex(({x, y}) => x === xIndex && y === yIndex);

        if (idx !== -1) {
            this.cells.splice(idx, 1);
        } else {
            this.cells.push(this.cell);
        }

        this.draw();
    };

    onPlay = () => {
        if (this.state.playInterval) {
            this.stopGame();
        } else {
            this.startGame();
        }
    };

    onClear = () => {
        this.cells = [];
        this.prevCellsArray = [];
        this.draw();
        this.setState({
            count: 0
        });
    };

    startGame = () => {
        const playInterval = setInterval(this.game, this.intervalMs);
        this.setState({
            playInterval
        });
    };

    stopGame = () => {
        clearInterval(this.state.playInterval);

        this.setState({
            playInterval: null
        });
    };

    game = () => {
        this.update();
        this.draw();

        const {count} = this.state;

        const isEqual = this.prevCellsArray.filter(prevCells => this.isCellsEqual(this.cells, prevCells)).length > 0;

        if (isEqual) {
            this.stopGame();
        } else {
            if (this.prevCellsArray.length === 5) {
                this.prevCellsArray.shift();
            }

            this.prevCellsArray.push(this.cells.slice());
        }

        this.setState({
            count: count + 1
        });
    };

    update = () => {
        const newCells = [];

        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                const aroundCells = this.getAroundCells(i, j);
                const aliveCells = aroundCells.filter(aroundCell => this.isCellAlive(aroundCell.x, aroundCell.y));

                if (this.isCellAlive(i, j)) {
                    if (aliveCells.length >= 2 && aliveCells.length <= 3) {
                        newCells.push({x: i, y: j});
                    }
                } else {
                    if (aliveCells.length === 3) {
                        newCells.push({x: i, y: j});
                    }
                }
            }
        }

        this.cells = newCells;
    };

    isCellAlive = (x, y) => {
        return this.cells.find(cell => cell.x === x && cell.y === y);
    };

    isCellsEqual = (currentCells, prevCells) => {
        if (currentCells.length !== prevCells.length) {
            return false;
        }

        for (let i = 0; i < currentCells.length; i++) {
            const existed = prevCells.find(cell => cell.x === currentCells[i].x && cell.y === currentCells[i].y);

            if (!existed) {
                return false;
            }
        }

        return true;
    };

    getAroundCells = (x, y) => {
        const topLeft = {x: x - 1, y: y - 1};
        const topCenter = {x, y: y - 1};
        const topRight = {x: x + 1, y: y - 1};

        const centerLeft = {x: x - 1, y};
        const centerRight = {x: x + 1, y};

        const bottomLeft = {x: x - 1, y: y + 1};
        const bottomCenter = {x, y: y + 1};
        const bottomRight = {x: x + 1, y: y + 1};

        const cells = [topLeft, topCenter, topRight, centerLeft, centerRight, bottomLeft, bottomCenter, bottomRight];

        cells.forEach(cell => {
            if (cell.x < 0) {
                cell.x = this.N - 1;
            }

            if (cell.x > this.N - 1) {
                cell.x = 0;
            }

            if (cell.y < 0) {
                cell.y = this.N - 1;
            }

            if (cell.y > this.N - 1) {
                cell.y = 0;
            }
        });

        return cells;
    };

    draw = () => {
        const start = new Date().getTime();

        this.clear();
        this.drawField();
        this.drawCells();

        const end = new Date().getTime();
        console.log(end - start);
    };

    clear = () => {
        const {canvasRef} = this;
        const {width, height} = canvasRef;

        const context = canvasRef.getContext('2d');
        context.fillStyle = 'rgba(255, 255, 255, 1)';
        context.rect(0, 0, width, height);
        context.fill();
    };

    drawField = () => {
        const step = this.size / this.N;

        const {canvasRef} = this;

        const context = canvasRef.getContext('2d');
        context.save();
        context.beginPath();
        context.translate(0.5, 0.5);

        for (let i = 0; i <= this.size; i += step) {
            let coordinate = i;

            if (i === this.size) {
                coordinate  = i - 1;
            }

            context.moveTo(0, coordinate);
            context.lineTo(this.size, coordinate);

            if (i === this.size) {
                coordinate  = i - 0.5;
            }

            context.moveTo(coordinate, 0);
            context.lineTo(coordinate, this.size);
        }

        context.closePath();
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        context.stroke();

        context.restore();
    };

    drawCells = () => {
        const {canvasRef} = this;
        const context = canvasRef.getContext('2d');

        const cellSize = this.size / this.N;

        context.fillStyle = 'black';

        this.cells.forEach(({x, y}) => {
            const xPos = x * cellSize;
            const yPos = y * cellSize;
            const size = cellSize;

            context.rect(xPos, yPos, size + 1, size + 1);
        });

        context.fill();
    };

    render() {
        const {playInterval, count} = this.state;

        return (
            <div>
                <h1 className="ui header">Welcome to Game of Life</h1>

                <div className="ui segment">

                    <button className="ui primary button"
                            onClick={this.onPlay}>{playInterval ? 'Stop' : 'Start'}</button>
                    <button className="ui button" onClick={this.onClear}>{'Clear'}</button>
                </div>
                <div className="ui segment">
                    <div className="ui label">
                        {count}
                    </div>
                </div>
                <div className="ui segment">
                    <canvas ref={this.handleCanvasRef} onMouseMove={this.onMouseMove} onMouseDown={this.onMouseDown}
                            onMouseUp={this.onMouseUp} onClick={this.onMouseClick}/>
                </div>
            </div>
        );
    }
}

export default App;
