import User from '../models/user.model.js';
import Franchise from '../models/franchise.model.js';

/**
 * Seed demo users for all roles (called automatically on server startup)
 * Similar to seedDefaultAdmin, but for all other roles
 */
export const seedDemoUsers = async () => {
  try {
    // Create a default franchise for agents and franchise owners
    let defaultFranchise = await Franchise.findOne({ name: 'Default Franchise' });
    
    if (!defaultFranchise) {
      defaultFranchise = await Franchise.create({
        name: 'Default Franchise',
        ownerName: 'Default Owner',
        email: 'franchise@damsole.com',
        mobile: '8888888888',
        status: 'active',
      });
      console.log('✅ Created default franchise');
    }

    // Define users to create (excluding super_admin which is handled by seedDefaultAdmin)
    const usersToCreate = [
      {
        name: 'Regional Manager',
        email: 'regionalmanager@damsole.com',
        mobile: '2222222222',
        password: 'regionalmanager@123',
        role: 'regional_manager',
      },
      {
        name: 'Relationship Manager',
        email: 'officestaff@damsole.com',
        mobile: '1111111111',
        password: 'staff@123',
        role: 'relationship_manager',
      },
      {
        name: 'Franchise Owner',
        email: 'franchiseowner@damsole.com',
        mobile: '3333333333',
        password: 'franchiseowner@123',
        role: 'franchise',
        franchise: defaultFranchise._id,
        franchiseOwned: defaultFranchise._id,
      },
      {
        name: 'Agent',
        email: 'agent@damsole.com',
        mobile: '4444444444',
        password: 'agent@123',
        role: 'agent',
        franchise: defaultFranchise._id,
        managedBy: defaultFranchise._id,
        managedByModel: 'Franchise',
      },
      {
        name: 'Accounts Manager',
        email: 'accountsmanager@damsole.com',
        mobile: '5555555555',
        password: 'accountsmanager@123',
        role: 'accounts_manager',
      },
    ];

    for (const userData of usersToCreate) {
      try {
        // Check if user already exists (by mobile, so we can migrate old @ykc.com emails to @damsole.com)
        const existingUser = await User.findOne({ mobile: userData.mobile });

        if (existingUser) {
          // For demo accounts, always reset email, password and ensure role/status are correct
          existingUser.email = userData.email;
          existingUser.password = userData.password;
          existingUser.role = userData.role;
          existingUser.status = 'active';

          // Ensure franchise links for franchise/agent demo users
          if (userData.role === 'franchise') {
            existingUser.franchise = defaultFranchise._id;
            existingUser.franchiseOwned = defaultFranchise._id;
          }
          if (userData.role === 'agent') {
            existingUser.franchise = defaultFranchise._id;
            existingUser.managedBy = defaultFranchise._id;
            existingUser.managedByModel = 'Franchise';
          }

          await existingUser.save();
          skippedUsers.push(userData);
          console.log(`🔄 Updated demo user: ${existingUser.name} (${existingUser.email})`);
          continue;
        }

        // Create user
        const user = await User.create(userData);
        createdUsers.push(user);
        console.log(`✅ Created demo user: ${user.name} (${user.email})`);
      } catch (error) {
        console.error(`❌ Error creating ${userData.name}:`, error.message);
      }
    }

    if (createdUsers.length > 0) {
      console.log(`✅ Created ${createdUsers.length} demo users for quick login`);
    }
    if (skippedUsers.length > 0) {
      console.log(`⏭️  ${skippedUsers.length} demo users already exist`);
    }
  } catch (error) {
    console.error('❌ Error seeding demo users:', error.message);
    // Don't exit process, just log the error
  }
};

