const jwt                   = require('jsonwebtoken');
const moment                = require('moment');
const UTILS                 = require('@lib/utils');
const compose               = require('composable-middleware');
const { UserModel,
    SessionModel }          = require('@database');

async function generateJWTToken(user, refreshKey = false) {
    let secretKey = refreshKey ? process.env.REFRESH_TOKEN : process.env.ACCESS_TOKEN,
        duration = refreshKey ? {expiresIn: process.env.REFRESH_TOKEN_EXP_TIME} : {expiresIn: process.env.TOKEN_EXP_TIME};
    user.iat = moment().valueOf();
    user.exp = moment().add(parseInt(duration.expiresIn), duration.expiresIn.replace(/[0-9]/g, "")).utc().valueOf();

    let token = jwt.sign(user, secretKey, {});
    let session = new SessionModel({userId: user.userId, token: token, logout: false});
    session = await session.save();
    
    return token;
}

async function verifyAuthentication(req, res, next) {
    try {
        let token = req.headers['authorization'] ? req.headers['authorization'].toString() : '';
        
        let session = await SessionModel.findOne({token: token, logout: false});
        if (!session) return res.status(401).json({error: "Please try to login again, you have been logged out!"});

        let data = await verifyJWTToken(token);
        if (data.error) return res.status(401).json({error: "Invalid Token", message: data.error});

        data = await UserModel.findOne({_id: data.userId}, {password: 0}).populate('role','code').populate('state',"name");
        if (!data) return res.status(401).json({error: "Logged in user not found!", message: "Unable retrieve user details"});
        
        req.user = data;
        next();
    } catch (error) {
        return UTILS.errorHandler(error);
    }
}

function isAuthenticated(roles) {
    return compose()
        .use(verifyAuthentication)
        .use((req, res, next) => {
            let roleIds = (roles || []).map(e => parseInt(process.env['ROLE_'+e]));
            if (req.user && (!roleIds.length || roleIds.indexOf(req.user.role) > -1)) {
                next();
            } else {
                return res.status(400).json({
                    error: 'NO_PROP_AUTHORIZATION',
                    message: 'Authentication failied due to invalid role access.'
                });
            }
        });
}

async function verifyJWTToken(token, refreshKey = false) {
    let secretKey = refreshKey ? process.env.REFRESH_TOKEN : process.env.ACCESS_TOKEN;
    let jwtResult = await jwt.verify(token, secretKey, (error, user) => {
        if (error) { return {error: error}; }
        return user;
    });
    return jwtResult;
}

module.exports.generateJWTToken = generateJWTToken;
module.exports.verifyJWTToken = verifyJWTToken;
module.exports.isAuthenticated = isAuthenticated;