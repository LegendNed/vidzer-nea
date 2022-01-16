import { Router, Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import secQuestions from '../../../config/secQuestion.json'

import User from '../../../models/user'
import Token from '../../../models/token'

const app = Router()
// @route   POST /auth/register/check
app.post('/register/check', async (req: Request, res: Response) => {
    // Obtain and validate the fields that there is data within
    const { hwid, token } = req.body
    if (!hwid || !token) return res.status(400).json({ success: false, msg: 'No invite token was provided' })

    // Check if user with that current HWID exists, else continue
    const user = await User.findOne({ hwid })
    if (user) return res.status(400).json({ success: false, msg: 'Account already exists please login.' })

    /**
     * Token validation:
     * 1. Check if the token is valid
     * 2. Check if the token is expired
     */
    let document = await Token.findOne({ token })
    if (!document) return res.status(400).json({ success: false, msg: 'Invalid token provided' })

    if (!document.expired) await Token.findOneAndUpdate({ token }, { expired: true })
    if (Date.now() > document.expireAt.getTime() || document.expired) return res.status(400).json({ msg: 'Token expired or used' })

    await User.create({
        token, hwid
    })

    return res.status(200).send({ success: true })
})

// @route   POST /auth/register/complete
app.post('/register/complete', async (req: Request, res: Response) => {
    // Obtain and validate the fields that there is data within
    const { hwid, username, secQuestionId, secQuestionAnswer } = req.body
    if (!hwid || !username || !secQuestionId || !secQuestionAnswer) return res.status(400).json({ msg: 'Please enter all fields' })

    // Check if user with that current HWID exists, else continue
    const user = await User.findOne({ hwid })
    if (!user) return res.status(400).json({ success: false, msg: 'Account does not exist please register.' })

    // Check if the user has already completed the registration process
    if (user.username ||
        (user.secQuestion.id && (user.secQuestion.id !== secQuestionId)) ||
        (user.secQuestion.answer && (user.secQuestion.answer !== secQuestionAnswer)))
        return res.status(400).json({ success: false, msg: 'Account already registered please login.' })

    // Validate username using regex provided in Developing the Solution
    const regex = /^[a-z0-9\-\_\.]\w{2,9}$/
    if (!regex.test(username)) return res.status(400).json({ success: false, msg: 'Invalid username. Between 2-9 char and only lowercase letters and numbers' })

    // Check if username is already taken
    const usernameExists = await User.findOne({ username })
    if (usernameExists) return res.status(400).json({ success: false, msg: 'Username already taken' })

    // Validation secQuestionId and secQuestionAnswer
    if (secQuestionId < 0 || secQuestionId > secQuestions.length) return res.status(400).json({ msg: 'Invalid Security Question ID' })
    if (secQuestionAnswer.length < 3 || secQuestionAnswer.length > 20) return res.status(400).json({ msg: 'Invalid Security Question format, must be under 20 characters' })

    // Update the user with the new information
    await User.findOneAndUpdate({ hwid }, {
        username,
        secQuestion: {
            id: secQuestionId,
            answer: secQuestionAnswer.toLowerCase()
        }
    })

    // Sign access token
    const accessToken = sign({ hwid }, process.env.SECRET)

    return res.status(200).send({ success: true, data: accessToken })
})

// @route   POST /auth/login
app.post('/login', async (req: Request, res: Response) => {
    // Obtain and validate the fields that there is data within
    const { hwid } = req.body
    if (!hwid) return res.status(400).json({ success: false, msg: 'HWID not provided' })

    // Check if user with that current HWID exists, else continue
    const user = await User.findOne({ hwid })
    if (!user) return res.status(400).json({ success: false, msg: 'Account does not exist please register.' })
    // Sign access token
    const accessToken = sign({ hwid }, process.env.SECRET)
    return res.status(200).send({ success: true, data: accessToken })
})

export default app