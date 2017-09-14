// fake database and fake model
const createDatabase = (database = {
  users: [
    { id: 1, name: 'a' },
  ],
  workouts: [
    { id: 1, user_id: 1, name: 'b' },
    { id: 2, user_id: 1, name: 'c' },
    { id: 3, user_id: 1, name: 'd' },
  ],
  lifts: [
    { id: 1, workout_id: 1, name: 'e' },
    { id: 2, workout_id: 2, name: 'f' },
    { id: 3, workout_id: 2, name: 'g' },
    { id: 4, workout_id: 3, name: 'e' },
    { id: 5, workout_id: 3, name: 'f' },
    { id: 6, workout_id: 3, name: 'g' },
  ]
}) => ({
  // add slight delay to simiulate database call
  delay (query) {
    return new Promise((resolve, reject) => {
      setTimeout( () => resolve(query), 200 );
    });
  },
  getUsers (id) {
    return this.delay( database.users.filter(user => user.id === id) );
  },
  getWorkoutsByUserId (id) {
    return this.delay( database.workouts.filter(workout => workout.user_id === id) );
  },
  getLiftsByWorkoutId (id) {
    return this.delay( database.lifts.filter(lift => lift.workout_id === id) );
  }
});

module.exports = { createDatabase };
