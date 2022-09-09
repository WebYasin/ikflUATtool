const { RoleModel,
    UserModel }             = require('@database');

const migrate = async () => {
    try {
        let roles = await RoleModel.find();
        if (!roles || !roles.length) {
            roles = [{
                "description" : "Role Access",
                "name" : "Super Admin",
                "code" : "SUPER_ADMIN",
                "active" : true,
                "isAdmin" : true,
                "privileges": {}
            },{
                "description" : "Role Access",
                "name" : "Professional",
                "code" : "PROFESSIONAL",
                "active" : true,
                "isAdmin" : true,
                "privileges": {}
            },{
                "description" : "Role Access",
                "name" : "User",
                "code" : "USER",
                "active" : true,
                "isAdmin" : false,
                "privileges": {}
            },{
                "description" : "Role Access",
                "name" : "Content Manager",
                "code" : "CONTENT_MANAGER",
                "active" : true,
                "isAdmin" : false,
                "privileges": {}
            }];

            await RoleModel.insertMany(roles);
        }

        let user = await UserModel.find();
        if (!user || !user.length) {
            let role = ((await RoleModel.findOne({code: 'PROFESSIONAL'})) || {})._id || '';
            user = {
                "email" : "admin@gmail.com",
                "phoneNumber": 9080706050,
                "userName": "admin@user",
                "password": "admin@user",
                "firstName": "Admin",
                "lastName": "User",
                "role": role,
                "active": true,
                "firstLogin": true,
                "online": true
            };

            user = new UserModel(user);
            await user.save();
        }
        return true;
    } catch (e) {
        console.log(" error : ",e);
        return true;
    }
}

migrate();