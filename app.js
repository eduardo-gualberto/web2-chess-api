import express from "express";
import cors from "cors";
import Game from "./game.js";
import Player from "./player.js";
import bodyParser from "body-parser";

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

// dict typed: match_code => Game class
const games = {}


// req.body {match_code, user_id, user_name}
app.post('/game', (req, res) => {
    const { match_code, user_id, user_name } = req.body
    const newGame = new Game(match_code)
    const newPlayer = new Player(user_id, user_name)

    newGame.addPlayer(newPlayer)
    games[match_code] = newGame

    res.status(200).json({ message: "Game created successfuly" })
})

// req.body {match_code, user_id, user_name}
app.post('/join', (req, res) => {
    const { match_code, user_id, user_name } = req.body
    if (!games[match_code])
        res.status(400).json({ message: `Could not find match with code ${match_code}` })
    else {
        const newPlayer = new Player(user_id, user_name)
        games[match_code].addPlayer(newPlayer)
        res.status(200).json({ message: "Joined game successfuly" })
    }
})
// req.body {match_code, user_id, from, to, promotion?}
app.post('/move', (req, res) => {
    const { match_code, user_id, from, to, promotion } = req.body
    if (games[match_code].onMove({ from, to, promotion }, user_id)) {
        res.status(200).json({ message: "Moved successfuly", gameOver: games[match_code].isGameOver() })
    }
    else
        res.status(300).json({ message: "Not your turn" })
})

// req.query = { match_code }
app.get('/endGame', (req, res) => {
    const match_code = req.query.match_code
    if (games[match_code])
        delete games[match_code]
    res.status(200).json({ message: `Match with code ${match_code} ended successfuly` })
})

// req.query = { match_code, user_id }
app.get('/pool', (req, res) => {
    const { match_code, user_id } = req.query.match_code
    if (!games[match_code])
        res.status(400).json({ message: `Could not find match with code ${match_code}` })
    else {
        if (games[match_code].getTurn() == user_id && games[match_code].isGameStarted()) {
            const lastMove = games[match_code].getLastMove()
            res.status(200).json({ message: `Successfuly retrieved move`, move: { from: lastMove.from, to: lastMove.to, promotion: lastMove.promotion } })
        } else {
            res.status(200).json({ message: `Waiting game to start` })
        }
    }

})

app.listen(3000)