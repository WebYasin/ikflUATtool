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
                "name" : "Under Writer",
                "code" : "UNDER_WRITER",
                "active" : true,
                "isAdmin" : true,
                "privileges": {}
            },{
                "description" : "Role Access",
                "name" : "Supervisior",
                "code" : "SUPERVISIOR",
                "active" : true,
                "isAdmin" : false,
                "privileges": {}
            },{
                "description" : "Role Access",
                "name" : "Reporter",
                "code" : "REPORTER",
                "active" : true,
                "isAdmin" : false,
                "privileges": {}
            }];

            await RoleModel.insertMany(roles);
        }

        let user = await UserModel.find();
        if (!user || !user.length) {
            let role = ((await RoleModel.findOne({code: 'SUPER_ADMIN'})) || {})._id || '';
            user = {
                "email" : "admin@gmail.com",
                "phoneNumber": 9080706050,
                "userName": "admin@user",
                "password": "admin@user",
                "firstName": "Admin",
                "lastName": "User",
                "address":'delhi',
                "designation":"IT Manager",
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