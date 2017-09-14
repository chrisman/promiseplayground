// fake database
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
  delay (query) {
    return new Promise((resolve, reject) => {
      setTimeout( resolve(query), 500 );
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

const db = createDatabase();

// the key thing to notice here is that you can flatten out your promises by using Promise.all to pass down the results of each step down to the next block.
const user = db.getUsers(1)
.then(users => Promise.all([
  users[0],                           // user
  db.getWorkoutsByUserId(users[0].id) // workouts
]))
.then(([user, workouts]) => Promise.all([
  Object.assign({}, user, { workouts }),                                   // userWithWorkouts
  Promise.all(workouts.map(workout => db.getLiftsByWorkoutId(workout.id))) // workoutLifts
]))
.then(([userWithWorkouts, workoutLifts]) => {
  const workouts = userWithWorkouts.workouts.map(workout => {
    const lifts = workoutLifts.find(lifts => lifts.some(lift => lift.workout_id === workout.id));
    return Object.assign({}, workout, { lifts });
  });

  return Object.assign({}, userWithWorkouts, { workouts });
});

user.then(result => { console.log(JSON.stringify(result)) });
