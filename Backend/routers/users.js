const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Fetch all user details
router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if(!userList){
        res.status(500).json({success: false});
    };

    res.send(userList);
});

//Fetch user details using ID
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user){
        return res.status(500).json({message: 'The user with the given ID was not found.'});
    }
    res.status(200).send(user);
});

//Add user details to DB
router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: bcrypt.hashSync(req.body.password, 07),
        phone: req.body.phone,
        street: req.body.street,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    user = await user.save();

    if(!user)
        return res.status(404).send('the user cannot be registered!');
    
    res.send(user);
});

//Update user details
router.put('/:id', async(req, res) => {

    const userExist = await User.findById(req.params.id);

    let newPassword;
    if(req.params.password){
        newPassword = bcrypt.hashSync(req.body.password, 07);
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            color: req.body.color,
            passwordHash: newPassword,
            phone: req.body.phone,
            street: req.body.street,
            isAdmin: req.body.isAdmin,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        },
        {
            new: true
        }
    )

    if(!user)
        return res.status(404).send('the user cannot be created!');
    
    res.send(user);

});

//Delete user from DB
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if(user){
            return res.status(200).json({ success: true, message: 'the user is deleted!'});
        } else {
            return res.status(404).json({ success : false, message: 'user not found!'});
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err});
    })
});

//Authenticating user
router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return res.status(400).send('The user not found');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){

        //authenticating user with jwt
        const token = jwt.sign(
            {
                userID: user.id
            },
            'secret',
            {
                //token expire
                expiresIn: '1d'
            }
        );

        res.status(200).send({user: user.email, token: token})
    } else {
        res.status(400).send('Incorrect password.');
    }
});

module.exports = router;