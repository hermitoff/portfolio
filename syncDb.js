// Core dependencies
const readline = require('readline');
const bcrypt = require('bcrypt');
// Database
const sequelize = require('./db');
// Models
const { Role, User } = require('./models/index');
// Utils
const { generateSnowflake } = require('./utils');

async function initRoles() {
    const roles = await Role.findAll();
    if (roles.length === 0) {
        await Promise.all([
            Role.create({ id: 'USER', name: 'User' }),
            Role.create({ id: 'ADMIN', name: 'Administrator' })
        ]);
    }
}

async function initDefaultAdmin() {
    // Vérifier s'il y a déjà un utilisateur admin
    const adminUser = await User.findOne({ where: { roleId: 'ADMIN' } });
    
    if (!adminUser) {
        // Créer un utilisateur admin par défaut
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminId = generateSnowflake();
        
        await User.create({
            id: adminId,
            username: 'admin',
            displayname: 'Administrateur',
            password: hashedPassword,
            roleId: 'ADMIN'
        });
        
        console.log('DATABASE: Default admin user created!');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('  ** IMPORTANT: Change this password after first login! **');
    }
}

async function askAction() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('What do you want to do with the database?\n' +
            '1. Synchronise the database (without deleting the data)\n' +
            '2. Synchronise the database and delete existing data\n' +
            '3. Modify the table structure without deleting data (Sequelize v6+)\n' +
            '4. Exit\n' +
            'Choice (1/2/3/4) : ',
            async (choice) => {
                rl.close();
                const actions = {
                    '1': { sync: true, force: false, alter: false, message: "Synchronise the database without deleting existing data?" },
                    '2': { sync: true, force: true, alter: false, message: "Synchronise the database and **DELETE** the existing data (Warning: this action is irreversible!)." },
                    '3': { sync: true, force: false, alter: true, message: "Modify the table structure without deleting existing data?" },
                    '4': { sync: false, force: false, alter: false, exit: true, message: "Leave the application?" }
                };

                const action = actions[choice.trim()];
                if (action) {
                    if (await confirmAction(action.message)) {
                        if (action.exit) {
                            console.log('Goodbye!');
                            process.exit(0);
                        }
                        resolve(action);
                    } else {
                        console.log("Action cancelled. Please try again.");
                        resolve(await askAction());
                    }
                } else {
                    console.log('Invalid choice. Goodbye!');
                    process.exit(1);
                }
            }
        );
    });
}

async function confirmAction(message) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${message} (y/N): `, (response) => {
            rl.close();
            resolve(response.trim().toLowerCase() === 'y' || response.trim().toLowerCase() === 'yes');
        });
    });
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = { sync: false, force: false, alter: false };

    for (const arg of args) {
        switch (arg) {
            case '-s':
            case '--sync':
                options.sync = true;
                break;
            case '-f':
            case '--force':
                options.force = true;
                break;
            case '-a':
            case '--alter':
                options.alter = true;
                break;
            default:
                console.log(`Unknown Option: ${arg}. Ignored.`);
        }
    }
    return options;
}

async function syncDatabase({ force = false, alter = false } = {}) {
    try {
        if (force) {
            console.log('DATABASE: ** DELETING EXISTING DATA **');
            await sequelize.sync({ force: true });
        } else if (alter) {
            console.log('DATABASE: ** MODIFYING THE TABLE STRUCTURE **');
            await sequelize.sync({ alter: true });
        } else {
            console.log('DATABASE: ** SYNCHRONISATION WITHOUT DELETING DATA **');
            await sequelize.sync({ force: false });
        }
        console.log("DATABASE: Database synced!");
        
        // Initialize default roles
        await initRoles();
        console.log("DATABASE: Default roles initialized!");
        
        // Initialize default admin user
        await initDefaultAdmin();
    } catch (error) {
        console.error("DATABASE: Unable to sync the database:", error);
        throw error;
    }
}

// Export the syncDatabase function for programmatic use
module.exports = { syncDatabase };

// Synchronisation automatique de la base de données au démarrage (sans suppression de données)
if (require.main === module) {
    (async () => {
        try {
            await syncDatabase({ force: false, alter: false });
        } finally {
            await sequelize.close();
        }
    })();
}