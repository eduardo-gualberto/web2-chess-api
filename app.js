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
    console.log(`Game created by ${user_id} with match_code ${match_code}`, req.body);
    const newGame = new Game(match_code)
    const newPlayer = new Player(user_id, user_name)

    newGame.addPlayer(newPlayer)
    games[match_code] = newGame

    res.status(200).json({ message: "Game created successfuly" })
})


// TODO: should also return the other player's info
// req.body {match_code, user_id, user_name}
app.post('/join', (req, res) => {
    const { match_code, user_id, user_name } = req.body
    console.log(`${user_id} joined game ${match_code}`, req.body);
    if (!games[match_code])
        res.status(400).json({ message: `Could not find match with code ${match_code}` })
    else {
        const newPlayer = new Player(user_id, user_name)
        games[match_code].addPlayer(newPlayer)
        const oponent = games[match_code].getPlayer1()
        res.status(200).json({ message: "Joined game successfuly", oponent: { user_id: oponent.user_id, user_name: oponent.user_name } })
    }
})
// req.body {match_code, user_id, from, to, promotion?}
app.post('/move', (req, res) => {
    const { match_code, user_id, from, to, piece, promotion } = req.body
    console.log(`Player ${user_id} made a move ${from + to}`, req.body);
    if (games[match_code].onMove({ from, to, piece, promotion }, user_id)) {
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
let logTwiceCount = {}
app.get('/pool/move', (req, res) => {
    const { match_code, user_id } = req.query
    if (!logTwiceCount[user_id]) {
        logTwiceCount[user_id] = true
        console.log(`user_id ${user_id} is pooling for moves of game ${match_code}...`);
    }
    if (!games[match_code])
        res.status(400).json({ message: `Could not find match with code ${match_code}` })
    else {
        if (games[match_code].getTurn() == user_id && games[match_code].isGameStarted()) {
            const { lastMove, piece } = games[match_code].getLastMove()
            res.status(200).json({ message: `Successfuly retrieved move`, move: { from: lastMove.from, to: lastMove.to, promotion: lastMove.promotion, piece } })
        } else {
            res.status(200).json({ message: `Waiting game to start` })
        }
    }

})
let poolGameCreatedCount = {}
// req.query = { match_code, user_id }
app.get('/pool/gameCreated', (req, res) => {
    const { match_code, user_id } = req.query
    if (!games[match_code])
        res.status(400).json({ message: `Could not find match with code ${match_code}` })
    else if (games[match_code].isGameCreated()) {
        const oponent = games[match_code].getOpponentOfPlayerWithId(user_id)
        console.log("game created: oponent", oponent);
        res.status(200).json({ is_game_created: true, oponent: { user_id: oponent.user_id, user_name: oponent.user_name } })
    }
    else
        res.status(200).json({ is_game_created: false })
})

app.listen(3001)