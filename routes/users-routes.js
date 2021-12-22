const express = require('express');

const router = express.Router();

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Paco'
    },
    {
        id: 'u2',
        name: 'Gallo'
    },
];

router.get('/:uid', (req,res, next) => {
    const userId= req.params.uid;
    const user = DUMMY_USERS.find(u => {
        return u.id === userId
    })

    console.log('users');

    res.json({user: user});
});

module.exports = router;