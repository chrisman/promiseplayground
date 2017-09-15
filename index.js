const { createDatabase } = require('./create-database');
const db = createDatabase();

// the key thing to notice here is that you can flatten out your promises by
// using Promise.all to pass down the results of each step down to the next
// block.
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
