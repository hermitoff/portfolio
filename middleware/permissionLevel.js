const { User, Role } = require('../models/index');

const allowedLevel = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const user = await User.findOne({
                where: { id: userId },
                include: { model: Role }
            });

            if (!user || !user.Role) {
                return res.status(404).json({ error: "User or role not found" });
            }

            const userRoleId = user.Role.id;

            if (!allowedRoles.includes(userRoleId)) {
                return res.status(403).json({ error: "Unauthorized: Insufficient permissions" });
            }

            next();
        } catch (error) {
            console.error("Error in allowedLevel middleware:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    };
};

module.exports = { allowedLevel };