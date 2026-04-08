/**
 * Leaderboard Service
 * 
 * This service manages the leaderboard data. Since we cannot modify the backend,
 * we simulate a global leaderboard by combining the current user's real data
 * with realistic mock data for other users.
 */

const MOCK_USERS = [
  { id: 'u1', name: 'Farai M.', faculty: 'Engineering', xp: 12500, streak: 15, avatar: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'Chipo N.', faculty: 'Health Sciences', xp: 11200, streak: 12, avatar: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Tendai G.', faculty: 'STEM', xp: 9800, streak: 8, avatar: 'https://i.pravatar.cc/150?u=u3' },
  { id: 'u4', name: 'Nyasha S.', faculty: 'Business', xp: 8500, streak: 20, avatar: 'https://i.pravatar.cc/150?u=u4' },
  { id: 'u5', name: 'Tatenda K.', faculty: 'Education', xp: 7200, streak: 5, avatar: 'https://i.pravatar.cc/150?u=u5' },
  { id: 'u6', name: 'Ruvimbo M.', faculty: 'Law', xp: 6800, streak: 10, avatar: 'https://i.pravatar.cc/150?u=u6' },
  { id: 'u7', name: 'Kudzai B.', faculty: 'Agriculture', xp: 5400, streak: 3, avatar: 'https://i.pravatar.cc/150?u=u7' },
  { id: 'u8', name: 'Blessing T.', faculty: 'Humanities', xp: 4900, streak: 7, avatar: 'https://i.pravatar.cc/150?u=u8' },
  { id: 'u9', name: 'Simba R.', faculty: 'Engineering', xp: 4200, streak: 4, avatar: 'https://i.pravatar.cc/150?u=u9' },
  { id: 'u10', name: 'Zanele D.', faculty: 'Health Sciences', xp: 3800, streak: 6, avatar: 'https://i.pravatar.cc/150?u=u10' },
  { id: 'u11', name: 'Munashe P.', faculty: 'STEM', xp: 3100, streak: 2, avatar: 'https://i.pravatar.cc/150?u=u11' },
  { id: 'u12', name: 'Tinashe V.', faculty: 'Business', xp: 2800, streak: 9, avatar: 'https://i.pravatar.cc/150?u=u12' },
];

/**
 * Get leaderboard data for a specific category
 * @param {string} category - 'weekly', 'all-time', 'group'
 * @param {number} xp - Current user XP
 * @param {number} streak - Current user streak
 * @param {object} user - Auth user object
 * @param {object} profile - User profile object
 */
export function getLeaderboardData(category, xp, streak, user, profile) {
  // Generate a base list
  let users = [...MOCK_USERS];
  
  // Add current user if they exist
  if (user && user.id) {
    const existingIndex = users.findIndex(u => u.id === user.id);
    const currentUserData = {
      id: user.id,
      name: profile?.first_name || user.email.split('@')[0],
      faculty: profile?.faculty || 'General',
      xp: xp || 0,
      streak: streak || 0,
      avatar: null,
      isCurrentUser: true
    };

    if (existingIndex !== -1) {
      users[existingIndex] = { ...users[existingIndex], ...currentUserData };
    } else {
      users.push(currentUserData);
    }
  }

  // Apply category-specific logic
  if (category === 'weekly') {
    // Weekly score = XP gained this week (simulated) + streak bonus
    users = users.map(u => ({
      ...u,
      score: Math.floor(u.xp * 0.15) + (u.streak * 50)
    }));
  } else if (category === 'group') {
    // Filter by faculty if current user has one
    if (profile?.faculty) {
      users = users.filter(u => u.faculty === profile.faculty || u.isCurrentUser);
    }
    users = users.map(u => ({ ...u, score: u.xp }));
  } else {
    // All time
    users = users.map(u => ({ ...u, score: u.xp }));
  }

  // Sort by score descending
  users.sort((a, b) => b.score - a.score);

  // Assign ranks
  users = users.map((u, index) => ({
    ...u,
    rank: index + 1,
    // Simulate movement
    movement: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable'
  }));

  return users;
}

/**
 * Get motivational message based on rank
 */
export function getMotivationalMessage(rank, total) {
  if (rank === 1) return "You're at the top! Keep leading the way! 🏆";
  if (rank <= 3) return "You're on the podium! Can you reach #1? 🥈";
  if (rank <= 5) return "So close to the top 3! Keep going! 🚀";
  if (rank <= 10) return "You're in the top 10! Amazing work! ✨";
  
  const percentile = Math.round(((total - rank) / total) * 100);
  if (percentile >= 90) return `You're in the top 10% of scholars! 🌟`;
  if (percentile >= 75) return `You're doing better than 75% of users! 💪`;
  
  return "Every page read brings you closer to the top! 📚";
}
