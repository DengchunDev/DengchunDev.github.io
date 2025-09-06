
document.addEventListener('DOMContentLoaded', () => {
    const BOARD_SIZE = 10;
    const NUM_MINES = 10;
    let board = [];
    let revealed = 0;
    let gameOver = false;
    let timer = 0;
    let timerInterval;
    let firstClick = true;
    
    const gameBoard = document.getElementById('game-board');
    const minesLeftDisplay = document.getElementById('mines-left');
    const timeDisplay = document.getElementById('time');
    const resetBtn = document.getElementById('reset-btn');
    
    // 初始化游戏
    function initGame() {
        board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
        revealed = 0;
        gameOver = false;
        firstClick = true;
        clearInterval(timerInterval);
        timer = 0;
        timeDisplay.textContent = timer;
        minesLeftDisplay.textContent = NUM_MINES;
        
        // 清空游戏板
        gameBoard.innerHTML = '';
        
        // 创建单元格
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', handleLeftClick);
                cell.addEventListener('contextmenu', handleRightClick);
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    // 放置地雷
    function placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < NUM_MINES) {
            const row = Math.floor(Math.random() * BOARD_SIZE);
            const col = Math.floor(Math.random() * BOARD_SIZE);
            
            // 确保不在第一次点击的格子及其周围放置地雷
            const isNearFirstClick = Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1;
            
            if (board[row][col] !== -1 && !isNearFirstClick) {
                board[row][col] = -1; // -1 表示地雷
                minesPlaced++;
                
                // 更新周围格子的数字
                for (let r = Math.max(0, row - 1); r <= Math.min(BOARD_SIZE - 1, row + 1); r++) {
                    for (let c = Math.max(0, col - 1); c <= Math.min(BOARD_SIZE - 1, col + 1); c++) {
                        if (board[r][c] !== -1) {
                            board[r][c]++;
                        }
                    }
                }
            }
        }
    }
    
    // 左键点击处理
    function handleLeftClick(e) {
        if (gameOver) return;
        
        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // 第一次点击时放置地雷并开始计时
        if (firstClick) {
            firstClick = false;
            placeMines(row, col);
            startTimer();
        }
        
        // 如果已标记或已揭开，则不做任何操作
        if (cell.classList.contains('flagged') || cell.classList.contains('revealed')) {
            return;
        }
        
        revealCell(row, col);
    }
    
    // 右键点击处理（标记）
    function handleRightClick(e) {
        e.preventDefault();
        if (gameOver || firstClick) return;
        
        const cell = e.target;
        
        // 如果已揭开，则不做任何操作
        if (cell.classList.contains('revealed')) {
            return;
        }
        
        // 切换标记状态
        if (cell.classList.contains('flagged')) {
            cell.classList.remove('flagged');
            const currentMines = parseInt(minesLeftDisplay.textContent);
            minesLeftDisplay.textContent = currentMines + 1;
        } else {
            cell.classList.add('flagged');
            const currentMines = parseInt(minesLeftDisplay.textContent);
            minesLeftDisplay.textContent = currentMines - 1;
        }
    }
    
    // 揭开格子
    function revealCell(row, col) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        
        // 如果已标记或已揭开，则不做任何操作
        if (cell.classList.contains('flagged') || cell.classList.contains('revealed')) {
            return;
        }
        
        cell.classList.add('revealed');
        
        // 如果是地雷，游戏结束
        if (board[row][col] === -1) {
            cell.classList.add('mine');
            gameOver = true;
            clearInterval(timerInterval);
            revealAllMines();
            setTimeout(() => alert('游戏结束！你踩到地雷了！'), 100);
            return;
        }
        
        // 更新已揭开的格子数
        revealed++;
        
        // 显示数字
        if (board[row][col] > 0) {
            cell.textContent = board[row][col];
            cell.classList.add(`number-${board[row][col]}`);
        } else {
            // 如果是空白格子，自动揭开周围的格子
            for (let r = Math.max(0, row - 1); r <= Math.min(BOARD_SIZE - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(BOARD_SIZE - 1, col + 1); c++) {
                    if (r !== row || c !== col) {
                        revealCell(r, c);
                    }
                }
            }
        }
        
        // 检查是否获胜
        if (revealed === BOARD_SIZE * BOARD_SIZE - NUM_MINES) {
            gameOver = true;
            clearInterval(timerInterval);
            setTimeout(() => alert(`恭喜你赢了！用时: ${timer}秒`), 100);
        }
    }
    
    // 揭开所有地雷
    function revealAllMines() {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col] === -1) {
                    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                    if (!cell.classList.contains('flagged')) {
                        cell.classList.add('mine');
                    }
                }
            }
        }
    }
    
    // 开始计时
    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timeDisplay.textContent = timer;
        }, 1000);
    }
    
    // 重置游戏
    resetBtn.addEventListener('click', initGame);
    
    // 初始化游戏
    initGame();
});
