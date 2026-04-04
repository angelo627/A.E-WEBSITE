// models/userModel.js
export const createUserTable = async (supabase) => {
  try {
    const { error } = await supabase.rpc('create_users_table');
    if (error) console.error('Error creating table:', error.message);
    else console.log('User table ready');
  } catch (err) {
    console.error('Server error:', err);
  }
};