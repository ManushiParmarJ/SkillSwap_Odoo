const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');
const Skill = require('./models/Skill');

async function debugDatabase() {
  try {
    console.log('🔍 Debugging Database...\n');

    // Check all users
    const users = await User.find({}).select('name email isPublic isBanned');
    console.log('👥 Users found:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Public: ${user.isPublic}, Banned: ${user.isBanned}`);
    });

    console.log('\n');

    // Check all skills
    const skills = await Skill.find({}).populate('user', 'name email');
    console.log('💼 Skills found:', skills.length);
    skills.forEach(skill => {
      if (skill.user) {
        console.log(`  - ${skill.name} (${skill.type}) - User: ${skill.user.name} - Approved: ${skill.isApproved}, Rejected: ${skill.isRejected}`);
      } else {
        console.log(`  - ${skill.name} (${skill.type}) - User: NULL - Approved: ${skill.isApproved}, Rejected: ${skill.isRejected}`);
      }
    });

    console.log('\n');

    // Check skills by type
    const offeredSkills = await Skill.find({ type: 'offered' }).populate('user', 'name');
    const wantedSkills = await Skill.find({ type: 'wanted' }).populate('user', 'name');
    
    console.log('📊 Skills by type:');
    console.log(`  - Offered: ${offeredSkills.length}`);
    console.log(`  - Wanted: ${wantedSkills.length}`);

    console.log('\n');

    // Check skills by approval status
    const approvedSkills = await Skill.find({ isApproved: true });
    const pendingSkills = await Skill.find({ isApproved: false, isRejected: false });
    const rejectedSkills = await Skill.find({ isRejected: true });
    
    console.log('📊 Skills by approval status:');
    console.log(`  - Approved: ${approvedSkills.length}`);
    console.log(`  - Pending: ${pendingSkills.length}`);
    console.log(`  - Rejected: ${rejectedSkills.length}`);

    console.log('\n');

    // Test the user profile query for a specific user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`🔍 Testing user profile query for: ${testUser.name}`);
      
      const userSkills = await Skill.find({
        user: testUser._id,
        isRejected: false
      }).select('name description category type level isApproved');
      
      console.log(`  - Skills found for ${testUser.name}: ${userSkills.length}`);
      userSkills.forEach(skill => {
        console.log(`    * ${skill.name} (${skill.type}) - Approved: ${skill.isApproved}`);
      });
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the debug function
debugDatabase(); 