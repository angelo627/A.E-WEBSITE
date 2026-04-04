export const getAllUsers = async (req, res) => {
  try {
    const supabase = req.supabase; // get the Supabase client

    // Query the 'users' table
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json(data); // return the users
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};