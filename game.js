import { Chess } from "chess.js"

export default class Game {
    match_code
    player1
    player2
    game
    turn
    lastMove
    started

    constructor(match_code) {
        this.match_code = match_code
        this.game = new Chess()
        this.started = false
    }

    getPlayer1() {
        return this.player1
    }

    getPlayer2() {
        return this.player2
    }

    addPlayer(player) {
        if (!this.player1) {
            this.player1 = player
            this.turn = this.player1.user_id
        }
        else
            this.player2 = player
    }

    onMove(move, user_id) {
        this.started = true
        if (this.turn == user_id) {
            this.lastMove = this.game.move({ from: move.from, to: move.to, promotion: move.promotion ?? "q" })
            this.#switchTurn()
            return true
        } else
            return false
    }

    getTurn() {
        return this.turn
    }

    getLastMove() {
        return this.lastMove
    }

    #switchTurn() {
        if (this.turn == this.player1.user_id)
            this.turn = this.player2.user_id
        else
            this.turn = this.player1.user_id
    }

    isGameOver() {
        return this.game.isGameOver()
    }

    isGameStarted() {
        return this.started
    }

    isGameCreated() {
        return this.player1 && this.player2
    }

}